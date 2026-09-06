> **SUPERADO — preservado apenas para histórico.**
> Não usar como orientação operacional vigente.
> Referências vigentes: [`PLANO_EXECUCAO_OBSERVATORIO.md`](../../../PLANO_EXECUCAO_OBSERVATORIO.md)
> e [`ESTADO_ATUAL_PROJETO.md`](../../../ESTADO_ATUAL_PROJETO.md).
> Movido em 2026-09-06 pela consolidação de governança.

---

# Estado do Projeto — 2026-09-01

Documento de continuidade para novas sessões de IA.

Este arquivo registra o estado atual do projeto, decisões arquiteturais, tarefas concluídas, pendências e regras que devem ser respeitadas antes de qualquer implementação.

Última atualização: 2026-09-03 — mapa SVG refinado: uma parada de Tab, semântica de listbox, fronteiras perceptíveis; Home em 318 kB de 500

---

# 1. Visão geral do projeto

Projeto: Observatório Vale do Rio Real.

Objetivo:

Construir uma plataforma pública de prestação de contas, acervo documental e apresentação institucional.

Princípios:

- transparência;
- rastreabilidade;
- dados públicos verificáveis;
- publicação estática quando possível;
- banco apenas para dados estruturados;
- arquivos grandes no storage de objetos;
- nenhuma informação inventada;
- decisões documentadas antes da implementação.

---

# 2. Arquitetura definida

## Frontend

Stack:

- Next.js
- TypeScript
- Tailwind/CSS tokens
- renderização estática quando possível

Regra principal:

O site público NÃO consulta PostgreSQL em tempo de requisição.

Conteúdo público deve ser:

- gerado em build;
- servido estaticamente;
- ou através de artefatos públicos controlados.

---

# 3. Banco de dados

## Provedor

Decisão:

PostgreSQL no Neon.

Versão validada:

PostgreSQL 18.6

Banco:

neondb

---

## ORM

Drizzle ORM.

Driver:

pg (node-postgres)

---

## Migrações

Regra:

Migrações SQL versionadas e imutáveis.

Permitido:


pnpm gerar-migracao
pnpm migrar


Proibido:


drizzle-kit push
drizzle-kit introspect


Motivo:

O schema real possui objetos que o snapshot do Drizzle não controla:

- extensões;
- funções;
- triggers;
- views.

---

## Migrações existentes

Não alterar.

Arquivos:


db/migrations/0001_fundacao.sql
db/migrations/0002_nucleo_prestacao_contas.sql


Estado:

- aplicadas;
- validadas;
- hashes preservados.

---

# 4. Storage

## Provedor

Cloudflare R2.

Motivo:

- custo de saída;
- arquivos públicos;
- compatibilidade S3.

---

## Regra de armazenamento

Arquivos binários:

R2.

Banco:

somente metadados.

Nunca armazenar documentos em:


public/


---

# 5. Estrutura atual de código

Arquivos existentes:


src/app/layout.tsx
src/app/page.tsx
src/app/dev/estilos/page.tsx

src/dados/cliente.ts

src/lib/espelhamento.ts
src/lib/storage.ts

src/estilos/tokens.css


---

# 6. Estado das tarefas

## Tarefa 00 — Modelo

Status:

CONCLUÍDA


---

## Tarefa 01 — Bootstrap

Status:

CONCLUÍDA


---

## Tarefa 02 — Tokens e tipografia

Status:

CONCLUÍDA


Implementado:

- fontes Archivo;
- Literata;
- IBM Plex Mono.

Usando:


next/font/google


com:


display: swap
subsets: latin + latin-ext


As fontes são auto-hospedadas no build.

---

Criado:


src/app/dev/estilos/page.tsx


Função:

Página interna de referência visual.

Inclui:

- paleta;
- contraste WCAG;
- escala tipográfica;
- estados de foco;
- componentes de ficha.

---

Não alterar:


src/estilos/tokens.css


sem necessidade explícita.

---

# 7. Tarefa 03 — Layout base

Status:

CONCLUÍDA em 2026-09-01.

Entregue: navegacao.ts, Cabecalho, MenuMobile, Rodape, PularConteudo,
error.tsx, not-found.tsx e os 11 stubs de rota. O layout raiz passou a
declarar o main com id "conteudo", e por isso page.tsx e dev/estilos/page.tsx
tiveram o main proprio removido — havia duplicacao de landmark e de id.

Pendente, por depender do manual E02: public/marcas/ e o bloco de creditos
de fomento no rodape. O rodape declara a ausencia em texto; nenhum logo,
proporcao ou credito foi estimado.

Objetivo:

Criar a estrutura base do site.

---

## Arquivos previstos

Criar:


src/componentes/layout/


Com:


Cabecalho.tsx
MenuMobile.tsx
Rodape.tsx
PularConteudo.tsx


Criar:


src/lib/navegacao.ts


Criar:


src/app/error.tsx
src/app/not-found.tsx


---

# 8. typedRoutes

Importante:

Existe:


typedRoutes: true


no projeto.

Não alterar.

Não usar:


as Route


Não desligar typedRoutes.

---

## Solução definida

Criar stubs mínimos para rotas inexistentes.

Rotas:


/observatorio
/pesquisa
/dados
/campo
/podobservar
/educacao
/prestacao-de-contas
/imprensa
/acessibilidade
/privacidade
/contato


Formato permitido:

<h1>Título</h1> <p> Conteúdo em desenvolvimento. </p> ```

Não criar conteúdo institucional falso.

9. Tarefa 05 — Migração arquivo/documento

Status:

CONCLUÍDA.

Criadas estruturas:

arquivo;
documento;
documento_arquivo;
view de anexos.
10. Tarefa 06 — Espelhamento de arquivos

Status:

CONCLUÍDA.

Arquivos criados:

src/lib/espelhamento.ts
scripts/espelhar-anexos.ts
src/lib/storage.ts
testes/espelhamento.test.ts

Responsabilidades:

leitura do inventário;
geração de slug;
categoria;
origem;
download;
SHA-256;
upload R2;
idempotência;
tratamento de erros.
Vocabulários fechados

Categorias:

analise-de-dados
comprovacao-de-campo
conformidade
produto-final
publicidade

origem_sistema:

google_drive
google_docs
google_forms
figma
instagram
upload

Arquivo local:

upload

tipo_midia:

PDF:

pdf

Imagem:

imagem

Vídeo:

video

Áudio:

audio

CSV/JSON/TSV:

dataset

Planilhas:

planilha

Apresentações:

apresentacao

Outros:

Falha explícita.

Não usar:

outro

como fallback automático.

11. Tarefa 07 — Catálogo documental

Status:

CONCLUÍDA.

Criado:

scripts/catalogar-documentos.ts
testes/catalogo.test.ts

Responsabilidades:

criar documentos;
atualizar metadados;
vincular arquivos;
controlar versão;
definir principal.
Regra principal

Arquivo principal:

Ordenação por:

chave_storage crescente

Motivo:

ordem_anexo pertence ao documento e não diferencia arquivos.

12. Tarefa 08 — Sala do Avaliador

Status:

CONCLUÍDA em 2026-09-01.

Entregue: /prestacao-de-contas com tabela mestre, /prestacao-de-contas/imprimir,
/anexos.json estático, o pacote .zip gerado em build e publicado no R2, e a
declaração pgView("vw_anexo_publico").existing() em db/schema.ts. O stub de rota
criado pela Tarefa 03 foi substituído, sem rota nova.

Arquivos criados:

src/dados/consultas/anexos.ts
src/componentes/acervo/TabelaAnexos.tsx
src/app/prestacao-de-contas/imprimir/page.tsx
src/app/anexos.json/route.ts
src/lib/zip-anexos.ts
scripts/gerar-zip-anexos.ts
testes/anexos.test.ts

Regra registrada: sem DATABASE_URL a consulta da Sala avisa e devolve lista
vazia. NODE_ENV não serve como discriminador ali porque next build sempre define
production; a regra do ZIP (§13) vale só para o script, que roda fora do build.

Decisões já tomadas:

Storage:

R2.

ZIP:

não fica em:

public/

Será gerado e publicado no R2.

Tecnologias:

fflate
GetObjectCommand

Drizzle:

Adicionar view existente:

pgView("vw_anexo_publico").existing()

Não gerar migration.

12.1 Tarefa 09 — Gate de pendências

Status:

CONCLUÍDA.

Objetivo:

Impedir tecnicamente que o site publique anexo obrigatório sem espelho local.

Decisão de fatiamento (2026-09-01):

A vw_pendencia_publicacao do doc 02 §13 tem dois ramos em UNION ALL. O segundo
lê a tabela entrevista, que não existe: a migração 0002 criou sete tabelas e
nenhuma delas é entrevista. Ela pertence ao item 3 da §16 do doc 02, que é o
item 17 do backlog do doc 03 §10 — Fase 3.

A migração 0003 cria a view somente com o primeiro ramo, sobre documento,
documento_arquivo e arquivo. O segundo ramo entra depois, por
CREATE OR REPLACE VIEW, quando entrevista existir.

Não é remoção de requisito. É fatiamento por dependência.

Nenhuma tabela de Fase 3 foi antecipada.

Regra do gate sem DATABASE_URL:

Fora de CI: informa "não verificado" e sai com código 0.
Em CI: erro, com código 1.

Detalhamento em docs/tarefas/09-gate-de-pendencias.md.

13. Regra do ZIP

Em desenvolvimento/teste:

Sem credenciais:

não gera ZIP;
encerra com sucesso;
informa o motivo.

Em produção:

Sem credenciais:

falha explícita;
exit code diferente de zero.
14. Regras permanentes do projeto

Nunca:

alterar migration aplicada;
usar drizzle push;
usar drizzle introspect;
criar view fora de migration;
acessar banco diretamente pelo frontend;
inventar dados;
duplicar tokens CSS;
criar fallback silencioso.

Sempre:

documentar decisão antes de implementação;
executar testes;
preservar hashes;
registrar alterações.
15. Comandos obrigatórios após tarefas

Executar:

pnpm tipos
pnpm lint
pnpm teste
pnpm build

Relatar:

arquivos alterados;
arquivos criados;
testes;
migrations;
acesso externo.
16. Estado atual de infraestrutura

Neon:

Não conectado atualmente.

R2:

Não conectado atualmente.

Variáveis ausentes:

DATABASE_URL
DATABASE_URL_MIGRACAO
STORAGE_ENDPOINT
STORAGE_ACCESS_KEY

Nenhuma operação remota deve ser assumida.

16.1 Lighthouse CI — gate obrigatório, não executado

Status:

EXIGIDO pela documentação. NÃO executado pelo CI.

O que aconteceu:

O passo pnpm exec lhci autorun falhava sempre, com "Command lhci not found".
O pacote @lhci/cli nunca foi instalado — não está no package.json nem no
pnpm-lock.yaml. O passo foi removido do workflow em 2026-09-01.

O que NÃO mudou:

O gate continua obrigatório. Nenhum critério de aceite, meta de desempenho ou
item de definição de pronto foi removido. O lighthouserc.json permanece
versionado na raiz, intocado.

Onde a implementação pertence:

Item 26 do backlog do doc 03 §10 — Fase 4.

O que falta, além de instalar a dependência:

lighthouserc.json sem startServerCommand, e o workflow não sobe servidor;
sem throttling de 3G, que o doc 01 §7 e a Tarefa 10 exigem.

Registro formal:

docs/divida-documental.md §4.

Cobertura que permanece:

Acessibilidade continua verificada pelo axe-core em pnpm a11y, a cada PR.
Desempenho, SEO e boas práticas não são medidos por enquanto.

17. Preparação da Tarefa 10 — 2026-09-02

Status:

PREPARAÇÃO DOCUMENTAL E ESTRUTURAL EXECUTADA; VALIDAÇÃO DE LINT PENDENTE.

A Tarefa 09 permanece concluída. A implementação da Tarefa 10 ainda não começou e
depende de nova aprovação do responsável.

Decisões registradas:

- a nova branch é `feat/home-indicadores`, criada a partir de `origin/main` depois da
  confirmação do merge da PR #1; nenhum push foi feito;
- a Home continuará em `src/app/page.tsx`; não criar `src/app/(site)/page.tsx` agora;
- `typedRoutes` permanece inalterado;
- não criar `src/dados/consultas/indicadores.ts` antes da Tarefa 13, que introduz a
  tabela `indicador`; até lá, a seção de indicadores fica ausente;
- `content/paginas/home.mdx` permanece como preparação documental, sem instalar
  `@next/mdx`; antes de implementar, avaliar a chegada da Fase 2 ou outro formato
  aprovado;
- nenhum texto institucional pode ser inventado; o conteúdo depende de texto fornecido
  pelo responsável ou de autorização explícita para estrutura sem conteúdo final;
- a tabela comparativa dos municípios não será implementada sem fonte oficial e fica
  registrada como pendência da Tarefa 10;
- `scripts/gerar-hashes.ts` não será criado: o cálculo de SHA-256 já pertence ao fluxo
  de espelhamento existente;
- a rota pública permanece em `src/app/anexos.json/route.ts`, pois o contrato exige
  literalmente `/anexos.json`.

Validações da preparação:

- `pnpm tipos`, `pnpm teste`, `pnpm build` e `pnpm a11y` passaram;
- `pnpm lint` falhou em formatação preexistente de `package.json` e
  `scripts/verificar-pendencias.ts`; também informou quatro avisos preexistentes sobre
  `!important` em `src/estilos/tokens.css`. Esses arquivos ficaram intocados porque a
  rodada autorizou somente a troca da versão do schema do Biome e proibiu alteração de
  `package.json`.

Bloqueios de conteúdo mantidos:

- texto institucional da Home;
- fonte oficial para o comparativo municipal;
- disponibilidade da tabela `indicador` e de seus dados aprovados;
- decisão sobre o consumo de `content/paginas/home.mdx` antes da Fase 2.

Próximo passo:

Aguardar aprovação do responsável antes de implementar qualquer componente ou conteúdo
da Home.

18. Tarefa 10A — Home estrutural — 2026-09-02

Status:

IMPLEMENTADA. A Tarefa 10B não foi iniciada e aguarda aprovação do responsável.

Escopo autorizado na sessão:

criar componentes em src/componentes/home/;
adaptar src/app/page.tsx;
usar somente textos estruturais aprovados;
criar a hierarquia semântica da Home;
manter os tokens e a identidade visual existentes;
manter Server Components;
criar testes em testes/.

Arquivos criados:

src/componentes/home/caminhos.ts
src/componentes/home/AberturaObservatorio.tsx
src/componentes/home/CaminhosPrioritarios.tsx
src/componentes/home/CartaoCaminho.tsx
src/componentes/home/ChamadaAcervo.tsx
testes/home.test.ts
testes/a11y/home.spec.ts

Arquivos alterados:

src/app/page.tsx
ESTADO_PROJETO_2026-09-01.md
ESTADO_COMPLETO_PROJETO.md

Migrations:

Nenhuma. O banco não foi tocado, e nenhuma consulta nova foi criada.

Acesso externo:

Nenhum. Nenhuma dependência foi instalada; o lockfile não mudou.

Estrutura entregue:

Abertura, Caminhos prioritários e Acervo público.

Seções omitidas, com o motivo:

Apresentação — depende de texto institucional humano sobre o Observatório e o Coletivo
"Tobias, sou Eu!". Não existe fonte aprovada.
Território — depende do comparativo entre Tobias Barreto, Itabaianinha e São Cristóvão,
que não tem fonte oficial comparável aprovada.

As duas foram omitidas, e não renderizadas como caixa vazia nem preenchidas com texto
plausível, conforme a regra da fatia.

O que continua ausente de propósito:

painel de indicadores, que depende da tabela indicador da Tarefa 13;
qualquer número escrito no código;
comparativo municipal;
content/paginas/home.mdx e o pipeline MDX;
imagens, logos e créditos de fomento.

Textos usados:

Só texto estrutural já aprovado no repositório: o nome oficial do Observatório;
"Arquivo público", da descrição do site em layout.tsx; "O acervo público está em
preparação.", que a Home provisória já trazia; os rótulos do menu, iguais aos de
src/lib/navegacao.ts; e a descrição da Sala do Avaliador, na redação que a própria
página já usa. Nenhuma frase institucional foi escrita.

Decisões visuais tomadas, todas dentro dos tokens existentes:

cartão de caminho como ficha discreta — borda em --color-borda, fundo em
--color-fundo-elevado, raio em --radius-ficha;
chamada principal com fundo --color-fundo-inverso e texto --color-texto-inverso, par de
contraste 11,4:1 já verificado em tokens.css;
largura de leitura pelo token --largura-leitura;
link dos componentes da Home sublinhado além de colorido, porque a distância de
contraste entre --color-link e --color-texto não chega a 3:1 e cor sozinha não distingue
o link (WCAG 1.4.1).

Nenhuma cor, fonte, logo, imagem ou token novo foi criado.

Achado bloqueante para o visual, anterior a esta tarefa:

O repositório não tem postcss.config.mjs. Sem ele o plugin @tailwindcss/postcss nunca
roda, @import "tailwindcss" não é resolvido, @theme é descartado como at-rule
desconhecida e nenhuma classe utilitária é gerada. O CSS do build tem 9,1 kB e nenhuma
utilidade; todos os tokens ficam indefinidos. Isso vale para o site inteiro desde o
bootstrap, e explica o aviso do Turbopack sobre @theme.

Correção deste registro: nesta seção ficou escrito que, depois de configurar o PostCSS,
o Tailwind ainda descartaria os tokens consumidos por style={{ ... var(--token) }}, e
que seria preciso @theme static. A auditoria da seção 19 mostrou que não é verdade. A
compilação de diagnóstico que sustentou aquela frase varria só as classes de className,
não o texto dos arquivos-fonte, e por isso não via as referências em atributos style. Com
o pipeline configurado de verdade, todo token referenciado no código é emitido, e
tokens.css não precisou de mudança nenhuma.

A correção mexe em arquivo de configuração, fora do escopo desta tarefa. Não foi feita
aqui: foi feita na rodada de auditoria registrada na seção 19.

Verificação:

pnpm tipos — passou;
pnpm lint — passou, com os quatro avisos preexistentes de !important em tokens.css;
pnpm teste — passou, 82 testes, 6 novos da Home;
pnpm build — passou, / gerada como estática;
pnpm a11y — passou, 8 testes, 7 novos da Home.

pnpm pendencias não foi executado: depende de DATABASE_URL, e o banco continua
desconectado.

Próximo passo:

Aguardar aprovação do responsável antes de iniciar a Tarefa 10B.

19. Auditoria e correção do pipeline visual — 2026-09-02

Status:

PROBLEMA CONFIRMADO E CORRIGIDO.

O problema existia:

Sim. O Tailwind nunca havia rodado neste projeto. Nenhum token e nenhuma classe
utilitária chegava ao navegador, em nenhuma página, desde o bootstrap.

Causa:

O repositório não tinha postcss.config.mjs, e nunca teve — git log em postcss.config* e
.postcssrc* não devolve nenhum commit. Sem esse arquivo o Next não carrega o plugin
@tailwindcss/postcss, mesmo com tailwindcss e @tailwindcss/postcss instalados. Sem o
plugin, @import "tailwindcss" não é resolvido e @theme não é processado.

Evidências levantadas antes de qualquer correção:

build limpo emitia "Unknown at rule: @theme" apontando para tokens.css:12;
o CSS gerado tinha 9.110 bytes, num único arquivo;
esse CSS não continha :root, nem preflight, nem uma única utilidade — mx-auto, max-w-6xl,
flex, gap-12, underline e grid-cols-2 apareciam zero vezes;
o bloco @theme{...} chegava literal ao CSS final, e o navegador descarta at-rule
desconhecida junto com o conteúdo dela;
no build servido por next start, getComputedStyle no documento devolvia string vazia para
--color-mata, --color-fundo, --color-borda, --largura-leitura e --radius-ficha;
o container da Home, com as classes mx-auto flex max-w-6xl px-4, computava display block,
max-width none, margin-left 0px e padding-left 0px;
o cabeçalho computava fundo transparente e texto preto, em vez de mata com pedra;
13 dos 14 HTMLs pré-renderizados referenciavam esse mesmo CSS — o 14º é o
_global-error interno do Next, que não usa o layout raiz. O defeito era do site inteiro,
não da Home;
as três variáveis de fonte continuavam funcionando porque vêm de next/font, aplicadas por
classe no <html>, e não do @theme. Foi por isso que o problema passou despercebido: a
tipografia parecia certa.

Correção:

Criado postcss.config.mjs na raiz, no formato que o Next 16 documenta em
node_modules/next/dist/docs/01-app/01-getting-started/11-css.md:

export default { plugins: { "@tailwindcss/postcss": {} } };

Foi a única alteração. Nenhuma dependência instalada, nenhum valor de token trocado,
nenhuma fonte alterada, nenhum componente existente tocado, nenhuma migração,
nenhum acesso a banco. typedRoutes permanece.

tokens.css não precisou de mudança:

O Tailwind 4 emite as variáveis de @theme que alguma coisa referencia — o próprio CSS,
uma utilidade gerada ou o texto dos arquivos-fonte varridos, o que inclui
style={{ ... var(--token) }}. Verificado por correlação: --radius-ficha, com 11
referências no código, é emitido; --largura-leitura, usada só em style de dois
componentes, é emitida; --color-mata-claro e --largura-conteudo, que nada no projeto
referencia, ficam de fora. Passam a ser emitidos assim que alguém os usar. @theme static
não é necessário, e a frase em contrário da seção 18 está corrigida lá.

Impacto medido, antes e depois:

CSS gerado: 9.110 → 17.529 bytes, um arquivo em ambos os casos;
variáveis em :root: 0 → 48, com os valores idênticos aos de tokens.css — mata #12301f,
pedra-fundo #f2f1ec, pedra-borda #d3d0c6, largura-leitura 68ch, radius-ficha 2px;
utilidades e preflight: ausentes → presentes;
aviso do Turbopack sobre @theme: 1 → 0;
runtime: cabeçalho passou a rgb(18, 48, 31), corpo a rgb(242, 241, 236), ficha a fundo
branco com borda rgb(211, 208, 198), h1 em Archivo;
rotas: 16 rotas, todas estáticas, iguais antes e depois; /dev/estilos passou a mostrar a
paleta de verdade.

Consequência que precisa de decisão:

Com o Tailwind ativo, o preflight zera cor e sublinhado de <a>, e cada componente passa a
declarar os seus. Medido no build servido: os três links de not-found.tsx e o link
"Versão imprimível" da Sala do Avaliador saem em rgb(23, 26, 23), a mesma tinta do texto,
sem sublinhado. O link /anexos.json tem a cor de link, mas sem sublinhado, e a razão de
contraste entre --color-link e --color-texto é de cerca de 1,5:1 — a WCAG 1.4.1 pede 3:1
para diferenciar só por cor. Os componentes da Home já sublinham os seus links. Corrigir
os demais exige alterar componentes existentes, fora do escopo desta rodada. Aguarda
decisão.

Verificação:

pnpm tipos — passou;
pnpm lint — passou, 60 arquivos, com os quatro avisos preexistentes de !important em
tokens.css;
pnpm teste — passou, 82 testes;
pnpm build — passou, sem aviso de CSS, 16 rotas estáticas;
pnpm a11y — passou, 8 testes.

pnpm pendencias continua não executado: depende de DATABASE_URL, e o banco segue
desconectado.

Arquivos criados:

postcss.config.mjs

Arquivos alterados:

ESTADO_PROJETO_2026-09-01.md
ESTADO_COMPLETO_PROJETO.md

Observação sobre a documentação:

ESTADO_COMPLETO_PROJETO.md foi editado fora desta sessão entre a Tarefa 10A e esta
auditoria. A tabela de tarefas, a seção 11 e o histórico passaram a descrever a Home como
"candidata não commitada, não produzida nem validada por esta rodada", enquanto a seção 7
continuava descrevendo os componentes como implementados. O documento ficou inconsistente
consigo mesmo. As três passagens foram reconciliadas com o que de fato aconteceu: a 10A
foi implementada e validada nesta sessão, com autorização direta do responsável, e ainda
não foi commitada.

Próximo passo:

Aguardar aprovação do responsável. A Tarefa 10B não foi iniciada.

20. Estabilização da Tarefa 10A — links e foco — 2026-09-02

Status:

CONCLUÍDA. A Tarefa 10B não foi iniciada.

Motivo:

Com o Tailwind finalmente ativo (seção 19), o preflight passou a zerar cor e sublinhado
de <a>. Antes, o estilo padrão do navegador dava azul e sublinhado a todo link, e isso
escondia o fato de que vários componentes nunca declararam os seus. O defeito não é
estético: link identificado só por cor contraria a WCAG 1.4.1, e a distância entre
--color-link e --color-texto é de cerca de 1,5:1, contra os 3:1 exigidos.

Links corrigidos — sublinhado somado à cor de link já existente:

src/app/not-found.tsx — os três caminhos, que saíam na mesma tinta do texto, sem
sublinhado;
src/app/prestacao-de-contas/page.tsx — "Baixar tudo (.zip)", "/anexos.json" e "Versão
imprimível"; a última também não tinha cor;
src/componentes/acervo/TabelaAnexos.tsx — "Baixar" e "Origem";
src/app/error.tsx — "Ir para a Sala do Avaliador", que também não tinha cor;
src/app/dev/estilos/page.tsx — o link interno de âncora.

Foco corrigido:

O contorno de foco vem de tokens.css como outline 3px solid var(--color-foco), que é
anil. Sobre o mata do cabeçalho e do rodapé isso dá cerca de 1,25:1 — o indicador some
justamente onde quem navega por teclado precisa dele, contra os 3:1 da WCAG 1.4.11.
Cabecalho.tsx, Rodape.tsx e MenuMobile.tsx passaram a levar
focus-visible:outline-destaque, que é o milho já existente: 7,4:1 sobre mata, valor já
registrado na tabela de contraste de tokens.css.

O que NÃO foi feito:

nenhum valor de token alterado; tokens.css não foi tocado;
nenhuma cor, fonte, logo ou paleta nova;
nenhum redesign, nenhuma mudança de layout ou de hierarquia;
nenhum conteúdo novo da Home;
cabeçalho e rodapé não passaram a sublinhar os seus links: são landmarks de navegação em
que todo item é link, não blocos de texto com link no meio. A correção deles era o foco,
não o sublinhado.

Teste criado:

testes/a11y/links.spec.ts, com cinco casos. Quatro varrem /, /prestacao-de-contas,
/prestacao-de-contas/imprimir e uma rota inexistente, e falham se algum link dentro de
main ficar sem sublinhado e sem preenchimento de fundo — o segundo caso cobre a chamada
principal da Home, que se distingue pela forma. O quinto navega por Tab até o cabeçalho e
exige o contorno de foco em milho.

Detalhe do teste que vale registrar: :focus-visible não é ativado por element.focus() em
link no Chromium. O teste usa Tab de verdade. Uma primeira versão usava focus()
programático e media o estado errado.

Cobertura que falta:

os links "Baixar" e "Origem" da tabela de anexos não são exercidos pelo teste, porque sem
DATABASE_URL a lista vem vazia e a tabela cai no estado vazio. A correção deles foi feita
e conferida por leitura.

Impacto medido:

CSS gerado: 17.529 → 17.952 bytes, pelas duas utilidades novas;
nenhuma rota mudou: 16 rotas, todas estáticas.

Arquivos alterados:

src/app/not-found.tsx
src/app/error.tsx
src/app/prestacao-de-contas/page.tsx
src/app/dev/estilos/page.tsx
src/componentes/acervo/TabelaAnexos.tsx
src/componentes/layout/Cabecalho.tsx
src/componentes/layout/Rodape.tsx
src/componentes/layout/MenuMobile.tsx
ESTADO_PROJETO_2026-09-01.md
ESTADO_COMPLETO_PROJETO.md

Arquivo criado:

testes/a11y/links.spec.ts

Sobre o ESTADO_COMPLETO_PROJETO.md:

A reconciliação pedida nesta rodada já havia sido feita na anterior, e o documento não
mudou desde então. Ele registra hoje: Tarefa 10A implementada e validada, componentes e
testes criados, nada commitado, Tarefa 10B não iniciada.

O responsável confirmou nesta sessão que a edição externa detectada entre a 10A e a
auditoria NÃO foi intencional. A reconciliação fica mantida. A redação externa, que
descrevia a Home como "candidata não commitada, não produzida nem validada por esta
rodada", não corresponde ao que aconteceu e não deve ser restaurada.

Verificação:

pnpm tipos — passou;
pnpm lint — passou, 61 arquivos, com os quatro avisos preexistentes de !important em
tokens.css;
pnpm teste — passou, 82 testes;
pnpm build — passou, sem aviso;
pnpm a11y — passou, 13 testes.

Próximo passo:

Aguardar aprovação do responsável. A Tarefa 10B não foi iniciada.

21. Tarefa 10B.1 — Fundação da experiência territorial — 2026-09-03

Status:

CONCLUÍDA. A Tarefa 10B foi iniciada. A etapa 10B.2 não foi iniciada.

Confirmações exigidas antes de mexer em código:

Tarefa 10A concluída — seções 18 e 20;
Tarefa 10B iniciada nesta sessão, por instrução direta do responsável;
nenhum bloqueio editorial foi removido: texto institucional, indicadores,
comparativo municipal, imagens, logos, créditos e MDX continuam bloqueados.

Documentos lidos:

docs/direcao-visual/10B.0_Documento_de_Direcao_Visual_v1.1.md
docs/direcao-visual/10B.0_v1.2_Decisoes_Tecnicas_de_Implementacao.md
docs/direcao-visual/10B.0_v1.3_Especificacao_de_Implementacao_da_Home.md

Os nomes reais desses arquivos diferem dos citados na instrução da sessão
(10B.0-direcao-visual-v1.1.md e afins). São os mesmos documentos.

Arquivos criados:

src/dados/territorio/tipos.ts
src/componentes/mapa/MapaTerritorio.tsx
src/componentes/mapa/Municipio.tsx
src/componentes/mapa/MarcadorVisita.tsx
src/componentes/mapa/FichaMunicipio.tsx
src/componentes/institucional/CreditosInstitucionais.tsx
public/media/LEIA-ME.md
public/media/{logos,mapa,territorio,campo,pessoas}/.gitkeep
testes/territorio.test.ts

Arquivos alterados:

ESTADO_PROJETO_2026-09-01.md
ESTADO_COMPLETO_PROJETO.md — apenas a linha de estado da Tarefa 10 e o histórico

A Home não foi tocada. src/app/page.tsx está igual ao fim da Tarefa 10A.

Decisões tomadas, e por quê:

1. Local dos componentes. A instrução da sessão pede src/componentes/mapa/ e
src/componentes/institucional/. Os documentos 10B.0 v1.1 §7 e v1.3 §5 previam
MapaTerritorio, FichaMunicipio e CreditosInstitucionais dentro de
src/componentes/home/. Seguiu-se a instrução humana, que está acima da
documentação na hierarquia. A divergência fica registrada: se a intenção era o
layout dos documentos, é uma movimentação de arquivo, não uma reescrita.

2. Município tem um campo além dos quatro pedidos: pesquisado. A instrução
listou id, nome, geometria e informações. Os documentos v1.1 §4 e v1.3 §8
exigem distinguir visualmente o município pesquisado do que aparece só como
contexto, e o exemplo de GeoJSON do v1.1 traz "pesquisado": true. É campo de
contrato; nenhum município foi declarado.

3. O tipo do ponto de visita ficou string | null, e não uma união fechada. O
doc 01 §5 tipifica equipamento como ecoparque, museu, comunidade ou rota; o
10B.0 v1.2 §8 exemplifica "natureza". Os dois divergem. Fechar a união agora
seria classificar lugares reais por conta própria — decisão de pesquisa, não de
código.

4. As chaves da geometria GeoJSON ficaram em inglês: type e coordinates, como
manda o RFC 7946. É formato padronizado, não vocabulário de domínio; traduzir
obrigaria a converter todo arquivo antes de ler.

5. A ficha do município usa <a>, não <Link>. O endereço vem do dado e não é
conhecido em tempo de compilação; com typedRoutes, um <Link> exigiria
as Route — asserção que a preparação da Tarefa 10 proibiu por anular a
checagem.

6. public/media tem .gitkeep em cada pasta. Git não versiona pasta vazia: sem
isso a estrutura não existiria para mais ninguém. Junto foi criado
public/media/LEIA-ME.md com as regras de uso — só imagem real do projeto, alt e
crédito obrigatórios, consentimento para pessoa identificável, logos dependentes
do manual E02, formato WebP/AVIF. Atenção: tudo em public/ é servido, então esse
arquivo fica acessível em /media/LEIA-ME.md. Nada sensível, mas se preferir que
não seja publicado, ele muda de lugar.

7. Os créditos usam <img>, não next/image. next/image exige width e height, e
dimensão e proporção de marca saem do manual de aplicação — hoje pendente.
Estimar seria inventar.

8. Os componentes devolvem null enquanto não houver dado aprovado, em vez de
renderizar caixa vazia. MapaTerritorio, quando receber municípios, monta a
alternativa textual ao mapa — exigida por v1.1 §12 e v1.3 §15 — e nada mais.
Nenhum SVG, nenhum D3, nenhum GeoJSON foi criado.

O que NÃO foi feito, por não ser desta etapa:

mapa, SVG, D3, GeoJSON;
fotografias, logos, ilustrações;
animação;
alteração de cor, fonte, token ou identidade;
banco, migração, consulta, indicador, MDX;
integração de qualquer componente novo na Home.

Avaliação da integração futura com a Home (item 6 da instrução):

src/app/page.tsx precisará receber, na ordem prevista por v1.3 §4: mapa
territorial depois da apresentação, caderno de campo, e créditos institucionais
antes do rodapé. Três observações para a 10B.2:

a) a Home é Server Component e assim permanece; o mapa entra como Server
Component que carrega os dados e delega só a interação a um Client Component
isolado;
b) cada seção nova precisa de um título aprovado. MapaTerritorio de propósito
não renderiza <section> nem cabeçalho: quem integrar decide o enquadramento, e
esse texto ainda não existe;
c) enquanto não houver dado aprovado, os componentes devolvem null e a Home não
muda — a integração pode ser feita antes dos dados sem produzir bloco vazio.

Pendência técnica registrada:

O contrato do projeto exige validar entrada externa com Zod, e um .geojson lido
do disco é entrada externa. zod não está instalado e esta etapa não autoriza
dependência nova. A validação entra na 10B.2, junto com os arquivos de dados, e
depende de autorizar o pacote.

Verificação:

pnpm tipos — passou;
pnpm lint — passou, 68 arquivos, com os quatro avisos preexistentes de
!important em tokens.css;
pnpm teste — passou, 90 testes, 8 novos;
pnpm build — passou, 16 rotas, todas estáticas;
pnpm a11y — passou, 13 testes.

O CSS gerado continua em 17.952 bytes, igual ao da rodada anterior: os
componentes novos não são renderizados por nenhuma rota, então a etapa não teve
impacto visual nenhum.

Testes criados:

testes/territorio.test.ts, com oito casos. Cinco verificam que os componentes
somem sem dado aprovado e montam estrutura quando recebem dado. Três verificam
que não existe dado territorial inventado no repositório: src/dados/territorio
só contém tipos.ts, public/ não contém nenhum arquivo de mídia ou GeoJSON, e as
cinco pastas previstas existem. Esse terceiro grupo é o que mais importa — a
estrutura foi criada para receber mapa, fotos e logos depois, e o risco real é
alguém preenchê-la com exemplo para "ver funcionando".

Estado do mapa e da identidade:

O mapa aguarda dados reais: GeoJSON de Sergipe e do Vale do Rio Real,
coordenadas conferidas dos pontos de visita e decisão sobre o vocabulário de
tipo. A identidade visual aguarda aprovação: paleta final, fontes finais,
aplicação das logos, estilo das ilustrações e conteúdo institucional continuam
bloqueados, conforme 10B.0 v1.1 §14.

Próximo passo:

Aguardar aprovação. A Tarefa 10B.2 não foi iniciada.

22. Tarefa 10B.2 — Preparação dos dados territoriais — 2026-09-03

Status:

EM PREPARAÇÃO. A estrutura, a procedência e os testes estão prontos. Os arquivos
de dado NÃO foram obtidos: falta autorização. O mapa aguarda dados territoriais
reais.

A Tarefa 10B.1 permanece concluída (seção 21).

Fonte oficial identificada e verificada:

IBGE — API de malhas territoriais, versão 4. Verificada em 2026-09-03 por
requisição de leitura, sem gravar nada no repositório:

GET servicodados.ibge.gov.br/api/v4/malhas/estados/28
    ?formato=application/vnd.geo+json&qualidade=minima
→ 200, application/vnd.geo+json, cerca de 1,6 kB, FeatureCollection com um
  feature e properties { "codarea": "28" }

o mesmo endereço com &intrarregiao=municipio
→ 200, cerca de 34 kB, FeatureCollection com 75 features — o total de
  municípios de Sergipe —, cada um com o código do município em codarea

A malha não traz o nome do município, só o código. O nome vem da API de
localidades, cruzado pelo código:

GET servicodados.ibge.gov.br/api/v1/localidades/estados/SE/municipios

Códigos conferidos nessa API na mesma data, não escritos de memória:

Tobias Barreto 2807402
Itabaianinha 2803005
São Cristóvão 2806701

Arquivos criados:

src/dados/territorio/fontes.ts
src/dados/territorio/LEIA-ME.md

Arquivos alterados:

src/dados/territorio/tipos.ts — acrescentados FeatureGeoJson e
ColecaoDeFeatures, que descrevem exatamente o que a API do IBGE devolve
testes/territorio.test.ts — de 8 para 15 casos
ESTADO_PROJETO_2026-09-01.md
ESTADO_COMPLETO_PROJETO.md

Nenhum arquivo .geojson ou .json de dado foi criado. Nenhuma imagem. A Home não
foi tocada. Nenhuma dependência instalada.

Decisão principal, e por que ela ficou com o responsável:

Os arquivos existem e estão a uma requisição de distância. Não foram baixados
porque isso introduz artefato externo no repositório, e três coisas precisam de
decisão humana antes:

1. autorização para trazer dado externo, com a licença e a forma de atribuição
que o IBGE exige registradas em fontes.ts;
2. quais municípios formam o recorte do Vale do Rio Real. A malha devolve os 75
municípios de Sergipe; o recorte é definição territorial de pesquisa e não foi
encontrado em fonte aprovada. Vale notar que São Cristóvão aparece na
documentação como município de comparação, não como parte do Vale — recorte e
lista de comparação não são a mesma coisa, e escolher errado aqui é afirmação
territorial falsa;
3. qual qualidade de malha usar: minima, intermediaria ou maxima. É troca entre
precisão do contorno e peso da página.

Outras pendências registradas em src/dados/territorio/LEIA-ME.md:

vocabulário de tipo dos pontos de visita — doc 01 §5 usa ecoparque, museu,
comunidade e rota; 10B.0 v1.2 §8 exemplifica "natureza";
município de cada ponto — a documentação liga Recanto da Serra e Museu Borda da
Mata a Tobias Barreto; Serra dos Macacos e Ilha Grande não têm município
declarado;
coordenadas, que dependem de conferência em campo ou de documento do projeto,
nunca de estimativa sobre mapa;
zod não instalado, então o .geojson lido do disco ainda não tem validação de
entrada. Precisa entrar junto com o primeiro arquivo de dado.

Sobre os códigos do IBGE em fontes.ts:

São identificadores, não indicadores. Servem para casar um feature da malha com
o município certo. Não há número de pesquisa, comparação, nem afirmação sobre o
que foi pesquisado em cada município. Se ainda assim a preferência for não ter
nenhum número no código antes da autorização, a lista sai em uma linha.

Testes:

testes/territorio.test.ts passou de 8 para 15 casos. Os três mais importantes
são novos e passam hoje por vacuidade, de propósito: todo arquivo de dado
presente na pasta precisa estar declarado em fontes.ts e ter origem, data,
licença e SHA-256 preenchidos. No momento em que alguém trouxer o primeiro
arquivo sem procedência, o gate falha. É a mesma disciplina que a Sala do
Avaliador aplica aos anexos.

Os outros novos verificam a estrutura: os três municípios estão identificados,
cada código tem sete dígitos e começa por 28, os quatro locais previstos estão
listados, e o contrato representa municípios e pontos sem que nada precise ser
inventado — geometria, coordenada, foto e descrição ficam null.

Verificação:

pnpm tipos — passou;
pnpm lint — passou, 69 arquivos, com os quatro avisos preexistentes de
!important em tokens.css;
pnpm teste — passou, 97 testes;
pnpm build — passou, 16 rotas, todas estáticas;
pnpm a11y — passou, 13 testes.

O CSS gerado continua em 17.952 bytes. A etapa não teve impacto visual nenhum.

Próximo passo:

Aguardar decisão sobre baixar ou não os arquivos do IBGE, sobre o recorte do
Vale do Rio Real e sobre a qualidade da malha. A Tarefa 10B.3 não foi iniciada.

23. Tarefa 10B.2.1 — Consolidação territorial e modelo de camadas — 2026-09-03

Status:

CONCLUÍDA. A Tarefa 10B.2 fica CONCLUÍDA com esta consolidação. A definição
territorial está aprovada. A Tarefa 10B.3 — implementação do mapa — aguarda
aprovação.

Definições fornecidas pelo responsável nesta data:

Vale do Rio Real é uma região socioeconômica associada ao curso superior e médio
do rio Real, e não uma divisão administrativa oficial. O projeto não cria
divisão geográfica nova: destaca os municípios do recorte que utiliza.

Municípios do recorte: Tobias Barreto, Tomar do Geru, Itabaianinha,
Cristinápolis e Poço Verde.

São Cristóvão entra como município de referência e comparação de políticas
públicas, não como município do Vale.

A camada base do mapa são os 75 municípios de Sergipe, todos com fronteira
oficial e todos como objetos individuais. Não pode faltar município.

Malha do IBGE em qualidade intermediária.

Mudança no modelo de dados:

O booleano pesquisado saiu do contrato. No lugar entrou
relacoesTerritoriais: readonly RelacaoTerritorial[], com três camadas
independentes: vale-rio-real, pesquisa-campo e comparacao.

O motivo é concreto, não estilístico: pertencimento territorial e pesquisa de
campo não são a mesma coisa. Um único booleano forçava as duas a serem, e a
primeira consequência prática seria pintar São Cristóvão como se fosse Vale do
Rio Real. Acrescentar uma camada nova passa a ser acrescentar um membro à
união, sem tocar no formato do município. Município sem vínculo carrega lista
vazia — o que é informação, não lacuna: município de Sergipe, sem vínculo
declarado com a pesquisa.

Códigos do IBGE conferidos nesta data contra a API de localidades, não escritos
de memória. A API devolve exatamente 75 municípios para Sergipe, o que confirma
o total da camada base:

Tobias Barreto 2807402
Tomar do Geru 2807501
Itabaianinha 2803005
Cristinápolis 2801702
Poço Verde 2805505
São Cristóvão 2806701

São identificadores técnicos: casam o município com o feature certo da malha,
onde ele aparece em properties.codarea. Não são indicadores, não são métricas e
não medem nada.

Malha: medição que sustenta a escolha da qualidade intermediária.

Medido em 2026-09-03, para a malha por município de Sergipe:

qualidade minima ......... 34.077 bytes
qualidade intermediaria .. 92.720 bytes, 20.039 com gzip
qualidade maxima ......... 432.106 bytes

Os cerca de 20 kB que efetivamente trafegam cabem com folga no orçamento de
500 kB da Home do doc 01 §7 — o que importa para o público rural e escolar em
rede fraca.

Consequência na lista de arquivos de dado:

O Vale do Rio Real deixou de ser um arquivo de geometria e passou a ser uma
relação sobre a camada base. Não existe mais vale-rio-real.geojson. A lista
passou a ser:

municipios-sergipe.geojson — os 75 municípios, fronteira oficial;
municipios-sergipe-nomes.json — código e nome dos 75;
sergipe.geojson — contorno externo do estado, opcional;
pontos-visita.json — pontos de campo, ainda sem fonte.

O segundo arquivo é necessário porque a malha do IBGE traz apenas
properties.codarea, sem nome de município. Sem ele a camada base não tem como
rotular município nenhum. Isso foi descoberto por inspeção da resposta real da
API, não por suposição.

Arquivos criados:

src/dados/territorio/recorte.ts
src/componentes/mapa/rotulos.ts
docs/direcao-visual/10B.2.1_Consolidacao_Territorial_e_Camadas.md

Arquivos alterados:

src/dados/territorio/tipos.ts — relacoesTerritoriais no lugar de pesquisado
src/dados/territorio/fontes.ts — quatro fontes, qualidade intermediária; a
identificação dos municípios saiu daqui para recorte.ts, para o arquivo voltar a
ser só procedência
src/dados/territorio/LEIA-ME.md — modelo de camadas e medições
src/componentes/mapa/Municipio.tsx e FichaMunicipio.tsx — passam a mostrar as
camadas, não um estado único
testes/territorio.test.ts — de 15 para 19 casos
docs/direcao-visual/README.md — índice e regra de precedência
docs/direcao-visual/10B.0_*.md — uma linha em cada um, marcando os trechos
superados pela consolidação
ESTADO_PROJETO_2026-09-01.md
ESTADO_COMPLETO_PROJETO.md

Sobre marcar os documentos aprovados:

Foi acrescentada uma única linha no topo das seções superadas de v1.1 §4,
v1.2 §6 e v1.3 §7, apontando para a consolidação. Nada foi reescrito nem
apagado. A razão é a lição que o próprio projeto já registrou no doc 03 §4:
duas versões da mesma lista divergem, e num projeto operado por agentes a
versão errada é obedecida sem ninguém perceber. Deixar v1.2 §6 pedindo
vale-rio-real.geojson sem aviso reproduziria exatamente esse erro.

Testes:

De 15 para 19 casos. Os novos verificam que o Vale tem exatamente os cinco
municípios definidos; que São Cristóvão é comparação e nunca vale-rio-real —
esse existe para impedir a afirmação territorial falsa; que nenhum município
aparece duas vezes; e que a camada pesquisa-campo continua sem atribuição.
Permanecem os gates de procedência: arquivo de dado sem origem, data, licença e
SHA-256 reprova.

Pendências:

autorização para baixar os arquivos do IBGE, com licença e forma de atribuição;
atribuição da camada pesquisa-campo aos municípios — quais foram objeto de
pesquisa de campo ainda não foi declarado;
município de Serra dos Macacos e de Ilha Grande — a documentação só liga
Recanto da Serra e Museu Borda da Mata a Tobias Barreto;
coordenadas dos pontos de visita;
vocabulário de tipo dos pontos — doc 01 §5 e 10B.0 v1.2 §8 divergem;
zod não instalado. Registrado como pendência para quando houver ingestão real de
arquivo externo: sem validação de entrada, um .geojson truncado ou com geometria
inesperada quebra a renderização em silêncio.

Verificação:

pnpm tipos — passou;
pnpm lint — passou, 71 arquivos, com os quatro avisos preexistentes de
!important em tokens.css;
pnpm teste — passou, 101 testes;
pnpm build — passou, 16 rotas, todas estáticas;
pnpm a11y — passou, 13 testes.

O CSS gerado continua em 17.952 bytes. A etapa não teve impacto visual nenhum, e
a Home não foi tocada.

Próximo passo:

Aguardar aprovação para implementar o mapa. A Tarefa 10B.3 não foi iniciada.

24. Tarefa 10B.2.2 — Consolidação da pesquisa de campo — 2026-09-03

Status:

CONCLUÍDA. A Tarefa 10B.3 — implementação do mapa — não foi iniciada.

Evidências fornecidas pelo responsável nesta data, e o que foi registrado:

Tobias Barreto ganhou pesquisa-campo, com quatro evidências: entrevista na
Secretaria de Cultura, entrevista na Prefeitura, Centro Cultural e Museu Borda
da Mata, e Recanto da Serra. Continua no Vale.

Tomar do Geru ganhou pesquisa-campo, com uma evidência: entrevista na
Secretaria Municipal de Cultura. Continua no Vale.

São Cristóvão passou a acumular pesquisa-campo e comparacao, por causa das
entrevistas com a Fundação de Cultura e Turismo. Não é município do Vale, e
segue com teste impedindo que vire.

Itabaianinha, Cristinápolis e Poço Verde permanecem só com vale-rio-real. Não
há evidência de pesquisa de campo neles entre as fornecidas, e ausência de
evidência foi registrada como ausência — não preenchida por simetria com os
vizinhos.

O modelo aprovado foi mantido: relacoesTerritoriais com vale-rio-real,
pesquisa-campo e comparacao. Nenhum retorno ao campo booleano.

Decisão de modelagem: evidência junto da afirmação.

Foi acrescentado evidenciasDePesquisa ao registro de cada município, com o
texto fornecido pelo responsável. A razão é a natureza do site: afirmar que um
município foi pesquisado é afirmação verificável, e ou há entrevista e visita
por trás, ou não há. Um teste garante que relação e evidência andam juntas —
não é possível acrescentar pesquisa-campo sem acrescentar por quê, nem esvaziar
a evidência mantendo a afirmação.

As entrevistas ainda não existem como entidade publicada; isso é da Fase 3.
Quando existirem, estas linhas viram referências a elas.

Pontos de visita:

Criado src/dados/territorio/pontos.ts com os quatro pontos, só com o que está
declarado. Os identificadores são os slugs que o doc 01 §3 já fixou em
/equipamentos/[slug] — recanto-da-serra, borda-da-mata, serra-dos-macacos e
ilha-grande —, e não foram inventados aqui: mantê-los iguais é o que permitirá
ligar ponto do mapa e página do equipamento sem tabela de tradução.

Recanto da Serra e Centro Cultural e Museu Borda da Mata ficaram em Tobias
Barreto, que é o que a documentação declara. Serra dos Macacos e Ilha Grande
ficaram sem município.

Sobre Serra dos Macacos: a instrução proibiu explicitamente inventar o município
de Ilha Grande, e não mencionou este. A situação documental dos dois é a mesma —
nenhum documento lido os associa a um município —, então a resposta foi a mesma.
Se houver fonte para Serra dos Macacos, basta informar.

Tipo, coordenada, fotografia e descrição continuam null nos quatro. Coordenada
não sai de estimativa sobre mapa: marcador no lugar errado, num site de
prestação de contas, é afirmação falsa sobre onde a pesquisa esteve.

Mudança de contrato:

PontoDeVisita.municipioId passou de string para string | null. Era necessário:
com o campo obrigatório, os dois pontos sem município exigiriam um valor
inventado ou uma string vazia fingindo de ausência.

Pendência que isso abre para a 10B.3, registrada no código e na documentação:

A alternativa textual do mapa é organizada por município, então ponto com
município nulo não aparece nela. Hoje isso não perde nada, porque o componente
não é renderizado por nenhuma rota. Mas o mapa vai precisar de um lugar para
"pontos sem município declarado" — sumir com dado em silêncio é o oposto do que
este site faz. É decisão de apresentação, que não cabia numa etapa de dados.

Arquivos criados:

src/dados/territorio/pontos.ts

Arquivos alterados:

src/dados/territorio/tipos.ts — municipioId aceita null
src/dados/territorio/recorte.ts — relações atualizadas e evidenciasDePesquisa;
a lista de nomes de locais saiu daqui para pontos.ts
src/dados/territorio/LEIA-ME.md — pesquisa de campo consolidada e pendências
src/componentes/mapa/MapaTerritorio.tsx — comentário registrando a pendência
dos pontos sem município; nenhuma mudança de comportamento
testes/territorio.test.ts — de 19 para 23 casos
docs/direcao-visual/10B.2.1_Consolidacao_Territorial_e_Camadas.md — passou a
v1.1, com a tabela de municípios pesquisados e de comparação e a tabela de
pontos com as pendências
ESTADO_PROJETO_2026-09-01.md
ESTADO_COMPLETO_PROJETO.md

Nenhum mapa, nenhum SVG, nenhum GeoJSON baixado, nenhuma dependência instalada,
nenhum componente visual novo. A Home não foi tocada.

Testes:

De 19 para 23 casos. Os quatro novos: a camada de pesquisa tem exatamente
Tobias Barreto, Tomar do Geru e São Cristóvão; relação e evidência andam juntas
em todo município; recorte e pesquisa continuam camadas independentes, com os
três do Vale sem pesquisa de um lado e São Cristóvão pesquisado fora do Vale do
outro; e ponto sem município declarado continua sem município — esse existe para
impedir que alguém "resolva" a lacuna por dedução. Também passou a valer que
todo ponto com município aponta para município que existe no recorte.

Verificação:

pnpm tipos — passou;
pnpm lint — passou, 72 arquivos, com os quatro avisos preexistentes de
!important em tokens.css;
pnpm teste — passou, 105 testes;
pnpm build — passou, 16 rotas, todas estáticas;
pnpm a11y — passou, 13 testes.

O CSS gerado continua em 17.952 bytes. A etapa não teve impacto visual nenhum.

Pendências para a 10B.3:

autorização para baixar os arquivos do IBGE, com licença e forma de atribuição;
município de Serra dos Macacos e de Ilha Grande;
apresentação dos pontos sem município no mapa;
coordenadas dos pontos de visita;
vocabulário de tipo dos pontos — doc 01 §5 e 10B.0 v1.2 §8 divergem;
zod não instalado, pendente para a ingestão real de arquivo externo.

Próximo passo:

Aguardar aprovação para implementar o mapa. A Tarefa 10B.3 não foi iniciada.

25. Tarefa 10B.3.0 — Decisão técnica do mapa interativo — 2026-09-03

Status:

CONCLUÍDA. Rodada de documentação apenas. Nada foi instalado, baixado, criado ou
alterado em código. A implementação do mapa não foi iniciada.

Decisão registrada:

MapLibre GL JS, em ADR-009-biblioteca-do-mapa-territorial.md.

Onde foi registrada, e por quê:

Em docs/decisoes/, não em docs/direcao-visual/. O projeto já tem convenção de
ADR, com modelo próprio e oito decisões anteriores, e esta é exatamente uma
decisão de arquitetura que substitui outra. Colocá-la no lugar certo é o que
mantém a lista de decisões técnicas em um só lugar.

O que a decisão substitui:

O documento 10B.0 v1.2 §5, aprovado horas antes, escolhia D3 + SVG; o §2 listava
Mapbox e Leaflet como "não utilizar inicialmente"; o v1.3 §7 repetia a escolha.
Os três trechos foram marcados apontando para a ADR-009. Nada foi reescrito nem
apagado.

Observação registrada na própria ADR: MapLibre GL JS é um fork do Mapbox GL JS,
com licença BSD-3-Clause e auto-hospedado. Dois dos três motivos que excluíam o
Mapbox — dependência de serviço externo e custo futuro — deixam de valer desde
que nenhuma fonte de tiles externa seja configurada. O terceiro, aparência de
mapa comercial, continua sob controle do projeto, porque o estilo é nosso.

Fatos verificados antes de escrever, não de memória:

no registro do npm, maplibre-gl está na versão 6.7.0, licença BSD-3-Clause, com
17 dependências diretas e 19.848.054 bytes descompactados. Esse número é do
pacote publicado, não do que chega ao navegador — o custo real precisa ser
medido antes de instalar;

a partir da versão 5, o suporte a WebGL 1 foi removido: WebGL2 passou a ser
obrigatório.

Arquitetura registrada:

Server Component MapaTerritorio recebe dados, prepara propriedades e renderiza a
alternativa textual. Client Component isolado MapaInterativo inicializa o
MapLibre e cuida de hover, clique, zoom e estados visuais. O componente cliente
é folha da árvore, não raiz: a Home não vira Client Component.

Cinco camadas: base com todos os municípios de Sergipe, destaque do Vale,
pesquisa de campo, comparação e pontos. As quatro últimas são leitura de
relacoesTerritoriais e de PONTOS_DE_VISITA_PREVISTOS — não são arquivos de
geometria separados.

Interações: hover destaca o município; clique abre ficha com nome, relações,
evidências disponíveis e pontos relacionados. Sem número inventado: a ficha
mostra o que existe no dado e some quando não há.

Restrições que entraram na ADR como parte da decisão:

A biblioteca sozinha não protege os princípios do projeto. Seis condições ficam
amarradas à escolha:

1. estilo sem nenhuma fonte externa. É o ponto mais fácil de errar: quase todo
exemplo de MapLibre aponta para um estilo de demonstração hospedado, e adotá-lo
por descuido faria a Home chamar serviço de terceiro a cada visita — contra o
"sem rastreadores de terceiros" do doc 01 §7 e contra a independência de
serviços externos do v1.2 §1. É também o que garante o "não usar imagens de
mapa": sem tiles, não há imagem;
2. carregamento sob demanda, por importação dinâmica no cliente. A biblioteca
acessa window e não pode ser renderizada no servidor;
3. alternativa textual como caminho principal, não como cortesia. O mapa desenha
em canvas: é opaco para leitor de tela e não navegável por teclado;
4. toque, não só hover, em tela pequena;
5. prefers-reduced-motion respeitado, inclusive nas animações de câmera do
próprio MapLibre;
6. nenhum polígono próprio, nenhuma imagem de mapa.

Riscos registrados:

peso, contra o orçamento de Home abaixo de 500 kB e Lighthouse ≥ 90 em 3G do
doc 01 §7 — a biblioteca é ordens de grandeza maior que os ~20 kB de GeoJSON que
vai desenhar, e se estourar o orçamento a decisão volta à mesa;
WebGL2 obrigatório, num projeto cujo público é rural e escolar, com aparelhos
antigos;
canvas não acessível por si;
17 dependências diretas, num projeto que hoje tem nove dependências no total.

Arquivos criados:

docs/decisoes/ADR-009-biblioteca-do-mapa-territorial.md

Arquivos alterados:

docs/direcao-visual/10B.0_v1.2_Decisoes_Tecnicas_de_Implementacao.md — marcação
de substituição em §2 e §5
docs/direcao-visual/10B.0_v1.3_Especificacao_de_Implementacao_da_Home.md —
marcação de substituição no item Tecnologia do §7
docs/direcao-visual/README.md — ponteiro para a ADR-009 e regra de precedência
ESTADO_PROJETO_2026-09-01.md
ESTADO_COMPLETO_PROJETO.md

Nenhum arquivo de código foi tocado. package.json e pnpm-lock.yaml estão
intactos: as dependências continuam sendo as mesmas nove.

Verificação:

pnpm tipos — passou;
pnpm lint — passou, 72 arquivos, com os quatro avisos preexistentes de
!important em tokens.css;
pnpm teste — passou, 105 testes;
pnpm build — passou, 16 rotas, todas estáticas;
pnpm a11y — passou, 13 testes.

Pendências antes de implementar:

autorização explícita para instalar maplibre-gl. Esta etapa proibiu instalar, e
o contrato proíbe inventar nome ou versão de pacote: a instalação é
pnpm add maplibre-gl@latest, com a versão resultante registrada;
medir o peso real no navegador contra o orçamento do doc 01 §7;
autorização para baixar o GeoJSON do IBGE, com licença e atribuição;
onde o mapa mostra os pontos sem município declarado — hoje Serra dos Macacos e
Ilha Grande;
zod para validar o GeoJSON lido do disco, também pendente.

Próximo passo:

Aguardar aprovação. A implementação do mapa não foi iniciada.

26. Tarefas 10B.3.1 e 10B.3.2 — dados reais e auditoria de peso — 2026-09-03

Status:

10B.3.1 CONCLUÍDA. 10B.3.2 CONCLUÍDA como diagnóstico. A renderização do mapa
NÃO foi iniciada e aguarda decisão sobre o orçamento de peso.

A ADR-009 não foi revista: MapLibre segue valendo como hipótese de
implementação.

O que a 10B.3.1 entregou:

Dependências instaladas, com autorização: maplibre-gl 6.6.0 e zod 4.5.4.

Registro de divergência: a consulta ao registro do npm, feita na 10B.3.0,
anunciava 6.7.0 como latest; o pnpm add resolveu 6.6.0. A ADR foi corrigida
para a versão que de fato está no package.json.

Malha oficial baixada: municipios-sergipe.geojson, 92.720 bytes, SHA-256
a5fd01bff5670857f444a1f15a7a54daf3c4512a05a274de22fee12bfee2561b, 75 features,
uma por município, com o código em properties.codarea. Conferido: 75 códigos
únicos, todos começando por 28, e os seis municípios do recorte presentes.

Procedência registrada em fontes.ts, que ganhou o campo atribuicao: origem,
data de coleta, licença conhecida, atribuição e hash.

Camada de validação em src/dados/territorio/validacao.ts, com Zod. O esquema é
deliberadamente estrito e descreve o que o IBGE devolve hoje, conferido no
arquivo baixado: posição com exatamente duas coordenadas, anel linear fechado
com pelo menos quatro posições, codarea com sete dígitos. Além do formato, a
função confere completude: arquivo que passa no esquema mas traz 60 municípios
é arquivo errado, e essa é justamente a falha que passaria despercebida no mapa
desenhado.

Nenhum componente visual foi criado. A Home não foi tocada.

Testes: testes/territorio.test.ts foi de 23 para 34 casos. Os novos verificam os
75 municípios, o formato e a unicidade dos códigos, a presença dos seis do
recorte, a conferência do SHA-256 contra o arquivo em disco, e cinco casos de
recusa — malha incompleta, código repetido, anel aberto, codarea fora do
formato e arquivo que não é FeatureCollection. Esses cinco existem para provar
que a validação falha alto, e não em silêncio.

O que a 10B.3.2 mediu:

Peso da Home hoje, medido em build de produção servido, sem mapa nenhum:
378.412 bytes transferidos. Fontes 203.108, JavaScript 140.755, prefetch de
rotas 28.691, documento 4.357, CSS 4.985.

A Home já usa 76% do orçamento de 500 kB do doc 01 §7 antes de existir mapa. O
maior item não é JavaScript: são as fontes.

Custo do MapLibre, arquivos de produção do pacote instalado, comprimidos:
maplibre-gl.mjs 142.885, maplibre-gl-shared.mjs 135.788, css 10.599, worker
5.943. Total 295.215 bytes. O .mjs principal importa o shared, então os dois
carregam juntos.

Reduções auditadas:

Remover o subset latin-ext economiza 94.136 bytes, um quarto do peso da Home. E
aqui há um achado: o tokens.css afirma que latin-ext entra "por causa dos
diacríticos do português", e isso não se sustenta. As faixas Unicode do CSS
gerado mostram que a face latin cobre U+?? — isto é, U+0000 a U+00FF — e todos
os diacríticos do português vivem ali, entre U+00C0 e U+00FC. A face latin ainda
traz U+2000-206F, que cobre travessão, reticências e aspas tipográficas usadas
na copy. O latin-ext serve a línguas do Leste Europeu.

Trocar a Literata variável por peso estático 400 economiza 32.076 bytes: a
variável são 52.496 no subset latin, a estática 20.420.

Restringir os pesos do Archivo economiza zero. Verificado na API do Google
Fonts: pedir wght@400;600;700 e pedir wght@100..900 devolvem o mesmo arquivo de
34.928 bytes. Archivo é variável e não tem instância estática mais leve.

O prefetch dos oito destinos do menu custa 28.691 bytes por visita, para
páginas que hoje são stubs.

GeoJSON: pouco a ganhar. Minificado com três casas decimais cai de 19.977 para
15.641 bytes comprimidos, cerca de 4 kB. Duas casas não devem ser usadas: são
cerca de 1,1 km, o que distorce fronteira visivelmente. Só existe uma
propriedade por feature, codarea, e ela é a chave que liga o polígono ao
município. O ponto é que o GeoJSON não é o problema: ele são 20 kB, a
biblioteca são 295 kB.

Comparação dos três cenários, comprimidos, já com as reduções de fonte
aplicadas:

Cenário A, MapLibre imediato: 534 kB na primeira carga. Estoura o orçamento em
7% mesmo depois de todas as reduções.

Cenário B, MapLibre sob demanda: 224 kB na primeira carga, folgado, e mais
311 kB quando o visitante rola até o mapa. Total 534 kB. Em 3G simulado, os
311 kB são da ordem de seis segundos só para baixar a biblioteca. Detalhe que
anula o ganho se passar batido: o maplibre-gl.css precisa ser importado dentro
do chunk dinâmico, senão volta para o CSS inicial. Esta projeção não foi
medida, porque medir exigiria integrar o mapa, o que a etapa não autorizava.

Cenário C, SVG renderizado no servidor: 240 kB na primeira carga, 48% do
orçamento, sem JavaScript e sem WebGL. Medido de verdade, gerando a marcação a
partir do GeoJSON real: 75 caminhos, um por município, com uma casa decimal,
dão 48.486 bytes brutos e 16.529 comprimidos. Uma casa decimal é precisa: o
viewBox de 1000 unidades cobre cerca de 202 km, então 0,1 unidade equivale a
uns 20 metros.

O Cenário C preserva o que a tarefa pediu preservar: municípios clicáveis, cada
caminho dentro de um <a> do SVG, focável por teclado nativamente; destaque do
Vale resolvido no servidor a partir de relacoesTerritoriais, com realce em CSS;
marcadores posicionados pelas coordenadas quando elas existirem; e
acessibilidade real, porque funciona sem JavaScript e sem WebGL. Limitações:
sem zoom nem deslocamento, projeção fixa escolhida no build, os caminhos entram
no HTML e não num chunk adiado, e interação mais rica exigiria escrever o que a
biblioteca já traz pronto.

Pendência de licença, registrada sem assumir nada:

Licença/termos oficiais precisam ser confirmados antes da disponibilização
pública dos dados.

O que foi verificado: a API de malhas não publica termos de uso; a página de
dados abertos do IBGE respondeu HTTP 403 e um dos domínios de acesso à
informação não resolveu. O que está em fontes.ts é o que se pôde verificar —
dado público federal sob a Política de Dados Abertos do Executivo Federal,
Decreto nº 8.777/2016 — mais a atribuição "Fonte: IBGE — Malhas Territoriais,
malha municipal". A definição de pronto do doc 01 §11 exige licença declarada.

Atualização do Next, registrada:

A subida de 16.3.3 para 16.3.4, e de @types/node de 26.4.0 para 26.4.1, ocorreu
como efeito colateral do pnpm add: o package.json fixa "next": "latest", então
qualquer instalação re-resolve o framework. Compatibilidade verificada depois da
atualização: tipos, lint, teste, build e a11y passaram, com as 16 rotas
estáticas. Não fazer downgrade sem necessidade.

Efeito de fundo que vale decidir algum dia: com latest no package.json, o
pnpm-lock.yaml é a única garantia de reprodutibilidade, e qualquer pnpm add
futuro pode trazer versão nova de framework junto.

Arquivos criados:

src/dados/territorio/municipios-sergipe.geojson
src/dados/territorio/validacao.ts
docs/direcao-visual/10B.3.2_Auditoria_de_Performance_do_Mapa.md

Arquivos alterados:

package.json e pnpm-lock.yaml — maplibre-gl e zod; next e @types/node subiram
como efeito colateral
src/dados/territorio/fontes.ts — campo atribuicao e procedência completa da
malha
src/dados/territorio/LEIA-ME.md — pendência de licença na redação exigida
testes/territorio.test.ts — de 23 para 34 casos
docs/decisoes/ADR-009-biblioteca-do-mapa-territorial.md — só fatos: versão
instalada, ponteiro para a auditoria e estado das pendências. A decisão não foi
revista
docs/direcao-visual/README.md — índice
ESTADO_PROJETO_2026-09-01.md
ESTADO_COMPLETO_PROJETO.md

O que NÃO foi feito:

nenhuma redução da auditoria foi aplicada — nem fontes, nem prefetch, nem
GeoJSON;
nenhuma troca de biblioteca;
nenhum componente visual, nenhum SVG no repositório, nenhuma integração com a
Home;
nenhuma alteração de identidade visual, cor, fonte ou token.

Incidente durante esta rodada, e como foi resolvido:

O next-env.d.ts apareceu zerado — 296 bytes de NUL — e derrubou pnpm tipos com
"TS1127: Invalid character". Causa: encerrei processos do Next à força, com
Stop-Process, para liberar a porta 3000 entre as medições, e o arquivo estava
sendo gravado. Nada do repositório foi danificado: next-env.d.ts é gerado e está
no .gitignore. Foi apagado e o pnpm build o regerou.

Consequência secundária: o Next 16.3.4 gera esse arquivo com duas linhas novas
de import e, no Windows, com CRLF — o que fez o pnpm lint reprovar por
formatação num arquivo que o próprio Next declara que não deve ser editado. Foi
normalizado para LF, e verifiquei que o build não o reescreve enquanto o
conteúdo não mudar, então o gate ficou estável.

Fica registrado o que vai repetir: a cada atualização de Next que mude o
conteúdo esperado desse arquivo, ele é reescrito com CRLF no Windows e o lint
reprova até alguém normalizar. A correção durável é uma linha em biome.json,
acrescentando next-env.d.ts à lista de exclusões, junto de .next e node_modules.
Não foi feita: biome.json está fora do escopo desta auditoria.

Verificação, ao final:

pnpm tipos — passou;
pnpm lint — passou, 73 arquivos, com os quatro avisos preexistentes de
!important em tokens.css;
pnpm teste — passou, 116 testes;
pnpm build — passou, 16 rotas, todas estáticas;
pnpm a11y — passou, 13 testes.

Próximo passo:

Aguardar decisão sobre o orçamento de peso, entre os cenários A, B e C, e sobre
aplicar ou não as reduções de fonte e de prefetch. Nada será renderizado antes
disso.

27. Tarefa 10B.3.3 — mapa territorial em SVG no servidor — 2026-09-03

Status:

CONCLUÍDA E VALIDADA. O Cenário C foi implementado. A Home completa não foi
implementada, e a integração definitiva aguarda aprovação.

Decisão registrada:

ADR-010 — Mapa territorial em SVG renderizado no servidor.

A ADR-009 passou a "Substituída pela ADR-010", com o texto integralmente
preservado. Vale notar que a revisão só existiu porque a própria ADR-009 exigia
medir antes de implementar: a medição foi feita, o orçamento estourou, e a
decisão voltou à mesa como estava previsto.

O mapa, tecnicamente:

SVG renderizado no servidor a partir da malha oficial do IBGE. Zero JavaScript,
zero WebGL, nenhuma dependência de tiles ou serviço externo. Todos os
componentes são Server Components — nenhum "use client" foi criado.

Os 75 municípios de Sergipe, cada um com fronteira própria, código próprio,
geometria própria, id de destino próprio e nome acessível vindo da lista oficial
do IBGE.

Cada município é um <a> do SVG, focável por teclado, apontando para a entrada
dele na lista territorial da mesma página. Nenhuma URL fictícia: não existe
página de município aprovada, e o link não finge que existe. Um teste confere
que todos os 75 destinos existem de fato.

Estados: hover muda o preenchimento; focus-visible muda preenchimento, cor do
traço e espessura — três mudanças, não só cor; :target realça a entrada da lista
onde o link parou, que é o papel de "selecionado" resolvido sem script.

Camadas visuais, mapeamento aprovado pelo responsável nesta data, tudo em
tokens existentes:

base ............. preenchimento pedra, traço borda
Vale do Rio Real . preenchimento milho, traço mata
pesquisa de campo  hachura diagonal em mata, sobreposta
comparação ....... traço tracejado em anil

Os três canais são independentes, e é isso que faz o modelo de camadas
funcionar: Tobias Barreto lê como Vale e pesquisa; São Cristóvão lê como
pesquisa e comparação, sem preenchimento de Vale. Nenhuma camada depende só de
cor.

Título da seção: "Mapa vivo do território", do 10B.0 v1.1 §2, confirmado pelo
responsável. Nenhuma redação nova.

Arquitetura, com uma responsabilidade por arquivo:

validacao.ts ......... esquemas Zod, leitura da malha e dos nomes
projecao.ts .......... funções puras: envelope, escala, caminho d
mapa.ts .............. cruza malha, nomes e recorte em MunicipioDoMapa
identificacao.ts ..... id de destino e nome acessível, num lugar só
estilosDoMapa.ts ..... CSS escopado e classes por relação
MapaTerritorio.tsx ... o SVG e a alternativa textual
MunicipioNoMapa.tsx .. um <a> com <path>
MarcadorNoMapa.tsx ... um <circle> por ponto posicionado
Municipio.tsx ........ entrada da alternativa textual
FichaMunicipio.tsx ... relações, evidências e pontos
SecaoMapa.tsx ........ lê os dados e entrega por props

page.tsx não tem lógica de mapa: só compõe a seção.

Nenhum nome ou código de município é escrito em mais de um lugar. Geometria vem
da malha, nome vem da lista oficial do IBGE, relações vêm de recorte.ts, e
mapa.ts apenas cruza pelos códigos. Dois testes protegem isso: um confere que
todo nome renderizado é idêntico ao da lista oficial, outro que todo município
do recorte existe na malha.

Dados novos baixados:

municipios-sergipe-nomes.json, 32.649 bytes, SHA-256
2678c3b209f60db7337e410458f8ce43ea76abae4f0f45a960de33117f5801c5, 75 itens,
cobertura de 75 de 75 códigos da malha. Foi necessário porque a malha do IBGE
não traz nome: sem ele, "nome acessível por município" não existiria. A
instrução da 10B.3.1 mandava baixar somente o GeoJSON, mas o item 2 desta
rodada pede explicitamente o mapeamento de códigos oficialmente verificado —
que é este arquivo. Procedência completa registrada em fontes.ts.

Peso real, medido no build de produção servido:

                        antes, sem mapa    depois, com mapa
documento HTML .......        4.357 B           49.149 B
fontes ...............      203.108 B          108.972 B
JavaScript ...........      140.755 B          140.760 B
CSS ..................        4.985 B            5.013 B
prefetch de rotas ....       28.691 B           12.178 B
total transferido ....      378.412 B          316.072 B

A Home ficou 62.340 bytes MAIS LEVE com o mapa do que estava sem ele, em 63% do
orçamento de 500 kB do doc 01 §7. O JavaScript não mudou: o mapa não acrescentou
um byte de script.

Onde a projeção da auditoria errou, e vale registrar: previa 16.529 bytes para o
mapa, e ele custou 44.792 no HTML. A diferença é a alternativa textual dos 75
municípios — nomes, relações e evidências —, que não era opcional: é o que faz o
mapa funcionar sem JavaScript e por leitor de tela. E o prefetch entregou 16.513
dos 28.691 previstos, porque os cartões da própria Home continuam pré-carregando
os seus destinos, que são a ação principal da página.

Reduções aplicadas nesta rodada, conforme autorizado:

remoção do subset latin-ext das três famílias — economia de 94.136 bytes,
exatamente o previsto. A afirmação do tokens.css de que latin-ext entrava "por
causa dos diacríticos do português" foi corrigida no comentário do layout.tsx: a
face latin cobre U+0000 a U+00FF, onde vivem todos os diacríticos do português;
prefetch={false} nos landmarks de navegação — cabeçalho, rodapé e menu mobile.

NÃO aplicada, como instruído: Literata variável para estática 400. Depende de
levantar todos os pesos em uso, onde são usados, medir e verificar identidade
visual.

MapLibre removido, e não em silêncio:

Antes de remover foi verificado: nenhum import em src, testes, scripts ou db;
ausência em todos os chunks do build; presença apenas em package.json e no
lockfile. pnpm remove maplibre-gl retirou 23 pacotes. next permaneceu em 16.3.4
— desta vez a resolução foi ignorada pelo pnpm e nada mais subiu de versão.

zod 4.5.4 permanece: é o que valida a malha e os nomes.

Contratos removidos:

Quatro tipos ficaram órfãos com o Cenário C e foram removidos de tipos.ts, com
nota no próprio arquivo explicando onde cada coisa vive agora: Municipio e
InformacoesMunicipio, substituídos por MunicipioDoMapa; FeatureGeoJson e
ColecaoDeFeatures, substituídos pelos esquemas Zod de validacao.ts. Foram
removidos em vez de mantidos "para depois" porque duas definições da mesma
entidade divergem — é a lição do doc 03 §4, que este projeto já pagou uma vez.

next-env.d.ts, correção durável (item 10 da instrução):

Acrescentada uma linha em biome.json excluindo next-env.d.ts das verificações.
Nenhuma outra regra do Biome foi tocada. É o arquivo que o próprio Next declara
que não deve ser editado, e que ele reescreve com CRLF no Windows a cada
mudança de conteúdo. Verificado: com a exclusão, o lint passa mesmo com o
arquivo em CRLF, e o build não o reescreve enquanto o conteúdo não muda.

Dois guardas de teste foram ajustados, e a razão fica registrada:

O teste que proibia os nomes "Itabaianinha" e "São Cristóvão" na Home usava esses
nomes como atalho para detectar comparativo municipal. Com o mapa, os 75
municípios passaram a ser nomeados — dado oficial do IBGE, não comparativo. O
teste passou a proibir o que sempre importou: indicador, número de pesquisa e
vocabulário de comparação.

O teste de distinção de link passou a excluir link dentro de SVG. A WCAG 1.4.1
trata de link embutido em bloco de texto; no mapa o município é controle
gráfico, e não depende só de cor — hover e foco mudam preenchimento e espessura
de traço, o que é verificado em mapa.spec.ts. Sublinhar um polígono não
significa nada.

Testes:

125 testes de unidade e 23 de a11y. Os novos cobrem o que o item 11 pediu: os 75
municípios existem; os cinco do Vale existem; São Cristóvão não pertence ao
Vale; cada município é identificável individualmente, com código e id únicos;
todo município tem nome acessível; todo nome vem da lista oficial do IBGE; foco
de teclado com indicador visível, medido com Tab de verdade; os quatro pontos
aparecem mesmo sem coordenada, e nenhum marcador é desenhado; a alternativa
textual lista os 75; e o HTML servido já traz mapa e lista, sem JavaScript, sem
menção a maplibre e sem qualquer requisição a tile.

Nenhum teste compara o SVG inteiro: comparar 75 caminhos quebraria a cada
atualização da malha sem indicar nada de útil.

Verificação:

pnpm tipos — passou;
pnpm lint — passou, 81 arquivos, com os quatro avisos preexistentes de
!important em tokens.css;
pnpm teste — passou, 125 testes;
pnpm build — passou, 16 rotas, todas estáticas;
pnpm a11y — passou, 23 testes.

Limitações do SVG, registradas:

sem zoom e sem deslocamento — é uma prancha do estado, não um navegador
geográfico;
projeção fixa, equirretangular com correção de meridiano: adequada para um
estado, imprópria para medir área ou distância;
os caminhos entram no HTML, não num chunk adiado — o que, medido, saiu bem mais
barato que a alternativa;
75 paradas de tabulação no mapa, que é o preço de "cada município focável";
interação mais rica exigiria escrever o que a biblioteca traria pronto.

Pendências:

licença oficial do IBGE, a confirmar antes da disponibilização pública;
coordenadas dos quatro pontos de visita;
município de Serra dos Macacos e de Ilha Grande;
Literata variável para estática;
Lighthouse continua não medido — @lhci/cli não instalado e a documentação do
projeto proíbe rodá-lo até o item 26 do backlog;
refinamento do GeoJSON para três casas decimais, que valeria cerca de 4 kB.

Próximo passo:

Aguardar aprovação. A Home completa não foi implementada, nenhum conteúdo
institucional foi criado, e nada foi commitado.

28. Refinamento de interação e acessibilidade do mapa — 2026-09-03

Status:

CONCLUÍDO E VALIDADO. Os dois pontos que faltavam para o mapa ser definitivo
foram resolvidos. Nada foi commitado.

Ponto 1 — navegação por teclado: as 75 paradas de Tab acabaram.

Criada src/componentes/mapa/MapaInterativo.tsx, a única ilha cliente do mapa.
Ela não renderiza nada: só comportamento. Com JavaScript, promove o SVG a
listbox e aplica roving tabindex.

Tab entra no mapa uma vez, no município ativo;
Tab de novo sai do mapa;
setas movem entre municípios;
Home e End vão às pontas;
Enter e Espaço selecionam;
Esc limpa a seleção;
clique e toque selecionam pelo mesmo caminho.

Selecionar realça a entrada do município na lista territorial e a traz para a
área visível, com block "nearest" e sem animação.

Decisão de arquitetura que vale registrar: a ilha alcança o SVG pelo id, em vez
de recebê-lo como children. Receber por children pareceria mais idiomático, mas
serializaria os 75 caminhos também no payload RSC — os mesmos ~48 kB de
geometria apareceriam duas vezes no documento. Assim o custo em JavaScript é só
o da própria função.

Os municípios passaram a ser percorridos em ordem alfabética, e não na ordem em
que a malha do IBGE veio. O SVG e a lista usam a mesma sequência, porque
"próximo" precisa significar algo para quem navega por teclado.

Ponto 2 — semântica: município deixou de ser link.

Antes cada município era um <a> apontando para a âncora da própria entrada na
lista. Funcionava, mas era semântica de link emprestada: o elemento não navega
para lugar nenhum. Agora o SVG do servidor traz apenas <path> com data-codigo e
aria-label, sem href, sem role e sem tabindex.

Sem JavaScript o SVG se anuncia como role="img" e não promete navegação que não
pode cumprir; a informação inteira está na lista territorial, que vem pronta do
servidor. Com JavaScript, a ilha atribui role="listbox" e role="option".

Quando houver página territorial aprovada, MunicipioNoMapa volta a ser <a> — é
uma linha.

Ponto 3 — fronteiras da camada base.

O traço da base era --color-borda a 0,6 e ficava quase invisível sobre pedra.
Passou a --color-texto-suave a 0,5: mais escuro e mais fino. As fronteiras dos
75 municípios ficaram perceptíveis, e a base continua sem disputar atenção com
o Vale, cujo traço é mais que o dobro da espessura e em mata. Nenhuma cor nova:
--color-texto-suave já existia em tokens.css.

Estados agora se distinguem por espessura, e não só por cor. A escala é
monotônica:

base ............ 0,5
Vale ............ 1,2
foco ............ 2,4, em milho
selecionado ..... 3,5, em mata

hover muda o preenchimento. cursor:pointer só aparece quando a ilha marcou o
SVG como interativo — sem JavaScript, o cursor não promete clique.

Achado importante, anterior a esta rodada: os testes de a11y nunca hidratavam.

Os oito testes de interação falharam na primeira execução, e a causa não estava
no mapa. O playwright.config.ts apontava para http://127.0.0.1:3000, enquanto o
next dev se considera localhost e bloqueia acesso cross-origin aos seus recursos
de desenvolvimento. O HMR era bloqueado e a página NUNCA HIDRATAVA: todo Client
Component ficava inerte nos testes.

Isso passou despercebido desde a Tarefa 03 porque nenhum teste dependia de
comportamento no navegador — o MenuMobile, que é cliente desde então, nunca foi
exercitado por teste de interação. Apareceu na primeira vez que um teste
dependeu, na navegação por teclado do mapa.

Correção: baseURL e webServer.url do playwright.config.ts passaram a localhost.
Nada da configuração da aplicação foi tocado. Verificado no navegador: com
127.0.0.1 a hidratação não acontece; com localhost, acontece, e a ilha assume o
mapa.

Consequência prática: os testes de interação passaram a esperar a ilha assumir o
mapa antes de interagir, por uma função abrirMapaInterativo. Sem essa espera,
eram corrida — o SVG vem do servidor pronto, mas o role e os tabindex só
aparecem depois da hidratação.

Peso real, medido no build de produção servido:

                        sem a ilha      com a ilha
documento HTML .......    49.149 B        49.967 B
JavaScript ...........   140.760 B       142.004 B
CSS ..................     5.013 B         5.013 B
fontes ...............   108.972 B       108.972 B
prefetch de rotas ....    12.178 B        12.178 B
total transferido ....   316.072 B       318.134 B

A navegação por teclado do mapa custou 1.244 bytes comprimidos de JavaScript. O
chunk da ilha tem 2.341 bytes brutos e 965 comprimidos; o resto são cabeçalhos
de resposta e a referência de cliente. O HTML subiu 818 bytes por causa dos
data-codigo e dos ids.

A Home está em 318 kB de 500, 64% do orçamento.

Dados transferidos: zero. A malha é lida em tempo de build; o navegador nunca a
busca.

Arquivos criados:

src/componentes/mapa/MapaInterativo.tsx

Arquivos alterados:

src/componentes/mapa/MunicipioNoMapa.tsx — de <a> para <g> com <path>
src/componentes/mapa/MapaTerritorio.tsx — id no SVG e na lista, role="img",
monta a ilha
src/componentes/mapa/Municipio.tsx — data-codigo para a ilha encontrar a entrada
src/componentes/mapa/estilosDoMapa.ts — fronteiras, escala de espessura,
seleção por atributo em vez de :target
src/dados/territorio/mapa.ts — ordem alfabética
playwright.config.ts — localhost em vez de 127.0.0.1
testes/a11y/mapa.spec.ts — de 12 para 18 casos
docs/decisoes/ADR-010-mapa-svg-no-servidor.md
ESTADO_PROJETO_2026-09-01.md
ESTADO_COMPLETO_PROJETO.md

Testes:

125 de unidade e 33 de a11y, todos passando. Os novos cobrem o que o item 6
pediu: uma única parada de Tab no mapa, e Tab sai em uma tecla; setas navegam,
com Home e End; Enter e Espaço selecionam; Esc limpa; clique e toque continuam
selecionando; foco muda cor E espessura; a alternativa textual lista os 75; e
uma suíte inteira com javaScriptEnabled desligado, que confere que o desenho e a
lista vêm do servidor e que o mapa não promete navegação sem poder cumprir.

Também entrou um teste da fronteira: o traço da base não é a cor do fundo, e o
Vale continua mais grosso que a base.

Nenhum snapshot integral do SVG.

Verificação:

pnpm tipos — passou;
pnpm lint — passou, 82 arquivos, com os quatro avisos preexistentes de
!important em tokens.css;
pnpm teste — passou, 125 testes;
pnpm build — passou, 16 rotas, todas estáticas;
pnpm a11y — passou, 33 testes.

Pendências:

licença oficial do IBGE, a confirmar antes da disponibilização pública;
coordenadas dos quatro pontos de visita;
município de Serra dos Macacos e de Ilha Grande;
Literata variável para estática, ainda não avaliada;
Lighthouse continua não medido — @lhci/cli não instalado e a documentação do
projeto proíbe rodá-lo até o item 26 do backlog;
o MenuMobile nunca foi exercitado por teste de interação, e agora que a
hidratação funciona nos testes isso é possível.

Próximo passo:

Aguardar aprovação. A Home completa não foi implementada e nenhum conteúdo
institucional foi criado.

