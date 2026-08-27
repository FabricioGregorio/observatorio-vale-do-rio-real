# TAREFA 01 — Bootstrap do projeto

**Fase:** 1 · **Depende de:** — · **Estimativa de diff:** médio

## Objetivo

Repositório inicializado com a stack definida, scripts de verificação funcionando e CI verde
em um projeto ainda vazio.

## Contexto obrigatório

- `docs/03-guia-implementacao.md`, seções 1, 2 e 7
- `AGENTS.md`

## Arquivos permitidos

```
package.json  pnpm-lock.yaml  tsconfig.json  next.config.ts
biome.json  vitest.config.ts  playwright.config.ts  lighthouserc.json
.gitignore  .nvmrc  src/app/layout.tsx  src/app/page.tsx
```

## Critérios de aceite

- [ ] Next.js com App Router, TypeScript com `strict: true` e `noUncheckedIndexedAccess: true`
- [ ] Tailwind v4 instalado, importando `src/estilos/tokens.css`
- [ ] Biome configurado como lint e formatter únicos
- [ ] Vitest e Playwright instalados com um teste trivial cada, ambos passando
- [ ] Scripts `verificar`, `tipos`, `lint`, `teste`, `a11y`, `pendencias`, `build`, `migrar`, `seed`
      declarados; os que ainda não têm alvo real saem com código 0 e mensagem explícita
- [ ] `.gitignore` cobre `.env*`, `node_modules`, `.next`, relatórios de teste
- [ ] Versões vindas do registro, nunca escritas à mão

## Como verificar

```bash
pnpm install && pnpm verificar && pnpm build
```

## Fora de escopo

Qualquer página real, componente de UI, conexão com banco ou conteúdo.
