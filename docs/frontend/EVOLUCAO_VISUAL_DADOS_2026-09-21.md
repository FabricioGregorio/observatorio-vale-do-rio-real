# Evolução visual de /dados — 2026-09-21

## Diagnóstico e conceito

A apresentação anterior repetia a mesma ficha para oito medidas de naturezas
diferentes. A documentação estava completa, mas a repetição de período e
recorte diluía os números. A comparação mensal perdia a representação gráfica
no celular; as atividades usavam barras contínuas para contagens discretas.

A direção escolhida foi **caderno de medidas**: a camada quantitativa da
Cartografia Viva. Composição aberta, linhas de separação, numerais com pesos
diferentes e contexto documental próximo de cada medida.

## Mudanças e visualizações

- Retenção municipal ocupa uma abertura própria, com escala de 0 a 100%.
  Despesa e receita formam um par; média por registro e participação do trabalho
  vêm depois, seguidas das três contagens. São os mesmos oito indicadores.
- Cálculo, base, fonte e notas permanecem visíveis. Período e recorte estão
  na abertura e em controles nativos de cada indicador.
- A série compara receita e despesa numa escala comum, com círculo e losango.
  Valores exatos ficam sempre escritos; a distância entre pontos mostra a
  diferença. Julho e dezembro recebem indicação de coleta parcial.
- Cada mês abre registros e contratações. A tabela completa permanece no HTML,
  dentro de um controle nativo, sem depender de JavaScript.
- As dezesseis atividades preservam ordem, categoria, natureza da receita e
  denominador. Marcas preenchidas representam registros; a legenda esclarece
  que a posição das marcas não representa datas.
- Atalhos permitem ir diretamente aos indicadores, meses, atividades e fontes.

Nenhum dataset, cálculo, período, fonte ou texto factual foi alterado. As
formas visuais consomem as estruturas derivadas existentes.

## Movimento e interação

O sinal de abertura do mês gira 45 graus em 150 ms. Foco, seleção e hover
realçam a linha e seu intervalo sem mover os pontos. Não há animação de número,
entrada de dados, repetição contínua ou informação exclusiva de tooltip.

`prefers-reduced-motion: reduce` desliga a propriedade de transição. Os valores
e gráficos aparecem completos imediatamente. Enter e Espaço operam os
controles nativos, inclusive com JavaScript desligado.

## Responsividade e acessibilidade

Em 1440 px, número e documentação usam a largura editorial; a série alinha
meses, escalas e valores. Em 768 px, mantém-se a comparação na mesma escala sem
encolher rótulos. Em 375 px, cada mês ganha uma escala de largura inteira,
valores em duas colunas e contexto abaixo. Atividades passam a nome, marcas e
valor; a tabela mensal recompõe suas linhas com rótulos locais.

SVGs e escalas redundantes são `aria-hidden`; os dados vivem em texto, títulos,
listas e tabelas semânticas. Cor não é o único diferenciador da série. Fontes
e limitações permanecem acessíveis. Não houve overflow na matriz verificada.

## Peso e performance

Medição de arquivos locais, gzip com configuração padrão do Node; não representa
transferência de rede nem comparação de CSS minificado de produção.

| Artefato | Antes | Depois | Delta gzip |
|---|---:|---:|---:|
| CSS fonte de /dados | 12.330 B / 3.193 B gzip | 16.912 B / 3.560 B gzip | +367 B |
| HTML da página | 121.698 B / 23.096 B gzip | 149.660 B / 24.655 B gzip | +1.559 B |
| Tokens, arquivo completo | 10.474 B gzip | 10.716 B gzip | +242 B |

Os oito chunks JavaScript referenciados pelo HTML anterior e posterior são
idênticos. Nenhuma biblioteca, Client Component ou asset de imagem foi
adicionado. Os tokens novos estão confinados a `.dd`.

O gate da Home passou em cinco navegações frias por perfil: desktop DPR1
486.617 B em todas; mobile DPR2 447.987 B em todas. O cenário observacional
desktop DPR2 permaneceu em 503.916 B, fora do perfil normativo do gate.

## Testes e leitura crítica

`pnpm verificar` passou: tipos, lint, 977 testes unitários (3 ignorados),
pendências de publicação, build estático de 160 páginas e 462 cenários de
acessibilidade naquele checkpoint. Oito cenários novos cobrem dados semânticos,
axe, três larguras, dois temas, teclado, movimento reduzido e ausência de JS.
O lint conserva seis avisos preexistentes. `git diff --check` passou.

A leitura final preservou a hierarquia do dado e das fontes. Não há oito cards
iguais, escalas truncadas ou ornamentação cartográfica sem correspondência.
O celular recebe gráficos próprios, em vez de esconder a comparação.

Foram descartados: linha temporal contínua, que sugeriria interpolação entre
meses parciais; mapa de fluxos e distribuição por localidade, que exigiriam
detalhamento não publicado; contadores animados, sem ganho de compreensão.

## Capturas locais

Em `tmp/dados-visual/`, fora do Git:

- `dados-{1440,768,375}-{claro,escuro}.png`: página inteira nos dois temas;
- `serie-{1440,768,375}-{inicial,interativa}.png`: comparação e contexto aberto;
- `indicadores-1440-escuro.png` e `atividades-375-escuro.png`: detalhes;
- `antes-1440.png`: referência anterior;
- `verificar.log`: saída integral do gate.

## Arquivos e Git

Arquivos de produto: `src/app/dados/page.tsx`, `src/app/dados/dados.css`,
`src/componentes/dados/{Indicadores,SerieMensal,Atividades}.tsx` e
`src/estilos/tokens.css`. Validação: `testes/a11y/dados-publicos.spec.ts`.
Documentação: tarefa 27 e este relatório.

O lote permanece separado das alterações protegidas e da evolução territorial.
Commits: `2fda8ca` (medidas e atividades), `84eabc7` (série e testes), `e4ebeb2`
(composição responsiva e tokens). A primeira tentativa foi bloqueada por limite
de uso na revisão automática; a operação nominal foi liberada na continuação,
após nova conferência e validação integral. O checkpoint conjunto passou 473
cenários de acessibilidade e os mesmos 977 testes unitários.

Push concluído para `origin/exp/home-v2-territorio-vivo`, de `8640e80` até
`e4ebeb2`. A documentação recebe um commit de encerramento separado. Sem
Preview ou deploy.
