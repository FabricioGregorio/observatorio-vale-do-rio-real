# Tarefa 27 — evolução visual de /dados

Pedido direto do responsável em 2026-09-21: rodada criativa controlada na
branch `exp/home-v2-territorio-vivo`, com implementação, validação local,
capturas, commit e push para a mesma branch. Sem Preview, Production ou main.

Direção: caderno de medidas, a camada quantitativa da Cartografia Viva.
Preservar integralmente dataset, cálculos, bases, períodos, fontes, textos
factuais e conjunto dos oito indicadores. Diversificar a representação por
natureza da medida; tornar a comparação mensal legível também no celular.

Arquivos autorizados para esta execução:

- `src/app/dados/page.tsx` e `dados.css`;
- `src/componentes/dados/Indicadores.tsx`, `SerieMensal.tsx`, `Atividades.tsx`;
- `src/estilos/tokens.css`: somente novos tokens confinados a `.dd`;
- `testes/pagina-dados.test.ts` e `testes/a11y/dados-publicos.spec.ts`;
- este registro e `docs/frontend/EVOLUCAO_VISUAL_DADOS_2026-09-21.md`.

O acréscimo localizado em tokens é necessário para manter cor, espaçamento e
tipografia na fonte única exigida pelo AGENTS.md; não muda papéis existentes.
Capturas e medições ficam em `tmp/dados-visual/`, fora do Git.

Validação: tipos, lint, testes de integridade, pnpm verificar, axe, teclado,
movimento reduzido, ausência de JavaScript e overflow, temas claro e escuro,
375/768/1440 px. Conferir o orçamento da Home. Stage nominal; alterações
preexistentes nos documentos de plano, estado e arquitetura ficam fora do lote.

O lote será dividido em commits revisáveis por superfície após a validação.
