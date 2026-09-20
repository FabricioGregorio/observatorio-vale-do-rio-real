# Auditoria do A11 — o que está público, e sob que autorização

**Data:** 2026-09-20
**Escopo:** somente leitura. Nada foi apagado, despublicado ou reclassificado.
**Motivo:** o cabeçalho de `src/dados/indicadores/derivados.ts` declarava a
unidade documental A11 como **RESTRITA como conjunto**, "porque ela inclui abas
que nomeiam pessoas", enquanto o Acervo publica o workbook integral com o mesmo
SHA-256 e os dezoito derivados por aba — inclusive `06-pessoas-trabalho` e
`08-fornecedores`, que a auditoria de 2026-09-10 classificara como **NÃO
PUBLICAR**.

## 1. Conclusão

**A publicação foi deliberada e está documentada.** Não há exposição
incompatível com a arquitetura vigente. A divergência era **documental**, e
estava no comentário do código, não no acervo.

A regra em vigor é a decisão humana de **2026-09-16**, registrada em três
lugares independentes:

| Onde | O que diz |
|---|---|
| `ESTADO_ATUAL_PROJETO.md`, seção "Publicação do acervo — 2026-09-16" | "todos os materiais da pesquisa dos quatro lugares estão autorizados para publicação"; só CPF, telefone e assinatura exigiriam tratamento; as classificações anteriores "permanecem como histórico e deixaram de constituir veto" |
| `docs/carga/PUBLICACAO_ACERVO_2026-09-16.md`, "A decisão que autorizou" | mesma formulação, com o inventário arquivo por arquivo |
| `src/dados/classificacao-documental.ts` | `A11: { estado: "PUBLICAVEL", revisao: "concluida", razao: "conjunto autorizado; nomes comuns não impedem publicação" }` |

Nenhuma decisão posterior a reabriu. A instrução do responsável nesta sessão,
em 2026-09-20, foi explícita: **não despublicar o A11 nesta entrega**, porque
existe decisão humana posterior e expressa de 16/09 autorizando a publicação
depois da revisão de privacidade. O A11 não é bloqueador de entrega.

> As três fontes acima são as **versionadas**. O responsável mantém registros
> locais adicionais sobre prazo e prioridade — entre eles uma ADR de 2026-09-17
> — que não estão sob controle de versão e, por isso, não são citados aqui como
> prova. Esta auditoria se apoia apenas no que a branch carrega.

O comentário de `derivados.ts` é **anterior** à decisão — ele descreve a fase
H4.0, de 2026-09-10. Ele ficou para trás e foi corrigido nesta rodada.

### O que o banco prova, independentemente do texto

A publicação não pôde ter acontecido por descuido. O CHECK de fail-closed da
migração 0004 (`docs/02-arquitetura-banco.md` §257) recusa
`estado_documental = 'PUBLICAVEL'` sem `revisao_privacidade = 'concluida'`.
Para os dezoito objetos do A11 irem ao ar, a revisão de privacidade do
documento teve de ser **concluída explicitamente**. Não existe caminho de
promoção por omissão.

## 2. O que está público

18 objetos, um documento (`anexo-indicadores-etapa-1`, ordem 11), todos
publicados em **2026-09-16T12:37:28Z**, licença **CC BY-SA 4.0**, sob
`https://acervo.observatoriotobiassoueu.com.br/arquivos/analise-de-dados/`.
Conferido contra `/anexos.json` da compilação local: 109 objetos públicos no
total, 18 deles do A11.

Os SHA-256 dos dezoito conferem, um a um, com a tabela de
`docs/frontend/H4_DADOS_INDICADORES_PROTOTIPO.md` §2 e com
`docs/carga/PUBLICACAO_ACERVO_2026-09-16.md`. **O XLSX integral publicado é
byte a byte o mesmo arquivo que `derivados.ts` registra como fonte de
cálculo** — `10143117a960f3a07a84d3f798029d1490399b90b6276e42763d6c5f7b52c7b1`.

## 3. Matriz por artefato

Classificação segundo a **regra vigente** (decisão de 2026-09-16). A coluna
"classificação anterior" preserva o que a auditoria de 2026-09-10 registrara,
para que a mudança fique legível — ela é histórico, não veto.

Natureza do conteúdo descrita sem reproduzir nome, contato ou valor
individual.

| Objeto | Natureza | Identifica pessoa? | Classificação anterior | Classificação vigente |
|---|---|---|---|---|
| `a11-planilha-indicadores-etapa-1-v1.xlsx` | workbook integral, 17 abas | sim, em abas próprias | conjunto RESTRITO | **PUBLICÁVEL** |
| `a11-00-capa-v1.pdf` | identificação do anexo | sim — proponente e dois atores-chave | RESTRITO com o conjunto | **PUBLICÁVEL** |
| `a11-01-sumario-v1.pdf` | índice das abas | não | RESTRITO com o conjunto | **PUBLICÁVEL** |
| `a11-02-painel-executivo-v1.pdf` | 23 agregados com regra declarada | não | RESTRITO com o conjunto | **PUBLICÁVEL** (agregado) |
| `a11-03-indicadores-solidaria-v1.pdf` | 26 indicadores com código e regra | não | RESTRITO com o conjunto | **PUBLICÁVEL** (agregado) |
| `a11-04-publico-mensuracao-v1.pdf` | metodologia de público | sim — uma célula de definição enumera pessoas entrevistadas, com cargo e instituição | RESTRITO com o conjunto | **PUBLICÁVEL** (metodológico) |
| `a11-05-serie-mensal-v1.pdf` | série de 6 meses | não | RESTRITO com o conjunto | **PUBLICÁVEL** (agregado) |
| `a11-06-pessoas-trabalho-v1.pdf` | ranking nominal de trabalhadores: nome, grafias, gênero inferido, localidade, contratações, valor e datas | **sim, diretamente** | **NÃO PUBLICAR** | **PUBLICÁVEL POR DECISÃO EXPRESSA** — ver §4 |
| `a11-07-localidades-v1.pdf` | circulação de recurso por localidade | risco por cruzamento: há linhas com uma única pessoa e valor exato | PENDENTE | **PUBLICÁVEL POR DECISÃO EXPRESSA** — ver §4 |
| `a11-08-fornecedores-v1.pdf` | ranking de fornecedores identificados nominalmente, com localidade e valor | **sim** (pessoas jurídicas e produtores) | **NÃO PUBLICAR** | **PUBLICÁVEL POR DECISÃO EXPRESSA** — ver §4 |
| `a11-09-atividades-v1.pdf` | ranking de atividades | não | RESTRITO com o conjunto | **PUBLICÁVEL** (agregado) |
| `a11-10-conciliacao-v1.pdf` | conciliação com o relatório parcial | não | RESTRITO com o conjunto | **PUBLICÁVEL** (metodológico) |
| `a11-11-nota-metodologica-v1.pdf` | tratamento e correções | sim — as correções citam pessoas ao explicar consolidação de identidade | RESTRITO com o conjunto | **PUBLICÁVEL** (metodológico) |
| `a11-12-perfil-visitantes-v1.pdf` | perfil da amostra | não — base anônima na origem | RESTRITO com o conjunto | **PUBLICÁVEL** (agregado) |
| `a11-13-motivacao-atividades-v1.pdf` | motivação e atividades da amostra | não | RESTRITO com o conjunto | **PUBLICÁVEL** (agregado) |
| `a11-14-consumo-percepcao-v1.pdf` | consumo e percepção da amostra | não | RESTRITO com o conjunto | **PUBLICÁVEL** (agregado) |
| `a11-15-grupos-institucionais-v1.pdf` | grupos e instituições recebidos | instituições nomeadas | PENDENTE | **PUBLICÁVEL POR DECISÃO EXPRESSA** |
| `a11-16-dicionario-dados-v1.pdf` | dicionário de 329 campos | não | RESTRITO com o conjunto | **PUBLICÁVEL** (metodológico) |

**Nenhum** dos artefatos contém CPF, telefone ou assinatura. A varredura de
2026-09-16 (`PUBLICACAO_ACERVO_2026-09-16.md`, "Varredura de privacidade")
cobriu 33 arquivos com texto extraível, com validação de dígitos verificadores
de CPF, e devolveu **0 / 0 / 0**; os oito candidatos a telefone eram
percentuais da própria planilha de indicadores.

### Fora do A11, no mesmo lote

| Objeto | Natureza | Identifica pessoa? | Vigente |
|---|---|---|---|
| A09 — respostas de rotina de funcionamento (XLSX) | 40 respostas individuais, uma por dia de operação | sim — coluna com o nome de quem preencheu | **PUBLICÁVEL** (decisão de 2026-09-16) |
| A10 — respostas de visitantes, dois XLSX | 52 e 11 respostas individuais | anônimas na origem; os formulários não coletam nome, documento, telefone ou e-mail | **PUBLICÁVEL** |

Esses três são os únicos objetos públicos do acervo que são **resposta bruta**.
Todo o resto do A11 é agregado, metodológico ou ranking derivado.

## 4. O ponto que merece confirmação humana — e não é exposição incompatível

Três artefatos cruzam a fronteira entre o que a decisão de 2026-09-16 **diz** e
o que o critério que ela enuncia **cobre**:

- `a11-06-pessoas-trabalho`, `a11-07-localidades` e `a11-08-fornecedores`.

A decisão autoriza tudo e define o tratamento por três marcadores: **CPF,
telefone e assinatura**. Nenhum dos três aparece nesses arquivos, então eles
passam pelo critério literal. Mas o risco que a auditoria de 2026-09-10
descrevera para eles é de outra ordem: **nome próprio associado a valor
recebido, localidade e datas** — e, no caso das localidades, linhas com uma
única pessoa, em que o cruzamento identifica quem recebeu quanto.

`classificacao-documental.ts` responde a isso em uma linha — "nomes comuns não
impedem publicação" —, o que indica que a questão foi considerada. Vale
registrar que **foi**, e não presumir que não foi: a decisão é explícita,
posterior, e revogou expressamente as classificações anteriores.

**Encaminhamento decidido em 2026-09-20: nenhuma ação.** O responsável
determinou que o A11 **não será despublicado nesta entrega** — a decisão de
16/09 é posterior, explícita e cobre o conjunto. Banco, storage e URLs
públicas ficam como estão.

Fica registrado como **nota futura**, sem prazo e sem bloqueio: *reavaliação
de risco de reidentificação em A11-06, A11-07 e A11-08*. A remediação da §5
existe para o dia em que essa reavaliação acontecer, e permanece **não
executada**.

## 5. Remediação, caso uma reavaliação humana a peça — NÃO EXECUTADA

Registrada aqui para não precisar ser redesenhada sob pressão. **Nada disto
foi feito.**

1. **Retirada do objeto público** é a única medida eficaz. Alterar rótulo,
   link ou interface não retira nada: a URL do R2 continua respondendo. O
   mecanismo existe e é versionado — `src/dados/plano-de-despublicacao.ts` com
   um JSON declarado, que confere `arquivoId`, chave, URL, SHA-256, bytes, MIME
   e documento contra o banco e aborta na primeira divergência.
2. **Alvos possíveis**, se a reavaliação os alcançar: `a11-06-pessoas-trabalho-v1.pdf`,
   `a11-07-localidades-v1.pdf`, `a11-08-fornecedores-v1.pdf`. Os três são
   objetos independentes do documento A11 e podem sair sem tocar nos demais.
3. **O workbook integral é o caso difícil.** Ele contém as mesmas abas. Retirá-lo
   exigiria publicar em seu lugar um derivado com as abas suprimidas — arquivo
   novo, hash novo, `derivacao_metodo = 'tarjamento_privacidade'` e origem
   registrada —, e isso **quebra o link permanente atual**, que já está citado
   em `/dados` e no acervo.
4. **O que permaneceria seguro sem nenhuma alteração:** os agregados (02, 03,
   05, 09, 12, 13, 14), os metodológicos (01, 10, 11, 16) e todos os oito
   indicadores publicados em `/dados`, que são valores agregados e não
   dependem do objeto integral.
5. **Escrita em banco e storage continua sendo fronteira de decisão humana.**
   Nenhum agente executa despublicação por conta própria.

## 6. `/dados` — conferido, sem alteração necessária

A página serve oito indicadores agregados, a série mensal de seis linhas e
dezesseis atividades. Ela **não** renderiza `procedencia` — aba, linha e
código interno da fonte —, e `testes/pagina-dados.test.ts` prova isso varrendo
os arquivos da rota atrás de `procedencia`, `codigoNaFonte`, `sha256DaFonte` e
`conferencia`.

Os links que ela expõe resolvem por **rótulo exato** contra `vw_anexo_publico`:
rótulo que não existir no acervo não vira linha. Todos apontam para objetos
`PUBLICAVEL` com revisão concluída. Nenhum aponta para material restrito.

**Nada foi enfraquecido na página.** A auditoria não encontrou motivo para
mexer nela.

## 7. O que foi corrigido nesta rodada

Só texto de código, e só onde ele afirmava algo falso:

| Arquivo | O que mudou |
|---|---|
| `src/dados/indicadores/derivados.ts` | o cabeçalho deixou de afirmar que a fonte continua RESTRITA; passa a registrar a decisão de 2026-09-16 e a explicar que `procedencia` fica fora do HTML por ser coordenada interna de cálculo, não por restrição documental. A invariante não mudou. |
| `testes/indicadores.test.ts` | mesma correção no docblock da invariante; o nome do teste passou de "fonte restrita" para "coordenada interna da fonte". As asserções são as mesmas. |

Nenhuma asserção de privacidade foi removida ou afrouxada.

## 8. Evidência versionada de revisão posterior — existe

Respondendo à pergunta em forma direta: **sim**. `ESTADO_ATUAL_PROJETO.md`,
`docs/carga/PUBLICACAO_ACERVO_2026-09-16.md` e
`src/dados/classificacao-documental.ts` registram a decisão, a data e a razão;
`docs/carga/FECHAMENTO_INTEGRIDADE_PUBLICACAO_2026-09-16.md` e
`RECONCILIACAO_INDEPENDENTE_2026-09-16.json` provam que os 18 objetos do A11
são exatamente os esperados, com 108 de 108 conferindo na reconciliação
independente daquela data. Todas essas fontes estão versionadas na branch; a
auditoria não depende de nenhum documento fora do controle de versão.
