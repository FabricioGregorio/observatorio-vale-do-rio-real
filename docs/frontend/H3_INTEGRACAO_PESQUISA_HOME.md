# H3 — Integração da Pesquisa em Campo na Home

**Data:** 2026-09-10

**Estado:** implementada e validada localmente; não publicada

**Baselines:** ad86097 — feat: prototipa pesquisa em campo (H3.1);
9d0f13f — feat: integra pesquisa em campo na home (H3.2)

**Rodadas:** H3.1 integrou o Preset A na Home. H3.2 revisou a composição, que
foi **aprovada sem redesenho**, e fez o acabamento editorial mais o
diagnóstico do cabeçalho fixo. As seções abaixo já refletem a H3.2.

## 1. Decisão aplicada

O responsável escolheu o **Preset A — Documental aberto** e aprovou três
textos: o título estrutural `02 — PESQUISA EM CAMPO`, o título editorial "O
campo como documento" e o título do bloco de leitura "Da abstração do mapa à
materialidade do território". O Preset B não entra na Home e continua existindo
apenas no laboratório.

A sequência da página passa a ser Hero, 01 — Território, 02 — Pesquisa em
Campo, caminhos prioritários e acervo. Hero, cabeçalho, mapa, fotografia do
Hero, marcas e infraestrutura não foram tocados.

## 2. Arquitetura compartilhada

A Home continua Server Component e a seção não adiciona nenhum Client
Component: não há seleção, carrossel, autoplay, parallax ou reveal. A
quantidade de arquivos com `"use client"` no repositório é a mesma de antes.

Laboratório e Home usam a mesma implementação, como já acontece no Território.
A entrada pública `src/componentes/pesquisa/PesquisaEmCampo.tsx` fixa a
composição A e o contexto Home; o `contexto` do componente compartilhado decide
apenas o que é rótulo de desenvolvimento. Os estilos foram para
`src/componentes/pesquisa/`, pela mesma razão registrada na H2.1: evitar
duplicar na Home a implementação que vive em `prototipo/`.

A regra do rótulo de proposta ficou em uma constante separada, injetada só no
laboratório. Assim o HTML público não carrega nem o seletor morto — quem
procurar "proposta" ou "somente DEV" no conteúdo servido não encontra nada, e
um teste verifica exatamente isso.

O cabeçalho da seção usa `div`, e não `header`. Um `header` aninhado em
`section` não vira landmark de banner, então não acrescentaria semântica, mas
criaria um segundo `<header>` visível na Home. O Território já usa `div` pelo
mesmo motivo.

## 3. A copy, versão por versão, e o que sustenta cada afirmação

Três blocos de texto passaram por duas rodadas. A regra que atravessa as duas é
a mesma: **a seção é editorial, não é laudo**. O controle de privacidade
continua inteiro nos bastidores, e é o teste dos derivados que o vigia; o que
saiu foi a linguagem de gate dentro da narrativa pública.

### 3.1 Introdução da seção

| Rodada | Texto |
|---|---|
| protótipo | "Três registros sem pessoas identificáveis aproximam a cartografia da presença física: chegada por água, arquitetura e uma atividade em área coberta." |
| H3.1 | "A pesquisa foi a campo, e o registro fotográfico é parte do que ela produziu. As imagens desta seção vêm do acervo do projeto e são publicadas sem pessoa identificável." |
| **H3.2, vigente** | **"A pesquisa foi a campo e fotografou o que encontrou. As imagens desta seção pertencem ao acervo do projeto e documentam lugares onde o trabalho aconteceu."** |

A versão do protótipo lia como nota de auditoria e dependia do número de
imagens. A da H3.1 resolveu isso, mas ainda trazia "sem pessoa identificável"
para dentro da narrativa: uma política de publicação virava mensagem editorial
da seção. A versão vigente não menciona quantidade, privacidade, autorização,
auditoria nem gate de publicação.

| Afirmação vigente | O que a sustenta |
|---|---|
| a pesquisa foi a campo | relatórios técnicos de visita, entrevistas gravadas com local declarado e o próprio conjunto fotográfico do acervo |
| e fotografou o que encontrou | o conjunto fotográfico de campo auditado na H3, dentro do corpus canônico |
| as imagens pertencem ao acervo do projeto | os três derivados têm original, hash e caminho registrados em `src/dados/pesquisa/derivados.ts` |
| documentam lugares onde o trabalho aconteceu | Ilha Grande tem entrevista e registros fotográficos próprios no corpus |

Nenhuma data, técnica por local, pessoa, coordenada, município ou visita foi
criada em nenhuma das versões.

### 3.2 Bloco "Leitura do registro"

O rótulo e o título continuam como aprovados: `LEITURA DO REGISTRO` e "Da
abstração do mapa à materialidade do território".

| Rodada | Parágrafo |
|---|---|
| H3.1 | "As fotografias deste recorte estão documentadas como Ilha Grande. A data das imagens não está confirmada e, por isso, não é inferida a partir de entrevistas, relatórios ou metadados do arquivo." |
| **H3.2, vigente** | **"Os registros desta seção são de Ilha Grande, um dos lugares onde a pesquisa esteve."** |

O que interessa a quem visita é onde e quando. O onde ficou na frase; o quando
virou campo de ficha. A explicação de por que a data **não é inferida** saiu da
narrativa e continua aqui, no registro técnico: a data não é deduzida de
entrevista, relatório ou metadado de arquivo, porque nenhuma dessas fontes
data a fotografia.

"um dos lugares onde a pesquisa esteve" é sustentado e deliberadamente não
enumera os demais locais — enumerar traria à Home um relatório que continua
fora do lote público.

### 3.3 Ficha do registro

A ficha na coluna de leitura passou a ter dois campos, e substituiu a linha
solta que repetia o mesmo metadado das legendas:

```
LOCAL   Ilha Grande
DATA    Não informada
```

A ausência de data é declarada como campo, que é o lugar dela. `Tipo de
registro` e `Fonte` continuam existindo apenas no Preset B do laboratório —
**`Fonte` nomeia o conjunto documental restrito e nunca acompanha a composição
publicada.** As legendas das três fotografias seguem trazendo local, ausência
de data e tipo de registro em IBM Plex Mono.

### 3.4 Bloco de método — aprovado

O bloco estava marcado como *precisa aprovação* desde o protótipo. **Foi
aprovado em 2026-09-10**, com a condição de comunicar a pluralidade das fontes
em caráter transversal, sem atribuir todas as técnicas a todos os lugares, e em
registro editorial em vez de defensivo.

| Rodada | Texto |
|---|---|
| H3.1 | "O corpus do projeto reúne registros fotográficos, entrevistas gravadas e formulários de resposta. Esta síntese não atribui todas as técnicas a todos os locais." |
| **H3.2, vigente** | **"A pesquisa reúne fotografia, entrevista gravada e formulário de resposta. Nem todo lugar recebeu as três."** |

O rótulo `MÉTODO · SÍNTESE TRANSVERSAL` permanece em IBM Plex Mono. A segunda
frase diz o mesmo limite da anterior sem falar sobre si mesma: quem lê entende
que as técnicas descrevem o conjunto da pesquisa, não cada local.

Sustentação: o corpus reúne fotografias de campo, oito pares de áudio e
transcrição de entrevista e planilhas de resposta de formulário; e os conjuntos
por local não são iguais entre si.

## 4. Situação documental dos três títulos

Nenhum dos três é topônimo. Todos são legenda descritiva, e é assim que a Home
os apresenta: o lugar aparece em campo próprio — "Ilha Grande" — separado do
título.

| Título no protótipo | Sustentação no corpus | Natureza | Decisão |
|---|---|---|---|
| Igrejinha | nome do arquivo original, `fotos/ilha-grande/igrejinha.jpg` | nome dado no corpus a um arquivo; **nenhum documento lido registra "Igrejinha" como nome de lugar** | **trocado por "Fachada de igreja"**, descrição do que a fotografia mostra |
| Chegada por água | arquivo `chegando-a-ilha-grande-de-barco.png`; a cena é a margem vista da água | descrição editorial, reescrita de "de barco" | mantido |
| Atividade no forno a lenha | arquivo `forno-a-lenha2.png`; a atividade vem da inspeção visual da cena | descrição editorial | mantido |

"Igrejinha" era o único com risco real de ser lido como nome de lugar, e por
isso saiu da interface. O nome de arquivo continua em `id` e em
`original.arquivo`, que é onde a procedência deve viver — trocar a legenda não
apaga o rastro do original.

## 5. O que não aparece na Home

- **B01** continua RESTRITO como conjunto. O identificador, o título interno
  "fotografias de comprovação", a URL e o arquivo **não** chegam ao HTML. A
  ficha documental que exibia a fonte pertence só ao Preset B, que é de
  laboratório. Não existe regra documental que autorize publicar metadado de
  B01, e nenhuma foi inventada: a fonte restrita sustentou a validação interna
  sem aparecer na interface.
- **A04** permanece fora do lote público. Nem o código, nem o título, nem o
  caminho `relatorio-tecnico-serra-dos-macacos` aparecem na Home, no bundle ou
  em metadado público. O nome "Serra dos Macacos" que existe na página é o
  ponto sem coordenada da seção Território, anterior a esta tarefa, e não
  referencia o relatório.
- **A03** continua restrito e não foi tocado.
- Nenhum rótulo `Preset`, `somente DEV` ou `proposta`.

Verificação sobre o servidor de produção local: zero ocorrências de `B01`,
`A04`, `fotografias de comprovação`, `relatorio-tecnico-serra-dos-macacos`,
`proposta`, `somente DEV`, `Preset` e `Igrejinha` no HTML da Home e nos chunks
de JavaScript que ela carrega.

## 6. Revalidação dos derivados

Feita antes de integrar, sobre os arquivos versionados:

| Derivado | Bytes | SHA-256 confere | Chunks WebP | EXIF/XMP/GPS |
|---|---:|---|---|---|
| `ilha-grande-chegada-barco-410.webp` | 31.842 | sim | VP8X, ICCP, VP8 | ausentes |
| `ilha-grande-forno-lenha-412.webp` | 42.186 | sim | VP8X, ICCP, VP8 | ausentes |
| `ilha-grande-igrejinha-1280.webp` | 168.738 | sim | VP8X, ICCP, VP8 | ausentes |

A pasta pública contém exatamente esses três arquivos, somando 242.766 B. Não
há chunk `EXIF` nem `XMP`, e a varredura textual não encontra `Exif`, `GPS`,
`xmpmeta`, marca ou modelo de dispositivo, nem data de captura. O único
metadado presente é o perfil de cor `ICCP`, necessário à fidelidade cromática.
Nenhuma fotografia nova foi adicionada e nenhum original foi copiado para o
repositório.

## 7. Performance

Medição no servidor de produção local, tema claro, sem throttling, contando
corpo e cabeçalho de cada resposta. O "antes" de 1440 px foi medido pelo mesmo
método sobre o build da baseline, antes de qualquer alteração.

### 1440 px — transferência inicial, sem rolar a página

| Recurso | Antes | Depois | Delta |
|---|---:|---:|---:|
| HTML | 57.762 | 61.897 | +4.135 |
| JavaScript | 144.894 | 150.178 | +5.284 |
| CSS | 6.492 | 6.492 | 0 |
| Fontes | 108.972 | 108.972 | 0 |
| Imagens | 340.933 | 469.853 | +128.920 |
| **Total** | **659.053** | **797.392** | **+138.339** |

Requisições: 17 → 20. As três novas são as fotografias; nenhum arquivo de
JavaScript novo é baixado. O crescimento de 5.284 B em JavaScript vem do
runtime que o `next/image` acrescenta ao chunk já existente.

### 375 px

| Momento | Bytes |
|---|---:|
| inicial, sem rolar | 609.512 |
| depois de percorrer a seção | 658.626 |
| incremento ao entrar na seção | 49.114 |

O "antes" em 375 px não foi medido diretamente. Descontando do inicial as três
parcelas medidas que a H3 introduz — uma fotografia, o HTML e o JavaScript —
chega-se a **550.225 B**, que é derivação e não medição.

### As fotografias

| Viewport | Entregue | Total |
|---|---|---:|
| 1440 | igreja 750 px · 61.286 B; chegada 640 px · 28.745 B; forno 640 px · 38.889 B | 128.920 |
| 375 | igreja 640 px · 49.868 B; forno 384 px · 26.995 B; chegada 384 px · 22.119 B | 98.982 |

### O que a medição mostrou sobre o carregamento inicial

As três fotografias têm `loading="lazy"`, não têm `preload` e não têm
`priority` nem `fetchpriority`. Ainda assim, **em 1440 px as três entram no
carregamento inicial**: a seção começa em 2.021 px de uma página de 5.420 px, o
que a coloca a 1.121 px da dobra — dentro do limiar com que o Chromium antecipa
imagens `lazy`. Em 375 px a seção começa em 2.420 px e só a fotografia
principal é antecipada; as duas secundárias chegam ao entrar na seção.

Isso não é defeito de marcação, e não há correção honesta em HTML: o limiar é
do navegador. Fica registrado como medição, e não como conclusão de que o
`lazy` está segurando as imagens como a H3 esperava.

O que deu para corrigir foi o `sizes`. Ele declarava `62vw` para a fotografia
principal, e o slot real na Home tem 733 px em 1440 px — o navegador baixava um
recorte de 1080 px sem uso. Com o `sizes` descrevendo o slot que existe, o
recorte passou a 750 px: **41.783 B a menos**, sem recomprimir, recortar ou
degradar o documento fotográfico.

### Duas observações que contradizem registro anterior

1. A H1 registrou que a otimização do `next/image` não roda porque `sharp` não
   está instalado. **Hoje está** — `sharp@0.35.4` aparece na árvore do pnpm — e
   a otimização roda: as fotografias são servidas por `/_next/image`, em
   recortes menores que o arquivo versionado.
2. Como consequência, o binário servido **não é** o derivado revisado byte a
   byte: é um recorte recodificado dele em tempo de requisição. O artefato com
   hash registrado continua sendo o WebP versionado em `public/media/pesquisa`.
   O Hero segue caminho diferente, com `<picture>` e o arquivo direto. A
   divergência entre as duas seções fica registrada para decisão humana.

O referencial de 500 kB continua excedido, agora com folga maior. Nenhuma
fotografia foi degradada e nenhuma dependência foi adicionada.

## 8. Validação

Gates: `pnpm tipos`, `pnpm lint`, `pnpm teste`, `pnpm a11y` e `pnpm build`
passaram. `pnpm pendencias` sai com sucesso mas não consulta nada sem
`DATABASE_URL` no ambiente local, e o próprio script avisa que o resultado não
atesta nada.

Testes novos, todos sobre a Home real:

- composição A presente, três `figure`, três `img` com `alt` não vazio, três
  `figcaption`, nenhum rótulo de desenvolvimento no texto nem no HTML;
- nenhum `preload` de imagem da pesquisa, três imagens `lazy`, nenhuma com
  `fetchpriority="high"`;
- títulos aprovados presentes; ausência da frase recusada e de contagem de
  fotografias;
- ausência de `B01`, `A03`, `A04`, do título interno e do caminho do relatório;
- Pesquisa em Campo depois do Território, sem `button` nem `listbox` novos;
- fiação verificada em teste de unidade: a Home importa a entrada pública, não
  o componente de laboratório, e a entrada pública fixa a composição A;
- **H3.2** — a narrativa da seção não usa linguagem de gate: nenhuma ocorrência
  de "pessoa identificável", "privacidade", "autorização", "consentimento",
  "auditoria", "revisão" ou "publicável";
- **H3.2** — a ficha tem exatamente dois campos, declara `Local` e a ausência
  de data, e **não** traz `Fonte`.

Sem overflow horizontal em 320, 375, 768 e 1440 px, nos temas claro e escuro. A
ordem no mobile é título, fotografia principal, leitura e registros seguintes.
As rotas `/dev/pesquisa`, `/dev/territorio` e `/dev/hero` respondem 404 no
servidor de produção.

Capturas reais, fora do Git, em `tmp/h3-screenshots/`. Desde a H3.2 elas são
de **viewport normal**, sem página inteira, justamente para não reproduzir o
falso positivo do cabeçalho descrito na §9:

- `viewport-h3-1440-light.png`, `viewport-h3-1440-dark.png`,
  `viewport-h3-375-light.png`, `viewport-h3-375-dark.png` e
  `viewport-h3-320-light.png` — a seção enquadrada como o visitante a vê;
- `viewport-transicao-h2-h3-1440-light.png` e
  `viewport-transicao-h2-h3-375-light.png` — o fim do Território e o começo da
  Pesquisa em Campo na mesma tela;
- `viewport-h3-ficha-1440-light.png` — a coluna de leitura com a ficha e o
  bloco de método;
- `viewport-h3-zoom200.png` — equivalente a zoom de 200 %, sem overflow;
- as capturas de página inteira da H3.1 continuam disponíveis com o prefixo
  `home-pesquisa-`, **identificadas como full-page** e sujeitas ao artefato.

## 9. Cabeçalho fixo: diagnóstico da H3.2

As capturas da H3.1 mostravam o cabeçalho e o menu por cima da fotografia
principal no desktop e por cima do título do bloco de leitura numa captura
mobile. A suspeita de defeito foi investigada antes de qualquer mudança.

**É artefato de captura.** O cabeçalho é `position: fixed` no topo. Captura de
página inteira e captura de elemento congelam o elemento fixo na posição em que
ele estava na viewport, e essa posição cai no meio da imagem final, que é muito
mais alta que a viewport. Nada disso acontece para quem usa a página.

Medição em navegador real, na Home servida em produção local, em 1440, 375 e
320 px:

| Cenário | Resultado |
|---|---|
| carga em `scrollY = 0` | cabeçalho em `top 0`, altura 72 px em 1440, 119 px em 375 e 138 px em 320; sem `transform` |
| rolagem contínua para baixo | recolhe com `translateY(-100%)`, fica em `top -72 / bottom 0` e **sai da viewport** |
| rolagem para cima | reaparece em `top 0`; o que está sob a borda inferior é a seção Território, e a sobreposição com a seção Pesquisa em Campo é **0 px** |
| foco por teclado, 45 paradas de Tab | **nenhum focável fora do cabeçalho fica obscurecido por ele** |
| painel de acessibilidade aberto | o cabeçalho não recolhe, como as travas do `CabecalhoReativo` prometem |

O link "Pular para o conteúdo" ocupa a mesma faixa geométrica do cabeçalho
quando recebe foco, mas é pintado acima dele — `--z-pular` é 100 e
`--z-cabecalho` é 50 —, e `elementFromPoint` devolve o próprio link. Não há
obscurecimento.

Resta o comportamento genérico de qualquer cabeçalho fixo: se o visitante rola
para cima com a seção encostada no topo, a faixa superior da viewport fica sob
o cabeçalho até ele continuar rolando. Isso vale para a página inteira, do Hero
ao rodapé, é anterior à H3 e não é regressão desta seção.

**Conclusão: nenhuma linha do cabeçalho foi alterada.** As capturas de
comprovação desta rodada são de viewport normal, não de página inteira.

## 10. Dívidas e bloqueios

- as fotografias entram no carregamento inicial em 1440 px por limiar do
  navegador (§7);
- decidir se a seção deve servir o derivado revisado byte a byte, como o Hero,
  em vez do recorte recodificado pelo `next/image` (§7);
- orçamento de 500 kB excedido, hoje em cerca de 797 kB no cenário de 1440 px;
  Lighthouse continua exigido e não executado. Decisão humana de 2026-09-10:
  auditoria de performance e Lighthouse acontece em etapa própria, na H7, e a
  H3.2 não degradou fotografia, não trocou o `next/image` e não mexeu no
  pipeline do Hero;
- `axe-core` continua fora do `pnpm a11y`, que hoje é só Playwright;
- B01 segue RESTRITO como conjunto: publicação definitiva ainda depende de
  modelar derivados fotográficos individuais;
- as 41 fotografias PENDENTES continuam pendentes, e nenhuma foi promovida.

Não houve MapLibre, dependência nova, deploy, push, banco, R2, Vercel, DNS ou
mudança de infraestrutura. H4 não foi iniciada.
