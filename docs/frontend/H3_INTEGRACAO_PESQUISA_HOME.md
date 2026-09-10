# H3.1 — Integração da Pesquisa em Campo na Home

**Data:** 2026-09-10

**Estado:** implementada e validada localmente; não publicada

**Baseline:** ad86097 — feat: prototipa pesquisa em campo

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

## 3. A introdução, e o que sustenta cada afirmação

A frase do protótipo — "Três registros sem pessoas identificáveis aproximam a
cartografia da presença física..." — **não foi levada para a Home**. Ela lia
como nota de auditoria e ficava presa ao número de imagens publicadas.

Texto que entrou no lugar:

> A pesquisa foi a campo, e o registro fotográfico é parte do que ela produziu.
> As imagens desta seção vêm do acervo do projeto e são publicadas sem pessoa
> identificável.

| Afirmação | O que a sustenta |
|---|---|
| a pesquisa foi a campo | relatórios técnicos de visita, entrevistas gravadas com local declarado e o próprio conjunto fotográfico do acervo |
| o registro fotográfico é parte do que ela produziu | 56 fotografias auditadas na H3, dentro do corpus canônico |
| as imagens vêm do acervo do projeto | os três derivados têm original, hash e caminho registrados em `src/dados/pesquisa/derivados.ts` |
| são publicadas sem pessoa identificável | classificação APTA por inspeção visual individual, registrada na matriz da H3 |

Nenhuma data, técnica, pessoa, coordenada, município ou visita foi criada. A
frase não conta imagens, para não voltar a depender de quantas são.

O parágrafo de leitura também deixou de contar fotografias: "Este recorte reúne
três fotografias documentadas como Ilha Grande" virou "As fotografias deste
recorte estão documentadas como Ilha Grande". Os fatos são os mesmos.

**Pendência de aprovação registrada.** O bloco "Método · síntese transversal" —
"O corpus do projeto reúne registros fotográficos, entrevistas gravadas e
formulários de resposta" — estava marcado como *precisa aprovação* na tabela de
copy da H3 e não foi mencionado nas decisões desta rodada. Ele permanece na
Home porque é afirmação factual e transversal, sustentada por B01, pelos oito
pares de entrevista e pelas planilhas de resposta, e porque é o que comunica
que a pesquisa envolveu mais do que fotografia. **Continua aguardando aprovação
humana explícita.**

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
  o componente de laboratório, e a entrada pública fixa a composição A.

Sem overflow horizontal em 320, 375, 768 e 1440 px, nos temas claro e escuro. A
ordem no mobile é título, fotografia principal, leitura e registros seguintes.
As rotas `/dev/pesquisa`, `/dev/territorio` e `/dev/hero` respondem 404 no
servidor de produção.

Capturas reais, fora do Git, em `tmp/h3-screenshots/`:
`home-pesquisa-1440-light.png`, `home-pesquisa-1440-dark.png`,
`home-pesquisa-768-light.png`, `home-pesquisa-375-light.png`,
`home-pesquisa-375-dark.png` e `home-pesquisa-320-light.png`, mais um recorte
da seção em cada cenário.

## 9. Dívidas e bloqueios

- copy do bloco "Método · síntese transversal" aguarda aprovação humana (§3);
- as fotografias entram no carregamento inicial em 1440 px por limiar do
  navegador (§7);
- decidir se a seção deve servir o derivado revisado byte a byte, como o Hero,
  em vez do recorte recodificado pelo `next/image` (§7);
- orçamento de 500 kB excedido; Lighthouse continua exigido e não executado;
- `axe-core` continua fora do `pnpm a11y`, que hoje é só Playwright;
- B01 segue RESTRITO como conjunto: publicação definitiva ainda depende de
  modelar derivados fotográficos individuais;
- as 41 fotografias PENDENTES continuam pendentes, e nenhuma foi promovida.

Não houve MapLibre, dependência nova, deploy, push, banco, R2, Vercel, DNS ou
mudança de infraestrutura. H4 não foi iniciada.
