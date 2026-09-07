# Auditoria de prontidão para a primeira publicação

**Data:** 2026-09-07
**Lote avaliado:** A02 + D01-01 a D01-07 (8 arquivos)
**Resultado:** **NÃO PRONTO — bloqueios arquiteturais e de configuração**
**Upload/publicação:** nenhum

## 1. Checkpoint documental

O registro pós-derivados foi isolado no commit `b73f8e1`
(`docs: registra producao de derivados publicos`). O commit contém somente
`ESTADO_ATUAL_PROJETO.md` e o relatório de privacidade. `ARCHITECTURE.md`,
originais, derivados e manifesto local não entraram no Git. Não houve push.

## 2. Semântica e constraints de `arquivo`

O modelo atual implementa `arquivo` como **objeto físico armazenado**: bucket,
chave, visibilidade e URL estão na própria linha. O SHA-256 identifica o
conteúdo, mas não é a identidade da linha.

| Questão | Resultado |
|---|---|
| `sha256` possui `UNIQUE` | NÃO — somente índice não único |
| `chave_storage` possui `UNIQUE` | SIM — global |
| `url_publica` possui `UNIQUE` | SIM; vários `NULL` são permitidos |
| `(bucket, chave_storage)` possui `UNIQUE` | NÃO |
| Uma linha representa | Um objeto físico em uma localização |

O mesmo SHA-256 pode coexistir em linhas privada e pública, desde que as
chaves sejam diferentes. O mesmo par de bytes com a mesma `chave_storage` em
dois buckets é recusado pelo `UNIQUE` global da chave. As chaves propostas no
dry-run são distintas das privadas, portanto D01-04 e D01-06 não colidem no
modelo atual; seus hashes públicos podem legitimamente ser iguais aos
privados.

## 3. Testes controlados com rollback

Os testes usaram `DATABASE_URL_MANUTENCAO`, inseriram apenas dados transitórios
e terminaram com `ROLLBACK`. O estado final foi reconferido.

### D01

- Sete linhas públicas puderam ser inseridas e vinculadas a D01.
- Com os sete vínculos `principal=false`, `vw_anexo_publico` retornou **0**.
- Marcar os sete como principais foi recusado por
  `idx_doc_arquivo_principal`.
- Com um único principal público, a view retornou **1**, e D01-08 retornou
  **0**.

Conclusão: o banco consegue armazenar sete objetos públicos e um privado, mas
o contrato público atual não consegue expor os sete. A view seleciona somente
`documento_arquivo.principal`, e existe no máximo um principal por documento.

### A02

O original privado foi mantido como vínculo não principal e o derivado público
como principal. `vw_anexo_publico` retornou **1 derivado público** e **0
originais privados**. A seleção SQL de A02 é correta.

### Estado real após rollback

`arquivo=10`, `documento_arquivo=10`, `PUBLICAVEL=0` e
`vw_anexo_publico=0`. A02, A04 e D01 permanecem `ESPELHAVEL`.

## 4. Consumidores públicos

| Consumidor | Gate por arquivo | Resultado atual |
|---|---|---|
| `vw_anexo_publico` | Estado, revisão, status, espelhamento, visibilidade e URL | Seguro contra arquivo privado, mas limita cada documento ao principal |
| `listarEvidenciasDeAnexos` | Lê a view | **BLOQUEIO:** grava `estado`, `revisao_privacidade` e `natureza` como `null`, apesar de a view expor os campos |
| Manifesto | `podePublicar` fail-closed | Seguro, porém retorna zero por causa do adaptador acima |
| Sala do Avaliador | `listarAnexosPublicos` | Mesmo zero do Manifesto |
| `/anexos.json` | `listarAnexosPublicos` | Mesmo zero do Manifesto |
| ZIP | `listarEvidenciasDeAnexos` + `podePublicar` | Mesmo zero do Manifesto; não incluiria A02 nem D01 |

Nenhum consumidor assume que `PUBLICAVEL` autoriza todos os arquivos; o erro é
o oposto e falha fechado. Ainda assim, o lote não funciona: D01 teria no
máximo um item na view e todos os itens seriam removidos pelo adaptador.

## 5. Proveniência

`arquivo.derivado_de_id`, `derivacao_metodo` e `derivacao_em` representam o
A02 corretamente com `redacao_versao_publica`. Há duas lacunas:

1. `metodo_derivacao` não possui saneamento de metadados; usar
   `conversao_formato` para D01-01, 02, 03, 05 e 07 seria impreciso.
2. D01-04 e D01-06 são cópias byte-identical, não derivados. O schema não tem
   relação específica para uma cópia física do mesmo conteúdo.

Além disso, a view não expõe proveniência de arquivo. O Manifesto constrói
`derivado_de` a partir do slug do documento e da URL de origem, sem consumir
`arquivo.derivado_de_id` ou `arquivo.derivacao_metodo`.

## 6. Configuração pública e colisões

As cinco variáveis públicas necessárias estão presentes e o bucket configurado
é `observatorio-publico`. `STORAGE_PUBLIC_URL` aponta para um subdomínio
`r2.dev`, não para domínio próprio. Isso contradiz o requisito de URL própria
das ADR-003 e ADR-006 e é bloqueio de produção.

O dry-run exato está em
`docs/carga/DRY_RUN_PUBLICACAO_2026-09-07.md`: oito candidatos, A02=1 e
D01=7. As oito chaves futuras estão **inexistentes** segundo `HeadObject`.
Nenhum upload foi feito.

## 7. Parecer

Não autorizar a primeira publicação ainda. Antes disso, uma decisão humana
deve aprovar uma correção versionada que:

- faça a view representar múltiplos arquivos públicos de um documento;
- faça o adaptador usar natureza, estado e revisão reais da view;
- represente com precisão saneamento de metadados e cópia byte-identical;
- defina a unicidade de localização por `(bucket, chave_storage)` ou mantenha
  formalmente a política de chaves globais distintas;
- configure domínio público próprio e atualize `STORAGE_PUBLIC_URL`.

A proposta comparativa está na ADR-016. Nenhuma migration foi criada ou
aplicada nesta auditoria.

## 8. Gates

`pnpm tipos`, `pnpm lint` e `pnpm teste` passaram. O lint manteve quatro
avisos CSS preexistentes; 234 testes passaram e três foram omitidos. Esses
gates não cobrem hoje o cenário público multiarquivo identificado nesta
auditoria. `pnpm build` não foi executado, conforme o escopo.
