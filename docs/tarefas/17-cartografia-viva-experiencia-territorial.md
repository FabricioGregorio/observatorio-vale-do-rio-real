# TAREFA 17 — Cartografia Viva — experiência territorial

**Natureza:** laboratório DEV e registro de pesquisa documental.

**Data:** 2026-09-13.

**Branch:** `exp/home-v2-territorio-vivo`.

**Rota:** `/dev/territorio-vivo` — somente desenvolvimento; responde 404 em
produção (conferido em build de produção local).

> **Continuidade:** aprovada como base do experimento, não para publicação. A
> evolução segue na [Tarefa 18](./18-camada-geografica-local.md). Nela, as
> etiquetas de lugar dentro do município (§9.1) foram retiradas e substituídas
> por uma contagem, e entrou a camada geográfica local do Recanto da Serra.
>
> **Atualização — 2026-09-14:** o que aqui aparece como “município não
> publicado” e “nenhuma coordenada” valeu até a decisão humana posterior. O
> responsável autorizou publicar as coordenadas, o município, a localidade e
> Como chegar dos quatro lugares — antes só local (Tarefa 19), agora versionados
> (Tarefa 20). Os documentos restritos continuam restritos.

**Esta tarefa NÃO autoriza:**

- criar a rota pública `/territorio`;
- alterar a Home pública ou `/dev/home-livre`;
- publicar dado restrito ou coordenada;
- instalar dependência;
- alterar banco ou R2;
- fazer deploy, merge ou abrir PR.

## 1. Propósito

A Cartografia Viva deixa de ser só “o mapa do recorte na Home” e passa a ser
estudada como **interface espacial** para explorar lugares, equipamentos,
entrevistas, comparações e evidências da pesquisa. É a candidata à futura
`/territorio`.

A Home v2 (Tarefa 16) mantém só uma apresentação territorial resumida. Quando
`/territorio` existir, a Home ganha uma chamada para a experiência completa.

## 2. Regra de publicação deste laboratório

O repositório tem remoto público. Por isso:

- a interface e o código usam **somente** material público ou já versionado;
- achados em fontes restritas (transcrições, relato técnico não publicado,
  planilhas) aparecem aqui **só como categoria** — “existe indicação de
  localidade” —, sem reproduzir o conteúdo;
- nenhuma coordenada é afirmada: o mapa marca **municípios**, não pontos.

## 3. Cartografia existente — auditoria

| Peça | Arquivo | Papel | Reuso no laboratório |
|---|---|---|---|
| Malha + nomes + recorte | `src/dados/territorio/mapa.ts`, `recorte.ts`, `validacao.ts`, `fontes.ts` | 75 municípios IBGE, vínculos editoriais, validação Zod | **reusado integralmente** |
| Projeção | `src/dados/territorio/projecao.ts` | equirretangular corrigida, 1 casa decimal | **reusada**; escala em km derivada dela |
| Pontos de visita | `src/dados/territorio/pontos.ts` | 4 pontos, município quando documentado, coordenadas `null` | **reusado** como fonte de município |
| Composição H2 | `componentes/prototipo/territorio/TerritorioPrototipo.tsx` via `componentes/territorio/TerritorioCartografico.tsx` | Sergipe inteiro, seleção de município, painel, índice | não reusada: outro papel (município × lugar) |
| Ilha de interação | `componentes/mapa/MapaInterativo.tsx` | promove SVG e lista a `listbox` sem renderizar nada | **padrão reusado** (ilha que não renderiza); código novo |
| Estilo do mapa | `componentes/mapa/estilosDoMapa.ts` | paleta **invariante de tema** (pedra, carvão, milho, mata, anil) | canais reusados como ideia (preenchimento, hachura, traço); cores não |
| Estilo H2 | `componentes/territorio/estilosDoTerritorio.ts` | inclinação 3D, sombra carvão, moldura em gradiente | não reusado |

### 3.1 Por que a cartografia atual perde definição no escuro

- a paleta do mapa é invariante: a placa continua clara (pedra, milho) sobre a
  página noturna;
- a sombra é `drop-shadow` em carvão, e preto sobre noite não separa nada;
- a moldura usa `--color-borda`, cerca de 1,5:1 no escuro;
- a hachura é em mata, escura, e quase some sobre fundos escuros.

### 3.2 Testes da cartografia existente

- `testes/territorio.test.ts`: 44 declarações
- `testes/rota-territorio-prototipo.test.ts`: 2
- `testes/a11y/mapa.spec.ts`: 20
- `testes/a11y/territorio-prototipo.spec.ts`: 11

## 4. Fontes territoriais consultadas

| Fonte | Natureza | O que sustenta |
|---|---|---|
| `recorte.ts`, `pontos.ts` (versionados) | pública no repositório | 5 municípios do Vale; São Cristóvão como comparação; Recanto e Borda da Mata em Tobias Barreto; Serra dos Macacos e Ilha Grande sem município |
| A02 — Relatório Técnico Recanto da Serra | **público** no acervo | nome completo, povoado Jacaré, caracterização, receita e despesa do período, ausência de transporte do centro da cidade |
| Indicadores H4 (`indicadores/derivados.ts`) | agregado versionado | recorte com os dois equipamentos culturais |
| Fotografias H3 (`pesquisa/derivados.ts`) | derivados públicos | três fotografias de Ilha Grande |
| Foto do Hero | derivado público | pertence ao conjunto de campo do Recanto; atribuição formal pendente |
| A03 — Relatório Borda da Mata | restrito | existência confirmada; conteúdo não usado |
| A04 — Relato Técnico Serra dos Macacos | restrito; privacidade revisada; publicação depende de decisão humana | contém indicação de município, localidade e acesso — **não reproduzida** |
| Entrevistas 02, 05 e 08 (transcrições) | restritas | contêm indicações de localidade — **não reproduzidas** |
| EXIF das fotografias originais | corpus privado | bloco GPS presente em 7 JPEG da pasta de campo do Recanto e em 6 de uma entrevista institucional; ausente nos JPEG de Ilha Grande; HEIC não lidos. **Valores não lidos e não aprovados como coordenada** |
| IBGE — API de localidades | pública (leitura, nada gravado) | Tobias Barreto tem três distritos oficiais: Tobias Barreto, Samambaia, Monte Coelhos |
| IBGE — malha por distrito | pública | a requisição testada (`intrarregiao=distrito` na malha municipal) respondeu 400; camada não disponível nesse formato |

## 5. Matriz dos quatro lugares

| Lugar | Fontes | Localização pública | Coordenadas | Material público | Material restrito | Dados públicos | Fotografias | Lacunas |
|---|---|---|---|---|---|---|---|---|
| **Recanto da Serra** — Ecoparque e Museu Recanto da Serra | A02; B04; formulários; fotos | Tobias Barreto; povoado Jacaré (A02) | nenhuma aprovada; GPS no EXIF de originais, não usado | A02 (PDF, CC BY-SA 4.0); foto do Hero (atribuição pendente) | entrevista; formulários; demais fotos | receita R$ 15.500,00 e despesa R$ 15.912,00, de 21/07 a 21/12/2025 (A02) | 1 derivado público; várias aptas sem derivado | endereço; referência de chegada além do A02; coordenada; decisão sobre a atribuição da foto |
| **Museu Borda da Mata** — Centro Cultural e Museu Borda da Mata | A03; B03; formulários; 7 fotos | Tobias Barreto | nenhuma | nenhum documento próprio | relatório (dados pessoais); entrevista; formulários; fotos | nenhum por lugar | 7 no corpus, nenhuma liberada | localidade e acesso públicos; tratamento do A03; revisão das fotos |
| **Serra dos Macacos** | A04 | **não publicada** (`municipioId: null`) | nenhuma | nenhum | A04 (candidato a publicação, com decisão humana) | nenhum | nenhuma pasta de fotos no corpus | decisão sobre publicar A04 e o município; imagens |
| **Ilha Grande** | B06 (entrevista); 10 fotos | **não consolidada** (`municipioId: null`) | nenhuma; os JPEG não têm GPS | 3 derivados fotográficos | entrevista; demais fotos | nenhum | 3 públicas | município documentado; eventual papel comparativo precisa de decisão |

## 6. Outros lugares e referências — classificação

Nada abaixo entra no mapa sem nova decisão.

| Item | Tipo | Base | Classificação |
|---|---|---|---|
| Secretaria de Cultura e Prefeitura (Tobias Barreto) | instituição entrevistada | `recorte.ts` | evidência do município; **não é ponto** |
| Secretaria Municipal de Cultura (Tomar do Geru) | instituição entrevistada | `recorte.ts` | evidência do município |
| Fundação de Cultura e Diretoria de Turismo (São Cristóvão) | instituições entrevistadas | `recorte.ts`, mapa de fontes | **comparação**, fora do recorte |
| Itabaianinha | entrevista prevista, não realizada (B07) | inventário | sem vínculo de campo |
| Distritos Samambaia e Monte Coelhos | divisão oficial IBGE | API de localidades | candidata a camada de orientação futura |
| Povoados de origem de trabalhadores citados no A02 | referência territorial | A02 público | contexto do Recanto; não é ponto de pesquisa |
| Fórum “Movimento Turístico e Cultural do Vale do Rio Real” | articulação | A02 público | referência institucional, sem geografia |
| Atividades do Recanto (Igreja de Pedras, museus, memorial, Sala da Mensagem de Silo, trilhas) | atividades registradas | `indicadores/derivados.ts` | conteúdo da ficha do Recanto; **não viram pontos** |
| Localidades, trilhas, capelas e povoados citados em fontes restritas | referência territorial | entrevistas e A04 | **não reproduzidos**; lista entregue só no relatório da sessão |

## 7. Geografia disponível

- **No repositório:** malha municipal IBGE (75 municípios) e nomes. Não há
  vias, estradas, hidrografia, limite estadual com a Bahia, localidades,
  povoados nem coordenadas aprovadas.
- **É possível derivar localmente, sem dado novo:**
  - enquadramento por município;
  - escala em km a partir da projeção;
  - orientação norte;
  - rótulos dos municípios vizinhos.
- **Não é possível hoje:** um “mapa local” com vias e povoado.

### 7.1 Opções abertas para a camada local (não baixadas)

| Opção | Conteúdo | Licença / cuidado | Custo |
|---|---|---|---|
| IBGE BC250 / bases cartográficas | vias, hidrografia, localidades | dado público; confirmar termos e escala | derivado local em SVG; exige procedência em `fontes.ts` |
| IBGE — divisão por distrito | limites de distrito | a verificar pelo formato correto da API | pequeno |
| OpenStreetMap (extrato local) | vias, povoados, rio Real | ODbL: atribuição e compartilhamento do derivado | derivado local; sem tiles |
| Tiles externos (OSM, Google) | mapa pronto | envio do IP do visitante a terceiros; cookies e rastreamento (Google); dependência; estética alheia | JS e requisições externas; conflita com a regra de não rastrear |

**Recomendação:** base derivada localmente, gerada por script versionado com
procedência. Nenhum serviço externo em tempo de execução.

## 8. Arquitetura do protótipo

| Arquivo | Papel |
|---|---|
| `src/app/dev/territorio-vivo/page.tsx` | rota DEV com guarda de 404 |
| `src/componentes/prototipo/territoriovivo/TerritorioVivo.tsx` | Server Component: mapa, lista, fichas; enquadramentos calculados em build |
| `src/componentes/prototipo/territoriovivo/InteracaoTerritorioVivo.tsx` | ilha cliente sem renderização; tabs, teclado, anúncio, URL |
| `src/componentes/prototipo/territoriovivo/geometria.ts` | funções puras: caixas, enquadramento, km por unidade, barra de escala |
| `src/componentes/prototipo/territoriovivo/lugares.ts` | os quatro lugares, só com campos públicos |
| `src/componentes/prototipo/territoriovivo/estilos.ts` | tokens locais `--tv-*`, claro e escuro |
| `testes/rota-territorio-vivo.test.ts` | guarda, geometria, limites de dado |
| `testes/a11y/territorio-vivo.spec.ts` | visão geral, teclado, sem-local, movimento reduzido, 375/1440 × claro/escuro |

## 9. UX

### 9.1 Estados

- `vale` — os 5 municípios do recorte; marca numérica em Tobias Barreto
  (2 lugares).
- `<código IBGE>` — aproximação do município do lugar:
  - enquadramento centrado no rótulo, com escala de cerca de 2×;
  - municípios vizinhos atenuados;
  - anel tracejado no município;
  - marca preenchida;
  - lugares do município como etiquetas clicáveis;
  - nota “posição no município não confirmada”;
  - barra de escala recalculada.
- `sem-local` — lugar sem localização publicada: o mapa não aproxima, atenua o
  desenho e diz “Sem localização publicada”.

### 9.2 Ficha

A ficha é trocada inteira a cada seleção. Seções só aparecem quando existem:

- tipo e município;
- nome completo;
- lacuna de localização;
- descrição com fonte;
- relação com a pesquisa e materiais com estado;
- status documental;
- registros do período;
- fotografias;
- como chegar.

### 9.3 Como chegar

Hoje só no Recanto: localidade pública (povoado Jacaré) e a observação do A02
sobre transporte. “Rota externa” aparece como indisponível até haver coordenada
confirmada. Nenhum link externo com coordenada.

### 9.4 Mobile

Mapa → lista de lugares em duas colunas → ficha contextual.

## 10. Acessibilidade

- **Mapa nunca é a única interface:** lista textual e fichas funcionam sem
  JavaScript, como âncoras e seções em sequência.
- **Com JavaScript:** `tablist`/`tab`/`tabpanel` com ativação manual (setas
  movem, Enter/Espaço selecionam), `aria-selected`, região `aria-live` e
  título do SVG atualizado a cada estado.
- **Selecionado não depende de cor:**
  - lista: borda, faixa lateral e o texto “· selecionado”;
  - mapa: anel tracejado, marca com contorno e prefixo “▸” na etiqueta.
- **Movimento reduzido:** a duração vem de `--duracao-painel`, zerado pelos
  tokens; a troca de estado é imediata e verificada em teste.
- Um único `h1`; nenhuma imagem sem `alt`; sem transbordo em 375 e 1440, nos
  dois temas.

## 11. Dark mode — tokens locais

Todos em `.tv`, derivados de papéis globais por `color-mix`, sem cor literal e
sem mudar `tokens.css`:

| Token | Função |
|---|---|
| `--tv-borda-plano` | borda da placa do mapa (22% do texto no claro; 42% no escuro) |
| `--tv-filete` | filete interno claro no escuro, para separar sem depender de preto |
| `--tv-sombra` | sombra (carvão 16% no claro; 70% no escuro, sempre acompanhada do filete) |
| `--tv-terra`, `--tv-vale`, `--tv-hachura` | preenchimentos e hachura, com mais contraste no escuro |
| `--tv-limite`, `--tv-limite-externo`, `--tv-stroke-interno` | limites do Vale, dos demais municípios e traço interno |
| `--tv-pin`, `--tv-pin-texto`, `--tv-pin-selecionado`, `--tv-pin-selecionado-texto` | marca e marca selecionada |
| `--tv-contorno-foco`, `--tv-hover` | foco, anel e hover |

## 12. Tecnologia

- Nenhuma dependência nova: SVG no servidor, CSS e uma ilha cliente mínima.
- A transição geral → lugar é uma transformação CSS do grupo do mundo, com
  contraescala de marcas e rótulos.
- **Limite encontrado:** sem camada geográfica local, a “aproximação” só pode
  chegar ao nível do município. Isso não pede biblioteca de mapa; pede dado
  derivado localmente (§7.1).

## 13. Performance — build de produção local

Método: `next build` + `next start` numa cópia descartável fora do repositório,
com rota temporária `/medicao-territorio-vivo` renderizando o mesmo
componente. Medição por `performance.getEntriesByType`, contexto sem cache,
após rolar a página. A cópia foi apagada.

| | Casca (`/observatorio`) | Home pública (cartografia atual) | Laboratório territorial |
|---|---:|---:|---:|
| Total transferido | 260.363 | 861.652 | 469.770 |
| HTML transferido / decodificado | 3.961 / 17.596 | 76.280 / 333.294 | 29.336 / 122.324 |
| JavaScript | 140.862 (7 chunks) | 149.656 (8) | 142.296 (8) |
| Chunk próprio do mapa | — | 8.794 | 1.434 |
| SVG no DOM (caracteres) | 0 | 70.293 (mapa: 65.874) | 23.025 |
| Imagens | 0 | 371.240 (1440) | 182.598 (foto da ficha do Recanto) |
| Fontes | 108.972 | 108.972 | 108.972 |
| Requisições | 13 | 31 | 15 |

**Leitura dos números:**

- A ilha do laboratório custa 1,4 kB, contra 8,8 kB da ilha atual.
- O SVG caiu de 70 kB para 23 kB, porque só os municípios que cruzam a vista
  do Vale são desenhados.
- A página total é menor que a Home, mas não é comparável a ela: são
  composições diferentes.
- A foto vertical da ficha do Recanto carrega antes da hidratação, porque sem
  JavaScript as fichas nascem visíveis. Registrado como ajuste futuro.

## 14. Privacidade

- Nenhum dado restrito na interface, no código ou neste documento.
- Nenhuma coordenada, inclusive as presentes no EXIF de originais.
- Nenhum nome de pessoa na interface.
- Material restrito aparece só como estado (“Restrito”), sem link.
- Serra dos Macacos e Ilha Grande não são posicionados.

## 15. Testes executados

| Verificação | Resultado |
|---|---|
| `pnpm tipos` | passou |
| `pnpm lint` | passou (avisos preexistentes) |
| `testes/rota-territorio-vivo.test.ts` | 12/12 |
| `testes/a11y/territorio-vivo.spec.ts` | 8/8 |
| Guarda de produção | `/dev/territorio-vivo` e `/dev/home-livre` → 404 no build |

## 16. Critérios para a futura `/territorio`

- [ ] Decisão de arquitetura de rota (ADR-017 já prevê `Território`) e tarefa
      própria com arquivos permitidos.
- [ ] Decisão humana sobre a localização pública de Serra dos Macacos e de
      Ilha Grande, e sobre publicar A04.
- [ ] Coordenadas confirmadas em campo ou por documento, com decisão de
      publicar — ou manutenção honesta do nível município. *(Confirmadas por
      instrução humana em 2026-09-14, só para DEV — ver Tarefa 19.)*
- [x] **Responsável autorizou a exposição pública das quatro coordenadas
      exatas?** — sim, 2026-09-14 (Tarefa 19, §1).
- [ ] Camada geográfica local derivada (vias, localidades, rio Real) com
      procedência, licença e teste, se a experiência local for mantida.
- [ ] Decisão sobre a atribuição formal da fotografia do Recanto.
- [ ] Textos das fichas aprovados; hoje são texto de laboratório com fonte.
- [ ] Fotografias adicionais com derivado, alt, crédito e revisão de pessoa
      identificável.
- [ ] Carregamento das imagens das fichas só quando a ficha for exibida.
- [ ] Relação com a Home v2: apresentação resumida e chamada para
      `/territorio` apenas quando a rota existir.
- [ ] `pnpm verificar` verde e medição no ambiente de integração.
