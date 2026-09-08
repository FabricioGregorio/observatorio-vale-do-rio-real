# Auditoria pré-build e pré-deploy

**Data:** 2026-09-08

**Checkpoint auditado:** `97624f4b8fb76e4c89f6a9dbf564399f12f53b2b`

**Escopo:** análise estática, testes com mocks e gates; sem build, deploy,
upload, escrita no banco, migration, DNS, R2 ou push

## Conclusão executiva

O checkpoint auditado tinha um **bloqueador objetivo**: `pnpm build` executava
o gerador do ZIP antes de `next build`. Como o banco agora contém oito anexos
públicos e o ambiente tem credenciais do R2, um build poderia baixar os oito
objetos, montar o ZIP em memória e executar `PutObject` em
`prestacao-de-contas/anexos.zip` sem autorização específica. O envio era
incondicional e podia sobrescrever o objeto existente.

A correção mínima foi aplicada. `pnpm build` agora chama somente `next build`.
A publicação do ZIP passou para `pnpm publicar-zip`, fora do CI e protegida
pela flag literal `--publicar`, validada antes de qualquer consulta ao banco ou
storage.

O primeiro build controlado foi executado no Prompt 4.3 e passou sem efeitos
persistentes no banco ou R2. O responsável escolheu Vercel, o domínio canônico
foi integrado aos metadados e a ausência de `DATABASE_URL` passou a falhar em
produção. O deploy público ainda não foi executado: falta configurar o projeto
no provider e o ZIP continua sem publicação.

## 1. Cadeia real do build

### Antes da correção

```text
pnpm build
└─ pnpm tsx scripts/gerar-zip-anexos.ts
   ├─ SELECT em vw_anexo_publico via DATABASE_URL
   ├─ filtro do Manifesto: PUBLICAVEL + revisão concluída + arquivo + hash + proveniência
   ├─ GetObject dos oito anexos no STORAGE_PUBLIC_BUCKET
   ├─ conferência SHA-256
   ├─ montagem do ZIP em memória com fflate
   └─ PutObject de prestacao-de-contas/anexos.zip
└─ next build
```

O `PutObject` usava `STORAGE_PUBLIC_ENDPOINT` e `STORAGE_PUBLIC_BUCKET`, com
URL lógica derivada de `STORAGE_PUBLIC_URL`. Não havia ACL manual, dry-run,
flag de upload, condição `If-None-Match` ou consulta prévia da chave do ZIP.

### Depois da correção

```text
pnpm build
└─ next build
   ├─ compila servidor e cliente
   ├─ lê os dados estáticos locais do mapa
   ├─ consulta vw_anexo_publico para as três saídas do acervo
   ├─ gera as rotas estáticas
   └─ grava somente artefatos locais em .next/
```

Operação externa separada, não executada nesta auditoria:

```text
pnpm publicar-zip
└─ tsx scripts/gerar-zip-anexos.ts --publicar
   └─ leitura PostgreSQL + GetObject + ZIP em memória + PutObject no R2
```

Não existem scripts `prebuild` ou `postbuild`.

## 2. ZIP público

| Pergunta | Resposta |
|---|---|
| Gera arquivo ZIP local? | Não. O pacote existe somente em memória. |
| Caminho local | Nenhum. |
| Envia ao R2? | Sim, mas somente no comando explícito `pnpm publicar-zip`. |
| Condição | Flag exata `--publicar`, credenciais públicas, `STORAGE_PUBLIC_URL` e ao menos um candidato que passe o gate. |
| Bucket | Valor de `STORAGE_PUBLIC_BUCKET`; na operação atual, bucket público. |
| Object key | `prestacao-de-contas/anexos.zip`. |
| Sobrescreve? | Sim. `PutObject` não usa condição nem chave versionada. |
| Usa Custom Domain? | Usa `STORAGE_PUBLIC_URL` para validar URLs elegíveis e formar o link; a operação S3 usa o endpoint autenticado. |
| Dry-run próprio? | Não. |
| Flag explícita? | Sim, `--publicar`, após a correção. |
| Só `PUBLICAVEL > 0` causa upload no build? | Não mais. No comando explícito, candidatos elegíveis levam ao upload. |

A estratégia já definida pela arquitetura é **B — objeto público separado no
R2**, não artefato em `public/` nem endpoint sob demanda. Essa decisão foi
preservada; apenas o gatilho foi separado da compilação.

O ZIP real não foi gerado nem enviado no Prompt 3.10. Como a Sala mostra o
link sempre que existem anexos e `STORAGE_PUBLIC_URL`, um deploy agora poderia
oferecer um link inexistente. Antes do deploy é necessário autorizar e publicar
o ZIP ou alterar, em tarefa própria, o critério do botão para comprovar a
existência do objeto.

## 3. Banco durante o build

Somente três rotas consultam PostgreSQL:

- `/prestacao-de-contas`;
- `/prestacao-de-contas/imprimir`;
- `/anexos.json`.

As três chamam `listarAnexosPublicos()`, que executa somente um `SELECT` sobre
`vw_anexo_publico`, filtrando `espelhado=true`. O acesso passa por
`src/dados/consultas/` e usa exclusivamente `DATABASE_URL`, correspondente ao
role `app_observatorio` somente leitura. O caminho de build não importa o
cliente de manutenção, o cliente de migration nem contém INSERT, UPDATE,
DELETE ou DDL.

Com `DATABASE_URL` presente e banco indisponível, o erro propaga e o build
falha. Com a variável ausente, a consulta devolve lista vazia e o build pode
terminar com Sala e `/anexos.json` vazios. Esse comportamento é deliberado para
desenvolvimento, mas exige validação de ambiente antes de um deploy real.

O Manifesto não é persistido. A adaptação das linhas, validação Zod e filtragem
são funções puras em memória. `/anexos.json` usa o mesmo conjunto e declara
`dynamic = "force-static"`; sua data de geração é calculada durante a geração.

## 4. Variáveis de ambiente

Somente nomes são registrados abaixo.

| Classificação | Variáveis | Uso atual |
|---|---|---|
| `BUILD_REQUIRED` | `DATABASE_URL` | leitura de `vw_anexo_publico`; precisa existir no build de produção para não gerar acervo vazio |
| `BUILD_REQUIRED` | `SITE_URL` | origem canônica server-side de metadataBase, canonical, Open Graph, sitemap e robots |
| `BUILD_REQUIRED` | `STORAGE_PUBLIC_URL` | domínio dos links do acervo e do ZIP |
| `RUNTIME_REQUIRED` | nenhuma no conjunto estático atual | as 15 rotas auditadas não precisam consultar banco por requisição |
| `OPTIONAL` | `REVALIDATE_SECRET`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, `ZENODO_API_TOKEN` | integrações futuras, sem consumidor atual |
| `LOCAL_ONLY` | `OBSERVATORIO_FONTES_DIR` | originais fora do Git; não participa do build |
| `LOCAL_ONLY` | `NODE_ENV` | gerida pelas ferramentas; não deve ser fixada manualmente no deploy |
| `LOCAL_ONLY` / operação explícita | `STORAGE_PUBLIC_ENDPOINT`, `STORAGE_PUBLIC_BUCKET`, `STORAGE_PUBLIC_ACCESS_KEY`, `STORAGE_PUBLIC_SECRET` | necessárias para `pnpm publicar-zip`, não para o build ou runtime comum |
| `MUST_NOT_BE_IN_PRODUCTION` da aplicação | `DATABASE_URL_MANUTENCAO` | DML operacional; nunca necessária ao site |
| `MUST_NOT_BE_IN_PRODUCTION` da aplicação | `DATABASE_URL_MIGRACAO` | DDL somente em etapa isolada de migration/CI |
| `MUST_NOT_BE_IN_PRODUCTION` da aplicação | `STORAGE_PRIVATE_ENDPOINT`, `STORAGE_PRIVATE_BUCKET`, `STORAGE_PRIVATE_ACCESS_KEY`, `STORAGE_PRIVATE_SECRET` | storage privado, sem uso no site ou build |

O ambiente do processo de publicação do ZIP é operacional e deve permanecer
separado do ambiente comum de build/runtime. A aplicação não precisa receber
segredos do R2 para servir as URLs já gravadas no banco.

## 5. Target de deploy

| Target | Estado |
|---|---|
| Vercel | **Escolhido pelo responsável no Prompt 4.3**; ainda não há conexão/configuração material do projeto ou workflow de deploy. |
| Hostinger | Inexistente no repositório. |
| Docker | Apenas cogitado para banco/dev; não há Dockerfile nem compose da aplicação. |
| Node server | Next suporta, mas o repositório não tem script `start` nem configuração operacional. |
| Node standalone | Não configurado; `next.config.ts` não define `output: "standalone"`. |
| Static export | Não configurado; não há `output: "export"`. |
| GitHub Actions | CI configurado, sem etapa de deploy. |

Portanto, Vercel é o target decidido, mas ainda não está efetivamente
configurado. A configuração externa será uma etapa posterior e explícita.

## 6. Domínios e metadados

Os papéis estão separados conceitualmente:

- `acervo.observatoriotobiassoueu.com.br`: objetos públicos do R2;
- `observatoriotobiassoueu.com.br`: domínio pretendido do site;
- `www.observatoriotobiassoueu.com.br`: redirect futuro, ainda não configurado.

O código usa o domínio do acervo indiretamente por `STORAGE_PUBLIC_URL`. Desde
o Prompt 4.3, o domínio institucional vem exclusivamente de `SITE_URL`, sem
prefixo público, e alimenta `metadataBase`, canonical por pathname, Open Graph,
`sitemap.ts` e `robots.ts`. Site e acervo permanecem separados.

Os dois achados relevantes foram corrigidos: o placeholder de `.env.example`
foi substituído pelo nome `SITE_URL`, sem valor, e o exemplo atual do doc 01 usa
o domínio real do acervo. Há três URLs localhost/127.0.0.1 intencionais em
configuração de Playwright/Lighthouse, além do PostgreSQL localhost do CI;
nenhuma delas é importada pelo código público.

## 7. Classificação das 15 rotas

| Classe | Rotas |
|---|---|
| Estáticas, apenas código/conteúdo local | `/`, `/observatorio`, `/pesquisa`, `/dados`, `/campo`, `/podobservar`, `/educacao`, `/imprensa`, `/acessibilidade`, `/privacidade`, `/contato` |
| Estáticas com dados resolvidos no build | `/prestacao-de-contas`, `/prestacao-de-contas/imprimir`, `/anexos.json` |
| Interna de desenvolvimento | `/dev/estilos`; lê `tokens.css` localmente e retorna 404 nativo em produção |
| Runtime server | nenhuma das 15 |

A Home lê as malhas e nomes municipais versionados no repositório; as URLs do
IBGE são proveniência, não chamadas `fetch` no build. O layout usa
`next/font/google`, que pode baixar as fontes durante o build e armazená-las no
artefato. Isso é uma dependência externa de leitura, não publicação ou escrita
em infraestrutura do projeto. O Next.js também pode enviar telemetria anônima
da ferramenta se ela não estiver desativada no ambiente; esse tráfego não
carrega dados do acervo nem substitui a separação já comprovada do R2.

## 8. Arquivos gerados

| Destino | Efeito esperado |
|---|---|
| `.next/` | artefatos efêmeros do Next: servidor, cliente, fontes, manifests, cache, tipos e metadados de prerender; já ignorado pelo Git |
| `next-env.d.ts` | pode ser regenerado pelo Next; ignorado pelo Git |
| `*.tsbuildinfo` | cache de TypeScript; ignorado pelo Git |
| `public/` | nenhuma escrita pelo build atual |
| `dist/` | não usado |
| `tmp/` | nenhuma escrita pelo build atual |
| `docs/` | nenhuma escrita pelo build atual |
| R2 | nenhuma escrita por `pnpm build` após a correção |

O ZIP nunca é gravado no filesystem, portanto não há ZIP a versionar
acidentalmente. Relatórios de Playwright/Lighthouse pertencem aos gates, não ao
build, e já são ignorados.

## 9. Testes de side effect e segurança

Sem executar build ou acessar R2, os testes provaram que:

- o script `build` é exatamente `next build`;
- a publicação do ZIP vive em comando separado com `--publicar`;
- ausência, erro de digitação ou argumento adicional são recusados;
- o Manifesto filtra em memória sem escrita;
- o ZIP pode ser montado com `baixar` e `enviar` falsos;
- zero candidatos causa zero chamadas de envio;
- o `PutObject` público continua com MIME e Cache-Control corretos e sem ACL.

O conjunto direcionado teve 21 testes aprovados e nenhuma chamada real de
storage. A suíte integral e os gates finais estão registrados ao fim desta
auditoria.

Os únicos Client Components são o boundary de erro, o menu móvel e o mapa
interativo. Nenhum importa clientes de banco, módulos de storage ou variáveis
sensíveis. `DATABASE_URL`, segredos de storage, bucket privado e
`OBSERVATORIO_FONTES_DIR` permanecem em módulos server-side/scripts. A única
variável com prefixo público é `NEXT_PUBLIC_SITE_URL`, que não é segredo e
ainda não é usada. Pela análise do grafo de imports, segredo server-side não
entra no bundle cliente.

## 10. A04 e D01-08

O build usa a mesma view e o mesmo gate da publicação já validada. A04 tem
revisão concluída, mas permanece `ESPELHAVEL`, portanto não passa
`podePublicar`. D01-08 permanece arquivo privado e não aparece na view. Nenhum
dos dois entra em Sala, Manifesto, `/anexos.json` ou conjunto do ZIP.

## 11. Riscos, bloqueios e recomendação

| Severidade | Achado | Estado / recomendação |
|---|---|---|
| Bloqueador de build | `pnpm build` podia executar `PutObject` do ZIP. | **Corrigido**: build puro e comando explícito. |
| Bloqueador de deploy | Sala pode oferecer o ZIP ainda não publicado. | Autorizar `pnpm publicar-zip` em tarefa separada ou mudar o gate visual com decisão própria. |
| Bloqueador de deploy | Vercel escolhida, mas projeto/domínios/ambiente ainda não configurados. | Materializar configuração e rollback em etapa explícita. |
| Resolvido | Ausência de `DATABASE_URL` gerava acervo vazio em produção. | Produção agora falha; development/test continuam permitindo o estado vazio. |
| Resolvido | Domínio do site não alimentava metadataBase/canonical/OG; sitemap e robots ausentes. | `SITE_URL` centraliza os metadados e arquivos especiais. |
| Médio | Publicação explícita do ZIP sobrescreve chave fixa. | Antes do primeiro ZIP real, confirmar se a chave estável deve sobrescrever ou se haverá versionamento/ponteiro. |
| Baixo | `next/font/google` depende de rede durante o build. | Garantir saída HTTPS no ambiente ou avaliar fonte local em tarefa própria. |
| Baixo | A telemetria anônima do Next.js não está explicitamente desativada. | Decidir se o ambiente controlado deve definir `NEXT_TELEMETRY_DISABLED=1`. |

## 12. Gates

Preenchido após a execução dos gates obrigatórios, sem `pnpm build`:

- `pnpm tipos`: passou;
- `pnpm lint`: passou, com os quatro avisos CSS preexistentes;
- `pnpm teste`: 244 aprovados, 3 omitidos, zero falhas;
- `pnpm a11y`: 46 aprovados, zero falhas.

Na etapa 4.2, nenhum build, deploy, upload, publicação adicional, mudança de
banco, migration, DNS/R2 ou push foi realizado. A execução única autorizada
posteriormente está registrada na seção seguinte.

## 13. Execução controlada — Prompt 4.3

O único `pnpm build` autorizado executou `next build` no Next.js 16.3.4 e
concluiu com sucesso. O contador de geração concluiu 19/19; a tabela final
listou 18 rotas estáticas: as 15 rotas já conhecidas, `_not-found`,
`robots.txt` e `sitemap.xml`. O warning observado foi o aviso do driver
PostgreSQL sobre mudança futura na semântica de `sslmode`. Download de fontes
não foi observável no log; o acesso estava autorizado.

Smoke local do output:

- Home e Sala: HTTP 200;
- `/anexos.json`: HTTP 200, total 8;
- `/dev/estilos`: HTTP 404;
- canonical e Open Graph: origem institucional correta em todas as páginas;
- sitemap: 12 URLs, todas sob a origem canônica;
- robots: sitemap canônico e `Disallow: /dev/`.

Antes e depois do build, o banco permaneceu em `33/18/18` e a view em 8. O R2
permaneceu com oito objetos, sem ZIP, e com a mesma impressão digital de
metadados. Nenhum efeito persistente foi encontrado.

A telemetria do Next.js estava habilitada e não foi alterada. A primeira
varredura encontrou valores de quatro credenciais R2 somente no cache local
efêmero do Turbopack, não nos artefatos server/client. Os caches ignorados pelo
Git foram removidos; a varredura final de 1.078 arquivos encontrou zero valor
secreto. O ambiente de build da Vercel deve receber apenas as variáveis
necessárias e nunca as credenciais operacionais R2.

Gates pós-build: `pnpm tipos` passou; `pnpm lint` passou com os quatro warnings
CSS preexistentes; `pnpm teste` teve 252 aprovações, três omissões e zero
falhas; `pnpm a11y` teve 46 aprovações e zero falhas.

O redirect permanente de `www` para o domínio sem `www` foi documentado, sem
implementação no Next: será configurado no provider junto com DNS/domínios.
