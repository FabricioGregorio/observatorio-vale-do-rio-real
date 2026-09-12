# TAREFA 11 — Gate de pendências: alinhar ao modelo multiarquivo (gate existencial)

**Fase:** 1 · **Depende de:** 07, 09 · **Estimativa de diff:** pequeno

## Objetivo

Corrigir `vw_pendencia_publicacao` para que ela represente corretamente o modelo de
publicação multiarquivo já aprovado pela ADR-016 e materializado pela migração
`0007_publicacao_multiarquivo`, eliminando o falso positivo que hoje bloqueia
`pnpm pendencias` e, por consequência, `pnpm verificar`.

Esta tarefa **não** integra H4.1 na Home. Ela é o pré-requisito documentado no
handoff de 12/09/2026 para que a H4.1 possa ser aberta.

## Contexto obrigatório

- `docs/02-arquitetura-banco.md`, §13 (Views de consumo) — **contém o texto
  desatualizado da view**; ver seção "Drift documental" abaixo antes de usar
  como referência de implementação.
- `docs/03-guia-implementacao.md`, §6 (Banco: da documentação ao código) —
  checklist obrigatório de migração destrutiva/alteração de view, e a regra de
  que views são declaradas com `.existing()` no Drizzle.
- `docs/decisoes/ADR-016-modelo-arquivo-publicacao-multiarquivo.md` — decisão
  que introduziu o modelo multiarquivo e a semântica atual de
  `documento_arquivo.principal` como metadado representativo, não gate.
- `docs/handoff/HANDOFF_ARQUITETO_SENIOR_2026-09-12.md`, §10, §11 e §39 —
  diagnóstico do falso positivo, decisão humana do gate existencial e
  checklist de retomada.
- `docs/tarefas/09-gate-de-pendencias.md` — tarefa original do gate; esta
  tarefa é uma correção pontual sobre ela, não uma reescrita.

Não foi necessário carregar `docs/01-arquitetura-informacao.md` além de uma
busca dirigida: o documento não menciona `vw_pendencia_publicacao`, `principal`
nem o modelo multiarquivo — é arquitetura de navegação/conteúdo, sem relação
com este gate.

## Problema observado

**Comportamento atual.** `vw_pendencia_publicacao` (recriada em
`0004_modelo_documental.sql`, nunca tocada desde então) tem dois ramos que
fazem `LEFT JOIN documento_arquivo da ON da.documento_id = d.id AND da.principal`.
Isso significa: só um vínculo `principal = true` é considerado ao verificar se
o documento "tem arquivo espelhado". Quando nenhum vínculo do documento é
`principal`, o `LEFT JOIN` não encontra nada e a linha cai no `a.id IS NULL`,
gerando pendência — mesmo que existam outros vínculos válidos e públicos.

**Falso positivo confirmado.** O documento `identidade-visual` (slug do
lote D01) tem oito arquivos vinculados, sete públicos e elegíveis, todos com
`principal = false` (registrado em `ESTADO_ATUAL_PROJETO.md`, Prompt 3.4.2 e
Prompt 3.10). Com banco real, `vw_pendencia_publicacao` retorna uma linha para
esse documento com o texto `estado PUBLICAVEL sem arquivo espelhado` — falso,
porque `vw_anexo_publico` (corrigida na 0007) reconhece corretamente os sete
arquivos.

**Comportamento esperado.** Um documento só deve ser considerado pendente
quando **nenhum** dos seus vínculos aponta para um arquivo que satisfaça
integralmente o gate público (mesmos critérios de `vw_anexo_publico`:
espelhado, visível como público, com URL pública). A existência de pelo menos
um vínculo elegível — `principal` ou não — encerra a pendência para aquele
documento.

**Relação com `principal`.** O campo não muda de significado: continua sendo
o arquivo representativo/preferencial do documento (ADR-016). Ele deixa de ser
usado como condição de junção no gate de existência de arquivo.

**Impacto.** `pnpm pendencias` termina com código 1 contra o banco real;
`pnpm verificar` não fecha verde; qualquer PR que dependa do gate — inclusive
a futura H4.1 — fica bloqueado.

**Segunda inexatidão, independente da primeira.** A mensagem final de
`scripts/verificar-pendencias.ts` (`resultado()`, função `mensagem`) afirma
"Cada linha é um documento publicado que o edital exige e que não tem arquivo
espelhado". Isso é falso para o próprio caso `identidade-visual`: D01 tem
`exigido_pelo_edital = false` (é evidência complementar, não item do edital) e
ainda assim pode gerar linha pelo segundo ramo da view (`estado PUBLICAVEL sem
arquivo espelhado`), que não depende de `exigido_pelo_edital`. A mensagem deve
parar de presumir que toda linha pertence a um item exigido pelo edital.

## Decisão humana desta sessão

Registrada explicitamente pelo responsável humano nesta sessão e tratada como
topo da hierarquia normativa do projeto para esta tarefa:

> O modelo válido de publicação é multiarquivo, conforme ADR-016 e migração
> `0007`. `documento_arquivo.principal` indica apenas o arquivo
> representativo/preferencial do documento. `principal` **não é** autorização
> pública e **não é** requisito para que um arquivo seja considerado
> publicável. Um documento com pelo menos um arquivo que satisfaça
> integralmente o gate público não deve ser considerado pendente só porque
> esse arquivo tem `principal = false`.

Esta é a mesma decisão que o handoff de 12/09/2026 registra como **gate
existencial**, já aprovada pelo responsável humano naquela sessão (§11 do
handoff). Esta tarefa formaliza a implementação; não reabre a decisão.

## Escopo permitido

```
db/migrations/0008_*.sql
db/migrations/meta/0008_snapshot.json     (gerado por `pnpm gerar-migracao`)
db/migrations/meta/_journal.json          (atualizado por `pnpm gerar-migracao`)
db/schema.ts                              (só o comentário de vwPendenciaPublicacao, linhas ~629-644 — a forma de colunas slug/titulo/pendencia não muda)
scripts/verificar-pendencias.ts           (só a mensagem, não a lógica de decisão)
testes/pendencias.test.ts
```

Caminhos confirmados no repositório nesta rodada; nenhum foi presumido.
`db/schema.ts` entra apenas porque o comentário atual (linhas 635-637) descreve
a semântica antiga ("arquivo principal espelhado" / "vínculo preferencial") e
ficaria incorreto após a correção — a declaração `.existing()` em si
(`slug`, `titulo`, `pendencia`) não muda, porque a 0007 já provou que
`UNION ALL`/`CREATE OR REPLACE VIEW` preserva a forma do contrato.

## Fora de escopo

- Alterar migrations `0001`–`0007`.
- Alterar `docs/decisoes/ADR-016-modelo-arquivo-publicacao-multiarquivo.md`.
- Alterar frontend (`src/app/`, componentes, `/dev/dados-vivos`, Home, H1–H4).
- Integrar H4.1 na Home.
- Alterar conteúdo editorial.
- Alterar storage/R2, objetos publicados ou proveniência de arquivo.
- Alterar `docs/historico/`.
- Realizar deploy, push ou abrir PR.
- Alterar dependências ou lockfile.
- Modificar dados reais (banco) para fazer o teste passar — nenhuma linha de
  `documento_arquivo` pode ser marcada `principal = true` como atalho.
- Enfraquecer qualquer outro ramo do gate: consentimento (ramo do áudio,
  reservado para quando `entrevista` existir), coerência
  `status = 'publicado'` vs `estado_documental`, ou revisão de privacidade.
- Corrigir `docs/02-arquitetura-banco.md` (drift documental — ver seção
  própria abaixo; fica para decisão humana futura).
- Alterar `.github/workflows/ci.yml`. A dívida de CI encontrada nesta rodada
  (ver "Cuidado com teste falsamente verde") fica registrada como pendência
  posterior, não corrigida aqui.

## Migração

A correção é exclusivamente por nova migração versionada, gerada por
`pnpm gerar-migracao` e lida à mão antes de aceita. **Próxima numeração
disponível confirmada no repositório: `0008`** (última aplicada é `0007`,
conforme `db/migrations/meta/_journal.json`). Nunca editar
`0007_publicacao_multiarquivo.sql`.

A migração deve conter um único `CREATE OR REPLACE VIEW vw_pendencia_publicacao`
que:

- preserve a forma de contrato `(slug, titulo, pendencia)`, na mesma ordem e
  tipos, como a 0004 já fez sobre a 0003;
- troque a condição de existência de arquivo de "existe vínculo com
  `principal = true` cujo arquivo está espelhado" para "existe **algum**
  vínculo cujo arquivo satisfaz o gate público" (mesmos critérios de
  `vw_anexo_publico`: `espelhado_em IS NOT NULL`, `visibilidade = 'publico'`,
  `url_publica IS NOT NULL` — a implementação real decide se isso é feito por
  `EXISTS`/subquery ou por reformulação do `LEFT JOIN`; a revisão manual deve
  conferir que o resultado é equivalente a "nenhum arquivo elegível" e não
  apenas "nenhum arquivo principal elegível");
- preserve o terceiro ramo (`status publicado divergente do estado
  documental`), que não depende de `principal` e não é afetado pelo defeito;
- preserve o ramo herdado da 0003 (anexo obrigatório sem arquivo espelhado)
  com a mesma correção de critério de existência, já que ele usa a mesma
  junção viciada por `principal`.

Antes da aplicação, a migração exige revisão manual conforme o checklist de
`docs/03-guia-implementacao.md` §6 (é `CREATE OR REPLACE VIEW`, não `DROP`
nem `ALTER` de coluna, mas o checklist de dependência de view/trigger
continua valendo por prudência). Responder no PR:

- a alteração recria a view inteira com `CREATE OR REPLACE VIEW`, sem `DROP`;
- nenhuma coluna de `documento`, `documento_arquivo` ou `arquivo` muda de tipo
  ou é removida;
- nenhuma função ou trigger existente depende do texto da view;
- a forma do resultado (`slug, titulo, pendencia`) permanece idêntica à
  declaração `.existing()` em `db/schema.ts`.

## Regressão obrigatória

A implementação futura deve provar, no mínimo, estes quatro casos (critérios
de aceite — não codificados nesta tarefa de planejamento):

**Caso A — multiarquivo válido.** Documento publicável (`PUBLICAVEL`,
`revisao_privacidade = concluida`, `status = publicado`) com um arquivo que
satisfaz integralmente o gate público, vinculado por `documento_arquivo`, mas
com `principal = false`. Resultado esperado: **não** gera pendência de
ausência de arquivo público.

**Caso B — nenhum arquivo elegível.** Documento no mesmo estado, sem nenhum
vínculo capaz de satisfazer integralmente o gate público (nenhum arquivo
espelhado, ou espelhado mas privado, ou sem URL pública). Resultado esperado:
**continua** gerando pendência.

**Caso C — regressão do acervo público.** A correção de
`vw_pendencia_publicacao` não pode alterar `vw_anexo_publico`, que não é
tocada por esta migração. O lote público atual (A02 + sete arquivos de D01,
total de oito, conforme `ESTADO_ATUAL_PROJETO.md`) deve continuar representado
sem mudança antes/depois da migração.

**Caso D — demais gates preservados.** Consentimento (ramo do áudio, ainda
reservado por depender de `entrevista`), coerência `status` vs
`estado_documental`, revisão de privacidade e qualquer outro requisito
existente não podem ser relaxados por esta correção. Em particular, um
documento sem nenhum arquivo elegível continua pendente mesmo que tenha um
vínculo `principal = true` apontando para um arquivo não elegível (privado,
não espelhado, sem URL).

O teste de integração existente em `testes/pendencias.test.ts`
(`describe.skipIf(!DATABASE_URL || !DATABASE_URL_MANUTENCAO)`) é o lugar
natural para os casos A e B; os testes puros de `resultado()`/`formatarTabela`
continuam cobrindo a decisão de código de saída e formatação, sem tocar banco.

## Mensagem de erro/diagnóstico

A mensagem de pendência em `scripts/verificar-pendencias.ts` (`resultado()`)
afirma hoje que toda linha é "um documento publicado que o edital exige".
Isso é falso para o ramo `estado PUBLICAVEL sem arquivo espelhado`, que não
filtra por `exigido_pelo_edital` (ver `0004_modelo_documental.sql`). A tarefa
exige corrigir o texto para não presumir edital em toda linha — por exemplo,
descrevendo a pendência como incoerência entre estado documental e arquivo
público, sem afirmar obrigatoriedade editalícia que a própria view não
garante. A redação final deve ser decidida lendo a implementação (view e
script) no momento da correção, não fixada antecipadamente aqui.

## Verificação

```bash
pnpm gerar-migracao         # única forma permitida de gerar a 0008
pnpm migrar                 # aplica contra o ambiente de desenvolvimento, após revisão manual do SQL
pnpm teste testes/pendencias.test.ts
pnpm pendencias             # esperado: código 0 contra o banco real, sem falso positivo em identidade-visual
pnpm verificar
```

`pnpm verificar` já encadeia tipos, lint, teste, `a11y` e `pendencias` — não
há comando adicional de projeto para este escopo além dos listados. Não
inventar comando novo.

## Cuidado com teste falsamente verde

Três camadas distintas de exercício do gate, que não podem ser confundidas:

1. **Teste unitário/de regressão** (`testes/pendencias.test.ts`, bloco de
   integração) — roda contra um PostgreSQL real, mas só quando
   `DATABASE_URL` **e** `DATABASE_URL_MANUTENCAO` estão presentes.
2. **Validação da migração** — aplicar `0008` num ambiente de desenvolvimento
   e conferir manualmente o resultado da view contra os dados reais atuais
   (que hoje incluem o caso `identidade-visual`).
3. **Validação do gate contra o conjunto real aplicável** — `pnpm pendencias`
   rodado localmente com a credencial de leitura, contra o banco atual de 33
   documentos.

**Achado desta rodada, fora do escopo de correção:** `.github/workflows/ci.yml`
define `DATABASE_URL` e `DATABASE_URL_MIGRACAO` no job `verificar`, mas
**não define `DATABASE_URL_MANUTENCAO`**. Como o bloco de integração de
`testes/pendencias.test.ts` usa
`describe.skipIf(!DATABASE_URL || !DATABASE_URL_MANUTENCAO)`, esse teste é
**pulado em CI** — só roda localmente, quando alguém tem as duas credenciais.
Além disso, `pnpm seed` é hoje um no-op (`"Sem seed: banco ainda fora do
escopo do bootstrap."`), então o banco de CI nunca chega a ter um documento
`PUBLICAVEL` com vínculos `principal = false`: `pnpm pendencias` passa em CI
hoje com zero linhas, mas isso não prova que o caso multiarquivo funciona —
prova apenas que a tabela está vazia. Este é exatamente o tipo de "verde
vazio" que o handoff (§38) já sinalizava. Fica registrado aqui como dívida
posterior; esta tarefa não deve tentar corrigi-lo alterando o workflow.

## Verificação de git — antes e depois desta rodada

- Branch: `feat/home-indicadores`.
- HEAD antes: `98f5999664e6bfdc5b526e68f9c96e2f3641291e`.
- HEAD depois desta rodada de planejamento: inalterado — nenhum commit foi
  feito.
- Únicas alterações desta rodada: este arquivo,
  `docs/tarefas/11-gate-pendencias-multiarquivo.md` (novo). Nenhum arquivo
  pré-existente foi sobrescrito. `docs/handoff/` permanece não rastreado,
  como estava antes desta sessão.

---

## Drift documental — registrado, não corrigido

`docs/02-arquitetura-banco.md` §13 ainda mostra, em SQL, a versão anterior das
duas views:

- `vw_anexo_publico` com `JOIN documento_arquivo da ON da.documento_id = d.id
  AND da.principal` — pré-multiarquivo, superada pela migração `0007` e pela
  ADR-016;
- `vw_pendencia_publicacao` com `LEFT JOIN documento_arquivo da ON
  da.documento_id = d.id AND da.principal` — é exatamente o texto que
  descreve o defeito que esta tarefa corrige.

Isso é uma divergência normativa real: o documento nº 2 da hierarquia de
fontes de verdade (`AGENTS.md` e o handoff) ainda expressa a regra que a
migração `0007` e a decisão humana desta sessão substituíram. A instrução
humana registrada nesta sessão resolve a decisão **para esta tarefa**:
`principal` não é requisito de publicação, e a implementação deve seguir a
migração `0007`/ADR-016, não o texto atual do doc 02 §13.

Qualquer atualização futura de `docs/02-arquitetura-banco.md` para
refletir o modelo multiarquivo deve ser tratada como mudança deliberada de
arquitetura canônica — proposta em `docs/decisoes/` e decidida pelo humano,
nunca como efeito colateral silencioso desta ou de outra tarefa (`AGENTS.md`,
hierarquia de fontes de verdade, itens 2–3).
