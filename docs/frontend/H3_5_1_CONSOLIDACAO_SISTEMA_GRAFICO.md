# H3.5.1 — Consolidação do sistema gráfico vivo

**Data:** 2026-09-11

**Estado:** EM PROTÓTIPO — `/dev/linguagem-visual`, 404 em produção

**Home:** não alterada

**H4.0:** não alterada

**Baseline:** `f4d76e5` — feat: prototipa sistema grafico transversal

## 0. O que esta fase é, e o que ela não é

A H3.5 foi laboratório e cumpriu o papel: mostrou que o Observatório ganha
identidade quando rigor editorial, linguagem cartográfica, marcadores de
registro, pequenas assimetrias, grafismos da identidade e microinterações
funcionais aparecem juntos.

A H3.5.1 **não cria uma terceira linguagem**. Ela pega o que funcionou no
preset B, tira o excesso e transforma o resultado em sistema documentado, para
que a H4.5 e as fases seguintes reutilizem em vez de reinventar.

O alvo passa a ser **B refinado**. O preset A continua no laboratório, mas como
**controle**: ele existe para medir o que o sistema gráfico acrescenta, e não
como candidato equivalente numa decisão.

### Cronologia

A H4.0 foi prototipada **antes** da H3.5 e da H3.5.1, por ordem operacional.
Conceitualmente a ordem é a inversa: a H3.5.1 passa a ser a referência
transversal que a H4.5 deverá herdar. Nada da H4.0 foi alterado aqui.

## 1. Decisões humanas que esta fase executa

Duas decisões chegaram fechadas do responsável, e a fase as implementa. Elas
não estavam abertas nesta rodada.

**Carcará aprovado como grafismo da identidade.** Ele não é evidência
científica, zoológica ou territorial de presença da espécie nas áreas
pesquisadas. A formalização está na Direção Visual §11.1.

**Intensidade de movimento revisada de 3–4/10 para 4–5/10.** A revisão muda a
quantidade de resposta, não a natureza dela. A formalização está na Direção
Visual §12.1, e o registro das duas alterações em §31.1.

## 2. Refino do carcará

### 2.1 Escala

| | Antes (H3.5) | Depois (H3.5.1) | Variação |
|---|---:|---:|---:|
| Largura em ≥768 px | 144 px (9 rem) | **104 px (6,5 rem)** | −27,8% |
| Largura em <768 px | 60 px (3,75 rem) | **44 px (2,75 rem)** | −26,7% |
| Altura visível em ≥768 px | 240 px | 240 px | inalterada |

O número saiu da comparação visual, e não o contrário: as capturas do B antes e
depois foram postas lado a lado em 1440 e 375 px, nos dois temas, e 6,5 rem foi
o primeiro valor em que a ave parou de disputar hierarquia com o título e com a
fotografia sem sumir da página.

A ordem de leitura pretendida — conteúdo, títulos, mapa e fotografia, dados — e
só então a assinatura, é verificada por teste: a assinatura tem de medir menos
que **metade** da largura da fotografia da mesma página, e ao mesmo tempo pelo
menos 80 px. Em 1440 px ela mede 104 px contra 420 px da fotografia, ou seja
24,8% dela.

### 2.2 Frequência

A regra está escrita em `gramatica.ts` e é lida pelos testes:

> **Um carcará em escala editorial por página, e só em passagem entre
> capítulos.** Versões pequenas de assinatura são aceitáveis fora disso.

O laboratório passou a ter **duas** passagens justamente para exercitar a
regra. A primeira, `TERRITÓRIO → CAMPO`, carrega a assinatura. A segunda,
`CAMPO → LEITURA`, é feita só com grafismo cartográfico — fio e cruz de
registro — e prova que a continuidade entre capítulos **não depende do
carcará**.

O motivo da regra é direto: repetir o animal a cada seção transforma identidade
em personagem, e personagem é exatamente o que um site de prestação de contas
não pode ter.

### 2.3 Arte preservada

Nada foi redesenhado, recolorido, filtrado ou reduzido a ícone. O derivado
continua sendo o mesmo binário da H3.5 — `carcara-identidade-368.webp`, 29.954
bytes, hash `c8ef6799…` — e a mudança de tamanho é CSS sobre a mesma imagem.
Nenhuma derivação nova foi necessária.

## 3. Gramática de grafismos

Quatro famílias, cada uma com classe-raiz, papel declarado e teto de
frequência. A forma executável está em
`src/componentes/prototipo/linguagem/gramatica.ts`; os testes leem de lá, e não
de números repetidos à mão no componente.

| Família | Classe | Papel | Teto |
|---|---|---|---|
| **A. Identidade** | `lv-g-identidade` | assinatura da identidade visual; lembra de quem é a página, não ilustra o assunto | 1 por página, só em passagem |
| **B. Cartográfico** | `lv-g-cartografico` | régua do sistema; traz a precisão do desenho de mapa sem desenhar um mapa | sem teto |
| **C. Documental** | `lv-g-documental` | prova de que o conteúdo é registro; diz de onde a informação veio | sem teto |
| **D. Transição** | `lv-g-transicao` | liga uma seção à seguinte | sem teto |

Exemplos em uso no laboratório:

- **cartográfico**: fio de continuidade, cruz de registro, eixo sem série;
- **documental**: numeração `01 — Território`, ficha de metadados, legenda de
  fonte, divisor de registro;
- **transição**: as duas passagens.

As famílias B, C e D não têm teto porque são a régua do sistema: reprimi-las
produz página sem sistema nenhum. Só a identidade tem teto, porque só ela corre
o risco de virar mascote.

Um teste exige que **todas as quatro** apareçam em cada preset. Sistema
declarado e não usado é documentação morta.

## 4. Ritmo entre seções

O problema da H3.5 era o vazio entre capítulos: uma seção terminava, vinha um
intervalo morto, começava outra. Resolvido sem card, sombra, canto arredondado,
faixa pesada ou textura falsa.

O que foi feito:

1. **Fio único de continuidade.** No preset B, uma linha de 1 px desce a
   coluna inteira do artigo, atrás de todas as seções, e as passagens a
   engrossam. A página deixa de ser uma pilha de blocos e passa a ser um
   sistema editorial contínuo. Em telas abaixo de 768 px o fio é suprimido, por
   falta de margem para ele existir sem disputar com o texto.
2. **Segunda passagem.** `CAMPO → LEITURA`, mais curta que a primeira, com
   cruz de registro no lugar da assinatura.
3. **Numeração contínua.** `01 — Território`, `02 — Pesquisa em Campo`, e o
   ensaio identificado por rótulo, não por número — ele não é um capítulo de
   conteúdo.
4. **Temperatura.** As três superfícies de capítulo continuam a menos de 1,1:1
   do fundo. A mudança entre elas é perceptível como ambiente, nunca como
   bloco colorido.

## 5. Microinterações

Todas com propriedade animada declarada. `transition: all` é proibido, e um
teste varre a página inteira para garantir: qualquer elemento com duração acima
de zero tem de nomear a propriedade, e nenhuma duração passa de 300 ms.

| Alvo | Resposta | Propriedades animadas |
|---|---|---|
| Link | cor, sublinhado afasta-se de 4 px para 6 px, marcador desloca 4 px | `color`, `text-underline-offset`, `transform` |
| Fotografia | escala interna, e a linha da legenda assume a cor da marca | `transform`, `border-top-color` |
| Linha de ficha | borda esquerda aparece e o fundo ganha 6% de marca | `border-left-color`, `background-color` |

A escala da fotografia é **1,015 no preset A** e **1,025 no B** — dentro do teto
de 1,02–1,03. Fotografia documental não recebe tratamento agressivo: a imagem é
prova, e deformá-la seria mexer no documento.

A linha de ficha responde a `:hover` e nada mais. Ela não ganha cursor de
ponteiro nem papel interativo, porque não é clicável: o realce diz que aquele
metadado pertence a um sistema, e não que ele leva a algum lugar. Foco não se
aplica porque não há nada focável dentro dela — o que existe ali é texto.

Onde há foco, ele é atendido: o realce da legenda da fotografia responde a
`:focus-visible` do link, e não só a ponteiro.

## 6. Scroll reveal

Mantido da H3.5, já dentro dos limites pedidos.

| | |
|---|---|
| Técnica | `IntersectionObserver` numa ilha cliente única, marcando `data-revelado`; a animação é CSS |
| Duração | 240 ms (`--duracao-revelacao`) |
| Deslocamento | `translateY` de 10 px → 0 em ≥768 px, 8 px → 0 abaixo disso |
| Opacidade | 0,65 → 1 |
| Onde se aplica | só no preset B, e só em três blocos do capítulo de campo |
| Repetição | uma vez por elemento; o observador desinscreve depois de disparar |

**O conteúdo não depende da animação.** Ele nasce visível no HTML do servidor; o
observador só acrescenta a resposta de entrada. Página sem JavaScript, com
script quebrado ou sem `IntersectionObserver` entrega o mesmo texto, a mesma
fotografia e o mesmo mapa — e há teste que roda com o script desligado.

Nenhuma biblioteca de animação foi instalada. Nenhuma dependência foi
acrescentada.

## 7. Movimento reduzido

Com `prefers-reduced-motion: reduce`:

- a entrada de bloco não roda: `animation-name` fica `none`;
- o deslocamento de link e a escala de fotografia ficam em `none`;
- `--lv-revelar-distancia` vai a zero, de modo que nem o estado inicial existe;
- **nada fica invisível**: `opacity` é 1 e `transform` é `none` em todos os
  blocos reveláveis;
- nenhuma funcionalidade desaparece: os links, o `details` e a alternância A/B
  continuam operando.

O segundo item é o que costuma falhar em sistemas de reveal — a animação é
desligada, o estado inicial de opacidade fica, e o conteúdo some justamente
para quem mais precisa dele. O teste de regressão confere `animationName`,
`opacity` e `transform` nos dois presets, mais a presença do texto.

## 8. Guia de densidade visual

Três faixas, declaradas em `gramatica.ts` e verificadas por teste. O objetivo é
impedir que fases futuras apliquem o mesmo tratamento a tudo, que é o oposto de
hierarquia.

| Faixa | Onde se aplica | Grafismos permitidos | Movimento |
|---|---|---|---|
| **Baixa** | texto longo, manifesto, transcrição, nota metodológica | documental | só resposta a hover e foco |
| **Média** | seções institucionais, pesquisa em campo, dados e indicadores | documental, cartográfico | hover e foco, mais entrada única de bloco |
| **Alta** | abertura, mapa e passagens entre capítulos | documental, cartográfico, transição, identidade | entrada única de bloco e, no mapa, interação de intensidade própria |

A identidade só existe na faixa alta. Se ela vazar para a faixa de leitura
longa, o grafismo passa a disputar com a frase — e um teste trava exatamente
isso.

## 9. Preset A

Preservado e funcionando. Ele é o controle contido, e continua sendo a única
forma honesta de responder "o que o sistema gráfico acrescenta?".

O que a página diz agora, em texto visível e em teste:

- **A** — controle contido; existe para medir o que o sistema gráfico
  acrescenta;
- **B** — B refinado; é a direção recomendada pela H3.5.1.

O laboratório abre no **B**, que é a recomendação. Antes ele abria no A, quando
os dois ainda eram candidatos.

## 10. Isolamento

### Home

Não alterada. Nenhum arquivo da Home entrou no diff, e há teste de navegador
que carrega `/` e confere: nenhuma classe `lv-g-*`, nenhum `.linguagem-visual`,
nenhum papel `--lv-*` resolvido no corpo, e nenhuma referência a
`/media/grafismos/` no HTML.

### H4.0

Não alterada. Nenhum arquivo dela entrou no diff. Além disso, testes unitários
conferem o acoplamento nos dois sentidos: os cinco arquivos do laboratório não
importam nada de `prototipo/dados` nem de `dados/indicadores`, os sete arquivos
da H4.0 não importam nada de `linguagem/` e não usam classe `lv-g-`, e o CSS da
H4.0 não lê nenhum papel `--lv-`.

Um teste de navegador carrega `/dev/dados` e confirma o mesmo no runtime.
**Nenhuma alteração compartilhada desta fase afeta visualmente `/dev/dados`.**

### Rota

- 404 em produção, por guarda no componente de página, com teste nas duas
  pontas;
- `robots: { index: false, follow: false }`;
- fora do `sitemap.xml`, coberta por `Disallow: /dev/` no `robots.txt`;
- nenhuma requisição externa e nenhum recurso privado.

## 11. Performance

| Medida | Antes (H3.5) | Depois (H3.5.1) |
|---|---:|---:|
| Derivado do carcará | 29.954 B | 29.954 B, inalterado |
| CSS do laboratório | 7.061 B | 9.372 B |
| Ilhas cliente novas no laboratório | 1 | 1, a mesma |
| JavaScript acrescentado | — | **0 B** |
| Dependências novas | — | **nenhuma** |
| Nós de DOM por preset | — | 167 |
| Nós de DOM da página | — | 444 |

O CSS cresceu 2.311 B, e boa parte disso são os comentários que organizam o
arquivo pelas quatro famílias. Ele vive num `<style>` da própria rota e não
entra em nenhum bundle compartilhado.

**Zero JavaScript acrescentado** não é estimativa. A gramática, o guia de
densidade e o CSS são módulos de servidor: uma varredura nos 17 `chunks`
estáticos do build de produção não encontra `GRAMATICA_DE_GRAFISMOS`,
`DENSIDADE_VISUAL`, `maximoEmEscalaEditorial`, `lv-g-identidade` nem
`CSS_DA_LINGUAGEM`. O laboratório carrega 552.767 B de JavaScript compartilhado
— o mesmo que `/dev/dados` e menos que uma página de conteúdo comum, que carrega
578.435 B.

A Home não foi degradada porque não foi tocada.

## 12. Acessibilidade

Conferido em 320, 375, 768 e 1440 px, temas claro e escuro, nos dois presets:

- **sem transbordo horizontal** em nenhuma combinação, inclusive com zoom de
  200% a 750 px;
- **contraste**: o gatilho da Central de Acessibilidade passa AA nos dois temas;
  o corpo e o metadado de ficha continuam passando;
- **teclado**: alternância A/B por seta, `details` por Enter, ordem de foco sem
  salto, contorno de 3 px preservado;
- **foco**: a fotografia é focável e o realce da legenda responde a foco, não
  só a ponteiro;
- **decorativos**: assinatura, fio, eixos e cruz de registro com
  `aria-hidden="true"` e `pointer-events: none`. O leitor de tela não anuncia
  "carcará" nenhuma vez;
- **legenda editorial**: "Carcará · grafismo da identidade" é texto visível e
  anunciável, separado da imagem decorativa. A semântica e o visual não se
  confundem;
- **movimento reduzido**: ver §7.

## 13. Testes

| Gate | Resultado |
|---|---|
| `pnpm tipos` | passa |
| `pnpm lint` | passa, com os mesmos 4 avisos de prioridade forçada já conhecidos |
| `pnpm teste` | 449 passam, 3 pulados |
| `pnpm a11y` | 239 passam |
| `pnpm build` | passa; 24 rotas estáticas |
| `pnpm pendencias` | **não atestado** — sem `DATABASE_URL` nesta máquina, nada foi consultado |

O `pendencias` sai com código zero por decisão do próprio script, que prefere
seguir fora do CI a falhar em máquina sem credencial. **Código zero aqui não é
prova de banco**: nada foi verificado.

Testes novos desta fase:

- as quatro famílias estão declaradas, com classe e papel próprios;
- cada preset usa todas as famílias e respeita o teto de cada uma;
- duas passagens por página, e só a primeira assina;
- a assinatura é decorativa, sem `alt`, e não intercepta ponteiro;
- a assinatura mede menos que metade da fotografia e mais que 80 px;
- A continua disponível, a recomendação é o B, e o laboratório abre no B;
- o guia de densidade reserva a identidade para a faixa alta;
- durações ficam em 300 ms ou menos, nada roda em laço, nada usa
  `transition: all`;
- com movimento reduzido nada anima e nada some;
- a Home não recebe nada do laboratório;
- o painel da H4.0 continua fora do alcance do laboratório;
- os arquivos do laboratório e os da H4.0 não se importam nos dois sentidos.

## 14. Inspeção visual

Capturas de página inteira **e de viewport**, porque o cabeçalho é fixo e a
captura de página inteira sozinha não prova layout:

- B refinado em 1440 claro, 1440 escuro, 768 claro, 375 claro, 375 escuro e
  320 claro;
- comparação A × B refinado em 1440, nos dois temas;
- movimento em três estados: inicial, depois do reveal, e com movimento
  reduzido;
- o conjunto anterior à fase, preservado para a comparação antes/depois.

Os PNGs ficam fora do repositório. A prova versionada são os testes.

## 15. Riscos e pendências

1. **Dívida H4.0 ↔ H3.5.1.** O painel de indicadores ainda não fala esta
   língua. Reconciliar é trabalho da H4.5, que herda a gramática e o guia de
   densidade daqui. Nada da H4.0 foi alterado nesta fase.
2. **A Home ainda não usa o sistema.** A aplicação transversal é decisão
   posterior à H4.5, por instrução desta rodada.
3. **Grafismos continuam não recoloráveis.** Cinco dos seis "SVG" da identidade
   são PNG em base64 dentro de invólucro. Qualquer uso futuro que precise
   acompanhar o tema exige arquivo novo de quem assina a identidade.
4. **Cacto e igreja continuam fora.** Eles entram quando houver conteúdo que os
   convoque, pela mesma regra de função editorial que admitiu o carcará como
   assinatura.
5. **Central de Acessibilidade ainda pinta por estilo inline.** Toda superfície
   clara que a receber terá de redefinir `--hero-texto`. A correção de fundo é
   do componente e continua fora de escopo.
6. **Lighthouse continua indisponível**, e a dívida segue registrada para a H7.
   As medidas de §11 são de build e de DOM, não de campo.
