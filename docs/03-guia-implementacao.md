# Guia de Implementação
## Site do Observatório do Vale do Rio Real — manual de build para agentes de IA

**Documento:** v1 — guia de execução
**Depende de:** *Arquitetura de Informação e Técnica v1* e *Arquitetura de Banco de Dados v1*
**Executores previstos:** Codex, Claude Code e Gemini/Antigravity, integrados ao VS Code
**Executor humano:** revisor e responsável final por cada merge

---

## 0. Como este documento deve ser usado

Este guia é escrito para ser lido por um agente antes de cada tarefa, não por uma pessoa uma única vez.

**Hierarquia de fontes de verdade.** Quando houver conflito, vence quem está mais acima:

1. Instrução direta do responsável humano nesta sessão
2. *Arquitetura de Banco de Dados v1* (schema, constraints, RLS)
3. *Arquitetura de Informação v1* (rotas, entidades, requisitos não funcionais)
4. Este guia (stack, convenções, processo)
5. O código existente no repositório
6. O que o agente acha que seria uma boa ideia

Um agente **não pode** alterar itens 2 e 3 por conta própria. Se uma tarefa parecer exigir mudança de schema ou de rota, o agente para, escreve a proposta em `docs/decisoes/` e devolve a decisão ao humano. Divergência silenciosa entre documentação e código é o modo mais comum de um projeto assistido por IA apodrecer em duas semanas.

---

## 1. Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js (App Router)** | SSG/ISR nativo, é o que sustenta a decisão "estático é a camada de preservação" |
| Linguagem | **TypeScript**, `strict: true` | Contrato explícito é o que mais reduz erro de agente |
| Runtime/pacotes | **pnpm** + Node LTS | Lockfile determinístico; `pnpm` recusa fantasmas de dependência |
| Estilo | **Tailwind CSS v4** + tokens em CSS custom properties | Tokens no CSS impedem que cada agente invente um hex novo |
| Componentes | **shadcn/ui** sobre Radix | Acessibilidade de teclado e ARIA vem pronta; código fica no repo, não em node_modules |
| Banco | **PostgreSQL** (Supabase ou Neon) | Conforme documento de banco |
| ORM | **Drizzle ORM** + Drizzle Kit | Schema em TypeScript espelhando o SQL, migrações versionadas em arquivo, sem camada mágica |
| Validação | **Zod** | Uma fonte de tipos para formulário, API e banco |
| Conteúdo editorial | **MDX** versionado no Git | Home, metodologia e capítulos do documento final — não vão para o banco |
| Mapa | **Leaflet** + OpenStreetMap | Sem chave de API, sem custo, sem rastreio |
| Testes | **Vitest** (unidade), **Playwright** (e2e), **axe-core** (a11y) | A11y é critério de aceite, não fase final |
| Qualidade | **Biome** (lint + format) | Uma ferramenta, uma config, menos briga entre agentes |
| CI/CD | **GitHub Actions** + **Vercel** | Preview por branch, gates automáticos |
| Métricas | Plausible ou Umami | Sem cookie, sem consentimento a gerenciar |

**Regra de versões:** o agente **nunca inventa número de versão nem nome de pacote**. Instalação sempre por `pnpm add <pacote>@latest`, com o número resultante commitado no lockfile. Se um pacote não existir no registro, o agente para e informa — não substitui por outro parecido sem avisar.

---

## 2. Estrutura de pastas

```
observatorio-vale-do-rio-real/
├── AGENTS.md                  # contrato do agente (§4) — leitura obrigatória
├── CLAUDE.md                  # → aponta para AGENTS.md
├── GEMINI.md                  # → aponta para AGENTS.md
├── .github/
│   ├── copilot-instructions.md  # → aponta para AGENTS.md
│   ├── pull_request_template.md
│   └── workflows/ci.yml
├── docs/
│   ├── 01-arquitetura-informacao.md
│   ├── 02-arquitetura-banco.md
│   ├── 03-guia-implementacao.md      # este arquivo
│   ├── decisoes/                     # ADRs: uma decisão por arquivo
│   └── tarefas/                      # backlog fatiado (§10)
├── db/
│   ├── schema.ts                     # Drizzle — espelho fiel do doc de banco
│   ├── migrations/                   # SQL versionado, nunca editado após aplicado
│   ├── seed.ts                       # dados do Relatório Parcial
│   └── importar-formularios.ts       # CSV do Google Forms → formulario_resposta
├── content/                          # MDX editorial
│   ├── paginas/
│   └── documento-final/
├── public/
├── src/
│   ├── app/                          # rotas espelhando o sitemap da §3 do doc 01
│   │   ├── (site)/
│   │   ├── prestacao-de-contas/
│   │   ├── api/
│   │   │   ├── anexos/route.ts       # /anexos.json
│   │   │   └── podcast/rss/route.ts
│   │   └── layout.tsx
│   ├── componentes/
│   │   ├── ui/                       # shadcn
│   │   └── acervo/                   # FichaEquipamento, CardAnexo, PlayerEpisodio...
│   ├── dados/                        # ÚNICA camada com acesso ao banco
│   │   ├── cliente.ts
│   │   └── consultas/                # uma função por caso de uso
│   ├── lib/
│   └── estilos/tokens.css
├── testes/
│   ├── e2e/
│   └── a11y/
└── scripts/
    ├── verificar-pendencias.ts       # roda vw_pendencia_publicacao
    └── gerar-hashes.ts
```

**Regra de ouro da estrutura:** no **código de aplicação**, apenas `src/dados/consultas/*` importa o cliente do banco. Componente, página ou rota que faz query é rejeitado no review. Isso mantém possível o objetivo de gerar tudo em build time, e é por isso que a regra existe.

A regra governa o **caminho de renderização**, não o repositório inteiro. **Scripts de manutenção** — espelhamento, catalogação, importação, seed, em `scripts/` e `db/` — podem importar `src/dados/cliente.ts`, desde que: usem `DATABASE_URL`; não executem DDL; e não sejam chamados por nenhum código que renderize página. O site público continua sem consultar o PostgreSQL em tempo de requisição (ADR-001).

---

## 3. Direção visual

Sem uma direção definida, três agentes diferentes produzem três estéticas diferentes — e todas tendem ao mesmo default de portfólio genérico. A direção abaixo é **normativa**: cor e tipografia saem daqui ou de lugar nenhum.

**Conceito: arquivo vivo.** O site é um acervo de campo que continua aberto. A referência material vem do próprio objeto de pesquisa — ficha de pesquisa, caderno de visita, carimbo de tombo, mapa de rota tropeira — sem virar pastiche de jornal antigo.

**Paleta** (definir em `src/estilos/tokens.css` como custom properties; nenhum hex fora daqui):

| Token | Hex | Uso |
|---|---|---|
| `--mata` | `#12301F` | Base escura, cabeçalho, rodapé |
| `--anil` | `#1F3A5F` | Tinta de texto sobre claro, links |
| `--pedra` | `#E7E5DE` | Fundo claro (frio, não creme) |
| `--milho` | `#E8B23A` | Cor de sinal: destaques, foco, números |
| `--barro` | `#8A4B2A` | Acento secundário, usado com parcimônia |
| `--carvao` | `#171A17` | Texto de máxima leitura |

Proibido: gradiente decorativo, glassmorphism, sombra colorida, fundo creme quente com serifa alto-contraste e acento terracota — é o visual padrão de saída de IA e denuncia o processo.

**Tipografia** (três papéis, todas com suporte pleno a diacríticos do português):

- **Display:** Archivo (variável, larguras expandidas) — títulos, numerais de visita
- **Leitura:** Literata — documento final, transcrições, textos longos
- **Utilitário:** IBM Plex Mono — metadados de ficha, datas, hashes, códigos de meta

Escala 1.25, pesos intencionais, `text-wrap: balance` em títulos.

**Elemento assinatura: a ficha.** Equipamento, entrevista, visita, anexo e meta são todos renderizados como fichas com cabeçalho monoespaçado, numeral em display e corpo em leitura. A numeração é real e informativa — Visita I a VII, metas M01…, temporada/episódio — nunca decorativa. É o único lugar onde o projeto gasta ousadia; o resto é disciplinado e quieto.

**Piso de qualidade, sem exceção:** responsivo até 360px, foco de teclado visível e nítido, `prefers-reduced-motion` respeitado, contraste mínimo 4.5:1 verificado nos pares reais da paleta.

**Copy:** voz institucional em pt-BR, frase curta, verbo ativo, sentence case. Um botão diz o que acontece ("Baixar relatório", não "Clique aqui"). O mesmo nome atravessa o fluxo inteiro. Erro explica o que houve e o que fazer, sem pedir desculpas. Página vazia convida a uma ação.

---

## 4. `AGENTS.md` — contrato do agente

O contrato vive em **`AGENTS.md`, na raiz do repositório**, e é a **fonte normativa
única**. `CLAUDE.md`, `GEMINI.md` e `.github/copilot-instructions.md` contêm apenas uma
linha apontando para ele, para que a regra viva em um único arquivo.

Este guia **não reproduz** o conteúdo do `AGENTS.md`. Até 2026-08-31 esta seção trazia
uma cópia integral, e a cópia divergiu do original — mantinha a redação antiga da regra
de acesso ao banco e não tinha as regras posteriores sobre `drizzle-kit push`, revisão
de migração destrutiva e conteúdo editorial. Duas versões da mesma lista divergem de
novo, e num projeto operado por agentes a versão errada é obedecida sem ninguém
perceber. Por isso a cópia foi substituída por esta referência.

Em caso de dúvida sobre uma regra de trabalho, a resposta está em `AGENTS.md` — nunca
aqui.

---

## 5. Convenções de código

**Nomes.** Domínio em português (`Equipamento`, `buscarAnexosPublicados`), infraestrutura em inglês quando é padrão consagrado (`middleware`, `layout`, `route`). Nunca portunhol técnico do tipo `getEquipamentos`.

**Camada de dados.** Uma função por caso de uso em `src/dados/consultas/`, tipada pelo schema Drizzle, sem `SELECT *`. Exemplo:

```ts
// src/dados/consultas/anexos.ts
export async function listarAnexosPublicados(): Promise<AnexoPublico[]> {
  return db.select({ ... }).from(vwAnexoPublico);
}
```

**Componentes.** Server Component por padrão. `"use client"` apenas para player de áudio, mapa, busca e formulários. Componente de acervo recebe dados por props — não busca nada.

**Renderização.** Tudo que vem do banco é gerado estaticamente com `generateStaticParams` e revalidado por tag via webhook do painel administrativo. A única rota dinâmica legítima é o POST da contribuição de escuta.

**Erros.** `error.tsx` e `not-found.tsx` em cada segmento. A 404 devolve para a Sala do Avaliador, conforme sugestão #14 do documento de arquitetura.

**Formulários.** Server Action + Zod + honeypot + Turnstile. Nunca confiar em validação de cliente.

**Acessibilidade como código.** `alt` obrigatório na tipagem do componente de imagem (`alt: string`, sem opcional). Transcrição obrigatória na tipagem do player. O tipo impede o esquecimento antes do teste pegar.

---

## 6. Banco: da documentação ao código

1. `db/schema.ts` é **espelho fiel** do documento de banco. Cada tabela, enum, `CHECK` e índice tem equivalente.
2. O que Drizzle não expressa bem — `CHECK` composto, `num_nonnulls`, colunas geradas com `tsvector`, RLS, views, triggers — vai em **SQL bruto dentro do arquivo de migração**. Não simular no código da aplicação.
3. Migrações geradas por `drizzle-kit generate`, revisadas à mão, aplicadas no CI. Migração aplicada é imutável.
4. `db/seed.ts` popula municípios, equipamentos, pessoas, temas, metas, cronograma e as sete visitas com os dados reais do Relatório Parcial. Idempotente, com `ON CONFLICT DO NOTHING`.
5. Views (`vw_anexo_publico`, `vw_pendencia_publicacao`, `mv_busca`) são criadas por migração e consumidas via Drizzle como tabelas somente leitura.
6. **Migração versionada é o único mecanismo de alteração de schema.** Os comandos permitidos são `pnpm gerar-migracao` (`drizzle-kit generate`) e `pnpm migrar` (`drizzle-kit migrate`). **`drizzle-kit push` e `drizzle-kit introspect` são proibidos em qualquer ambiente** — o `push` reconcilia o banco real contra `db/schema.ts` e apaga o que não estiver lá; o `introspect` não serve como sincronização automática. Migração gerada é sempre revisada à mão antes de ser aceita, e migração já aplicada é imutável: correção é uma migração nova.
7. **O snapshot do Drizzle não descreve o banco inteiro.** Extensões, funções, triggers e views ficam fora de `db/migrations/meta/*_snapshot.json`. Hoje estão nessa condição: `pgcrypto`, `citext`, `unaccent`, `sem_acento()`, `set_atualizado_em()`, os cinco `trg_atualizado_em` e `vw_anexo_publico`. Consequências que valem como regra:
   - Esses objetos são criados ou alterados **exclusivamente por nova migração SQL versionada**, em SQL bruto, como no item 2.
   - O `generate` nunca os remove, porque não os conhece — mas também **nunca detecta que sumiram**. Não existe verificação automática de drift para eles; a conferência é humana.
   - Para consumir uma view pelo Drizzle, declará-la como **existente** (`.existing()`), nunca como objeto a criar. Declarada como nova, o `generate` emite um `CREATE VIEW` que falha contra a view já presente no banco.
8. **`DATABASE_URL_MIGRACAO` é exclusiva de DDL.** Só o Drizzle Kit e as migrações a usam. Script de manutenção que apenas lê e escreve linhas — espelhamento, importação, seed — usa `DATABASE_URL`, o role da aplicação, sem DDL. Precisar de DDL num script é sinal de que aquilo deveria ser uma migração. Ver ADR-007.

**Revisão obrigatória de migração destrutiva.** Migração que contenha `DROP`, `ALTER`, mudança de tipo de coluna ou remoção de coluna só é aceita depois de o PR responder, por escrito:

- [ ] A coluna é usada por alguma view? `vw_anexo_publico` depende de colunas de `documento`, `documento_arquivo` e `arquivo`. O PostgreSQL recusa alterar o tipo de coluna usada por view, e o erro aparece só no `migrate` — o `generate` produz o SQL sem reclamar.
- [ ] A alteração toca função usada por coluna gerada? `documento.busca` depende de `sem_acento()`; mexer na função quebra a coluna.
- [ ] A migração altera ou remove trigger ou view? Então recria os dois explicitamente, no mesmo arquivo e na ordem correta.
- [ ] A tabela tem `trg_atualizado_em`? Renomear a tabela ou a coluna `atualizado_em` desliga o trigger em silêncio.

**Gate obrigatório do CI:**

```bash
pnpm tsx scripts/verificar-pendencias.ts   # falha se vw_pendencia_publicacao retornar linha
```

Anexo obrigatório sem espelho local, ou áudio público sem consentimento válido, **quebra o build**. Essa é a tradução em pipeline dos dois riscos de maior impacto do projeto.

---

## 7. Qualidade: o que roda antes de todo PR

```json
{
  "scripts": {
    "verificar": "pnpm tipos && pnpm lint && pnpm teste && pnpm a11y && pnpm pendencias",
    "tipos": "tsc --noEmit",
    "lint": "biome check .",
    "teste": "vitest run",
    "a11y": "playwright test testes/a11y",
    "pendencias": "tsx scripts/verificar-pendencias.ts",
    "build": "next build"
  }
}
```

**Gates do CI (bloqueantes):** typecheck sem erro · Biome limpo · Vitest verde · axe-core sem violação séria ou crítica · `vw_pendencia_publicacao` vazia · Lighthouse CI ≥ 90 em Performance, Acessibilidade, Boas Práticas e SEO · build concluído.

**Definição de pronto por tarefa:**
- [ ] Critérios de aceite do arquivo da tarefa atendidos
- [ ] `pnpm verificar` passa localmente
- [ ] Navegável só por teclado, com foco visível
- [ ] Funciona em 360px de largura
- [ ] Nenhum dado fictício remanescente
- [ ] Documentação atualizada se algo divergiu do previsto

---

## 8. Fluxo de trabalho com Git

- Branch: `tipo/escopo-curto` (`feat/sala-do-avaliador`, `fix/contraste-rodape`)
- Commits: Conventional Commits em pt-BR (`feat(anexos): adiciona tabela da sala do avaliador`)
- Um PR por tarefa. PR com mais de ~400 linhas de diff deve ser fatiado.
- **Todo PR gerado por IA precisa de revisão humana antes do merge.** Sem exceção — o material publicado é peça de prestação de contas.
- Preview automático da Vercel em cada PR; o link vai no corpo do PR.

**Template de PR:**

```markdown
## O que muda
## Tarefa relacionada
docs/tarefas/NN-....md
## Como verificar
1.
## Checklist
- [ ] `pnpm verificar` passou
- [ ] Sem `any`, sem regra de lint desabilitada
- [ ] Sem dado fictício
- [ ] Teclado e 360px verificados
- [ ] Documentação atualizada, se aplicável
## Dúvidas em aberto para o revisor
```

---

## 9. Divisão de trabalho entre os agentes

Nenhum agente tem contexto do que o outro fez fora do repositório. O repositório é a memória compartilhada — por isso a documentação em `docs/` e o `AGENTS.md` importam mais aqui do que num projeto tocado por uma pessoa só.

| Tipo de tarefa | Perfil recomendado | Observação |
|---|---|---|
| Migrações, schema, consultas SQL | Agente com melhor raciocínio longo e cuidado com invariantes | Sempre com revisão humana do SQL gerado |
| Componentes de UI e páginas | Qualquer um, desde que siga `tokens.css` | Pedir screenshot ou preview no PR |
| Testes e2e e a11y | Agente com execução de terminal integrada | Deve rodar de verdade, não só escrever |
| Refatoração ampla | Um agente por vez, em branch isolada | Dois agentes na mesma área geram conflito silencioso |
| Redação de conteúdo MDX | Sempre com autoria humana revisando | Texto de pesquisa não é gerado, é transcrito da fonte |

**Regra de concorrência:** nunca dois agentes editando os mesmos arquivos simultaneamente. Coordenar por tarefa, não por arquivo.

---

## 10. Backlog fatiado — pronto para virar prompt

Cada tarefa vira um arquivo em `docs/tarefas/NN-nome.md` no formato: *objetivo · arquivos permitidos · critérios de aceite · como verificar*. Restringir os arquivos permitidos é o controle mais eficaz contra mudança colateral.

**Fase 1 — Fundação e Sala do Avaliador**
1. Bootstrap: Next.js, TypeScript estrito, Tailwind v4, Biome, Vitest, Playwright, CI
2. `tokens.css` e escala tipográfica conforme §3, com página de referência visual em `/dev/estilos`
3. Layout base: cabeçalho, rodapé com créditos de fomento, skip link, navegação por teclado
4. Drizzle + conexão + migração 0001 (extensões, enums, funções, triggers)
5. Migração 0002: `arquivo`, `municipio`, `pessoa`, `equipamento`, `consentimento`, `documento`, `documento_arquivo` + view `vw_anexo_publico` (ordem topológica da §16 do doc 02)
6. Script de espelhamento: baixar do Drive, subir ao storage, calcular SHA-256, registrar em `arquivo`
7. Catálogo documental: inventário → `documento` + `documento_arquivo`, com `versao`, `rotulo` e `principal`
8. `/prestacao-de-contas`: tabela mestre, ZIP, versão imprimível
9. `/anexos.json` e `scripts/verificar-pendencias.ts` como gate de CI
10. Home v1 com painel de indicadores

**Fase 2 — Pesquisa e dados**
11. Seed de `municipio`, `pessoa`, `equipamento` e `consentimento` — as tabelas já vêm da migração 0002
12. `/equipamentos` e `/equipamentos/[slug]` com a ficha assinatura
13. Migração: `meta`, `meta_evidencia`, `cronograma_atividade`, `indicador` + seed
14. `/prestacao-de-contas/metas` com semáforo e nota de execução
15. Pipeline MDX e `/pesquisa/documento-final` capítulo a capítulo
16. Migração `formulario*` + importador de CSV + `/dados` com dicionário e exportação

**Fase 3 — Território e voz**
17. Migração: `visita`, `midia`, `entrevista`, `entrevista_trecho` + seed das sete visitas
18. `/campo`: visitas, galeria acessível, entrevistas com transcrição
19. Migração `temporada`/`episodio` + `/podobservar` com player acessível e capítulos
20. Feed RSS 2.0 com namespace iTunes em `/api/podcast/rss`
21. `/mapa` com Leaflet, camadas por situação do equipamento, alternativa em lista para leitor de tela

**Fase 4 — Educação e permanência**
22. `tema`, `termo`, `material_didatico`, `acao_extensao` + `/educacao`
23. `contribuicao_escuta` com moderação, expurgo por `pg_cron` e Server Action protegida
24. `/imprensa`, `/acessibilidade`, `/privacidade`, `/contato`
25. Busca interna sobre `mv_busca`
26. Auditoria WCAG final, Lighthouse CI, depósito no Zenodo, arquivamento no Internet Archive

---

## 11. Modelos de prompt

**Tarefa nova**

```
Leia docs/01-arquitetura-informacao.md, docs/02-arquitetura-banco.md, AGENTS.md
e docs/tarefas/08-sala-do-avaliador.md.

Implemente apenas essa tarefa. Arquivos permitidos: os listados no arquivo da tarefa.

Antes de codar, escreva em 5 linhas o plano e liste as suposições que precisou fazer.
Se alguma suposição contradiz a documentação, pare e pergunte.

Ao final: rode `pnpm verificar` e cole a saída. Não abra PR se falhar.
```

**Migração**

```
Gere a migração para as tabelas <X> exatamente como especificadas na seção <N>
de docs/02-arquitetura-banco.md, incluindo CHECKs, índices parciais, colunas
geradas e políticas RLS.

Não simplifique nenhuma constraint. Não crie tabela que não esteja no documento.
Se algo não for expressável em Drizzle, escreva SQL bruto no arquivo de migração
e explique por quê em comentário.

Depois, atualize db/schema.ts e rode `pnpm tipos`.
```

**Revisão cruzada** (usar um agente diferente do que escreveu)

```
Revise o diff do PR #<n> contra AGENTS.md e docs/02-arquitetura-banco.md.
Aponte especificamente: constraint do documento que não foi implementada,
acesso a banco em código de aplicação fora de src/dados/consultas/,
`any` ou lint suprimido,
dado fictício, cor ou fonte fora de tokens.css, imagem sem alt.
Não corrija nada; apenas liste os achados com arquivo e linha.
```

---

## 12. Antipadrões de código gerado por IA — checar em toda revisão

Estes são os problemas que aparecem com mais frequência quando a implementação é delegada a agentes. Vale rodar a revisão cruzada da §11 procurando exatamente por eles.

1. **Dado fictício plausível.** O agente preenche um estado vazio com um equipamento inventado ou uma citação de entrevista que nunca existiu. Num site de prestação de contas isso deixa de ser bug e vira problema de integridade da pesquisa. É o item nº 1 da revisão.
2. **Constraint amaciada.** O `CHECK` que estorvava vira comentário, ou o `NOT NULL` vira opcional para o seed passar. Comparar sempre a migração com o documento de banco, linha a linha.
3. **Pacote alucinado.** Dependência que não existe, ou existe com outro nome. Conferir no lockfile.
4. **Abstração prematura.** Três camadas de wrapper para uma consulta usada uma vez. Preferir duplicação óbvia a abstração especulativa.
5. **`useEffect` buscando dado** que deveria ser resolvido no servidor em build time.
6. **Regressão de acessibilidade** ao refatorar: `div` com `onClick` no lugar de `button`, foco removido com `outline: none`, ordem de heading quebrada.
7. **Cor fora do token.** Um `#ffffff` avulso que quebra o contraste e o modo escuro.
8. **Comentário que descreve intenção não implementada** (`// TODO: validar consentimento`) em código já mergeado.
9. **Teste que testa o mock**, não o comportamento.
10. **Deriva silenciosa da documentação:** o código passa a divergir de `docs/` e ninguém atualiza. Se um PR mudou uma decisão, ele atualiza a documentação no mesmo diff ou não passa.

---

## 13. Ambiente e segredos

```
# .env.local — nunca commitado
DATABASE_URL=
DATABASE_URL_MIGRACAO=        # usuário com DDL, separado da aplicação
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET=
REVALIDATE_SECRET=
TURNSTILE_SECRET=
NEXT_PUBLIC_SITE_URL=
```

Commitar `.env.example` com as chaves e valores vazios. Segredos de produção só na Vercel e no GitHub Actions. O usuário da aplicação não tem permissão de DDL — separação que impede um agente de alterar o schema fora do fluxo de migração, mesmo por engano.

---

## 14. Antes de considerar o projeto entregue

- [ ] Nenhum anexo obrigatório depende exclusivamente de link do Google Drive ou Figma
- [ ] `vw_pendencia_publicacao` vazia em produção
- [ ] Todos os áudios publicados têm transcrição e consentimento registrado
- [ ] Auditoria WCAG 2.1 AA sem violação séria; teste manual por teclado feito por pessoa
- [ ] Lighthouse ≥ 90 nas quatro categorias, medido em 3G simulado
- [ ] Créditos de fomento conforme o manual do edital, no site e nas capas dos PDFs
- [ ] Licenças declaradas em textos, dados e imagens
- [ ] Domínio pago com folga além do prazo do edital
- [ ] Depósito no Zenodo com DOI e arquivamento no Internet Archive concluídos
- [ ] `docs/` reflete o que está em produção
- [ ] Uma pessoa da equipe consegue publicar um anexo novo sem ajuda de agente
