# TAREFA 24 — Ajuste pontual do cabeçalho da Home v2

**Natureza:** refinamento visual e de interação restrito ao cabeçalho.

**Data:** 2026-09-16.

**Branch:** `exp/home-v2-territorio-vivo`.

## Ativo escolhido antes da implementação

O arquivo escolhido é
`identidade-visual/observatorio/icon.png`, localizado na fonte canônica fora do
Git. É o único ícone disponível no diretório confirmado pelo responsável:

- formato: PNG;
- dimensões: 565 × 565 px;
- SHA-256:
  `20722639dba1b44885121e72fda6b7c1749f0607047215c513817d3619a1881f`;
- desenho circular oficial, com transparência fora do círculo;
- sem versão vetorial disponível no corpus atual.

Será produzido um derivado PNG menor, sem recorte, recoloração ou fundo novo.
O original permanece fora do repositório e inalterado.

## Escopo

- substituir no cabeçalho a assinatura horizontal usada na Tarefa 23 pelo
  ícone oficial acima acompanhado do nome curto;
- usar Literata, já carregada pelo projeto, na assinatura textual;
- qualificar o menu em Archivo, já carregada, sem alterar destinos ou ordem;
- adicionar hover editorial e foco visível aos links;
- dar ao botão Acessibilidade feedback de hover coerente com a ação primária;
- preservar clique externo, `Esc`, foco e responsividade existentes.

## Arquivos permitidos

- `docs/tarefas/24-ajuste-pontual-cabecalho-home-v2.md`;
- `scripts/derivar-icone-observatorio.ts`;
- `public/media/logos/observatorio-icone-oficial-192.png`;
- `src/dados/hero/derivados.ts`;
- `src/componentes/prototipo/homelivre/Secoes.tsx`;
- `src/componentes/prototipo/homelivre/estilos.ts`;
- `src/componentes/prototipo/CentralAcessibilidade.tsx`;
- `src/componentes/layout/MenuMobile.tsx`;
- `src/estilos/tokens.css`;
- `testes/a11y/home.spec.ts`.
- `testes/territorio.test.ts` (inventário de procedência da mídia preservada).
- `testes/a11y/navegacao-publica.spec.ts` (breakpoint do menu compacto).
- `testes/home.test.ts` (instância responsiva do menu na Home v2).

Hero, mapa, Acervo, Território, navegação canônica, banco e deploy ficam fora
do escopo.

## Validação

- tipos, lint, testes pertinentes, build e `git diff --check`;
- capturas em 1440, 1024 e 375 px;
- símbolo, tipografia, alinhamento, hover, foco, painel e overflow.
