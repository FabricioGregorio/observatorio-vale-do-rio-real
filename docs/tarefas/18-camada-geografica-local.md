# TAREFA 18 — Cartografia Viva — camada geográfica local

**Natureza:** laboratório DEV e registro de pesquisa geográfica.

**Data:** 2026-09-13 e 2026-09-14.

**Branch:** `exp/home-v2-territorio-vivo`.

**Base:** Tarefa 17 (`70a00b1`), aprovada como base do experimento e **não**
autorizada para publicação.

**Rota:** `/dev/territorio-vivo` — somente desenvolvimento; 404 em produção.

Por que tarefa nova, e não emenda da 17: esta rodada acrescenta **dado
geográfico externo derivado**, com procedência, script e licença próprios, e
muda a representação do mapa. É outra unidade de revisão. A 17 continua sendo o
registro do protótipo base.

**Esta tarefa NÃO autoriza:**

- publicar o laboratório, criar `/territorio` ou alterar a Home v2;
- publicar coordenada de lugar da pesquisa, nem localidade obtida só de fonte
  restrita;
- usar Google Maps, iframe, API ou tiles externos;
- instalar biblioteca de mapa (Leaflet, MapLibre, Mapbox, OpenLayers);
- alterar banco, R2 ou produção;
- fazer deploy, merge ou abrir PR.

## 1. Arquivos

| Arquivo | Papel |
|---|---|
| `src/componentes/prototipo/territoriovivo/TerritorioVivo.tsx` | estados Vale → município → local; ficha; legenda e atribuição do modo local |
| `src/componentes/prototipo/territoriovivo/InteracaoTerritorioVivo.tsx` | seleção só pela lista; orientação do seletor no celular |
| `src/componentes/prototipo/territoriovivo/estilos.ts` | tokens `--tv-*` da camada local, claro e escuro; seletor compacto; movimento reduzido |
| `src/componentes/prototipo/territoriovivo/geometria.ts` | `projetarContinuo`, `compor`, `caminhoRelativo` |
| `src/componentes/prototipo/territoriovivo/lugares.ts` | campo `camadaLocal`, com `coordenadaConfirmada: null` |
| `src/componentes/prototipo/territoriovivo/local/entorno.ts` | esquema Zod, enquadramento, filtro de nomes, carga |
| `src/componentes/prototipo/territoriovivo/local/entorno-jacare.json` | **derivado** IBGE + OSM |
| `src/componentes/prototipo/territoriovivo/local/procedencia.ts` | origem, data, área, método, licença e SHA-256 |
| `src/componentes/prototipo/territoriovivo/local/camada.ts` | composição pura: caminhos, rótulos, enquadramento |
| `src/componentes/prototipo/territoriovivo/local/CamadaDoEntorno.tsx` | desenho SVG da camada |
| `scripts/derivar-entorno-local.ts` | derivação reprodutível |
| `testes/territorio-vivo-local.test.ts` | geometria, dado, procedência, privacidade |
| `testes/a11y/territorio-vivo.spec.ts` | estados, contraste escuro, celular, movimento reduzido |
| `docs/tarefas/17-cartografia-viva-experiencia-territorial.md` | nota de continuidade |

## 2. Checkpoint da Tarefa 17

- Branch `exp/home-v2-territorio-vivo`, HEAD `1d9d037` e os arquivos da 17 não
  rastreados, conforme esperado.
- Arquivos revisados: restritos ao escopo relatado.
- `pnpm tipos` ok; `pnpm lint` ok (4 avisos preexistentes); testes territoriais
  12/12; a11y territorial 8/8; `git diff --check` ok.
- Commit `70a00b1 feat: prototipa cartografia viva territorial`, só com os
  cinco caminhos autorizados; push para `origin/exp/home-v2-territorio-vivo`,
  sem force.

## 3. Correção: nenhum pin falso

**Antes:** ao aproximar Tobias Barreto, o mapa desenhava etiquetas “Recanto da
Serra” e “Museu Borda da Mata” dentro do município. Mesmo com a nota “posição
não confirmada”, uma etiqueta num lugar do desenho é lida como posição.

**Agora:**

- no município, o mapa diz só **“2 lugares visitados neste município”** e
  “posição dos lugares não publicada · ver lista”;
- a lista textual identifica e seleciona os lugares; o mapa não tem elemento
  clicável de lugar;
- nenhum lugar ganha marca, etiqueta ou pin sem coordenada confirmada — no
  código, `coordenadaConfirmada` é do tipo `null`.

## 4. Fontes geográficas abertas avaliadas

| Fonte | Conteúdo útil | Avaliação | Decisão |
|---|---|---|---|
| IBGE — API de malhas v4 | limite municipal | já no repositório (Tarefa 10B) | **reusada** para o limite no modo local |
| IBGE — API de localidades v1, distritos | Tobias Barreto, Samambaia, Monte Coelhos; sem subdistritos | só lista, sem geometria de povoado | não usada |
| IBGE — BC250, versão 2025 | vias, hidrografia, localidades em 1:250.000 | GeoPackage nacional de 864 MB; escala grossa para um entorno de ~20 km | não baixada |
| **IBGE — Localidades do Brasil, Censo 2022** | nome, categoria, código e posição de sede, vilas, povoados e outras localidades | pacote por UF de 6,5 MB; dado oficial, com código estável | **usada** para localidades |
| **OpenStreetMap (Overpass API)** | vias com código e revestimento, cursos d'água com nome, localidades | ODbL; extrato por caixa, obtido uma vez e derivado localmente | **usado** para vias e cursos d'água |
| Tiles externos (OSM, Google) | mapa pronto | requisição de terceiro no navegador; rastreio (Google); estética alheia | **rejeitados** |

Nenhuma fonte é consultada pelo navegador. O site lê só o derivado versionado,
em tempo de build.

## 5. Geografia encontrada para o Povoado Jacaré

- **IBGE, Localidades 2022:** localidade **Jacaré**, código `280740200039`,
  categoria “Outras Localidades”, município Tobias Barreto. Há também “Jacaré I”
  (`280740200056`), praticamente no mesmo ponto.
- **OSM:** nó `place=hamlet` “Jacaré” (`1181883243`) a cerca de 50 m do ponto do
  IBGE. Há outros dois nós com “Jacaré” no nome a menos de 1,5 km; nenhum
  representa o equipamento.
- As duas posições caem **dentro da malha oficial de Tobias Barreto** (verificado
  por ponto em polígono e coberto por teste).
- **Relação com a sede:** a localidade fica a **norte-noroeste** da sede
  municipal. As rodovias **SE-290** e **SE-492** passam a menos de 1,5 km dela;
  no extrato OSM, a SE-290 liga a sede ao entorno de Jacaré.
- **Localidades vizinhas no IBGE:** Capitoa, Nova Brasília, Campestre do Abreu,
  Pilão e Baixão, entre outras. A descrição pública de um “Vale do Jacarezinho”
  formado por Jacaré e povoados vizinhos, e o Riacho Jacarezinho no OSM, são
  coerentes com essa vizinhança.

**Conclusão:** há geografia pública suficiente para mostrar a **localidade** e
suas vias. Não há geografia pública do **equipamento**.

## 6. Candidatos de coordenada do equipamento — NÃO publicados

Fonte pública que sugere ≠ Observatório que confirma.

| Referência | Fonte | O que sugere | Tratamento |
|---|---|---|---|
| Recanto na “comunidade do jacaré, a 23 km da cidade” | Prefeitura de Tobias Barreto, página de turismo (consultada em 2026-09-13) | distância da sede, sem coordenada | **não usada**: seria número novo e não é posição |
| Localidade Jacaré (IBGE e OSM) | §5 | posição da localidade | usada **só** como âncora do enquadramento, nunca como posição do equipamento |
| Objetos OSM “Recanto da Serra”, “Museu dos Tropeiros”, “Ecoparque” | busca Overpass na região | — | **nenhum encontrado** |
| Marcações de local em redes sociais do equipamento | exigem login | — | não consultadas |

**Nenhum candidato de coordenada do equipamento foi encontrado.** Nada foi
colocado no mapa como ponto do lugar. Continua fora de consideração o GPS do
EXIF das fotografias originais (Tarefa 17 §4): corpus privado, valores não
lidos.

## 7. Arquitetura Vale → município → local

| Estado | `data-foco` | Conteúdo principal | Escala sobre o Vale |
|---|---|---|---|
| Vale | `vale` | malha IBGE dos 5 municípios do recorte | 1× |
| Município | código IBGE | malha aproximada; contagem de lugares | ≈ 2× |
| Local | `local-jacare` | **camada local**: vias, cursos d'água, localidades, limite | ≈ 4,4× |
| Sem local | `sem-local` | malha atenuada; aviso de lugar sem localização | 1× |
| Lugar | — | **não existe** enquanto não houver coordenada confirmada | — |

**Não é a mesma malha ampliada.** A camada local é outro desenho, feito de outro
dado. Ela compartilha com a malha **só a projeção**. Por isso, ao entrar no
modo local:

1. a malha continua a aproximação, com Tobias Barreto em foco (anel tracejado,
   vizinhos atenuados), e se apaga na segunda metade da transição;
2. a camada local nasce exatamente sobre o pedaço do município que detalha
   (`compor(enquadramentoAtual, enquadramentoLocal)`), entra em opacidade e
   chega à própria escala.

Tudo é calculado em build e entregue como CSS; a ilha cliente só troca
`data-foco`. Com `prefers-reduced-motion`, a troca é instantânea: a
propriedade de transição é anulada, e não só encurtada (§11).

Um lugar ganha camada local quando `lugares.ts` declara `camadaLocal`. O
enquadramento vem de `local/entorno.ts`. O marcador do lugar só pode existir
quando `coordenadaConfirmada` deixar de ser `null` — mudança de tipo que exige
decisão humana.

## 8. Protótipo local do Recanto da Serra

- **Enquadramento:** lat −11,215 a −10,985; lon −38,1185 a −37,9475, cerca de
  19 × 25 km em retrato, na proporção da vista do Vale. Contém a sede e Jacaré.
- **Camadas, de baixo para cima:** fundo; município com hachura atenuada; cursos
  d'água; arruamento da sede; estradas vicinais; rodovias com casco (tracejadas
  quando o OSM declara “sem pavimento”); limite municipal; códigos de rodovia;
  localidades; localidade selecionada; nota.
- **Localidade selecionada:** “▸ Jacaré” em etiqueta milho, anel tracejado e
  halo. É a marca de uma **localidade do IBGE**, não um pin.
- **Nota no desenho:** “Recanto da Serra · Povoado Jacaré (A02) — localização
  exata do equipamento não publicada”.
- **Rótulos:** posicionados em build por prioridade (sede, povoados, outras
  localidades, rodovias). Rótulo que não cabe sem sobrepor é omitido.
- **Atribuição visível no modo local:** IBGE (Localidades 2022 e malha) e
  “© contribuidores do OpenStreetMap — ODbL 1.0”, com link para a página de
  direitos do OSM.

## 9. Como chegar

A ficha mostra só o que existe:

- **Localidade:** Povoado Jacaré, Tobias Barreto (SE) — fonte A02;
- **Referência de acesso:** o texto do A02 sobre a falta de transporte a partir
  do centro de Tobias Barreto;
- **Posição do equipamento:** localização exata não publicada; o mapa mostra o
  entorno da localidade, sem marcar o equipamento;
- **Rota externa:** indisponível, porque não há destino geográfico confirmado.
  **Nenhum botão, link ou URL externa** com coordenada, aproximada ou não;
- fonte do mapa local.

Nenhum número novo entrou na ficha.

## 10. Procedência

Registro completo em `local/procedencia.ts`, conferido por teste:

| Item | Origem | Obtido | SHA-256 |
|---|---|---|---|
| Entrada OSM (não versionada) | Overpass, caixa lat −11,24 a −10,94, lon −38,16 a −37,92; base OSM 2026-09-13T18:46:41Z | 2026-09-13 | `aa29bef2…96efc4` |
| Entrada IBGE (não versionada) | `Localidades_UFs_gpkg.zip` → `SE_localidades_2022.gpkg` | 2026-09-13 | ZIP `f537128d…fd5c00`; GPKG `1b2ea0f8…5bf7a` |
| Derivado versionado | `scripts/derivar-entorno-local.ts` | 2026-09-13 | `da190f24…68fd289` (LF) |

**Método:** recorte pelo enquadramento; vias classificadas em rodovia, estrada
e urbana, **sem nome** (só código e revestimento); `track` descartado; só
cursos d'água com nome; localidades sem código repetido; Douglas-Peucker a
≈ 13 m; 5 casas decimais; validação Zod; arquivo gravado já no formato do
Biome, para que o lint não reformate e o hash se mantenha.

**Licença:** o derivado contém dado OSM e segue a ODbL 1.0 — atribuição visível
e compartilhamento do banco derivado pela mesma licença. As localidades são
dado público do IBGE, sob a mesma ressalva de licença já registrada em
`src/dados/territorio/LEIA-ME.md`.

**Dado externo × dado próprio:** o derivado contém só dado externo, e cada
camada declara a fonte dentro do arquivo (`fontes`). Nome do lugar, localidade
segundo o A02 e nota de não publicação vivem em `lugares.ts` e no componente.

**Filtro de privacidade por regra:** nome geográfico que compartilhe radical
com o nome de um dos quatro lugares de campo não entra no derivado, salvo
Jacaré, já público no A02. A regra não lista nenhuma localidade sensível no
código. O enquadramento também não alcança as localidades que poderiam ser
associadas a lugares sem município publicado.

## 11. Dark mode

Tokens novos, todos derivados de papéis de `tokens.css` por `color-mix`, com
os `--tv-*` da Tarefa 17 preservados:

| Token | Função |
|---|---|
| `--tv-local-municipio` | preenchimento do município no modo local |
| `--tv-via-rodovia`, `--tv-via-casco` | rodovia e casco da cor da placa |
| `--tv-via-estrada`, `--tv-via-urbana` | vias secundárias, deliberadamente abaixo da rodovia |
| `--tv-agua` | cursos d'água, a partir do papel de link (anil) |
| `--tv-localidade` | marca de localidade |
| `--tv-duracao-local` | duração da transição de escala |

Verificado no tema escuro, modo local (teste a11y):

- rodovia × município ≥ 3:1;
- limite municipal × município ≥ 3:1;
- nomes de localidade e texto da nota × placa ≥ 4,5:1;
- estrada vicinal visível e **com contraste menor que a rodovia**, para não
  competir com a localidade selecionada;
- borda da placa × página ≥ 1,8:1 (melhoria aprovada na 17).

A localidade selecionada não depende de cor: tem anel tracejado, prefixo “▸” e
peso de texto.

## 12. Mobile

- Ordem: **mapa → seletor compacto → ficha**. A lista virou uma faixa
  horizontal rolável, com `aria-orientation="horizontal"`.
- A 375 px o mapa ocupa ~341 × 463 px, e o seletor aparece na primeira tela.
- Na placa estreita, “outras localidades” saem do desenho, e povoados e códigos
  de rodovia sobem para ~10 px. Sede, Jacaré e nota continuam visíveis.

## 13. Acessibilidade

- O mapa nunca é a única interface: lista e fichas funcionam sem JavaScript.
- `tablist`/`tab`/`tabpanel` com ativação manual; o título do SVG descreve o
  estado. No modo local: localidade, rumo desde a sede, rodovias próximas,
  fontes e a frase de não publicação.
- Anúncio `aria-live` específico para o modo local.
- Movimento reduzido: troca instantânea, testada sem espera. A primeira versão
  falhou nesse teste — a regra global de `tokens.css` encurta a duração para
  0,01 ms, mas uma transição de 10 µs ainda deixa o quadro da troca no estado
  anterior. Corrigido anulando a propriedade de transição no laboratório.
- Sem transbordo horizontal a 375 e 1440 px, nos dois temas; nenhuma imagem sem
  `alt`.

## 14. Performance — build de produção local

**Método:** o mesmo da Tarefa 17. Cópia descartável fora do repositório,
dependências instaladas com `pnpm install --frozen-lockfile --offline` (o
Turbopack recusa `node_modules` como junção apontando para fora da raiz),
`next build` + `next start`, rota temporária `/medicao-territorio-vivo` com o
mesmo componente. Um contexto de navegador sem cache por medição; seleção do
estado, rolagem até o fim e leitura por `performance.getEntriesByType`. A
cópia foi apagada depois. Na mesma build, `/dev/territorio-vivo` → **404**.

Bytes transferidos, salvo indicação:

| | Tarefa 17 | 18 — Vale | 18 — município | 18 — local |
|---|---:|---:|---:|---:|
| HTML transferido | 29.336 | 99.525 | 99.525 | 99.525 |
| HTML decodificado | 122.324 | 334.879 | 334.879 | 334.879 |
| JavaScript | 142.296 (8) | 142.322 (8) | 142.322 (8) | 142.322 (8) |
| CSS externo | — | 6.689 (1) | 6.689 (1) | 6.689 (1) |
| CSS inline no componente (caracteres) | — | 16.991 + 2.216 | idem | idem |
| SVG no DOM (caracteres) | 23.025 | 118.848 | 118.817 | 118.952 |
| — malha municipal | — | 20.624 | 20.624 | 20.624 |
| — camada local | — | 96.025 | 96.025 | 96.025 |
| Camada local isolada, gzip | — | 31.579 | 31.579 | 31.579 |
| Imagens | 182.598 (1) | 182.598 (1) | 182.598 (1) | 182.598 (1) |
| Fontes | 108.972 | 108.972 (4) | 108.972 (4) | 108.972 (4) |
| Requisições | 15 | 15 | 15 | 15 |
| Requisições externas | 0 | 0 | 0 | 0 |
| Total transferido | 469.770 | 540.106 | 540.106 | 540.106 |

Os valores são iguais a 1440 e a 375 px.

**Leitura dos números:**

- **Os três estados custam o mesmo na rede.** Toda a cartografia chega
  pré-renderizada, e trocar de estado é só CSS. Nenhum estado dispara
  requisição, e nenhuma vai para fora do site.
- **A camada local custa ~70 kB transferidos a todo visitante**, mesmo a quem
  nunca abre o Recanto. É o preço de a transição ser instantânea e funcionar sem
  requisição.
- **O HTML decodificado cresce ~2,2× o que o SVG cresce**, porque o Next
  serializa a árvore do Server Component duas vezes: no HTML e no payload RSC
  embutido na página.
- **O JavaScript não mudou** (+26 bytes): a ilha continua sem renderizar nada.
- A foto da ficha do Recanto continua carregando em qualquer estado, porque sem
  JavaScript as fichas nascem visíveis. Ajuste já registrado na Tarefa 17.
- **Não otimizado, por decisão:** a opção natural, se a camada local for mantida,
  é servi-la como SVG estático derivado, buscado só ao selecionar o lugar — e
  medir de novo. Isso troca bytes iniciais por uma requisição e por uma
  transição que depende da rede.

## 15. Limitações

- **Nenhuma coordenada do equipamento.** O modo local mostra o entorno, não o
  lugar, e “Como chegar” não pode oferecer rota.
- **Sem JavaScript** o modo local não aparece: a página mostra lista, fichas e a
  vista do Vale.
- **Rótulos calculados para o desktop.** No celular, parte deles é escondida
  por CSS; não há reposicionamento por largura.
- **OSM é colaborativo:** revestimento e classificação de via podem estar
  incompletos. A legenda diz “sem pavimento (OSM)”.
- **Limite municipal em qualidade intermediária** (IBGE): a ~4× de ampliação, o
  traçado é visivelmente simplificado.
- **O derivado soma 493 kB no repositório** (lido só no build). Uma segunda
  camada local repetiria esse custo.
- **Uma única camada local, codificada para Jacaré:** generalizar exige parâmetro
  por entorno, e não há outro lugar com localidade pública hoje.
- **Licença:** a ODbL obriga manter a atribuição e compartilhar o derivado pela
  mesma licença se ele for publicado; isso precisa entrar na decisão de
  publicação.
- **Tecnologia:** SVG com dado local foi suficiente para esta prova; nenhuma
  biblioteca de mapa foi necessária. Zoom e arrasto livres não existem.

## 16. Testes executados

| Verificação | Resultado |
|---|---|
| `pnpm tipos` | passou |
| `pnpm lint` | passou (4 avisos preexistentes) |
| `testes/rota-territorio-vivo.test.ts` + `testes/territorio-vivo-local.test.ts` + `testes/territorio.test.ts` | 70/70 |
| `testes/a11y/territorio-vivo.spec.ts` | 12/12 |
| `git diff --check` (alterados e novos) | ok |

## 17. Critérios antes de qualquer publicação

> **Continuidade (2026-09-14):** as coordenadas dos quatro lugares foram
> confirmadas por instrução humana direta, para uso DEV. Isso substitui os §6 e
> §9 desta tarefa no laboratório (pins reais, rota externa por link explícito)
> e está registrado na [Tarefa 19](./19-coordenadas-confirmadas-e-camadas-sob-demanda.md).
> As coordenadas não estão neste repositório.
>
> **Atualização — 2026-09-14 (Tarefa 20):** a frase acima valeu até a decisão
> humana posterior. As coordenadas, o município e a localidade dos quatro
> lugares passaram a ser versionados em
> `src/componentes/prototipo/territoriovivo/local/referencias.ts`, e os entornos
> de Borda da Mata, Serra dos Macacos e Ilha Grande foram versionados junto com
> sua procedência. A camada de Jacaré desta tarefa não mudou (mesmo SHA-256).

- [x] **Responsável autorizou a exposição pública das quatro coordenadas
      exatas?** — sim, 2026-09-14 (Tarefa 19, §1).
- [ ] Decisão humana sobre publicar a camada local e aceitar a ODbL no
      derivado.
- [ ] Coordenada do equipamento confirmada pelo Observatório, com decisão de
      publicar — ou manutenção honesta do nível localidade.
- [ ] Revisão humana dos nomes de localidade exibidos e do enquadramento.
- [ ] Regra de rota externa: só com destino confirmado, sem serviço de rastreio.
- [ ] Tratamento dos rótulos por largura, se o modo local for mantido no celular.
- [ ] Rota `/territorio` com ADR e tarefa próprias; Home v2 intocada até lá.
