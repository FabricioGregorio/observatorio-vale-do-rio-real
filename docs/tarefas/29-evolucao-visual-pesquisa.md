# Tarefa 29 — evolução visual de /pesquisa

Pedido direto do responsável em 2026-09-21, na sequência das Tarefas 27 e 28:
rodada criativa controlada na branch `exp/home-v2-territorio-vivo`, com
implementação, validação local, capturas, commit e push para a mesma branch.
Sem Preview, Production ou main.

Direção: **caderno de percurso**. A camada metodológica da Cartografia Viva —
irmã de `/dados` (caderno de medidas) e de `/territorio` (carta espacial), e
distinta das duas na composição. A página precisa responder visualmente *como
a pesquisa aconteceu*, e não apresentar procedimentos metodológicos.

Preservar integralmente período, lugares, número e natureza das entrevistas,
instrumentos, atores-chave, papéis da equipe, ordem das etapas, limites,
fontes e materiais reunidos. Nenhum fato metodológico novo é afirmado: tudo o
que a composição acrescenta sai de texto que a própria página já servia ou de
dado versionado.

Arquivos autorizados para esta execução:

- `src/app/pesquisa/page.tsx` e `pesquisa.css`;
- `src/componentes/pesquisa/conteudoDaPesquisa.ts`;
- `src/componentes/pesquisa/MarcaDeEvidencia.tsx`, novo;
- `testes/pesquisa-percurso.test.ts`, novo;
- `testes/a11y/institucional.spec.ts`;
- este registro e `docs/frontend/EVOLUCAO_VISUAL_PESQUISA_2026-09-21.md`.

`src/estilos/tokens.css` fica **fora** do escopo: os papéis locais desta rota
são derivados por `color-mix` sobre papéis semânticos existentes, dentro de
`.pq`, como a folha da rota já fazia. `/dados`, `/territorio`, `/campo`, Home,
banco, storage, migrações, rodapé, PodObservar e Acervo ficam fora.

Capturas e medições ficam em `tmp/pesquisa-visual/`, fora do Git.

Validação: tipos, lint, testes de integridade, `pnpm verificar`, axe, teclado,
movimento reduzido, ausência de JavaScript, ausência de overflow, temas claro
e escuro, 320/375/768/1024/1440 px e a varredura de higiene editorial sobre a
saída HTML pública. Conferir o orçamento da Home.

Stage nominal; alterações preexistentes nos documentos de plano, estado e
arquitetura, a ADR-019 e `testes/zz-conta-temp.test.ts` ficam fora do lote.
