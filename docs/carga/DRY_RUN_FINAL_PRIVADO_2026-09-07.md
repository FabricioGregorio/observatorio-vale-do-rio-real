# Primeiro lote privado — executor e checkpoint pré-upload

**Data:** 2026-09-07. **Prompt:** 3.4.1.
**Resultado:** pronto tecnicamente para os dez uploads, aguardando somente
autorização humana, incluindo confirmação administrativa de r2.dev desativado
e inexistência de custom domain público. Essa configuração não foi atestada
pelo código nem pela API S3.

## Execução verificada

Comando efetivamente executado, a partir da raiz do repositório:

```sh
node --import tsx scripts/espelhar-anexos.ts --dry-run
```

Código de saída 0. O próprio executor derivou o inventário XLSX vigente em
memória, validou 33 linhas e natureza 28/3/2, leu os dez originais em
`OBSERVATORIO_FONTES_DIR`, recalculou hash/bytes/MIME, consultou as dez chaves
no R2 privado e os documentos/registros no PostgreSQL. A credencial usada pelo
executor foi exclusivamente `DATABASE_URL_MANUTENCAO`.

Resultado: **10 operações; A02=1; A04=1; D01=8; 50.896.322 bytes**.
As dez ações impressas foram `upload_privado_e_registro`, propostas pelo
dry-run. **Nenhum PUT, DELETE ou INSERT do executor; nenhum upload real.**
Todos os objetos estavam ausentes: zero colisões iguais ou diferentes.
Banco: 33 documentos; zero arquivos, vínculos, pessoas, consentimentos,
PUBLICAVEL e itens na view pública.

O modo padrão também é dry-run. O modo real exige exclusivamente `--executar`;
flags desconhecidas ou combinadas são recusadas. Nenhuma execução real foi
autorizada ou iniciada nesta rodada.

## Representação determinística e integridade

O mapa explícito está em `src/dados/lote-privado-inicial.ts`. Declara código,
caminho relativo, chave, hash canônico e principal; o plano complementa com os
bytes e MIME reais. Nenhum código de documento é inferido do filename.
O conjunto D01 físico precisa coincidir com os oito caminhos declarados.
Lote, chave, papel ou hash diferentes dos aprovados interrompem a operação.

**Hashes canônicos atuais conferidos: 10/10; divergências: 0.**
A02/A04: comparação integral também com a coluna SHA-256 do inventário atual.
D01: `hash_historico_anterior = nao_disponivel`; a medição integral da fonte
canônica registrada em `VERIFICACAO_PRE_UPLOAD_2026-09-07.md` foi adotada por
instrução direta do responsável no Prompt 3.4.1 e conferida novamente agora.
O mapa canônico de 2026-09-05 confirma a proveniência e os caminhos; não foi
tratado como baseline integral que nunca registrou. Ausência desse histórico
não é falha de integridade.

Cada hash abaixo é o `hash_canonico_atual`, impresso como `sha256` pelo executor.

| Código | Arquivo relativo à fonte canônica | Bytes | MIME | SHA-256 |
|---|---|---:|---|---|
| A02 | relatorios/relatorio-tecnico-recanto-da-serra.pdf | 602121 | application/pdf | 18b7bbb11b6157af525c7e1c88b7e385763dadc094bb60fdf6f3a27d9c2aff91 |
| A04 | relatorios/relatorio-tecnico-serra-dos-macacos.pdf | 76164 | application/pdf | 7e966429d1fccae8f7583ebc0fb6644c8f6393390e5a2a0d633cbe79a79a7cde |
| D01 | identidade-visual/coletivo-tobias-sou-eu/logo-oficial-tobias-sou-eu.png | 289486 | image/png | 30e62b84e725fd2cace825a6805a094481272b315e5d85187aa5614382016337 |
| D01 | identidade-visual/coletivo-tobias-sou-eu/logo.pdf | 12943470 | application/pdf | 14e3b886621e0d493e808dfd28e46c3886743997b30b06f7d09ea3940a5a59a2 |
| D01 | identidade-visual/observatorio/horizontal-monocromatica-escura.png | 123426 | image/png | efd532d88beeccce71a3e92c6705b582676f2965d90fb7599fde9383381ef940 |
| D01 | identidade-visual/observatorio/horizontal-monocromatica-escura.svg | 31520 | image/svg+xml | 8bda07efbe684aaae64cb28ff3b69b10cb572058aa9c4dfb04dbb670c6cef1dc |
| D01 | identidade-visual/observatorio/icon.png | 101189 | image/png | 6b230265d3c50b864bed83c5d3e7ddd02bd01998a92de818fefae487afc2571b |
| D01 | identidade-visual/observatorio/icon.svg | 704574 | image/svg+xml | f19d71e2ed22bfc1aac44be4760a07517d1f88cb2186cf6b59cdcbfa97d11883 |
| D01 | identidade-visual/observatorio/logo-e-texto.png | 424897 | image/png | d98a0eff2803f1819c8ab28cdd8ee61589ceba1f3ad97fe7d2911897e11f5116 |
| D01 | identidade-visual/observatorio/primeiro-post-observatorio.pdf | 35599475 | application/pdf | 3721a0e64c4ecf3e928206e5f9f9c1042303c2c5e9f205e38e9b095f85dcfdfe |

Destino comum: bucket `observatorio-privado`, visibilidade `privado`,
`url_publica = NULL`. Todos os vínculos são versão 1.

| Código | Object key | Papel em documento_arquivo |
|---|---|---|
| A02 | arquivos/analise-de-dados/relatorio-tecnico-recanto-da-serra-v1.pdf | principal=true |
| A04 | arquivos/analise-de-dados/relatorio-tecnico-serra-dos-macacos-v1.pdf | principal=true |
| D01 | arquivos/publicidade/identidade-visual-01-logo-oficial-tobias-sou-eu-v1.png | principal=false |
| D01 | arquivos/publicidade/identidade-visual-02-logo-v1.pdf | principal=false |
| D01 | arquivos/publicidade/identidade-visual-03-horizontal-monocromatica-escura-v1.png | principal=false |
| D01 | arquivos/publicidade/identidade-visual-04-horizontal-monocromatica-escura-v1.svg | principal=false |
| D01 | arquivos/publicidade/identidade-visual-05-icon-v1.png | principal=false |
| D01 | arquivos/publicidade/identidade-visual-06-icon-v1.svg | principal=false |
| D01 | arquivos/publicidade/identidade-visual-07-logo-e-texto-v1.png | principal=false |
| D01 | arquivos/publicidade/identidade-visual-08-primeiro-post-observatorio-v1.pdf | principal=false |

O schema exige **no máximo** um principal, não exige que exista um. D01 mantém
os oito vínculos neutros; não foi inventada hierarquia entre marca, variante e
peça gráfica. A02/A04 mantêm seu único relatório como principal.

## Garantias do modo real futuro

1. Preflight de todas as dez chaves e do banco antes da primeira escrita.
   Trava transacional do lote impede dois executores concorrentes, inclusive
   com pooler transacional. Banco parcial só é aceito se já contiver vínculos
   íntegros pertencentes ao próprio lote, permitindo retomada idempotente.
2. Releitura física e nova conferência de SHA-256/bytes/MIME imediatamente
   antes de cada operação. Caminhos absolutos e escapes da fonte são recusados.
3. GET autenticado compara o conteúdo existente. Conteúdo igual não sofre
   PUT; diferente é erro fatal. PUT usa `IfNoneMatch: *`, sem retry automático.
4. GET após PUT recalcula o hash dos bytes remotos. ETag e metadado de hash
   não provam integridade. Somente após essa verificação são inseridos
   `arquivo` e `documento_arquivo`, atomicamente na mesma transação.
5. ROLLBACK confirmado permite compensar apenas a criação identificada pela
   marca desta execução. Propriedade é consultada novamente; DELETE é
   condicionado ao ETag e seguido de HEAD que precisa confirmar ausência.
   Preexistente nunca é removido. Falha de compensação reporta possível órfão
   e interrompe o lote.
6. COMMIT/ROLLBACK incertos destroem a conexão e usam conexão independente
   para reconciliação. A mesma trava por objeto aguarda o término da transação
   antiga antes de decidir presença/ausência. Banco e bytes remotos são
   conferidos; incerteza preserva o objeto e interrompe a execução.
7. Clientes S3 e conexões PostgreSQL são encerrados. Erros brutos de SQL/SDK
   não são impressos. Nenhuma URL pública ou ACL é gerada.

Atomicidade é por arquivo/vínculo, não pelos dez objetos juntos. Falha fatal
interrompe os itens restantes; itens anteriores confirmados ficam disponíveis
para reconhecimento idempotente. Nenhuma migração, view ou schema foi alterado.

## Validação e escopo do checkpoint

- `pnpm tipos`: passou.
- `pnpm lint`: passou; quatro avisos CSS preexistentes em `tokens.css`.
- `pnpm teste`: **234 passaram; 3 omitidos; zero falhas**.
- Escrita real no R2 exige `TESTE_R2_ESCRITA=autorizada`; nesta rodada foi
  explicitamente `proibida`. Os testes existentes de banco usam rollback.
- 41 testes novos desde `97bc88c`: 12 de compensação, 6 do contrato SDK,
  16 do executor e 7 da persistência/reconciliação. Os fakes conservam conteúdo
  remoto/estado confirmado e injetam falhas de rede e de transação. Cobrem
  sucesso, colisões, falhas, compensação, idempotência, D01, lote alterado e
  resposta perdida do COMMIT. Nenhum usa fonte sensível como fixture.
- PUT/DELETE reais e a confirmação administrativa do bucket não foram
  exercitados nesta rodada. O alcance dos testes é declarado acima.

O Prompt 3.4.1 autoriza um único checkpoint de toda a implementação pré-upload
desde `97bc88c`: `feat: prepara espelhamento privado seguro`. Isso inclui as
correções da verificação anterior e substitui o fluxo legado de URLs externas.
O diff supera a estimativa das tarefas antigas por reunir executor, mapa,
storage, transação, compensação e testes no único commit solicitado.

Arquivos adicionais às listas das Tarefas 06/07 são necessários ao escopo
expresso: helpers de planejamento/execução/banco, mapa fechado dos vínculos,
cliente e compensação privados, exportação em memória do inventário, limpeza
do pool, testes e registros de estado. As instruções diretas atuais substituem
as políticas antigas de continuar após erro e não compensar. Não há mudança
arquitetural, PR ou execução do modo real.

`ARCHITECTURE.md` permanece fora do checkpoint. Segredos, originais, CSV
derivado, sidecar e diretório da fonte canônica não integram a alteração.
Upstream preservado: **feat/home-indicadores → origin/main**. Pendência de
segurança a resolver separadamente antes do primeiro push; nenhum push
autorizado. Pessoas, consentimentos e publicação seguem fora desta rodada.
