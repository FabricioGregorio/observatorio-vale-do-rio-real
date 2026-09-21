/**
 * Schema do banco de dados — Observatório do Vale do Rio Real
 *
 * Esta declaração é a fonte de verdade do schema.
 * O que Drizzle não expressa — extensões, funções, triggers e views — vive em
 * SQL bruto dentro do arquivo de migração.
 *
 * Migração 0001: tipos enumerados, extensões e funções utilitárias.
 * Migração 0002: núcleo da prestação de contas.
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
  "tarjamento_privacidade",
  "sanitizacao_metadados",
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

/**
 * Onde o objeto está exposto — migração 0006.
 *
 * `privado` é o default: espelhar não é publicar. Um documento `ESPELHAVEL`
 * com revisão de privacidade pendente pode ter o binário copiado para storage
 * controlado, e **não** pode ganhar acesso público. Só sai de `privado` depois
 * do gate `PUBLICAVEL` + `revisao_privacidade = concluida`.
 */
export const visibilidadeArquivo = pgEnum("visibilidade_arquivo", [
  "privado",
  "publico",
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
    chaveStorage: text("chave_storage").notNull(),
    /**
     * Bucket real onde o objeto vive — migração 0006. `chave_storage` diz a
     * chave, não o bucket, e com dois buckets a chave sozinha é ambígua.
     * Sem default: o bucket é declarado, nunca presumido.
     */
    bucket: text("bucket").notNull(),
    /** Migração 0006. Default conservador: nada nasce público. */
    visibilidade: visibilidadeArquivo("visibilidade")
      .notNull()
      .default("privado"),
    /**
     * URL estável do domínio próprio.
     *
     * Migração 0006: passou a aceitar NULL. Objeto no bucket privado **não
     * tem** URL pública, e `NOT NULL` obrigava a inventar uma — ou a usar o
     * endpoint S3 como se fosse URL pública, o que é pior. O CHECK
     * `arquivo_visibilidade_coerente` amarra os dois campos: público exige
     * URL, privado exige a ausência dela.
     */
    urlPublica: text("url_publica").unique(),
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
    /**
     * Objeto físico copiado byte a byte de outra localização. Não é derivado:
     * a réplica preserva o SHA-256 e existe para representar, por exemplo, o
     * mesmo SVG nos buckets privado e público.
     */
    replicaDeId: uuid("replica_de_id"),
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
    check(
      "arquivo_replica_nao_reflexiva",
      sql`${t.replicaDeId} IS NULL OR ${t.replicaDeId} <> ${t.id}`,
    ),
    check(
      "arquivo_proveniencia_unica",
      sql`num_nonnulls(${t.derivadoDeId}, ${t.replicaDeId}) <= 1`,
    ),
    unique("arquivo_bucket_chave_key").on(t.bucket, t.chaveStorage),
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
    /** ordem na Prestação de Contas */
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

// ─── 8. temporada — PodObservar (doc 02 §9) ────────────────────────

/**
 * Temporada do PodObservar. Depende de `arquivo` (capa).
 *
 * Doc 02 §9 não declara `criado_em`/`atualizado_em` para esta tabela — ela
 * portanto **não** recebe `trg_atualizado_em` (doc 02 §4, mesma razão de
 * `consentimento` e `documento_arquivo`). Não acrescentar timestamps por
 * simetria: o documento é a especificação, e ele não os pede aqui.
 *
 * `numero` é único no projeto inteiro, e não por ano: é ele que a rota
 * `/podobservar/t1/[episodio]` carrega em `t1`.
 */
export const temporada = pgTable("temporada", {
  id: uuid("id").primaryKey().defaultRandom(),
  numero: integer("numero").notNull().unique(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  ano: integer("ano"),
  capaId: uuid("capa_id").references(() => arquivo.id, {
    onDelete: "set null",
  }),
});

// ─── 9. episodio — PodObservar (doc 02 §9) ─────────────────────────

/**
 * Episódio do PodObservar. Depende de `temporada` e de `arquivo`.
 *
 * Três obrigatoriedades do doc 02 §9 são o contrato desta tabela, e nenhuma
 * delas é conveniência:
 *
 * - `audio_id NOT NULL` — o site é dono do áudio final canônico. Spotify e
 *   YouTube são distribuição, nunca fonte única; um episódio sem binário
 *   próprio não é representável.
 * - `transcricao NOT NULL` — acessibilidade. O podcast é a audiodescrição da
 *   pesquisa para quem não lê o documento; a transcrição é o inverso, para
 *   quem não ouve o áudio. o projeto proíbe áudio sem transcrição vinculada.
 * - `status` com default `rascunho` — nada nasce público.
 *
 * `ON DELETE RESTRICT` no áudio e na temporada segue `documento_arquivo`:
 * evidência de edital não some por efeito colateral.
 *
 * **Não há CHECK `publicado_exige_data` aqui**, ao contrário de `documento`.
 * Doc 02 §9 não o especifica para `episodio`, e a hierarquia de fontes manda
 * seguir o documento. A consequência é deliberada: o estado incoerente
 * `publicado` sem `publicado_em` é representável na tabela e fica retido pelo
 * gate de `vw_episodio_publico`, que exige a data explicitamente.
 */
export const episodio = pgTable(
  "episodio",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: citext("slug").notNull().unique(),
    temporadaId: uuid("temporada_id")
      .notNull()
      .references(() => temporada.id, { onDelete: "restrict" }),
    numero: integer("numero").notNull(),
    titulo: text("titulo").notNull(),
    /** vira <description> no RSS */
    resumo: text("resumo").notNull(),
    audioId: uuid("audio_id")
      .notNull()
      .references(() => arquivo.id, { onDelete: "restrict" }),
    duracaoSeg: integer("duracao_seg").notNull(),
    /** acessibilidade: obrigatória, e do áudio final publicado */
    transcricao: text("transcricao").notNull(),
    capaId: uuid("capa_id").references(() => arquivo.id, {
      onDelete: "set null",
    }),
    explicito: boolean("explicito").notNull().default(false),
    urlSpotify: text("url_spotify"),
    urlYoutube: text("url_youtube"),
    status: statusPublicacao("status").notNull().default("rascunho"),
    publicadoEm: timestamp("publicado_em", { withTimezone: true }),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    busca: tsvector("busca").generatedAlwaysAs(
      sql`to_tsvector('portuguese', sem_acento(coalesce(titulo,'') || ' ' || coalesce(resumo,'') || ' ' || coalesce(transcricao,'')))`,
    ),
  },
  (t) => [
    unique("episodio_temporada_id_numero_key").on(t.temporadaId, t.numero),
    index("idx_episodio_busca").using("gin", t.busca),
    /** Sustenta o gate público e a primitiva "episódio mais recente". */
    index("idx_episodio_publicado")
      .on(t.publicadoEm)
      .where(sql`${t.status} = 'publicado'`),
  ],
);

// ─── View de consumo (doc 02 §13) ──────────────────────────────────

/**
 * `vw_anexo_publico` — alimenta a Prestação de Contas e o `/anexos.json`.
 *
 * `.existing()` declara um objeto **que já existe no banco**: a view é criada
 * pela migração 0002, em SQL bruto, como o doc 03 §6.2 determina. Esta
 * declaração serve só para consultá-la com tipagem — **não gera DDL e não
 * entra em migração**.
 *
 * A view junta `documento`, todos os vínculos de `documento_arquivo` e
 * `arquivo`. A migração 0007 deixou de tratar `principal` como autorização:
 * ele é somente informação de preferência. O gate filtra documento publicado,
 * não arquivado, PUBLICAVEL, com revisão concluída, e objeto público espelhado
 * com URL.
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
  /** Colunas acrescentadas pela migração 0007, sempre ao fim da view. */
  principal: boolean("principal"),
  rotuloArquivo: text("rotulo_arquivo"),
  arquivoOrigemId: uuid("arquivo_origem_id"),
  arquivoRelacao: text("arquivo_relacao"),
  arquivoDerivacaoMetodo: metodoDerivacao("arquivo_derivacao_metodo"),
  /** Identidade do objeto que já passou pelo gate da view (migração 0009). */
  arquivoId: uuid("arquivo_id"),
}).existing();

/**
 * `vw_pendencia_publicacao` — trava de publicação do CI (doc 02 §13).
 *
 * Criada pela migração 0003, em SQL bruto. `.existing()` apenas a declara para
 * consulta tipada: não gera DDL e não entra em migração.
 *
 * Denuncia documento exigido pelo edital e publicado sem nenhum arquivo
 * espelhado, documento em estado PUBLICAVEL na mesma condição e divergência
 * entre `status` e `estado_documental`. A migração 0008 trocou o anti-join por
 * `NOT EXISTS`: a pergunta é se o documento tem algum arquivo espelhado, não se
 * tem o arquivo marcado `principal` — que desde a 0007 é apenas o arquivo
 * representativo, nunca autorização de publicação.
 *
 * Nesta fatia a view tem só o ramo do anexo. O ramo do áudio público sem
 * consentimento depende da tabela `entrevista`, que ainda não existe, e entra
 * por CREATE OR REPLACE VIEW numa migração futura — sem alterar esta
 * declaração, porque UNION ALL acrescenta linhas e não colunas.
 */
export const vwPendenciaPublicacao = pgView("vw_pendencia_publicacao", {
  slug: citext("slug"),
  titulo: text("titulo"),
  pendencia: text("pendencia"),
}).existing();

/**
 * `vw_episodio_publico` — gate público do PodObservar.
 *
 * Criada pela migração 0010 e **substituída** pela 0011 (ADR-021), em SQL
 * bruto dentro da migração, como toda view do projeto; aqui só é declarada
 * como existente (`.existing()`), sem gerar DDL (doc 03 §6.7).
 *
 * A 0011 registra a decisão humana de concentrar a escuta no Spotify: o site
 * não reproduz, não oferece download e não expõe URL de áudio. A view perdeu
 * `audio_url`, `audio_mime_type` e `audio_bytes`, e deixou de juntar
 * `arquivo` pelo áudio — não é omissão de colunas, é a remoção do caminho.
 * A partir daqui não existe rota até o master.
 *
 * O gate é fail-closed, no mesmo princípio de `vw_anexo_publico`. São cinco
 * condições, e nenhuma é dispensável:
 *
 * 1. `status = 'publicado'` — rascunho, em_revisao e arquivado não vazam;
 * 2. `publicado_em IS NOT NULL` — sem data declarada não há publicação;
 * 3. `publicado_em <= now()` — episódio datado no futuro ainda não é público;
 * 4. `transcricao` não vazia — a coluna ser NOT NULL não impede string em
 *    branco, e acessibilidade é pré-requisito de publicação;
 * 5. `url_spotify` presente e não vazia — sem player próprio, episódio
 *    publicado sem destino de escuta seria anúncio sem objeto.
 *
 * `episodio.audio_id` continua NOT NULL: o Observatório segue dono do master,
 * para custódia, integridade, hash, duração e cadeia documental. Áudio
 * privado deixou de bloquear o episódio, e continua inalcançável pela view.
 *
 * A capa entra por LEFT JOIN com os predicados públicos de `arquivo`: capa
 * privada apaga `capa_url`, e não o episódio.
 *
 * A view não expõe `id`, `temporada_id`, `audio_id`, `capa_id`, `status`,
 * `criado_em`, `atualizado_em`, `busca`, bucket nem chave de storage.
 * `temporada_numero` está aqui porque é ele que a rota carrega em `t1`: a
 * consulta valida temporada e slug juntos, e a divergência vira inexistência.
 */
export const vwEpisodioPublico = pgView("vw_episodio_publico", {
  slug: citext("slug"),
  temporadaNumero: integer("temporada_numero"),
  temporadaTitulo: text("temporada_titulo"),
  numero: integer("numero"),
  titulo: text("titulo"),
  resumo: text("resumo"),
  publicadoEm: timestamp("publicado_em", { withTimezone: true }),
  duracaoSeg: integer("duracao_seg"),
  transcricao: text("transcricao"),
  explicito: boolean("explicito"),
  urlSpotify: text("url_spotify"),
  urlYoutube: text("url_youtube"),
  capaUrl: text("capa_url"),
  capaLarguraPx: integer("capa_largura_px"),
  capaAlturaPx: integer("capa_altura_px"),
}).existing();
