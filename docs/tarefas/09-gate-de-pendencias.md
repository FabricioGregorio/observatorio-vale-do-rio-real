# TAREFA 09 — Gate de pendências no CI

**Fase:** 1 · **Depende de:** 05, 07 · **Estimativa de diff:** pequeno

## Objetivo

Impedir tecnicamente que o site publique um anexo obrigatório sem espelho local ou um
áudio sem consentimento registrado.

## Contexto obrigatório

- `docs/02-arquitetura-banco.md`, seção 13
- `docs/03-guia-implementacao.md`, seção 6

## Arquivos permitidos

```
db/migrations/0003_*.sql  scripts/verificar-pendencias.ts
package.json (script pendencias)  .github/workflows/ci.yml
```

## Critérios de aceite

- [ ] View `vw_pendencia_publicacao` criada conforme o documento — **apenas o ramo do anexo**
      nesta fatia; o ramo do áudio fica reservado, pelos motivos da seção *Fatiamento por
      dependência* abaixo
- [ ] Script sai com código 1 e imprime tabela legível se houver qualquer linha
- [ ] Sai com código 0 e mensagem clara quando estiver limpa
- [ ] Roda no CI antes do deploy e bloqueia o merge
- [ ] Teste de integração cria um documento pendente e prova que o script falha

## Como verificar

```bash
pnpm pendencias                 # esperado: limpo
pnpm teste testes/pendencias    # esperado: verde
```

## Fora de escopo

Corrigir as pendências encontradas. O gate apenas denuncia.

---

## Fatiamento por dependência — decidido em 2026-09-01

A `vw_pendencia_publicacao` do doc 02 §13 tem dois ramos em `UNION ALL`. Só o
primeiro é executável hoje.

**O ramo do anexo** lê `documento`, `documento_arquivo` e `arquivo`. As três tabelas
existem desde a migração 0002, com todas as colunas de que ele precisa:
`documento.exigido_pelo_edital`, `documento.status`, `documento_arquivo.principal` e
`arquivo.espelhado_em`.

**O ramo do áudio** lê `entrevista`. Essa tabela **não existe**: a migração 0002 criou
sete tabelas — `arquivo`, `municipio`, `pessoa`, `equipamento`, `consentimento`,
`documento`, `documento_arquivo` — e nenhuma delas é `entrevista`. `consentimento`
existe; é a outra ponta do `LEFT JOIN` que falta. Um `CREATE VIEW` com esse ramo falha
na hora, com `relation "entrevista" does not exist`.

`entrevista` pertence ao item 3 da §16 do doc 02, que é o item 17 do backlog do doc 03
§10 — **Fase 3**. O próprio doc 02 §16 já registrava a dependência no item 9: *"a trava
`vw_pendencia_publicacao` no CI (…) depende de `entrevista` e `consentimento`, por isso
vem depois do item 3"*. O doc 03 §10 põe o gate no item 9 da Fase 1. Os dois documentos
discordam sobre **quando** esta tarefa acontece, e essa divergência é a origem do
fatiamento.

### O que foi decidido

A migração 0003 cria a view **somente com o ramo do anexo**. O ramo do áudio entra numa
migração futura, quando `entrevista` existir.

**Isto não é remoção de requisito.** O requisito continua inteiro; foi fatiado pela
dependência que o bloqueia. Nenhuma tabela, coluna ou relacionamento de Fase 3 foi
antecipado, inventado ou simulado para destravar a tarefa.

### Por que o segundo ramo caberá sem reescrever a view

`UNION ALL` acrescenta **linhas**, não colunas. A lista de colunas continua sendo
`slug, titulo, pendencia` com os mesmos tipos e na mesma ordem — que é exatamente a
condição que o PostgreSQL impõe ao `CREATE OR REPLACE VIEW`. A migração futura
acrescenta o ramo com um `CREATE OR REPLACE VIEW`, sem `DROP`, sem perder permissões e
sem tocar em nada que dependa da view.

Por isso o `SELECT` da 0003 já nomeia as três colunas explicitamente e fixa o texto da
pendência num literal: a forma do resultado é contrato, não detalhe.

---

## Comportamento sem `DATABASE_URL` — decidido em 2026-09-01

Um gate que não conseguiu verificar **não pode imprimir "limpo"**. Dizer "nenhuma
pendência" quando nada foi consultado é pior do que não ter gate nenhum: dá garantia
falsa justamente onde o projeto prometeu rastreabilidade.

Mas o gate também não pode quebrar a máquina de quem não tem credencial — o
`pnpm verificar` do doc 03 §7 já encadeia `pnpm pendencias`.

A regra, então, distingue os dois contextos:

| Contexto | Sem `DATABASE_URL` | Código de saída |
|---|---|---|
| Fora do CI | informa **"não verificado"**, dizendo o que deixou de ser conferido | 0 |
| Em CI (`process.env.CI`) | **erro explícito** — no CI a ausência da variável é defeito de configuração, não ambiente sem credencial | 1 |

O `.github/workflows/ci.yml` já define `DATABASE_URL` no serviço `postgres`, então o
pipeline real nunca cai nesse ramo. Ele existe para o caso em que alguém remova a
variável do workflow: aí o gate denuncia, em vez de passar em silêncio.

Note a diferença para a Tarefa 08: lá a ausência de `DATABASE_URL` degrada para lista
vazia, porque a página **exibe** dados. Aqui ela não degrada, porque o script **atesta**
uma ausência. Exibir de menos é aceitável; atestar de menos, não.

**Credencial:** o script lê e não altera schema, então usa `DATABASE_URL`, o role da
aplicação. `DATABASE_URL_MIGRACAO` é exclusiva de DDL (doc 03 §6.8, ADR-007).

---

## Testes — decidido em 2026-09-01

`testes/pendencias.test.ts` tem duas partes:

- **Unitária, sempre roda:** formatação da tabela, decisão de código de saída, texto das
  mensagens. Não abre conexão.
- **Integração, só com banco:** `describe.skipIf(!process.env.DATABASE_URL)`. Cria um
  documento exigido pelo edital, publicado e sem arquivo espelhado, prova que a view o
  denuncia e que o script falha; depois desfaz o que criou.

Nenhum banco falso e nenhum mock de PostgreSQL. Um mock provaria apenas que o mock
funciona — a view é SQL, e SQL só se verifica contra um servidor de verdade. O skip
aparece na saída do Vitest, então a ausência de cobertura fica visível em vez de
silenciosa.

---

## Estado real esperado do gate

Com o inventário de hoje, o gate sai **limpo** — e isso está correto, não é falso
negativo. O `scripts/catalogar-documentos.ts` não publica nada: todo documento nasce e
permanece em `rascunho`. O ramo do anexo filtra `status = 'publicado'`, logo não há o
que denunciar. No CI o banco sobe vazio, com o mesmo resultado.

O gate passa a morder quando o primeiro documento for publicado sem espelho — que é o
momento para o qual ele foi feito.

## Relação com a Sala do Avaliador (Tarefa 08)

A `vw_anexo_publico` expõe a coluna `espelhado` mas **publica a linha de qualquer
jeito**: um anexo obrigatório sem espelho aparece na Sala com `espelhado = false`. O
gate é a trava correspondente.

As duas views usam junções diferentes de propósito: `vw_anexo_publico` usa `JOIN`, então
documento sem arquivo principal simplesmente não aparece na Sala; `vw_pendencia_publicacao`
usa `LEFT JOIN` para pegar exatamente esse caso. São complementares.
