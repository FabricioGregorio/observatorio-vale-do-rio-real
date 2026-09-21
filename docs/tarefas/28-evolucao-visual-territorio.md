# Tarefa 28 — evolução visual de /territorio

Pedido direto do responsável em 2026-09-21, na sequência da Tarefa 27: rodada
criativa controlada na branch `exp/home-v2-territorio-vivo`, com implementação,
validação local, capturas, commit e push para a mesma branch. Sem Preview,
Production ou main.

Direção: **três escalas de uma mesma leitura**. A camada espacial e relacional
da Cartografia Viva, irmã de `/dados` no sistema visual e oposta a ela na
natureza do conteúdo.

Preservar integralmente coordenadas, recorte, municípios, procedência,
classificação de documentos, mapas derivados e os textos factuais aprovados nas
Tarefas 19 a 21. Nenhum fato territorial novo é afirmado: toda geometria
acrescentada sai de valor já presente nos dados versionados.

Arquivos autorizados para esta execução:

- `src/componentes/territorio/cartografia/TerritorioVivo.tsx`;
- `src/componentes/territorio/cartografia/estilos.ts`;
- `src/componentes/territorio/cartografia/InteracaoTerritorioVivo.tsx`;
- `testes/a11y/territorio-publico.spec.ts`;
- este registro.

Dados territoriais, camadas locais, rotas, tokens globais, Home e menu ficam
fora do escopo. Capturas e medições ficam em `tmp/territorio-visual/`, fora do
Git.

Validação: tipos, lint, testes de integridade, axe, teclado, Escape, movimento
reduzido, temas claro e escuro, 375/768/1440 px, ausência de overflow, build.
Stage nominal; alterações preexistentes nos documentos de plano, estado e
arquitetura e o lote de `/dados` ficam fora deste commit.
