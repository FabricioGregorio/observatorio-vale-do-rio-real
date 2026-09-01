# TAREFA 08 — Sala do Avaliador

**Fase:** 1 · **Depende de:** 03, 05, 06, 07 · **Estimativa de diff:** médio

## Objetivo

A página mais importante do site: tudo que a FUNCAP precisa, em um lugar, sem login e
sem link quebrado.

## Contexto obrigatório

- `docs/01-arquitetura-informacao.md`, seção 4
- `docs/02-arquitetura-banco.md`, seção 13

## Arquivos permitidos

```
src/app/prestacao-de-contas/page.tsx
src/app/prestacao-de-contas/imprimir/page.tsx
src/componentes/acervo/TabelaAnexos.tsx
src/dados/consultas/anexos.ts
src/app/anexos.json/route.ts
scripts/gerar-zip-anexos.ts  ·  src/lib/storage.ts  ·  db/schema.ts (só pgView existing)
testes/*  ·  package.json  ·  pnpm-lock.yaml
```

## Critérios de aceite

- [ ] Tabela com item do edital, descrição, formato, link permanente, link de origem,
      data de publicação e SHA-256, alimentada por `vw_anexo_publico`
- [ ] Tabela real (`<table>` com `<caption>` e `<th scope>`), navegável por leitor de tela;
      em telas estreitas vira lista de fichas sem perder a semântica
- [ ] SHA-256 truncado na exibição, com valor integral copiável
- [ ] Botão "Baixar tudo (.zip)" gerado em build, não sob demanda
- [ ] Versão imprimível em `/prestacao-de-contas/imprimir`, com folha de estilo de impressão
- [ ] `/anexos.json` servindo o mesmo conjunto, com `Content-Type: application/json`
- [ ] A consulta filtra `espelhado = true`: a Sala só mostra anexo com espelho próprio
- [ ] Página gerada estaticamente; nenhuma consulta em tempo de requisição
- [ ] Estado vazio explícito quando não houver anexo publicado — nunca linha de exemplo

## Como verificar

```bash
pnpm build && pnpm a11y
curl -s localhost:3000/anexos.json | head
```

## Decisões fechadas em 2026-08-31

### Dependência da Tarefa 03

Mantida. A sequência de implementação é **02 → 03 → 08**. A Sala do Avaliador não é
implementada antes de o layout base existir.

### URL de `/anexos.json`

A URL normativa é **`/anexos.json`**, como o doc 01 §4 e a ADR-003 item 7 exigem.

O arquivo permitido passou de `src/app/api/anexos/route.ts` para
**`src/app/anexos.json/route.ts`**. O caminho antigo produziria `/api/anexos`, que é
outra URL e outro contrato. **Sem rewrite e sem mudança de contrato.**

O App Router aceita ponto no nome do segmento: a documentação do Next 16.3.3 instalado
traz `app/rss.xml/route.ts` como exemplo, e afirma que `app/data.json/route.ts`
*"will render to a static file during next build"*. O handler declara
`export const dynamic = "force-static"` — sem isso, Route Handler não é cacheado por
padrão nesta versão, e a rota viraria dinâmica, contra a ADR-001.

### "Baixar tudo (.zip)"

Mantido, e **gerado em build**. Nunca sob demanda, em request ou por proxy.

O ZIP é produzido por `scripts/gerar-zip-anexos.ts`, executado antes do `next build`.
O script usa a mesma consulta da Sala (com `espelhado = true`), busca os objetos no R2
pelo cliente S3 que já existe em `src/lib/storage.ts` e grava um único arquivo.

**O artefato é publicado no R2**, não em `public/`. O link do botão aponta para
`STORAGE_PUBLIC_URL`. A razão é a mesma que a ADR-006 usou para escolher o R2: o site
existe para que avaliadores baixem documentos, e servir o ZIP pela hospedagem colocaria
o tráfego de saída no caminho pago. Também mantém o tamanho do deploy constante,
independentemente do acervo.

Como nada é escrito em `public/`, **não há artefato gerado passando pelo Git** — não é
preciso entrada nova no `.gitignore` por causa do ZIP.

**Dependência:** `fflate`. Nada adequado está instalado — `node:zlib` oferece
`deflate`/`gzip`, que são algoritmos de compressão e não o formato de contêiner ZIP
(cabeçalhos locais, diretório central, CRC-32). `fflate` é a menor opção sem
dependências transitivas e permite `level: 0`, relevante porque PDF e MP3 já vêm
comprimidos.

`src/lib/storage.ts` ganha `GetObjectCommand` — hoje só tem `Head` e `Put`.

**Comportamento na ausência de credenciais** — decidido em 2026-09-01, porque o script
entra no `pnpm build` e as credenciais não existem em todo ambiente:

- **Desenvolvimento e teste, sem credenciais do R2:** o script **não gera o ZIP** e
  **termina com sucesso**, informando o que deixou de fazer. `pnpm build` continua
  funcionando na máquina de quem não tem acesso ao storage.
- **Produção, sem as credenciais obrigatórias:** **falha explícita**, com código de saída
  diferente de zero. Publicar a Sala do Avaliador com o botão "Baixar tudo" apontando
  para um objeto que não existe seria pior do que não publicar.

A distinção entre os dois casos vem de `NODE_ENV`, que funciona ali porque o script
roda **fora** do `next build`. O silêncio nunca é a saída: nos dois casos o script diz
em texto o que fez e por quê.

### Consulta sem `DATABASE_URL` — decidido em 2026-09-01

A regra acima **não serve para a consulta da página**, e o motivo é concreto:
`next build` define `NODE_ENV=production` sempre, inclusive na máquina de quem não tem
credencial. Usar `NODE_ENV` ali faria todo build local falhar.

Regra da consulta:

- **`DATABASE_URL` ausente:** avisa no console e devolve lista vazia. A página renderiza
  o estado vazio explícito que os critérios já exigem, e `pnpm build` continua
  funcionando sem banco.
- **`DATABASE_URL` presente:** consulta normal, filtrando `espelhado = true`.

Isso **não** abre caminho para publicar uma Sala vazia sem perceber: o
`.github/workflows/ci.yml` já define `DATABASE_URL`, então o pipeline real nunca cai no
ramo vazio. O ramo existe para a máquina de desenvolvimento.

O cliente do banco é importado **sob demanda** dentro da função, nunca no topo do
módulo: `src/dados/cliente.ts` lança ao ser carregado sem a variável, e um import
estático derrubaria o build antes de a regra acima ser avaliada.

### Filtro `espelhado = true`

A `vw_anexo_publico` (migração 0002) já expõe a coluna
`(a.espelhado_em IS NOT NULL) AS espelhado`, mas **não filtra por ela** — a view junta
por `da.principal` e por `d.status = 'publicado'`.

O filtro é responsabilidade da **consulta**, em `src/dados/consultas/anexos.ts`.
**A migração 0002 e a view aplicada não são alteradas, e nenhuma migração nova é criada
por causa disso.**

Para consultá-la pelo Drizzle, `db/schema.ts` declara
`pgView("vw_anexo_publico", { … }).existing()` — **declaração de objeto já existente,
que não gera DDL nem entra em migração**. É o caminho que o doc 03 §6.5 prescreve:
views são criadas por migração e consumidas via Drizzle como tabelas somente leitura.

### Testes

Autorizada a criação de arquivos em `testes/` e a alteração de `package.json` e
`pnpm-lock.yaml` quando necessário ao contrato de testes. Nenhum teste existente é
removido.

### Zod

**Não** adicionar Zod para validar resultado de consulta ao PostgreSQL. As três rotas
desta tarefa — `/prestacao-de-contas`, `/prestacao-de-contas/imprimir` e
`/anexos.json` — são estáticas e não recebem query string nem parâmetro de rota, então
não há entrada externa a validar. Se uma entrada externa aparecer, ela é validada.

## Fora de escopo

Página de metas (tarefa 14) e busca (tarefa 25).
