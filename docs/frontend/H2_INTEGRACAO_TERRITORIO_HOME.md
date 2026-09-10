# H2.1 — Integração do Território na Home

**Data:** 2026-09-10

**Estado:** implementada e validada localmente; não publicada

**Baseline:** 3d1ecfa — style: refina profundidade do mapa territorial

## 1. Decisão aplicada

A Home local passou a usar o Preset B refinado, aprovado pelo responsável:
pitch de 7 graus no desktop e 3,5 graus no mobile, espessura e sombra atenuadas
na H2.0.1. A geometria, a escala, as cores, as hachuras e as relações
territoriais não foram alteradas.

A sequência da página agora é Hero, 01 — Território, caminhos prioritários e
acervo. O Hero, suas marcas, fotografia, título, overlay e cabeçalho não foram
modificados.

## 2. Arquitetura compartilhada

A Home continua Server Component. A composição cartográfica compartilhada usa
os dados montados e validados em build time, desenha um único SVG no servidor e
alcança somente a ilha MapaInterativo já existente.

O laboratório e a Home usam a mesma implementação. A entrada pública fixa o
contexto Home e a profundidade moderada; o laboratório mantém A e B e seus
rótulos de desenvolvimento. A movimentação dos estilos para
src/componentes/territorio é a exceção justificada ao escopo da Tarefa 10:
evita duplicar a implementação DEV na Home, como exigido pela H2.1.

Client Components no repositório: **5 antes → 5 depois**. Ilhas alcançáveis
pela Home: **4 antes → 4 depois**. Nenhuma dependência foi adicionada.

## 3. Conteúdo factual

O título “Cartografia viva do Vale do Rio Real” foi mantido conforme a
autorização humana desta integração.

A copy institucional marcada como proposta no laboratório não foi promovida.
A Home usa somente:

- 75 municípios de Sergipe e relações declaradas — dados validados pela malha
  e pelo recorte territorial;
- definição do Vale como região socioeconômica associada ao curso superior e
  médio do rio Real, sem natureza administrativa — recorte.ts;
- autoria do Coletivo Cultural “Tobias, sou Eu!” como idealizador e realizador
  — Direção Visual 1.0 e H0;
- nota cartográfica do IBGE — proveniência já registrada do mapa.

Não há fórmula de fomento, texto derivado de fonte privada, indicador,
população, ranking, descrição turística ou afirmação institucional nova.

## 4. Coluna editorial e estados

A coluna deixou de ser um grande card. Fundo, sombra e bloco elevado foram
removidos na Home. Ela passa a integrar a superfície da seção, com eixo milho
sutil, espaço negativo, headings em Archivo, narrativa em Literata,
metadados em IBM Plex Mono e divisores finos.

O estado vazio traz uma instrução curta. A seleção substitui esse estado por
nome, classificação e relações/evidências reais. Os quatro pontos sem
coordenada ficam em bloco secundário e continuam fora do SVG.

## 5. Índice acessível

Os 75 municípios permanecem no HTML server-side. Na Home, o índice inicia
recolhido em um disclosure nativo, funciona sem JavaScript e pode ser aberto
por teclado. Depois da hidratação, mapa e índice tornam-se duas listboxes com
roving tabindex: uma parada de Tab cada, setas para navegação, Enter/Espaço
para seleção e Escape para limpar.

Assim, a lista continua disponível sem depender do mapa, mas não domina o
fluxo visual principal.

## 6. Conteúdo anterior

- **Removido:** título “Mapa vivo do território”, mapa plano anterior, lista
  permanentemente aberta e repetição visual da legenda.
- **Preservado:** malha oficial, 75 municípios, Vale, São Cristóvão,
  evidências, quatro pontos sem posição, nota IBGE, legenda e ilha cliente.
- **Reposicionado:** caminhos prioritários e acervo agora vêm depois da seção
  Território.

## 7. Performance

Medição aproximada no servidor de produção local, em 1440 px:

| Recurso | Transferência |
|---|---:|
| HTML comprimido | 57.206 B |
| JavaScript comprimido | 181.278 B |
| CSS comprimido | 6.093 B |
| fontes | 107.772 B |
| mídia do Hero | 340.086 B |
| **total aproximado** | **692.435 B** |

O SVG mede 59.465 B no HTML bruto e não cria request próprio. GeoJSON
transferido: **0 B**. O referencial de 500 kB continua excedido; nenhuma
fotografia foi degradada e nenhuma dependência foi adicionada para maquiar a
medição.

## 8. Validação

- 75 paths municipais e três hachuras, em um único SVG;
- cinco municípios no Vale;
- São Cristóvão como pesquisa/comparação, nunca Vale;
- zero pins e quatro registros sem coordenada;
- mouse, teclado, foco, seleção, mapa, índice e painel sincronizados;
- índice recolhido por padrão e lista completa no HTML;
- reduced motion, zoom de 200% e ausência de overflow;
- 320, 375, 768 e 1440 px, claro e escuro;
- labels PRESET e PROPOSTA ausentes da Home;
- rota /dev/territorio responde 404 no servidor de produção.

Screenshots reais, não versionados:

- home-territorio-1440-light.png;
- home-territorio-1440-dark.png;
- home-territorio-768-light.png;
- home-territorio-375-light.png;
- home-territorio-375-dark.png;
- home-territorio-320-light.png;
- territorio-1440-light.png.

## 9. Dívidas

- Lighthouse permanece bloqueado pela ausência deliberada do pacote;
- o orçamento de 500 kB continua excedido, principalmente pelo Hero e fontes;
- coordenadas dos quatro pontos continuam pendentes;
- licença oficial do IBGE permanece pendente antes de disponibilizar os dados;
- H3 — Pesquisa em Campo depende de conteúdo e fotografias publicáveis,
  metadados confirmados e copy humana aprovada.

Não houve MapLibre, Leaflet, deploy, push, banco, R2, Vercel, DNS ou mudança de
infraestrutura.
