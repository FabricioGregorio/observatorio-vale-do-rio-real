# TAREFA 21 — Cartografia Viva — candidata editorial da página Território

**Natureza:** laboratório DEV. Consolidação editorial, visual e de experiência
para futura integração pública, sem autorização de publicação.

**Data:** 2026-09-14.

**Branch:** `exp/home-v2-territorio-vivo`.

**Base:** `09b76c4 fix: corrige referencia territorial da Serra dos Macacos`
(Tarefas 17 a 20).

**Rota avaliada:** `/dev/territorio-vivo` — somente desenvolvimento; continua
indisponível em produção.

> Esta tarefa preserva integralmente as decisões cartográficas das Tarefas 19
> e 20. Não muda coordenadas, mapas derivados, procedência, classificação de
> documentos nem o recorte territorial.

## 1. Objetivo

Transformar o laboratório da Cartografia Viva em uma candidata editorial
coerente para uma futura página `/territorio`, com linguagem pública,
hierarquia mais clara e exploração confortável em desktop e celular.

Esta tarefa **não autoriza**:

- criar ou publicar `/territorio`;
- alterar Home, menu ou navegação pública;
- deploy, commit, push, PR ou merge;
- instalar dependência;
- alterar coordenadas, mapas locais, procedência IBGE/OSM ou links de rota;
- reclassificar A04, entrevistas, formulários, transcrições, fotografias ou
  qualquer outro documento restrito ou em revisão.

## 2. Auditoria anterior aos ajustes

Problemas observados na candidata anterior:

- a faixa de laboratório concorria com o conteúdo e o título era longo;
- a abertura não explicava com rapidez o recorte do Vale nem a presença de
  Ilha Grande fora dele;
- a ficha tinha aparência de formulário técnico e repetia metadados;
- a visão geral repetia evidências já presentes nas fichas e não encerrava a
  narrativa editorial;
- a legenda local tinha conceitos demais e a procedência ocupava espaço
  desproporcional;
- “Como chegar” dava peso excessivo aos serviços externos de navegação;
- em 375 px, mapa, procedência e legenda afastavam o seletor, e o cartão ativo
  podia ficar parcialmente fora da área visível;
- fichas sem material público pareciam incompletas, embora a ausência de
  conteúdo publicável não seja erro;
- a distinção entre a comunidade visitada na Serra dos Macacos e a Vila
  Samambaia do IBGE precisava de leitura editorial mais imediata.

## 3. Arquitetura editorial proposta

A página candidata passa a seguir esta sequência:

1. abertura curta: “Cartografia Viva” e uma frase sobre lugares, equipamentos
   e evidências da pesquisa;
2. contexto territorial: cinco municípios no recorte do Vale e Ilha Grande em
   São Cristóvão, fora desse recorte;
3. mapa geral ou mapa detalhado do lugar selecionado;
4. procedência cartográfica e legenda;
5. seletor horizontal “Explore os lugares”;
6. ficha editorial do território ou do lugar selecionado;
7. fechamento “Uma leitura espacial da pesquisa”, esclarecendo que os pontos
   documentam a pesquisa e não constituem roteiro turístico.

Os novos textos editoriais permanecem marcados no componente como
`data-copy-editorial="proposta"`, atributo de rastreabilidade da rodada em que
foram propostos. Em 2026-09-15, o responsável **aprovou humanamente** as duas
copies da abertura:

- “Uma leitura espacial dos lugares, equipamentos e evidências que fizeram
  parte da pesquisa do Observatório.”;
- “Escolha um lugar para aproximar o mapa e consultar seus registros
  públicos.”

Também foi aprovado o fechamento editorial “Uma leitura espacial da
pesquisa”. As três formulações deixam de ser pendência de aprovação humana da
página; continuam sendo copy editorial, não fatos extraídos de
documento-fonte.

## 4. Fichas dos quatro lugares

As fichas priorizam nome, localização e vínculo com o campo. Só materiais
públicos aparecem como evidências:

| Lugar | Conteúdo público apresentado | O que não é exibido |
|---|---|---|
| Recanto da Serra | A02, descrição, receita/despesa e foto já usada no Hero, com pendência de atribuição visível | entrevista e formulários restritos |
| Museu Borda da Mata | identificação territorial e acesso cartográfico | relatório, entrevista, formulários e fotografias sem publicação |
| Serra dos Macacos | identificação territorial, referência cartográfica e referência de acesso autorizada | A04 e qualquer conteúdo restrito |
| Ilha Grande | identificação territorial e três fotografias públicas | entrevista restrita |

A ausência de uma seção de evidências em Borda da Mata ou Serra dos Macacos é
tratada como integridade editorial, não como erro nem como convite a preencher
lacunas com documentos restritos.

## 5. Serra dos Macacos

A candidata preserva a correção humana datada de 2026-09-14:

- **nome:** Serra dos Macacos;
- **município:** Tobias Barreto;
- **localização:** Comunidade próxima à Vila de Samambaia;
- **referência cartográfica:** Vila Samambaia · IBGE;
- **coordenada humana confirmada:** `-10.8811, -37.9867`.

A Vila Samambaia é apresentada como referência territorial próxima e não como
o lugar visitado. O pin e as rotas continuam saindo exclusivamente da
coordenada humana. “Povoado Samambaia” não foi reintroduzido.

## 6. Como chegar

“Como chegar” foi reduzido a apoio documental:

- localização documental;
- referência cartográfica, quando necessária para evitar ambiguidade;
- referência de acesso, quando há texto público autorizado;
- links opcionais para OpenStreetMap e Google Maps.

Os serviços externos continuam sem iframe, script, prefetch ou requisição
antes do clique. Os atributos de segurança e as coordenadas das rotas não
mudaram.

## 7. Mapa, legenda e procedência

- Os quatro mapas locais, o lazy loading e os símbolos permanecem inalterados.
- A legenda do mapa detalhado foi condensada para cinco conceitos: lugar
  visitado, localidade do lugar, sede, outra localidade ou referência IBGE e
  rodovia principal.
- A procedência visível foi encurtada sem retirar IBGE, OpenStreetMap, ODbL,
  link de atribuição ou a informação de que o pin vem de confirmação humana.
- A visão geral mantém sua legenda própria, com três conceitos.

## 8. Navegação futura — proposta, não implementação

**Menu:** quando `/territorio` existir e tiver autorização de publicação,
“Território” deve entrar como item principal. Essa opção é coerente com a
ADR-017 e com o papel estrutural do recorte territorial; escondê-la em menu
secundário reduziria uma dimensão central da pesquisa.

**Home:** recomenda-se uma chamada textual média, “Explorar o território”,
associada à apresentação já existente do território. Não se recomenda uma nova
miniatura nesta etapa: a Home já contém cartografia e mídia, e duplicar imagem
aumentaria densidade visual e transferência sem acrescentar evidência.

Nenhuma dessas propostas foi aplicada.

## 9. Mobile, dark mode, acessibilidade e movimento

- Em 375 px, o cartão selecionado é centralizado horizontalmente sem provocar
  deslocamento vertical da página.
- A ordem mapa → seletor → ficha permanece linear e compreensível.
- Dark mode preserva os tokens, contrastes e sinais não dependentes de cor.
- O título principal é único; a faixa visual DEV foi removida da composição.
- A navegação por abas, teclado, foco visível, `aria-live`, links externos e
  movimento reduzido continuam preservados.
- Um link “Voltar à visão do território” retorna à visão geral sem recarregar a
  página.

## 10. Performance

### Primeira avaliação

Na avaliação inicial desta tarefa, a ausência de regressão havia sido inferida
pela falta de imagens, mapas, fontes, bibliotecas, rotas ou chamadas externas
novas. Essa inferência foi substituída pela medição real abaixo.

### Medição real — 2026-09-15

Mesmo método comparável das Tarefas 18–20: cópia descartável, build completo de
produção local, rota temporária `/medicao-territorio-vivo` com o mesmo
componente e liberação das camadas somente na cópia. Nenhuma credencial foi
copiada: a consulta de acervo, irrelevante para a rota medida, ficou fechada em
vazio apenas no artefato descartável. O inventário veio do navegador e os
bytes transferidos de respostas reais com compressão, na convenção do Resource
Timing usada na medição anterior.

| Métrica | Tarefa 20 | Tarefa 21 | Delta |
|---|---:|---:|---:|
| HTML | 42.241 | 42.698 | +457 |
| JavaScript | 142.911 | 143.028 | +117 |
| CSS | 6.689 | 7.037 | +348 |
| Imagens | 182.598 | 182.598 | 0 |
| Fontes | 108.972 | 108.972 | 0 |
| Requisições | 15 | 15 | 0 |
| **Total transferido** | **483.411** | **484.333** | **+922 (+0,19%)** |

Na carga inicial houve **zero** pedido de camada local e **zero** serviço
externo. Selecionar Recanto gerou exatamente um fetch, somente para
`recanto-da-serra`, com **98.940 bytes transferidos**, igual à Tarefa 20. Total
após essa seleção: **583.273 bytes**. Não há regressão relevante e nenhuma
otimização foi feita.

## 11. Validações e capturas

A rodada deve encerrar com:

- `pnpm tipos`;
- `pnpm lint`;
- testes territoriais pertinentes;
- `testes/a11y/territorio-vivo.spec.ts`;
- `pnpm build`;
- `git diff --check`;
- inspeção visual em 1440 px claro e escuro e em 375 px claro.

As capturas ficam fora do repositório, no diretório de artefatos do Codex.

## 12. Pendências antes da integração pública

- tarefa e decisão próprias para criar formalmente `/territorio`;
- confirmar o destino definitivo dos links externos de rota;
- atribuição formal da fotografia do Recanto;
- revisão humana final dos nomes de contexto dos quatro mapas;
- verificar compressão das camadas no hospedeiro público;
- aplicar, em tarefa própria, as propostas de menu e chamada da Home;
- resolver a navegação global e seus placeholders, sem criar links quebrados;
- fechar E02 e os créditos institucionais conforme a decisão aplicável;
- cumprir os gates finais de integração e publicação;
- nova revisão jurídica/editorial imediatamente antes da publicação.

### Dependências externas à página

A candidata Território pode estar editorialmente pronta, mas sua integração
pública depende também da resolução da navegação global para placeholders e do
fechamento de E02. Menu, rodapé, placeholders e créditos institucionais não
foram alterados nesta tarefa e não reduzem a avaliação da página em si.

## 13. Critérios de integração futura

A candidata só pode substituir ou originar uma página pública quando:

1. as pendências aplicáveis do §12 estiverem resolvidas ou explicitamente
   aceitas pelo responsável;
2. a rota pública e seus arquivos permitidos forem definidos em tarefa própria;
3. a revisão confirmar novamente que nenhum documento restrito entrou na
   interface;
4. testes, build, acessibilidade, responsividade, dark mode e performance forem
   executados no estado exato a publicar;
5. houver autorização humana explícita para publicação e deploy.

## 14. Arquivos desta rodada

Arquivos permitidos:

- `src/componentes/prototipo/territoriovivo/TerritorioVivo.tsx`;
- `src/componentes/prototipo/territoriovivo/InteracaoTerritorioVivo.tsx`;
- `src/componentes/prototipo/territoriovivo/estilos.ts`;
- `testes/a11y/territorio-vivo.spec.ts`;
- este documento.

Arquivos territoriais de dados, mapas derivados, Home, menu, rotas públicas,
tokens globais e documentos restritos ficam fora do escopo.

## 15. Classificação da candidata

**Primeira avaliação, 2026-09-14: B — editorialmente madura, ainda não
publicável.** O registro é preservado como estado anterior.

**Avaliação após o polimento, 2026-09-15: A — pronta como candidata para futura
integração.** Esta classificação foi aprovada pelo responsável em decisão
humana de 2026-09-15, junto com as copies registradas no §3.

A arquitetura, a narrativa, a interação, o mobile, o dark mode, a
acessibilidade e a performance não têm ajuste próprio pendente identificado.
Isso não significa página publicada nem site pronto para deploy: as
dependências de integração e publicação dos §§12–13 continuam válidas.

## 16. Polimento final — controle “N” e mobile

O círculo “N” visto nas capturas anteriores foi investigado antes de qualquer
mudança semântica. Ele era o botão **Open Next.js Dev Tools**, injetado pelo
`next dev`: não representa norte, não pertence à Cartografia Viva e não existe
no build de produção. Por isso não foi movido para dentro do mapa nem ocultado
por CSS de produto.

As capturas finais foram produzidas no build de produção temporário e não têm
o controle. Um teste de regressão em 375 px garante que a raiz da candidata não
cria elemento `position: fixed` cobrindo a ficha ativa.

O seletor horizontal foi revalidado nos quatro lugares: item ativo inteiro,
nomes e contexto legíveis, troca sem salto vertical, rolagem horizontal
contida e navegação por teclado preservada. Nenhuma correção adicional de
produto foi necessária nesta rodada.

## 17. Aprovação e congelamento da candidata

Em 2026-09-15, após a sequência histórica **B inicial → polimento → A final**,
o responsável aprovou a classificação A, as duas copies da abertura e o
fechamento editorial. A rota experimental `/dev/territorio-vivo` fica
congelada como candidata aprovada para futura integração.

O congelamento não autoriza criar `/territorio`, alterar Home ou menu global,
resolver E02 nesta tarefa, fazer merge ou deploy. Permanecem externas à
candidata as dependências de navegação global e placeholders, E02, criação
formal da rota pública e gates finais de integração e publicação.
