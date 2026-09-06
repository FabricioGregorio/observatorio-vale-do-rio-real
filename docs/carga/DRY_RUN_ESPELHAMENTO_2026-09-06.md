# Dry-run do espelhamento privado

**Data:** 2026-09-06 · **Etapa:** Prompt 3.3, §10 · **Status:** nenhum upload

Nenhum `PutObject`, nenhum `INSERT`. O banco não deve afirmar que existe
objeto no R2 antes de o objeto existir.

---

## A regra que este dry-run aplica

```text
ESPELHAVEL  ≠  PUBLICAVEL

ESPELHAVEL  = o binário pode ser copiado para storage controlado
PUBLICAVEL  = o binário pode ser exposto publicamente
```

Os três documentos abaixo estão `ESPELHAVEL` com
`revisao_privacidade = pendente`. Destino permitido **agora**: bucket
privado, `url_publica = NULL`. Nenhum deles pode ir ao bucket público
hoje — e o CHECK `arquivo_visibilidade_coerente` da 0006 impede a
combinação incoerente no próprio banco.

## §9 — auditoria dos três ESPELHAVEL

### A02 — Relatório Técnico — Recanto da Serra

| | |
|---|---|
| Fontes físicas | 1 arquivo(s), 0.57 MB |
| Revisão de privacidade atual | `pendente` |
| Destino permitido agora | **bucket privado**, `url_publica = NULL` |
| Precisa de derivado público? | SIM — versão pública precisa redigir os nomes |
| Indício de dado pessoal | SIM — a seção 3.2 nomeia trabalhadores remunerados; o resumo executivo também cita um nome |
| **Pode ir ao bucket público hoje?** | **NÃO** |

### A04 — Relato Técnico — Serra dos Macacos

| | |
|---|---|
| Fontes físicas | 1 arquivo(s), 0.07 MB |
| Revisão de privacidade atual | `pendente` |
| Destino permitido agora | **bucket privado**, `url_publica = NULL` |
| Precisa de derivado público? | A DECIDIR na revisão de privacidade |
| Indício de dado pessoal | INDÍCIO — cita o ator-chave Pedro Menezes pelo nome, que é entrevistado com consentimento localizado; exige triagem |
| **Pode ir ao bucket público hoje?** | **NÃO** |

### D01 — Identidade visual — logomarca e cards

| | |
|---|---|
| Fontes físicas | 8 arquivo(s), 47.89 MB |
| Revisão de privacidade atual | `pendente` |
| Destino permitido agora | **bucket privado**, `url_publica = NULL` |
| Precisa de derivado público? | NÃO para os logotipos; a peça de divulgação exige triagem |
| Indício de dado pessoal | INDÍCIO em um arquivo — `primeiro-post-observatorio.pdf` é peça de divulgação de 33,9 MB e pode conter fotografia de pessoa. Os sete restantes são logotipo |
| **Pode ir ao bucket público hoje?** | **NÃO** |

## §10 — plano de espelhamento

| Documento | Arquivo local | SHA-256 | Bytes | MIME | Bucket | Object key | Visib. | URL pública | Ação |
|---|---|---|---|---:|---|---|---|---|---|
| A02 | `relatorios/relatorio-tecnico-recanto-da-serra.pdf` | `18b7bbb11b61…` | 602121 | application/pdf | `observatorio-privado` | `arquivos/analise-de-dados/relatorio-tecnico-recanto-da-serra-v1.pdf` | `privado` | **NULL** | PutObject privado + INSERT |
| A04 | `relatorios/relatorio-tecnico-serra-dos-macacos.pdf` | `7e966429d1fc…` | 76164 | application/pdf | `observatorio-privado` | `arquivos/analise-de-dados/relatorio-tecnico-serra-dos-macacos-v1.pdf` | `privado` | **NULL** | PutObject privado + INSERT |
| D01 | `identidade-visual/coletivo-tobias-sou-eu/logo-oficial-tobias-sou-eu.png` | `30e62b84e725…` | 289486 | image/png | `observatorio-privado` | `arquivos/publicidade/identidade-visual-01-logo-oficial-tobias-sou-eu-v1.png` | `privado` | **NULL** | PutObject privado + INSERT |
| D01 | `identidade-visual/coletivo-tobias-sou-eu/logo.pdf` | `14e3b886621e…` | 12943470 | application/pdf | `observatorio-privado` | `arquivos/publicidade/identidade-visual-02-logo-v1.pdf` | `privado` | **NULL** | PutObject privado + INSERT |
| D01 | `identidade-visual/observatorio/horizontal-monocromatica-escura.png` | `efd532d88bee…` | 123426 | image/png | `observatorio-privado` | `arquivos/publicidade/identidade-visual-03-horizontal-monocromatica-escura-v1.png` | `privado` | **NULL** | PutObject privado + INSERT |
| D01 | `identidade-visual/observatorio/horizontal-monocromatica-escura.svg` | `8bda07efbe68…` | 31520 | image/svg+xml | `observatorio-privado` | `arquivos/publicidade/identidade-visual-04-horizontal-monocromatica-escura-v1.svg` | `privado` | **NULL** | PutObject privado + INSERT |
| D01 | `identidade-visual/observatorio/icon.png` | `6b230265d3c5…` | 101189 | image/png | `observatorio-privado` | `arquivos/publicidade/identidade-visual-05-icon-v1.png` | `privado` | **NULL** | PutObject privado + INSERT |
| D01 | `identidade-visual/observatorio/icon.svg` | `f19d71e2ed22…` | 704574 | image/svg+xml | `observatorio-privado` | `arquivos/publicidade/identidade-visual-06-icon-v1.svg` | `privado` | **NULL** | PutObject privado + INSERT |
| D01 | `identidade-visual/observatorio/logo-e-texto.png` | `d98a0eff2803…` | 424897 | image/png | `observatorio-privado` | `arquivos/publicidade/identidade-visual-07-logo-e-texto-v1.png` | `privado` | **NULL** | PutObject privado + INSERT |
| D01 | `identidade-visual/observatorio/primeiro-post-observatorio.pdf` | `3721a0e64c4e…` | 35599475 | application/pdf | `observatorio-privado` | `arquivos/publicidade/identidade-visual-08-primeiro-post-observatorio-v1.pdf` | `privado` | **NULL** | PutObject privado + INSERT |

**Objetos privados propostos: 10.** Bytes totais: 50.896.322.

Nenhum objeto público proposto. Nenhuma URL pública gerada.

## §11 — object keys

Seguem a convenção que já existia em `chaveStorage()`:

```text
arquivos/<categoria>/<slug>-v<n>.<ext>
```

Determinísticas, derivadas de categoria e slug do inventário. Sem caminho
absoluto, sem nome de usuário, sem `Desktop`, sem dado pessoal.

Ajuste necessário para conjunto: `D01` tem oito arquivos e um slug só. A
chave recebe um sufixo `-NN-<nome-do-arquivo>` antes da versão, o que mantém
a chave determinística e única sem quebrar o padrão. **A fonte local não é
renomeada por causa da chave.**

## §12 — o que seria persistido em `arquivo`

Um `INSERT` por arquivo, **somente depois** do upload real:

```text
chave_storage   = a object key acima
bucket          = observatorio-privado
visibilidade    = privado
url_publica     = NULL
sha256          = o hash conferido do original local
bytes           = tamanho real
mime_type       = tipo real
tipo_midia      = derivado do MIME
origem_url      = o que o inventário registra em 'Link atual'
origem_sistema  = vocabulário da Tarefa 06
espelhado_em    = momento do upload
```

E um `documento_arquivo` ligando ao documento, com `principal` verdadeiro
apenas onde houver um arquivo principal inequívoco — **não** em `D01`, que
é conjunto de oito.

**Nada disso foi executado.** O banco segue com `arquivo = 0` e
`documento_arquivo = 0`.

## §8 — ciclo de vida formalizado

```text
original local (observatorio-fontes, fora do Git)
      │
      ├─ hash conferido
      ▼
espelhamento PRIVADO  ──►  arquivo(bucket=privado, url_publica=NULL)
      │
      ▼
revisão de privacidade humana
      │
      ├─ aprovado sem redação ──► promoção do objeto ao bucket público
      │                            arquivo público, hash próprio, URL real
      │
      └─ exige redação ──────────► DERIVADO público, arquivo novo
                                   ORIGINAL permanece privado
                                   hashes distintos, derivado_de registrado
```

O original privado **não é movido automaticamente** para o bucket público.
Quando houver redação, original e derivado coexistem: o original continua
privado e os hashes permanecem distintos.