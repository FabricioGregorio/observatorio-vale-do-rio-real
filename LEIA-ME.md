# Pacote inicial — Observatório do Vale do Rio Real

Conteúdo pronto para virar o commit inicial do repositório.

## O que tem aqui

```
AGENTS.md                      contrato de trabalho dos agentes (leitura obrigatória)
CLAUDE.md / GEMINI.md          ponteiros para AGENTS.md
.github/copilot-instructions.md  ponteiro para AGENTS.md
.github/pull_request_template.md
.github/workflows/ci.yml       CI com todos os gates, incluindo o de pendências
.env.example                   variáveis, sem nenhum segredo
.nvmrc
src/estilos/tokens.css         paleta, tipografia e contrastes verificados
docs/01-arquitetura-informacao.md
docs/02-arquitetura-banco.md
docs/03-guia-implementacao.md
docs/tarefas/00-modelo.md      formato para as tarefas 10 a 25
docs/tarefas/01..09            Fase 1 pronta para virar prompt
docs/decisoes/                 vazio — receberá os ADRs
inventario-de-anexos.xlsx      inventário dos 30 anexos, com resumo e legenda
```

## Ordem de uso

1. Criar o repositório e copiar tudo isto para a raiz.
2. Commit inicial **antes** de qualquer código: os documentos precisam existir antes
   do primeiro agente rodar, senão ele trabalha sem contrato.
3. Abrir a tarefa 01 e usar o modelo de prompt da seção 11 do guia de implementação.
4. Uma tarefa por branch, um PR por tarefa, revisão humana antes de todo merge.

## O que ainda depende de você

Nada disso bloqueia as tarefas 01 a 05.

- **Domínio e hospedagem definidos** — bloqueiam a tarefa 06, porque a URL permanente
  entra no banco junto com o hash.
- **Acesso de download aos arquivos do Drive e do Figma** — bloqueiam a tarefa 06.
- **Manual de aplicação de marcas do edital** (item E02 do inventário) — bloqueia a
  tarefa 03. Sem ele, não estime proporção nem ordem das marcas.
- **Termos de consentimento das entrevistas** (item E01) — não bloqueiam desenvolvimento,
  mas bloqueiam a publicação de qualquer áudio. O gate de CI vai barrar, corretamente.
- **Os quatro anexos ainda sem link**: diagnósticos internos, relatos de campo, documento
  final com a modelagem estatística e o podcast.

## Sobre o inventário

A aba Resumo mostra hoje: 30 itens, 28 exigidos pelo edital, 10 disponíveis, 13 pendentes,
5 a confirmar e 2 com link errado. Treze itens dependem hoje de Google Drive, Docs, Forms
ou Figma — e é exatamente esse número que a tarefa 06 precisa zerar.

Os dois itens marcados como "A corrigir" são os formulários: o endereço registrado é o de
edição do Google Forms, que não abre para terceiros.
