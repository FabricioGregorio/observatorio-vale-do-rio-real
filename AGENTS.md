# Contrato de trabalho — Observatório do Vale do Rio Real

Projeto financiado por edital público (PNAB nº 02/2025), com prestação de contas à
FUNCAP/SE. O site é prova documental de execução do objeto. Erro aqui tem consequência
jurídica e financeira, não só técnica.

## Antes de qualquer tarefa

1. Ler `docs/01-arquitetura-informacao.md` e `docs/02-arquitetura-banco.md`.
2. Ler o arquivo da tarefa em `docs/tarefas/`.
3. Se a tarefa contradisser a documentação, PARAR e perguntar. Não improvisar.

## Hierarquia de fontes de verdade

Em caso de conflito, vence quem está mais acima:

1. Instrução direta do responsável humano nesta sessão
2. `docs/02-arquitetura-banco.md`
3. `docs/01-arquitetura-informacao.md`
4. `docs/03-guia-implementacao.md`
5. O código existente
6. O que o agente acha que seria uma boa ideia

Alterar os itens 2 e 3 não é atribuição do agente. Se a tarefa parecer exigir mudança de
schema ou de rota, escreva a proposta em `docs/decisoes/` e devolva a decisão ao humano.

## Nunca

- Alterar migração já aplicada. Correção é sempre uma nova migração.
- Usar `any`, `@ts-ignore` ou desabilitar regra de lint para fazer o check passar.
- Acessar o banco fora de `src/dados/consultas/`.
- Inventar nome ou versão de pacote. Instalar por `pnpm add <pacote>@latest`.
- Commitar segredo, `.env` ou chave de serviço.
- Criar dado fictício: "Lorem ipsum", equipamento inventado, entrevista falsa, número
  de meta estimado. Conteúdo ausente é `null` com estado vazio explícito — jamais um
  placeholder plausível. Num site de prestação de contas isso não é bug de UI, é
  problema de integridade da pesquisa.
- Renderizar imagem sem `alt` ou áudio sem transcrição vinculada.
- Introduzir cor, fonte ou espaçamento fora de `src/estilos/tokens.css`.
- Adicionar script de terceiro que faça rastreio ou grave cookie.

## Sempre

- TypeScript estrito. Validar toda entrada externa com Zod.
- Server Components por padrão; `"use client"` só com justificativa escrita no PR.
- Buscar dados em build time. Nunca consultar o banco em tempo de requisição.
- Escrever o teste junto com a funcionalidade, não depois.
- Rodar `pnpm verificar` antes de abrir PR. Se falhar, não abre.
- Escrever em pt-BR: identificadores de domínio, comentários e textos de interface.
- Diff pequeno. Uma tarefa, um PR. Acima de ~400 linhas, fatiar.

## Escopo de arquivos

Cada arquivo em `docs/tarefas/` lista os arquivos permitidos. Editar fora dessa lista
exige justificativa no PR. Essa restrição é o principal controle contra mudança colateral.

## Se ficar em dúvida

Escreva a dúvida no PR e entregue a parte que está certa. Uma pergunta custa minutos;
uma suposição errada em prestação de contas custa o edital.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
