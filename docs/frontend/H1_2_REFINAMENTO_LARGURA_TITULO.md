# H1.2 — Refinamento de largura do título do Hero

**Data:** 2026-09-09

**Estado:** implementado e validado localmente; não publicado

**Baseline:** `4ba8ea0` — `feat: integra hero manifesto na home`

## Decisão

O `h1` do Hero B passou de `max-w-3xl` para `lg:max-w-4xl` somente a partir do
breakpoint desktop. O degrau pertence ao grid já usado pelo projeto e produz
uma caixa de 896 px em 1440, dentro da faixa visual aprovada de 800–950 px.

Não houve quebra manual com `<br>`, redução de fonte, alteração de peso,
tracking ou line-height. `text-wrap: balance` continua vindo da regra global de
títulos. A composição mobile permanece no limite anterior.

## Medidas reais

Medições feitas sobre a Home local renderizada no Chromium:

| Viewport | largura do H1 | linhas | font-size | line-height | overflow |
|---:|---:|---:|---:|---:|---|
| 1440 | 896 px | 2 | 48,832 px | 54,258 px | não |
| 768 | 721 px | 2 | 39,056 px | 46,867 px | não |
| 375 | 328 px | 4 | 31,248 px | 41,664 px | não |
| 320 | 273 px | 4 | 31,248 px | 41,664 px | não |

Antes do ajuste, em 1440, a caixa media 768 px e ocupava 3 linhas. Font-size e
line-height eram os mesmos valores atuais.

## Escopo preservado

Fotografia, crop, overlay, assets, logos, cabeçalho, assinatura do Coletivo,
mapa e seção seguinte não foram alterados. As capturas de 1440 claro/escuro,
768 claro, 375 claro e 320 claro ficaram fora do Git.

## Gates

- `pnpm tipos`: passou;
- `pnpm lint`: passou com os quatro avisos CSS preexistentes;
- `pnpm teste`: 375 passaram; 3 pulados;
- `pnpm a11y`: 157 passaram.

Não houve deploy, push ou mudança de infraestrutura.
