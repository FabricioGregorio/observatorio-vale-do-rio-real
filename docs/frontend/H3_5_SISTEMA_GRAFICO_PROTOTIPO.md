# H3.5 — Sistema gráfico e motion transversal: auditoria e protótipo

**Data:** 2026-09-11

**Estado:** EM PROTÓTIPO — `/dev/linguagem-visual`, 404 em produção

**Home:** não alterada

**Baseline:** `979ecb3` — feat: prototipa dados e indicadores

## 0. Ordem cronológica: a H3.5 veio depois da H4.0

Esta fase foi executada **depois** da H4.0, e não antes. A H4.0 rodou fora de
ordem, e a decisão do responsável foi preservar integralmente o trabalho dela
em vez de refazê-lo.

Conceitualmente a H3.5 continua sendo a camada anterior: ela é o sistema
gráfico transversal que atravessa H1, H2 e H3, e é dele que a H4.5 vai herdar
o tratamento visual dos indicadores. Na prática, isso significa que existe uma
dívida declarada — o painel da H4.0 ainda não fala a língua proposta aqui, e o
encontro das duas coisas é trabalho da H4.5.

O que esta fase **não** fez, por instrução explícita:

- não refez, redesenhou ou reclassificou nada da H4.0;
- não alterou valores, datasets, cálculos, gráficos ou classificação de
  publicação da H4.0;
- não integrou H4 à Home;
- não iniciou a H4.5;
- não alterou o commit `979ecb3` nem o histórico anterior.

A H4.0 foi **lida**, para garantir compatibilidade futura, e a seção 9 registra
o que dessa leitura vira restrição para a H4.5.

## 1. Escopo

A H3.5 responde a uma pergunta só: **o site tem uma linguagem visual própria,
ou tem três seções bem resolvidas que não se reconhecem entre si?**

O que está em escopo:

- auditoria técnica dos grafismos da identidade, que nunca tinham sido medidos
  como candidatos a uso real;
- papéis de superfície, linha, respiro e escala que valem para território,
  campo e leitura — não para uma seção só;
- a passagem entre capítulos, que hoje não existe: H1, H2 e H3 se encostam sem
  transição;
- intensidade de movimento, com dois tratamentos comparáveis lado a lado.

O que está fora:

- a Home, que não foi tocada;
- os laboratórios H1, H2, H3 e H4.0, que não foram tocados;
- qualquer decisão sobre indicadores, número ou gráfico.

## 2. Auditoria dos grafismos da identidade

Medição sobre o corpus externo apontado por `OBSERVATORIO_FONTES_DIR`. O
caminho absoluto não é registrado aqui nem chega ao código. Nenhum original foi
copiado para o repositório.

A auditoria confirmou, arquivo por arquivo, o Achado Crítico 1 do
`PLANO_HOME_PILOTO_1_0.md` §4.3: os "SVG" da biblioteca iconográfica não são
vetores.

| Arquivo | Bytes | SHA-256 (16) | Natureza medida | viewBox | Tamanho declarado | Raster embutido | Alfa |
|---|---:|---|---|---|---|---|---|
| `elementos visuais e graficos/carcará.svg` | 91.034 | `1900a7fcbfa5294d` | PNG embutido em SVG | `0 0 276 525.750006` | 368x701 | 398x759 | sim |
| `elementos visuais e graficos/cactus.svg` | 130.974 | `f0c29e83dd2cfb67` | PNG embutido em SVG | `0 0 359.25 653.249998` | 479x871 | 300x546 | sim |
| `elementos visuais e graficos/igreja.svg` | 41.390 | `826184784b32cfd4` | PNG embutido em SVG | `0 0 415.5 413.999985` | 554x552 | 623x620 | sim |
| `elementos visuais e graficos/logo observatorio.svg` | 704.083 | `17db6c7f7056c9c5` | PNG embutido em SVG | `0 0 995.25 962.249975` | 1327x1283 | 2400x2400 | sim |
| `observatorio/icon.svg` | 704.574 | `f19d71e2ed22bfc1` | PNG embutido em SVG | `0 0 810 1012.49997` | 1080x1350 | 2400x2400 | sim |
| `observatorio/horizontal-monocromatica-escura.svg` | 31.520 | `8bda07efbe684aaa` | **vetor real** | `0 0 1600 900` | 1600x900 | — | sim |

Consequências que a H3.5 aceita como dadas:

- **nenhum grafismo é recolorável.** `currentColor` e token de cor não alcançam
  pixel embutido. Quem quiser grafismo que acompanhe o tema precisa de arquivo
  novo, e arquivo novo é decisão de quem assina a identidade;
- **nenhum grafismo escala.** Ampliar serrilha. O tamanho de uso tem teto;
- **o invólucro não pode ir para o bundle.** 91 KB de base64 para desenhar uma
  ave de 9 rem é desperdício, e os dois arquivos de 704 KB estão acima do
  orçamento inteiro da Home.

A leitura das cores dominantes confirma que os três elementos territoriais têm
paleta própria, terrosa, que **não** é a paleta institucional: carcará em
`#342a21`, `#f1ead0` e `#8d7a5a`; cacto em `#495a4a`, `#5d7055` e `#314a4b`;
igreja em `#f2f2f2`, `#b5b6b9` e `#252325`. Eles convivem com o teal
institucional, mas não derivam dele.

## 3. O que entrou no bundle, e por que só isso

Um arquivo:

| Derivado | Dimensões | Bytes | SHA-256 | Qualidade |
|---|---|---:|---|---|
| `media/grafismos/carcara-identidade-368.webp` | 368x701 | 29.954 | `c8ef6799982227cd3f6bb10c9a4c904daf2ac6faaf188532a59676f72320ff05` | 0,82 |

Procedência declarada em `src/dados/grafismos/derivados.ts`, no mesmo contrato
que já vale para o Hero e para as fotografias de campo: arquivo, bytes, hash,
hash do original, transformação aplicada e metadados removidos.

**A transformação é rasterização e nada mais.** O tamanho de saída não foi
escolhido: é o `width="368" height="701"` que o próprio arquivo declara. Sem
recorte, sem recoloração, sem redesenho. O derivado é gerado por
`pnpm derivar-grafismos`, que confere o hash do original antes de transformar e
aborta se o SVG referenciar recurso externo.

Cacto e igreja **não** entraram. Eles não têm, nesta fase, conteúdo que os
convoque: a Direção Visual §11 condiciona o uso à função editorial, e "ficou
bonito" não é função editorial.

### 3.1 O carcará é assinatura, não avistamento

Esta é a decisão mais delicada da fase, e ela fica registrada como decisão, não
como fato consumado.

A Direção Visual §11 mapeia `carcará → fauna/território quando houver contexto
real`. **Não há contexto real.** Nenhum documento do projeto registra
avistamento da ave em qualquer município do recorte, e inventar um seria
exatamente o tipo de dado falso que o `AGENTS.md` proíbe.

O protótipo usa o carcará por outra leitura da mesma seção: ele também é
listado ali como "elementos e marcas da identidade". Entra como **assinatura
visual da identidade**, na passagem entre o mapa e o campo, sempre com:

- `alt=""` e `aria-hidden="true"` — é decorativo, e o conteúdo não depende dele;
- `pointer-events: none` — não intercepta clique nem foco;
- legenda literal "Carcará · grafismo da identidade", que diz de onde ele vem.

Um teste unitário trava a legenda contra as palavras "avistamento", "registro",
"fotografia", "espécie", "habitat" e "observado".

**Isto precisa de confirmação humana antes de qualquer integração à Home.** Se
a leitura correta da Direção Visual §11 for a estrita — grafismo de fauna só
com contexto real, e ponto — a passagem funciona sem ele: o fio e a regra
vertical seguram a transição sozinhos, e basta remover o bloco da assinatura.

## 4. Papéis transversais

Os papéis novos vivem em `src/estilos/tokens.css`, seção 7, sob o seletor
`.linguagem-visual`. **Nenhum consumidor de H1 a H4.0 lê esses nomes**: o
alcance fecha na raiz do laboratório.

| Papel | Valor | O que resolve |
|---|---|---|
| `--lv-superficie-territorio` | fundo + 4% marca | dá ao capítulo cartográfico uma superfície própria, sem virar bloco colorido |
| `--lv-superficie-campo` | fundo + 3% acento | separa o capítulo de registro do de território por temperatura, não por régua |
| `--lv-superficie-ensaio` | fundo + 4% link | reserva a terceira superfície para leitura de dado |
| `--lv-linha` | borda-forte a 60% | fronteira única para ficha, tabela, legenda e fio |
| `--lv-capitulo`, `--lv-respiro`, `--lv-margem` | `clamp()` | respiro que cresce com a viewport sem breakpoint |
| `--lv-ave-contida`, `--lv-ave-viva` | 2,75rem / 9rem | teto de tamanho do grafismo, que é raster e não escala |
| `--lv-passagem` | 15rem | altura da transição entre capítulos |
| `--lv-revelar-distancia`, `--lv-escala-a`, `--lv-escala-b` | 10px / 1,015 / 1,025 | amplitude de movimento, por preset |

Todas as cores saem de `color-mix()` sobre papéis semânticos existentes, o que
as mantém corretas nos dois temas sem uma segunda tabela de valores.

O bloco fica **no fim** do arquivo, de propósito. A primeira ocorrência de cada
media query do documento precisa continuar sendo a do tema: os testes de tema
recortam blocos por primeira ocorrência do seletor, e um
`@media (prefers-reduced-motion: reduce)` novo no topo do arquivo os quebra sem
quebrar nada visível.

## 5. Presets A e B

O mesmo conteúdo aprovado, a mesma geometria oficial do mapa, dois tratamentos.
A alternância é `input[type=radio]` mais `:has()`: **funciona sem JavaScript**,
e há teste que roda com o script desligado para provar.

| Dimensão | A — Contido | B — Vivo |
|---|---|---|
| Assinatura do carcará | 2,75rem, ao lado do texto | 9rem, recortada na altura da passagem |
| Passagem entre capítulos | fio pontilhado neutro | fio na cor da marca, mais regra vertical |
| Fichas e títulos | sem marcação lateral | regra de 1px na marca, com recuo |
| Escala na fotografia em hover/foco | 1,015 | 1,025 |
| Entrada dos blocos | nenhuma | 240ms, uma vez, só em `no-preference` |

### 5.1 Intensidade de movimento: a tensão que fica aberta

A Direção Visual §12.1 fixa o site geral em **3–4/10**. O preset A está nessa
faixa. O preset B propõe **5/10**, e portanto **está acima da direção vigente**.

Isso é proposital e é o ponto do A/B: o B existe para que a diferença seja
vista, e não argumentada no abstrato. Mas escolher o B não é escolha de gosto —
é revisão da Direção Visual, e revisão de direção não é atribuição do agente.
**Fica para decisão humana.**

Nenhum dos dois presets passa de 240ms, nenhum anima na entrada da página, e
nenhum anima nada sob `prefers-reduced-motion: reduce`.

## 6. JavaScript

Uma ilha, de 39 linhas: `RevelacaoVisual`. Ela existe porque CSS não sabe
disparar entrada única com duração fixa quando o elemento aparece.

O que ela **não** faz: o conteúdo nasce visível. O observador só acrescenta a
resposta de entrada, e apenas no preset B. Página sem script, script com erro
ou `IntersectionObserver` ausente entregam o mesmo texto, a mesma fotografia e
o mesmo mapa. Ela também reage a mudança de preferência em tempo real: quem
liga movimento reduzido com a página aberta para de receber entradas.

O restante é Server Component. O mapa continua sendo SVG montado no servidor,
com os mesmos 75 caminhos da geometria oficial do IBGE, e um teste confere
caminho por caminho que nenhum deles foi redesenhado.

## 7. Acessibilidade

- **Contraste.** As três superfícies novas ficam a menos de 1,1:1 do fundo —
  separação decorativa, no mesmo regime de `--color-borda`. O texto continua
  lendo os papéis semânticos, e o corpo passa AA nos dois temas.
- **Gatilho da Central de Acessibilidade.** Defeito encontrado e corrigido
  nesta fase; ver seção 8.
- **Teclado.** Alternância A/B por seta, `details` por Enter, ordem de foco sem
  salto, contorno de 3px preservado.
- **Decorativos.** Assinatura, fio e eixos com `aria-hidden="true"` e
  `pointer-events: none`. Teste confere os três.
- **Zoom 200%.** Sem transbordo horizontal nos dois presets.
- **Movimento reduzido.** Entrada, escala de hover e deslocamento de link
  zerados. O `!important` do projeto continua sendo os mesmos quatro, todos no
  bloco de movimento reduzido do tema.
- **Viewports.** 320, 375, 768 e 1440 px, nos dois temas, sem transbordo.

## 8. Correções em arquivo compartilhado

Duas, ambas neutras para H1–H4.0, e ambas registradas porque tocam arquivo que
não é só desta fase.

**1. Ordem do bloco em `tokens.css`.** O bloco da H3.5 nascera no topo do
arquivo, antes da definição do tema. Isso quebrou dois testes de tema que
recortam blocos por primeira ocorrência do seletor: eles passaram a ler o
`@media (prefers-reduced-motion: reduce)` do laboratório em vez do do site. O
bloco foi movido para o fim do arquivo. Nenhum valor mudou; nenhum consumidor
mudou.

**2. `--hero-texto` redefinido na raiz do laboratório.** A Central de
Acessibilidade nasceu dentro do cabeçalho escuro do protótipo e pinta o gatilho
com `var(--hero-texto)` **por estilo inline**. Trazida para a barra de
controles do laboratório, que fica sobre superfície clara, ela media **1,1:1** —
o controle de acessibilidade da página estava invisível. Estilo inline não se
sobrescreve por CSS sem `!important`, e o `!important` deste projeto pertence
ao bloco de movimento reduzido; redefinir o papel na raiz do laboratório foi o
caminho disponível. O gatilho passou a medir **15,5:1** no tema claro, e há
teste de regressão nos dois temas.

O defeito existe também nos outros laboratórios? Não: em H1, H2, H3 e H4.0 a
Central vive dentro do cabeçalho escuro, que é o contexto para o qual ela foi
escrita. O problema aparece na primeira vez que ela é usada fora dele. Quem
levar a Central para superfície clara em qualquer outra rota precisa fazer o
mesmo — ou o componente precisa deixar de depender de estilo inline, que é
mudança fora do escopo desta fase.

## 9. Compatibilidade com a H4.0, sem tocar nela

O painel da H4.0 foi lido e **não** foi alterado. O que a leitura produziu:

- a terceira superfície, `--lv-superficie-ensaio`, já está reservada para o
  capítulo de leitura de dado. Ela existe para que a H4.5 não precise inventar
  uma quarta;
- o ensaio de linguagem do laboratório monta a **estrutura** de um capítulo de
  indicador — cabeçalho, eixo, tabela de campos — e **nenhum número**. Ele
  declara "Nenhum indicador é apresentado neste ensaio", e um teste trava a
  ausência de código de fonte, valor ou série;
- os papéis de linha e respiro da H3.5 são compatíveis com o desenho existente
  dos gráficos da H4.0; nada no painel precisaria ser redesenhado para adotá-los.

Nenhum conflito real foi encontrado entre H3.5 e H4.0. Nenhum arquivo da H4.0
aparece no diff desta fase.

## 10. Isolamento da rota

- 404 em produção, por guarda no próprio componente de página, com teste
  unitário que exercita as duas pontas;
- `robots: { index: false, follow: false }` no metadata;
- fora do `sitemap.xml`; coberta por `Disallow: /dev/` no `robots.txt`;
- nenhuma requisição externa e nenhum recurso privado — teste grava todas as
  requisições da página e confere;
- o CSS do laboratório vive num `<style>` da própria rota, atrás de seletores
  `.lv-*`, e não alcança a Home nem os outros laboratórios.

## 11. Testes

| Gate | Resultado |
|---|---|
| `pnpm tipos` | passa |
| `pnpm lint` | passa, com os mesmos 4 avisos de `!important` já conhecidos |
| `pnpm teste` | 428 passam, 3 pulados |
| `pnpm a11y` | 233 passam |
| `pnpm pendencias` | sem `DATABASE_URL` nesta máquina; nada consultado, nada atestado |

Testes novos desta fase:

- guarda de produção, nas duas pontas;
- os dois presets projetam 75 caminhos e só fatos aprovados, sem código de
  fonte, sem coordenada, sem `data:image`, sem URL externa;
- a pasta de grafismos contém só o que está declarado;
- o derivado conserva hash, peso, alfa, dimensão gravada no `VP8X` e ausência
  de `EXIF`/`XMP`;
- a legenda do grafismo não alega avistamento;
- A/B, leitura e ausência de transbordo em 4 larguras x 2 temas;
- teclado, `details`, foco, decorativos sem interceptação;
- entrada única, hidratação sem erro, hover e troca de preferência ao vivo;
- zoom de 200% com movimento reduzido nos dois presets;
- sem recurso externo, fora do sitemap, bloqueada no robots;
- alternância A/B sem JavaScript;
- gatilho de acessibilidade em AA nos dois temas.

## 12. Inspeção visual

Capturas de página inteira em 1440, 768, 375 e 320 px, temas claro e escuro,
nos dois presets. Os PNGs ficam fora do repositório, junto com o inventário
bruto da auditoria de assets, e não são prova versionada: a prova versionada
são os testes acima.

## 13. Riscos e decisões pendentes

1. **Uso do carcará** (§3.1). Decisão humana. Ou se aceita a leitura de
   assinatura de identidade, ou a passagem segue sem ele.
2. **Intensidade 5/10 do preset B** (§5.1). Adotar o B é revisar a Direção
   Visual §12.1. Decisão humana.
3. **Grafismos não recoloráveis** (§2). Qualquer uso futuro que precise
   acompanhar o tema exige arquivo novo de quem assina a identidade. Não é
   trabalho de agente.
4. **Dívida H4.0 ↔ H3.5.** O painel de indicadores ainda não fala esta língua.
   Reconciliar é trabalho da H4.5, e nada da H4.0 foi alterado aqui.
5. **Dependência da Central de Acessibilidade em estilo inline** (§8). Enquanto
   o gatilho pintar por estilo inline, toda superfície clara que o receber terá
   de redefinir `--hero-texto`. A correção de fundo é do componente, e está
   fora do escopo desta fase.
6. **`public/media/LEIA-ME.md` está desatualizado.** Ele descreve a pasta como
   "vazia de propósito" e lista cinco subpastas; hoje são sete, com conteúdo. A
   defasagem começou na H1, não nesta fase, e corrigi-la aqui misturaria duas
   tarefas.
