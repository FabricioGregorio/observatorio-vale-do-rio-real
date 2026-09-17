# Documentos de fase do frontend

Estes arquivos são **registro de execução**, não instrução vigente.

Cada um foi a instrução de uma fase do frontend (H0 a H4.5.2) enquanto ela
estava sendo feita. Depois de executada, o documento permanece porque é prova
do que foi decidido, por quem e com que base — o que um projeto de edital
público precisa guardar. Ele deixa de ser ordem de trabalho.

## Hierarquia de instrução

Um agente que precise saber **o que fazer agora** lê, nesta ordem:

1. instrução direta do responsável humano na sessão;
2. [`AGENTS.md`](../../AGENTS.md) — contrato de trabalho;
3. [`docs/02-arquitetura-banco.md`](../02-arquitetura-banco.md);
4. [`docs/01-arquitetura-informacao.md`](../01-arquitetura-informacao.md);
5. [`docs/03-guia-implementacao.md`](../03-guia-implementacao.md);
6. as ADRs em [`docs/decisoes/`](../decisoes/);
7. o arquivo da tarefa em [`docs/tarefas/`](../tarefas/).

Nada desta pasta entra nessa lista. Em conflito entre um documento daqui e
qualquer item acima, vale o item acima.

## O que foi superado pela consolidação de 2026-09-17

A Home estrutural H0–H4.1 deixou de existir no código: `/` passou a ser servida
pela composição em `src/componentes/home/`, e os componentes da Home anterior
foram removidos. Os documentos abaixo continuam descrevendo aquela composição e
**não** descrevem o produto atual:

- `PLANO_HOME_PILOTO_1_0.md`;
- `H1_INTEGRACAO_HERO_HOME.md`;
- `H2_INTEGRACAO_TERRITORIO_HOME.md`;
- `H3_INTEGRACAO_PESQUISA_HOME.md`;
- `H4_5_1_REFINO_DADOS_HOME.md`.

Eles ficam porque registram trabalho executado e prestado, e porque
[`ESTADO_ATUAL_PROJETO.md`](../../ESTADO_ATUAL_PROJETO.md) os referencia como
prova de fase. A autoridade **editorial** fixada em `H4_5_2_FECHAMENTO_EDITORIAL_DADOS.md`
(título, ordem e rótulos da leitura quantitativa) continua valendo e é citada
pelo código atual.
