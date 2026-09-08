# Dry-run da primeira publicação — A02 e D01-01 a D01-07

> **Situação posterior:** este documento permanece como registro histórico do
> estado pré-publicação. A operação autorizada foi concluída em 2026-09-08 e
> está registrada em
> [`PRIMEIRA_PUBLICACAO_PUBLICA_2026-09-08.md`](./PRIMEIRA_PUBLICACAO_PUBLICA_2026-09-08.md).

**Data:** 2026-09-07
**Operação:** somente leitura local + `HeadObject`, revalidada após a migration 0007
**Uploads:** 0
**Alterações no banco:** 0

Este inventário descreve oito objetos futuros. As chaves são propostas para a
operação posterior e não constituem autorização de upload ou publicação.
`STORAGE_PUBLIC_URL` está configurada em `r2.dev`; por isso as URLs derivadas
abaixo **não estão aprovadas para produção**.

| Código | Origem local relativa a `OBSERVATORIO_FONTES_DIR` | SHA-256 | Bytes | MIME | Chave futura | URL futura derivada da configuração | Tipo | HEAD |
|---|---|---|---:|---|---|---|---|---|
| A02 | `derivados-publicos/A02/a02-relatorio-tecnico-recanto-da-serra-publico-v1.pdf` | `b314cd7a5330276ecccc0c7cfe7dfe6461da721055318c15957db5cd7848961a` | 756.239 | `application/pdf` | `arquivos/analise-de-dados/a02-relatorio-tecnico-recanto-da-serra-publico-v1.pdf` | `STORAGE_PUBLIC_URL/arquivos/analise-de-dados/a02-relatorio-tecnico-recanto-da-serra-publico-v1.pdf` | derivado sanitizado | inexistente |
| D01-01 | `derivados-publicos/D01/d01-01-logo-oficial-tobias-sou-eu-publico-v1.png` | `b8842594544c579a9fc508a912b9a913030013eb6de16704a007c7fefcc323f5` | 257.102 | `image/png` | `arquivos/publicidade/d01-01-logo-oficial-tobias-sou-eu-publico-v1.png` | `STORAGE_PUBLIC_URL/arquivos/publicidade/d01-01-logo-oficial-tobias-sou-eu-publico-v1.png` | derivado sanitizado | inexistente |
| D01-02 | `derivados-publicos/D01/d01-02-logo-publico-v1.pdf` | `882810f458c2bb92d51c24dad691bb2553d0373125e70884e25856571ca2f551` | 12.943.416 | `application/pdf` | `arquivos/publicidade/d01-02-logo-publico-v1.pdf` | `STORAGE_PUBLIC_URL/arquivos/publicidade/d01-02-logo-publico-v1.pdf` | derivado sanitizado | inexistente |
| D01-03 | `derivados-publicos/D01/d01-03-horizontal-monocromatica-escura-publico-v1.png` | `a52ccb2202f19b93e383e22295ff68e781ba3dbb5403983168c40b47c332659e` | 129.763 | `image/png` | `arquivos/publicidade/d01-03-horizontal-monocromatica-escura-publico-v1.png` | `STORAGE_PUBLIC_URL/arquivos/publicidade/d01-03-horizontal-monocromatica-escura-publico-v1.png` | derivado sanitizado | inexistente |
| D01-04 | `identidade-visual/observatorio/horizontal-monocromatica-escura.svg` | `8bda07efbe684aaae64cb28ff3b69b10cb572058aa9c4dfb04dbb670c6cef1dc` | 31.520 | `image/svg+xml` | `arquivos/publicidade/d01-04-horizontal-monocromatica-escura-v1.svg` | `STORAGE_PUBLIC_URL/arquivos/publicidade/d01-04-horizontal-monocromatica-escura-v1.svg` | cópia byte-identical | inexistente |
| D01-05 | `derivados-publicos/D01/d01-05-icon-publico-v1.png` | `ec8c13aee802c5baaac15a11a5c8813ff5cb6733107bcae6c9c82dd79b6426a4` | 100.975 | `image/png` | `arquivos/publicidade/d01-05-icon-publico-v1.png` | `STORAGE_PUBLIC_URL/arquivos/publicidade/d01-05-icon-publico-v1.png` | derivado sanitizado | inexistente |
| D01-06 | `identidade-visual/observatorio/icon.svg` | `f19d71e2ed22bfc1aac44be4760a07517d1f88cb2186cf6b59cdcbfa97d11883` | 704.574 | `image/svg+xml` | `arquivos/publicidade/d01-06-icon-v1.svg` | `STORAGE_PUBLIC_URL/arquivos/publicidade/d01-06-icon-v1.svg` | cópia byte-identical | inexistente |
| D01-07 | `derivados-publicos/D01/d01-07-logo-e-texto-publico-v1.png` | `9af5c7b249456496cf0a6a66a67a4262c1959be04eed93f9197ec02fc9e25846` | 400.824 | `image/png` | `arquivos/publicidade/d01-07-logo-e-texto-publico-v1.png` | `STORAGE_PUBLIC_URL/arquivos/publicidade/d01-07-logo-e-texto-publico-v1.png` | derivado sanitizado | inexistente |

Bucket futuro configurado: `observatorio-publico`. As oito consultas HEAD
retornaram ausência. Nenhum `PutObject`, cópia, exclusão ou listagem ampla foi
executado. A04 e D01-08 não integram o lote.

## Revalidação após a correção multiarquivo

Após a aplicação da migration 0007, as mesmas oito chaves foram consultadas
novamente com `HeadObject`: **8 consultas, 0 objetos existentes e 0 colisões**.
O lote permanece A02=1 e D01=7. A operação não executou `PutObject` e não
alterou banco, configuração ou storage.
