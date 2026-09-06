# ADR-014 — Derivação determinística do inventário: XLSX → CSV

## Status

Aceita

## Data

2026-09-06

## Contexto

`inventario-de-anexos.xlsx` é a fonte canônica versionada do inventário de
anexos. Os scripts que consomem o inventário — `catalogar-documentos.ts` e
`espelhar-anexos.ts` — leem **CSV**, e recebiam o caminho por `--csv`.

O problema não era teórico. Ao investigar o fluxo, o estado era este:

- **nenhum CSV existia** no repositório ou fora dele;
- **nada gerava o CSV**: a etapa era exportação manual da aba pelo editor de
  planilha;
- portanto os dois scripts, na prática, **não tinham como rodar**.

E o modo de falha, quando passassem a rodar, era o pior possível numa
prestação de contas: editar o XLSX, esquecer de exportar, carregar o banco com
a versão antiga, e não haver nada que denunciasse a divergência. Duas fontes
de verdade para a mesma informação, com a errada sendo obedecida em silêncio.

## Decisão

**XLSX é fonte canônica. CSV é artefato derivado.** A derivação é
determinística, automatizada e verificável.

### O derivador

`scripts/derivar-inventario.py`, em Python 3 com **stdlib apenas** —
`zipfile`, `xml.etree.ElementTree`, `csv`, `hashlib`. Nenhuma dependência
nova, nenhum OCR, nenhum Excel ou LibreOffice no caminho.

Ele:

1. abre o XLSX como o zip que ele é;
2. **resolve a aba pelo nome**, `Inventário`, via `r:id` e o rels do workbook —
   não por índice, porque a ordem das abas muda no editor sem aviso;
3. resolve `sharedStrings`, e falha se um índice apontar fora da tabela;
4. preserva os cabeçalhos e a ordem das colunas;
5. escreve UTF-8 com `\n`, sem BOM;
6. valida **33 linhas**;
7. valida `Natureza` contra o vocabulário fechado;
8. valida **28 / 3 / 2** por natureza;
9. **falha se houver coluna obrigatória ausente ou coluna desconhecida** — o
   schema da planilha é contrato, e mudança silenciosa nele quebraria a carga;
10. valida que `Natureza` e `Exigido pelo edital` não divergem;
11. produz a mesma saída para a mesma entrada.

Falha de contrato levanta erro e **não degrada em saída parcial**. CSV
incompleto seria pior do que CSV nenhum.

### Detecção de stale

O derivador grava o SHA-256 do XLSX em `inventario-de-anexos.csv.origem`, ao
lado do CSV. Quem consome compara os dois antes de usar.

`src/lib/inventario-derivado.ts` expõe `conferirDerivacao()` e
`exigirDerivacaoAtual()`. Os dois scripts de carga chamam
`exigirDerivacaoAtual()` **antes** de ler o CSV e abortam se ele estiver
desatualizado. Divergência é erro, não aviso: carga silenciosa com dado velho
é exatamente o que não pode acontecer.

`python scripts/derivar-inventario.py --verificar` faz a mesma checagem sem
escrever, para uso em conferência.

### O CSV não é fonte de verdade

- está no `.gitignore`, junto com o sidecar;
- é regenerável a qualquer momento;
- **não deve ser editado à mão**;
- não substitui o XLSX em nenhuma circunstância.

Comandos: `pnpm derivar-inventario` e `pnpm conferir-inventario`.

## Por que Python, e não Node

Python 3 está garantido na máquina de manutenção, que é onde a derivação
acontece. E a stdlib do Python já traz leitor de zip, parser de XML e escritor
de CSV — a alternativa em Node seria escrever um parser de XLSX à mão sobre
`node:zlib`, o que é justamente o tipo de código artesanal que não se quer
manter num projeto de prestação de contas.

**A derivação não roda no CI.** O workflow executa `migrar`, `seed`, `tipos`,
`lint`, `teste`, `pendencias`, `build` e `a11y` — nenhum deles deriva o
inventário. Por isso o `ubuntu-latest` não precisa de `setup-python`.

Consequência para os testes: `testes/derivacao-inventario.test.ts` separa duas
coisas. A guarda contra CSV desatualizado é testada **sempre**, em TypeScript,
sem Python. A derivação de verdade roda em `describe.skipIf(!temPython())`, no
mesmo padrão dos testes de integração de banco do projeto — o skip aparece na
saída do Vitest, então a ausência de cobertura fica visível em vez de
silenciosa.

Se um dia a derivação precisar rodar em CI, a mudança é acrescentar
`actions/setup-python` ao workflow, não reescrever o derivador.

## Consequências

A exportação manual deixa de existir como etapa. O caminho de dados fica:

```text
inventario-de-anexos.xlsx        (fonte canônica, versionada)
        ↓  scripts/derivar-inventario.py
inventario-de-anexos.csv         (derivado, gitignored)
inventario-de-anexos.csv.origem  (sha256 do XLSX, para detectar stale)
        ↓  exigirDerivacaoAtual()
catalogar-documentos.ts / espelhar-anexos.ts
```

Custo: uma dependência de Python 3 na máquina de manutenção, e um passo a mais
antes de carregar. Ganho: a divergência entre planilha e carga passou de
provável a impossível de acontecer sem alguém ver.

## Alternativas rejeitadas

**Manter a exportação manual.** Rejeitada: é o ponto exato onde o fluxo
divergia, e não havia nada que detectasse a divergência.

**SheetJS ou `node-xlsx`.** Rejeitadas: SheetJS é pesada para a tarefa e tem
histórico de CVE; `node-xlsx` depende dela. Nada disso se justifica para ler
uma aba de 33 linhas.

**Parser de zip/XML artesanal em Node sobre `node:zlib`.** Rejeitada
explicitamente: funciona — foi assim que as marcas foram compostas nesta mesma
etapa — mas é código de infraestrutura que ninguém quer manter, quando a
stdlib do Python já resolve.

**Commitar o CSV.** Rejeitada: cria a segunda fonte de verdade que esta ADR
existe para eliminar.

## Fontes

- `PLANO_EXECUCAO_OBSERVATORIO.md` §2 — fonte canônica e artefato derivado;
- `docs/tarefas/06-espelhamento-de-arquivos.md`, seção *Inventário* — "o CSV é
  artefato intermediário de processamento, não fonte de verdade";
- ADR-013 — modelo documental, que a carga consome;
- `docs/03-guia-implementacao.md` §7 — gates e o que roda no CI.
