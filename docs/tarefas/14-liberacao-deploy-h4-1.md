# TAREFA 14 — Validação pré-deploy e liberação da reconstrução H0–H4.1

**Natureza:** validação e preparação auditável · **Não autoriza o deploy por si só**

Esta tarefa responde a uma pergunta: **o commit candidato pode substituir com
segurança o frontend em produção?** A validação foi executada em 2026-09-13. A
operação de deploy depende de autorização humana própria, posterior a este
documento.

## Commit candidato e produção atual

| | Candidato | Produção |
|---|---|---|
| Commit | `3519bc014251e02c21e0dceed63d0714de012e67` | `3c68bd45ef5ae8e17824cd4ddb1ce047e3994d86` |
| Branch | `feat/home-indicadores`, sincronizada com o remoto | a mesma, 24 commits atrás |
| Deployment | — | `dpl_9uudmMsKygEowzpSkt6Gpt73BUiE` |
| Domínio | — | `https://observatoriotobiassoueu.com.br` (apex, 200); `www` com 308 |
| Acervo | — | `https://acervo.observatoriotobiassoueu.com.br` |

**O que a produção já entrega e não pode regredir:** Sala da Prestação de
Contas em 200, `/anexos.json` com 8 anexos, `sitemap.xml`, `robots.txt`, rotas
`/dev/*` em 404 e o ZIP corretamente em 404.

**O que a produção não tem e o candidato acrescenta:** a reconstrução visual
inteira. Verificado por HTTP no HTML servido em produção — zero ocorrências de
`hero-home`, `territorio-home`, `pesquisa-home`, `secao-dados-home` e "Onde o
recurso circula". A produção é a fatia estrutural da Tarefa 10A; o candidato
acrescenta Hero H1, Território H2, Pesquisa em Campo H3 e Dados H4.1.

## Resultado da validação

Todos os itens abaixo foram executados no commit candidato, com árvore limpa
(apenas `docs/handoff/` não rastreado, que não é lido por nenhum código).

| Verificação | Resultado |
|---|---|
| Lockfile | **inalterado desde o último deploy**; o `package.json` mudou apenas em três *scripts*, nenhuma dependência — `--frozen-lockfile` segue válido |
| `pnpm build` | **exit 0**, 25/25 páginas estáticas; único aviso é o do driver PostgreSQL sobre modos TLS, já registrado |
| `pnpm tipos` | verde |
| `pnpm lint` | verde, com os quatro avisos CSS preexistentes |
| `pnpm teste` | **536 passaram, 3 pulados** |
| `pnpm a11y` | **269 passaram, zero falhas** |
| `pnpm verificar` | **exit 0** |
| Gate real com credencial | **exit 0, zero pendências** |
| Banco | `documento=33`, `arquivo=18`, `documento_arquivo=18`, `vw_anexo_publico=8` |
| `/anexos.json` × view | **idênticos**: `identidade-visual`=7, `relatorio-tecnico-recanto-da-serra`=1 |
| Objetos do acervo | **8/8 em HTTP 200** no domínio real |
| Rotas públicas | **16 em 200**; sete `/dev/*` em 404; `/territorio` e `/acervo` em 404 |
| Links internos | **14/14 em 200**; nenhum aponta para as rotas 404 |
| Console | zero erros, zero `pageerror`, zero sub-recursos 4xx/5xx em cinco rotas |
| Home H0–H4.1 | **zero falhas** em 320/375/768/1440 px × claro/escuro, mais movimento reduzido e sem JavaScript |
| Privacidade | sem CPF, telefone, e-mail, caminho local, credencial, `DATABASE_URL`, URL de bucket privado, `r2.dev` ou `localhost` |
| Conteúdo | sem Lorem ipsum, placeholder ou vocabulário de laboratório |
| Peso | 812.949 B em 1440 px e 625.069 B em 375 px — **+4 B** sobre o aprovado, ruído de medição; JS, chunks e requisições idênticos |

**Os 3 testes pulados são os de escrita real no R2**, desativados por
`TESTE_R2_ESCRITA`. Pulado não é aprovado — ver "itens não bloqueadores".

**Falsos positivos investigados, não bloqueadores:** o padrão `SECRET` casou
com "**Secret**aria Municipal de Cultura" no conteúdo editorial; os padrões de
placeholder casaram com "mé**todo**" e "**todo**s os anexos".

## Checklist pré-deploy

Executar imediatamente antes da operação, no commit exato a publicar:

```bash
git status --porcelain          # só docs/handoff/ não rastreado
git rev-parse HEAD              # confere com o commit autorizado
pnpm verificar                  # exit 0
node --env-file=.env.local --import tsx scripts/verificar-pendencias.ts   # exit 0, zero pendências
pnpm build                      # exit 0
```

E confirmar por leitura, sem escrita:

- [ ] banco em `33 / 18 / 18` e `vw_anexo_publico = 8`;
- [ ] `/anexos.json` do artefato coerente com a view;
- [ ] impressão digital dos buckets inalterada — 8 objetos no público, 10 no
      privado, nenhum ZIP;
- [ ] `ZIP_ANEXOS_PUBLICADO` **não** declarada, para o CTA seguir ausente;
- [ ] a árvore não contém alteração versionada pendente.

## Operação

Procedimento real, tal como registrado nos dois deploys anteriores. **Não
executar sem autorização específica.**

```bash
pnpm dlx vercel@latest deploy --prod --yes --logs
```

Condições da operação, conforme `docs/deploy/PLANO_DEPLOY_VERCEL_2026-09-08.md`:

- a integração Git da Vercel permanece **desconectada**; o deploy é manual e
  parte do diretório local vinculado por `.vercel/project.json`;
- **um único** deployment Production por autorização;
- não alterar variáveis de ambiente, domínios, alias, DNS, Cloudflare ou R2
  durante a operação;
- credenciais de manutenção, migração e R2 **não pertencem** à Vercel;
- o smoke público ocorre no domínio já vinculado, porque os dois Custom Domains
  já existem e apontam para a produção.

## Checklist pós-deploy

Executar imediatamente depois, contra `https://observatoriotobiassoueu.com.br`:

- [ ] apex em 200 e `www` em 308, com um único salto;
- [ ] as 16 rotas públicas em 200;
- [ ] as sete rotas `/dev/*` em **404**;
- [ ] `/territorio` e `/acervo` em 404, e nenhum link público para elas;
- [ ] `/anexos.json` com **8** anexos, iguais aos da view;
- [ ] os **8** objetos do acervo em 200, no domínio do acervo;
- [ ] `anexos.zip` em **404** e nenhum CTA de ZIP na Sala;
- [ ] Home com Hero, Território, Pesquisa em Campo e "Onde o recurso circula",
      nesta ordem;
- [ ] H4: protagonista H4-001, quatro apoios, série e tabela; sem ranking, sem
      indicadores reservados, sem link para `/dados`;
- [ ] canonical, Open Graph e `sitemap.xml` apontando para o apex, sem
      `vercel.app` e sem `localhost`;
- [ ] `robots.txt` com `Disallow: /dev/` e o sitemap correto;
- [ ] zero erro de console e zero sub-recurso 4xx/5xx;
- [ ] varredura do HTML, dos bundles e dos source maps sem segredo, caminho
      local, `r2.dev`, endpoint S3 ou dado restrito;
- [ ] peso medido no domínio real, comparado com 812.949 / 625.069 B;
- [ ] banco e buckets inalterados pela operação.

## Rollback

**Alvo do rollback:** o deployment `dpl_9uudmMsKygEowzpSkt6Gpt73BUiE`, do
commit `3c68bd4`, que é a produção atual e está comprovadamente funcional.

Procedimento, conforme o plano de deploy §12:

1. se o deployment falhar **antes** de servir o domínio, não promover;
2. se o site falhar **depois**, reatribuir os domínios ao deployment anterior
   estável pela Vercel;
3. se o problema for DNS/TLS, restaurar apenas `@` e `www` a partir do snapshot
   da Cloudflare;
4. **nunca alterar `acervo` durante rollback do site**;
5. confirmar que o site anterior e os oito objetos do acervo continuam
   acessíveis;
6. registrar o incidente e só repetir após novo gate.

**Como confirmar que voltou:** apex em 200 servindo a Home sem
`secao-dados-home`; Sala em 200; `/anexos.json` com 8; os 8 objetos do acervo
em 200.

**O que o rollback de frontend não afeta:** o banco PostgreSQL, os dois buckets
R2, os 8 objetos públicos, os 10 privados, o domínio do acervo e todo o registro
documental. O frontend é artefato estático derivado; nenhum dado da prestação
de contas depende dele.

### Gatilhos de rollback imediato

Domínio principal indisponível ou em 5xx; Sala quebrada ou sem os anexos;
`/anexos.json` divergente da view ou com menos de 8; qualquer objeto do acervo
inacessível; erro de renderização que impeça a leitura; vazamento de segredo,
caminho local ou dado restrito no HTML ou nos bundles; rota `/dev/*`
respondendo diferente de 404; CTA de ZIP aparecendo sem o objeto publicado; ou
regressão de acessibilidade que não existia no candidato validado.

## Itens deliberadamente não bloqueadores

- **Peso da Home acima da meta canônica de 500 KB** (doc 01 §7). O desvio é
  anterior à H4.1, está medido e declarado, e a triagem da Tarefa 13 não
  encontrou otimização segura de baixo risco — toda alavanca toca o visual
  aprovado ou a cadeia de proveniência. Permanece P1 documentado, para a H7.
- **Testes de escrita real no R2 desativados.** O comportamento equivalente já
  foi comprovado na infraestrutura real, com evidência mais forte que a de um
  teste; executá-los criaria objetos transitórios em buckets de evidência.
- **O CI não prova o gate real.** Ele roda contra base sem dados e os blocos de
  integração são pulados por falta de credencial. **Este deploy não pode ser
  apresentado como "validado pelo CI"** — a liberação depende da execução
  manual documentada do gate, registrada acima. Continua P1.
- **ZIP público não publicado** e `/territorio`, `/acervo` em 404: estados
  deliberados, documentados, sem link público.
- **Links "Origem" para Google Docs e Drive na Sala:** são o campo de
  proveniência `origem_url`, exibidos ao lado da URL permanente do acervo.
  Nenhum anexo depende exclusivamente deles.

## Operação interrompida em 2026-09-13 — autenticação da Vercel

A autorização humana para publicar o commit `3519bc0` foi concedida, e a
operação **parou antes de qualquer comando de publicação**. Motivo objetivo:

- `pnpm dlx vercel@latest whoami` responde **`Logged out`**;
- `auth.json` da CLI **não existe** no perfil do usuário — só há `config.json`
  e arquivos de telemetria;
- não há `VERCEL_TOKEN` no ambiente, e `.env.local` não contém credencial da
  Vercel, coerente com a regra do projeto de manter credenciais fora dele.

O deploy depende de uma autenticação que **só o responsável humano pode
realizar**: `vercel login` é um fluxo interativo, e um token de acesso não deve
ser transcrito para o agente nem para o repositório.

Nada foi alterado: sem deployment, sem build novo, sem toque em Vercel, DNS,
Cloudflare, R2 ou banco. A produção segue no deployment
`dpl_9uudmMsKygEowzpSkt6Gpt73BUiE`, e a validação registrada acima **continua
válida para o commit `3519bc0`** — ela não expira por causa desta interrupção,
desde que a árvore e o commit permaneçam os mesmos.

**Para retomar:** autenticar a CLI na máquina do responsável e reautorizar a
operação. A partir daí, executar o checklist pré-deploy, a operação e o
checklist pós-deploy exatamente como registrados neste documento.

## Regra de parada da operação

Parar e devolver a decisão ao humano se, no momento do deploy: a árvore contiver
alteração versionada não autorizada; o gate real não sair verde; o banco
divergir de 33/18/18/8; a impressão digital dos buckets tiver mudado; o build
exigir variável não documentada; ou a Vercel apresentar configuração diferente
da registrada — integração Git conectada, variáveis novas ou domínios alterados.
