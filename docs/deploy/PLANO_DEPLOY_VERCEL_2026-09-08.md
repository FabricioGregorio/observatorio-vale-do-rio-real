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

## 14. Bloqueios e prontidão

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
