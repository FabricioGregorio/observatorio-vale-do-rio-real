# Dívida documental

Divergências conhecidas entre a documentação e as decisões já tomadas. Nenhuma delas
bloqueia implementação; todas precisam de correção quando houver janela.

Registrar aqui evita dois erros opostos: parar uma tarefa por causa de um texto
desatualizado, e deixar o texto desatualizado governar uma decisão futura.

---

## 1. Roles do Supabase na §14 do doc 02

**Onde:** `docs/02-arquitetura-banco.md`, linhas 807–822 (§14, Row Level Security).

**O que está lá:** as políticas de RLS são escritas para os roles `anon` e
`service_role`, e o texto começa com *"Com Supabase, o site anônimo lê apenas o que
está publicado"*. O cabeçalho do documento (linha 5) e a §15 (linha 840) também tratam
"Supabase ou Neon" como escolha em aberto.

**Por que é dívida:** a ADR-004 fechou **Neon**. `anon` e `service_role` são construções
do Supabase e não existem num PostgreSQL comum. A ADR-007 definiu o modelo real de
roles do projeto: um de aplicação sem DDL e um de migração com DDL, provisionados como
infraestrutura.

**Impacto:** nenhum sobre o código escrito até aqui — RLS ainda não foi implementada.
Vira bloqueio real quando a tarefa de RLS chegar (item 9 do backlog do doc 03 §10).

**Correção:** reescrever a §14 com os roles da ADR-007, ou registrar explicitamente que
os nomes ali são ilustrativos.

---

## 2. `sslmode=require` nos comentários de código

**Onde:**

- `src/dados/cliente.ts`, linha 12
- `db/cliente.ts`, linha 13
- `drizzle.config.ts`, linha 15
- `.env.example` — sem nenhuma menção a `sslmode`

**O que está lá:** os três comentários dizem *"TLS é responsabilidade da URL de conexão
(`?sslmode=require` quando o provedor exigir)"*.

**Por que é dívida:** a ADR-008 decidiu **`sslmode=verify-full`** para produção,
justamente porque `require` vai mudar de significado no `pg` v9 e virar criptografia sem
verificação de certificado. A própria ADR-008 lista `.env.example` entre os arquivos
impactados, e essa parte não foi feita.

**Impacto:** nenhum sobre o comportamento — não há configuração fixa de SSL no código, e
o valor efetivo vem da URL. O risco é alguém copiar `require` do comentário para uma URL
de produção.

**Correção:** trocar `require` por `verify-full` nos três comentários e documentar as
duas URLs no `.env.example`.

---

## 3. Referências a números antigos de tarefa — **não existe**

Verificado em 2026-08-31 por varredura em `docs/*.md` e `docs/decisoes/*.md`: **nenhuma
ocorrência remanescente**. A renumeração de 2026-08-30 (07→08, 08→09, 09→10, com a nova
07 de catálogo documental) foi completa, incluindo o backlog do doc 03 §10 e a
referência do doc 03 §11.

Item mantido aqui apenas para registrar que foi conferido e está resolvido.

---

## 4. Lighthouse CI exigido pela documentação, não executado pelo CI

**Onde:**

- `docs/03-guia-implementacao.md` §7 — lista "Lighthouse CI ≥ 90" entre os **gates
  bloqueantes** do CI
- `docs/03-guia-implementacao.md` §14 — checklist de entrega
- `docs/01-arquitetura-informacao.md` §7 e §11 — "Lighthouse ≥ 90 em todas as
  categorias" como requisito não funcional e item da definição de pronto
- `docs/tarefas/10-home-indicadores.md` — "Como verificar" roda `pnpm exec lhci autorun`
- `lighthouserc.json` — versionado na raiz desde o commit `e509462`
- `.github/workflows/ci.yml` — o passo foi **removido em 2026-09-01**

**O que está lá:** quatro documentos tratam o Lighthouse como gate bloqueante, e a
configuração existe. O pipeline não o executa.

**Por que é dívida:** o passo `pnpm exec lhci autorun` falhava em toda execução com
`[ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL] Command "lhci" not found`. O pacote `@lhci/cli`
nunca foi instalado: não está no `package.json` nem no `pnpm-lock.yaml`. O passo foi
removido para destravar o CI.

**O gate continua obrigatório.** Não foi cancelado nem rebaixado: está temporariamente
não executado. Nenhum critério de aceite, meta de desempenho ou item de definição de
pronto foi removido de documento nenhum.

**Onde ele pertence:** o backlog do doc 03 §10 já agenda a implementação no **item 26,
Fase 4** — *"Auditoria WCAG final, Lighthouse CI, depósito no Zenodo, arquivamento no
Internet Archive"*. A anomalia não é o adiamento; é o `lighthouserc.json` ter chegado na
Fase 1, junto com o bootstrap, três fases antes da tarefa que o implementa.

**Impacto:** nenhum sobre o código. O gate de acessibilidade continua ativo por outro
caminho — o axe-core do `pnpm a11y` roda a cada PR, e é ele que cobre o requisito de
WCAG. O que não é medido hoje é desempenho, SEO e boas práticas.

**O que falta, além da dependência.** Instalar `@lhci/cli` sozinho não faz o gate
funcionar. O `lighthouserc.json` atual declara só `collect.url` apontando para
`http://127.0.0.1:3000` e **não tem `startServerCommand`**; o workflow também não sobe
servidor nenhum — quem sobe é o `webServer` do `playwright.config.ts`, e só durante o
`pnpm a11y`. Restaurar o passo hoje trocaria "comando não encontrado" por "conexão
recusada". Falta ainda a simulação de 3G que o doc 01 §7 e a Tarefa 10 exigem: a
configuração não declara `throttling`, e o padrão do Lighthouse é 4G lento.

**Correção:** na tarefa do item 26, instalar `@lhci/cli`, completar o `lighthouserc.json`
com `startServerCommand` e `throttling` de 3G, e restaurar o passo no
`.github/workflows/ci.yml` com o env `LHCI_GITHUB_APP_TOKEN` e o `.lighthouseci/` na
lista de artefatos. Medir antes da Tarefa 10 tem pouco valor: a home ainda é a página
provisória do bootstrap, e onze rotas são stubs.
