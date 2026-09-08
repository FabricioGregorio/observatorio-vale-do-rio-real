# Primeira publicação pública — A02 e D01-01 a D01-07

**Data:** 2026-09-08

**Checkpoint autorizado:** `11c309943094534ad0af424fccc7e916195cc39a`

**Domínio:** `https://acervo.observatoriotobiassoueu.com.br`

**Cache-Control:** `public, max-age=86400`

**Escopo:** A02=1, D01=7, total=8

## Resultado operacional

O dry-run imediatamente anterior ao primeiro upload confirmou oito arquivos
locais íntegros, oito chaves públicas inexistentes, zero objeto idêntico
preexistente e zero colisão divergente. A04 e D01-08 estavam ausentes do lote.

Foram tentados e concluídos exatamente oito `PutObject`. Cada objeto foi criado
nesta execução, sem ACL manual, no bucket `observatorio-publico`. Antes de
qualquer escrita no banco, os oito foram baixados novamente por acesso
autenticado e conferidos por SHA-256, bytes, Content-Type e Cache-Control:
**8/8 em todos os quatro controles**. ETag não foi usado como prova de
integridade.

| Código | SHA-256 público | Bytes | MIME | Relação com o original privado |
|---|---|---:|---|---|
| A02 | `b314cd7a5330276ecccc0c7cfe7dfe6461da721055318c15957db5cd7848961a` | 756.239 | `application/pdf` | derivado — `tarjamento_privacidade` |
| D01-01 | `b8842594544c579a9fc508a912b9a913030013eb6de16704a007c7fefcc323f5` | 257.102 | `image/png` | derivado — `sanitizacao_metadados` |
| D01-02 | `882810f458c2bb92d51c24dad691bb2553d0373125e70884e25856571ca2f551` | 12.943.416 | `application/pdf` | derivado — `sanitizacao_metadados` |
| D01-03 | `a52ccb2202f19b93e383e22295ff68e781ba3dbb5403983168c40b47c332659e` | 129.763 | `image/png` | derivado — `sanitizacao_metadados` |
| D01-04 | `8bda07efbe684aaae64cb28ff3b69b10cb572058aa9c4dfb04dbb670c6cef1dc` | 31.520 | `image/svg+xml` | réplica byte-identical |
| D01-05 | `ec8c13aee802c5baaac15a11a5c8813ff5cb6733107bcae6c9c82dd79b6426a4` | 100.975 | `image/png` | derivado — `sanitizacao_metadados` |
| D01-06 | `f19d71e2ed22bfc1aac44be4760a07517d1f88cb2186cf6b59cdcbfa97d11883` | 704.574 | `image/svg+xml` | réplica byte-identical |
| D01-07 | `9af5c7b249456496cf0a6a66a67a4262c1959be04eed93f9197ec02fc9e25846` | 400.824 | `image/png` | derivado — `sanitizacao_metadados` |

`immutable` não foi usado. Nenhuma chave deriva do endpoint S3 ou de r2.dev;
as URLs foram formadas exclusivamente a partir de `STORAGE_PUBLIC_URL`.

## Persistência atômica

Depois da verificação autenticada, uma única transação com
`DATABASE_URL_MANUTENCAO`:

1. inseriu oito linhas públicas em `arquivo`;
2. registrou a proveniência aprovada;
3. criou oito vínculos em `documento_arquivo`, todos `principal=false`;
4. promoveu somente A02 e D01 para `PUBLICAVEL`.

O contrato vigente de `vw_anexo_publico` também exige os campos legados
`status=publicado` e `publicado_em`. Eles foram preenchidos para A02 e D01 na
mesma transação, conforme o comportamento já documentado e coberto pelos
testes. A04 e os demais documentos não foram alterados.

Invariantes confirmadas antes e depois do COMMIT:

| Controle | Resultado |
|---|---:|
| `documento` | 33 |
| `arquivo` | 18 |
| `documento_arquivo` | 18 |
| documentos `PUBLICAVEL` | 2 |
| `vw_anexo_publico` | 8 |
| A02 público | 1 |
| D01 público | 7 |
| A04 público | 0 |
| D01-08 público | 0 |
| A02 original na view | 0 |
| `pessoa` / `consentimento` | 0 / 0 |

A02 ficou `PUBLICAVEL` e com revisão concluída. D01 ficou `PUBLICAVEL` e com
revisão concluída. A04 permanece `ESPELHAVEL`. D01-08 continua somente no
storage privado, por sua função de referência visual interna.

## Validação pública e consumidores

Após o COMMIT, as oito URLs no Custom Domain responderam HTTP 200. O conteúdo
baixado publicamente conferiu SHA-256 e bytes em 8/8; Content-Type e
Cache-Control também conferiram em 8/8. Foram encontradas zero URLs r2.dev,
zero endpoints S3 e zero referências privadas.

Manifesto, `/anexos.json`, Sala do Avaliador e conjunto lógico do ZIP
produziram o mesmo total de oito itens. O ZIP foi montado somente em memória e
não foi enviado ao storage. A inspeção local da Sala confirmou A02, os sete
arquivos de D01 e ausência de A04, D01-08 e links privados. `/anexos.json`
respondeu HTTP 200 com JSON válido e total 8.

O dry-run pós-publicação reconheceu os oito objetos remotos e os oito registros
como idênticos: zero novo `PutObject`, zero INSERT, zero promoção, zero
sobrescrita. Não houve falha de upload, compensação nem objeto órfão.

## Gates e encerramento

- `pnpm tipos`: passou.
- `pnpm lint`: passou, preservando quatro avisos CSS preexistentes.
- `pnpm teste`: 241 aprovados, 3 omitidos, zero falhas.
- `pnpm a11y`: 46 aprovados, zero falhas.

Os testes de integração foram atualizados para conferir o estado persistido de
18 arquivos e 18 vínculos, além de preservar e validar separadamente os dez
objetos privados. O teste multiarquivo continua reconstituindo o cenário
pré-publicação somente dentro de uma transação desfeita. Os testes de navegador
agora exigem os oito anexos reais e a ausência de A04, D01-08 e referências
privadas.

## Limites preservados

Não houve upload de ZIP, publicação de A04 ou D01-08, alteração de originais ou
derivados locais, carga de pessoa/consentimento, build, deploy ou push. O
executor operacional temporário não integra o Git; o checkpoint posterior
contém somente este registro, o estado atual e testes ajustados ao estado real.
