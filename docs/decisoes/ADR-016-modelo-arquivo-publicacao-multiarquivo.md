# ADR-016 — Publicação de documento com múltiplos arquivos

## Status

Aceita

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

## Decisão

Adotar a **Opção A**, aprovada pelo responsável humano no Prompt 3.8, por ser
a menor mudança coerente com o modelo já aplicado. `arquivo` representa
explicitamente um **objeto físico armazenado**:

1. substituir a unicidade global de `chave_storage` por unicidade de
   `(bucket, chave_storage)`;
2. manter `sha256` não único, permitindo o mesmo conteúdo em localizações
   privada e pública;
3. acrescentar uma relação específica `replica_de_id` para cópia byte-identical,
   separada de `derivado_de_id` e mutuamente exclusiva com ela;
4. acrescentar `tarjamento_privacidade` e `sanitizacao_metadados` ao enum de
   método de derivação;
5. alterar `vw_anexo_publico` para juntar todos os vínculos cujo arquivo passa
   no gate, sem exigir `principal`;
6. expor proveniência de arquivo na view e fazê-la chegar ao Manifesto;
7. corrigir o adaptador para mapear `natureza`, `estado_documental` e
   `revisao_privacidade` existentes, sem valores nulos artificiais;
8. representar cada objeto físico público como uma entrada do Manifesto. Isso
   preserva o contrato existente, evita uma mudança estrutural nos consumidores
   e permite que um documento tenha várias entradas sem colapsá-las.

`documento_arquivo.principal` continua indicando o arquivo representativo ou
preferencial do documento. Não é autorização pública nem limita a quantidade
de arquivos publicáveis.

A migration versionada `0007_publicacao_multiarquivo.sql` materializa a
decisão. Ela foi submetida a revisão manual e testes transacionais com rollback
antes da validação final.

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
- D01-04 e D01-06 podem ser registradas honestamente como réplicas;
- consumidores compartilham o mesmo gate por arquivo.

Custos:

- a migration 0007 altera constraint, enum e view;
- scripts de idempotência passam a consultar bucket+chave;
- consulta, Manifesto, ZIP e testes precisam ser atualizados em conjunto;
- a migration preserva as dez linhas atuais sem reescrever objetos.

O `DROP` da constraint de unicidade global e os `ALTER` foram revisados segundo
o checklist do guia de implementação:

- nenhuma coluna muda de tipo e nenhuma linha é removida;
- a view dependente é recriada na mesma migration, preservando as 19 colunas
  anteriores e acrescentando as colunas de proveniência ao final;
- funções e triggers existentes não dependem da constraint removida nem da
  coluna acrescentada;
- a migration verifica previamente colisões no novo par `(bucket,
  chave_storage)` e falha sem modificar dados caso encontre alguma.

## Bloqueio externo

`STORAGE_PUBLIC_URL` ainda aponta para `r2.dev`. A arquitetura e os testes não
dependem da troca nesta rodada, mas nenhuma publicação real pode ser autorizada
até o responsável aprovar o domínio público final de produção.

## Impacto técnico

- `db/schema.ts`
- nova migration em `db/migrations/`
- `src/dados/consultas/anexos.ts`
- `src/lib/manifesto-evidencias.ts`
- `scripts/gerar-zip-anexos.ts` e bibliotecas de publicação
- testes de banco, Manifesto, `/anexos.json`, Sala e ZIP
