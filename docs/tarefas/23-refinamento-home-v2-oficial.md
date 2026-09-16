# TAREFA 23 — Refinamento da Home v2 oficial

**Natureza:** refinamento visual, editorial e de interação da Home pública.

**Data:** 2026-09-16.

**Branch:** `exp/home-v2-territorio-vivo`.

## Objetivo

Qualificar a Home v2 oficial sem criar alternativa paralela, sem alterar banco,
deploy, Vercel, `main` ou a rota pública `/territorio`.

## Decisões e correções

- A fotografia de abertura é identificada como **Recanto da Serra**, de
  **05/04/2026**, conforme confirmação direta do responsável. O enquadramento
  prioriza a faixa superior da cena para preservar a presença das pessoas.
- O cabeçalho passa a usar a assinatura horizontal oficial já derivada e
  versionada, substituindo o símbolo alto acompanhado de texto recomposto.
  Em telas menores que 1280 px, a navegação compacta evita que as utilidades
  caiam para uma faixa desalinhada.
- A Central de Acessibilidade mantém foco, `Esc` e devolução de foco; também
  fecha ao clique fora do painel.
- Indicadores quantitativos ganham rótulo próprio; a assinatura institucional
  permanece separada, sem inventar números.
- O mapa preserva o estado inicial de Sergipe e seus recortes sob demanda. Ao
  selecionar Vale ou comparação, exibe os pins de lugares de campo cujas
  coordenadas públicas confirmadas pertencem ao recorte. A legenda distingue
  recorte, comparação e lugar visitado.
- A Home passa a reconhecer Serra dos Macacos e Ilha Grande como lugares da
  pesquisa na cartografia, sem publicar qualquer documento restrito.

## Arquivos permitidos

- `src/componentes/prototipo/CentralAcessibilidade.tsx`;
- `src/componentes/prototipo/homelivre/Aberturas.tsx`;
- `src/componentes/prototipo/homelivre/MapaDoRecorte.tsx`;
- `src/componentes/prototipo/homelivre/Secoes.tsx`;
- `src/componentes/prototipo/homelivre/abertura.ts`;
- `src/componentes/prototipo/homelivre/estilos.ts`;
- `src/componentes/prototipo/homelivre/estilosAberturas.ts`;
- `scripts/derivar-hero.ts`;
- `src/dados/hero/derivados.ts`;
- `public/media/campo/hero-observatorio-desktop-1440.webp`;
- `testes/a11y/home.spec.ts`;
- este documento.

## Validação esperada

- tipos, lint, testes pertinentes, build e `git diff --check`;
- Home em desktop e mobile, claro e escuro;
- mapa por teclado e clique, pins e retorno à visão geral;
- painel de acessibilidade por teclado, `Esc` e clique fora;
- verificação de que documentos restritos não entram no HTML público.
