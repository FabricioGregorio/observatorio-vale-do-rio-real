/**
 * Contrato do snapshot público — os três arquivos de `src/dados/publicado/`.
 *
 * Este módulo descreve **a forma dos arquivos em disco**, e nada mais. Ele não
 * lê banco, não lê arquivo e não gera nada: é a fronteira que o gerador
 * escreve e que o site, a partir do Lote B, vai ler.
 *
 * ## Por que schema fechado
 *
 * Os três schemas usam `z.strictObject`, como `editorial/mapa-b01.ts` já faz.
 * Propriedade desconhecida é **erro**, não campo ignorado. Num snapshot que
 * nasce de uma projeção do banco, aceitar chave extra em silêncio é o caminho
 * mais curto para um campo privado atravessar a fronteira sem ninguém ver: a
 * view muda, o gerador copia a coluna nova, e o arquivo público ganha um dado
 * que ninguém autorizou. Com `strictObject`, esse dia produz erro de validação
 * em vez de vazamento.
 *
 * É a segunda barreira, não a primeira. A primeira é o gerador ler apenas as
 * projeções públicas (`vw_anexo_publico`, `vw_episodio_publico`), que não
 * expõem `pessoa`, `consentimento`, arquivo privado, chave de bucket privado
 * nem `audio_id`. Duas barreiras independentes, porque a primeira depende de
 * quem escreve a consulta e a segunda não.
 *
 * ## Por que não há interface nova
 *
 * `AnexoPublico` e `EpisodioPublico` já existem e continuam sendo o contrato
 * de leitura da aplicação. Aqui não se declara um segundo tipo paralelo: o
 * schema é a única fonte em tempo de execução, e as asserções de tipo no fim
 * deste arquivo prendem os campos dele aos tipos existentes. Acrescentar campo
 * de um lado só passa a ser erro de compilação.
 *
 * ## O que NÃO entra no snapshot
 *
 * `credito` e `pagina_url`, que aparecem em `/anexos.json`, são **derivados na
 * renderização** — o primeiro por `separarCredito`, o segundo a partir de
 * `SITE_URL`. Gravá-los aqui congelaria a origem canônica dentro do dado e
 * faria a homologação publicar URLs de produção. Eles continuam onde estão.
 */
import { z } from "zod";

import { metodoDerivacaoSchema } from "../../lib/manifesto-evidencias";
import type { AnexoPublico } from "../anexo-publico";
import { FOTO_DA_PLACA } from "../pesquisa/excecao-placa";
import { episodioPublicoSchema } from "../podobservar-publico";
import { TIPOS_DOCUMENTO } from "../tipo-documento";

/** Diretório dos três arquivos, relativo à raiz do repositório. */
export const DIRETORIO_PUBLICADO = "src/dados/publicado";

export const NOME_ACERVO = "acervo.json";
export const NOME_EPISODIOS = "episodios.json";
export const NOME_RELEASE = "release.json";

const uuid = z.uuid();
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const texto = z.string().min(1);
const inteiroNaoNegativo = z.number().int().nonnegative();

/**
 * Instante em ISO-8601 UTC com milissegundos — exatamente o que
 * `Date.prototype.toISOString` produz.
 *
 * O snapshot guarda texto, não `Date`. Um `Date` não sobrevive a JSON, e
 * deixar a conversão implícita para o leitor é como se produz duas datas
 * diferentes para o mesmo episódio. A forma é fixada aqui para que dois
 * geradores nunca escrevam `2026-09-08T11:15:07Z` e
 * `2026-09-08T11:15:07.000Z` para o mesmo instante.
 */
export const instanteIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

/** Data civil sem hora, `AAAA-MM-DD`. Usada por `dataReferencia`. */
export const dataSimples = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * Uma entrada do acervo publicado — o mesmo objeto que `AnexoPublico`
 * descreve, com `publicadoEm` em texto.
 *
 * Todos os campos são **obrigatórios e explicitamente anuláveis**. Nenhum é
 * opcional. A diferença importa: `{"resumo": null}` e a ausência da chave
 * produzem o mesmo valor em JavaScript, mas bytes diferentes em disco — e
 * duas gerações do mesmo conteúdo precisam produzir os mesmos bytes. Chave
 * sempre presente elimina essa fonte de divergência antes que ela exista.
 */
export const anexoPublicadoSchema = z
  .strictObject({
    arquivoId: uuid,
    /** `ordemAnexo` quando há; o slug quando não há. Ver `adaptarLinhasDaView`. */
    codigo: texto,
    /** Literais: só chega aqui o que passou por `selecionarAnexosPublicos`. */
    estado: z.literal("PUBLICAVEL"),
    revisaoPrivacidade: z.literal("concluida"),
    /** Proveniência declarada; publicar sem ela não é aceitável. */
    derivadoDe: z.array(texto).min(1),
    arquivoOrigemId: uuid.nullable(),
    arquivoRelacao: z.enum(["derivado", "replica"]).nullable(),
    arquivoDerivacaoMetodo: metodoDerivacaoSchema.nullable(),
    ordemAnexo: z.number().int().nullable(),
    slug: texto,
    rotuloArquivo: texto.nullable(),
    principal: z.boolean(),
    titulo: texto,
    /** Vocabulário canônico, do módulo puro que o `pgEnum` também consome. */
    tipo: z.enum(TIPOS_DOCUMENTO),
    resumo: texto.nullable(),
    dataReferencia: dataSimples.nullable(),
    licenca: texto,
    linkPermanente: z.url(),
    linkOrigem: z.url().nullable(),
    mimeType: texto,
    bytes: z.number().int().positive(),
    sha256,
    publicadoEm: instanteIso.nullable(),
    nomeOriginal: texto.nullable(),
    /** Asset de apresentação; o arquivo documental continua sendo o original. */
    previewUrl: z.url().nullable(),
    previewArquivoId: uuid.nullable(),
    previewSha256: sha256.nullable(),
  })
  .superRefine((anexo, contexto) => {
    /*
      Guarda da fotografia com a placa de veículo.

      O original é privado e não tem representação pública: a única forma
      autorizada é a versão tarjada. A mesma proibição existe em
      `adaptarLinhasDaView`, sobre linhas da view; aqui ela existe sobre o
      arquivo publicado, que é o que o site vai ler. São dois pontos porque
      são duas superfícies diferentes — e porque esta aqui não precisa de
      banco para ser verificada.
    */
    if (anexo.sha256 === FOTO_DA_PLACA.sha256Original) {
      contexto.addIssue({
        code: "custom",
        message: "Original com placa não pode integrar o acervo público.",
        path: ["sha256"],
      });
    }
    if (anexo.previewSha256 === FOTO_DA_PLACA.sha256Original) {
      contexto.addIssue({
        code: "custom",
        message: "Original com placa não pode ser asset de apresentação.",
        path: ["previewSha256"],
      });
    }
    if (
      anexo.arquivoId === FOTO_DA_PLACA.arquivoPublicoId &&
      anexo.sha256 !== FOTO_DA_PLACA.sha256Publico
    ) {
      contexto.addIssue({
        code: "custom",
        message:
          "A versão pública da fotografia com placa não confere com o hash tarjado autorizado.",
        path: ["sha256"],
      });
    }
  });

export type AnexoPublicado = z.infer<typeof anexoPublicadoSchema>;

/**
 * O acervo inteiro, na ordem em que a view o devolveu.
 *
 * A ordem do array **é o dado**: `vw_anexo_publico` ordena por
 * `ordem_anexo NULLS LAST, titulo, principal DESC, versao DESC,
 * chave_storage`, e o snapshot preserva essa decisão em vez de reordenar.
 * Quem lê nunca precisa reordenar, e por isso nunca reordena diferente.
 *
 * Aqui não se afirma "107 anexos" nem "16 documentos": esses números são do
 * acervo de hoje, não do formato. Eles pertencem ao teste do snapshot real e
 * a `validarAcervoPublico`, que já os exige em produção.
 */
export const acervoPublicadoSchema = z
  .array(anexoPublicadoSchema)
  .superRefine((anexos, contexto) => {
    const vistos = new Set<string>();
    for (const anexo of anexos) {
      if (vistos.has(anexo.arquivoId)) {
        contexto.addIssue({
          code: "custom",
          message: `Acervo publicado com arquivo repetido: ${anexo.arquivoId}.`,
        });
      }
      vistos.add(anexo.arquivoId);
    }
  });

/*
  Campos do episódio, reaproveitados do schema que o gate já usa.

  `episodioPublicoSchema` valida a fronteira pública do PodObservar e carrega
  regras que não podem ser reescritas aqui — entre elas a de que `urlSpotify`
  precisa ser um endereço de `open.spotify.com`, e não uma URL qualquer.
  Tomar `.shape` reaproveita cada uma dessas regras sem copiar nenhuma; só
  `publicadoEm` é substituído, porque em disco ele é texto e não `Date`.
*/
const { publicadoEm: _publicadoEmComoData, ...camposDoEpisodio } =
  episodioPublicoSchema.shape;

export const episodioPublicadoSchema = z.strictObject({
  ...camposDoEpisodio,
  publicadoEm: instanteIso,
});

export type EpisodioPublicado = z.infer<typeof episodioPublicadoSchema>;

/** Episódios na ordem da view: publicação decrescente, número decrescente. */
export const episodiosPublicadosSchema = z
  .array(episodioPublicadoSchema)
  .superRefine((episodios, contexto) => {
    const vistos = new Set<string>();
    for (const episodio of episodios) {
      const chave = `t${episodio.temporadaNumero}/${episodio.slug}`;
      if (vistos.has(chave)) {
        contexto.addIssue({
          code: "custom",
          message: `Episódio publicado repetido: ${chave}.`,
        });
      }
      vistos.add(chave);
    }
  });

/**
 * Chave do pacote ZIP, endereçada pelo conteúdo.
 *
 * `acervo/pacotes/anexos-<hash curto>.zip`. O hash no nome é o do próprio
 * pacote: conteúdo igual produz chave igual, e o objeto nunca é sobrescrito.
 * Isso dá três coisas de uma vez — imutabilidade por construção, rollback que
 * continua apontando para o pacote da versão antiga, e nenhum reenvio de
 * centenas de MB quando uma publicação não mexeu no conjunto de arquivos.
 *
 * A implementação do empacotamento é do Lote C. O contrato existe desde já
 * para que o release não precise mudar de forma quando ela chegar.
 */
export const PADRAO_CHAVE_ZIP = /^acervo\/pacotes\/anexos-[a-f0-9]{8,}\.zip$/;

export const zipDoReleaseSchema = z.strictObject({
  chave: z.string().regex(PADRAO_CHAVE_ZIP),
  sha256,
  bytes: z.number().int().positive(),
});

/**
 * Manifesto do release — o que torna a publicação atômica e conferível.
 *
 * `zip: null` significa **pacote não produzido para este release**, e é a
 * única forma de representar essa ausência. Não existe chave vazia, hash de
 * zeros nem `bytes: 0`: um valor inventado mentiria a respeito de um objeto
 * que não está no bucket, que foi exatamente o defeito do primeiro
 * deployment. Ausência declarada, nunca simulada.
 *
 * Não há `commit_fonte`. O arquivo é gravado antes do commit que o contém, de
 * modo que registrar o próprio commit aqui seria circular por construção — e
 * redundante, porque o Git já sabe qual commit carrega qual snapshot. O que
 * este manifesto registra é o que o Git não sabe: quais lotes de publicação
 * produziram este estado, qual migração o banco tinha, e o hash de cada
 * arquivo de dados.
 */
export const releaseSchema = z.strictObject({
  /** `<data editorial>-<hash curto>`; ver `calcularIdDoRelease`. */
  id: z.string().regex(/^\d{4}-\d{2}-\d{2}-[a-f0-9]{8}$/),
  /** Data editorial declarada por quem publica. Nunca o relógio da máquina. */
  gerado_em: dataSimples,
  /**
   * Identificadores dos lotes formalmente registrados em
   * `lotes-de-publicacao.ts` e relacionados à história desta publicação.
   *
   * ## O que este campo **não** afirma
   *
   * Não afirma que todo objeto do release veio de um destes lotes. No corpus
   * de setembro de 2026 isso seria falso: a maior parte dos objetos públicos
   * foi produzida pela migração para os originais
   * (`scripts/publicar-originais-acervo.ts`), que publica a partir do banco e
   * não gera lote declarado. A proveniência objeto a objeto nunca foi
   * registrada dessa forma, e inventá-la agora — atribuindo objetos a lotes
   * por inferência, ou fabricando lotes retroativos — transformaria uma
   * lacuna real do histórico numa afirmação falsa com aparência de registro.
   *
   * O nome é `lotes_declarados`, e não `lotes`, exatamente para que a leitura
   * "todos os objetos vieram daqui" não seja possível. O histórico real
   * permanece real: os 107 objetos estão em `acervo.json`, cada um com seu
   * hash, e o Git preserva os scripts e commits que os publicaram.
   */
  lotes_declarados: z.array(texto).min(1),
  /** Prefixo numérico da última migração aplicada, p. ex. `0012`. */
  migracao: z.string().regex(/^\d{4}$/),
  totais: z.strictObject({
    documentos: inteiroNaoNegativo,
    anexos: inteiroNaoNegativo,
    episodios: inteiroNaoNegativo,
  }),
  sha256: z.strictObject({
    acervo: sha256,
    episodios: sha256,
  }),
  zip: zipDoReleaseSchema.nullable(),
});

export type Release = z.infer<typeof releaseSchema>;

/*
  ─── Asserções de tipo: o snapshot não pode divergir do contrato de leitura ──

  Estas três linhas não geram código. Elas existem para que acrescentar um
  campo em `AnexoPublico` sem acrescentá-lo ao snapshot — ou o contrário —
  seja erro de compilação, e não uma divergência descoberta meses depois com
  o site publicando menos do que tem.

  `publicadoEm` é a única diferença legítima de tipo (texto aqui, `Date` lá),
  então a comparação é feita sobre os nomes dos campos.
*/

/** Verdade em tempo de tipo; `Afirmar<false>` não compila. */
type Afirmar<T extends true> = T;

type CamposDoSnapshot = keyof AnexoPublicado;
type CamposDaLeitura = keyof AnexoPublico;

/** Falha se o snapshot ganhar um campo que `AnexoPublico` não conhece. */
export type SemCampoInventado = Afirmar<
  [Exclude<CamposDoSnapshot, CamposDaLeitura>] extends [never] ? true : false
>;

/** Falha se `AnexoPublico` ganhar um campo que o snapshot não carrega. */
export type SemCampoFaltante = Afirmar<
  [Exclude<CamposDaLeitura, CamposDoSnapshot>] extends [never] ? true : false
>;
