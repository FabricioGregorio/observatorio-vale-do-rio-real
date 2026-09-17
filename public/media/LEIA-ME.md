# `public/media` — arquivos de mídia do site

Estrutura criada na Tarefa 10B.1, conforme 10B.0 v1.2 §11. Ela nasceu vazia e
deixou de ser vazia na H1. Este arquivo descreve o estado **real** da pasta,
auditado em 2026-09-11 na consolidação H3.5.1.

## O que existe hoje

```
media/
├── campo/       2 derivados do Hero          → src/dados/hero/derivados.ts
├── logos/       3 marcas institucionais      → src/dados/hero/derivados.ts
├── mapa/        vazia (.gitkeep)
├── pesquisa/    3 fotografias de campo       → src/dados/pesquisa/derivados.ts
├── pessoas/     vazia (.gitkeep)
└── territorio/  vazia (.gitkeep)
```

| Pasta | Finalidade | Estado |
|---|---|---|
| `campo/` | fotografia do Hero, nas duas composições servidas por art direction | `hero-observatorio-desktop-1440.webp`, `hero-observatorio-mobile-540.webp` |
| `logos/` | marcas institucionais, de fomento e de parceiros | marca e símbolo do Observatório, marca do Coletivo |
| `mapa/` | recursos do mapa territorial | vazia; a malha é GeoJSON e vive em `src/dados/territorio/` |
| `pesquisa/` | fotografias das visitas de campo, com procedência documental | três derivados de Ilha Grande |
| `pessoas/` | retratos e ilustrações de participantes | vazia; depende de consentimento verificado |
| `territorio/` | imagens por município | vazia |

As três pastas vazias existem no repositório por causa dos `.gitkeep`. Elas não
são placeholder de conteúdo: são estrutura reservada, e continuam vazias até
haver material real com procedência.

## Original e derivado não são a mesma coisa

**Original** é o arquivo como saiu da câmera, do corpus da identidade visual ou
da mão de quem produziu. Ele vive **fora do repositório**, no corpus apontado
por `OBSERVATORIO_FONTES_DIR`, e **nunca** entra em `public/`.

**Derivado** é o arquivo transformado para a web e conferido: redimensionado,
convertido, com metadados removidos, com hash registrado. Só derivado entra
aqui.

A separação não é organização, é segurança. O original do Hero tem 6,86 MB e
carrega GPS, marca e modelo do aparelho, data e hora, miniatura embutida e
bloco XMP. Copiá-lo para `public/` seria publicar tudo isso. Um teste falha se
qualquer arquivo desta pasta passar de 1 MB, justamente para pegar essa cópia.

Os derivados são gerados por script versionado, que confere o hash do original
antes de transformar:

| Conjunto | Script | Módulo de procedência |
|---|---|---|
| Hero | `pnpm derivar-hero` | `src/dados/hero/derivados.ts` |
| Pesquisa em Campo | `pnpm exec tsx scripts/derivar-pesquisa-campo.ts` | `src/dados/pesquisa/derivados.ts` |

O símbolo do Observatório em `logos/` tem script próprio,
`scripts/derivar-simbolo-observatorio.ps1`, e está declarado junto com as
demais marcas em `src/dados/hero/derivados.ts`.

## Procedência é obrigatória

**Todo arquivo de mídia aqui precisa estar declarado num módulo de dados**, com
arquivo, dimensões, bytes, hash do derivado, hash do original, transformação
aplicada e metadados removidos. Arquivo não declarado falha no teste de
procedência de `testes/territorio.test.ts`, e os testes de cada conjunto
conferem o binário contra o hash registrado.

Isso vale inclusive para quem apenas trocar um arquivo por outro "igual":
regenerar com outra ferramenta muda o hash, e o teste pega.

## EXIF, XMP e GPS

Nenhum derivado pode carregar metadado de origem. O contêiner WebP é lido
`chunk` por `chunk` nos testes, e a presença de `EXIF` ou `XMP ` reprova.
Também se procura, no binário, vestígio de `GPS`, `Exif`, `xmpmeta`, marca de
dispositivo e data de captura.

A remoção não é opcional nem "boa prática": `public/` é conteúdo publicado, e
metadado de origem não é conteúdo — é vazamento. Numa pesquisa de campo, a
coordenada embutida numa fotografia pode expor o endereço de alguém.

## Consentimento e pessoa identificável

**Pessoa identificável exige consentimento verificado** (doc 01 §11). O estado
conhecido do banco continua sendo `pessoa=0` e `consentimento=0`: nenhuma
autorização de imagem foi presumida.

Por isso nenhuma das fotografias publicadas mostra pessoa identificável. A
seleção da H3 revisou as imagens uma a uma e aprovou só as que não têm
ninguém reconhecível. `pessoas/` continua vazia pelo mesmo motivo.

## Regras que continuam valendo

- **Só imagem real do projeto.** Banco de imagem genérico, ilustração gerada ou
  foto que represente um lugar real sem ser dele estão proibidos (10B.0 v1.1 §5
  e v1.2 §9). Num site de prestação de contas isso não é escolha estética, é
  integridade da pesquisa.
- **Toda imagem precisa de texto alternativo e de crédito.** Os contratos já
  exigem: `ImagemDeCampo` em `src/dados/territorio/tipos.ts` e
  `MarcaInstitucional` em `src/componentes/institucional/`. `alt` não é opcional
  na tipagem. A exceção é o grafismo estritamente decorativo, que leva `alt=""`
  e `aria-hidden`, com a origem dita em legenda visível ao lado.
- **Logos dependem do manual de aplicação de marcas do edital**, item E02 do
  inventário, hoje pendente. Ordem e proporção saem de lá, nunca de estimativa.
- **Formato:** WebP ou AVIF, comprimido, com carregamento preguiçoso
  (doc 01 §7). SVG só quando for vetor de verdade; cinco dos seis "SVG" da
  identidade são PNG em base64 dentro de invólucro, e esses não entram.
