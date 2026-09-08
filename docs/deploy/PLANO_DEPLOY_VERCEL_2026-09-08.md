# Plano de deploy na Vercel

**Data:** 2026-09-08

**Checkpoint auditado:** `c05da2783ad47b6611356308f5816851b8ae4efa`

**Escopo deste documento:** preparação e preflight; sem deploy, push, publicação
do ZIP, mudança de DNS, banco, R2 ou migration.

## 1. Decisão e estado verificado

O provider escolhido é a **Vercel**. O projeto sugerido é
`observatorio-vale-rio-real`, com o repositório inteiro como raiz.

Estado local verificado antes desta documentação:

- branch `feat/home-indicadores`, sem upstream;
- working tree limpa;
- Vercel CLI não instalada;
- nenhum diretório `.vercel/` e nenhum vínculo local com projeto remoto;
- nenhum `vercel.json`;
- nenhum projeto, autenticação, variável ou domínio remoto foi criado ou
  alterado nesta tarefa;
- `pnpm tipos`, `pnpm lint`, `pnpm teste` e `pnpm a11y` passaram; o lint manteve
  quatro avisos CSS preexistentes, a suíte teve 252 aprovações e três omissões,
  e o gate de acessibilidade teve 46 aprovações.

O build controlado do Prompt 4.3 já provou que `pnpm build` é compilação pura.
Ele não foi repetido nesta tarefa.

## 2. Superfície de configuração

A busca abrangeu `process.env`, acessos indexados ao ambiente, helpers de
configuração, scripts, testes, workflow, `.env.example` e configurações de
build. Foram encontrados **21 nomes** entre variáveis efetivamente consumidas
e variáveis futuras declaradas. As classes podem se acumular quando uma
variável é usada por mais de um contexto.

| Variável | Classificação | Uso real e decisão para Vercel |
|---|---|---|
| `DATABASE_URL` | `BUILD_REQUIRED` | A geração estática consulta `vw_anexo_publico`. Cadastrar somente em Production com o role `app_observatorio`. Não é necessária em runtime no conjunto estático atual. |
| `SITE_URL` | `BUILD_REQUIRED` | Gera metadataBase, canonical, Open Graph, sitemap e robots. Cadastrar somente server-side. |
| `STORAGE_PUBLIC_URL` | `BUILD_REQUIRED` | Forma o link do ZIP e valida/expõe URLs públicas do acervo. Não é segredo. |
| `NODE_ENV` | `BUILD_REQUIRED`, `RUNTIME_REQUIRED` | Lido pelos gates de produção e pela rota interna. É definido pelo Next.js/Vercel; **não cadastrar manualmente**. |
| `DATABASE_URL_MANUTENCAO` | `OPERATIONAL_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Scripts DML e testes de integração; não pertence à aplicação pública. |
| `DATABASE_URL_MIGRACAO` | `OPERATIONAL_ONLY`, `TEST_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Drizzle/migrations e CI; não pertence ao build da Vercel. |
| `OBSERVATORIO_FONTES_DIR` | `LOCAL_ONLY`, `OPERATIONAL_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Caminho local dos originais, fora do Git. |
| `STORAGE_PUBLIC_ENDPOINT` | `OPERATIONAL_ONLY`, `TEST_ONLY`, `MUST_NOT_BE_IN_VERCEL` | API S3 usada pelos executores explícitos e testes, não pelo build/site. |
| `STORAGE_PUBLIC_BUCKET` | `OPERATIONAL_ONLY`, `TEST_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Bucket usado pelos executores explícitos e testes. |
| `STORAGE_PUBLIC_ACCESS_KEY` | `OPERATIONAL_ONLY`, `TEST_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Credencial de operação R2; daria capacidade de escrita/leitura de objetos. |
| `STORAGE_PUBLIC_SECRET` | `OPERATIONAL_ONLY`, `TEST_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Segredo da operação R2. |
| `STORAGE_PRIVATE_ENDPOINT` | `OPERATIONAL_ONLY`, `TEST_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Storage privado, sem função pública. |
| `STORAGE_PRIVATE_BUCKET` | `OPERATIONAL_ONLY`, `TEST_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Storage privado, sem função pública. |
| `STORAGE_PRIVATE_ACCESS_KEY` | `OPERATIONAL_ONLY`, `TEST_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Credencial do acervo restrito. |
| `STORAGE_PRIVATE_SECRET` | `OPERATIONAL_ONLY`, `TEST_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Segredo do acervo restrito. |
| `CI` | `TEST_ONLY` | Sinaliza o gate no CI e é fornecida pela plataforma; não cadastrar. |
| `TESTE_R2_ESCRITA` | `TEST_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Habilitação literal de testes destrutivos controlados; não cadastrar. |
| `REVALIDATE_SECRET` | `MUST_NOT_BE_IN_VERCEL` no estado atual | Declarada para integração futura, sem consumidor no código atual. Reavaliar somente quando a funcionalidade existir. |
| `TURNSTILE_SITE_KEY` | `MUST_NOT_BE_IN_VERCEL` no estado atual | Declarada para formulário futuro, sem consumidor atual. |
| `TURNSTILE_SECRET` | `MUST_NOT_BE_IN_VERCEL` no estado atual | Declarada para formulário futuro, sem consumidor atual. |
| `ZENODO_API_TOKEN` | `OPERATIONAL_ONLY`, `MUST_NOT_BE_IN_VERCEL` | Automação futura de depósito, sem consumidor atual. |

Não existe variável de aplicação `NEXT_PUBLIC_*`. Em especial, não criar
`NEXT_PUBLIC_DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` nem qualquer
`NEXT_PUBLIC_STORAGE_*`.

### Allowlist exata da aplicação

Somente estes três nomes devem ser cadastrados na Vercel para o primeiro build
de Production:

```text
DATABASE_URL
SITE_URL
STORAGE_PUBLIC_URL
```

Não há variável de aplicação `RUNTIME_REQUIRED` adicional no conjunto atual:
as rotas do acervo são resolvidas no build. As variáveis de sistema que a
Vercel injeta não fazem parte desta allowlist.

## 3. Banco: menor privilégio

`DATABASE_URL` é a única credencial de banco necessária ao build público. Ela
deve apontar para `app_observatorio`, usar TLS com
`sslmode=verify-full` e permanecer server-only.

O caminho de build executa somente `SELECT` em `vw_anexo_publico`, por
`src/dados/consultas/`. O estado canônico registra a validação de isolamento
15/15: operações negadas falharam com SQLSTATE `42501`. A configuração
esperada do role é:

- pode conectar ao banco e usar o schema necessário;
- pode executar apenas leituras necessárias;
- não pode `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `CREATE`, `ALTER`, `DROP`
  nem conceder privilégios;
- não é owner do banco, schema, tabelas ou views;
- não usa a credencial de manutenção nem a de migration.

Esta tarefa reconferiu o contrato, os pontos de importação e a evidência já
registrada; não exibiu, testou por mutação ou trocou a URL real.

## 4. Storage público e ZIP

`STORAGE_PUBLIC_URL` é necessária com o valor público não secreto:

```text
https://acervo.observatoriotobiassoueu.com.br
```

O site normal não importa o cliente S3 no caminho de renderização. Endpoint,
bucket, access key e secret públicos são consumidos apenas pelos scripts de
operação/testes. Portanto a Vercel **não recebe credenciais do R2 público ou
privado** e nenhum `PutObject` fica possível no build/runtime público comum.

O ZIP permanece fora do build, Install Command, postbuild, deploy hook e
workflow da Vercel. No repositório, o comando autorizado é `pnpm publicar-zip`:
o próprio script de pacote já inclui a flag literal `--publicar`. Ele só pode
ser executado em uma tarefa operacional separada e com autorização humana.

Antes do primeiro deploy, o ZIP precisa existir no endereço já oferecido pela
Sala do Avaliador, ou o deploy continuará bloqueado. A estratégia de chave fixa
e sobrescrita também continua pendente de decisão antes de uma republicação.

## 5. URL institucional

`SITE_URL` é obrigatória no build de produção e permanece server-only:

```text
https://observatoriotobiassoueu.com.br
```

Não há necessidade de prefixo `NEXT_PUBLIC_`: o código usa essa origem apenas
em Server Components e arquivos especiais gerados no build.

## 6. Matriz de ambientes

| Nome | Production | Preview | Development |
|---|---|---|---|
| `DATABASE_URL` | Credencial real `app_observatorio`, somente leitura e `sslmode=verify-full` | **Não copiar Production.** Usar futuramente banco/role isolado, com dados sanitizados ou acesso limitado exclusivamente às views públicas. Até lá, desabilitar builds Preview. | Manter somente em `.env.local`; pode apontar para ambiente local/descartável. |
| `SITE_URL` | `https://observatoriotobiassoueu.com.br` | A mesma origem canônica, para o preview não se declarar canônico. Só cadastrar quando Preview for habilitado. | Fallback controlado do código ou valor local em `.env.local`. Não puxar segredo remoto. |
| `STORAGE_PUBLIC_URL` | `https://acervo.observatoriotobiassoueu.com.br` | Pode usar a mesma origem, pois contém somente objetos já públicos e aprovados. Só cadastrar quando Preview for habilitado. | Valor público em `.env.local`, quando necessário. |

### Decisão sobre Preview

**Preview não deve usar a `DATABASE_URL` de produção.** Embora o role seja
read-only e o código atual consulte apenas a view pública, um commit de branch
pode alterar a consulta, ler outras tabelas às quais o mesmo role tenha
`SELECT` ou tentar exfiltrar a credencial. Read-only impede escrita, mas não
limita por si só a exposição de leitura.

Até existir banco de preview sanitizado ou um role dedicado restrito às views
públicas, configurar a Vercel para **não gerar Preview deployments**. Essa
decisão também segue a arquitetura de banco, que define Preview com dados de
seed, e não com o banco real de produção.

## 7. Configuração do projeto Vercel

| Campo | Configuração planejada |
|---|---|
| Nome | `observatorio-vale-rio-real` |
| Framework Preset | Next.js |
| Root Directory | raiz do repositório (`.`) |
| Build Command | `pnpm build` — hoje equivale exatamente a `next build` |
| Install Command | default detectado pela Vercel; não sobrescrever |
| Output Directory | default do Next.js; não sobrescrever |
| Development Command | default do Next.js; não necessário ao deploy |
| Production Branch | `main` |
| Preview | desabilitado até isolamento de banco |

Não adicionar migration, seed, espelhamento, upload ou `publicar-zip` a qualquer
comando da Vercel.

### Node e pnpm

- local: Node `v24.20.0` e pnpm `11.25.0`;
- CI: `.nvmrc` contém o seletor flutuante `lts/*`, e a action de pnpm lê
  `packageManager`; o repositório não fixa o patch do Node no CI;
- repositório: `packageManager: pnpm@11.25.0`, lockfile `9.0`, sem campo
  `engines`;
- Vercel: selecionar Node `24.x`, que é suportado para builds e Functions;
- Install Command: manter automático para respeitar o lockfile e a detecção do
  projeto.

Há uma inconsistência a validar antes do primeiro deploy: a documentação
oficial consultada lista suporte automático a pnpm até a versão 10, enquanto o
repositório fixa pnpm 11.25.0. Não alterar a versão por preferência e não
adicionar `ENABLE_EXPERIMENTAL_COREPACK` por tentativa. Na tarefa autorizada de
deploy, confirmar o suporte atual no provider/build log; se o pnpm 11 não for
aceito, abrir mudança de configuração própria para escolher uma versão
suportada e regenerar/validar o lockfile.

### `vercel.json`

Não é necessário. Framework, raiz, comandos, output, Node, ambientes e redirect
de domínio têm configuração nativa na Vercel. Criar arquivo agora duplicaria
estado sem resolver requisito técnico.

## 8. Git e origem do deploy

Recomendação: **integração GitHub → Vercel**, com `main` como única branch de
Production e PR/CI como gate. Ela oferece histórico por commit, rollback para
deployment anterior e rastreabilidade superior a um deploy local por CLI.

Fluxo futuro:

1. resolver os bloqueios deste plano;
2. publicar a branch atual somente com autorização, abrir PR e deixar o CI
   passar;
3. revisar e integrar em `main`;
4. criar/configurar o projeto Vercel sem clicar em Deploy durante o preflight;
5. conectar o GitHub e disparar o primeiro deployment apenas na tarefa que o
   autorizar explicitamente;
6. manter Preview desabilitado até o isolamento descrito acima.

Importar um repositório e confirmar o botão **Deploy** cria um deployment; não
usar esse fluxo em uma tarefa que autorize apenas configuração. Como alternativa
de preflight remoto sem deploy, uma tarefa autorizada pode criar o projeto vazio
por `vercel project add`/API e só depois aplicar as configurações. A CLI não está
instalada nem autenticada atualmente.

## 9. Domínios e DNS futuro

Domínio primário:

```text
https://observatoriotobiassoueu.com.br
```

Domínio secundário:

```text
https://www.observatoriotobiassoueu.com.br
```

Na Vercel, adicionar os dois domínios ao projeto e configurar **na própria
Vercel** o redirect permanente de `www` para o domínio sem `www`. Não duplicar
a regra no Next.js nem criar `vercel.json` para isso.

### Plano Cloudflare → Vercel

Somente numa tarefa futura autorizada:

1. exportar ou registrar a zona Cloudflare atual para rollback;
2. conferir registros de e-mail, CAA e demais serviços; não remover nenhum;
3. adicionar na Vercel o apex e o `www` e usar os valores exatos que o painel
   do projeto fornecer;
4. na Cloudflare, alterar somente:
   - `@`: tipo e destino **a obter da Vercel durante a configuração**;
   - `www`: tipo e destino **a obter da Vercel durante a configuração**;
5. iniciar `@` e `www` como **DNS only**, para que Vercel faça resolução,
   verificação e TLS diretamente; qualquer uso futuro do proxy Cloudflare deve
   ser uma decisão separada e testada;
6. manter `acervo` exatamente como está, ligado ao Custom Domain do R2;
7. verificar propriedade, certificado TLS e redirect na Vercel;
8. testar apex, `www`, sitemap, robots, canonical, Home, Sala e
   `/anexos.json` antes de declarar a troca concluída.

| Host | Destino futuro | Ação |
|---|---|---|
| `@` | Vercel | Alterar somente com valor fornecido pelo projeto remoto. |
| `www` | Vercel, com redirect para apex | Alterar somente com valor fornecido pelo projeto remoto. |
| `acervo` | Cloudflare R2 | **NÃO ALTERAR.** |
| qualquer outro | configuração atual | **NÃO ALTERAR.** |

Não registrar antecipadamente IP ou CNAME genérico: a Vercel atualmente instrui
usar o valor recomendado no cartão do domínio do projeto.

## 10. Segurança antes de cadastrar variáveis

- [ ] inserir segredos somente na tela/automação autorizada da Vercel;
- [ ] conferir o scope correto antes de salvar: Production, não Preview ou
      Development;
- [ ] não copiar valores para logs, comentários, documentação, screenshots,
      terminal compartilhado ou Git;
- [ ] confirmar pelo nome do usuário/role que `DATABASE_URL` usa
      `app_observatorio` e `sslmode=verify-full`, sem revelar a URL;
- [ ] confirmar que o role não tem DML, DDL, ownership ou grant option;
- [ ] não criar nenhuma variável `NEXT_PUBLIC_*` com URL de banco ou segredo;
- [ ] não cadastrar credencial de manutenção, migration, fonte canônica ou R2;
- [ ] não cadastrar variáveis futuras sem consumidor;
- [ ] limitar acesso ao projeto Vercel às pessoas responsáveis;
- [ ] após o deployment autorizado, verificar artefatos/logs sem pesquisar ou
      imprimir os valores dos segredos;
- [ ] se um segredo aparecer em log ou screenshot, revogá-lo/rotacioná-lo e
      registrar o incidente antes de continuar.

## 11. Checklist pré-deploy

- [ ] ZIP público publicado por operação autorizada separada e URL conferida;
- [ ] decisão da chave fixa/sobrescrita do ZIP encerrada;
- [ ] suporte do provider ao pnpm 11.25.0 confirmado ou versão reconciliada em
      mudança própria;
- [ ] conta/equipe Vercel e permissões humanas confirmadas;
- [ ] projeto `observatorio-vale-rio-real` criado sem deployment acidental;
- [ ] Framework Next.js, raiz `.`, Build Command `pnpm build`, Install e Output
      defaults conferidos;
- [ ] Node `24.x` selecionado;
- [ ] allowlist de Production contém somente `DATABASE_URL`, `SITE_URL` e
      `STORAGE_PUBLIC_URL`;
- [ ] credencial do banco validada como read-only e TLS `verify-full`;
- [ ] Preview desabilitado ou isolado com base/role sanitizados;
- [ ] Production Branch definida como `main`;
- [ ] estratégia GitHub/PR/CI aprovada e branch integrada com autorização;
- [ ] nenhum comando Vercel chama migration, seed, upload, espelhamento ou ZIP;
- [ ] nenhum segredo operacional excessivo presente;
- [ ] primeiro deployment autorizado validado pela URL `vercel.app` antes do
      corte DNS;
- [ ] apex e `www` adicionados à Vercel;
- [ ] valores de DNS obtidos do projeto remoto, sem inventar A/CNAME;
- [ ] snapshot da zona Cloudflare guardado;
- [ ] somente `@` e `www` alterados; `acervo` e demais registros intocados;
- [ ] `www` redireciona permanentemente para o apex;
- [ ] TLS, canonical, sitemap, robots, Home, Sala, JSON e links do acervo
      verificados no domínio final.

## 12. Etapas do primeiro deploy e rollback

O primeiro deployment deve ocorrer em tarefa própria, depois do ZIP e das
configurações acima. Primeiro publicar para a URL gerada pela Vercel, executar
smoke tests e inspecionar logs; somente depois ligar os domínios. A alteração de
DNS não deve ser usada como teste do build.

Rollback conceitual:

1. se o deployment falhar antes do DNS, não promover nem ligar domínio;
2. se o site falhar depois da promoção, reatribuir o domínio ao deployment
   anterior estável pela Vercel;
3. se o problema for DNS/TLS, restaurar os valores anteriores somente de `@` e
   `www` a partir do snapshot da Cloudflare;
4. nunca alterar `acervo` durante rollback do site;
5. confirmar que o site anterior e os oito objetos do acervo continuam
   acessíveis;
6. registrar o incidente e só tentar novamente após novo gate.

## 13. Referências operacionais

- [Vercel — configurar um build](https://vercel.com/docs/builds/configure-a-build)
- [Vercel — variáveis e ambientes](https://vercel.com/docs/environment-variables)
- [Vercel — package managers](https://vercel.com/docs/package-managers)
- [Vercel — Node.js 24](https://vercel.com/changelog/node-js-24-lts-is-now-generally-available-for-builds-and-functions)
- [Vercel — domínios e redirects](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)
- [Vercel — configuração de domínio](https://vercel.com/docs/domains/set-up-custom-domain)
- [Vercel — integração Git](https://vercel.com/docs/git)
- [Cloudflare — gerenciar registros DNS](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)
- [Cloudflare — proxy status](https://developers.cloudflare.com/dns/proxy-status/)

## 14. Bloqueios e prontidão no preflight local

Esta seção registra o estado anterior à configuração manual e foi superada
pela auditoria remota da seção 15.

Bloqueios para o **primeiro deploy**:

1. ZIP público ainda não existe;
2. política da chave fixa/sobrescrita do ZIP ainda não foi encerrada;
3. suporte efetivo ao pnpm 11.25.0 na Vercel precisa ser confirmado;
4. branch local ainda não foi publicada/revisada/integrada em `main`;
5. projeto, allowlist e domínios ainda não existem na Vercel;
6. Preview precisa permanecer desabilitado até haver isolamento;
7. DNS ainda não foi alterado, corretamente, porque depende dos valores do
   projeto remoto e de autorização própria.

O projeto está **pronto para uma tarefa de configuração remota sem deploy**,
desde que ela use acesso humano autorizado, não confirme a importação pelo
botão Deploy e respeite esta allowlist. Ele **não está pronto para o primeiro
deploy público** enquanto os bloqueios acima permanecerem.

## 15. Auditoria remota final — Prompt 4.6

Auditoria somente leitura executada em 2026-09-08 com Vercel CLI `59.11.7`,
sem deploy, build remoto, push, conexão Git, domínio, DNS, ZIP, banco, R2 ou
migration.

### Identidade e vínculo

- conta autenticada: `fabriciogregorio1111-2329`;
- team/owner: `fabricios-projects-e8743b90` (`Fabrício's projects`);
- projeto: `observatorio-vale-rio-real`;
- o `.vercel/project.json` local aponta para esse projeto e team;
- `.vercel/` está ignorado pelo Git e não será versionado;
- a proteção de `.vercel/` foi a única alteração local anterior encontrada no
  baseline, em `.gitignore`.

### Estado remoto observado

| Configuração | Local esperado | Vercel remoto | Status |
|---|---|---|---|
| Framework | Next.js | Next.js | conforme |
| Root Directory | `.` | `.` | conforme |
| Build Command | `pnpm build` | `pnpm build` | conforme |
| Install Command | default | default detectado | conforme |
| Output Directory | default do Next.js | Next.js default | conforme |
| Node | `24.x` | `24.x` | conforme |
| `DATABASE_URL` | Production, Secret, read-only | Production, Secret/Hidden | conforme; valor não consultado |
| `SITE_URL` | Production, Config, origem institucional | Production, Config | conforme por escopo/tipo; valor público confirmado pelo responsável |
| `STORAGE_PUBLIC_URL` | Production, Config, domínio do acervo | Production, Config | conforme por escopo/tipo; valor público confirmado pelo responsável |
| Git | desconectado | nenhum repositório apresentado; estado manual confirmado | conforme |
| Domains | zero | zero no team/projeto | conforme |
| Deployments | zero | zero | conforme |

A CLI não devolve o texto aberto de variáveis Config em `env ls`; ela mostrou
representação criptografada. Para não puxar também o segredo do banco nem tocar
em `.env.local`, nenhum `env pull` foi executado. Assim, os valores públicos
exatos de `SITE_URL` e `STORAGE_PUBLIC_URL` são a confirmação humana desta
sessão, confrontada com o esperado local; nomes, tipos e ambientes foram
confirmados remotamente.

Production contém exatamente:

| Nome | Tipo remoto | Ambiente |
|---|---|---|
| `DATABASE_URL` | Secret/Hidden | Production |
| `SITE_URL` | Config | Production |
| `STORAGE_PUBLIC_URL` | Config | Production |

Preview e Development remoto não contêm variáveis. Nenhuma das 13 variáveis
proibidas do preflight foi encontrada: credenciais de manutenção/migration,
credenciais/endpoint/bucket do R2 público ou privado,
`STORAGE_PRIVATE_PUBLIC_URL` e `OBSERVATORIO_FONTES_DIR` estão ausentes.

Consultas específicas confirmaram ainda:

- zero Deploy Hooks;
- zero cron jobs;
- zero recursos de Marketplace integrations;
- zero Vercel Blob stores conectados ao projeto;
- nenhum Custom Domain;
- região Sandbox `iad1`, sem failover, como metadado informativo; não é uma
  configuração inesperada de aplicação.

O subcomando `vercel git` expõe apenas operações mutáveis de conectar e
desconectar, sem comando de status. Nenhuma delas foi executada. A ausência de
integração Git foi confirmada pelo estado manual informado e pela ausência de
repositório nos metadados do projeto; o primeiro deployment continuará manual
e sem Git conectado.

### pnpm

O repositório fixa `packageManager: pnpm@11.25.0`, usa lockfile `9.0` e não tem
`engines`. Não existe configuração remota observável que rejeite essa versão,
mas a aceitação efetiva do pnpm 11 só pode ser comprovada pelo primeiro build
remoto. Estado: **`INDETERMINADO_ATÉ_DEPLOY`**, não bloqueador automático.

### Plano exato do primeiro deployment controlado

O deployment continua proibido nesta auditoria. Quando houver autorização
humana específica:

1. confirmar branch, working tree limpa e hash exato do checkpoint;
2. confirmar que o ZIP público já existe e responde no endereço oferecido pela
   Sala do Avaliador;
3. reconferir zero deployments e a allowlist de três envs em Production;
4. executar manualmente, sem Git conectado, o deployment de Production do
   diretório já vinculado; Preview não tem `DATABASE_URL` e não será usado;
5. acompanhar o build remoto e confirmar que `pnpm build` chama somente
   `next build`;
6. confirmar zero escrita no banco e zero upload/alteração no R2;
7. registrar a versão de pnpm realmente usada no log remoto;
8. testar primeiro a URL temporária `*.vercel.app`;
9. validar Home e Sala do Avaliador;
10. validar `/anexos.json` com oito arquivos e `/dev/estilos` com 404;
11. validar sitemap, robots, canonical, Open Graph e ausência de segredo em
    HTML, JavaScript e logs;
12. conferir que os links do acervo continuam no Custom Domain do R2;
13. se qualquer gate falhar, não associar domínio e encerrar o deployment como
    não aprovado;
14. somente depois do smoke aprovado abrir tarefa separada para domínio e DNS.

### Bloqueios restantes

- o ZIP público ainda não foi publicado e continua sendo bloqueador funcional
  porque a Sala já oferece seu endereço;
- a estratégia de chave fixa/sobrescrita do ZIP continua pendente para a
  operação/republicação;
- pnpm 11.25.0 permanece `INDETERMINADO_ATÉ_DEPLOY`;
- os valores públicos das duas variáveis Config foram confirmados pelo
  responsável, mas não foram recuperados em texto aberto pela auditoria;
- o primeiro deployment ainda exige autorização humana específica.

A configuração remota está coerente e pronta para a autorização do primeiro
deployment controlado **depois da publicação separada do ZIP**. Não está pronta
para associar domínio customizado, que permanece etapa posterior ao smoke na
URL temporária.

## 16. Primeiro deployment controlado — Prompt 4.7

A decisão humana de 2026-09-08 substituiu, apenas para esta rodada, o bloqueio
prévio do ZIP: o primeiro deployment Production foi autorizado sem publicar o
pacote. Exatamente um deployment foi criado, manualmente e sem Preview:

- deployment: `dpl_8f6opr5pwpnqgDcFEJWzVzEyHWu6`;
- checkpoint: `7dea44bada6a7c7d9f4b59c067fb9cdde452c6a9`;
- target/status: Production / `READY`;
- URL imutável:
  `https://observatorio-vale-rio-real-75v7er8wc.vercel.app`;
- alias público de teste:
  `https://observatorio-vale-rio-real.vercel.app`;
- Node/pnpm: `24.x` / `11.25.0`;
- comando remoto: `pnpm build`, que executou `next build` com sucesso.

O alias público passou nos endpoints essenciais e expôs exatamente A02=1 e
D01-01..07=7. A04 e D01-08 ficaram ausentes; os oito links do acervo responderam
200. Banco e R2 permaneceram byte/logicamente inalterados, e nenhum ZIP foi
enviado. A URL imutável está protegida por SSO da Vercel (302); o alias padrão
do projeto é público (200). Nenhum Custom Domain foi adicionado.

### Achados do smoke que bloqueiam o domínio principal

1. A Sala gera o link fixo `/prestacao-de-contas/anexos.zip` quando há anexos,
   mas esse objeto/rota responde 404. A decisão de não publicar o ZIP foi
   respeitada; a UI, porém, oferece um link quebrado.
2. Em viewport de 375 px, a tabela força `scrollWidth=629` tanto na Sala quanto
   na versão imprimível. Home e as três páginas em 768 px/1440 px não
   apresentaram overflow.

Não executar redeploy automático. A correção desses achados requer tarefa,
gates e autorização humana específicos. Até lá:

- associar `observatoriotobiassoueu.com.br`: **bloqueado**;
- alterar DNS ou configurar `www`: **bloqueado**;
- conectar GitHub: **não autorizado**;
- segundo deployment: **não autorizado**.

O registro probatório completo está em
[`PRIMEIRO_DEPLOY_VERCEL_2026-09-08.md`](./PRIMEIRO_DEPLOY_VERCEL_2026-09-08.md).

---

## 17. Bloqueios corrigidos — Prompt 4.8, 2026-09-08

Os dois achados da seção 16 foram corrigidos no código, a partir do checkpoint
`3e7f62fd5fff0cd5a8dc2cb0b7d835903b1dbe87`. Nada remoto foi tocado: **zero
deployments novos**, Custom Domains ainda 0, Git ainda desconectado, DNS
inalterado, ZIP ainda não publicado, banco e R2 sem alteração.

### 1. O CTA do ZIP passou a ter gate próprio

`urlDoZipDeAnexos()` exige agora, além de `STORAGE_PUBLIC_URL`, a variável
`ZIP_ANEXOS_PUBLICADO=true`. Só o valor exato conta; ausente ou qualquer outro
valor significa não publicado, e o item some da Sala. Nenhuma verificação
remota ao R2 entra no caminho de renderização.

Isso muda a matriz de ambientes: `ZIP_ANEXOS_PUBLICADO` é a **quarta** variável
possível em Production, e ela só deve ser criada **depois** de `pnpm publicar-zip`
concluir com sucesso — nunca antes. Hoje ela não existe em nenhum ambiente da
Vercel, e é assim que deve permanecer enquanto o pacote não for publicado.

Production continua, portanto, com exatamente três variáveis: `DATABASE_URL`,
`SITE_URL` e `STORAGE_PUBLIC_URL`.

### 2. O overflow em 375 px tinha outra causa

A seção 16 atribuiu o `scrollWidth=629` à largura mínima da tabela. A medição
provou o contrário: a tabela é clipada corretamente pelo contêiner de rolagem,
e quem escapava eram os oito `<code class="sr-only">` do SHA-256 — absolutos,
sem ancestral posicionado, logo com bloco container no `<html>`. `position:
relative` no contêiner resolveu, e as três larguras passaram a fechar em
`scrollWidth = clientWidth`.

### Condições pendentes para o segundo deployment

| Condição | Situação |
|---|---|
| Bloqueios funcionais do smoke | **resolvidos e verificados localmente** |
| Gates locais | tipos, lint, 256 testes e 54 de acessibilidade passando |
| Build local de produção | executado uma vez, 19/19 páginas |
| ZIP publicado | **não** — segue como operação separada e autorização própria |
| Autorização para o segundo deployment | **pendente** |
| Associar domínio / DNS / `www` | **bloqueado** até o segundo deployment passar no smoke |
| Conectar GitHub | **não autorizado** |

---

## 18. Segundo deployment controlado — Prompt 4.9, 2026-09-08

Autorização humana para exatamente um deployment Production, destinado a
validar as correções do Prompt 4.8 na infraestrutura real.

- deployment: `dpl_9uudmMsKygEowzpSkt6Gpt73BUiE`;
- commit: `3c68bd45ef5ae8e17824cd4ddb1ce047e3994d86`;
- target/status: Production / `READY`, em 23 s;
- URL imutável: `https://observatorio-vale-rio-real-625so9uc2.vercel.app`;
- alias público de teste: `https://observatorio-vale-rio-real.vercel.app`;
- Node/pnpm/Next: `24.x` / `11.25.0` / `16.3.4`;
- 223 arquivos enviados, cache do deployment anterior restaurado, 19/19 páginas.

Preflight: os quatro gates passaram em execução única — tipos, lint com os
quatro warnings CSS preexistentes, 256 testes com 3 omitidos e 54 de
acessibilidade. A falha intermitente registrada no Prompt 4.8 não reapareceu, e
a suíte não foi repetida.

### Os dois bloqueios, validados em produção

O HTML servido pelo deployment tem **zero** ocorrências de `anexos.zip`, de
`Baixar tudo` e da própria string `zip`, sem nenhum CSS de ocultação — o
elemento não existe, e não está apenas escondido. Os oito anexos individuais
continuam presentes, e o objeto do ZIP no acervo continua respondendo 404.

Em 375 px, Sala, versão imprimível e Home fecham em
`scrollWidth = clientWidth = 375`. Em 768 px e 1440 px, 753 e 1425 sem
overflow. O contêiner mantém rolagem própria, 621 contra 343.

### Estado remoto, antes e depois

Inalterado nos dois momentos: Custom Domains **0**, Git **desconectado**,
Production com exatamente `DATABASE_URL`, `SITE_URL` e `STORAGE_PUBLIC_URL`, e
`ZIP_ANEXOS_PUBLICADO` **ausente** — como a seção 17 previa. Preview e
Development continuam sem variáveis. Banco e bucket público idênticos antes e
depois; nenhum ZIP.

### O que segue bloqueado

| Item | Situação |
|---|---|
| Associar `observatoriotobiassoueu.com.br` | **liberado tecnicamente**, aguardando execução autorizada |
| DNS e `www` | não alterados; etapa própria |
| Conectar GitHub | **não autorizado** |
| Publicar o ZIP | **não autorizado**; operação separada |
| Terceiro deployment | **não autorizado** |
| Push | **não realizado** |

Registro probatório completo em
[`SEGUNDO_DEPLOY_VERCEL_2026-09-08.md`](./SEGUNDO_DEPLOY_VERCEL_2026-09-08.md).
