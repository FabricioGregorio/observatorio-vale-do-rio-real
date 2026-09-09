# H2 — Território: protótipo cartográfico

**Estado:** EM PROTÓTIPO · rota exclusiva de desenvolvimento · não integrado à
Home · 2026-09-09.

## 1. Limite da entrega

Esta fase audita o mapa já existente e experimenta a direção de “cartografia
viva” em `/dev/territorio`. Não muda classificação territorial, não cria rota
pública, não adiciona coordenada, não instala biblioteca e não substitui a seção
atual da Home. ADR-010 continua vigente: SVG renderizado no servidor, com
interação progressiva em uma ilha cliente pequena.

## 2. Arquitetura auditada

```text
SecaoMapa [Server]
└── montarDadosDoMapa [build time]
    ├── municipios-sergipe.geojson [IBGE, 75 features]
    ├── municipios-sergipe-nomes.json [IBGE, 75 nomes]
    ├── validacao.ts [Zod + completude + unicidade]
    ├── projecao.ts [GeoJSON → paths SVG]
    └── recorte.ts [relações editoriais aprovadas]
        └── MapaTerritorio [Server]
            ├── SVG único: 75 paths municipais + 3 hachuras
            ├── MunicipioNoMapa / MarcadorNoMapa [Server]
            ├── lista territorial completa [Server]
            └── MapaInterativo [Client, sem JSX]
                └── listbox progressiva + roving tabindex
```

O `viewBox` é `0 0 1000 1129`: largura fixa de 1.000 unidades e altura
derivada do envelope geográfico com correção do meridiano. O GeoJSON nunca é
enviado ao navegador; o build lê, valida e converte a malha para `d` dos paths.

### Classificação da intervenção

| Decisão | Elementos |
|---|---|
| **MANTER** | GeoJSON e nomes oficiais; Zod; projeção; recorte; 75 municípios; hachuras; SVG server-side; lista textual; roving tabindex; ausência de zoom/pan; pontos `null` fora do desenho |
| **REFATORAR** | `MapaInterativo`: recursos opcionais para promover o índice e sincronizar seleção/painel; o modo padrão usado na Home continua idêntico |
| **SUBSTITUIR** | nada |
| **CRIAR** | composição server-side H2, CSS de profundidade, índice sincronizado, painel contextual, rota `/dev/territorio` e testes próprios |

## 3. Dado territorial preservado

- fonte geométrica: `src/dados/territorio/municipios-sergipe.geojson`;
- tamanho bruto: **92.720 B**; registro de origem e SHA-256 preservado;
- municípios: **75**;
- Vale do Rio Real: Tobias Barreto, Tomar do Geru, Itabaianinha,
  Cristinápolis e Poço Verde;
- São Cristóvão: `pesquisa-campo` + `comparacao`, nunca Vale;
- Tobias Barreto ganha peso de traço, sem receber título territorial novo;
- pins exatos: **0**.

Recanto da Serra, Centro Cultural e Museu Borda da Mata, Serra dos Macacos e
Ilha Grande continuam com coordenada `null`. Eles aparecem somente no bloco
textual “Pontos de pesquisa — sem coordenada”, fora do SVG.

## 4. Composição visual

No desktop a grade usa aproximadamente 58/42: mapa à esquerda e coluna
editorial à direita. No mobile a ordem do DOM e da leitura é mapa, conteúdo
editorial/painel e índice. A coluna editorial usa apenas fatos existentes; a
frase de apresentação ainda não aprovada aparece explicitamente sob o rótulo
**PROPOSTA EDITORIAL**. Nenhuma fotografia foi usada: fotografia publicável para
esta seção permanece pendente.

O estado pôster mostra Sergipe inteiro, quatro sinais de legenda e pouca
interface. O estado ferramenta nasce no hover/foco/seleção e atualiza um painel
com município, classificação e evidências já registradas. Município sem dado
editorial declara “Sem vínculo declarado”.

## 5. Profundidade A/B

Os dois presets usam o mesmo componente, os mesmos paths e a mesma interação.
A profundidade é criada no composto do SVG por `perspective`, `rotateX`, leve
`rotateZ`, uma faixa de espessura com `drop-shadow` e sombra difusa baixa. Não
há `<use>`, clone da malha ou segunda camada geométrica.

| Preset | Desktop | Mobile | Leitura |
|---|---|---|---|
| **A — mínima** | pitch 3°, giro −1°, espessura 0,22 rem | pitch 1,5°, giro −0,5°, espessura 0,16 rem | volume presente, contorno mais limpo |
| **B — moderada** | pitch 7°, giro −1,75°, espessura 0,46 rem | pitch 3,5°, giro −0,8°, espessura 0,28 rem | placa mais explícita, borda sul/leste mais pesada |

**Recomendação técnica e visual: Preset A.** Ele entrega a leitura de objeto
cartográfico sem transformar a borda em protagonista e preserva melhor o
reconhecimento de Sergipe em claro, escuro e telas estreitas. A escolha final é
humana.

## 6. Interação e acessibilidade

- mapa e índice são listboxes progressivas somente depois da hidratação;
- cada uma é uma única parada de Tab, com roving tabindex;
- setas percorrem, Home/End saltam, Enter/Espaço selecionam e Esc limpa;
- mouse/toque no mapa ou no índice atualizam o mesmo estado;
- mapa, índice realçado e painel `aria-live` permanecem sincronizados;
- sem JavaScript, o SVG volta a ser imagem e o índice completo continua texto;
- o nome acessível de cada município inclui suas relações;
- movimento reduzido elimina a transição da perspectiva;
- foco, espessura, preenchimento, hachura e traço evitam depender só de cor.

Recomendação para integração futura: conservar as duas únicas paradas de Tab
(mapa + índice) e manter a lista como experiência primária de leitor de tela;
busca só se justifica quando houver uma rota territorial maior, não nesta Home.

## 7. Custo medido

Medição por `renderToStaticMarkup`, em UTF-8, para **um** preset — o que seria
integrável. A rota DEV duplica a composição apenas para comparação A/B.

| Métrica | mapa atual | H2, um preset | delta |
|---|---:|---:|---:|
| HTML do componente | 83.115 B | 88.092 B | +4.977 B |
| SVG | 59.272 B | 59.472 B | +200 B |
| elementos DOM | 495 | 522 | +27 |
| SVGs | 1 | 1 | 0 |
| paths | 78 | 78 | 0 |
| `<use>` / clones geométricos | 0 | 0 | 0 |

A perspectiva acrescenta **zero camada SVG**, dois filtros `drop-shadow` no
mesmo composto e um pseudo-elemento de sombra ambiente. O custo geométrico não
se multiplica.

O único Client Component do mapa continua sendo `MapaInterativo`; o total do
repositório fica em **5 → 5**. A fonte dessa ilha passou de **6.105 B para
12.290 B** (+6.185 B) para incluir índice/painel opcionais; o chunk minificado
do build final mede **9.446 B bruto**. A Home não habilita as opções novas.
Como conferência global após o build, a Home servida em produção mediu 225.524 B
de HTML e 156.608 B de JavaScript comprimido com Brotli; essa soma inclui
runtime, Hero e cabeçalho, portanto não é atribuída isoladamente ao mapa.

## 8. Estrutura futura de equipamentos

Quando houver fonte aprovada, um ponto preciso deverá carregar, conceitualmente:

```text
ID · nome · tipo · latitude · longitude · fonte da coordenada
· data de verificação · estado de publicação
```

Nenhum valor, tabela ou migração foi criado nesta fase. A coordenada só poderá
entrar depois de conferência documental ou de campo.

## 9. Validação

- build de produção: passou; `/dev/territorio` respondeu **404** em servidor
  de produção;
- 320, 375, 768 e 1440 px: sem overflow nos temas claro e escuro;
- mapa, índice, mouse, teclado, foco, seleção e painel: verificados;
- 75 geometrias por preset e nenhuma duplicação de camada: verificados;
- screenshots reais, não versionados:
  `preset-a-1440-light.png`, `preset-a-1440-dark.png`,
  `preset-a-375-light.png`, `preset-b-1440-light.png`,
  `preset-b-1440-dark.png`, `preset-b-375-light.png` e
  `preset-a-320-light.png`.

## 10. Bloqueios e próxima decisão

Antes de H2.1, o responsável precisa escolher A ou B e aprovar/revisar a copy
marcada como proposta. Fotografia editorial e coordenadas continuam pendentes,
mas não bloqueiam a composição sem imagem e sem pins. A seção atual da Home
permanece como está até essa decisão.

Não houve MapLibre, Leaflet, dependência nova, banco, R2, Vercel, DNS, deploy ou
push.
