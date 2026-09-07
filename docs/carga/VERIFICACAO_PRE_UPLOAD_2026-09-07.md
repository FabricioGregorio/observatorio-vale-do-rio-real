# Verificação antes do primeiro upload privado

> Registro da verificação anterior ao Prompt 3.4.1, preservado como histórico.
> Os bloqueios abaixo foram tratados na continuação autorizada: vale agora
> [DRY_RUN_FINAL_PRIVADO_2026-09-07.md](./DRY_RUN_FINAL_PRIVADO_2026-09-07.md).
> O responsável adotou a fonte canônica atual como referência, dispensou hash
> histórico inexistente e fornecerá a confirmação administrativa do bucket.

**Data:** 2026-09-07. **Resultado:** NÃO pronto para upload.
Autorização desta rodada: leitura, correção/teste da compensação e parada antes
de qualquer upload. Nenhum PUT/DELETE real no R2, publicação, commit ou push.

## Git e checkpoint

- Branch ativa: `feat/home-indicadores`; upstream: `origin/main`.
- **Pendência de segurança: branch local rastreia origin/main.**
- Remote `origin`: `https://github.com/FabricioGregorio/observatorio-vale-do-rio-real.git`.
- `push.default`: não configurado. Não foi alterado.
- Checkpoint existente: `97bc88cc6166d900688764487c1cf32259b3d041`.
  Conferidos os dez caminhos: 0006, snapshot, journal, schema, script,
  storage privado, ADR-015, testes, dry-run e estado.
- Working tree inicial: somente `?? ARCHITECTURE.md`. Arquivo preservado fora
  do escopo. Nenhum checkpoint duplicado.
- As referências locais mostram quatro commits à frente de `origin/main`.
  Isso não prova se houve push; nenhum fetch/push foi executado nesta rodada.

## Banco — consultas de leitura

`DATABASE_URL` foi usada nas consultas do acervo. O histórico do Drizzle recusou
esse role com SQLSTATE 42501; foi consultado com `DATABASE_URL_MIGRACAO`, com
`default_transaction_read_only=on`, sem DDL. Pools encerrados em `finally`.

| Verificação | Resultado |
|---|---|
| Migrations 0001–0006 | 6/6 aplicadas; SHA-256 dos SQLs igual ao histórico do banco |
| documento / arquivo / documento_arquivo / pessoa / consentimento | 33 / 0 / 0 / 0 / 0 |
| Natureza | 28 item_exigido; 3 evidencia_complementar; 2 item_nao_exigido |
| Estados | 1 IMPEDIDO; 11 RESTRITO; 3 ESPELHAVEL; 18 PENDENTE; 0 PUBLICAVEL |
| Revisão | 33 pendente |
| vw_anexo_publico | 0 |
| arquivo.url_publica | nullable, UNIQUE preservado |
| bucket / chave_storage / visibilidade | NOT NULL; visibilidade tem default privado |
| CHECKs de bucket e visibilidade/URL | presentes e validados |
| Gate da view | exige arquivo público, URL presente, espelhamento, PUBLICAVEL e revisão concluída |

## R2 — somente leitura

`HeadBucket` autenticado confirmou bucket `observatorio-privado` existente e
credencial privada funcional. As dez chaves aprovadas responderam ausência:
**10 inexistentes, 0 idênticas, 0 diferentes**.

GET anônimo no endpoint S3 de uma chave aprovada respondeu **HTTP 400**. Isso
não prova ausência de exposição por outro domínio, sobretudo com objetos ainda
ausentes. `STORAGE_PRIVATE_PUBLIC_URL` não está configurada nem é usada pelo
código. O cliente privado não usa configuração pública nem define ACL.

**r2.dev e custom domains: NÃO VERIFICÁVEL pelo ambiente disponível.** Não há
token administrativo Cloudflare nas variáveis disponíveis. O único navegador
disponível abriu a tela de login do painel; nenhuma sessão autenticada foi
encontrada. A aba criada para a consulta foi fechada.

A API S3 do R2 não implementa GetBucketAcl, GetBucketPolicy ou
GetPublicAccessBlock; não foram usados como prova de privacidade. Referências:
[compatibilidade S3](https://developers.cloudflare.com/r2/api/s3/api/) e
[acesso público](https://developers.cloudflare.com/r2/buckets/public-buckets/).

## Dry-run recalculado

O derivador existente leu o XLSX atual em memória e validou 33 linhas/28/3/2.
O CSV existente é byte a byte igual à derivação atual. A02/A04 foram resolvidos
pelos slugs do inventário; D01 foi enumerado na pasta canônica, com oito arquivos.
As chaves foram recalculadas por categoria, slug e ordem do conjunto e comparadas
ao plano anterior. MIME conferido pela assinatura PDF/PNG e raiz XML dos SVGs.
Nenhum original, CSV ou sidecar foi modificado.

**10 arquivos: A02=1, A04=1, D01=8; 50.896.322 bytes.** Todos destinados a
`observatorio-privado`, visibilidade privada, URL pública NULL. As dez chaves e
caminhos relativos coincidem com `DRY_RUN_ESPELHAMENTO_2026-09-06.md`.
D01 mantém `principal=false` nos oito vínculos, conforme esse documento.

| Item / arquivo | Bytes | SHA-256 recalculado |
|---|---:|---|
| A02 / relatorio-tecnico-recanto-da-serra.pdf | 602121 | 18b7bbb11b6157af525c7e1c88b7e385763dadc094bb60fdf6f3a27d9c2aff91 |
| A04 / relatorio-tecnico-serra-dos-macacos.pdf | 76164 | 7e966429d1fccae8f7583ebc0fb6644c8f6393390e5a2a0d633cbe79a79a7cde |
| D01 / logo-oficial-tobias-sou-eu.png | 289486 | 30e62b84e725fd2cace825a6805a094481272b315e5d85187aa5614382016337 |
| D01 / logo.pdf | 12943470 | 14e3b886621e0d493e808dfd28e46c3886743997b30b06f7d09ea3940a5a59a2 |
| D01 / horizontal-monocromatica-escura.png | 123426 | efd532d88beeccce71a3e92c6705b582676f2965d90fb7599fde9383381ef940 |
| D01 / horizontal-monocromatica-escura.svg | 31520 | 8bda07efbe684aaae64cb28ff3b69b10cb572058aa9c4dfb04dbb670c6cef1dc |
| D01 / icon.png | 101189 | 6b230265d3c50b864bed83c5d3e7ddd02bd01998a92de818fefae487afc2571b |
| D01 / icon.svg | 704574 | f19d71e2ed22bfc1aac44be4760a07517d1f88cb2186cf6b59cdcbfa97d11883 |
| D01 / logo-e-texto.png | 424897 | d98a0eff2803f1819c8ab28cdd8ee61589ceba1f3ad97fe7d2911897e11f5116 |
| D01 / primeiro-post-observatorio.pdf | 35599475 | 3721a0e64c4ecf3e928206e5f9f9c1042303c2c5e9f205e38e9b095f85dcfdfe |

**Limite histórico:** 10/10 tamanhos e prefixos do dry-run anterior conferem;
apenas A02/A04 têm SHA-256 completo no inventário para comparação integral.
Não há baseline integral de D01 nos registros conferidos. Os hashes acima são
uma nova medição, não uma autorização retroativa nem prova integral de que os
oito hashes de D01 não mudaram desde o dry-run aprovado.

## Correções e testes

O checkpoint tinha a migração completa, mas seu script consultava colisões pelo
cliente público, aceitava metadado de hash sem ler o corpo e não compensava.
O fluxo corrigido consulta somente o privado, verifica SHA-256/bytes remotos,
distingue `criado_agora` de `preexistente` e usa PUT condicional. A marca de
execução fica em metadado, nunca na object key. ROLLBACK confirmado permite
compensar só a criação própria, com nova verificação de propriedade, DELETE
condicional e HEAD confirmando ausência. Erro de compensação interrompe e
reporta possível órfão. COMMIT incerto preserva o objeto para reconciliação.
O suporte operacional à exclusão condicional não foi exercitado no R2 real.

O script legado **ainda lê URLs externas e não implementa o lote local nem os
vínculos de D01**. Sua execução real foi bloqueada explicitamente. O dry-run
documentado acima foi recalculado por consultas de leitura, não pelo modo
`--dry-run` desse script legado. Falta um executor local revisável do lote.

Os testes de escrita real no R2 agora exigem `TESTE_R2_ESCRITA=autorizada`;
credenciais presentes não equivalem a autorização. Nesta rodada, a variável
foi explicitamente `proibida`. Testes de banco existentes usam rollback.

- `pnpm tipos`: passou.
- `pnpm lint`: passou, quatro avisos preexistentes de `!important` em tokens.css.
- `pnpm teste`: **211 passaram, 3 omitidos** (integração de escrita real R2).
- 18 testes novos de compensação/contrato S3 executados sem rede.
- Nenhum build. Nenhuma migration nova ou alterada.

Escopo adicional justificado: helper de compensação e testes cobrem a seção 10
da autorização; encerramento do pool atende ao cleanup; gate de integração
impede upload pelos testes; este registro e o estado documentam a verificação.
As políticas históricas da Tarefa 06 de não compensar cedem à instrução direta
do responsável no Prompt 3.4. Não foi aberta PR nem criado commit.

## Pendências antes de nova autorização

1. Comprovar r2.dev desabilitado e ausência de custom domains públicos.
2. Obter baseline integral anterior de D01 ou decisão humana sobre os hashes
   completos medidos nesta rodada, sem afirmar equivalência histórica integral.
3. Preparar/testar executor dos dez originais locais e persistência atômica de
   arquivo/documento_arquivo por objeto, preservando a semântica de D01.
4. Rever o diff das correções antes do primeiro upload.
