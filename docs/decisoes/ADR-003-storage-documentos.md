# ADR-003 — Armazenamento de documentos: espelho local obrigatório com hash de integridade

## Status

Aceita

## Data

2025-08-27

## Contexto

O inventário do projeto aponta para Google Drive, Google Docs e Figma como fontes
primárias dos anexos. Esses endereços quebram, mudam de permissão, dependem de conta
e não sobrevivem a uma auditoria feita daqui a dois anos. A função primária do site
é substituir esses links por URLs próprias, estáveis e públicas (doc 01 §0).

Além disso, a prestação de contas exige que o avaliador nunca precise de login,
nunca peça permissão de acesso e nunca encontre link morto (doc 01 §4). O Google
Forms original está publicado com `/edit#responses` — link de edição, não de leitura
(doc 01 §0).

## Decisão

1. **Separar `documento` (obra intelectual) de `arquivo` (binário).** Isso permite
   versionar um relatório, publicar o mesmo conteúdo em PDF e HTML, e trocar um
   anexo sem perder o histórico da URL (doc 02 §5).

2. **Todo arquivo vive em armazenamento de objetos** (Vercel Blob, Cloudflare R2 ou
   S3) com URL própria do domínio e hash SHA-256 registrado no banco (doc 02 §5,
   tabela `arquivo`).

3. **Espelho local obrigatório de todo anexo.** Nenhum item da prestação de contas
   pode depender exclusivamente de Drive/Figma. O link de origem é mantido como
   redundância, nunca como fonte primária (doc 01 §6).

4. **Padrão de URL para arquivos:** `/arquivos/[categoria]/[slug]-[versao].pdf` —
   minúsculas, sem acento, hífen, sem data no caminho (doc 01 §6).

5. **`vw_pendencia_publicacao` como gate de CI:** nenhum registro com
   `exigido_pelo_edital = true` pode ser publicado sem ao menos um
   `documento_arquivo` cujo `arquivo.espelhado_em IS NOT NULL`. Violação **quebra o
   build** (doc 02 §5, §13).

6. **Hash SHA-256 por arquivo** para integridade em auditoria, exposto na Sala do
   Avaliador (doc 01 §4, doc 02 §5).

7. **`/anexos.json` legível por máquina** e botão "Baixar tudo (.zip)" na Sala do
   Avaliador (doc 01 §4).

## Alternativas consideradas

- **Manter links do Google Drive como fonte primária:** risco alto de quebra e
  dependência de permissão — exatamente o problema que o site precisa resolver.

- **Hospedar binários no banco (`bytea`):** caminho mais curto para um backup
  impossível de restaurar (doc 02 §17).

- **Usar apenas `/public` do Next.js:** sem versionamento, sem hash, sem metadados
  de espelhamento; não sustenta a Sala do Avaliador.

- **CDN de terceiro sem URL própria:** perde controle sobre permanência do link e
  rastreabilidade.

## Consequências

Benefícios:

- O avaliador nunca encontra link morto, nunca precisa de login, nunca pede permissão.
- Integridade verificável por hash SHA-256 — diferencial forte em auditoria.
- Versionamento de arquivos sem perda de histórico.
- O CI impede publicação de anexo obrigatório sem espelho local.
- Preservação de longo prazo complementada por depósito no Zenodo com DOI (doc 01 §6).

Custos:

- Todo arquivo precisa ser espelhado antes da publicação — etapa adicional no fluxo.
- Armazenamento de objetos tem custo (mitigado pelo volume pequeno do projeto).
- Manter sincronizados os metadados no banco e os binários no storage exige disciplina
  de processo.

## Impacto técnico

Arquivos ou módulos afetados:

- `db/schema.ts` — tabelas `arquivo`, `documento`, `documento_arquivo`
- `db/migrations/` — migração com as três tabelas e a view `vw_anexo_publico`
- `scripts/gerar-hashes.ts` — cálculo de SHA-256 dos arquivos
- `scripts/verificar-pendencias.ts` — gate de CI baseado em `vw_pendencia_publicacao`
- `src/app/prestacao-de-contas/` — renderiza a Sala do Avaliador com hash e link permanente
- `src/app/api/anexos/route.ts` — endpoint `/anexos.json`

Fontes:

- doc 01 §0 (fragilidade dos links como maior risco técnico)
- doc 01 §4 (Sala do Avaliador: tabela com hash, ZIP, versão imprimível)
- doc 01 §6 (espelho local obrigatório, padrão de URL)
- doc 02 §5 (tabelas arquivo, documento, documento_arquivo; regra de negócio inegociável)
- doc 02 §13 (views vw_anexo_publico e vw_pendencia_publicacao)
- doc 02 §17 (por que não hospedar binários no banco)
- doc 03 §6 (gate obrigatório do CI)
