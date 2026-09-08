# Snapshot da arquitetura do código — 2026-09-08

> **Tipo:** snapshot técnico da arquitetura do código
>
> **Data de referência:** 2026-09-08
>
> **Fontes canônicas vigentes:** [Plano de Execução](../../PLANO_EXECUCAO_OBSERVATORIO.md) e [Estado Atual do Projeto](../../ESTADO_ATUAL_PROJETO.md).
>
> **Validade:** este documento descreve o repositório nesta data e pode envelhecer. Não substitui o plano, o estado, as arquiteturas canônicas nem as ADRs.

## 1. Finalidade e base técnica

O Observatório do Vale do Rio Real é um site institucional e de prestação de contas à FUNCAP/SE. O código atende avaliadores, pesquisadores, atores-chave e o público, com ênfase em integridade documental, acessibilidade e URLs permanentes.

- Aplicação: Next.js App Router, React e TypeScript estrito.
- Runtime: Node.js na linha definida por `.nvmrc`.
- Pacotes: pnpm 11.25.0.
- Persistência: PostgreSQL com Drizzle ORM.
- Objetos: Cloudflare R2 pela API compatível com S3, separado em storage público e privado.
- Validação: Zod nas fronteiras de dados externos.
- Estilo: Tailwind CSS e tokens próprios em `src/estilos/tokens.css`.

As definições normativas de informação e banco permanecem em [Arquitetura da Informação](../01-arquitetura-informacao.md) e [Arquitetura de Banco](../02-arquitetura-banco.md).

## 2. Mapa do repositório

```text
.
├── db/
│   └── migrations/        # DDL e SQL bruto versionados, de 0001 a 0007
├── docs/
│   ├── arquitetura/       # snapshots técnicos datados, não normativos
│   ├── auditorias/        # resultados de auditorias pontuais
│   ├── carga/             # registros e planos de carga de dados
│   ├── decisoes/          # ADRs e decisões arquiteturais
│   ├── direcao-visual/    # direção visual e referências de interface
│   ├── fontes/            # referências e bibliografia
│   ├── historico/         # planos e estados superados
│   ├── privacidade/       # revisões e registros de privacidade
│   └── tarefas/           # escopo e critérios das fatias de implementação
├── scripts/               # ingestão, espelhamento, derivação, ZIP e gates
├── src/
│   ├── app/               # rotas, layouts e handlers do App Router
│   ├── componentes/       # componentes React
│   ├── dados/             # clientes, consultas e dados locais validados
│   ├── estilos/           # CSS global e tokens
│   └── lib/               # regras de domínio e integrações sem UI
└── testes/                # Vitest e Playwright/a11y
```

O antigo estado `ESTADO_PROJETO_2026-09-01.md`, citado em levantamentos anteriores, está preservado como histórico em [docs/historico/estados/ESTADO_PROJETO_2026-09-01.md](../historico/estados/ESTADO_PROJETO_2026-09-01.md). Ele não é fonte operacional vigente.

## 3. Pontos de entrada e rotas

O processo web parte de `src/app/`, via `next dev` em desenvolvimento e `next build`/`next start` na produção. As rotas implementadas incluem a home, páginas institucionais e temáticas, a Sala do Avaliador em `/prestacao-de-contas`, sua versão imprimível e o contrato legível por máquina em `/anexos.json`.

Os principais pontos de entrada de manutenção são:

- `scripts/carregar-documentos.ts`: carga documental controlada;
- `scripts/catalogar-documentos.ts`: catálogo de fontes e metadados;
- `scripts/derivar-inventario.py`: geração e conferência do inventário derivado;
- `scripts/espelhar-anexos.ts`: espelhamento dos objetos elegíveis;
- `scripts/gerar-zip-anexos.ts`: montagem e envio do ZIP público;
- `scripts/verificar-pendencias.ts`: gate de pendências de publicação.

Esses scripts são operações explícitas de CLI/build; não há daemon ou rotina cron no repositório.

## 4. Camadas e fluxo de dados

1. Arquivos e dados nascem em fontes externas de trabalho e são inventariados antes de qualquer exposição.
2. Scripts de manutenção validam entradas, calculam integridade e registram metadados no PostgreSQL.
3. O binário fica no R2; a tabela física `arquivo` guarda bucket, chave, visibilidade, hash, tamanho, tipo e proveniência, mas não os bytes.
4. Consultas públicas ficam em `src/dados/consultas/`. Páginas e componentes não abrem conexão direta com o banco.
5. A view `vw_anexo_publico` alimenta um único conjunto de evidências, reutilizado pela Sala do Avaliador, versão imprimível, `/anexos.json` e ZIP.
6. A leitura ocorre em build time. A aplicação não consulta o banco por requisição do visitante.

O gate público é fechado por padrão: exige estado `PUBLICAVEL`, revisão de privacidade `concluida`, natureza definida, objeto existente, URL, SHA-256 e proveniência. A automação pode vetar, mas não substitui a decisão humana.

## 5. Modelo documental e publicação multiarquivo

O schema vigente resulta das migrações `0001_fundacao.sql` a `0007_publicacao_multiarquivo.sql`. As migrações 0004–0007 consolidaram o estado documental, a privacidade, o storage privado e a publicação multiarquivo.

- `documento` representa o item lógico do acervo.
- `arquivo` representa cada objeto físico.
- `documento_arquivo` permite vários arquivos por documento, com ordem, rótulo e no máximo um vínculo marcado como principal.
- `principal` organiza o documento; não é autorização de publicação. A view pública considera todos os vínculos válidos.
- A identidade física é `(bucket, chave_storage)`. O SHA-256 é índice de integridade, não identidade única global.
- `derivado_de_id` registra transformação de conteúdo, acompanhada do método.
- `replica_de_id` registra cópia byte a byte entre localizações; uma linha não pode ser simultaneamente derivado e réplica.

O Manifesto de Evidências é um contrato derivado e validado em `src/lib/manifesto-evidencias.ts`, não uma fonte editorial independente. Cada arquivo físico público produz sua própria evidência. A Sala do Avaliador e `/anexos.json` consomem o mesmo conjunto; o ZIP aplica o mesmo gate, verifica o hash e usa `slug/nome-do-arquivo` para evitar colisões entre anexos do mesmo documento.

## 6. Storage e fronteiras externas

Há dois clientes R2 separados:

- público: variáveis `STORAGE_PUBLIC_*`, URL estável pelo domínio público e operações de publicação/ZIP;
- privado: variáveis `STORAGE_PRIVATE_*`, sem URL pública ou ACL pública, com escrita condicional e compensação restrita à própria execução.

As conexões de banco também são separadas por função: `DATABASE_URL` para aplicação, `DATABASE_URL_MANUTENCAO` para scripts autorizados e `DATABASE_URL_MIGRACAO` para migrações versionadas. Outras configurações declaradas incluem fontes locais, revalidação, Turnstile, URL canônica e futura credencial do Zenodo.

Serviços de origem, como Drive, Docs, Forms e Figma, são proveniência do acervo; não são dependências de leitura em tempo de requisição. O depósito no Zenodo permanece futuro. Nenhuma afirmação sobre credenciais vivas é feita neste snapshot.

## 7. Testes, gates e CI

O repositório possui 19 arquivos de teste Vitest e quatro especificações Playwright de acessibilidade na data deste snapshot. Há cobertura funcional para catálogo, carga e modelo documental, manifesto, pendências, storage público/privado, espelhamento, derivação, compensação, publicação multiarquivo, ZIP, território, home e Sala do Avaliador.

Comandos principais:

- `pnpm tipos`: TypeScript sem emissão;
- `pnpm lint`: Biome;
- `pnpm teste`: Vitest;
- `pnpm a11y`: Playwright com axe;
- `pnpm pendencias`: gate documental;
- `pnpm verificar`: composição dos cinco gates anteriores.

O workflow de CI abre PostgreSQL efêmero, aplica migrações e roda tipos, lint,
testes, pendências, build e acessibilidade em pull requests e pushes na `main`.
Desde o Prompt 4.2, `pnpm build` executa somente `next build`; a geração e o
upload do ZIP exigem `pnpm publicar-zip`, fora do workflow e com flag explícita.

## 8. Pontos quentes de manutenção

No recorte dos 50 commits mais recentes, o maior churn está no estado vigente, no guia de implementação, no `package.json`, no journal de migrações, no schema, no `AGENTS.md`, no espelhamento e na superfície da Sala do Avaliador. Isso reflete a fase atual de consolidação documental e de publicação segura; a contagem muda a cada commit e serve apenas como sinal de atenção.

Entradas particularmente sensíveis:

- `ESTADO_ATUAL_PROJETO.md`: muda com checkpoints operacionais;
- `db/schema.ts` e `db/migrations/`: contrato persistente e histórico imutável;
- `scripts/espelhar-anexos.ts`: coordena rede, storage e escrita de manutenção;
- `src/dados/consultas/anexos.ts`: converte a view no conjunto público comum;
- `src/componentes/acervo/TabelaAnexos.tsx`: apresentação principal ao avaliador.

## 9. Observabilidade

**Ativo:** logs de CLI, erros explícitos, gates de integridade, SHA-256 dos objetos e health check do PostgreSQL no CI.

**Dívida:** não há telemetria persistente de aplicação nem configuração de Sentry, Datadog ou Prometheus no repositório. A ausência é compatível com o estágio atual, mas reduz a visibilidade de falhas após publicação.

## 10. Riscos e decisões em aberto

### Resolvido no código atual

- A separação entre objeto privado e público evita tratar espelhamento como publicação.
- O modelo multiarquivo remove a suposição de um único anexo público por documento.
- Réplica e derivado têm proveniências físicas distintas.
- Sala, JSON e ZIP compartilham o mesmo gate público.
- O estado operacional vigente foi separado dos estados históricos.

### Riscos ativos

- Operações de storage e manutenção dependem de configuração externa correta e de reconciliação cuidadosa quando a rede falha.
- O ZIP é produzido antes do build e pode executar acesso externo; sua falha bloqueia corretamente o artefato publicável.
- Alterações em schema, view, migrações ou consulta de anexos podem afetar simultaneamente todas as saídas de prestação de contas.
- O processo de carga/espelhamento continua manual e exige disciplina operacional e credenciais com privilégio mínimo.

### Dívida técnica/documental

- O Lighthouse CI continua ausente do workflow; o próprio arquivo de CI registra que faltam dependência, servidor e throttling antes da reintrodução.
- Não há medição estatística de cobertura configurada, embora existam testes direcionados aos fluxos críticos.
- Não há observabilidade persistente pós-publicação configurada no código.

### Perguntas ainda abertas

- Qual será a orquestração futura das atualizações do painel de indicadores sem violar a regra de dados em build time?
- Quando e com qual configuração completa o Lighthouse CI será restabelecido?
- O fluxo manual de carga e espelhamento permanecerá local ou ganhará um workflow autenticado e auditável?

As respostas devem ser registradas nas fontes canônicas ou em ADRs; este snapshot não decide essas questões.
