# TAREFA 22 — Integração pública de Território e Acervo

**Natureza:** integração candidata, sem autorização de Preview, Production ou
merge em `main`.

**Data:** 2026-09-15.

**Branch:** `codex/integracao-territorio-acervo`.

**Base pública:** `90700d1d4adae0111fa155fdff48f96b94000117`.

**Candidata territorial promovida:** cinco commits das Tarefas 17–21 da branch
`exp/home-v2-territorio-vivo`, sem o commit da Home v2.

## 1. Objetivos autorizados

1. criar a rota pública real `/territorio` a partir da candidata A congelada;
2. criar uma primeira versão pública, real e mínima de `/acervo`;
3. adotar exatamente esta navegação principal, nesta ordem:
   **O Observatório → A Pesquisa → Território → Dados → Diário de Campo →
   PodObservar → Acervo**;
4. remover Educação apenas do menu principal, preservando `/educacao`;
5. atualizar metadata, canonical, sitemap, documentação e testes relacionados;
6. executar os gates e medir a carga inicial das duas novas rotas.

Continuam fora do escopo Home v2, E02, preenchimento de outros placeholders,
redesign global, deploy, Preview, Production e merge em `main`.

## 2. Estado anterior de `/acervo`

Antes desta tarefa, `/acervo` não existia. Não havia implementação parcial da
rota. Já existiam, porém, infraestrutura e dados públicos consolidados:

- `listarAnexosPublicos()` em `src/dados/consultas/anexos.ts`;
- a view canônica `vw_anexo_publico`;
- `/prestacao-de-contas` e sua versão para impressão;
- `/anexos.json`;
- `TabelaAnexos`, componente orientado à conferência e não adequado para ser
  repetido como interface editorial do Acervo.

A consulta pública aplica o manifesto canônico, `podePublicar` e
`espelhado = true`, inclusive para documentos multiarquivo. A interface não
cria uma segunda regra de autorização e nunca trata `principal` como licença
de publicação.

## 3. Fonte e conteúdo inicial do Acervo

O Acervo consome exclusivamente `listarAnexosPublicos()`. No conjunto público
vigente, isso representa oito objetos físicos:

- A02: um relatório público em PDF;
- D01: sete arquivos públicos de identidade visual.

Os materiais são agrupados por documento real. Não são criadas categorias
vazias. Cada arquivo mantém o link permanente fornecido pela consulta e só é
aberto por ação do visitante; não há preview, preload nem download automático.

São explicitamente excluídos A04, entrevistas, formulários, transcrições,
fotografias não liberadas, fontes privadas, originais externos e qualquer
registro PENDENTE, IMPEDIDO ou RESTRITO.

## 4. Acervo × Prestação de Contas

`/acervo` é o repositório editorial público dos materiais do Observatório. Sua
interface prioriza contexto, agrupamento e acesso aos arquivos.

`/prestacao-de-contas` continua sendo a evidência orientada à conferência do
projeto, com tabela, origem, datas, hashes, impressão e saídas técnicas.

As duas rotas compartilham a consulta e os links canônicos, mas não duplicam a
mesma apresentação.

## 5. Território público

`/territorio` reutiliza a candidata aprovada da Tarefa 21, sem novo polimento,
mudança editorial ou alteração das quatro coordenadas e camadas. A diferença
técnica é o endpoint público estático das camadas locais; `/dev/territorio-vivo`
e seus endpoints continuam restritos ao desenvolvimento.

## 6. Navegação e ADR-017

A ADR-017 recebe uma emenda datada, sem reescrever a decisão anterior. A
decisão humana posterior muda o menu de seis para sete itens, inclui Território
e Acervo, preserva Diário de Campo e retira Educação apenas da navegação
principal. A implementação depende de validação responsiva e de acessibilidade.

Após a integração, Território e Acervo têm conteúdo real. O Observatório, A
Pesquisa, Dados, Diário de Campo e PodObservar ainda podem conservar estados
placeholder preexistentes. Este checkpoint não é freeze editorial final.

## 7. Validações de encerramento

- `pnpm tipos`;
- `pnpm lint`;
- testes unitários e territoriais pertinentes;
- testes do Acervo, navegação, metadata e sitemap;
- Playwright/a11y de Território, Acervo e cabeçalho;
- larguras 320, 375, 768, 900, 1024, 1280 e 1440 px, além de zoom 200%;
- claro/escuro, teclado, foco, Enter, Esc e devolução de foco;
- build de produção e confirmação de 404 nas rotas `/dev/*`;
- medição de transferência inicial de `/territorio` e `/acervo`;
- `git diff --check`.

## 8. Arquivos permitidos

- `docs/tarefas/22-integracao-publica-territorio-acervo.md`;
- `docs/decisoes/ADR-017-navegacao-alvo-do-frontend.md`;
- `docs/01-arquitetura-informacao.md`;
- `src/app/territorio/page.tsx`;
- `src/app/territorio/camada-local/[lugar]/route.ts`;
- `src/app/acervo/page.tsx`;
- `src/app/sitemap.ts`;
- `src/componentes/acervo/ListaMateriaisPublicos.tsx`;
- `src/componentes/layout/Cabecalho.tsx`;
- `src/componentes/layout/MenuMobile.tsx`;
- `src/componentes/prototipo/CabecalhoPrototipo.tsx` — a Home pública usa esta
  casca no lugar do cabeçalho do layout; alteração limitada à navegação;
- `src/componentes/prototipo/territoriovivo/TerritorioVivo.tsx`;
- `src/lib/navegacao.ts`;
- testes unitários e de acessibilidade diretamente relacionados em `testes/`,
  incluindo a guarda existente da Home para o cabeçalho efetivamente exibido.

Qualquer necessidade fora desta lista exige parar e registrar a divergência
antes de editar.

## 9. Estado a completar no encerramento

### Implementação realizada

- `/territorio` reutiliza a candidata A e aponta suas quatro camadas lazy para
  endpoints públicos estáticos; a rota e as camadas DEV continuam 404 no
  build de produção;
- `/acervo` organiza os oito objetos públicos em duas fichas documentais reais:
  uma de A02 e outra com os sete arquivos de D01;
- nenhum A04, entrevista, formulário, transcrição ou fotografia não liberada
  aparece; não existe lógica de autorização fora da consulta canônica;
- o menu público tem os sete itens aprovados, na mesma ordem nas duas cascas de
  cabeçalho efetivamente usadas pelo site; `/educacao` permanece fisicamente;
- o sitemap inclui `/territorio` e `/acervo` e deixa de indexar o placeholder
  `/educacao`; as duas novas páginas têm canonical e Open Graph próprios.

### Responsividade e acessibilidade

O cabeçalho foi validado em 320, 375, 768, 900, 1024, 1280 e 1440 px. Em 320
a 900 px usa o menu estreito; em 1024 px ou mais, a lista desktop permanece em
uma linha, com as utilidades podendo ocupar a segunda linha em 1024 px. Não há
overflow ou sobreposição no cabeçalho, redução de fonte, abreviação, “Mais” ou
mudança de ordem. O painel móvel recebeu fundo sólido sobre a fotografia do
Hero. Tab, Enter, Esc, foco visível e devolução de foco foram exercitados. O
equivalente a 1440 px com zoom de 200% usa corretamente a navegação estreita.

Acervo e Território foram conferidos em 375 e 1440 px, claro/escuro e sem
JavaScript. O conteúdo documental essencial permanece no HTML.

### Performance — build de produção local

Medição com cache desativado e Resource Timing, sem ação do visitante:

| Rota | Requisições | Transferido | HTML | JS | CSS | Imagens | Documento/camada automática |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/territorio` | 15 | 484.578 B | 42.778 B | 140.703 B | 7.200 B | 182.598 B | 0 |
| `/acervo` | 13 | 262.335 B | 5.300 B | 138.536 B | 7.200 B | 0 B | 0 |

Território permanece comparável aos 484.333 B da Tarefa 21: delta de 245 B
(+0,05%). Selecionar Recanto gera uma única requisição pública de 98.940 B,
igual à medição anterior. Acervo não antecipa PDF, ZIP, preview ou imagem.

### Gates executados

- `pnpm tipos`: passou;
- `pnpm lint`: passou, com quatro avisos preexistentes e deliberados sobre
  `!important` na regra de movimento reduzido;
- `pnpm teste`: 584 passaram, 3 ignorados; 38 arquivos, um ignorado;
- suíte Playwright diretamente relacionada: 64 passaram;
- suíte completa de acessibilidade em execução serial: 306 passaram;
- testes territoriais/unitários focalizados: 70 passaram;
- `pnpm build`: passou, 32 páginas estáticas; quatro camadas públicas SSG;
- produção local: 200 em `/territorio` e `/acervo`; 404 em
  `/dev/territorio-vivo`, sua camada DEV e parâmetro público inexistente.
- `pnpm pendencias`: não consultou a base porque `DATABASE_URL` estava ausente;
  conforme o comportamento previsto fora do CI, esse resultado não atesta o
  estado das pendências de publicação.

### Infraestrutura mínima de Preview — 2026-09-16

A role `preview_observatorio` foi provisionada fora das migrations, sem segredo
no Git, com `LOGIN`, `NOINHERIT`, `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`,
`NOREPLICATION` e limite de cinco conexões. Seus únicos grants explícitos são
`CONNECT` no database, `USAGE` no schema `public` e `SELECT` em
`public.vw_anexo_publico`. A role tem ainda `default_transaction_read_only=on`,
`statement_timeout=120s` e `idle_in_transaction_session_timeout=30s`.

A decisão humana desta data aceita, somente para este checkpoint, os privilégios
ambientais herdados de `PUBLIC`: `TEMPORARY` no database e `EXECUTE` nas funções
security-invoker das extensões e do schema. A auditoria confirmou que `PUBLIC`
não tem `CREATE` no schema e que nenhuma função executável por `PUBLIC` é
`SECURITY DEFINER`. Esses privilégios ambientais não equivalem a acesso às
fontes de dados.

Autenticada como a nova role, a view pública retornou oito registros. Consultas
diretas a `documento`, `arquivo`, `documento_arquivo`,
`vw_pendencia_publicacao` e `pessoa` foram negadas com SQLSTATE `42501`. A role
não tem membership, `CREATE` no schema nem `INSERT`, `UPDATE` ou `DELETE` em
`documento`.

O build completo com essa credencial passou e gerou Acervo, Território,
`/anexos.json` e as duas páginas de Prestação de Contas sem solicitar outro
objeto PostgreSQL. O smoke do artefato confirmou as rotas públicas e as quatro
camadas em 200, parâmetro territorial inválido e rotas DEV em 404, e total 8 em
`/anexos.json`. O gate separado, com a role read-only local, confirmou
`documento=33`, `arquivo=18`, `documento_arquivo=18`,
`vw_anexo_publico=8` e `vw_pendencia_publicacao=0`.

Hardening futuro, fora deste release: revisar globalmente `TEMPORARY` de
`PUBLIC`, `EXECUTE` de `PUBLIC`, default privileges de funções e a adoção de
`security_barrier` em `vw_anexo_publico`. Nenhuma dessas mudanças foi executada
nesta tarefa.

Permanecem placeholders preexistentes em O Observatório, A Pesquisa, Dados,
Diário de Campo e PodObservar. Este release continua sendo checkpoint, não
freeze editorial final. Commit candidato e estado Git são registrados no
relatório de encerramento da rodada.
