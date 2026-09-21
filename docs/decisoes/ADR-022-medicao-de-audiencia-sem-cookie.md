# ADR-022 — Medição de audiência sem cookie: Vercel Web Analytics

## Status

Aceita

## Data

2026-09-21

## Contexto

O site é a peça pública do projeto e voltou a cumprir função de divulgação
(ADR-019). Divulgação sem medição é declaração sem prova: até esta data o
projeto não sabia quantas pessoas chegaram ao acervo, por qual porta ou de que
aparelho — e essa informação é, ela própria, material de prestação de contas
perante a FUNCAP.

O proprietário habilitou Web Analytics no painel da Vercel em 21/09/2026 e
instruiu, nesta sessão, a instrumentação da aplicação **apenas** com o produto
oficial da Vercel, sem Google Analytics, sem Meta Pixel e sem qualquer outro
rastreador.

## Conflito normativo

Há uma regra do `AGENTS.md`, na lista **Nunca**:

> Adicionar script de terceiro que faça rastreio ou grave cookie.

E havia uma afirmação pública em `/privacidade`:

> Não há Google Analytics, pixel, tag manager, mapa de calor, gravação de
> sessão ou qualquer medição de audiência.

Três fatos resolvem o conflito, nesta ordem:

1. **Instrução direta do responsável humano é o item 1 da hierarquia de fontes
   de verdade do `AGENTS.md`.** Ela vence a lista *Nunca*, que é item 6 quando
   lida como preferência do agente e, quando lida como norma, continua abaixo
   da decisão humana explícita.
2. **`docs/01-arquitetura-informacao.md` §7 já previa isto.** A linha de
   Privacidade da tabela de requisitos não funcionais diz "Sem rastreadores de
   terceiros; **analytics sem cookies** (Plausible/Umami)". Medir audiência sem
   cookie sempre foi requisito declarado; o que faltava era executá-lo. A
   menção a Plausible/Umami era exemplo de categoria, não de fornecedor
   contratado.
3. **O produto escolhido satisfaz a restrição material da regra.** A regra
   proíbe *rastreio* e *cookie*. O Vercel Web Analytics não grava cookie,
   `localStorage` nem `sessionStorage`; não emite identificador persistente; e
   o script é servido por caminho do próprio domínio, não por host de terceiro.

A afirmação pública, essa sim, deixou de ser verdadeira e **foi corrigida no
mesmo commit que instrumentou** — nunca depois. Publicar a medição antes de
corrigir a página seria, num site de prestação de contas, uma falsidade
documental.

## Decisão

Instrumentar o site com `@vercel/analytics`, pelo componente oficial
`Analytics` de `@vercel/analytics/next`, montado uma única vez no layout raiz
`src/app/layout.tsx`, ao fim do `<body>`.

Limites que integram a decisão:

- **Nenhum evento customizado.** Só a visualização de página automática.
- **Nenhuma identificação de pessoa.** Sem `userId`, e-mail, nome, fingerprint
  próprio ou IP armazenado pelo projeto.
- **Nenhum `beforeSend` de redação** nesta rodada: as rotas públicas do site são
  estáticas e nenhuma carrega dado pessoal no caminho ou na query.
- **Nenhum outro tracker**, em nenhuma hipótese, sem nova ADR.
- **Nenhum aviso de cookies**, porque nenhum cookie é gravado — um banner aqui
  pediria consentimento para coisa nenhuma.

## Alternativas consideradas

- **Plausible ou Umami auto-hospedado.** É o exemplo do doc 01 §7 e teria a
  vantagem de manter o dado sob domínio do projeto. Custa infraestrutura nova
  — instância, banco e operação — a um dia do prazo de 22/09/2026, e o painel
  da Vercel já estava habilitado e pago pela hospedagem em uso. Descartada por
  prazo, não por mérito.
- **Não medir nada.** Era o estado anterior e é a alternativa mais barata em
  privacidade. Descartada por decisão do responsável: um site de divulgação
  cuja audiência é desconhecida não consegue relatar alcance.
- **Google Analytics.** Descartada explicitamente pelo responsável e
  incompatível com o doc 01 §7 — grava cookie e é rastreador de terceiro.

## Consequências

Benefícios:

- O projeto passa a saber alcance, páginas procuradas, origem do acesso, país,
  aparelho, navegador e sistema operacional — material direto de relatório.
- O requisito "analytics sem cookies" do doc 01 §7 sai do papel.
- Custo de implementação e manutenção próximo de zero: componente oficial, sem
  código de rastreio próprio.

Custos:

- `/privacidade` deixou de poder afirmar "nenhuma medição de audiência" e
  "nenhum script de terceiro". A página passou a descrever a medição em
  linguagem pública, com o que o serviço documenta e nada além.
- Peso adicional na carga inicial da Home, que tem orçamento normativo de
  500.000 B nos dois perfis que bloqueiam. Medido em cinco cargas frias, com
  `next start` local:

  | Perfil | Antes | Depois | Delta |
  |---|---|---|---|
  | desktop 1440×900 DPR1 — normativo | 486.726 B | **488.412 B** | +1.686 B |
  | mobile 375×900 DPR2 — normativo | 443.610 B | **445.296 B** | +1.686 B |

  O número local **não previa bem a produção**, e a projeção feita antes do
  deploy errou para cima. Medido contra `observatoriotobiassoueu.com.br` no
  deployment `dpl_6RzbwKXaHaoNwMwpK7FsCbgrZuMZ`, cinco cargas frias, já com o
  analytics carregando:

  | Perfil | Local | **Produção** | Folga até o teto |
  |---|---|---|---|
  | desktop DPR1 | 488.412 B | **471.472 B** | 28.528 B |
  | mobile DPR2 | 445.296 B | **428.356 B** | 71.644 B |

  A produção é mais leve que o `next start` local porque a borda serve os
  ativos em brotli. O analytics em si custa o script, servido uma vez e
  cacheado, mais **302 B** por beacon de visualização.
- Um dado de audiência passa a existir em infraestrutura de terceiro. Ele é
  agregado e não reidentificável, mas não está sob custódia do projeto.
- Dependência nova em `package.json`.

## O que esta ADR não decide

Não emite parecer de conformidade com a LGPD. A página pública descreve o que o
site faz e o que ele não faz, de modo conferível; declaração jurídica sobre
base legal e adequação é atribuição de quem responde juridicamente pelo
projeto, não do repositório.

## Impacto técnico

Arquivos ou módulos afetados:

- `package.json` / `pnpm-lock.yaml` — `@vercel/analytics`
- `src/app/layout.tsx` — montagem única do componente
- `src/componentes/institucional/conteudo.ts` — texto público de `/privacidade`
- `src/app/privacidade/page.tsx` — `description` e nota de revisão
- `testes/analytics-privacidade.test.ts` — trava a instrumentação única e a
  coerência entre o que o código faz e o que a página declara

## Verificação pós-deploy — 2026-09-21

Publicado em `dpl_6RzbwKXaHaoNwMwpK7FsCbgrZuMZ`, target production, com os
aliases `observatoriotobiassoueu.com.br` e `www`. Baseline de rollback:
`dpl_J7jvSfz16vD5HhGxrjtafN1VwaM7`.

**O caminho do script não é `/_vercel/insights/script.js`.** A versão 2 usa
*Resilient Intake*: a Vercel gera uma semente por build e o SDK monta com ela a
URL do script e a de intake. Em produção o par observado é
`/f7dea17ae34d952c/script.js` e `/f7dea17ae34d952c/view` — mesma origem, mas
sem a palavra `insights` no caminho. Quem for auditar isto no futuro não deve
procurar por `insights` no DOM: não vai achar, e vai concluir errado que a
medição não está ativa.

Conferido nas quatro rotas navegadas — `/`, `/podobservar`, `/territorio`,
`/dados`:

| Verificação | Resultado |
|---|---|
| Tags de script injetadas | **1** por página, nenhuma duplicação |
| Beacon de visualização | **1** por rota, 302 B |
| `window.va` / `window.vam` | função / `production` |
| `document.cookie` | **vazio** |
| `localStorage` / `sessionStorage` | **vazios** |
| `X-Robots-Tag` em produção | **ausente**, como deve |
| `robots.txt` | `Allow: /`, `Disallow: /dev/` |

As três linhas de armazenamento são a prova direta do que `/privacidade`
passou a afirmar. Elas foram medidas no domínio real, não deduzidas da
documentação do fornecedor.
