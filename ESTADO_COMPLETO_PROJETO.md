# Estado completo do projeto

**Projeto:** Observatório do Vale do Rio Real  
**Data deste retrato:** 2026-09-02  
**Finalidade:** contexto inicial para uma nova conversa de IA sem acesso ao histórico
anterior.

Este documento descreve o estado real do repositório e as decisões humanas tomadas até
esta data. Ele não substitui as fontes normativas. Antes de trabalhar, a próxima IA deve
ler também `AGENTS.md`, `docs/01-arquitetura-informacao.md`,
`docs/02-arquitetura-banco.md`, `docs/03-guia-implementacao.md` e o arquivo da tarefa em
`docs/tarefas/`.

A hierarquia de autoridade continua sendo:

1. instrução direta do responsável humano na sessão atual;
2. `docs/02-arquitetura-banco.md`;
3. `docs/01-arquitetura-informacao.md`;
4. `docs/03-guia-implementacao.md`;
5. código existente;
6. preferência ou sugestão do agente.

Se uma tarefa contradisser essa hierarquia, o agente deve parar e pedir decisão. Mudança
de schema ou de rota que não tenha autorização direta exige proposta em `docs/decisoes/`,
sem alteração silenciosa.

---

# 1. Identidade do projeto

## Nome e responsabilidade pública

O projeto é o **Observatório de Cultura e Economia Criativa na Região do Vale do Rio
Real**, executado pelo Coletivo Cultural **“Tobias, sou Eu!”** e fomentado pelo Edital de
Chamamento Público PNAB nº 02/2025. A avaliação e a prestação de contas envolvem a
FUNCAP/SE.

O site não é apenas uma presença institucional. Ele é parte da prova documental de
execução de um objeto financiado com recurso público. Um erro de conteúdo, integridade,
rota, crédito ou disponibilidade pode ter consequência jurídica e financeira, não apenas
técnica.

## Objetivo do Observatório

O sistema deve:

- comprovar a execução do objeto perante a FUNCAP;
- publicizar a pesquisa em domínio público;
- preservar documentos e evidências em URLs próprias e verificáveis;
- divulgar o PodObservar como recurso de acesso e acessibilidade;
- devolver conhecimento ao território e permitir continuidade do acervo depois do
  encerramento do edital;
- futuramente oferecer pesquisa, dados abertos, equipamentos culturais, diário de campo,
  entrevistas, podcast, educação, mapa e canais de escuta.

## Público principal

A Home atende vários públicos, mas há uma prioridade operacional:

1. **Avaliador da FUNCAP e técnico do edital:** precisa encontrar anexos, metas,
   cronograma e evidências sem login e sem links frágeis.
2. **Comunidades e atores culturais do território:** precisam se reconhecer no acervo e
   acessar os resultados da pesquisa.
3. **Gestores municipais:** procuram diagnóstico e, quando existir fonte oficial,
   comparação entre municípios.
4. **Pesquisadores, universidades e IFS:** procuram metodologia, dados, documentos e
   orientação de citação.
5. **Jovens e professores:** devem alcançar conteúdos curtos, PodObservar e a futura
   trilha educativa.
6. **Imprensa e rádios:** procuram materiais públicos, imagens autorizadas e contato.

A arquitetura determina que cada público chegue ao destino relevante em no máximo dois
cliques a partir da Home.

## Filosofia do sistema

A ideia central é: **arquivo público vivo do território e não uma página institucional
promocional**.

“Arquivo vivo” significa que o site organiza documentos, dados e vozes de campo com
rastreabilidade, mas continua extensível a novas etapas da pesquisa. A interface deve se
aproximar de fichas de acervo, cadernos de campo, registros e metadados, sem simular um
documento antigo e sem cair em estética promocional genérica.

## Princípios de arquitetura

- **Estático para preservar:** páginas públicas são geradas no build. O visitante não
  provoca consultas PostgreSQL em tempo de requisição.
- **Banco para gerir:** PostgreSQL armazena dados estruturados, relações e metadados.
- **Arquivos fora do banco:** PDFs, áudios, imagens e datasets vivem no storage de
  objetos; o banco guarda chave, URL, metadados e SHA-256.
- **Nenhuma evidência depende só de terceiro:** Drive, Forms, Docs, Figma e Instagram
  podem ser origem ou redundância, nunca a única cópia pública de um anexo obrigatório.
- **Conteúdo editorial fora do banco:** textos institucionais e capítulos autorais foram
  destinados a MDX versionado no Git, quando o pipeline for autorizado e implementado.
- **Integridade antes de conveniência:** migrações imutáveis, hashes, estados vazios
  explícitos e falha clara em vez de fallback enganoso.
- **Acessibilidade e baixo peso:** pt-BR, navegação por teclado, foco visível, contraste
  WCAG AA, suporte a 360 px, transcrição para todo áudio e texto alternativo para toda
  imagem publicada.
- **Privacidade:** sem rastreamento de terceiros, sem cookie de analytics e sem exposição
  de dado pessoal não autorizado.

---

# 2. Estado geral atual

| Tarefa | Status | Observações |
|---|---|---|
| 00 — Modelo de tarefa | Concluída | Template de definição de tarefas disponível em `docs/tarefas/00-modelo.md`. |
| 01 — Bootstrap | Concluída | Next.js, TypeScript estrito, pnpm, Biome, Vitest, Playwright e CI configurados. |
| 02 — Tokens e tipografia | Concluída | Tokens, fontes auto-hospedadas por `next/font` e página interna `/dev/estilos`. Os tokens só passaram a chegar ao navegador em 2026-09-02, com a criação de `postcss.config.mjs`. |
| 03 — Layout base | Concluída | Cabeçalho, menus, rodapé, skip link, error boundary, 404 e stubs das rotas. Créditos e marcas continuam pendentes do manual E02. |
| 04 — Drizzle e migração inicial | Concluída | Clientes PostgreSQL, schema Drizzle, migração `0001` e comandos oficiais. A validação temporária também escolheu Neon; validações operacionais de roles e backup continuam futuras. |
| 05 — Núcleo da prestação de contas | Concluída | Migração `0002`, sete tabelas, índices, triggers e `vw_anexo_publico`. |
| 06 — Espelhamento de arquivos | Concluída | Fluxo de download, SHA-256, validação, upload R2, registro no banco e idempotência. |
| 07 — Catálogo documental | Concluída | Criação/atualização de `documento` e vínculos `documento_arquivo` a partir do inventário exportado. |
| 08 — Sala do Avaliador | Concluída | Página pública, versão imprimível, `/anexos.json`, tabela acessível e ZIP produzido antes do build. |
| 09 — Gate de pendências | Concluída | Migração `0003`, consulta, script e etapa de CI. A view cobre hoje somente anexos; áudio depende da futura tabela `entrevista`. |
| 10 — Home v1 | Fatia 10A implementada, não commitada | Implementada e validada na sessão de 2026-09-02, com autorização direta do responsável: abertura, caminhos prioritários e acervo público, mais testes de unidade e de a11y. Ainda não está em `origin/main`. Apresentação e Território foram omitidos por dependerem de conteúdo bloqueado; conteúdo institucional, indicadores, comparação municipal, imagens e MDX continuam bloqueados. A fatia 10B aguarda aprovação. A fatia 10B.1 criou a fundação territorial — contratos de dados, componentes de mapa, bloco de créditos e pastas de mídia — sem mapa, sem dados e sem imagens; a 10B.2 aguarda aprovação. A 10B.2 e a 10B.2.1 fecharam o modelo territorial: camadas, recorte do Vale, malha intermediária e procedência, sem baixar dado nenhum. A 10B.3 — o mapa — aguarda aprovação. O mapa territorial entrou na 10B.3.3, entre os caminhos e o acervo: 75 municípios clicáveis, Vale destacado, alternativa textual completa. As outras seções previstas seguem fora, por dependerem de conteúdo bloqueado. |

## Estado funcional resumido

- Em `origin/main`, a Home continua provisória. O working tree contém uma candidata da
  fatia 10A: abertura com nome oficial e chamada para a Sala do Avaliador, quatro
  caminhos prioritários e bloco de acervo público. Ela ainda precisa de revisão e
  confirmação humana e não deve ser confundida com entrega aceita.
- O pipeline de estilos passou a funcionar em 2026-09-02, com a criação de
  `postcss.config.mjs`. Antes disso nenhum token e nenhuma classe utilitária chegava ao
  navegador, em nenhuma página. Ver a seção 3, "Pipeline de estilos".
- A Sala do Avaliador é a principal funcionalidade pública completa.
- As rotas institucionais internas existem principalmente como stubs, para manter
  `typedRoutes` válido e não inventar conteúdo.
- Não existe pasta `content/` nem pipeline MDX no estado atual.
- Não existe pasta `public/` com marcas do edital.
- Não existe tabela `indicador`, nem consulta de indicadores.
- Não existem ainda as tabelas de entrevista, visita, mídia, podcast, metas, formulários,
  educação ou participação previstas nas fases seguintes.
- O comando de seed atual é deliberadamente um no-op; não há `db/seed.ts` implementado.
- Neon e R2 não estão conectados neste ambiente local. Não presumir credenciais nem
  estado remoto.

## Última validação local conhecida

Na preparação anterior foram executados, com sucesso, antes de a candidata não commitada
da Home aparecer no working tree:

- `pnpm lint` — exit code 0; ainda emite quatro avisos não bloqueantes sobre
  `!important` no bloco de `prefers-reduced-motion` de `tokens.css`;
- `pnpm tipos`;
- `pnpm teste` — 76 testes passaram e 2 ficaram ignorados;
- `pnpm build`;
- `pnpm a11y` — um teste Playwright passou.

O build emitia um aviso do Turbopack sobre a regra Tailwind `@theme`. O aviso não era
cosmético: era o sintoma da falta de `postcss.config.mjs`. Com a configuração criada em
2026-09-02, ele desapareceu. O teste de a11y ainda emite avisos do servidor de
desenvolvimento, que não impedem os comandos de terminar com sucesso.

**Atenção:** apesar do nome da etapa no workflow mencionar axe-core, o arquivo atual
`testes/a11y/bootstrap.spec.ts` é apenas um smoke test: abre `/` e verifica que existe um
`h1` visível. Não há dependência nem execução de axe-core hoje. Portanto a auditoria
WCAG automatizada completa ainda não está implementada e não deve ser apresentada como
concluída.

---

# 3. Arquitetura técnica atual

## Frontend

- **Framework:** Next.js com App Router.
- **Linguagem:** TypeScript com modo estrito.
- **Rotas tipadas:** `typedRoutes: true` em `next.config.ts`.
- **Estilos:** Tailwind 4 pelo plugin `@tailwindcss/postcss`, ligado ao build por
  `postcss.config.mjs` na raiz. Sem esse arquivo o Tailwind não roda — ver a seção
  "Pipeline de estilos" logo adiante.
- **Renderização:** Server Components como padrão; dados públicos resolvidos no build.
- **Client Components:** só quando uma API do navegador ou interação real exige. Hoje o
  `MenuMobile` e `error.tsx` são clientes por razões documentadas.
- **Layout raiz:** `src/app/layout.tsx` contém o único `<main id="conteudo">`, além de
  cabeçalho, rodapé e skip link. Páginas não devem criar outro `<main>`.
- **Home vigente:** `src/app/page.tsx`. Não mover para `src/app/(site)/page.tsx` sem nova
  decisão específica.
- **Rotas estáticas existentes:** `/`, `/observatorio`, `/pesquisa`, `/dados`, `/campo`,
  `/podobservar`, `/educacao`, `/prestacao-de-contas`,
  `/prestacao-de-contas/imprimir`, `/anexos.json`, `/imprensa`, `/acessibilidade`,
  `/privacidade`, `/contato` e `/dev/estilos`.

O projeto não tem Radix ou shadcn instalados no estado atual, embora apareçam como direção
no guia. Não instalar por antecipação.

## Estilos

A fonte única de cor, tipografia, raio e parte das métricas visuais é
`src/estilos/tokens.css`. Não duplicar cores ou famílias em componentes.

### Pipeline de estilos

`postcss.config.mjs`, na raiz, declara o plugin `@tailwindcss/postcss`. É esse arquivo
que liga o Tailwind ao build do Next. Ele não existia até 2026-09-02, e sem ele nada de
`tokens.css` funcionava: `@import "tailwindcss"` não era resolvido, o bloco `@theme`
chegava literal ao navegador — que descarta at-rule desconhecida junto com o conteúdo
dela —, nenhuma variável era definida em `:root` e nenhuma classe utilitária era gerada.
Não remover nem renomear esse arquivo.

### Convenção de link e de foco

Consequência de ter o `preflight` ativo: ele zera cor e sublinhado de `<a>`, e cada
componente declara os seus. As duas regras em vigor, verificadas em
`testes/a11y/links.spec.ts`:

- link dentro do conteúdo principal leva `className="underline"` e
  `style={{ color: "var(--color-link)" }}`. Cor sozinha não serve: a distância entre
  `--color-link` e `--color-texto` é de cerca de 1,5:1, e a WCAG 1.4.1 pede 3:1. A
  exceção legítima é o link com preenchimento de fundo, como a chamada principal da
  Home, que se distingue pela forma;
- elemento focável sobre fundo escuro leva `focus-visible:outline-destaque`. O contorno
  padrão é `--color-foco`, que é anil, e anil sobre mata dá cerca de 1,25:1 — abaixo dos
  3:1 da WCAG 1.4.11. Milho sobre mata dá 7,4:1.

Cabeçalho e rodapé não sublinham os seus links: são landmarks de navegação em que todo
item é link, não blocos de texto com link no meio.

O Tailwind 4 emite no `:root` as variáveis de `@theme` que alguma coisa referencia: o
próprio CSS, uma utilidade gerada ou o texto dos arquivos-fonte varridos — o que inclui
`style={{ ... var(--token) }}` nos componentes. Hoje só `--color-mata-claro` e
`--largura-conteudo` ficam de fora do CSS final, porque nada no projeto os usa. Passam a
ser emitidos assim que algum arquivo os referenciar; não é preciso `@theme static` nem
qualquer alteração em `tokens.css`.

Paleta bruta atual:

- mata `#12301f`;
- anil `#1f3a5f`;
- pedra `#e7e5de`;
- milho `#e8b23a`;
- barro `#8a4b2a`;
- carvão `#171a17`.

Há tokens semânticos para fundo, fundo elevado, fundo inverso, texto, texto suave, texto
inverso, link, borda, destaque, acento e foco. Componentes devem usar os nomes
semânticos.

Tipografia:

- **Archivo:** display, títulos e numerais informativos;
- **Literata:** leitura e textos longos;
- **IBM Plex Mono:** metadados, códigos, datas e hashes.

As fontes são carregadas por `next/font/google`, baixadas no build e auto-hospedadas; não
há chamada ao Google no navegador. São usados os subsets `latin` e `latin-ext`, com
`display: swap`.

Contraste registrado nos tokens:

- carvão sobre fundo pedra: alto contraste para corpo;
- anil sobre fundo claro: links;
- barro sobre fundo claro: acento textual com parcimônia;
- pedra sobre mata: texto inverso;
- milho sobre mata: destaque;
- milho não pode ser texto sobre fundo claro; nesse caso serve apenas como fundo, borda
  ou marcador com texto carvão.

A identidade visual disponível ainda é a identidade derivada desses tokens e do conceito
“arquivo vivo”. Não existe autorização para criar uma nova linguagem de marca.

## Backend e acesso a dados

- **SGBD:** PostgreSQL 15+; provedor escolhido: Neon.
- **Versão validada em experimento anterior:** PostgreSQL 18.6 no projeto Neon
  descartável.
- **ORM:** Drizzle ORM e Drizzle Kit.
- **Driver:** `pg`/node-postgres por `drizzle-orm/node-postgres`, sem driver proprietário
  do Neon.
- **Schema:** `db/schema.ts`.
- **Migrações:** `db/migrations/`.
- **Clientes:** `db/cliente.ts` para operações de banco e `src/dados/cliente.ts` para a
  camada de aplicação/manutenção autorizada.
- **Consultas da aplicação:** exclusivamente em `src/dados/consultas/`.

Componentes, páginas e rotas não consultam o banco diretamente. Scripts de manutenção em
`scripts/` e `db/` podem usar o cliente com `DATABASE_URL`, desde que não façam DDL e não
participem da renderização. DDL usa exclusivamente `DATABASE_URL_MIGRACAO` pelo fluxo de
migração.

Produção e preview devem usar `sslmode=verify-full` nas URLs. O código não fixa objeto
`ssl`; CI e Docker local são exceções sem TLS por usarem rede efêmera e dados
descartáveis.

## Storage

- **Provedor:** Cloudflare R2.
- **Fronteira técnica:** API compatível com S3 por `@aws-sdk/client-s3`.
- **Operações implementadas:** `HeadObject`, `PutObject` e `GetObject`.
- **Variáveis:** `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`,
  `STORAGE_SECRET`, `STORAGE_PUBLIC_URL` e `STORAGE_PROVIDER=r2`.
- **Regra:** binários ficam no R2; PostgreSQL guarda metadados e relações.
- **URL pública:** derivada de `STORAGE_PUBLIC_URL` e da chave estável do objeto.
- **Integridade:** SHA-256 também é salvo nos metadados do objeto para comparação futura.

Nenhum documento deve ser colocado em `public/` como substituto do fluxo de storage. O
ZIP da prestação também vive no R2.

## CI

O workflow está em `.github/workflows/ci.yml`, executado em pull request e em push para
`main`. Usa Ubuntu, Node definido por `.nvmrc`, pnpm e um serviço PostgreSQL 16
descartável.

Sequência atual do CI:

1. checkout;
2. instalação do pnpm e Node;
3. `pnpm install --frozen-lockfile`;
4. `pnpm migrar`;
5. `pnpm seed` — atualmente apenas informa que o seed não existe;
6. `pnpm tipos`;
7. `pnpm lint`;
8. `pnpm teste`;
9. `pnpm pendencias`;
10. `pnpm build`;
11. instalação do Chromium;
12. `pnpm a11y`;
13. upload do relatório Playwright.

`pnpm verificar` encadeia tipos, lint, testes, a11y e pendências; o build é executado
separadamente no CI. Antes de PR, seguir os comandos solicitados pela tarefa e não omitir
o build quando ele for exigido.

Lighthouse CI continua obrigatório na arquitetura, mas não é executado. O pacote
`@lhci/cli` não está instalado; `lighthouserc.json` ainda não sobe servidor nem configura
3G. A implementação foi adiada para o item 26, Fase 4.

---

# 4. Banco de dados

## Migrações existentes e imutáveis

### `0001_fundacao.sql`

Cria a infraestrutura comum:

- extensões `pgcrypto`, `citext` e `unaccent`;
- função imutável `sem_acento(text)` para busca indexável;
- função de trigger `set_atualizado_em()`;
- enums `status_publicacao`, `tipo_equipamento`, `situacao_equipamento`,
  `tipo_documento`, `tipo_midia`, `tipo_pessoa`, `status_meta`, `tipo_formulario`,
  `tipo_consentimento` e `status_moderacao`.

PostGIS foi omitido deliberadamente: coordenadas numéricas bastam até existir consulta
espacial real.

### `0002_nucleo_prestacao_contas.sql`

Cria sete tabelas na ordem topológica:

1. `arquivo` — metadados do binário, URL, chave, tamanho, tipo, origem, hash e data de
   espelhamento;
2. `municipio` — identidade territorial e campos públicos futuros;
3. `pessoa` — pessoas do acervo, com foto opcional e controle de exibição;
4. `equipamento` — equipamento cultural ligado a município e ator-chave;
5. `consentimento` — autorização por pessoa e tipo, com revogação;
6. `documento` — obra intelectual, estado editorial, licença, ordem de anexo e busca;
7. `documento_arquivo` — vínculo versionado N:N entre obra e binário, com no máximo um
   arquivo principal por documento.

Também cria:

- FKs, `CHECK`s e índices previstos na arquitetura;
- índice GIN de busca de documentos;
- índices parciais de documento publicado/anexo;
- triggers `trg_atualizado_em` para `arquivo`, `municipio`, `pessoa`, `equipamento` e
  `documento`;
- view `vw_anexo_publico`.

`vw_anexo_publico` une documento, vínculo principal e arquivo, restringe a documentos
publicados e não arquivados e fornece os campos consumidos pela Sala do Avaliador e pelo
JSON. A consulta de aplicação acrescenta `espelhado = true`.

### `0003_gate_pendencias.sql`

Cria `vw_pendencia_publicacao`. No estado atual a view denuncia apenas documentos:

- exigidos pelo edital;
- marcados como publicados;
- sem arquivo principal efetivamente espelhado.

A versão completa prevista no doc 02 também denunciará áudio público sem consentimento.
Esse segundo ramo não existe ainda porque a tabela `entrevista` só será criada na Fase 3.
Quando chegar a hora, a correção deve ser uma **nova migração** com
`CREATE OR REPLACE VIEW`, preservando as colunas `slug`, `titulo` e `pendencia`.

## Objetos que não estão no snapshot do Drizzle

Extensões, funções, triggers e views são SQL bruto das migrações. O snapshot do Drizzle
não detecta se esses objetos desaparecerem e não os recria automaticamente. Hoje isso
inclui pelo menos:

- `pgcrypto`, `citext`, `unaccent`;
- `sem_acento()` e `set_atualizado_em()`;
- cinco triggers `trg_atualizado_em`;
- `vw_anexo_publico`;
- `vw_pendencia_publicacao`.

As views são declaradas em `db/schema.ts` com `.existing()`. Isso serve apenas para
tipagem e consulta; não deve gerar DDL.

## Regras importantes

- Migração aplicada é imutável. Nunca editar `0001`, `0002` ou `0003`.
- Correção de schema é sempre nova migração versionada.
- Os únicos comandos admitidos são `pnpm gerar-migracao` e `pnpm migrar`.
- `drizzle-kit push` e `drizzle-kit introspect` são proibidos.
- View, trigger, função ou extensão só pode ser criada ou alterada por migração.
- Migração com `DROP`, `ALTER`, mudança de tipo ou remoção exige o checklist destrutivo
  do doc 03 §6.
- Roles são infraestrutura, não schema. Migrações não criam role nem armazenam senha.
- Em produção, `DATABASE_URL` usa role de aplicação sem DDL e
  `DATABASE_URL_MIGRACAO` usa role de migração.
- RLS está descrita para o futuro, mas **ainda não foi implementada** nas migrações
  atuais.
- **Não criar novas tabelas sem autorização humana.** A tabela `indicador`, em
  particular, pertence à Tarefa 13.

---

# 5. Funcionalidades implementadas

## Layout

O layout global está em `src/app/layout.tsx`:

- define `<html lang="pt-BR">`;
- carrega Archivo, Literata e IBM Plex Mono com `next/font`;
- renderiza o skip link como primeiro elemento focável;
- renderiza `Cabecalho`, um único `<main id="conteudo">` e `Rodape`;
- mantém o corpo com altura mínima de tela e rodapé ao fim.

O cabeçalho:

- identifica o Observatório;
- usa os seis destinos normativos: O Observatório, A Pesquisa, Dados, Diário de Campo,
  PodObservar e Educação;
- usa a mesma fonte de navegação para desktop e mobile;
- não deve receber sétimo item sem mudança da arquitetura de informação.

O menu mobile é o único componente interativo do cabeçalho. Abre e fecha com botão,
responde a `Esc`, move foco para o painel e devolve foco ao gatilho.

O rodapé contém links para Prestação de Contas, Imprensa, Acessibilidade, Privacidade e
Contato. O bloco de créditos existe como pendência textual porque o manual de aplicação
de marcas E02 não foi fornecido. Não há logos inventados.

O `PularConteudo` aponta para `#conteudo`. O foco global é visível e definido em tokens.

`src/app/error.tsx` é um Client Component porque o error boundary do Next precisa chamar
`reset()`. Ele oferece recuperação e caminho para a Sala do Avaliador sem expor detalhes
técnicos.

`src/app/not-found.tsx` oferece Sala do Avaliador, Dados e Home. A busca ainda não existe;
por isso a 404 não promete uma rota de busca inexistente.

Onze rotas receberam stubs mínimos para satisfazer `typedRoutes` sem inventar conteúdo.

## Sala do Avaliador

A Sala vive em `/prestacao-de-contas` e é a página mais importante da arquitetura. Ela:

- chama `listarAnexosPublicos()` durante o build;
- mostra apenas registros publicados, não arquivados e espelhados;
- apresenta título, resumo quando existente, formato, tamanho, link permanente, link de
  origem, data e SHA-256;
- usa tabela HTML real, com `caption`, cabeçalhos e escopo de linha/coluna;
- apresenta estado vazio explícito quando não há `DATABASE_URL` ou anexos;
- permite revelar o hash integral, mantendo resumo visual de 12 caracteres;
- oferece versão imprimível em `/prestacao-de-contas/imprimir`;
- oferece JSON em `/anexos.json`;
- oferece URL do pacote ZIP quando `STORAGE_PUBLIC_URL` existe.

O Route Handler de JSON vive deliberadamente em `src/app/anexos.json/route.ts`. O ponto
faz parte do segmento porque o contrato público exige literalmente `/anexos.json`, sem
prefixo `/api`. `dynamic = "force-static"` impede consulta em tempo de requisição.

O JSON contém data de geração, total e os mesmos metadados públicos da Sala. A data é
calculada no build.

O ZIP usa a chave `prestacao-de-contas/anexos.zip` no R2. É gerado antes do `next build`,
baixando os anexos públicos e armazenando-os sem recompressão desnecessária. Fora de
produção, ausência de credenciais informa a omissão e encerra com sucesso. Em produção,
ausência de credenciais falha explicitamente. Se não houver anexo, um ZIP antigo não é
apagado automaticamente.

## Espelhamento

O fluxo é composto por:

- `scripts/espelhar-anexos.ts`;
- `src/lib/espelhamento.ts`;
- `src/lib/storage.ts`;
- `testes/espelhamento.test.ts`.

O XLSX versionado é a fonte do inventário, mas o script lê uma exportação CSV. O CSV é
artefato intermediário e não deve ser versionado por padrão.

Fluxo por item:

1. validar origem e campos do inventário;
2. gerar slug e categoria determinísticos;
3. verificar idempotência no PostgreSQL;
4. baixar para diretório temporário, com timeout, tentativas e backoff;
5. rejeitar arquivo vazio ou tipo desconhecido;
6. calcular SHA-256;
7. consultar o objeto no R2;
8. recusar sobrescrita se o hash divergir ou não for verificável;
9. subir objeto novo com SHA-256 em metadado;
10. inserir metadados em `arquivo`;
11. remover temporário em `finally` e emitir relatório por categoria.

O fluxo é sequencial de propósito: determinismo e auditabilidade valem mais que
throughput. Falha de banco depois do upload não apaga o objeto; o relatório pede
reconciliação. Origem Figma exige captura estática humana. Ausência de link é pendência,
não licença para inventar URL.

Não existe `scripts/gerar-hashes.ts`: o cálculo foi absorvido por
`scripts/espelhar-anexos.ts`. Não criar arquivo vazio para satisfazer referências antigas.

Vocabulários fechados de categoria:

- `analise-de-dados`;
- `comprovacao-de-campo`;
- `conformidade`;
- `produto-final`;
- `publicidade`.

Origens reconhecidas incluem Google Drive, Google Docs, Google Forms, Figma, Instagram e
arquivo local. Tipo desconhecido falha; `outro` não é fallback automático.

## Catálogo documental

`scripts/catalogar-documentos.ts` transforma os itens do inventário em obras e vínculos:

- valida o enum `tipo_documento`;
- interpreta estritamente “Sim/Não” para exigência do edital;
- calcula `ordem_anexo` pela ordem estável dos IDs do inventário;
- cria ou atualiza `documento` por slug;
- nunca publica documento: o status permanece rascunho até decisão editorial;
- procura arquivos por prefixo de `chave_storage`, não por URL de origem compartilhada;
- cria vínculos em `documento_arquivo`;
- usa versão 1 na primeira catalogação;
- escolhe como principal o primeiro arquivo por `chave_storage` crescente;
- recusa sobrescrever silenciosamente um vínculo incompatível;
- é idempotente e tem modo `--dry-run`.

O espelhamento popula `arquivo`; a catalogação popula `documento` e
`documento_arquivo`. Manter essa separação.

## Gate de pendências

O gate tem três partes:

- `vw_pendencia_publicacao`, criada pela migração `0003`;
- `src/dados/consultas/pendencias.ts`, consulta tipada;
- `scripts/verificar-pendencias.ts`, decisão de saída e relatório para o CI.

Se a consulta retorna linha, `pnpm pendencias` termina com código 1 e bloqueia o build
publicável. A tabela do log contém slug, título e motivo.

Sem `DATABASE_URL`:

- fora do CI, informa claramente que nada foi verificado e termina com código 0;
- no CI, termina com erro, pois ausência de credencial é falha de configuração.

O gate atual cobre só anexos obrigatórios sem espelho. O ramo de áudio sem consentimento
deve ser adicionado quando `entrevista` existir, por nova migração.

---

# 6. Decisões arquiteturais fechadas

## NÃO ALTERAR SEM NOVA AUTORIZAÇÃO

- Não inventar dados, fatos, citações, equipamentos, entrevistas, metas ou resultados.
- Não criar números provisórios, mesmo que números apareçam em documentos de arquitetura.
- Não criar conteúdo institucional, missão, apresentação do Coletivo ou interpretação da
  pesquisa sem texto fornecido ou aprovação explícita do responsável.
- Não usar “Lorem ipsum” nem placeholder plausível. Conteúdo ausente é `null`, seção
  omitida ou estado vazio explícito.
- Não editar migrações antigas, especialmente `0001`, `0002` e `0003`.
- Não usar `drizzle-kit push` ou `drizzle-kit introspect`.
- Não criar tabela, view, trigger, função ou extensão fora de migração versionada e
  autorizada.
- Não criar novas tabelas sem autorização; não antecipar `indicador` nem entidades de
  fases futuras.
- Não acessar banco diretamente a partir de página, componente ou rota. Usar
  `src/dados/consultas/` e resolver dados no build.
- Não usar `any`, `@ts-ignore` ou desabilitar lint para esconder erro.
- Não alterar `package.json` de dependências, `pnpm-lock.yaml` ou instalar dependência sem
  autorização. Quando uma instalação for autorizada, não inventar pacote/versão.
- Não commitar segredo, `.env.local`, senha ou chave de serviço.
- Não mover a Home para grupo de rota nem reorganizar rotas sem necessidade aprovada.
- Não desligar, contornar ou substituir `typedRoutes`; não usar `as Route` para silenciar
  erro.
- Não mudar identidade visual, cores, fontes, espaçamento-base, logos, imagens ou
  referências estéticas sem perguntar ao responsável.
- Não escrever hex, família tipográfica ou raio novo fora de `tokens.css`.
- Não renderizar imagem sem texto alternativo nem áudio sem transcrição vinculada.
- Não adicionar script de rastreio nem tecnologia que grave cookie.
- Não colocar binários do acervo em PostgreSQL ou `public/`.
- Não tornar link de Drive/Figma a única fonte de um anexo obrigatório.
- Não fazer push, abrir PR ou alterar serviço externo sem autorização correspondente.

Sempre preservar:

- TypeScript estrito;
- validação Zod para entrada externa nova;
- Server Components como padrão;
- pt-BR em domínio, comentários e interface;
- teste junto da funcionalidade;
- diff pequeno, uma tarefa por PR;
- revisão humana antes de merge;
- execução dos gates antes da entrega.

---

# 7. Estado da Home (Tarefa 10)

## Objetivo

Transformar a Home em porta pública do Observatório, capaz de identificar o projeto e
levar cada público ao destino relevante em até dois cliques. A mensagem central deve ser
a de um acervo público, verificável e territorial. A ação principal planejada é acessar a
Prestação de Contas; Pesquisa e PodObservar são caminhos secundários prioritários.

A Home continua em `src/app/page.tsx`. Não criar `src/app/(site)/page.tsx` agora.

No baseline commitado `5a2ede8`, a estrutura abaixo ainda não existe. No working tree
atual foi detectada uma candidata não commitada com `AberturaObservatorio`,
`CaminhosPrioritarios`, `CartaoCaminho`, `ChamadaAcervo`, um módulo de caminhos e dois
arquivos de teste. Ela omite Apresentação e Território por causa dos bloqueios. Essa
candidata surgiu durante a documentação e não foi criada, modificada nem validada por
esta rodada; preservar e pedir confirmação antes de aceitá-la ou alterá-la.

## Estrutura planejada

```text
Abertura
↓
Caminhos prioritários
↓
Apresentação
↓
Território
↓
Acervo público
```

O cabeçalho e o rodapé globais já envolvem essa estrutura e não precisam ser duplicados.

### Abertura

Deve funcionar como ficha-mestra do Observatório, não como hero publicitário genérico.
Usa nome oficial, hierarquia tipográfica, mensagem aprovada e chamada principal para a
Sala do Avaliador. Não usar gradiente, carrossel, slogan inventado, foto genérica ou
número gigante decorativo.

### Caminhos prioritários

Entradas visíveis para:

- Prestação de Contas;
- A Pesquisa;
- PodObservar;
- opcionalmente Dados como caminho secundário.

### Apresentação

Explicará o Observatório e o Coletivo “Tobias, sou Eu!”, mas depende de texto humano
aprovado. Não preencher automaticamente.

### Território

Situará a pesquisa no Vale do Rio Real. Pode usar apenas fatos e rótulos aprovados. A
tabela comparativa entre Tobias Barreto, Itabaianinha e São Cristóvão permanece bloqueada
por falta de fonte oficial comparável.

### Acervo público

Apontará para documentos, Dados e Prestação de Contas sem inventar quantidade. Uma lista
dinâmica de documentos pode ser avaliada futuramente a partir de `vw_anexo_publico`,
sempre no build.

## Componentes

Implementados na fatia 10A, todos Server Components, em `src/componentes/home/`:

- `AberturaObservatorio`;
- `CaminhosPrioritarios`, que recebe a lista por props;
- `CartaoCaminho`, que recebe um destino por props;
- `ChamadaAcervo`;
- `caminhos.ts`, módulo sem JSX com os destinos prioritários, verificável em teste de
  unidade sem renderização.

Não implementados, por dependerem de conteúdo bloqueado:

- `ApresentacaoObservatorio`;
- `BlocoTerritorio`.

A seção correspondente a cada um deles foi omitida da página, não renderizada vazia.

Indicadores, lista de municípios, entrevistas, mídias e documentos destacados são
extensões futuras, não requisitos da fatia estrutural 10A.

---

# 8. Bloqueios atuais da Home

## Texto institucional

Não existe texto final fornecido ou revisado pelo responsável para apresentar o
Observatório. Os documentos arquiteturais explicam objetivos técnicos e institucionais,
mas não autorizam convertê-los automaticamente em copy pública.

## Apresentação do Coletivo

O nome “Tobias, sou Eu!” é factual e pode ser identificado. História, missão, atuação,
perfil e impacto do Coletivo exigem fonte ou redação aprovada.

## Comparação municipal

A Tarefa 10 original pede comparativo entre Tobias Barreto, Itabaianinha e São
Cristóvão, mas não existe fonte oficial aprovada com dados comparáveis. Não montar tabela
com inferência, amostra parcial ou números de origens diferentes. Registrar a ausência e
omitir o comparativo até decisão humana.

## Números e indicadores

A arquitetura cita números previstos para o painel, mas a regra vigente proíbe números
provisórios. A tabela `indicador` ainda não existe e pertence à Tarefa 13. Portanto:

- não criar `src/dados/consultas/indicadores.ts`;
- não escrever números no JSX;
- não renderizar seção vazia de indicadores;
- inserir o painel somente depois da tabela, do seed aprovado e da consulta em build.

## MDX

ADR-005 destina o conteúdo editorial a `content/paginas/home.mdx`, porém:

- a pasta `content/` não existe;
- `@next/mdx` não está instalado;
- o pipeline MDX pertence à Fase 2;
- a Tarefa 10A não autoriza dependência nem MDX.

Não instalar nem criar MDX agora. A arquitetura editorial continua válida para uma fase
posterior.

## Imagens

Não há seleção editorial aprovada, direitos documentados, textos alternativos nem pasta
de ativos para a Home. A primeira estrutura pode funcionar sem imagens. Não usar banco de
imagem, ilustração gerada, mapa decorativo ou fotografia do acervo sem autorização.

## Créditos e marcas

O manual E02 de aplicação de marcas do edital não está disponível. Ordem, proporção,
logos e redação de crédito não podem ser estimados. O rodapé atual declara a pendência.

## Escopo de testes

O contrato exige teste junto da funcionalidade, mas o arquivo atual da Tarefa 10 não
lista testes entre os arquivos permitidos. Antes de criar teste novo, obter autorização
humana para o caminho específico ou atualizar a documentação em rodada autorizada.

---

# 9. Identidade visual

A direção normativa atual é “arquivo vivo”: ficha de pesquisa, caderno de campo, carimbo
de tombo e metadados como referências materiais, sem pastiche histórico.

O elemento assinatura é a **ficha**: borda discreta, canto quase reto, cabeçalho
monoespaçado, título em display e corpo de leitura. Numerais só podem aparecer quando são
reais e informativos, como visita, meta ou episódio; nunca como enfeite.

Evitar explicitamente:

- gradiente decorativo;
- glassmorphism;
- sombra colorida;
- hero genérico de startup;
- carrossel de logos;
- combinação genérica de creme quente, serifa de alto contraste e terracota;
- números grandes sem contexto;
- animação que ignore `prefers-reduced-motion`.

**Antes de definir cores novas, logos, imagens, estilo visual ou referências, perguntar
ao responsável. Não criar identidade visual automaticamente.**

Uma implementação pode combinar os tokens existentes, mas não reinterpretá-los como nova
marca. O piso continua sendo responsividade em 360 px, foco nítido, contraste de pelo
menos 4,5:1 para texto normal e Home abaixo de 500 KB.

---

# 10. Git atual

## Branches e remoto

- **Branch principal remota:** `origin/main`.
- **Commit atual de `origin/main`:** `5a2ede8` — `Merge pull request #1 from
  FabricioGregorio/feat/bootstrap`, de 2026-09-01.
- **Última PR:** PR #1, merge da branch `feat/bootstrap`.
- **Branch de trabalho atual:** `feat/home-indicadores`, criada a partir de
  `origin/main` e apontando para `5a2ede8`.
- A branch `feat/home-indicadores` ainda não foi enviada ao remoto; ela está configurada
  localmente para acompanhar `origin/main`.
- A branch local `main` está em `e509462` e aparece seis commits atrás de `origin/main`.
  Não começar trabalho nela sem sincronização explícita e segura.

## Situação do working tree antes deste documento

Há alterações não commitadas da rodada de preparação:

- `biome.json` — schema corrigido de 2.5.10 para 2.5.11;
- `docs/03-guia-implementacao.md` — rota real `/anexos.json` e absorção dos hashes pelo
  espelhamento;
- `docs/tarefas/10-home-indicadores.md` — Tarefa 13, rota atual da Home e bloqueios;
- `docs/divida-documental.md` — cobertura ampliada para `docs/tarefas/*.md`;
- `ESTADO_PROJETO_2026-09-01.md` — preparação da Tarefa 10.

Durante a criação deste documento também foram detectadas mudanças concorrentes, cuja
origem não deve ser presumida:

- `src/app/page.tsx` modificado;
- `src/componentes/home/AberturaObservatorio.tsx` novo;
- `src/componentes/home/CaminhosPrioritarios.tsx` novo;
- `src/componentes/home/CartaoCaminho.tsx` novo;
- `src/componentes/home/ChamadaAcervo.tsx` novo;
- `src/componentes/home/caminhos.ts` novo;
- `testes/a11y/home.spec.ts` novo;
- `testes/home.test.ts` novo.

Esses arquivos formam uma candidata da Tarefa 10A, mas não estão em `origin/main`, não
foram criados por esta rodada documental e ainda exigem revisão e decisão humana. Não
apagá-los, reimplementá-los ou assumir autoria.

`package.json` e `scripts/verificar-pendencias.ts` foram normalizados localmente de CRLF
para LF para o Biome, sem diferença semântica ou diff rastreado ao final. Dependências e
lockfile não mudaram.

Este `ESTADO_COMPLETO_PROJETO.md` é o novo arquivo documental desta transição. Esta
rodada não implementou a Home; a candidata acima apareceu como alteração concorrente no
workspace.

Não fazer push ou abrir PR automaticamente. Preservar o diff existente e confirmar o
escopo antes de qualquer commit.

---

# 11. Próximo passo autorizado

## Etapa executada

**Tarefa 10A — Home estrutural, implementada em 2026-09-02**, com autorização direta do
responsável na sessão daquele dia e no escopo descrito abaixo. `pnpm tipos`,
`pnpm lint`, `pnpm teste`, `pnpm build` e `pnpm a11y` passaram. Os arquivos estão no
working tree, ainda não commitados.

Na mesma data, e em rodada própria autorizada pelo responsável, foi feita a auditoria do
pipeline visual, que criou `postcss.config.mjs`. Ver a seção 3, "Pipeline de estilos".

## Próxima etapa

**Tarefa 10B — aguarda aprovação.** Nada dela pode começar antes da decisão do
responsável sobre os bloqueios de conteúdo e sobre a distinção de link registrada na
seção 12.

## Permitido na 10A

- criar componentes;
- estruturar a página existente em `src/app/page.tsx`;
- usar textos estruturais.

“Textos estruturais” significa rótulos, títulos de navegação, nomes oficiais já
confirmados, estados explícitos e chamadas que descrevem destinos existentes. Não inclui
missão, narrativa institucional, interpretação da pesquisa ou apresentação autoral do
Coletivo.

A estrutura autorizada é:

```text
Abertura
↓
Caminhos prioritários
↓
Apresentação
↓
Território
↓
Acervo público
```

Se uma seção depender integralmente de conteúdo bloqueado, ela deve ser omitida na fatia
10A, não preenchida com texto plausível nem renderizada como caixa vazia.

## Não permitido na 10A

- conteúdo institucional;
- indicadores ou números;
- dados comparativos ou outros dados de pesquisa;
- MDX ou instalação de pipeline MDX;
- alteração ou consulta nova de banco;
- migração, tabela ou seed;
- nova identidade visual;
- logos, imagens ou créditos estimados;
- mudança de rota ou desligamento de `typedRoutes`.

Nada disso foi feito na 10A, e a lista continua valendo. Antes de escrever ou modificar
código, a próxima IA deve ler a documentação obrigatória, inspecionar o diff existente e
confirmar com o responsável o escopo da sessão. Esta seção registra o escopo executado e
o próximo autorizado; não autoriza ampliá-lo por inferência.

---

# 12. Pendências futuras

- **Árvore de pastas do doc 03 §2:** não lista `postcss.config.mjs`. Atualizar quando
  houver rodada autorizada a mexer na documentação normativa.
- **Indicadores:** criar tabela `indicador`, seed real e consulta somente na Tarefa 13;
  depois integrar à Home sem número hardcoded.
- **Municípios:** implementar seed e páginas próprias; só comparar municípios com fonte
  oficial comum e aprovada.
- **Entrevistas:** criar schema, consentimentos, trechos, transcrições e publicação na
  Fase 3; completar o segundo ramo de `vw_pendencia_publicacao`.
- **Visitas e mídias:** criar entidades da Fase 3; toda imagem requer alt e crédito, todo
  áudio requer transcrição e consentimento.
- **MDX:** implementar pipeline na Fase 2 e criar `content/paginas/home.mdx` somente com
  conteúdo humano revisado.
- **Lighthouse CI:** instalar e configurar na Fase 4, incluindo servidor, simulação 3G,
  asserções e integração com o workflow.
- **Acessibilidade automatizada:** substituir/complementar o smoke test atual com axe-core
  real e manter teste manual de teclado.
- **Manual de marcas E02:** obter o documento oficial antes de adicionar logos.
- **Créditos de fomento:** implementar ordem, proporção e texto conforme o manual, nunca
  por estimativa.
- **Seed real:** substituir o comando no-op por seed idempotente apenas quando a tarefa e
  os dados reais forem aprovados.
- **RLS:** adaptar a documentação antiga de roles Supabase ao modelo Neon e implementar
  por migração quando a fase correspondente for autorizada.
- **Roles de produção:** provisionar e testar separação entre aplicação sem DDL e migração
  com DDL.
- **Backup:** implementar e testar `pg_dump`, restauração, retenção no R2 e cópia mensal.
- **Preservação externa:** depósito no Zenodo, DOI e arquivamento no Internet Archive.
- **Conteúdo faltante:** diagnósticos, relatos de campo, documento final/modelagem e
  podcast ainda dependem de fontes definitivas e autorização de publicação.
- **Avisos técnicos atuais:** investigar futuramente o aviso do Turbopack sobre `@theme`
  e os avisos de origem do servidor Playwright, sem misturar com a Tarefa 10A.

---

# 13. Histórico de decisões importantes

| Momento | Decisão |
|---|---|
| Fundação documental — 2025-08-27 | A arquitetura definiu o site como prova documental, com prioridade para permanência, rastreabilidade e URLs próprias. |
| Arquitetura híbrida — ADR-001 | PostgreSQL tornou-se camada de gestão; HTML estático e storage tornaram-se camada de preservação. |
| Banco — ADR-002 | PostgreSQL 15+ e Drizzle foram escolhidos; migrações SQL seriam versionadas e imutáveis. |
| Storage documental — ADR-003 | Documento foi separado de arquivo; espelho local e SHA-256 tornaram-se obrigatórios. |
| Provedor PostgreSQL — ADR-004 | Neon foi escolhido; driver permaneceu `pg`, sem acoplamento proprietário. |
| Conteúdo — ADR-005 | Texto editorial foi destinado a MDX no Git, fora do PostgreSQL. O pipeline ainda não foi implementado. |
| Storage — ADR-006, 2026-08-30 | Cloudflare R2 foi escolhido pela API S3 e pelo perfil de download sem egress. |
| Roles — ADR-007 | Roles passaram a ser provisionamento de infraestrutura, nunca parte das migrações. |
| TLS — ADR-008 | Produção e preview passaram a exigir `sslmode=verify-full`. |
| Bootstrap e tokens — agosto de 2026 | Next.js, TypeScript, pnpm, Biome, testes, CI, tokens e tipografia foram configurados. |
| Layout — Tarefa 03 | Cabeçalho, seis itens de menu, menu mobile, rodapé, skip link, error boundary, 404 e stubs foram entregues. |
| Migrações — Tarefas 04 e 05 | `0001` criou fundação; `0002` criou o núcleo documental e `vw_anexo_publico`. |
| Espelhamento — Tarefa 06 | Download, validação, hash, R2 e persistência foram reunidos num fluxo idempotente. A responsabilidade de hash deixou de exigir script separado. |
| Catálogo — Tarefa 07 | Inventário passou a alimentar documentos e vínculos, sempre em rascunho. |
| Prestação de contas — Tarefa 08 | Sala do Avaliador, impressão, JSON literal em `/anexos.json` e ZIP no R2 foram implementados. |
| Integridade no CI — Tarefa 09 | `vw_pendencia_publicacao` e `pnpm pendencias` passaram a bloquear anexo obrigatório publicado sem espelho. |
| PR #1 — 2026-09-01 | `feat/bootstrap` foi integrada em `origin/main` pelo merge `5a2ede8`. |
| Preparação da Home — 2026-09-02 | Foi criada `feat/home-indicadores`; rota atual, ausência de indicadores, MDX adiado, conteúdo bloqueado e falta de comparativo foram documentados. |
| Planejamento da Home — 2026-09-02 | A Home foi definida como ficha de entrada do arquivo vivo, com abertura, caminhos, apresentação, território e acervo. Nenhuma implementação foi autorizada nessa rodada de planejamento. |
| Próxima fatia | Tarefa 10A ficou limitada à estrutura, componentes e textos estruturais, sem conteúdo institucional, dados, MDX, banco ou nova identidade. |
| Home 10A — 2026-09-02 | A fatia estrutural foi implementada e validada: quatro componentes e um módulo de dados em `src/componentes/home/`, `src/app/page.tsx` adaptado e dois arquivos de teste. Apresentação e Território foram omitidos por dependerem de conteúdo bloqueado. |
| Pipeline de estilos — 2026-09-02 | Auditoria confirmou que o Tailwind nunca havia rodado, por falta de `postcss.config.mjs`. O arquivo foi criado; nenhum token, fonte ou componente mudou. |
| Estabilização 10A — 2026-09-02 | Links de conteúdo passaram a ter sublinhado além de cor, e o foco sobre fundo escuro passou a usar milho em vez de anil. Nenhum token, cor, fonte ou conteúdo mudou. |
| Fundação territorial 10B.1 — 2026-09-03 | Criados contratos em `src/dados/territorio/`, componentes em `src/componentes/mapa/` e `src/componentes/institucional/`, e as pastas de `public/media/`. Nenhum mapa, GeoJSON, foto, logo ou alteração da Home. Detalhes na seção 21 do `ESTADO_PROJETO_2026-09-01.md`. |
| Dados territoriais 10B.2 — 2026-09-03 | Fonte oficial identificada e verificada: API de malhas do IBGE, v4. Procedência registrada em `src/dados/territorio/fontes.ts` e `LEIA-ME.md`, com gate de teste. Nenhum arquivo baixado: depende de autorização, do recorte do Vale do Rio Real e da qualidade da malha. Detalhes na seção 22 do `ESTADO_PROJETO_2026-09-01.md`. |
| Consolidação territorial 10B.2.1 — 2026-09-03 | Responsável definiu o Vale do Rio Real como região socioeconômica com cinco municípios, São Cristóvão como comparação, camada base de 75 municípios e malha intermediária. O booleano `pesquisado` deu lugar a `relacoesTerritoriais`. Documento próprio em `docs/direcao-visual/10B.2.1_Consolidacao_Territorial_e_Camadas.md`; detalhes na seção 23 do `ESTADO_PROJETO_2026-09-01.md`. |
| Pesquisa de campo 10B.2.2 — 2026-09-03 | Tobias Barreto, Tomar do Geru e São Cristóvão passaram a carregar `pesquisa-campo`, cada um com a evidência documental que sustenta a afirmação. Criado `src/dados/territorio/pontos.ts` com os quatro pontos; Serra dos Macacos e Ilha Grande ficam sem município por falta de fonte. Detalhes na seção 24 do `ESTADO_PROJETO_2026-09-01.md`. |
| Mapa — ADR-009, 2026-09-03 | MapLibre GL JS foi escolhido no lugar de D3 + SVG, com seis restrições amarradas à decisão — a principal é estilo sem nenhuma fonte externa, sob pena de a Home chamar serviço de terceiro. Nada instalado nem baixado. Detalhes na seção 25 do `ESTADO_PROJETO_2026-09-01.md`. |
| Dados e auditoria 10B.3.1 e 10B.3.2 — 2026-09-03 | `maplibre-gl` e `zod` instalados; malha oficial do IBGE no repositório com procedência e hash; camada de validação com Zod; 34 testes. A auditoria de peso mostrou a projeção acima do orçamento e comparou três cenários — detalhes em `docs/direcao-visual/10B.3.2_Auditoria_de_Performance_do_Mapa.md` e na seção 26 do `ESTADO_PROJETO_2026-09-01.md`. Renderização não iniciada. |
| Mapa em SVG — ADR-010, 2026-09-03 | Cenário C implementado: os 75 municípios de Sergipe em SVG renderizado no servidor, sem JavaScript, sem WebGL e sem serviço externo. A Home ficou 62 kB mais leve **com** o mapa do que estava sem ele — 316 kB de 500. `maplibre-gl` removido depois de verificado sem uso. ADR-009 passou a "Substituída". Detalhes na seção 27 do `ESTADO_PROJETO_2026-09-01.md`. |
| Refinamento do mapa — 2026-09-03 | O mapa passou a ser **uma** parada de Tab, com setas, Enter/Espaço e Esc, por uma ilha cliente de 965 B comprimidos. Município deixou de ser link e passou a opção de `listbox`; sem JavaScript o SVG é `role="img"` e a lista carrega tudo. Fronteiras da base ficaram perceptíveis. Home em 318 kB de 500. Achado: o `playwright.config.ts` apontava para `127.0.0.1` e **a página nunca hidratava nos testes** — corrigido para `localhost`. Detalhes na seção 28 do `ESTADO_PROJETO_2026-09-01.md`. |

---

# INSTRUÇÃO PARA PRÓXIMA IA

Antes de implementar qualquer coisa:

1. leia este documento;
2. confirme o estado atual;
3. não contradiga decisões já fechadas;
4. peça autorização quando houver decisão visual/editorial.

Depois, leia `AGENTS.md`, as arquiteturas 01 e 02 e o arquivo da tarefa. Confira o Git e
preserve as alterações não commitadas. Se houver divergência entre este retrato e uma
instrução humana posterior, a instrução humana vence; registre a nova decisão antes de
expandir o trabalho.
