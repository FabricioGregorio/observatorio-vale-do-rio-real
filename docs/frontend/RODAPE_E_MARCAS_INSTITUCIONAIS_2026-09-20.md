# Rodapé definitivo e marcas institucionais — 2026-09-20

**Branch:** `exp/home-v2-territorio-vivo`
**Escopo:** um rodapé para todo o site e a aplicação das marcas oficiais de
fomento, conforme os manuais localizados no corpus.

## 1. O que havia antes

Dois rodapés.

| Onde | O que servia |
|---|---|
| `componentes/layout/Rodape.tsx` | cinco links institucionais e um bloco de créditos **vazio**, com a pendência declarada em texto |
| `componentes/home/Secoes.tsx › RodapeDaHome` | nome oficial e os mesmos cinco links |

A Home escondia o do layout com `body > footer { display: none }`. Duas
marcações, dois conjuntos de estilo e duas listas de link para o mesmo
propósito — e, com a régua de marcas entrando, seriam duas afirmações
diferentes sobre quem financia o projeto.

Havia ainda `CreditosInstitucionais.tsx`, que renderizava marcas e devolvia
`null` enquanto não houvesse nenhuma aprovada. Ele nunca recebeu marca, foi
superado pela régua e saiu.

## 2. Manuais localizados e lidos

Varredura de `OBSERVATORIO_FONTES_DIR` inteira. Três manuais e o edital, todos
em `marcas/`, todos lidos por extração de texto:

| Arquivo | O que é |
|---|---|
| `manual pnab.pdf` | Manual de uso da marca — Política Nacional Aldir Blanc **Sergipe** |
| `manual-identidade-visual.pdf` | Manual de uso da marca do **Governo Federal**, v1.2, ago/2025 |
| `manual governo de sergipe.pdf` | Manual de uso **Governo de Sergipe** |
| `edital completo.pdf` | Edital de chamamento |

Nenhum manual da FUNCAP isolado existe no corpus; o manual da PNAB Sergipe é o
que rege a aplicação conjunta no estado, e é ele que trata da FUNCAP.

## 3. Regras extraídas, e o que cada uma determinou

### Manual PNAB Sergipe

- **É obrigatória a veiculação da régua de marcas em toda divulgação** do
  projeto — a lista inclui *sites* explicitamente, "sob pena de serem
  considerados inadimplentes".
- Entidades cujo apoio deve ser divulgado: **Governo do Estado de Sergipe,
  Secretaria Especial da Cultura, Fundação de Cultura e Arte Aperipê de
  Sergipe e Governo Federal**.
- Blocos: **Apoio** (as marcas do estado) e **Realização** (PNAB ao lado da
  assinatura conjunta Ministério da Cultura/Governo Federal, **separada por um
  traço**, fechando o bloco à extrema direita).
- "As logomarcas que pertencem ao bloco **não devem ultrapassar a altura e a
  largura total da marca nominativa do Governo Federal**."
- Assinatura textual padrão para releases e textos de divulgação — transcrita
  literalmente no site.
- Usos indevidos: rotacionar, distorcer, alterar cores, marca-d'água, moldura,
  traçado, alterar tipologia, aplicar sobre fundos instáveis.
- Paleta: `#00CF00`, `#FFCF00`, `#183EFF`, `#FF0000`.

### Manual do Governo Federal, v1.2

- **Versão completa e original em cores sólidas (RGB) em todas as peças exceto
  impressas.** Uma página web não é peça impressa: a régua usa a versão
  colorida, não a monocromática.
- **Ordem ascendente de importância da esquerda para a direita**; a marca do
  Governo Federal é sempre a última à direita em assinaturas horizontais.
- **Limite de redução em meios eletrônicos: 200 px.** Abaixo disso só em caso
  excepcional, com 110 px de piso — o projeto não usa a exceção.
- **Caixa de proteção**: área de não interferência igual à espessura do "I" de
  BRASIL em volta da marca.
- **Aplicação em box branco** prevista no manual (p. 14).
- Existe versão especial para fundos escuros e versão monocromática negativa
  em branco.

### Manual Governo de Sergipe

- Brasão azul `C100 M80 Y0 K0` / `R22 G65 B148`; padrão positivo e negativo.
- Área de segurança `x`; redução mínima de 10 mm em impressos, e **qualquer
  outro material deve ser testado previamente**.
- Proibido distorcer, inclinar, alterar cores, aplicar contorno, glow, ou
  **criar outras variações de assinatura**.
- Sobre fundo que comprometa a legibilidade, usar caixa.

## 4. Divergências registradas — não corrigidas em silêncio

**1. Secretaria Especial da Cultura.** A decisão humana de 2026-09-13
(tarefa 16 §2, item 5) determinou usar **Governo de Sergipe**, e não o lockup
"Secretaria de Cultura + Governo de Sergipe". O manual da PNAB exige divulgar
também o apoio da Secretaria Especial da Cultura.

A decisão humana é o item 1 da hierarquia de fontes de verdade, e foi tomada
**antes** de o manual da PNAB existir no corpus — a auditoria da tarefa 16
§8.5 registra que ele não havia sido localizado, e os arquivos de manual têm
data de 13/09 à tarde, posterior àquela auditoria.

Solução aplicada, que atende às duas: o **ativo gráfico** é o do Governo de
Sergipe isolado, como a decisão humana determinou; a **Secretaria Especial da
Cultura é nomeada em texto**, na lista de entidades do bloco de Apoio e na
assinatura padrão — que é a redação do próprio manual.

> **Depende de decisão humana:** se a FUNCAP ou a Secult entenderem que a
> exigência é de marca e não de citação, o corpus já tem o lockup
> `SECRETARIA DE CULTURA + GOVERNO DE SERGIPE HORIZONTAL.png`, e a troca é de
> uma linha no manifesto.

**2. Vocabulário da régua.** A régua textual anterior chamava a PNAB de
"política de fomento" e o bloco federal de "assinatura federal". O manual
chama os dois, juntos, de **Realização**, e o bloco do estado de **Apoio**. O
vocabulário do manual prevaleceu.

**3. Posição do traço.** A implementação anterior punha o traço antes do bloco
federal inteiro. O manual é literal: ele separa a marca da PNAB da assinatura
conjunta, **dentro** do bloco de Realização. Corrigido.

## 5. Marcas oficiais encontradas, e as escolhidas

23 PNG em `marcas/`, todos 8000×4500 px com transparência e a arte centrada
numa moldura vazia. Servir um deles custaria ~300 kB para exibir 260 px.

| Entidade | Variantes no corpus | Escolhida | Por quê |
|---|---|---|---|
| MinC + Governo Federal | horizontal e vertical; colorida, fonte preta, fonte branca | `…SEM FUNDO HORIZONTAL.png` (colorida) | versão completa em cores sólidas, exigida para peça não impressa |
| PNAB | PNAB1–4, fonte preta, fonte branca | `PNAB3.png` | é a variante cuja paleta bate **exatamente** com a do manual, e a de assinatura azul, legível sobre branco. PNAB4 é a de assinatura amarela; PNAB1 e PNAB2 usam cores fora da paleta |
| FUNCAP | horizontal e vertical; colorida e "preto e branco" | `FUNCAP-HORIZONTAL.png` | colorida, horizontal |
| Governo de Sergipe | horizontal com fundo, horizontal sem fundo, vertical sem fundo | `GOVERNO DE SERGIPE HORIZONTAL SEM FUNDO.png` | versão positiva do brasão, sem caixa |

Não usados, e declarados: o lockup com a Secretaria (§4), as variantes
verticais (a régua é horizontal no desktop) e as monocromáticas (§6).

## 6. Por que as marcas ficam sobre painel branco

O rodapé é escuro. Nenhum dos três manuais autoriza fabricar versão branca de
marca por filtro de CSS — todos tratam isso como alteração de cor.

Dois dos quatro ativos existem em versão de fonte branca. **A do Governo de
Sergipe não existe no corpus**: só há o brasão azul, com e sem caixa. Aplicar
as quatro em variantes diferentes seria compor uma assinatura que manual
nenhum descreve, e o manual de Sergipe proíbe expressamente "criar outras
variações de assinatura".

O manual do Governo Federal resolve isso com a **aplicação em box branco**
(p. 14), e o de Sergipe adota a mesma lógica de caixa quando o fundo
compromete a legibilidade. Então a régua vive num painel branco dentro do
rodapé escuro, e cada marca entra na sua versão original em cores sólidas.

O painel é branco puro nos dois temas, e o texto dentro dele fixa a tinta de
superfície clara. Deixar a tinta seguir o tema fazia o bloco inteiro ficar
cinza-claro sobre branco no tema escuro — o defeito foi encontrado na revisão
visual e está coberto por teste de contraste nos dois temas.

## 7. Derivados web criados

`scripts/derivar-marcas-institucionais.py`, determinístico, com manifesto em
`src/dados/institucional/marcas-derivadas.json`.

| Marca | Exibição | Arquivo | Bytes |
|---|---|---|---:|
| MinC + Governo Federal | 260×63 | `minc-governo-federal.webp` | 16.628 |
| PNAB | 110×56 | `pnab.webp` | 8.830 |
| FUNCAP | 153×46 | `funcap.webp` | 15.066 |
| Governo de Sergipe | 114×46 | `governo-de-sergipe.webp` | 12.658 |

- **WebP sem perda**, em 2× para tela de densidade dupla. Sem perda porque a
  arte é de cor chapada: a compressão com perda introduz franja em volta das
  formas, que é alteração de cor.
- A moldura transparente vazia do arquivo de origem é removida pela caixa
  delimitadora do alfa. **Não é recorte da marca**: é o que faz a proporção
  declarada ser a proporção da arte.
- Cores, proporção e transparência preservadas. Sem rotação, sem distorção,
  sem filtro, sem recolorir.
- O manifesto registra, por marca: origem no corpus, hash do original, hash do
  derivado, dimensões antes e depois, transformação e **a regra do manual que
  justifica a escolha**.

## 8. Ordem institucional final

```
APOIO                                  REALIZAÇÃO
[FUNCAP] [Governo de Sergipe]          [PNAB] │ [MinC + Governo Federal]
Governo do Estado de Sergipe           Política Nacional Aldir Blanc
Secretaria Especial da Cultura         Ministério da Cultura
FUNCAP — Fundação de Cultura e          Governo Federal
Arte Aperipê de Sergipe
```

Ascendente da esquerda para a direita; a assinatura Ministério da
Cultura/Governo Federal fecha o bloco à direita; o traço separa a PNAB dela.
A marca federal é a maior do bloco, a 260 px — acima do limite de redução de
200 px, e nenhuma outra ultrapassa a sua altura ou largura.

O projeto não tem nível próprio na régua: quem realiza está declarado ao lado
dela, no bloco de identidade do rodapé e na ficha da Prestação de Contas.
Tê-lo dentro produzia "Realização" duas vezes lado a lado, uma delas fora do
vocabulário do manual.

## 9. Uma fonte, dois consumidores

`componentes/institucional/creditos.ts` é a fonte única de entidades, rótulos,
ordem e ativos. O rodapé e `/prestacao-de-contas` servem o mesmo componente; a
Prestação usa a variante `destaque`, que só muda a escala. Um teste verifica
que nenhum dos dois escreve nome de entidade de fomento à mão.

## 10. Páginas cobertas

As **14 rotas públicas** com interface, verificado contra a lista de
`testes/a11y/rotas.ts` — inclusive a Home, que deixou de esconder o rodapé.
Uma exceção declarada e testada: `/prestacao-de-contas/imprimir`, cuja folha
de impressão esconde cabeçalho e rodapé de propósito.

Fora do rodapé, como sempre: `/anexos.json`, `robots.txt`, `sitemap.xml`, as
rotas de camada geográfica e `/dev`.

## 11. Acessibilidade

- `<footer>` semântico, com três regiões nomeadas: identidade, "Seções do
  site" e "Páginas institucionais", mais a seção de créditos.
- A régua é `<ol>`, porque a ordem é normativa: quem ouve recebe "2 de 2 —
  Realização", e não dois blocos soltos.
- `alt=""` nas marcas, com o nome de cada entidade em texto ao lado. Repetir o
  nome no `alt` faria o leitor de tela anunciar a entidade duas vezes.
  **Nenhuma informação institucional existe apenas dentro da imagem.**
- O traço do manual é `aria-hidden`: é regra de composição gráfica.
- Contraste AA verificado nos dois temas, dentro e fora do painel branco.
- Foco visível com contorno de 3 px em milho sobre a superfície escura.
- Traçado cartográfico de fundo em SVG inline, `aria-hidden`, estático.

## 12. Performance

Nenhum JavaScript novo. Server Component, CSS em string única importada de um
módulo, SVG inline de poucas centenas de bytes, nenhuma biblioteca.

As marcas carregam com `loading="lazy"`: elas ficam no fim de toda página,
muito abaixo da primeira dobra. Os 53 kB das quatro não entram na carga
inicial.

| Perfil normativo | Antes | Depois | Teto |
|---|---:|---:|---:|
| desktop 1440 DPR1 | 484.656 B | **486.132 B** | 500.000 B |
| mobile 375 DPR2 | 446.026 B | **447.502 B** | 500.000 B |

Custo do rodapé definitivo na carga inicial: **+1.476 B**, que é a marcação e
o CSS. Desktop DPR2, que é observabilidade e não trava, foi de 501.955 B para
503.431 B.

## 13. Validações

`pnpm verificar` completo, verde: **960 testes unitários** e **449 de
acessibilidade**.

Cobertura nova:

- `testes/marcas-institucionais.test.ts` — 43 testes sobre o contrato com os
  manuais: arquivo, bytes e hash de cada derivado; proporção preservada;
  limite de redução da marca federal; nenhuma marca ultrapassando a federal;
  ordem da régua; traço interno ao bloco; entidades nomeadas; ausência de
  filtro, transform, clip-path, opacity e mix-blend-mode sobre a marca;
  pendência declarada; fonte única entre rodapé e Prestação.
- `testes/a11y/rodape.spec.ts` — o rodapé em todas as rotas públicas; as
  quatro marcas carregando de fato; nenhuma exibida distorcida; a federal
  acima de 200 px também em 375 px; axe e contraste nos dois temas.

Varredura visual independente: **9 rotas × 3 larguras × 2 temas**, sem
overflow, sem marca quebrada e sem marca abaixo do limite de redução.

## 14. O que ainda depende do "nada a opor"

**A aprovação prévia da arte-final pela FUNCAP e pela Secretaria Especial da
Cultura.** O manual da PNAB Sergipe, orientação geral 2, determina que todo
material em arte-final criado para divulgação seja submetido às duas com no
mínimo **10 dias úteis** de antecedência, por e-mail — os endereços estão no
manual e **não** foram publicados no site, porque são canais de terceiros.

O que foi feito é aplicação conforme os manuais lidos; o que falta é o aceite
formal, e a superfície pública diz a diferença entre as duas coisas, em texto,
ao pé da régua.

Também dependem de decisão humana, e estão registrados acima:

- a divergência da Secretaria Especial da Cultura (§4, item 1) — citação em
  texto hoje, lockup disponível se exigirem marca;
- o manual do Governo de Sergipe pede que a redução seja **testada
  previamente** em material não impresso. O brasão está a 114 px de largura;
  o teste prévio, se exigido, é do órgão.
