# Fechamento das rotas públicas — 2026-09-20

**Branch:** `exp/home-v2-territorio-vivo`
**Escopo:** as seis rotas públicas que ainda serviam stub, mais a navegação que
apontava para elas.
**Resultado:** nenhuma rota pública do site se anuncia incompleta.

> Este registro vive em `docs/` porque `ESTADO_ATUAL_PROJETO.md`,
> `PLANO_EXECUCAO_OBSERVATORIO.md`, `docs/01-arquitetura-informacao.md` e a
> ADR-019 são documentos do responsável e **não são versionados pelo agente**.
> O Lote 3 os havia commitado sem autorização; a correção está descrita em §1.

## 1. Correção da higiene de Git

O commit `e531457` versionou quatro arquivos protegidos. A correção foi feita
**pelo índice**, sem tocar a árvore de trabalho:

```
git restore --staged --source=85dc776 -- <os quatro caminhos>
```

`git restore --staged` reescreve apenas o índice. Os quatro arquivos continuam
no disco exatamente como o responsável os mantém — conferido por SHA-256 antes
e depois, e por `cmp` contra cópia de segurança. A ADR-019 voltou a ser arquivo
não rastreado. Nenhum outro commit do Lote 3 foi alterado.

Consequência editorial: a auditoria do A11 e o comentário da Prestação de
Contas citavam a ADR-019 como prova. Uma prova que aponta para fora do controle
de versão não é prova para quem clona o repositório, então as referências
passaram a se apoiar em `docs/carga/PUBLICACAO_ACERVO_2026-09-16.md`, em
`src/dados/classificacao-documental.ts` e na decisão humana registrada.

## 2. A11 — decisão registrada

**Não despublicar nesta entrega.** Existe decisão humana posterior e explícita
de 2026-09-16 autorizando a publicação após revisão de privacidade concluída.
O A11 não é bloqueador.

Fica como **nota futura**, sem prazo e sem bloqueio: *reavaliação de risco de
reidentificação em A11-06, A11-07 e A11-08*. Registrada na §4 de
[`AUDITORIA_A11_PUBLICACAO_2026-09-20.md`](../auditorias/AUDITORIA_A11_PUBLICACAO_2026-09-20.md).

Banco, storage e URLs públicas: intocados.

## 3. Inventário das rotas provisórias encontradas

Varredura do App Router: **29 arquivos de rota**, dos quais 8 sob `/dev`
(laboratório, fora do escopo público) e 2 rotas de dados (`/anexos.json`,
`camada-local`). Das públicas, **seis serviam o mesmo stub de 27 linhas** —
"Esta seção ainda não tem conteúdo publicado" — desde a Tarefa 03.

| Rota | Estado anterior | Fonte disponível | Ação |
|---|---|---|---|
| `/acessibilidade` | stub | recursos implementados e cobertos por teste | **concluída** |
| `/privacidade` | stub | comportamento real conferido no código | **concluída** |
| `/contato` | stub | nenhum canal publicável localizado | **concluída com a lacuna declarada** |
| `/imprensa` | stub | identificação, acervo, marcas, PodObservar | **concluída** |
| `/campo` | stub, e **no menu principal** | 59 fotografias em 10 grupos; 15 derivados locais | **concluída** |
| `/educacao` | stub, fora do menu | acervo aberto; nenhum material didático produzido | **concluída como orientação de uso** |

Três superfícies afirmavam coisas que deixaram de ser verdade e foram
corrigidas junto:

- a Home listava `/dados` e `/campo` como "seções do site em preparação" —
  `/dados` fora publicada no Lote 3;
- `/observatorio` dizia que "o Diário de Campo e a seção de Dados ainda não têm
  conteúdo publicado";
- a lista de produtos de `/observatorio` excluía as duas rotas de propósito,
  com a condição explícita de que entrariam quando fossem concluídas.

## 4. O que cada página faz, e o que ela recusa

### `/acessibilidade`

Doze recursos implementados, cada um com **como ele é conferido** ao lado:
teclado, foco visível de 3 px, contraste AA medido, três temas, movimento
reduzido, semântica, alt obrigatório, transcrição obrigatória, mapa por
teclado e sem JavaScript, zoom e larguras, versão imprimível, ausência de
elemento que dispute atenção.

Quatro limites declarados na mesma forma: **não há auditoria externa nem
selo**; escala de texto e alto contraste não existem; o A03 é digitalizado e
por isso ganhou versão textual acessível; os arquivos do acervo têm a
acessibilidade que tinham na origem.

Recusa: afirmação de conformidade ou certificação.

### `/privacidade`

Conferido no código antes de escrever: **nenhum cookie**, nenhum analytics,
nenhum script de terceiro, nenhum formulário, nenhum player incorporado,
fontes auto-hospedadas. Uma única chave de armazenamento local,
`observatorio-tema`, com a preferência de tema.

Quatro fronteiras separadas do resto: links para fora, arquivos do acervo,
infraestrutura e a busca de dados em tempo de compilação. E uma seção própria
sobre o material da pesquisa — autorização documentada, consentimento verbal
gravado, formulários anônimos na origem.

Recusa: modelo genérico de política de privacidade.

### `/contato`

A auditoria de completude editorial registrou que **nenhum canal institucional
publicável foi localizado**. A página diz isso, e no lugar do endereço
inventado apresenta o que funciona sem intermediário: o acervo aberto, que
responde à razão mais comum de alguém escrever. O perfil `@obs_tobiassoueu`
aparece pelo que é — item D02 do inventário, perfil público de divulgação —,
com a ressalva de que não é canal de atendimento.

Recusa: e-mail, telefone, endereço ou formulário sem destinatário.

### `/imprensa`

Ficha de identificação com a grafia oficial, linha-fina e parágrafo prontos
para citação, os materiais públicos com suas medidas derivadas, as duas marcas
que o site usa e quatro orientações de uso — inclusive a de citar o recorte
junto com o número.

Recusa: press release, material sob embargo e contato de imprensa inexistente.

### `/campo`

O registro fotográfico, que é a única coisa do campo que não estava em
superfície editorial nenhuma: `/pesquisa` responde **como**, `/territorio`
responde **onde**, o Acervo é catálogo. A página serve 15 derivados já
versionados em `public/media/pesquisa` — os mesmos bytes da Home e do
Território —, agrupados pelos quatro lugares, e apresenta os dez grupos
editoriais do conjunto com a contagem de cada um.

A Serra dos Macacos não tem derivado local: aparece com as suas 8 fotografias
no conjunto e o caminho para o acervo. Omiti-la afirmaria que não houve
registro.

As entrevistas **não** entram: estão inteiras em `/pesquisa`.

### `/educacao`

Cinco caminhos de entrada por disciplina — matemática e estatística,
geografia, história e cultura local, linguagens, método científico —, cada um
apontando para uma rota que existe e tem conteúdo. Quatro orientações de uso.

Recusa: oficina, curso, glossário, plano de aula ou visita agendada. **Nada
disso foi produzido**, e a página diz isso no fecho em vez de anunciar um
programa inexistente.

## 5. Navegação

Menu principal e rodapé não mudaram de composição — eles já eram os da ADR-017
e sua emenda. O que mudou é que **todos os seus destinos passaram a ter
conteúdo real**: `/campo` no menu principal, `/imprensa`, `/acessibilidade`,
`/privacidade` e `/contato` no rodapé.

Nenhuma rota entrou no menu por existir. `/educacao` continua fora dele, como
a emenda de 2026-09-15 determina, e é alcançável pela Home e por
`/observatorio`.

A lista "Seções do site em preparação" da Home saiu: não sobrou seção em
preparação para listar. No lugar dela, uma navegação "Também neste site", com
o Diário de Campo e o uso educativo do acervo.

## 6. Validações

`pnpm verificar` completo, verde.

| Gate | Resultado |
|---|---|
| `pnpm tipos` | sem erro |
| `pnpm lint` | sem erro |
| `pnpm teste` | **927 testes**, 54 arquivos |
| `pnpm pendencias` | sem pendência |
| `pnpm build` | 15 rotas públicas estáticas |
| `pnpm a11y` | **406 testes** |

Cobertura nova, em `testes/a11y/rotas-publicas.spec.ts`, sobre as **15 rotas
públicas** declaradas em `testes/a11y/rotas.ts`:

- responde 200, com título próprio e um `h1` só;
- nenhuma frase proibida no conteúdo servido — a lista inclui as três que
  existiam de fato no site;
- todo link interno responde, conferido por `HEAD`;
- toda imagem declara alternativa textual;
- nas seis rotas novas: axe em claro e escuro, larguras de 375, 768 e 1440 px
  sem transbordo, hierarquia de títulos sem salto e nome acessível em toda
  seção.

A lista de rotas saiu de dentro de `titulos.spec.ts` e virou módulo
compartilhado: ela estava replicada em três suítes, e foi assim que seis rotas
ficaram sem cobertura enquanto eram stub.

### Orçamento da Home

Preservado nos dois perfis normativos:

| Perfil | Medido | Teto |
|---|---:|---:|
| desktop DPR1 | **484.655 B** | 500.000 B |
| mobile DPR2 | **446.025 B** | 500.000 B |
| desktop DPR2 (observabilidade) | 501.954 B | — |

A variação em relação ao Lote 3 é de 14 bytes, do texto da navegação da Home.

## 7. Bloqueios reais

1. **Canal de atendimento.** Endereço, responsável, finalidade e expectativa de
   resposta são decisão do Coletivo. Enquanto não existir, `/contato` e
   `/acessibilidade` declaram a ausência em vez de inventar um destino.
2. **Marcas institucionais.** O crédito textual de fomento está publicado na
   ordem normativa; a aplicação gráfica depende do manual do edital (item E02)
   e de validação técnica.
3. **Caderno de Estudos.** Entregável administrativo não produzido, declarado
   como pendência na Prestação de Contas, sem data estimada.

Nenhum dos três impede a entrega do site.
