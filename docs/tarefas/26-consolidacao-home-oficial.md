# Tarefa 26 — Consolidação: Home oficial, componentização e limpeza

Decisão humana de 17/09/2026: **a Home atual é a Home oficial do Observatório.**
Não existe mais Home candidata, experimental, v2 ou alternativa a preservar como
opção de produto.

Esta tarefa é estrutural. Nenhum texto aprovado, número, fotografia, material
público, dado territorial ou classificação documental foi alterado.

## Escopo

### 1. Correção visual no cabeçalho

“Prestação de contas” ficava mais alto que “Acessibilidade”: mesmo padding,
mesma borda e mesmo corpo de texto, mas só o botão de Prestação quebrava o
rótulo em duas linhas quando a linha do cabeçalho apertava — 60,2 px contra
39,1 px a 1440 px. As duas utilidades passaram a compartilhar
`--topo-altura-utilidade` e `white-space:nowrap`. A hierarquia entre elas
continua sendo feita por cor, borda, fundo e tipografia.

### 2. Promoção da Home a arquitetura oficial

`src/componentes/prototipo/homelivre/` → `src/componentes/home/`, e
`HomeLivre` → `Home`. A Home oficial não vive mais dentro de uma pasta de
protótipo, e nada no código a descreve como experimento, candidata ou v2.

### 3. Remoção da Home antiga

A composição estrutural H0–H4.1 não tinha nenhum consumidor desde a promoção de
2026-09-16. Removida.

### 4. Remoção da rota de laboratório da Home

`/dev/home-livre` era o harness da mesma composição que `/` já servia. Com ele
saiu todo o parâmetro `contexto`: aviso de experimento, seletor `?hero=`, as
variantes A/B/C da abertura, os blocos de fontes e a régua de marcas marcada
“Não publicar” — nada disso era renderizado em `publico`, mas tudo existia na
árvore.

### 5. Componentização do que é compartilhável

Central de Acessibilidade e grafismos territoriais saíram de `prototipo/` para
onde pertencem. A seleção editorial de indicadores foi para `src/dados/`.

## Arquivos permitidos

- `src/app/page.tsx`;
- `src/app/dev/home-livre/` (removida);
- `src/componentes/home/**`;
- `src/componentes/grafismos/**`;
- `src/componentes/layout/**`;
- `src/componentes/dados/`, `src/componentes/pesquisa/PesquisaEmCampo.tsx`,
  `src/componentes/territorio/TerritorioCartografico.tsx` (removidos);
- `src/componentes/prototipo/{CabecalhoPrototipo,dadosvivos}/**` (só ajuste de import);
- `src/dados/indicadores/selecaoEditorial.ts`;
- `src/estilos/tokens.css`;
- `testes/home.test.ts`, `testes/dados-vivos.test.ts`,
  `testes/materiais-de-campo.test.ts`, `testes/a11y/home.spec.ts`;
- `testes/rota-home-livre.test.ts`, `testes/a11y/home-livre.spec.ts` (removidos);
- `.gitignore`;
- `docs/frontend/README.md`, `docs/direcao-visual/README.md`,
  `ESTADO_ATUAL_PROJETO.md`, este registro.

## Fora de escopo, auditado e devolvido ao humano

- **`--color-milho` está com valor de teal** (`#2e8b89`, era `#e8b23a`) no
  working tree, vindo da tarefa 25. Isso reprova cinco invariantes de contraste
  em `testes/contraste.test.ts`. A cor não foi tocada aqui: ou o token volta ao
  amarelo, ou os invariantes precisam ser reescritos por decisão humana.
- **`tmp/a03-borda-da-mata-acessivel.md`** é um derivado textual acessível de
  A03, com procedência, `estado: PUBLICAVEL` e revisão de privacidade
  concluída, morando numa pasta de trabalho descartável.
- As demais rotas `/dev/*` (estilos, hero, dados, dados-vivos,
  linguagem-visual, pesquisa, território, território-vivo) têm finalidade
  própria e não foram tocadas.
- `src/componentes/mapa/{MapaTerritorio,MunicipioNoMapa,Municipio,FichaMunicipio,MarcadorVisita}.tsx`
  ficaram sem consumidor de produto com a saída de `SecaoMapa`, mas continuam
  cobertos por `testes/territorio.test.ts`. Não removidos.
