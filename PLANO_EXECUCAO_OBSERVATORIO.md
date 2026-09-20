# Plano de Execução — Observatório do Vale do Rio Real

**Referência operacional canônica.** Responde a uma pergunta só: **como o
projeto deve ser conduzido?**

Onde o projeto está agora é assunto de [`ESTADO_ATUAL_PROJETO.md`](./ESTADO_ATUAL_PROJETO.md).

Consolidado em 2026-09-06 a partir do plano v1.1 de 2026-09-04, incorporando
apenas decisões posteriores explicitamente aprovadas. O v1.1 integral está
preservado em
[`docs/historico/planos/`](./docs/historico/planos/PLANO_EXECUCAO_OBSERVATORIO_v1.1_2026-09-04.md).

---

## 1. Datas oficiais

| Data | O que é | Natureza |
|---|---|---|
| **14/09/2026** | prazo interno do site | congelamento interno, não é entrega à FUNCAP |
| **22/09/2026** | envio do pacote à FUNCAP | entrega oficial |

O prazo de 14/09 existe para que haja uma semana entre o site pronto e o envio
oficial. Ele não se confunde com o prazo do edital.

### O Caderno de Estudos não bloqueia o site

O Caderno é entregável administrativo. Enquanto não existir, o item aparece como
`PENDENTE` na Prestação de Contas, com previsão. **Isso não bloqueia
tecnicamente o site de 14/09**, e nenhum caderno provisório é criado para
preencher a ausência.

---

## 2. Fonte documental canônica

Os originais vivem **fora do repositório**, em pasta local apontada por:

```
OBSERVATORIO_FONTES_DIR
```

Regras:

- a variável fica em `.env.local`, nunca versionada;
- `.env.example` documenta **apenas o nome** da variável;
- **nenhum caminho de usuário em código versionado** — o projeto lê a variável;
- áudio, transcrição, foto original e planilha com resposta individual **nunca
  entram no Git**;
- o repositório guarda metadado, hash e proveniência; nunca o binário sensível.

A pasta é fonte primária. Alteração nela é ato deliberado e registrado, nunca
efeito colateral de uma tarefa.

---

## 3. Original ↔ derivado

Nunca sobrescrever o original.

```text
ORIGINAL
  → preservado integralmente
  → hash próprio
  → RESTRITO quando necessário
  → nunca sobrescrito

DERIVADO
  → arquivo novo
  → hash próprio
  → derivado_de
  → método
  → data
  → finalidade
```

O derivado nunca substitui historicamente o original.

### Método do derivado precisa ser descrito com precisão

Para PDF que é imagem — caso do relatório de Borda da Mata — há duas técnicas
diferentes, e **elas não podem ser confundidas no registro**:

| Técnica | O que é |
|---|---|
| **OCR estatístico** | motor de reconhecimento óptico (Tesseract e afins) converte pixels em texto, com taxa de erro própria |
| **Transcrição assistida por leitura visual** | as páginas são extraídas como imagem e transcritas por leitura, sem motor de OCR |

**Não afirmar que houve OCR estatístico quando a técnica foi leitura visual.**
O campo `método` do derivado registra qual das duas foi usada. Os derivados
produzidos até aqui usaram **leitura visual**.

Em qualquer técnica: nada é corrigido, completado ou inferido. Trecho de baixa
confiança é marcado para revisão, e defeito do original — texto truncado pelo
layout, por exemplo — é reproduzido e sinalizado, não consertado.

---

## 4. Estados documentais

Cinco estados, e só estes:

| Estado | Significado |
|---|---|
| `PUBLICAVEL` | íntegro, revisado, autorizado e apto a acesso público |
| `RESTRITO` | íntegro e necessário à conferência, mas sem acesso público |
| `ESPELHAVEL` | existe e está identificado, falta processar e subir |
| `IMPEDIDO` | há problema objetivo que impede publicação ou conferência |
| `PENDENTE` | não existe, não foi localizado ou aguarda aprovação |

### Fail-closed

**Nenhum item se torna `PUBLICAVEL` por omissão.**

Para publicação pública, no mínimo:

```text
estado = PUBLICAVEL
revisao_privacidade = concluida
```

Falta classificação humana registrada ⇒ **não publicar**. Item sem estado, sem
revisão ou sem URL permanece não público. **Nenhuma publicação por omissão**, em
nenhuma hipótese.

### A revisão de privacidade é eixo independente do estado

`revisao_privacidade` **não** é um estado documental: é um campo próprio, que
corre em paralelo. Um item pode estar `ESPELHAVEL` com revisão pendente, ou
`RESTRITO` com revisão concluída. As duas condições são checadas
separadamente, e publicar exige as duas.

Existe também gate automatizado complementar, que procura padrão determinístico
— CPF, telefone, e-mail e outros identificadores configurados. Regra dele:

> o gate automatizado pode **vetar** uma publicação, mas nunca pode declarar
> sozinho que um arquivo é seguro.

---

## 5. Itens obrigatórios versus evidências complementares

A Prestação de Contas tem um **conjunto canônico de 28 itens exigidos** pelo
edital. Esse número é do edital, não do acervo.

Material adicional descoberto durante a pesquisa é registrado como **evidência
complementar**. Uma evidência complementar:

- **não altera a quantidade de itens exigidos**;
- **não transforma automaticamente o seu código em requisito da FUNCAP**;
- pode ter código interno próprio;
- tem `obrigatorio = false`, ou semântica equivalente.

**Tratamento inicial:** `B13`, `B14` e o conjunto técnico de indicadores são
**candidatos a evidência complementar**, até o modelo definitivo do Prompt 3.

**Não registrar em lugar nenhum que a FUNCAP exige esses novos códigos.** Ela
não os exige; eles enriquecem a comprovação.

---

## 6. Consentimento

O consentimento das entrevistas é **verbal e gravado**, obtido na abertura da
conversa e registrado no áudio e na transcrição. **Não existe termo separado, e
não deve ser criado.**

Registro por entrevista:

```text
consentimento_tipo     = verbal_gravado
evidencia_transcricao  = localizada | nao_localizada
evidencia_audio        = localizada | pendente_verificacao
localizacao            = trecho/timestamp, sem reproduzir a fala
```

Regras:

- consentimento verbal comprovado **é evidência factual** e é registrado como
  tal quando localizado;
- ausência de evidência significa **"não localizado nesta auditoria"**, nunca
  "consentimento inexistente";
- **nenhuma autorização é inferida**, em nenhuma direção;
- a fala do consentimento **não é copiada para o Git**;
- áudio e transcrição permanecem `RESTRITO` mesmo com consentimento
  comprovado. A promoção depende de revisão de privacidade e aprovação
  explícita.

---

## 7. Formulários reconstituídos

Cabeçalho de planilha de respostas **comprova as perguntas aplicadas**. É fonte
válida e dispensa o link `/edit` do Google Forms, que não abre para terceiro.

Mas cabeçalho **não prova**:

- tipo de campo;
- opções oferecidas;
- lógica condicional;
- obrigatoriedade;
- interface original.

Portanto, documento produzido a partir de cabeçalhos é descrito como:

> **"Reconstituição do instrumento de coleta"**

e nunca como o instrumento original — salvo quando houver reprodução integral
comprovada do formulário aplicado.

A distinção entre **instrumento** e **respostas** é preservada em todo o fluxo.
Resposta individual é `RESTRITO`.

---

## 8. Marcas e créditos de fomento

Os ativos de marca atualmente previstos **foram localizados no acervo** — PNAB /
Lei Aldir Blanc, Ministério da Cultura, Governo Federal, Governo de Sergipe e
FUNCAP.

**Isso não resolve o item E02.**

E02 depende de regras oficiais sobre:

- ordem;
- proporção;
- chancela;
- tamanho;
- área de proteção;
- composição.

Arquivo de arte não é regra de aplicação. Enquanto E02 estiver `PENDENTE`, o
rodapé mantém o espaço reservado e declarado, sem logo e sem proporção
estimada — crédito de fomento errado é causa recorrente de ressalva.

**Não chamar uma marca de obrigatória só porque o arquivo existe.**

**Cultura Viva e Lei Rouanet não entram no bloco institucional** sem base
específica que os exija: são de outras políticas de fomento, e creditá-los aqui
seria crédito indevido.

---

## 9. Banco de dados — três roles

| Variável | Role | Privilégio |
|---|---|---|
| `DATABASE_URL` | `app_observatorio` | `SELECT` |
| `DATABASE_URL_MANUTENCAO` | `manutencao_observatorio` | `SELECT, INSERT, UPDATE, DELETE`, sem DDL |
| `DATABASE_URL_MIGRACAO` | role real das migrations | DDL |

Regras:

- nenhum dos dois primeiros recebe `CREATE` no schema;
- script que faz DML usa `DATABASE_URL_MANUTENCAO`, nunca a de leitura nem a de
  migração;
- o cliente de manutenção vive em `src/dados/clienteManutencao.ts` e **não faz
  fallback**: sem a variável, falha com erro explícito;
- migração versionada é o único mecanismo de mudança de schema;
- `ALTER DEFAULT PRIVILEGES` é configurado **para o role real que cria os
  objetos**, e `GRANT ... ON ALL` cobre o que já existe. Os dois mecanismos são
  necessários.

Detalhamento em `docs/decisoes/ADR-011-credencial-manutencao.md` e
`ADR-007-provisionamento-roles.md`.

---

## 10. Storage — dois buckets

| Bucket | Variáveis | Característica |
|---|---|---|
| público | `STORAGE_PUBLIC_ENDPOINT`, `_BUCKET`, `_ACCESS_KEY`, `_SECRET`, `STORAGE_PUBLIC_URL` | tem URL pública |
| privado | `STORAGE_PRIVATE_ENDPOINT`, `_BUCKET`, `_ACCESS_KEY`, `_SECRET` | **sem URL pública** |

O bucket privado não tem URL pública, e o código que o acessa **não faz
fallback para o público**. Evidência restrita vive nele.

Detalhamento em `docs/decisoes/ADR-012-storage-publico-privado.md`.

---

## 11. Manifesto de Evidências

O Manifesto é **derivado da fonte canônica** — banco e inventário. Ele não é
fonte: é projeção.

Regras:

- não preencher URL, hash ou publicação de item ainda não reconciliado;
- item sem estado, sem revisão ou sem URL **permanece não público**;
- a camada canônica só é atualizada depois de a reconciliação inequívoca ser
  aprovada;
- **relatório de auditoria não substitui o Manifesto**, e vice-versa.

---

## 12. Pacotes de arquivos

### ZIP público

Gerado e publicado por operação explícita separada (`pnpm publicar-zip`),
nunca como efeito de `pnpm build`. Vive no bucket público. Entram **somente** itens que
satisfaçam, ao mesmo tempo:

```text
estado = PUBLICAVEL
revisao_privacidade = concluida
```

mais arquivo, hash e proveniência obrigatórios. Sem candidato elegível, **o ZIP
não é gerado nem enviado** — não se publica pacote vazio.

### Evidência restrita nunca entra em pacote público

`RESTRITO`, `PENDENTE`, `IMPEDIDO` e `ESPELHAVEL` **não** entram no ZIP
público, em nenhuma circunstância. Pacote de avaliação com material restrito, se
houver, é entrega dirigida e separada — nunca o mesmo artefato.

---

## 13. Auditorias

`docs/auditorias/` guarda **snapshots históricos independentes**. Eles não são
documentos de estado e não são fundidos entre si:

- a auditoria de 72 arquivos continua válida como retrato do acervo anterior;
- a auditoria de 138 arquivos retrata a fonte canônica posterior;
- nenhuma substitui ou reescreve a outra.

Auditoria que envelhece recebe **aviso de estado**, apontando o que ficou
desatualizado e onde está o retrato novo. **Não se reescreve auditoria antiga
para parecer atual.**

---

## 14. Ordem de leitura antes de uma tarefa

1. `PLANO_EXECUCAO_OBSERVATORIO.md` — este arquivo;
2. `ESTADO_ATUAL_PROJETO.md`;
3. ADRs diretamente relacionadas à tarefa;
4. auditoria específica **somente** quando a tarefa depender dela.

`AGENTS.md` continua sendo o contrato de trabalho e a fonte normativa única das
regras de execução. Estados históricos em `docs/historico/estados/` **não são
leitura obrigatória**.

---

## 15. Gates

```bash
pnpm tipos      # tsc --noEmit
pnpm lint       # biome
pnpm teste      # vitest
pnpm a11y       # playwright + axe
pnpm pendencias # gate de pendências de publicação
pnpm build      # somente compilação do site
pnpm publicar-zip # operação externa explícita; não faz parte do build
```

Regras de execução:

- mudança documental: `pnpm lint` e `pnpm teste` bastam;
- mudança de código ou configuração: acrescentar `pnpm tipos`;
- **`pnpm build` é compilação somente** e não pode publicar no storage;
- qualquer publicação externa, inclusive o ZIP, exige comando separado e
  autorização explícita;
- Lighthouse CI continua exigido e temporariamente não executado; o gate não foi
  rebaixado.

---

## 16. Definição de pronto

### Documento público

- [ ] `estado = PUBLICAVEL` e `revisao_privacidade = concluida`
- [ ] arquivo espelhado em storage próprio, com hash registrado
- [ ] URL permanente no domínio do projeto
- [ ] proveniência declarada; se derivado, `derivado_de` e método
- [ ] nenhum dado pessoal desnecessário
- [ ] licença declarada

### Site em 14/09

- [ ] os 28 itens exigidos aparecem, **sem exceção**, com estado explícito e
      previsão quando pendente
- [ ] nenhum item desaparece da lista por não ter arquivo
- [ ] nenhum anexo obrigatório depende exclusivamente de link do Drive, Docs,
      Forms ou Figma
- [ ] `pnpm verificar` passa
- [ ] navegável só por teclado, com foco visível; funciona em 360 px
- [ ] nenhum dado fictício
- [ ] créditos de fomento conforme E02 — ou espaço reservado e declarado,
      enquanto E02 estiver pendente

---

## 17. Regras que não se afrouxam

- Áudio de entrevista sem consentimento comprovado **não é publicado**.
- Comentário de visitante que cite nome de terceiro **é anonimizado antes de
  qualquer publicação** — regra da nota metodológica do anexo de indicadores.
- Texto publicado que contenha nome de terceiro sem base: **sinalizar e não
  publicar**.
- Nenhum dado fictício: conteúdo ausente é `null` com estado vazio explícito,
  jamais um placeholder plausível.
- Nenhum código de item é criado para preencher meta.
- Nada é promovido a `PUBLICAVEL` por conveniência de prazo.
