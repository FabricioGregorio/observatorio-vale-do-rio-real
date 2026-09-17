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

## Fechamento (segunda rodada, 17/09/2026)

### 6. Semântica de tokens

`--color-milho` volta a `#e8b23a`. A abertura ganha `--hero-acento-editorial`
apontando para `--color-observatorio-claro` — a assinatura institucional, que o
cabeçalho logo acima já usava — e `--hero-texto-sobre-acento` para o rótulo do
botão. O contraste do botão sobe de 4,32:1 para 5,32:1; ele reprovava AA sem
que nenhum teste o cobrisse diretamente. `testes/contraste.test.ts` ganhou o par
explícito e duas travas semânticas.

### 7. Arquivos duvidosos, resolvidos com prova

- `tmp/a03-borda-da-mata-acessivel.md`: idêntico byte a byte ao objeto já
  publicado e reconciliado. Fonte canônica no corpus, fora do Git. Descartado.
- `docs/handoff/HANDOFF_ARQUITETO_SENIOR_2026-09-12.md`: snapshot superado,
  sem informação única, com bootstrap prompt obsoleto. Descartado.

Ambos com a conferência detalhada em `ESTADO_ATUAL_PROJETO.md`.

## Fora de escopo, auditado e devolvido ao humano
- As demais rotas `/dev/*` (estilos, hero, dados, dados-vivos,
  linguagem-visual, pesquisa, território, território-vivo) têm finalidade
  própria e não foram tocadas.
- `src/componentes/mapa/{MapaTerritorio,MunicipioNoMapa,Municipio,FichaMunicipio,MarcadorVisita}.tsx`
  ficaram sem consumidor de produto com a saída de `SecaoMapa`, mas continuam
  cobertos por `testes/territorio.test.ts`. Não removidos.
