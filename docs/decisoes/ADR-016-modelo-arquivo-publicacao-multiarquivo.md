# ADR-016 — Publicação de documento com múltiplos arquivos

## Status

Em análise

## Data

2026-09-07

## Contexto

O primeiro lote candidato contém A02 e sete arquivos de D01. D01 é um único
`documento` com oito `arquivo`: sete podem ser públicos e D01-08 deve continuar
privado. A auditoria em rollback provou que a tabela armazena essa combinação,
mas `vw_anexo_publico` seleciona somente o vínculo `principal`, cujo índice
parcial permite no máximo um por documento.

Também foram encontradas três tensões de modelagem:

- `arquivo` contém localização física, enquanto `sha256` identifica conteúdo;
- `chave_storage` é única globalmente, embora haja dois buckets;
- o modelo de derivação não nomeia saneamento de metadados nem cópia
  byte-identical.

## Decisão proposta

Adotar a **Opção A**, após aprovação humana, por ser a menor mudança coerente
com o modelo já aplicado. Ela preserva `arquivo` como objeto físico:

1. substituir a unicidade global de `chave_storage` por unicidade de
   `(bucket, chave_storage)`;
2. manter `sha256` não único, permitindo o mesmo conteúdo em localizações
   privada e pública;
3. acrescentar uma relação específica `copia_de_id` para cópia byte-identical,
   separada de `derivado_de_id` e mutuamente exclusiva com ela;
4. acrescentar `sanitizacao_metadados` ao enum de método de derivação;
5. alterar `vw_anexo_publico` para juntar todos os vínculos cujo arquivo passa
   no gate, sem exigir `principal`;
6. expor proveniência de arquivo na view e fazê-la chegar ao Manifesto;
7. corrigir o adaptador para mapear `natureza`, `estado_documental` e
   `revisao_privacidade` existentes, sem valores nulos artificiais.

Esta ADR não autoriza implementação. A mudança de schema/view exige nova
migration versionada, revisão manual e testes de rollback antes de aplicação.

## Alternativas consideradas

### Opção A — múltiplas linhas físicas em `arquivo` (recomendada)

Mantém a estrutura atual e alinha a constraint à localização física. Tem menor
impacto e permite idempotência por bucket+chave, integridade por SHA-256 e
proveniência explícita sem chamar uma cópia de derivado.

### Opção B — separar conteúdo lógico de objeto de storage

Criar `conteudo_arquivo` com SHA-256 único e `objeto_storage` com bucket,
chave, URL e visibilidade. Duas localizações byte-identical apontariam para o
mesmo conteúdo. É a normalização mais forte, mas exige migrar referências,
views, scripts, Manifesto e ZIP; o custo é desproporcional ao lote atual.

### Opção C — manter a chave global e criar documentos separados para D01

Criar sete documentos artificiais contornaria o filtro de principal, mas
mudaria a identidade documental aprovada e fragmentaria D01 sem base no
inventário. Rejeitada por fabricar granularidade para acomodar implementação.

## Consequências

Benefícios:

- D01 pode publicar sete arquivos e manter D01-08 privado;
- A02 mantém original e derivado com proveniência;
- D01-04 e D01-06 podem ser registradas honestamente como cópias;
- consumidores compartilham o mesmo gate por arquivo.

Custos:

- nova migration altera constraint, enum e view;
- scripts de idempotência passam a consultar bucket+chave;
- consulta, Manifesto, ZIP e testes precisam ser atualizados em conjunto;
- a migration precisa preservar as dez linhas atuais sem reescrever objetos.

## Impacto técnico

- `db/schema.ts`
- nova migration em `db/migrations/`
- `src/dados/consultas/anexos.ts`
- `src/lib/manifesto-evidencias.ts`
- `scripts/gerar-zip-anexos.ts` e bibliotecas de publicação
- testes de banco, Manifesto, `/anexos.json`, Sala e ZIP
