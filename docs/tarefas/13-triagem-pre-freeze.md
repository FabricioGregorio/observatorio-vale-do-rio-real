# TAREFA 13 — Triagem pré-freeze (14/09/2026)

**Natureza:** diagnóstico e priorização · **Não autoriza implementação por si só**

Este documento responde a uma pergunta só: **o que precisa ser corrigido antes
do congelamento interno de 14/09/2026, e o que pode esperar?** Ele não cria
funcionalidade, não altera código e não substitui as autorizações específicas
que cada correção exigirá.

## Baseline

| | |
|---|---|
| Branch | `feat/home-indicadores` |
| HEAD | `556a549c701bb419bb55a14a2d14709d5eea62ee` |
| Upstream | `origin/feat/home-indicadores`, sincronizado |
| `main` | `5a2ede89852e98cf2e69b5a2d465efafb27f55b3`, intocada |
| Produção | commit `3c68bd4` — **23 commits atrás**, 121 arquivos, +26.773 linhas |
| Banco | `documento=33`, `arquivo=18`, `documento_arquivo=18`, `vw_anexo_publico=8` |
| Gate real | verde, zero pendências |

## Resultado da triagem

**Não existe nenhum item P0.** Nenhum risco encontrado produz publicação
incorreta, exposição de dado privado, perda de evidência, site quebrado,
entrega auditavelmente inválida, build irreproduzível ou gate falsamente verde
capaz de permitir publicação indevida.

O que existe são seis itens P1 e P2, e **uma decisão humana com prazo**: a
produção não contém a reconstrução H0–H4.1.

## O que foi verificado e está conforme

Varredura dirigida sobre o artefato de produção local, sem alterar nada:

- **16 rotas públicas respondem 200**; todas as `/dev/*` respondem 404.
- `/territorio` e `/acervo` respondem 404 — **estado deliberado**: são rotas do
  menu-alvo ainda sem conteúdo, não estão no menu público e **nenhuma página
  pública as referencia** (conferido em cinco rotas).
- `/anexos.json` entrega **8** anexos, idêntico a `vw_anexo_publico` = 8.
- `sitemap.xml` lista 12 rotas e **não contém `/dev/`**.
- CTA do ZIP **ausente** da Sala, porque `ZIP_ANEXOS_PUBLICADO` não está
  declarada — estado deliberado, não defeito.
- **Zero erros de console, zero `pageerror` e zero sub-recursos 4xx/5xx** em
  `/`, `/prestacao-de-contas`, `/dados`, `/pesquisa` e `/observatorio`.
- **Nenhum placeholder ou conteúdo fictício.** As ocorrências de "todo" são
  subcadeias de "mé**todo**" e "**todo**s os anexos".
- `public/media`: **15 arquivos em disco, 15 rastreados**. Nenhuma dependência
  de arquivo local não versionado para o render público.
- Único aviso de build: a depreciação do modo TLS no driver PostgreSQL, já
  registrada. O comportamento atual é o **mais forte** (`verify-full`); o risco
  é futuro, condicionado a atualização de dependência.
- Nenhum segredo versionado. `.env.local` ignorado; `.env.example` só nomes,
  com um único valor não sensível (`NODE_ENV=development`).

## Matriz de riscos

| # | Item | Evidência | Impacto | Probabilidade | Classe | Ação |
|---|---|---|---|---|---|---|
| 1 | Produção 23 commits atrás da branch | `3c68bd4` vs `556a549`; 121 arquivos | alto (a entrega não mostra o trabalho) | certa | **P1 · decisão com prazo** | validar e implantar, com autorização própria |
| 2 | CI não valida o gate contra dados | `ci.yml` sem `DATABASE_URL_MANUTENCAO`; `pnpm seed` é no-op; CI dispara só em PR ou push para `main`, e **nunca rodou nesta branch** | médio (perda de detecção automática) | alta | **P1** | corrigir se houver tempo; enquanto não, execução manual obrigatória do gate antes de deploy/publicação |
| 3 | Teste grava fixture no banco real em paralelo com teste que afere contagens globais | bloco de integração da Tarefa 09 em `testes/pendencias.test.ts` vs `testes/espelhamento-privado.test.ts`; reproduzido nesta sessão | médio (falso vermelho e risco de resíduo) | média | **P1** | isolar em transação desfeita, como a Tarefa 12 já fez no bloco novo |
| 4 | ~~`docs/02-arquitetura-banco.md` §13 mostra as views pré-multiarquivo~~ | SQL com `da.principal` nas duas views | médio (reintrodução do bug já corrigido) | média | **P1 · RESOLVIDO em 2026-09-12** | reconciliado por decisão humana; ver nota abaixo |
| 5 | Home acima do orçamento de 500 KB | doc 01 §7; medido 625.065 B em 375 px e 812.945 B em 1440 px | médio (público-alvo com rede fraca) | certa | **P1 · documentar, não corrigir agora** | registrar o desvio na entrega; otimizar na H7 |
| 6 | `docs/handoff/` existe em cópia única, local e não versionada | 1 arquivo, 56.958 B; varredura de segredo/PII: 0 | médio (perda de continuidade) | baixa | **P1 · decisão humana** | decidir versionar ou manter fora deliberadamente |
| 7 | 3 testes de escrita real em R2 desativados | `TESTE_R2_ESCRITA` em `testes/storage-integracao.test.ts` | baixo | baixa | **P2** | manter desativados; equivalente já provado em operação real |
| 8 | Comentário desatualizado em `tokens.css` | linhas 463–465 chamam `.dados-vivos` de exclusivo de laboratório | baixo | baixa | **P2** | corrigir em manutenção documental posterior |

## Análise dos itens que exigem julgamento

### 1. Produção × branch — a decisão com prazo

A produção está funcional e auditavelmente válida: Sala, `/anexos.json` e os 8
objetos públicos são consistentes. **Não está quebrada.** O que falta lá é a
reconstrução visual H0–H4.1.

Portanto isto **não é P0**: o objeto da prestação de contas está publicado e
correto. É uma decisão de escopo com prazo — implantar a reconstrução antes de
14/09 ou congelar sobre a produção atual. Deploy é manual e documentado em
`docs/deploy/PLANO_DEPLOY_VERCEL_2026-09-08.md`; a integração Git da Vercel
está desconectada, e nenhum push dispara deploy.

### 2. CI e gate — por que não é P0

Em CI, `pnpm pendencias` roda com `DATABASE_URL` do serviço PostgreSQL, mas o
banco sobe **sem dados** (o `seed` é no-op). A view devolve zero linhas e o
gate sai verde — verde por ausência de dado, não por sanidade do dado.

Isso **não permite publicação indevida**, e a distinção importa:

- o que chega ao público vem de `vw_anexo_publico`, cujo gate é reforçado no
  próprio schema pelo CHECK `documento_publicavel_exige_revisao` — fail-closed
  no banco, não no CI;
- a publicação de arquivos é `pnpm publicar-zip`, comando manual, explícito e
  fora do build e do CI;
- `vw_pendencia_publicacao` é **detector de anomalia**, não caminho de
  autorização.

O que se perde é detecção automática. Some-se o fato de que **o CI nunca rodou
nesta branch** — os 45 commits têm validação apenas local, ainda que integral e
registrada. Enquanto o CI não for corrigido, a execução manual do gate com
credencial é obrigatória antes de qualquer deploy ou publicação.

### 3. Corrida de testes — o que ela pode e o que não pode causar

- **Falso vermelho:** sim, e foi reproduzido nesta sessão.
- **Falso verde:** não. Uma corrida faz asserção falhar, nunca passar.
- **Resíduo:** sim, se o processo morrer entre o INSERT e a limpeza. Hoje o
  resíduo é zero, conferido.
- **Alteração de estado relevante:** limitada. A linha inserida tem
  `estado_documental` no default `PENDENTE` e nenhum arquivo, portanto **não
  alcança `vw_anexo_publico`** nem chega ao público. O pior caso é uma
  pendência fantasma que bloqueia o gate e quebra a invariante de 33 documentos
  — ruidoso e auto-anunciado, não silencioso.

### 5. Performance — qual critério é violado

`docs/01-arquitetura-informacao.md` §7 fixa, na tabela de requisitos:
**"Peso | Home < 500 KB"**, com a justificativa declarada de que "o público
rural e escolar acessa por celular com rede fraca". É meta canônica com razão
de equidade, não preferência estética.

Composição medida em 375 px — o caso que a justificativa descreve:

| Recurso | Bytes | Participação |
|---|---:|---:|
| Imagens | 281.975 | 45% |
| JavaScript | 150.279 | 24% |
| Fontes | 108.972 | 17% |
| HTML | 76.502 | 12% |
| CSS | 7.120 | 1% |

**Não há otimização de alto impacto e baixo risco.** O Hero móvel sozinho pesa
182.298 B, e recomprimi-lo muda o hash de um derivado com proveniência
registrada; as fontes custam 109 kB e reduzi-las mexe na tipografia aprovada; o
JavaScript é linha de base do framework, com as ilhas já justificadas. Toda
alavanca toca ou o visual aprovado ou a cadeia de proveniência.

**Recomendação: não otimizar antes do freeze.** O ganho é incerto e o risco de
regressão visual ou documental é real a dois dias do prazo. Registrar o desvio
honestamente na entrega e tratá-lo na H7.

### 7. Testes R2 — o que eles provam e por que podem esperar

Os três escrevem nos dois buckets reais e depois removem: upload/leitura/
integridade/remoção no público, acesso autenticado e anônimo no privado, e
isolamento cruzado de credenciais.

O comportamento equivalente **já foi provado em operação real**, com evidência
mais forte que a de um teste: 10 uploads privados com SHA-256 conferido e GET
anônimo negado (10 respostas HTTP 400) no Prompt 3.4.2, e 8 uploads públicos
com SHA-256, bytes, MIME e Cache-Control conferidos no Prompt 3.10.

Executá-los agora escreveria objetos transitórios em buckets que fazem parte da
evidência da prestação de contas, cuja impressão digital atual é conhecida e
auditada. **Não são bloqueadores; mantê-los desativados é a escolha correta.**

### 6. `docs/handoff/` — o que contém e o risco

Um arquivo: `HANDOFF_ARQUITETO_SENIOR_2026-09-12.md`, 56.958 B — o estado
consolidado mais completo já produzido no projeto. Varredura: **zero** URLs de
conexão, chaves, tokens, e-mails, CPF ou telefone. Cita "Dona Madá" duas vezes,
nome **já versionado** em três auditorias do repositório e com autorização
institucional registrada.

O risco não é de exposição, é de **perda**: o documento existe em cópia única,
numa máquina, fora do Git — exatamente o risco que o checkpoint remoto da
rodada anterior eliminou para o código. Versioná-lo é decisão humana, porque
ele foi deliberadamente mantido fora.

## Sequência mínima proposta

Três tarefas, e não uma por dívida. Cada uma **ainda precisa de autorização
humana própria**; este documento não a concede.

### T-A · Confiabilidade de testes e CI

Agrupa os itens 2 e 3 — mesmo domínio, mesma fronteira: teste que toca banco
real e CI que não valida o que promete. Escopo previsto: isolar o bloco de
integração da Tarefa 09 em transação desfeita e dar ao CI credencial e dados
suficientes para o gate morder de verdade. Critérios de aceite relacionados;
risco baixo; nenhum efeito sobre produto.

### T-B · Verdade documental normativa

Agrupa os itens 4, 6 e 8 — todos documentais, nenhum altera comportamento.
Escopo previsto: alinhar `docs/02-arquitetura-banco.md` §13 ao modelo
multiarquivo, decidir o destino de `docs/handoff/` e corrigir o comentário de
`tokens.css`. **O item 4 exige decisão humana explícita**, porque alterar
arquitetura canônica não é atribuição do agente.

### T-C · Validação pré-deploy e publicação da reconstrução

Trata o item 1, que é o caminho crítico do prazo. Escopo previsto: conferência
imediatamente antes e imediatamente depois do deploy manual.

**Antes:** `pnpm verificar` verde; gate real executado com credencial; banco em
33/18/18 e `vw_anexo_publico`=8; impressão digital dos buckets inalterada;
build reproduzível a partir do commit exato; varredura de segredo no artefato;
confirmação de que nenhuma rota `/dev/` responde no build de produção.

**Depois:** as 16 rotas públicas em 200 e `/dev/*` em 404 no domínio real;
`/anexos.json` com 8 e os 8 links do acervo em 200; canonical, Open Graph e
sitemap apontando para o domínio institucional; ausência de `r2.dev`, endpoint
S3, segredo ou caminho local no HTML, nos bundles e nos source maps; peso
medido no ambiente real; banco e buckets inalterados pelo deploy.

## Ordem recomendada

1. **T-B, parte documental barata** — é o que protege contra um agente futuro
   reintroduzir o defeito do gate a partir da arquitetura canônica.
2. **T-A** — dá dentes à validação automática antes de ela ser necessária.
3. **T-C** — a entrega propriamente dita, com autorização específica.

Performance (item 5) e testes R2 (item 7) **não entram na sequência
pré-freeze**, por decisão fundamentada acima.

## Critérios de parada

Parar e devolver a decisão ao humano se, durante qualquer uma das três tarefas,
aparecer: necessidade de alterar dado real para fazer gate ou teste passar;
alteração de arquitetura canônica sem decisão explícita; qualquer mudança em
`vw_anexo_publico`, no dataset factual ou no conjunto publicado; escrita real
em R2; ou qualquer indício de que o deploy alteraria banco, buckets ou domínio
sem autorização própria.

## Atualização — 2026-09-12: item 4 resolvido

O responsável autorizou a reconciliação documental, e ela foi executada na
mesma data. `docs/02-arquitetura-banco.md` passou a refletir o modelo
multiarquivo: `arquivo` como objeto físico com identidade
`(bucket, chave_storage)`, `sha256` explicitamente não único, `replica_de_id`
ao lado de `derivado_de_id`, o significado real de
`documento_arquivo.principal` e as duas views conforme as migrações 0007 e
0008. **Nenhuma migration, view, schema, código ou dado foi alterado** — só o
texto canônico passou a descrever o que já estava aplicado.

Na mesma rodada foi corrigido o comentário de `src/estilos/tokens.css`
(item 8), exclusivamente comentário, com o CSS funcional provado idêntico.

Os demais riscos **não tiveram sua classificação alterada**: nenhuma evidência
nova foi produzida sobre eles.

## O que ainda precisa de autorização humana

Nenhuma implementação está autorizada por este documento. Precisam de
autorização individual, nesta ordem de urgência:

1. ~~decisão sobre atualizar `docs/02-arquitetura-banco.md` §13~~ — **concedida
   e executada em 2026-09-12**;
2. decisão sobre versionar ou não `docs/handoff/`;
3. abertura da T-A — confiabilidade de testes e CI;
4. abertura da T-C e, separadamente, a execução do deploy.
