# TAREFA 20 — Cartografia Viva — referências territoriais públicas

**Natureza:** laboratório DEV. Passagem de **protótipo privado** para **dados
territoriais publicáveis**.

**Data:** 2026-09-14.

**Branch:** `exp/home-v2-territorio-vivo`.

**Base:** `ec8dc0f feat: evolui cartografia viva com camadas sob demanda`
(Tarefas 18 e 19).

> **Atualização de continuidade — 2026-09-14:** nova instrução humana refinou
> a identificação territorial da Serra dos Macacos. O trabalho de campo
> ocorreu em uma pequena comunidade próxima à Vila de Samambaia, e não
> propriamente na Vila nem em um “Povoado Samambaia” de nome oficial
> confirmado. A coordenada humana `-10.8811, -37.9867` permanece inalterada.
> As menções ao estado anterior são preservadas abaixo como trilha histórica;
> o modelo vigente está nos §§3–4 e 20.

**Rotas:** `/dev/territorio-vivo` e `/dev/territorio-vivo/camada-local/[lugar]`
— somente desenvolvimento; 404 em produção (conferido em build).

**Esta tarefa NÃO autoriza:**

- deploy, merge, PR ou alteração de produção;
- alterar a Home pública, ou `src/dados/territorio/pontos.ts`, que a alimenta;
- criar `/territorio` público;
- reclassificar documentos: relatórios, entrevistas, formulários, transcrições
  e fotografias em revisão continuam com o estado que tinham;
- instalar biblioteca.

## 1. Decisão humana

**2026-09-14**, em duas etapas registradas:

1. **Antes (Tarefa 19):** coordenadas confirmadas pelo responsável, autorizadas
   só para o laboratório local, em arquivo fora do Git.
2. **Depois:** o responsável autorizou **explicitamente** a publicação pública e
   o versionamento no Git remoto das coordenadas exatas, do município, da
   localidade e de “Como chegar” dos quatro lugares.

A autorização é **territorial**. Geografia pública não libera conteúdo
documental restrito.

## 2. Da versão privada à publicável

| Aspecto | Tarefa 19 (privado) | Tarefa 20 (publicável) |
|---|---|---|
| Coordenadas | `coordenadas-confirmadas.local.json`, fora do Git | `local/referencias.ts`, fonte versionada única |
| `publicacaoPublicaAutorizada` | `false` | `true` |
| Fonte do ponto | “confirmação humana direta — 2026-09-14” | “confirmação humana direta do responsável — 2026-09-14” |
| Município e localização de Serra e Ilha | não publicados | Tobias Barreto / comunidade próxima à Vila de Samambaia; São Cristóvão / Povoado Ilha Grande |
| Entornos de Borda, Serra e Ilha | `entornos/*.local.json`, fora do Git | `entornos/*.json`, versionados |
| Procedência desses entornos | `*.procedencia.local.json`, fora do Git | `local/procedencia.ts` |
| Teste com valores literais | local, fora do Git | `testes/territorio-vivo-coordenadas.test.ts` |
| Exclusões em `.git/info/exclude` | três linhas desta experiência | removidas (§5) |

## 3. Modelo territorial público

`src/componentes/prototipo/territoriovivo/local/referencias.ts` é a **única**
fonte versionada do território dos lugares. Cada registro tem:

| Campo | Conteúdo |
|---|---|
| `id`, `nome` | identificador e nome do lugar |
| `latitude`, `longitude` | coordenada confirmada, exata |
| `municipio`, `municipioIbge` | nome e código IBGE do município |
| `localidade` | identificação editorial da localização confirmada pelo responsável |
| `localidadeIbge` | código da localidade IBGE correspondente, só quando há correspondente seguro (§6) |
| `referenciaCartografica` | entidade cartográfica próxima que não representa o lugar; na Serra, Vila Samambaia · IBGE |
| `referenciaTerritorial` | texto territorial autorizado, quando existe |
| `coordenadaConfirmada` | `true` |
| `fonteDaCoordenada` | “confirmação humana direta do responsável — 2026-09-14” |
| `publicacaoPublicaAutorizada` | `true` |
| `autorizadoEm` | 2026-09-14 |

- `lugares.ts` e a composição do mapa leem nome, município, localidade e
  posição daí.
- Um teste garante que os valores das coordenadas aparecem em **um só**
  arquivo do laboratório.
- `pontos.ts`, dado da Home, **não** foi alterado: continua sem coordenada.

## 4. Os quatro lugares

| Lugar | Latitude | Longitude | Município | Localidade | Referência IBGE no mapa |
|---|---:|---:|---|---|---|
| Recanto da Serra | -11.015393101706083 | -38.048667603935414 | Tobias Barreto | Povoado Jacaré | Jacaré (280740200039) |
| Museu Borda da Mata | -11.127754407274919 | -37.88642982557546 | Tobias Barreto | Povoado Borda da Mata | Borda da Mata, povoado (280740200023) |
| Serra dos Macacos | -10.8811 | -37.9867 | Tobias Barreto | Comunidade próxima à Vila de Samambaia | Vila Samambaia · IBGE — referência próxima, não o lugar |
| Ilha Grande | -11.0639 | -37.2086 | São Cristóvão | Povoado Ilha Grande | — |

**Referência territorial autorizada (Serra dos Macacos):** a Serra dos Macacos
está situada especificamente na divisa com os municípios de Simão Dias e Poço
Verde, servindo como marco geográfico e mirante natural entre essas cidades.

**Ilha Grande:** por decisão humana, é seu próprio povoado em São Cristóvão.

## 5. Limpeza do mecanismo local

| Item | Situação | Ação |
|---|---|---|
| `coordenadas-confirmadas.local.json` | redundante | apagado |
| `local/coordenadas.ts` (carregava o arquivo local) | redundante | removido do Git; substituído por `referencias.ts` |
| `testes/territorio-vivo-coordenadas.local.test.ts` | redundante | apagado; asserções literais foram para o teste versionado |
| `entornos/serra-dos-macacos.local.json`, `entornos/ilha-grande.local.json` | viram versionáveis | renomeados para `.json`, **conteúdo e hash iguais** |
| `entornos/borda-da-mata.local.json` | viram versionável | apagado e **derivado de novo** (§7) |
| `entornos/*.procedencia.local.json` | redundantes | conteúdo transferido para `procedencia.ts`; apagados |
| `.git/info/exclude` | 3 padrões + 2 comentários desta experiência | removidos; o arquivo voltou ao conteúdo padrão. Não havia exclusão de `.claude/` nem de `docs/handoff/` ali |

A trava do script de derivação (abortar se um entorno **não versionável** não
estiver ignorado pelo Git) foi mantida. Ela não se aplica a nenhum entorno
atual, mas protege entornos futuros.

## 6. Ponto do lugar × contexto IBGE/OSM

- **Ponto:** confirmação humana. Não vem do IBGE nem do OSM. Testado: nenhum
  ponto coincide com localidade ou vértice dos quatro derivados, e o pin de cada
  mapa local fica exatamente na projeção da coordenada.
- **Localidade do lugar (referência IBGE):** entra só quando nome e categoria
  correspondem à localidade confirmada.
  - **Jacaré** (Recanto): IBGE “Jacaré”, a ~1,5 km do pin.
  - **Borda da Mata**: IBGE “Borda da Mata”, categoria Povoado, a ~0,7 km do pin.
    “Borda da Mata I” (outra localidade, a ~0,3 km) **não** substitui o nome
    confirmado e fica fora do mapa pelo filtro de nomes.
  - **Serra dos Macacos**: o IBGE tem “Samambaia” como **Vila** (sede de
    distrito), a ~9 km. Não é correspondente seguro nem o lugar visitado;
    aparece só como referência cartográfica, rotulada “Vila Samambaia · IBGE”.
  - **Ilha Grande**: não há localidade com esse nome na base IBGE de Sergipe.
    Localidades vizinhas (ex.: Pedreiras) aparecem só como contexto, e Ilha
    Grande não é identificada como nenhuma delas.
- **Filtro de nomes:** continua excluindo nomes que compartilham radical com um
  lugar de campo. A exceção deixou de ser só Jacaré e passou a ser **toda
  localidade IBGE declarada como correspondente** em `referencias.ts`.

## 7. Quatro mapas locais

| Lugar | Derivado | Enquadramento | Localidades | Cursos d'água | Trechos de via | Bytes (LF) | SHA-256 |
|---|---|---|---:|---:|---:|---:|---|
| Recanto da Serra | `entorno-jacare.json` | fixo (Tarefa 18) | 22 | 83 | 1.953 | 492.749 | `da190f24…68fd289` |
| Museu Borda da Mata | `entornos/borda-da-mata.json` | centrado no ponto | 25 | 55 | 875 | 301.155 | `87d6321c…3de7f7e` |
| Serra dos Macacos | `entornos/serra-dos-macacos.json` | centrado no ponto | 23 | 25 | 506 | 175.903 | `3157bad3…37cb1ae` |
| Ilha Grande | `entornos/ilha-grande.json` | centrado no ponto | 51 | 20 | 2.233 | 471.391 | `586772c4…dac442a1` |

- **Borda da Mata** foi derivada de novo, com a mesma entrada OSM, porque a
  exceção do filtro passou a incluir o povoado IBGE correspondente
  (24 → 25 localidades).
- **Serra e Ilha:** conteúdo idêntico ao da Tarefa 19.
- **Procedência completa em `local/procedencia.ts`** — para cada derivado:
  lugar, fonte, data, área, método, licença, SHA-256 e tamanho; para cada
  entrada OSM: consulta, data, base OSM, SHA-256 e tamanho. Hash e tamanho de
  cada derivado são conferidos por teste. Downloads brutos **não** versionados.
- **Símbolos:** gota = lugar (selecionado: maior, milho, contorno grosso,
  etiqueta “▸ nome”); anel tracejado = localidade do lugar; quadrado cheio =
  sede; quadrado vazado = outra localidade; placa = rodovia. Nenhum depende só
  de cor.
- **ODbL:** “© contribuidores do OpenStreetMap — ODbL 1.0”, com link para
  `openstreetmap.org/copyright`, na nota logo abaixo da placa, visível sempre
  que um mapa detalhado está ativo. Testado.

## 8. Visão geral, Tobias Barreto e Ilha Grande

- **Visão geral:** Recanto, Borda e Serra na posição verdadeira. Ilha Grande
  fica **fora** da placa do Vale, sem deslocamento artificial; a lista mostra
  “São Cristóvão · fora do recorte do Vale”.
- **Tobias Barreto:** selecionar Recanto, Borda ou Serra aproxima o mapa
  (2×, centrado no pin), e os **três pins** do município aparecem com nome,
  conferido por teste nos três enquadramentos. A contagem, agora “3 lugares
  visitados neste município”, é complemento.
- **Ilha Grande:** a seleção desloca a cartografia até o ponto real.
  São Cristóvão recebe o anel de foco, mas **não** o preenchimento do Vale:
  continua sendo município de comparação, fora do recorte. Testado.

## 9. Como chegar

Para os quatro lugares, só com o que existe:

| Seção | Recanto | Borda | Serra | Ilha |
|---|---|---|---|---|
| Localização | Povoado Jacaré, Tobias Barreto (SE) | Povoado Borda da Mata, Tobias Barreto (SE) | Comunidade próxima à Vila de Samambaia, Tobias Barreto (SE) | Povoado Ilha Grande, São Cristóvão (SE) |
| Referência | texto do A02 sobre transporte | — | divisa com Simão Dias e Poço Verde; marco e mirante | — |
| Abrir rota | OSM e Google Maps | OSM e Google Maps | OSM e Google Maps | OSM e Google Maps |

**Rotas externas:**

- OSM: `https://www.openstreetmap.org/directions?route=%3B<lat>%2C<lon>`;
- Google Maps: `https://www.google.com/maps/dir/?api=1&destination=<lat>%2C<lon>`;
- `<lat>` e `<lon>` são exatamente os valores confirmados (testado nos quatro);
- âncora comum, `target="_blank"`, `rel="noopener noreferrer external"`,
  `referrerPolicy="no-referrer"`;
- sem iframe, sem script, sem prefetch; zero requisição externa antes do clique
  (teste a11y); nenhum rastreador adicionado ao site.

## 10. Público × restrito

| Lugar | Público na ficha | Continua restrito ou em revisão, sem link |
|---|---|---|
| Recanto | A02, receita/despesa do A02, descrição do A02, foto do Hero (atribuição pendente), território | entrevista, formulários, fotografias de campo |
| Borda | tipo (recorte dos indicadores), território | relatório, entrevista, formulários, fotografias |
| Serra | território e referência autorizada | A04 |
| Ilha | três fotografias já públicas, território | entrevista |

Nenhum texto foi derivado de entrevista, relatório privado, formulário ou
transcrição.

## 11. Lazy loading

Mantido e ampliado aos quatro lugares (teste a11y):

| Momento | Pedidos de camada |
|---|---|
| visão inicial | 0 |
| Recanto | `recanto-da-serra` |
| voltar ao Vale e selecionar Recanto de novo | nenhum novo |
| Borda | `borda-da-mata` (e só ele) |

O HTML inicial não contém nenhum dos quatro mapas detalhados.

## 12. Dark mode

Tokens e borda/filete/sombra das Tarefas 17–19 preservados. Nos **quatro**
mapas detalhados, no escuro (teste a11y):

- rodovia e limite ≥ 3:1;
- nomes ≥ 4,5:1;
- contorno do pin selecionado ≥ 3:1, com espessura ≥ 2,5 px;
- etiqueta começando com “▸”;
- texto da etiqueta sobre o milho ≥ 4,5:1;
- borda da placa ≥ 1,8:1.

## 13. Mobile

- A 375 px, nos **quatro** lugares (teste a11y): mapa ≥ 300 × 380 px, seletor
  compacto, ficha depois; pin dentro do mapa; etiqueta legível; **nenhum rótulo
  cruzando a etiqueta do pin selecionado**.
- **Correção feita nesta tarefa:** a 375 px, o rótulo de um povoado vizinho de
  Ilha Grande, que o CSS do celular aumenta para 11 px, encostava 1 px na
  etiqueta do pin. O posicionamento agora reserva uma folga em volta do pin
  selecionado e da etiqueta.

## 14. Acessibilidade

Preservados: lista textual equivalente, teclado, foco visível, estado
selecionado, `aria-live`, movimento reduzido, contraste e funcionamento sem
depender do mapa. Os testes cobrem os quatro lugares.

## 15. Testes

| Verificação | Resultado |
|---|---|
| `pnpm tipos` | passou |
| `pnpm lint` | passou (4 avisos preexistentes em `tokens.css`) |
| testes territoriais (`rota-territorio-vivo`, `territorio-vivo-local`, `territorio-vivo-coordenadas`, `territorio`) | 85/85 |
| `testes/a11y/territorio-vivo.spec.ts` | 14/14 |

**Dados:**

- coordenadas exatas dos quatro;
- fonte humana, `coordenadaConfirmada = true`, `publicacaoPublicaAutorizada = true`;
- município e localidade;
- valores numa só fonte;
- `pontos.ts` intacto.

**Geografia:**

- nenhum ponto substituído por IBGE/OSM;
- Recanto ≠ Borda;
- Serra na projeção exata;
- Ilha fora do Vale e São Cristóvão fora do recorte;
- centralização (unidade e < 1 px no navegador);
- três pins de Tobias em cada aproximação do município;
- mapa local do lugar certo, com o pin na projeção exata;
- localidade IBGE distinta do pin.
- Vila Samambaia tratada como referência cartográfica próxima, nunca como o
  lugar visitado nem como substituta da coordenada humana.

**Rotas:** URLs exatas nos quatro.

## 16. Performance — build de produção local

**Método:** o mesmo das Tarefas 17 a 19.

- Cópia descartável com `pnpm install --frozen-lockfile --offline`.
- Rota temporária `/medicao-territorio-vivo` com o mesmo componente.
- **Build 1**, sem alteração: `/dev/territorio-vivo` e as quatro rotas de
  camada → **404**.
- **Build 2**, com a trava da rota de camadas desligada **só na cópia**.
- Contexto de navegador sem cache, 1440 px, leitura por
  `performance.getEntriesByType`. A cópia foi apagada.

### Carga inicial (sem interação)

| Métrica | Valor |
|---|---:|
| HTML transferido / decodificado | 42.241 / 202.037 bytes |
| JavaScript | 142.911 bytes (8 arquivos) |
| Imagens | 182.598 bytes (1) |
| Requisições | 15 |
| Pedidos de camada local | **0** |
| Requisições externas | 0 |
| **Total transferido** | **483.411 bytes** |

**Quem não interage não paga por nenhum dos quatro mapas.**

### Cada lugar, aberto isoladamente

| Lugar | Pedidos de camada | Camada transferida | Requisições | Total transferido |
|---|---:|---:|---:|---:|
| Recanto da Serra | 1 | 98.940 | 16 | 582.351 |
| Museu Borda da Mata | 1 | 73.410 | 16 | 556.821 |
| Serra dos Macacos | 1 | 47.038 | 16 | 530.449 |
| Ilha Grande | 1 | 91.050 | 19 | 818.127 |

A ficha de Ilha Grande exibe as três fotografias públicas, o que explica as
três requisições e os ~244 kB de imagens a mais nesse estado.

### Sequência explorando os quatro (mesma aba)

| Passo | Pedidos de camada | Camadas acumuladas | Requisições | Total acumulado |
|---|---:|---:|---:|---:|
| Vale | 0 | 0 | 15 | 483.411 |
| + Recanto | 1 | 98.940 | 16 | 582.351 |
| + Borda | 2 | 172.350 | 17 | 655.761 |
| + Serra | 3 | 219.388 | 18 | 702.799 |
| + Ilha | 4 | 310.438 | 22 | 1.037.515 |
| + Recanto de novo | 4 (nenhum novo) | 310.438 | 22 | 1.037.515 |

**Custo de explorar tudo:** +554 kB sobre a carga inicial — 310 kB dos quatro
mapas detalhados e 244 kB das fotografias de Ilha Grande. Voltar a um lugar já
visto não custa nada.

## 17. SVG e compressão

**Confirmado de novo:** a rota das camadas responde **sem `Content-Encoding`**,
mesmo com `Accept-Encoding: gzip, deflate, br`. O HTML da página sai com gzip.

| Camada | Servido | gzip (nível 9) | brotli | Ganho gzip |
|---|---:|---:|---:|---:|
| Recanto da Serra | 98.640 | 32.704 | 28.163 | −67% |
| Museu Borda da Mata | 73.110 | 24.315 | 20.085 | −67% |
| Serra dos Macacos | 46.738 | 16.244 | 12.964 | −65% |
| Ilha Grande | 90.750 | 30.138 | 25.728 | −67% |
| **Quatro camadas** | **309.238** | **103.401** | **86.940** | **−67%** |

**Potencial:** explorar os quatro lugares passaria de +310 kB para ~+103 kB com
gzip (~+87 kB com brotli).

**Hipótese (não verificada no código do Next):** a resposta do route handler é
pré-renderizada no build e servida sem passar pela compressão aplicada ao HTML.

**Propostas — não aplicadas, aguardam autorização:**

1. **No hospedeiro de produção:** a maioria das CDNs comprime `image/svg+xml`
   automaticamente. É só verificar ao publicar; nenhuma mudança de código.
2. **Arquivo estático gerado:** gravar cada camada em disco (ex.:
   `public/territorio/camadas/<id>.svg`) no build e servir como estático, que o
   `next start` e as CDNs comprimem. Custo: um passo de geração e outra forma de
   bloquear o DEV em produção.
3. **Compressão no próprio handler:** `CompressionStream("gzip")` e
   `Content-Encoding: gzip`. Exige ler `Accept-Encoding`, o que tira a rota do
   modo estático. Não recomendado.

## 18. Limitações

- Ilha Grande: contexto só de linhas (rios e vias); áreas de água e costa fora
  do esquema.
- Rótulos calculados para o desktop; o celular esconde “outras localidades” e
  conta com a folga em volta do pin selecionado.
- A licença ODbL obriga manter a atribuição visível e compartilhar os derivados
  pela mesma licença.
- Servidor dev: um derivado novo só é servido depois de recompilar a rota
  (cache de `generateStaticParams`); em build de produção não acontece.
- A correspondência “localidade confirmada ↔ localidade IBGE” foi feita por nome
  e categoria; Vila Samambaia ficou só como referência cartográfica próxima,
  explicitamente distinta da comunidade visitada.

## 19. Checklist antes de publicar `/territorio`

- [x] Responsável autorizou a exposição pública das quatro coordenadas exatas
      — 2026-09-14.
- [x] Responsável autorizou o versionamento no Git remoto — 2026-09-14.
- [ ] Rota `/territorio` com ADR e tarefa próprias; Home intocada até lá.
- [ ] Decisão sobre o destino definitivo de “Abrir rota” (OSM, Google ou ambos).
- [ ] Compressão das camadas locais (§ Performance).
- [ ] Revisão humana dos nomes de contexto exibidos nos quatro mapas locais.
- [ ] Atribuição formal da fotografia do Recanto.

## 20. Correção da identificação da Serra dos Macacos

Em 2026-09-14, nova instrução humana refinou a identificação territorial: o
trabalho de campo ocorreu em uma pequena comunidade próxima à Vila de
Samambaia, e não propriamente na Vila/Povoado Samambaia. A coordenada humana
confirmada permanece inalterada em `-10.8811, -37.9867`.

O estado anterior — “Povoado Samambaia” — não foi apagado da trilha: ele está
registrado na versão original desta tarefa e no quadro histórico do §2. A fonte
versionada agora diferencia três coisas:

- **lugar visitado:** Serra dos Macacos / comunidade visitada;
- **localização editorial:** Comunidade próxima à Vila de Samambaia, Tobias
  Barreto (SE);
- **referência cartográfica:** Vila Samambaia · IBGE, entidade próxima que não
  representa o lugar.

O pin e os links de rota continuam usando exclusivamente a confirmação humana
`-10.8811, -37.9867`. O ponto IBGE da Vila Samambaia não substitui, corrige nem
desloca essa coordenada. A correção territorial também não reclassifica A04,
entrevistas, formulários, transcrições ou qualquer outro documento restrito.
