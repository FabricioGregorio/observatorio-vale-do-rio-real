/**
 * Schema do banco de dados — Observatório do Vale do Rio Real
 *
 * Espelho fiel do documento de banco (docs/02-arquitetura-banco.md).
 * O que Drizzle não expressa — extensões, funções, triggers e views — vive em
 * SQL bruto dentro do arquivo de migração (doc 03 §6.2).
 *
 * Migração 0001 (§§3-4): tipos enumerados, extensões e funções utilitárias.
 * Migração 0002 (§5, §§6.1-6.3, §13): núcleo da prestação de contas.
 *
 * Referências: doc 02 §1 (convenções), §3 (enums), §5 (camada de arquivos),
 * §§6.1-6.3 (município, pessoa, equipamento, consentimento), §13 (views),
 * §16 (ordem de implementação).
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  char,
  check,
  customType,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  pgView,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ─── Tipos sem equivalente nativo no Drizzle ───────────────────────

/**
 * `citext` — texto case-insensitive. É o tipo da chave pública `slug` e do
 * `contato_email` (doc 02 §1). A extensão é criada pela migração 0001.
 */
const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

/** `tsvector` — usado apenas na coluna gerada `documento.busca` (doc 02 §5). */
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// ─── Tipos enumerados (doc 02 §3) ──────────────────────────────────

/** Status do ciclo de publicação de qualquer entidade publicável. */
export const statusPublicacao = pgEnum("status_publicacao", [
  "rascunho",
  "em_revisao",
  "publicado",
  "arquivado",
]);

/** Classificação do tipo de equipamento cultural. */
export const tipoEquipamento = pgEnum("tipo_equipamento", [
  "ecoparque",
  "museu",
  "centro_cultural",
  "comunidade",
  "rota_turistica",
  "orgao_publico",
]);

/** Situação operacional do equipamento. */
export const situacaoEquipamento = pgEnum("situacao_equipamento", [
  "ativo",
  "intermitente",
  "desativado",
  "potencial",
]);

/** Classificação do tipo de documento do acervo. */
export const tipoDocumento = pgEnum("tipo_documento", [
  "relatorio_tecnico",
  "diagnostico_interno",
  "relato_campo",
  "formulario_modelo",
  "relatorio_parcial",
  "documento_final",
  "modelagem_estatistica",
  "entrevista_transcricao",
  "plano_aula",
  "identidade_visual",
  "painel_dados",
  "outro",
]);

/** Tipo de mídia (formato do arquivo). */
export const tipoMidia = pgEnum("tipo_midia", [
  "pdf",
  "audio",
  "imagem",
  "video",
  "planilha",
  "apresentacao",
  "dataset",
  "outro",
]);

/** Papel da pessoa no projeto. */
export const tipoPessoa = pgEnum("tipo_pessoa", [
  "pesquisador",
  "ator_chave",
  "agente_publico",
  "lideranca_comunitaria",
  "colaborador",
]);

/** Status de cumprimento da meta do projeto aprovado. */
export const statusMeta = pgEnum("status_meta", [
  "alcancada",
  "superada",
  "em_desenvolvimento",
  "nao_iniciada",
  "substituida",
]);

/** Tipo de formulário de coleta de dados. */
export const tipoFormulario = pgEnum("tipo_formulario", [
  "rotina_funcionamento",
  "publico_consumidor",
]);

/** Tipo de consentimento obtido de pessoa identificável. */
export const tipoConsentimento = pgEnum("tipo_consentimento", [
  "uso_imagem",
  "uso_audio",
  "dados_pessoais",
  "publicacao_entrevista",
]);

/** Status de moderação de contribuições de escuta. */
export const statusModeracao = pgEnum("status_moderacao", [
  "pendente",
  "aprovado",
  "rejeitado",
  "spam",
]);

/**
 * Natureza do item na Prestação de Contas — migração 0004.
 *
 * `exigido_pelo_edital` é booleano e por isso não distingue duas coisas que
 * precisam ser distintas: um item complementar descoberto na pesquisa e um
 * item do inventário original que o edital não exige. `D01`/`D02` são o
 * segundo caso; `B13`/`B14`/`A11`, o primeiro. O denominador dos 28 itens
 * exigidos conta apenas `item_exigido`.
 */
export const naturezaDocumento = pgEnum("natureza_documento", [
  "item_exigido",
  "evidencia_complementar",
  "item_nao_exigido",
]);

/**
 * Estado documental oficial (plano de execução §4). Não se confunde com
 * `status_publicacao`, que é o fluxo editorial de rascunho a arquivado.
 */
export const estadoDocumental = pgEnum("estado_documental", [
  "PUBLICAVEL",
  "RESTRITO",
  "ESPELHAVEL",
  "IMPEDIDO",
  "PENDENTE",
]);

/**
 * Revisão de privacidade — eixo independente do estado documental. Publicar
 * exige as duas condições ao mesmo tempo, e o CHECK da 0004 impede que
 * `PUBLICAVEL` exista sem revisão concluída.
 */
export const revisaoPrivacidade = pgEnum("revisao_privacidade", [
  "pendente",
  "concluida",
  "bloqueada",
]);

/**
 * Como um derivado foi produzido a partir do original.
 *
 * `transcricao_leitura_visual` e `ocr_estatistico` são tecnicamente
 * diferentes e o modelo não os deixa serem confundidos: o derivado do
 * relatório de Borda da Mata foi produzido por leitura visual das páginas
 * extraídas, sem motor de OCR, e registrar "OCR" ali seria falso.
 */
export const metodoDerivacao = pgEnum("metodo_derivacao", [
  "transcricao_leitura_visual",
  "ocr_estatistico",
  "redacao_versao_publica",
  "extracao_secao",
  "conversao_formato",
]);

/**
 * Como o consentimento foi obtido — migração 0005.
 *
 * `tipo_consentimento` diz **o que** foi consentido (uso de imagem, de áudio).
 * Isto diz **como**, que é informação diferente e faltava. No campo, o
 * consentimento foi verbal e gravado na abertura de cada entrevista; não
 * existe termo assinado no acervo, e o modelo não deve permitir afirmar que
 * existe.
 */
export const modalidadeConsentimento = pgEnum("modalidade_consentimento", [
  "verbal_gravado",
  "termo_assinado",
  "eletronico",
]);

/**
 * Situação da evidência do consentimento — migração 0005.
 *
 * `nao_localizada` significa exatamente isso: não foi encontrada nesta
 * verificação. Não significa que o consentimento não existiu.
 */
export const evidenciaConsentimento = pgEnum("evidencia_consentimento", [
  "localizada",
  "nao_localizada",
  "pendente_verificacao",
]);

// ─── 1. arquivo — o binário (doc 02 §5) ────────────────────────────

/**
 * O binário do acervo: um PDF, um MP3, uma imagem. O banco guarda apenas
 * metadados, hash e URL — nunca os bytes (doc 02 §17, ADR-003, ADR-006).
 * Sem dependência de saída: é a primeira tabela da migração 0002.
 */
export const arquivo = pgTable(
  "arquivo",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** ex: arquivos/analise-de-dados/recanto-da-serra-v2.pdf */
    chaveStorage: text("chave_storage").notNull().unique(),
    /** URL estável do domínio próprio */
    urlPublica: text("url_publica").notNull().unique(),
    nomeOriginal: text("nome_original"),
    tipoMidia: tipoMidia("tipo_midia").notNull(),
    mimeType: text("mime_type").notNull(),
    bytes: bigint("bytes", { mode: "number" }).notNull(),
    /** integridade para auditoria */
    sha256: char("sha256", { length: 64 }).notNull(),
    /** áudio/vídeo */
    duracaoSeg: integer("duracao_seg"),
    larguraPx: integer("largura_px"),
    alturaPx: integer("altura_px"),
    /** Drive/Figma de onde veio (redundância) */
    origemUrl: text("origem_url"),
    /** google_drive | google_docs | google_forms | figma | instagram | upload */
    origemSistema: text("origem_sistema"),
    /** quando saiu do Drive para storage próprio */
    espelhadoEm: timestamp("espelhado_em", { withTimezone: true }),
    /**
     * Binário do qual este foi derivado — migração 0004. O original nunca é
     * substituído: o derivado é linha nova, com hash próprio.
     */
    derivadoDeId: uuid("derivado_de_id"),
    derivacaoMetodo: metodoDerivacao("derivacao_metodo"),
    derivacaoEm: timestamp("derivacao_em", { withTimezone: true }),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check("arquivo_bytes_check", sql`${t.bytes} > 0`),
    index("idx_arquivo_sha256").on(t.sha256),
    index("idx_arquivo_tipo").on(t.tipoMidia),
  ],
);

// ─── 2. municipio (doc 02 §6.1) ────────────────────────────────────

/** Sem dependência de saída. Referenciada por `equipamento` e `documento`. */
export const municipio = pgTable("municipio", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: citext("slug").notNull().unique(),
  nome: text("nome").notNull(),
  uf: char("uf", { length: 2 }).notNull().default("SE"),
  codigoIbge: char("codigo_ibge", { length: 7 }).unique(),
  /** Centro-Sul Sergipano, Grande Aracaju */
  regiao: text("regiao"),
  populacao: integer("populacao"),
  sintese: text("sintese"),
  criadoEm: timestamp("criado_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── 3. pessoa (doc 02 §6.3) ───────────────────────────────────────

/** Depende de `arquivo` (foto). Referenciada por `equipamento` e `consentimento`. */
export const pessoa = pgTable("pessoa", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: citext("slug").unique(),
  nome: text("nome").notNull(),
  tipo: tipoPessoa("tipo").notNull(),
  cargo: text("cargo"),
  instituicao: text("instituicao"),
  bioCurta: text("bio_curta"),
  fotoId: uuid("foto_id").references(() => arquivo.id, {
    onDelete: "set null",
  }),
  exibirNoSite: boolean("exibir_no_site").notNull().default(false),
  /** interno, nunca renderizado */
  contatoEmail: citext("contato_email"),
  criadoEm: timestamp("criado_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── 4. equipamento (doc 02 §6.2) ──────────────────────────────────

/**
 * Depende de `municipio` e `pessoa`. PostGIS não é usado: `numeric(9,6)` basta
 * para o mapa Leaflet (doc 02 §6.2 — "não instale por antecipação").
 */
export const equipamento = pgTable(
  "equipamento",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: citext("slug").notNull().unique(),
    nome: text("nome").notNull(),
    nomeCurto: text("nome_curto"),
    tipo: tipoEquipamento("tipo").notNull(),
    situacao: situacaoEquipamento("situacao").notNull().default("ativo"),
    municipioId: uuid("municipio_id")
      .notNull()
      .references(() => municipio.id, { onDelete: "restrict" }),
    /** Jacaré, Borda da Mata, Samambaia */
    povoado: text("povoado"),
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 9, scale: 6 }),
    atorChaveId: uuid("ator_chave_id").references(() => pessoa.id, {
      onDelete: "set null",
    }),
    sintese: text("sintese"),
    historico: text("historico"),
    destaqueHome: boolean("destaque_home").notNull().default(false),
    status: statusPublicacao("status").notNull().default("rascunho"),
    publicadoEm: timestamp("publicado_em", { withTimezone: true }),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check(
      "coordenadas_completas",
      sql`(${t.latitude} IS NULL) = (${t.longitude} IS NULL)`,
    ),
  ],
);

// ─── 5. consentimento (doc 02 §6.3) ────────────────────────────────

/**
 * Depende de `pessoa` e de `arquivo` (termo assinado). Sem consentimento válido
 * e não revogado, o áudio da entrevista não é publicado — risco jurídico
 * resolvido no schema, não no processo (doc 02 §6.3).
 *
 * Não tem `atualizado_em`, portanto não recebe o trigger `trg_atualizado_em`.
 */
export const consentimento = pgTable(
  "consentimento",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pessoaId: uuid("pessoa_id")
      .notNull()
      .references(() => pessoa.id, { onDelete: "cascade" }),
    tipo: tipoConsentimento("tipo").notNull(),
    /**
     * Migração 0005: passou a aceitar NULL. Em 4 das 8 entrevistas do acervo
     * a data não é declarada em nenhum arquivo, e `NOT NULL` obrigava a
     * inventá-la. Data ausente exige `dataIncerta = true`, então a lacuna
     * fica declarada em vez de silenciosa.
     */
    concedidoEm: date("concedido_em"),
    /** Migração 0005: torna a ausência de data uma afirmação, não um vazio. */
    dataIncerta: boolean("data_incerta").notNull().default(false),
    /** Migração 0005. Sem default: a modalidade é declarada, nunca presumida. */
    modalidade: modalidadeConsentimento("modalidade").notNull(),
    /** Migração 0005. Default conservador: nada se presume localizado. */
    evidencia: evidenciaConsentimento("evidencia")
      .notNull()
      .default("pendente_verificacao"),
    /**
     * Documento que carrega a evidência — a entrevista. Várias pessoas
     * consentindo na mesma gravação apontam para o mesmo documento, cada uma
     * com sua própria linha.
     */
    evidenciaDocumentoId: uuid("evidencia_documento_id"),
    /** publicação integral, apenas trechos */
    escopo: text("escopo").notNull(),
    /** termo assinado */
    termoId: uuid("termo_id").references(() => arquivo.id, {
      onDelete: "set null",
    }),
    revogadoEm: date("revogado_em"),
    observacao: text("observacao"),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("consentimento_pessoa_id_tipo_key").on(t.pessoaId, t.tipo)],
);

// ─── 6. documento — a obra intelectual (doc 02 §5) ─────────────────

/**
 * Depende de `equipamento` e `municipio`. Separar `documento` de `arquivo` é o
 * que permite versionar um relatório, publicar o mesmo conteúdo em PDF e HTML,
 * e trocar um anexo sem perder o histórico da URL (doc 02 §5).
 */
export const documento = pgTable(
  "documento",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: citext("slug").notNull().unique(),
    titulo: text("titulo").notNull(),
    tipo: tipoDocumento("tipo").notNull(),
    resumo: text("resumo"),
    /** nomes livres; pesquisadores vivem em `pessoa` */
    autoria: text("autoria").array(),
    /** data do conteúdo, não da publicação */
    dataReferencia: date("data_referencia"),
    equipamentoId: uuid("equipamento_id").references(() => equipamento.id, {
      onDelete: "set null",
    }),
    municipioId: uuid("municipio_id").references(() => municipio.id, {
      onDelete: "set null",
    }),
    licenca: text("licenca").notNull().default("CC BY-SA 4.0"),
    exigidoPeloEdital: boolean("exigido_pelo_edital").notNull().default(false),
    /**
     * Migração 0004. O default é o valor conservador: linha nova não infla o
     * denominador dos 28 itens exigidos.
     */
    natureza: naturezaDocumento("natureza")
      .notNull()
      .default("item_nao_exigido"),
    /** Migração 0004. Default conservador: nada nasce publicável. */
    estadoDocumental: estadoDocumental("estado_documental")
      .notNull()
      .default("PENDENTE"),
    /** Migração 0004. Eixo independente do estado. */
    revisaoPrivacidade: revisaoPrivacidade("revisao_privacidade")
      .notNull()
      .default("pendente"),
    /** Documento do qual este é derivado — ex: A05 deriva de A02. */
    derivadoDeId: uuid("derivado_de_id"),
    derivacaoMetodo: metodoDerivacao("derivacao_metodo"),
    derivacaoEm: timestamp("derivacao_em", { withTimezone: true }),
    /** ordem na Sala do Avaliador */
    ordemAnexo: integer("ordem_anexo"),
    status: statusPublicacao("status").notNull().default("rascunho"),
    publicadoEm: timestamp("publicado_em", { withTimezone: true }),
    arquivadoEm: timestamp("arquivado_em", { withTimezone: true }),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    busca: tsvector("busca").generatedAlwaysAs(
      sql`to_tsvector('portuguese', sem_acento(coalesce(titulo,'') || ' ' || coalesce(resumo,'')))`,
    ),
  },
  (t) => [
    check(
      "publicado_exige_data",
      sql`${t.status} <> 'publicado' OR ${t.publicadoEm} IS NOT NULL`,
    ),
    index("idx_documento_busca").using("gin", t.busca),
    index("idx_documento_tipo")
      .on(t.tipo)
      .where(sql`${t.status} = 'publicado'`),
    index("idx_documento_anexo")
      .on(t.ordemAnexo)
      .where(sql`${t.exigidoPeloEdital} AND ${t.status} = 'publicado'`),
  ],
);

// ─── 7. documento_arquivo (doc 02 §5) ──────────────────────────────

/**
 * Liga a obra ao binário. O `ON DELETE RESTRICT` do arquivo é deliberado:
 * evidência de edital não se apaga por efeito colateral.
 *
 * Não tem `criado_em`/`atualizado_em` no doc 02 §5, portanto não recebe trigger.
 */
export const documentoArquivo = pgTable(
  "documento_arquivo",
  {
    documentoId: uuid("documento_id")
      .notNull()
      .references(() => documento.id, { onDelete: "cascade" }),
    arquivoId: uuid("arquivo_id")
      .notNull()
      .references(() => arquivo.id, { onDelete: "restrict" }),
    versao: integer("versao").notNull().default(1),
    /** PDF acessível, versão em linguagem simples */
    rotulo: text("rotulo"),
    principal: boolean("principal").notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.documentoId, t.arquivoId] }),
    // garante no máximo um arquivo principal por documento
    uniqueIndex("idx_doc_arquivo_principal")
      .on(t.documentoId)
      .where(sql`${t.principal}`),
  ],
);

// ─── View de consumo (doc 02 §13) ──────────────────────────────────

/**
 * `vw_anexo_publico` — alimenta a Sala do Avaliador e o `/anexos.json`.
 *
 * `.existing()` declara um objeto **que já existe no banco**: a view é criada
 * pela migração 0002, em SQL bruto, como o doc 03 §6.2 determina. Esta
 * declaração serve só para consultá-la com tipagem — **não gera DDL e não
 * entra em migração**.
 *
 * A view junta `documento`, `documento_arquivo` (só o principal) e `arquivo`,
 * filtrando `status = 'publicado'` e `arquivado_em IS NULL`. Ela **expõe**
 * `espelhado`, mas não filtra por ele: quem consome é que decide, e a Sala do
 * Avaliador exige `espelhado = true`.
 */
export const vwAnexoPublico = pgView("vw_anexo_publico", {
  ordemAnexo: integer("ordem_anexo"),
  slug: citext("slug"),
  titulo: text("titulo"),
  tipo: tipoDocumento("tipo"),
  resumo: text("resumo"),
  dataReferencia: date("data_referencia"),
  licenca: text("licenca"),
  linkPermanente: text("link_permanente"),
  linkOrigem: text("link_origem"),
  mimeType: text("mime_type"),
  bytes: bigint("bytes", { mode: "number" }),
  sha256: char("sha256", { length: 64 }),
  publicadoEm: timestamp("publicado_em", { withTimezone: true }),
  espelhado: boolean("espelhado"),
  /** Colunas acrescentadas pela migração 0004, ao fim da view. */
  natureza: naturezaDocumento("natureza"),
  obrigatorio: boolean("obrigatorio"),
  estadoDocumental: estadoDocumental("estado_documental"),
  revisaoPrivacidade: revisaoPrivacidade("revisao_privacidade"),
  derivadoDeSlug: citext("derivado_de_slug"),
}).existing();

/**
 * `vw_pendencia_publicacao` — trava de publicação do CI (doc 02 §13).
 *
 * Criada pela migração 0003, em SQL bruto. `.existing()` apenas a declara para
 * consulta tipada: não gera DDL e não entra em migração.
 *
 * Denuncia documento exigido pelo edital, publicado e sem arquivo espelhado.
 * A view usa LEFT JOIN de propósito — é o documento *sem* arquivo principal que
 * interessa aqui, exatamente o caso que a vw_anexo_publico esconde por usar
 * JOIN.
 *
 * Nesta fatia a view tem só o ramo do anexo. O ramo do áudio público sem
 * consentimento depende da tabela `entrevista`, que ainda não existe, e entra
 * por CREATE OR REPLACE VIEW numa migração futura — sem alterar esta
 * declaração, porque UNION ALL acrescenta linhas e não colunas. Ver
 * docs/tarefas/09-gate-de-pendencias.md.
 */
export const vwPendenciaPublicacao = pgView("vw_pendencia_publicacao", {
  slug: citext("slug"),
  titulo: text("titulo"),
  pendencia: text("pendencia"),
}).existing();
