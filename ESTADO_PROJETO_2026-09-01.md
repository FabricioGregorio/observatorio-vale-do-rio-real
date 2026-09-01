# Estado do Projeto — 2026-09-01

Documento de continuidade para novas sessões de IA.

Este arquivo registra o estado atual do projeto, decisões arquiteturais, tarefas concluídas, pendências e regras que devem ser respeitadas antes de qualquer implementação.

Última atualização: 2026-09-01 — Tarefa 09 concluída; Tarefa 10 a iniciar

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

17. Próximo passo autorizado

Executar somente:

Tarefa 10 — Home indicadores

Antes de iniciar:

Ler este arquivo.
Confirmar entendimento.
Atualizar documentação necessária.
Implementar apenas a Tarefa 10.

Escopo permitido da Tarefa 10:

(definido no arquivo docs/tarefas/10-home-indicadores.md)

Não executar:

Tabelas de Fase 3, entrevista inclusive;
alteração das migrações 0001 e 0002;
drizzle-kit push ou introspect;
acesso a Neon ou R2 sem credenciais reais.

Não instalar dependências fora do escopo.

Após finalizar:

Executar:

pnpm tipos
pnpm lint
pnpm teste
pnpm build
pnpm a11y

Gerar relatório completo.