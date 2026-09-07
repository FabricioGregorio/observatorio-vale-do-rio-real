# Revisão de Privacidade — A02, A04, D01

**Data:** 2026-09-07
**Prompt:** 3.5
**Revisor:** agente, a partir da documentação de auditoria
**Escopo:** 10 arquivos espelhados em `observatorio-privado`
**Publicação nesta tarefa:** NENHUMA
**Estado PUBLICAVEL alterado:** NÃO
**Upload realizado:** NENHUM

---

## 1. Metodologia

### 1.1 Fontes desta revisão

| Fonte | Utilizada |
|---|---|
| Auditoria canônica de 138 arquivos (2026-09-05) | SIM — seções 6, 7, 11, 15 |
| Dry-run do espelhamento (2026-09-06) | SIM — §§ A02, A04, D01 |
| Dry-run final privado (2026-09-07) | SIM — tabela de hashes e metadados |
| Mapa de fontes canônicas (2026-09-05) | SIM — proveniência de nomes |
| Classificação documental (`src/dados/classificacao-documental.ts`) | SIM |
| Lote privado inicial (`src/dados/lote-privado-inicial.ts`) | SIM |
| Acesso direto aos arquivos originais | **NÃO** — `OBSERVATORIO_FONTES_DIR` inacessível ao agente |
| Acesso direto aos objetos no bucket privado | **NÃO** — acesso autenticado não disponível ao agente |

### 1.2 Limitação declarada

> **Esta revisão é baseada exclusivamente na documentação de auditoria
> produzida anteriormente.** O agente não abriu, leu, visualizou ou processou
> diretamente nenhum dos 10 arquivos originais, nem por texto, nem por
> imagem, nem por metadados.
>
> Consequência: **nenhuma revisão pode ser marcada CONCLUIDA** pelo agente.
> A revisão completa requer inspeção humana dos originais, com base nos
> indicadores de risco catalogados abaixo.

### 1.3 Categorias de risco procuradas

Conforme o princípio de privacidade do Prompt 3.5:

- Nomes de pessoas
- CPF
- Telefone / e-mail pessoal
- Endereço pessoal
- Assinatura
- Dados de saúde / PCD
- Raça/etnia associada nominalmente
- Dados de menores
- Remuneração individual
- Função + nome quando a combinação cria exposição indevida
- Localização privada
- Fotografias de pessoas identificáveis
- Metadados sensíveis (EXIF, propriedades de PDF)
- Outros identificadores pessoais

---

## 2. A02 — Relatório Técnico — Recanto da Serra

### 2.1 Identificação

| | |
|---|---|
| Código | A02 |
| Arquivo | `relatorios/relatorio-tecnico-recanto-da-serra.pdf` |
| Título interno | RELATÓRIO TÉCNICO – RECANTO DA SERRA |
| Páginas | 14 |
| Bytes | 602.121 |
| SHA-256 | `18b7bbb11b6157af525c7e1c88b7e385763dadc094bb60fdf6f3a27d9c2aff91` |
| MIME | `application/pdf` |
| Texto extraível | SIM, 15.578 caracteres |
| Bucket | `observatorio-privado` |
| Visibilidade | privado |

### 2.2 Riscos de privacidade identificados (via auditoria)

| Categoria | Presente | Localização | Gravidade |
|---|---|---|---|
| **Nomes de pessoas** | **SIM** | Seção de trabalhadores contratados | ALTA |
| **Remuneração ligada nominalmente** | **PROVÁVEL** | Seção de nomes recorrentes de trabalhadores contratados | ALTA |
| CPF | INDETERMINADO | Não confirmado na auditoria; requer inspeção | — |
| Telefone / e-mail pessoal | INDETERMINADO | Não confirmado na auditoria; requer inspeção | — |
| Assinatura | INDETERMINADO | Não confirmado na auditoria; requer inspeção | — |
| Endereço pessoal | INDETERMINADO | Não confirmado na auditoria; requer inspeção | — |
| Dados de menores | INDETERMINADO | Não confirmado na auditoria; requer inspeção | — |
| Fotografias de pessoas | INDETERMINADO | Relatório pode conter fotos embutidas; requer inspeção | — |
| Metadados sensíveis do PDF | INDETERMINADO | Propriedades do PDF não foram inspecionadas | — |

### 2.3 Achados documentados da auditoria

1. O relatório traz seção de **nomes recorrentes de trabalhadores contratados**
   (auditoria §6, nota de atenção de privacidade). Nenhum nome foi copiado para
   a documentação versionada.
2. Contém seções de diagnóstico econômico e cultural (fonte de A05), com dados
   de despesas, receitas, mão de obra e ativação do território.
3. A auditoria classificou como `ESPELHAVEL após revisão` — indicando que a
   revisão de privacidade era condição prévia para qualquer publicação.

### 2.4 Acessibilidade (separado de privacidade)

| Aspecto | Situação |
|---|---|
| PDF com camada textual | SIM — texto extraível |
| Leitura por leitor de tela | INDETERMINADO — estrutura do PDF não inspecionada |
| Ordem estrutural | INDETERMINADO |
| Texto truncado | INDETERMINADO |

### 2.5 Diagnóstico

**ORIGINAL A02 → permanece privado.**

**DERIVADO PÚBLICO A02 → SIM, necessário.**

Proposta de redação/tarjamento para o derivado (a produzir em tarefa futura):

| Elemento | Ação |
|---|---|
| Nomes de trabalhadores contratados | TARJAR todos os nomes na seção de trabalhadores |
| Valores de remuneração individual (se presentes) | TARJAR se estiverem ligados nominalmente |
| Demais dados pessoais (se encontrados na inspeção) | TARJAR conforme a categoria |
| Dados agregados de despesas/receitas | PRESERVAR — necessários à prestação de contas |
| Diagnóstico econômico e cultural | PRESERVAR |
| Informações de identificação do equipamento | PRESERVAR |
| Metadados do PDF | REMOVER autor, software e propriedades desnecessárias |

> **IMPORTANTE:** As páginas e campos exatos a tarjar só poderão ser
> determinados com acesso direto ao arquivo. A auditoria indica a seção de
> trabalhadores como localização principal, mas não informa número de página
> nem posição precisa.

### 2.6 Classificação

```
revisao_privacidade: PENDENTE
decisao_recomendada: CRIAR_DERIVADO_PUBLICO
```

---

## 3. A04 — Relato Técnico — Serra dos Macacos

### 3.1 Identificação

| | |
|---|---|
| Código | A04 |
| Arquivo | `relatorios/relatorio-tecnico-serra-dos-macacos.pdf` |
| Título interno | RELATO TÉCNICO SERRA DOS MACACOS |
| Páginas | 4 |
| Bytes | 76.164 |
| SHA-256 | `7e966429d1fccae8f7583ebc0fb6644c8f6393390e5a2a0d633cbe79a79a7cde` |
| MIME | `application/pdf` |
| Texto extraível | SIM, 7.907 caracteres |
| Bucket | `observatorio-privado` |
| Visibilidade | privado |

### 3.2 Riscos de privacidade identificados (via auditoria)

| Categoria | Presente | Localização | Gravidade |
|---|---|---|---|
| **Nomes de pessoas** | **SIM** | Cita o ator-chave Pedro Menezes nominalmente | MÉDIA |
| Remuneração ligada nominalmente | INDETERMINADO | — | — |
| CPF | INDETERMINADO | Não confirmado; requer inspeção | — |
| Telefone / e-mail pessoal | INDETERMINADO | Não confirmado; requer inspeção | — |
| Assinatura | INDETERMINADO | Não confirmado; requer inspeção | — |
| Endereço pessoal | INDETERMINADO | Não confirmado; requer inspeção | — |
| Dados de menores | INDETERMINADO | Não confirmado; requer inspeção | — |
| Fotografias de pessoas | INDETERMINADO | Documento curto (4 páginas); requer inspeção | — |
| Metadados sensíveis do PDF | INDETERMINADO | Propriedades não inspecionadas | — |

### 3.3 Achados documentados da auditoria

1. O documento cita o **ator-chave Pedro Menezes** pelo nome. Pedro Menezes é
   entrevistado (B04) com consentimento verbal localizado.
2. O título interno diz "RELATO", não "RELATÓRIO" — divergência de nomenclatura
   registrada, não corrigida.
3. A auditoria classificou como `CANDIDATO_A_PUBLICAVEL` — sugerindo menor
   risco de privacidade que A02.
4. O dry-run do espelhamento registrou: "cita o ator-chave Pedro Menezes pelo
   nome, que é entrevistado com consentimento localizado; exige triagem".

### 3.4 Distinção: nome necessário vs. dado pessoal dispensável

O princípio do Prompt 3.5 requer distinguir:

| Tipo | Aplicação a A04 |
|---|---|
| Nome necessário para autoria/contexto institucional | Pedro Menezes é o ator-chave do equipamento Serra dos Macacos, citado como tal no contexto do relato. O nome é parte do conteúdo institucional da pesquisa. |
| Dado pessoal cuja exposição não é necessária | INDETERMINADO — requer leitura completa para verificar se há telefone, endereço, remuneração, ou dado pessoal desnecessário além do nome institucional. |

> **A decisão de manter ou tarjar o nome de Pedro Menezes não pode ser
> tomada sem inspeção humana**, considerando:
> - o consentimento verbal foi localizado para a entrevista (B04);
> - o nome aparece como ator-chave (contexto institucional);
> - mas presença de outros dados pessoais no documento permanece indeterminada.

### 3.5 Acessibilidade (separado de privacidade)

| Aspecto | Situação |
|---|---|
| PDF com camada textual | SIM — texto extraível |
| Leitura por leitor de tela | INDETERMINADO |
| Ordem estrutural | INDETERMINADO |
| Texto truncado | INDETERMINADO |

### 3.6 Diagnóstico

**ORIGINAL A04 → permanece privado (no bucket privado).**

**DERIVADO PÚBLICO A04 → DECISÃO HUMANA.**

Dois cenários:

**Cenário A — original futuramente publicável:**
Se a inspeção humana confirmar que:
- o único nome presente é Pedro Menezes, em contexto institucional;
- não há telefone, e-mail, endereço, remuneração nem dado pessoal dispensável;
- o consentimento de Pedro Menezes cobre a publicação;
→ o original pode ser publicado como está, com metadados removidos.

**Cenário B — precisa de derivado:**
Se a inspeção humana encontrar qualquer dado pessoal dispensável;
→ produzir derivado com os campos tarjados.

### 3.7 Classificação

```
revisao_privacidade: PENDENTE
decisao_recomendada: DECISAO_HUMANA
```

---

## 4. D01 — Identidade visual (8 arquivos)

### 4.1 Inventário individual

| ID | Arquivo original | Bytes | MIME | Classificação visual |
|---|---|---:|---|---|
| D01-01 | `identidade-visual/coletivo-tobias-sou-eu/logo-oficial-tobias-sou-eu.png` | 289.486 | image/png | **Logotipo** |
| D01-02 | `identidade-visual/coletivo-tobias-sou-eu/logo.pdf` | 12.943.470 | application/pdf | **Logotipo em PDF** |
| D01-03 | `identidade-visual/observatorio/horizontal-monocromatica-escura.png` | 123.426 | image/png | **Logotipo — variante** |
| D01-04 | `identidade-visual/observatorio/horizontal-monocromatica-escura.svg` | 31.520 | image/svg+xml | **Logotipo — variante** |
| D01-05 | `identidade-visual/observatorio/icon.png` | 101.189 | image/png | **Logotipo — ícone** |
| D01-06 | `identidade-visual/observatorio/icon.svg` | 704.574 | image/svg+xml | **Logotipo — ícone** |
| D01-07 | `identidade-visual/observatorio/logo-e-texto.png` | 424.897 | image/png | **Logotipo — com texto** |
| D01-08 | `identidade-visual/observatorio/primeiro-post-observatorio.pdf` | 35.599.475 | application/pdf | **Peça de divulgação** |

### 4.2 Classificação por tipo

| Tipo | Arquivos | IDs |
|---|---|---|
| Logotipo / marca | 7 | D01-01 a D01-07 |
| Peça de divulgação | 1 | D01-08 |

### 4.3 D01-01 a D01-07 — Logotipos

#### Revisão de privacidade

| Categoria | D01-01 | D01-02 | D01-03 | D01-04 | D01-05 | D01-06 | D01-07 |
|---|---|---|---|---|---|---|---|
| Pessoa identificável | IMPROVÁVEL | IMPROVÁVEL | IMPROVÁVEL | IMPROVÁVEL | IMPROVÁVEL | IMPROVÁVEL | IMPROVÁVEL |
| Nome textual de pessoa | NÃO* | INDET. | NÃO* | NÃO* | NÃO* | INDET. | NÃO* |
| Contato pessoal | NÃO* | INDET. | NÃO* | NÃO* | NÃO* | INDET. | NÃO* |
| Geolocalização | NÃO* | INDET. | NÃO* | NÃO* | NÃO* | INDET. | NÃO* |
| Menor aparente | NÃO* | INDET. | NÃO* | NÃO* | NÃO* | INDET. | NÃO* |

\* Baseado na descrição da auditoria e no tipo do arquivo (logotipo). INDET.
para os PDFs e SVGs cujo conteúdo embutido não foi inspecionado.

#### Metadados

| Arquivo | EXIF/metadados sensíveis |
|---|---|
| D01-01 (.png) | INDETERMINADO — PNG pode conter blocos tEXt |
| D01-02 (.pdf, 12,3 MB) | INDETERMINADO — PDF pode conter autor, software, datas |
| D01-03 (.png) | INDETERMINADO |
| D01-04 (.svg) | INDETERMINADO — SVG pode conter metadados XML ou comentários |
| D01-05 (.png) | INDETERMINADO |
| D01-06 (.svg, 704 KB) | INDETERMINADO — tamanho sugere conteúdo complexo |
| D01-07 (.png) | INDETERMINADO |

#### Recomendação para D01-01 a D01-07

Considerando que são logotipos e variantes, sem indício documental de dados
pessoais:

```
D01-01: potencialmente publicável (inspeção humana necessária)
D01-02: potencialmente publicável (inspeção humana necessária — PDF grande)
D01-03: potencialmente publicável
D01-04: potencialmente publicável (verificar metadados SVG)
D01-05: potencialmente publicável
D01-06: potencialmente publicável (verificar metadados SVG — 704 KB)
D01-07: potencialmente publicável
```

Para futura publicação, os derivados públicos devem:
- Ter metadados desnecessários removidos
- Ter novo hash calculado
- Manter relação `derivado_de` com o original
- Ser otimizados para web quando pertinente

### 4.4 D01-08 — `primeiro-post-observatorio.pdf` (peça de divulgação)

Este é o arquivo que requer atenção especial: **33,9 MB, PDF, peça de
divulgação**.

#### Revisão de privacidade

| Categoria | Presente | Observação |
|---|---|---|
| Pessoa identificável | **INDETERMINADO** | Peça de divulgação pode conter fotografias |
| Quantidade de pessoas | INDETERMINADO | Não inspecionado |
| Fotografia ou ilustração | **INDETERMINADO** | O tamanho (33,9 MB) sugere conteúdo gráfico pesado |
| Nome textual associado a pessoa | INDETERMINADO | Não inspecionado |
| Contato pessoal | INDETERMINADO | Não inspecionado |
| Geolocalização / metadado | INDETERMINADO | Não inspecionado |
| Menor aparente | **INDETERMINADO** | Requer inspeção visual |
| Metadados do PDF | INDETERMINADO | Propriedades não inspecionadas |

#### Achados da auditoria

1. A auditoria classificou como **"Peça gráfica, não marca"**
   (AUDITORIA_FONTES_CANONICAS §11).
2. O dry-run do espelhamento registrou: **"pode conter fotografia de pessoa"**
   (DRY_RUN_ESPELHAMENTO §D01).
3. O tamanho (35.599.475 bytes) é consistente com PDF contendo imagens em alta
   resolução.

#### Recomendação para D01-08

```
D01-08: DECISÃO HUMANA — inspeção visual obrigatória
```

O responsável humano deve verificar:

1. O PDF contém fotografias de pessoas? SIM/NÃO
2. Se sim, quantas aproximadamente
3. As pessoas são identificáveis?
4. Há nomes textuais associados às pessoas?
5. Há contato pessoal?
6. Há menor aparente?
7. É fotografia ou ilustração?
8. Há metadados sensíveis embutidos?

Não foram usados reconhecimento facial nem identificação de pessoas por imagem.

### 4.5 Classificação individual D01

| ID | revisao_privacidade | decisao_recomendada |
|---|---|---|
| D01-01 | PENDENTE | DECISAO_HUMANA |
| D01-02 | PENDENTE | DECISAO_HUMANA |
| D01-03 | PENDENTE | DECISAO_HUMANA |
| D01-04 | PENDENTE | DECISAO_HUMANA |
| D01-05 | PENDENTE | DECISAO_HUMANA |
| D01-06 | PENDENTE | DECISAO_HUMANA |
| D01-07 | PENDENTE | DECISAO_HUMANA |
| D01-08 | PENDENTE | DECISAO_HUMANA |

> A recomendação de DECISAO_HUMANA se aplica a todos porque o agente não
> pôde inspecionar nenhum dos arquivos. D01-01 a D01-07 são classificados
> como logotipos pela auditoria e provavelmente são publicáveis; D01-08
> requer atenção especial.

---

## 5. Metadados a registrar (sem remover originais)

Para qualquer arquivo candidato a publicação futura, registra-se a
necessidade de tratamento de metadados no derivado:

| ID | Tipo | Metadados a verificar no derivado |
|---|---|---|
| A02 | PDF | Autor, software, timestamps, XMP, comentários |
| A04 | PDF | Autor, software, timestamps, XMP, comentários |
| D01-01 | PNG | Blocos tEXt, iTXt, timestamps |
| D01-02 | PDF | Autor, software, timestamps, XMP |
| D01-03 | PNG | Blocos tEXt, iTXt, timestamps |
| D01-04 | SVG | Metadados XML, comentários, namespaces de ferramenta |
| D01-05 | PNG | Blocos tEXt, iTXt, timestamps |
| D01-06 | SVG | Metadados XML, comentários, namespaces de ferramenta |
| D01-07 | PNG | Blocos tEXt, iTXt, timestamps |
| D01-08 | PDF | Autor, software, timestamps, XMP, EXIF embutido |

**Nenhum metadado foi removido dos originais nesta tarefa.**
Os originais permanecem intactos em `observatorio-privado`.

---

## 6. Derivados públicos propostos

### 6.1 Derivado A02 — Relatório Técnico Recanto da Serra (redacted)

| | |
|---|---|
| Código/documento de origem | A02 |
| Arquivo de origem | `relatorio-tecnico-recanto-da-serra.pdf` |
| SHA-256 do original | `18b7bbb11b6157af525c7e1c88b7e385763dadc094bb60fdf6f3a27d9c2aff91` |
| Finalidade | Versão pública do relatório para prestação de contas |
| Transformações permitidas | Tarjamento (redação) de dados pessoais; remoção de metadados |
| Informações a remover | Nomes de trabalhadores contratados; remuneração individual se presente; outros dados pessoais encontrados na inspeção |
| Informações a preservar | Diagnóstico econômico e cultural; dados agregados de despesas e receitas; identificação do equipamento; período de análise; conclusões |
| Formato de saída | PDF com camada textual preservada |
| Relação de proveniência | `derivado_de = A02`; `metodo = tarjamento_privacidade` |
| Hash novo | A calcular após produção |
| Original permanece privado | SIM |

### 6.2 Derivado D01-08 — condicionado a inspeção

| | |
|---|---|
| Código/documento de origem | D01 |
| Arquivo de origem | `primeiro-post-observatorio.pdf` |
| SHA-256 do original | `3721a0e64c4ecf3e928206e5f9f9c1042303c2c5e9f205e38e9b095f85dcfdfe` |
| Finalidade | Versão pública da peça de divulgação, se aplicável |
| Transformações permitidas | A definir após inspeção |
| Informações a remover | A definir após inspeção |
| Informações a preservar | Conteúdo gráfico institucional |
| Formato de saída | PDF ou imagem otimizada para web |
| Relação de proveniência | `derivado_de = D01-08`; método a definir |
| Hash novo | A calcular após produção |
| Original permanece privado | SIM |

> **Este derivado só será proposto formalmente após a inspeção humana de
> D01-08.** Se o arquivo não contiver pessoas identificáveis nem dados
> pessoais, o original poderá ser publicado diretamente com metadados
> removidos, sem necessidade de derivado tarjado.

### 6.3 D01-01 a D01-07 — sem derivado de tarjamento

Para os logotipos, **não se propõe derivado de privacidade**. Se forem
publicados, o derivado público será apenas para:
- Remoção de metadados desnecessários
- Otimização para web
- Novo hash

---

## 7. Decisões humanas restantes

| # | Decisão | Arquivo | Motivo |
|---|---|---|---|
| 1 | Inspecionar A02 completo e confirmar/mapear dados pessoais | A02 | Agente não teve acesso ao arquivo |
| 2 | Determinar se A04 pode ser publicado sem tarjamento | A04 | Nome de Pedro Menezes em contexto institucional; precisa decisão sobre se constitui dado dispensável |
| 3 | Inspecionar D01-08 visualmente para pessoas identificáveis | D01-08 | Peça de divulgação de 33,9 MB; pode conter fotografias |
| 4 | Verificar D01-08 para menores aparentes | D01-08 | Indeterminável sem inspeção |
| 5 | Confirmar ausência de dados pessoais em D01-01 a D01-07 | D01-01 a D01-07 | Agente classifica como logotipos com base na auditoria, mas não inspecionou |
| 6 | Verificar metadados dos 10 arquivos antes de qualquer publicação | Todos | Nenhum metadado foi lido nesta revisão |
| 7 | Definir se o consentimento de Pedro Menezes (B04) cobre publicação em A04 | A04 | Consentimento verbal localizado na entrevista, mas escopo pode não cobrir uso no relatório |

---

## 8. Resumo por arquivo

| ID | Tipo | Risco principal | revisao_privacidade | decisao_recomendada |
|---|---|---|---|---|
| **A02** | PDF, 14 pp., 602 KB | Nomes de trabalhadores + remuneração | PENDENTE | CRIAR_DERIVADO_PUBLICO |
| **A04** | PDF, 4 pp., 76 KB | Nome de ator-chave (institucional) | PENDENTE | DECISAO_HUMANA |
| **D01-01** | PNG, 289 KB | Logotipo — risco baixo | PENDENTE | DECISAO_HUMANA |
| **D01-02** | PDF, 12,3 MB | Logotipo em PDF — risco baixo | PENDENTE | DECISAO_HUMANA |
| **D01-03** | PNG, 123 KB | Logotipo variante — risco baixo | PENDENTE | DECISAO_HUMANA |
| **D01-04** | SVG, 31 KB | Logotipo variante — risco baixo | PENDENTE | DECISAO_HUMANA |
| **D01-05** | PNG, 101 KB | Logotipo ícone — risco baixo | PENDENTE | DECISAO_HUMANA |
| **D01-06** | SVG, 704 KB | Logotipo ícone — risco baixo | PENDENTE | DECISAO_HUMANA |
| **D01-07** | PNG, 425 KB | Logotipo com texto — risco baixo | PENDENTE | DECISAO_HUMANA |
| **D01-08** | PDF, 33,9 MB | **Pode conter pessoas — requer inspeção** | PENDENTE | DECISAO_HUMANA |

---

## 9. O que não foi feito nesta tarefa

- Nenhum estado documental foi alterado.
- PUBLICAVEL continua **0** no banco.
- Nenhum arquivo foi promovido, movido, copiado ou excluído.
- Nenhum derivado foi produzido.
- Nenhum upload foi realizado.
- Nenhum objeto foi enviado ao bucket público.
- Nenhuma carga de pessoa ou consentimento foi executada.
- Nenhum metadado foi removido dos originais.
- Nenhum reconhecimento facial ou identificação de pessoas por imagem foi usado.
- Nenhum dado pessoal sensível foi reproduzido neste relatório.

---

## 10. Inspeção direta posterior

### 10.1 Relação com a primeira versão

A primeira versão deste relatório permanece preservada acima como triagem
baseada na auditoria documental. Em uma segunda passagem, realizada em
2026-09-07, o agente obteve acesso somente leitura à fonte canônica indicada
por `OBSERVATORIO_FONTES_DIR` e abriu diretamente os dez originais completos,
incluindo conteúdo visual/textual e metadados técnicos.

Esta seção complementa o registro anterior; não apaga nem reescreve a
limitação que existia no momento da primeira passagem.

Não houve alteração, cópia, promoção ou exclusão dos originais. As imagens de
renderização usadas para inspeção ficaram apenas em diretório temporário local.

### 10.2 Integridade antes da abertura

Os dez arquivos tiveram SHA-256 recalculado e tamanho conferido antes da
inspeção. Resultado: **10/10 hashes e 10/10 tamanhos coincidentes** com o lote
canônico registrado em `src/dados/lote-privado-inicial.ts`. Nenhum item foi
interrompido por divergência.

### 10.3 A02 — inspeção direta das 14 páginas

| Categoria | Página | Resultado factual | Ação recomendada |
|---|---:|---|---|
| Nomes de trabalhadores | 7 | PRESENTE | Remover no derivado público |
| Quantidade de contratações vinculada nominalmente | 7 | PRESENTE | Remover ou dissociar dos nomes no derivado público |
| Remuneração associada nominalmente | — | AUSENTE | Nenhuma |
| CPF | — | AUSENTE | Nenhuma |
| Telefone | — | AUSENTE | Nenhuma |
| E-mail pessoal | — | AUSENTE | Nenhuma |
| Endereço pessoal | — | AUSENTE | Nenhuma |
| Assinatura | — | AUSENTE | Nenhuma |
| Dados de menores | — | AUSENTE | Nenhuma |
| Fotografia de pessoas | — | AUSENTE | Nenhuma |
| Outros identificadores pessoais | — | AUSENTE | Nenhuma |
| Metadado técnico | arquivo | PRESENTE: software e título | Remover software no derivado; preservar título útil |

Os valores financeiros das páginas 1, 4 a 6 são agregados e não aparecem
ligados nominalmente a trabalhadores. As faixas etárias das páginas 10 e 11
também são agregadas, sem identificação individual.

```
revisao_privacidade: concluida
decisao_recomendada: CRIAR_DERIVADO_PUBLICO
```

O original deve permanecer privado. Esta decisão é apenas recomendação; nenhum
derivado foi criado nesta tarefa.

### 10.4 A04 — inspeção direta das 4 páginas

| Categoria | Página | Resultado factual | Ação recomendada |
|---|---:|---|---|
| Nome de pessoa | 1 | PRESENTE | Submeter a decisão humana; nome integra o contexto institucional do relato |
| Necessidade contextual do nome | 1 | NECESSÁRIO AO CONTEXTO DO RELATO | Não remover automaticamente |
| Telefone | — | AUSENTE | Nenhuma |
| E-mail pessoal | — | AUSENTE | Nenhuma |
| Endereço pessoal | — | AUSENTE | Nenhuma |
| Remuneração | — | AUSENTE | Nenhuma |
| Assinatura | — | AUSENTE | Nenhuma |
| Fotografias | — | AUSENTE | Nenhuma |
| Outros dados pessoais | — | AUSENTE | Nenhuma |
| Metadado técnico | arquivo | PRESENTE: software e título | Software é dispensável; não foi encontrado metadado pessoal |

O texto menciona crianças e adolescentes apenas como grupos da comunidade,
sem nomes, imagens ou dados individualizantes.

```
revisao_privacidade: concluida
decisao_recomendada: DECISAO_HUMANA
```

A decisão humana restante é sobre a manutenção do nome institucional e o
alcance da autorização aplicável. Esta revisão não faz conclusão jurídica
sobre consentimento.

### 10.5 D01-01 a D01-07 — inspeção individual

| ID | É logotipo/elemento gráfico | Contém pessoa | Contém nome de pessoa | Contato pessoal | Metadado textual desnecessário | Localização/metadado sensível | Decisão recomendada |
|---|---|---|---|---|---|---|---|
| D01-01 | SIM — logotipo | SIM — ilustração estilizada | SIM — parte da marca | NÃO | SIM — software | NÃO | CRIAR_DERIVADO_PUBLICO |
| D01-02 | SIM — logotipo em PDF | SIM — ilustração estilizada | SIM — parte da marca | NÃO | SIM — software e timestamp | NÃO | CRIAR_DERIVADO_PUBLICO |
| D01-03 | SIM — variante horizontal | NÃO | NÃO | NÃO | SIM — XMP/EXIF técnico | NÃO; sem GPS | CRIAR_DERIVADO_PUBLICO |
| D01-04 | SIM — variante horizontal SVG | NÃO | NÃO | NÃO | NÃO | NÃO | PUBLICAR_ORIGINAL |
| D01-05 | SIM — ícone | NÃO | NÃO | NÃO | SIM — XMP/EXIF técnico | NÃO; sem GPS | CRIAR_DERIVADO_PUBLICO |
| D01-06 | SIM — ícone SVG | NÃO | NÃO | NÃO | NÃO | NÃO | PUBLICAR_ORIGINAL |
| D01-07 | SIM — logotipo com texto institucional | NÃO | NÃO | NÃO | SIM — XMP/EXIF técnico | NÃO; sem GPS | CRIAR_DERIVADO_PUBLICO |

Nos SVGs, o XML completo foi inspecionado. D01-04 não contém metadados,
comentários nem nós de texto. D01-06 contém duas imagens raster incorporadas
como `data:image`, sem EXIF, XMP, GPS ou comentário; não há nós de texto.

A ilustração e o nome presentes em D01-01 e D01-02 pertencem à composição da
marca e não identificam pessoa fotografada no acervo. O tratamento recomendado
nesses dois casos é somente saneamento de metadados, sem apagar a marca.

Todos os sete arquivos podem receber `revisao_privacidade = concluida`. Para
os cinco que requerem saneamento, a versão pública deve ser um arquivo novo,
com novo hash e proveniência, preservando o original.

### 10.6 D01-08 — inspeção visual direta das 16 páginas

| Pergunta | Resultado factual |
|---|---|
| Contém fotografia? | SIM |
| Contém pessoa identificável? | SIM |
| Quantidade aproximada | Mais de 40 aparições humanas ao longo da peça; há repetições e não foi feita contagem de identidades únicas |
| Contém menor aparente? | SIM — página 12 |
| Contém nome associado a pessoa? | SIM — nomes institucionais/históricos aparecem em marca e placa; nenhuma legenda foi encontrada nomeando as pessoas fotografadas |
| Contém contato pessoal? | NÃO |
| Contém metadados sensíveis ou desnecessários? | SIM — autor, software, timestamps, XMP e outros campos técnicos; sem GPS identificado |

Fotografias com pessoas aparecem nas páginas 2, 3 e 7 a 14. Há rostos
reconhecíveis em várias delas. A contagem acima é de aparições, não de pessoas
únicas, pois a peça reutiliza fotografias em colagens. Não foi usado
reconhecimento facial e ninguém foi identificado.

```
revisao_privacidade: concluida
decisao_recomendada: DECISAO_HUMANA
```

A decisão humana deve definir se existe base/autorização suficiente para as
imagens, especialmente a que inclui menor aparente. Se houver publicação, é
necessário um derivado público com saneamento de metadados e, conforme a
decisão humana, redação, substituição ou exclusão das fotografias afetadas.

### 10.7 Metadados — resultado consolidado

Conteúdo visual/textual e metadado técnico foram avaliados separadamente.

| ID | Categorias presentes | Ação recomendada |
|---|---|---|
| A02 | software; outro (título) | Remover software no derivado público |
| A04 | software; outro (título) | Software dispensável; decisão humana não depende desse campo |
| D01-01 | software | Remover no derivado público |
| D01-02 | software; timestamp | Remover no derivado público |
| D01-03 | XMP; EXIF técnico | Remover no derivado público |
| D01-04 | nenhum | Nenhuma |
| D01-05 | XMP; EXIF técnico | Remover no derivado público |
| D01-06 | nenhum | Nenhuma |
| D01-07 | XMP; EXIF técnico | Remover no derivado público |
| D01-08 | autor; software; timestamp; XMP; outro | Remover no derivado público |

Nenhum GPS foi encontrado. Os EXIF de D01-03, D01-05 e D01-07 contêm apenas
campos técnicos de orientação e resolução, sem localização. Nenhum conteúdo
de metadado pessoal foi reproduzido neste relatório.

### 10.8 Conclusão por arquivo

| ID | revisao_privacidade | decisao_recomendada | Derivado necessário |
|---|---|---|---|
| A02 | concluida | CRIAR_DERIVADO_PUBLICO | SIM — redação de dados profissionais nominais e saneamento de metadados |
| A04 | concluida | DECISAO_HUMANA | A definir pelo responsável |
| D01-01 | concluida | CRIAR_DERIVADO_PUBLICO | SIM — saneamento de metadados |
| D01-02 | concluida | CRIAR_DERIVADO_PUBLICO | SIM — saneamento de metadados |
| D01-03 | concluida | CRIAR_DERIVADO_PUBLICO | SIM — saneamento de metadados |
| D01-04 | concluida | PUBLICAR_ORIGINAL | NÃO |
| D01-05 | concluida | CRIAR_DERIVADO_PUBLICO | SIM — saneamento de metadados |
| D01-06 | concluida | PUBLICAR_ORIGINAL | NÃO |
| D01-07 | concluida | CRIAR_DERIVADO_PUBLICO | SIM — saneamento de metadados |
| D01-08 | concluida | DECISAO_HUMANA | SIM se houver publicação; escopo depende da decisão humana |

As decisões recomendadas não foram executadas. `revisao_privacidade` não foi
gravada no banco, nenhum `estado_documental` mudou e nenhum item foi promovido
a `PUBLICAVEL`.

### 10.9 Resultado operacional desta segunda passagem

1. Acesso direto obtido: **SIM**.
2. Hashes íntegros: **10/10**.
3. A02 revisado diretamente: **SIM**.
4. A02 decisão recomendada: **CRIAR_DERIVADO_PUBLICO**.
5. A02 páginas que exigem tratamento: **página 7**.
6. A04 revisado diretamente: **SIM**.
7. A04 decisão recomendada: **DECISAO_HUMANA**.
8. D01 revisados diretamente: **8/8**.
9. D01 sem risco de conteúdo pessoal que impeça publicação: **D01-01 a D01-07**; D01-01 e D01-02 contêm ilustração e nome integrantes da marca, sem pessoa fotografada.
10. D01 com risco: **D01-08**, por fotografias de pessoas identificáveis e menor aparente.
11. D01-08 contém pessoas: **SIM**.
12. Arquivos com metadados a remover: **A02, D01-01, D01-02, D01-03, D01-05, D01-07 e D01-08**. A04 contém software dispensável, mas sem metadado pessoal; sua remoção pode acompanhar eventual derivado. D01-04 e D01-06 não exigem saneamento.
13. Arquivos que podem receber `revisao_privacidade = concluida`: **os 10**.
14. Derivados necessários: **A02; D01-01, D01-02, D01-03, D01-05 e D01-07; D01-08 se houver publicação**. A04 depende da decisão humana.
15. Decisões humanas restantes: **alcance da autorização/natureza contextual do nome em A04; base/autorização e tratamento das imagens de D01-08, especialmente a com menor aparente**.
16. Algum `PUBLICAVEL` foi criado: **NÃO**.
17. Upload realizado: **NÃO**.
