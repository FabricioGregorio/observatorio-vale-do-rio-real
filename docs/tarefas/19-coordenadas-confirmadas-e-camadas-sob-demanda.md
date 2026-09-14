# TAREFA 19 — Cartografia Viva — coordenadas confirmadas e camadas sob demanda

**Natureza:** laboratório DEV.

**Data:** 2026-09-14.

**Branch:** `exp/home-v2-territorio-vivo`.

**Base:** Tarefas 17 (`70a00b1`) e 18, ambas sem commit desta rodada.

**Rota:** `/dev/territorio-vivo` e `/dev/territorio-vivo/camada-local/[lugar]`
— somente desenvolvimento; 404 em produção (conferido em build).

**Esta tarefa NÃO autoriza:**

- publicar as coordenadas, o laboratório ou `/territorio`;
- enviar as coordenadas ao remoto público do Git;
- usar Google Maps, iframe, API ou tiles externos;
- instalar biblioteca de mapa;
- publicar conteúdo restrito (relatórios, entrevistas, A04) por causa da
  posição confirmada;
- alterar a Home, a produção, deploy, merge ou PR.

## 1. Decisão humana registrada

- **Em 2026-09-14**, o responsável confirmou diretamente as coordenadas exatas
  dos quatro lugares de campo: Recanto da Serra, Museu Borda da Mata, Serra dos
  Macacos e Ilha Grande.
- **Autoridade:** instrução humana direta nesta sessão. Não são candidatas,
  não vêm de relatório restrito e **não** vêm do IBGE nem do OpenStreetMap.
- **Uso autorizado:** laboratório DEV.
- **Não autorizado ainda:**
  - exposição pública das coordenadas exatas (site, `/territorio`);
  - presença das coordenadas no remoto público do Git.

> **Situação registrada em 2026-09-14:** coordenadas confirmadas pelo
> responsável, autorizadas apenas para laboratório local; publicação pública
> pendente de decisão específica. O commit desta tarefa foi autorizado só para
> a parte versionável, sem as coordenadas e sem os derivados locais que as
> revelam.
>
> **Atualização — 2026-09-14:** Bloqueio resolvido por decisão humana
> posterior: o responsável autorizou explicitamente a publicação pública e o
> versionamento das coordenadas exatas dos quatro lugares, bem como município,
> povoado/localidade e informações de Como chegar. A autorização territorial
> não muda a classificação de documentos (relatórios, entrevistas,
> formulários, fotografias em revisão). A promoção das coordenadas ao modelo
> versionado depende de nova instrução específica; este commit ainda preserva
> só a parte versionável preparada antes dessa decisão.

**Este documento não contém as coordenadas.** Elas vivem no arquivo local
`src/componentes/prototipo/territoriovivo/local/coordenadas-confirmadas.local.json`,
excluído do Git por `.git/info/exclude` (exclusão local, não versionada).

## 2. Coordenada do lugar × dado geográfico derivado

| | Coordenada do lugar | Dado geográfico derivado |
|---|---|---|
| O que é | posição do equipamento/lugar | vias, cursos d'água, localidades, limites |
| Fonte | confirmação humana direta — 2026-09-14 | IBGE (Localidades 2022, malha) e OpenStreetMap |
| Onde vive | arquivo local fora do Git | `entorno-jacare.json` (versionável); `local/entornos/*.local.json` (fora do Git) |
| Símbolo no mapa | pin em gota | quadrados, traços, placas de rodovia |
| Pode ser substituída pela outra? | **não** | **não** |

- No modelo, cada posição carrega `coordenadaConfirmada: true`,
  `fonteDaCoordenada: "confirmação humana direta — 2026-09-14"` e
  `publicacaoPublicaAutorizada: false`. O esquema Zod recusa outra fonte e
  qualquer valor `true` de autorização.
- `pontos.ts`, dado público versionado, continua com `coordenadas: null`.

## 3. Arquivos

| Arquivo | Papel | Git |
|---|---|---|
| `src/componentes/prototipo/territoriovivo/local/coordenadas.ts` | esquema e carga das coordenadas; sem números | versionável |
| `src/componentes/prototipo/territoriovivo/local/coordenadas-confirmadas.local.json` | **as coordenadas** | **fora do Git** |
| `src/componentes/prototipo/territoriovivo/local/composicao.ts` | base espacial: vista, pins, enquadramentos | versionável |
| `src/componentes/prototipo/territoriovivo/local/entornos.ts` | definição dos quatro entornos | versionável |
| `src/componentes/prototipo/territoriovivo/local/entornos/*.local.json` | derivados centrados e sua procedência | **fora do Git** |
| `src/componentes/prototipo/territoriovivo/local/camada.ts` | composição da camada local (pins, referência, rótulos) | versionável |
| `src/componentes/prototipo/territoriovivo/local/svg.ts` | serialização SVG; símbolo do pin | versionável |
| `src/componentes/prototipo/territoriovivo/local/servico.ts` | monta a camada de um lugar para a rota | versionável |
| `src/componentes/prototipo/territoriovivo/local/rota.ts` | destinos de “Abrir rota” | versionável |
| `src/app/dev/territorio-vivo/camada-local/[lugar]/route.ts` | rota DEV sob demanda | versionável |
| `src/componentes/prototipo/territoriovivo/TerritorioVivo.tsx` | pins, estados por lugar, espaços vazios das camadas, fichas | versionável |
| `src/componentes/prototipo/territoriovivo/InteracaoTerritorioVivo.tsx` | busca sob demanda, cache em memória, importação segura | versionável |
| `src/componentes/prototipo/territoriovivo/estilos.ts` | símbolos, transições, legendas | versionável |
| `src/componentes/prototipo/territoriovivo/lugares.ts` | `IDS_DOS_LUGARES`, entorno por lugar; sem coordenada | versionável |
| `src/componentes/prototipo/territoriovivo/local/entorno.ts` | validação por expectativa; código IBGE de 10 dígitos | versionável |
| `scripts/derivar-entorno-local.ts` | `--entorno=<id>`; trava de privacidade | versionável |
| `testes/territorio-vivo-coordenadas.test.ts` | regressões sem números | versionável |
| `testes/territorio-vivo-coordenadas.local.test.ts` | valores literais e varredura do Git | **fora do Git** |
| `testes/territorio-vivo-local.test.ts`, `testes/rota-territorio-vivo.test.ts`, `testes/a11y/territorio-vivo.spec.ts` | atualizados | versionável |

## 4. Pins

- Os quatro lugares ganham pin na coordenada confirmada. A **ponta** do pin é
  a coordenada exata, projetada sem arredondamento.
- A etiqueta falsa de município (Tarefa 17) e a contagem como substituta
  (Tarefa 18) saíram. A contagem ficou como **complemento**, abaixo do nome do
  município, na aproximação de Tobias Barreto.
- Sem o arquivo local, nenhum pin aparece e o mapa volta ao estado sem posição.

## 5. Visão geral e Ilha Grande

- Recanto da Serra, Museu Borda da Mata e Serra dos Macacos caem dentro da
  vista dos cinco municípios e aparecem nela.
- **Ilha Grande cai fora do enquadramento do Vale.** Não é trazida para dentro:
  - na visão geral, o pin fica fora da placa;
  - a lista diz “fora do recorte do Vale”, e a legenda explica;
  - ao selecionar, o mapa se desloca até a posição verdadeira.
- O mapa desenha os municípios que cruzam a vista do Vale **ou** a janela
  regional de algum lugar, para que o deslocamento tenha contexto.
- A ficha de Ilha Grande e a de Serra dos Macacos **não** ganharam município:
  a posição não é usada para deduzir município nem função editorial.

## 6. Uma cartografia que se transforma

| Momento | `data-foco` / `data-escala` | O que se vê |
|---|---|---|
| Vale | `vale` | malha do recorte e pins |
| Lugar selecionado | `lugar-<id>` | aproximação regional (2×) centrada no pin; município em foco quando publicado |
| Camada chegou | `lugar-<id>` + `data-escala="local"` | a malha continua a aproximação e se apaga; o mapa detalhado entra no mesmo lugar |

- O usuário vê uma única cartografia que se transforma. Não há três telas.
- Norte e escala acompanham cada estado.
- Com movimento reduzido, a troca é instantânea: a propriedade de transição é
  anulada, e as regras de estado só mexem em duração e atraso.

## 7. Camadas locais sob demanda

**Arquitetura:**

1. O HTML inicial leva pins, enquadramentos e um `<g>` vazio por lugar com
   entorno.
2. Ao selecionar o lugar, a ilha pede
   `/dev/territorio-vivo/camada-local/<id>`, só ao próprio site.
3. O servidor monta o SVG com o contexto (derivado) e os pins (coordenadas
   confirmadas).
4. A ilha lê o SVG com `DOMParser`, remove `script`, `foreignObject` e
   atributos `on*`, e importa os nós para o `<g>`.
5. Em memória: pedidos simultâneos compartilham a mesma promessa, e uma camada
   carregada não é pedida de novo. Falha mantém a aproximação regional e é
   anunciada.

**Piloto Recanto, comprovado por teste a11y e pela medição de produção (§14):**

| Momento | Pedidos do derivado do Recanto |
|---|---:|
| visão inicial | 0 |
| visão municipal (Tobias Barreto, por outro lugar) | 0 |
| Recanto selecionado, modo local | 1 |
| voltar ao Vale e selecionar de novo | nenhum novo (total 1) |

**Replicação:** só depois do piloto aprovado nos testes, os entornos de
Borda da Mata, Serra dos Macacos e Ilha Grande foram derivados. Com isso,
selecionar Borda da Mata busca **a camada da Borda** (um pedido, próprio), e
nunca a do Recanto.

## 8. Demais entornos

- **Centro:** coordenada confirmada. **Contexto:** IBGE Localidades 2022 e
  OSM, mesma consulta e mesmo método de Jacaré (Tarefa 18). O ponto central
  não é atribuído ao OSM.
- **Enquadramento:** do mesmo tamanho do de Jacaré (~19 × 25 km).
- **Fora do Git:** um arquivo com esse enquadramento revela a posição, então
  derivados e procedências ficam em `local/entornos/`. O script **aborta antes
  de gravar** se o Git não estiver ignorando o destino.
- **Procedência local** de cada derivado: consulta Overpass, data (2026-09-14),
  base OSM 2026-09-14T21:49:02Z, SHA-256 da resposta, SHA-256 do GeoPackage IBGE,
  método, licença, contagens e SHA-256 do derivado.
- **Formato do IBGE:** o arquivo de 2022 usa quatro comprimentos de código em
  Sergipe (7, 9, **10** e 12 dígitos). O de 10 (“Núcleo Urbano”) não constava do
  esquema. A primeira derivação falhou na validação, e o esquema foi corrigido
  ao dado real.
- **Tamanhos:**

| Entorno | Derivado (lido no servidor) | SVG servido |
|---|---:|---:|
| Jacaré (Recanto) | 492.749 bytes — versionável | 98.640 bytes |
| Borda da Mata | 301.008 bytes — local | 72.766 bytes |
| Serra dos Macacos | 175.903 bytes — local | 46.738 bytes |
| Ilha Grande | 471.391 bytes — local | 90.962 bytes |

- **Ponto para decisão humana:** o filtro por radical impede nomes parecidos
  com os dos lugares. Mesmo assim, os mapas detalhados de dois lugares mostram
  localidades do IBGE que instruções anteriores pediam para não associar a
  esses lugares **em arquivo versionado**. Os derivados estão fora do Git, então
  a regra não é violada. Mas, se esses mapas forem publicados, a associação fica
  visível. Também há comunidades tradicionais nomeadas pelo IBGE em um dos
  entornos.

## 9. Mapa local: símbolos

| Coisa | Símbolo | Marcação semântica |
|---|---|---|
| Lugar da pesquisa | pin em gota; selecionado maior, milho, contorno grosso, etiqueta “▸ nome” | `data-tipo="lugar"` |
| Localidade do lugar (IBGE, só no Recanto) | quadrado em anel tracejado, rótulo em itálico “Jacaré · localidade” | `data-tipo="localidade-do-lugar"` |
| Sede municipal | quadrado cheio | `data-tipo="sede"` |
| Outras localidades | quadrado vazado | `data-tipo="localidade"` |
| Rodovia | placa com código, fonte mono | `data-tipo="rodovia"` |

- O pin do Recanto e o ponto IBGE de Jacaré ficam em posições visivelmente
  distintas; testado em unidade e no navegador.
- A nota “localização exata do equipamento não publicada” foi retirada: deixou
  de ser verdadeira no laboratório.

## 10. Como chegar e “Abrir rota”

- A ficha mostra localidade e referência de acesso quando existem (Recanto,
  A02) e, para todo lugar com posição, **dois links explícitos**: “Abrir rota no
  OpenStreetMap” e “Abrir rota no Google Maps”.
- Nenhum carregamento antes do clique: âncora comum, sem iframe, sem script,
  sem prefetch; `target="_blank"`, `rel="noopener noreferrer external"`,
  `referrerPolicy="no-referrer"`. Teste a11y confirma zero requisição externa.
- Comparação para a decisão do destino definitivo:

| Critério | OpenStreetMap | Google Maps |
|---|---|---|
| rastreio antes do clique | nenhum | nenhum |
| rastreio depois do clique | baixo; sem conta | alto; cookies e perfil |
| celular | site; não abre app nativo por padrão | abre o app instalado |
| familiaridade do público | menor | maior |
| rota em estrada vicinal | mais fraca | melhor cobertura rural |

- **Recomendação do laboratório:** manter os dois, OpenStreetMap primeiro, com
  aviso de serviço externo. A decisão é humana.

## 11. Dark mode

- Tokens e melhoria de borda/sombra da Tarefa 17 preservados, sem voltar à
  borda verde pouco visível.
- Verificado no escuro, mapa detalhado do Recanto (teste a11y):
  - rodovia e limite ≥ 3:1;
  - nomes ≥ 4,5:1;
  - contorno do pin selecionado ≥ 3:1;
  - texto da etiqueta sobre o milho ≥ 4,5:1;
  - estrada vicinal visível e com contraste menor que a rodovia;
  - borda da placa ≥ 1,8:1.
- O pin selecionado não depende de cor: tamanho, contorno e etiqueta com “▸”.

## 12. Mobile

- Mapa → faixa horizontal de lugares → ficha, mantidos.
- A 375 px o mapa detalhado conserva ~341 × 463 px. Pin, etiqueta, localidade
  do lugar, sede e rodovias ficam legíveis; “outras localidades” saem por CSS.

## 13. Acessibilidade

- Lista e fichas continuam funcionando sem JavaScript. Sem JavaScript, não há
  camada local.
- O título do SVG e o anúncio `aria-live` mudam na aproximação e de novo quando
  o mapa detalhado chega (ou falha).
- Movimento reduzido com troca instantânea, testada sem espera.

## 14. Performance — build de produção local

**Método:** o mesmo das Tarefas 17 e 18.

- Cópia descartável do repositório no scratchpad, com
  `pnpm install --frozen-lockfile --offline`.
- Rota temporária `/medicao-territorio-vivo` com o mesmo componente.
- **Build 1**, sem alteração: `/dev/territorio-vivo` e a rota das camadas →
  **404**.
- **Build 2**, com a trava da rota de camadas desligada **só na cópia**, para
  medir o carregamento sob demanda. `generateStaticParams` gerou as quatro
  camadas como estáticas.
- Contexto de navegador sem cache por estado, 1440 px, leitura por
  `performance.getEntriesByType`. A cópia foi apagada.

Bytes transferidos, salvo indicação:

| | Tarefa 18 (camada embutida) | Vale | Municipal (Borda, camada bloqueada) | Local Recanto | Recanto, volta e reseleciona | Local Borda | Local Serra | Local Ilha |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| HTML transferido | 99.525 | 41.929 | 41.929 | 41.929 | 41.929 | 41.929 | 41.929 | 41.929 |
| HTML decodificado | 334.879 | 195.948 | 195.948 | 195.948 | 195.948 | 195.948 | 195.948 | 195.948 |
| JavaScript | 142.322 (8) | 142.911 (8) | idem | idem | idem | idem | idem | idem |
| Camada local transferida | embutida | 0 | 0 (1 pedido, abortado) | 98.940 | 98.940 | 73.066 | 47.038 | 91.262 |
| Pedidos de camada | — | 0 | 1 (o da própria Borda) | 1 | **1** | 1 | 1 | 1 |
| SVG da camada no DOM (caracteres) | 96.025 | 0 | 0 | 98.829 | 98.829 | 72.943 | 46.893 | 91.239 |
| Malha no DOM (caracteres) | 20.624 | 31.271 | 31.271 | 31.271 | 31.271 | 31.271 | 31.271 | 31.271 |
| Imagens | 182.598 (1) | 182.598 (1) | 182.598 (1) | 182.598 (1) | 182.598 (1) | 182.598 (1) | 182.598 (1) | 426.264 (4) |
| Requisições | 15 | 15 | 16 | 16 | 16 | 16 | 16 | 19 |
| Requisições externas | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Total transferido | 540.106 | 483.099 | 483.099 | 582.039 | 582.039 | 556.165 | 530.137 | 818.027 |

**Leitura dos números:**

- **Visão inicial:** o HTML transferido caiu **58%** (99,5 → 41,9 kB). Quem nunca
  abre um mapa detalhado não paga por ele.
- **Sob demanda:** cada mapa detalhado custa um pedido, de 47 a 99 kB, só ao
  selecionar o lugar. Voltar e reselecionar não repete o pedido.
- **Malha maior:** a malha cresceu 10,6 kB de DOM, porque inclui os municípios das
  janelas regionais (ex.: o entorno de Ilha Grande, fora do Vale).
- **Ilha Grande:** o total sobe por outro motivo — as três fotografias
  públicas da ficha carregam quando ela fica visível.
- **Compressão:** a rota serve o SVG **sem compressão** (transferido ≈
  decodificado). Na Tarefa 18, a mesma camada ficava em ~32 kB com gzip.
  Registrado; não otimizado nesta rodada.

## 15. Testes

| Regressão pedida | Onde |
|---|---|
| os quatro lugares usam exatamente as coordenadas fornecidas | `territorio-vivo-coordenadas.test.ts` (igualdade exata com o arquivo) e `.local.test.ts` (valores literais) |
| nenhuma coordenada é substituída por IBGE/OSM | unidade: nenhuma posição coincide com localidade ou vértice do derivado; esquema recusa outra fonte |
| Recanto e Borda em posições distintas | unidade e a11y |
| seleção centraliza a região correta | unidade (exato) e a11y (ponta do pin a menos de 1 px do centro da vista, camada bloqueada) |
| Ilha Grande não é colocada no recorte | unidade e a11y |
| pin e localidade semanticamente distintos | unidade (SVG) e a11y (`data-tipo`, forma, distância) |
| lazy loading funciona | a11y: 0 → 0 → 1 → 1; medição de produção (§14) |
| nenhuma camada detalhada na visão inicial | a11y: grupos vazios e HTML sem vias nem localidade do lugar |
| nenhum arquivo candidato ao Git contém as coordenadas | `.local.test.ts`: varredura de `git ls-files --cached --others --exclude-standard` por **par** latitude/longitude completo. Um eixo isolado não é prova de vazamento: em dado geográfico denso ele coincide por acaso (ex.: dois vértices OSM em `entorno-jacare.json`, verificados em 2026-09-14) |

## 16. Limitações

- **Coordenadas fora do Git:** outra máquina não reproduz os pins sem receber
  o arquivo local por canal privado. Os testes dependentes pulam sem ele.
- **Servidor dev:** `generateStaticParams` fica em cache; um derivado novo só é
  servido depois de recompilar a rota. Em build de produção a lista é
  calculada no build.
- **Compressão da rota de camadas:** ausente (§14).
- **Ilha Grande:** o contexto é de linhas (rios e vias). Áreas de água e linha
  de costa não entram no esquema atual.
- **Rótulos:** calculados para o desktop; no celular parte é só escondida.
- **Nomes sensíveis** no contexto de dois entornos (§8).
- **Licença ODbL** dos derivados precisa entrar na decisão de publicação.
- Sem JavaScript não há mapa detalhado.

## 17. Checklist antes de qualquer publicação

- [x] **Responsável autorizou a exposição pública das quatro coordenadas
      exatas?** — sim, 2026-09-14 (decisão posterior; ver §1).
- [x] Responsável autorizou que as coordenadas fiquem no **remoto público do
      Git**? — sim, 2026-09-14 (decisão posterior; ver §1).
- [ ] Decisão sobre exibir, perto dos pins, localidades do IBGE que instruções
      anteriores pediam para não associar aos lugares (§8).
- [ ] Decisão sobre o destino de “Abrir rota” (OpenStreetMap, Google Maps ou
      ambos).
- [ ] Decisão sobre município editorial de Serra dos Macacos e Ilha Grande — a
      coordenada não decide isso.
- [ ] ODbL aceita para os derivados publicados.
- [ ] Compressão da rota de camadas antes de qualquer uso fora do laboratório.
- [ ] Rota `/territorio` com ADR e tarefa próprias; Home intocada até lá.
