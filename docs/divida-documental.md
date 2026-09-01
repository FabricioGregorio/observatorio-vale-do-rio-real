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
