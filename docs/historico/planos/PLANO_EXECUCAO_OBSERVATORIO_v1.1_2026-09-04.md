> **SUPERADO — preservado apenas para histórico.**
> Não usar como orientação operacional vigente.
> Referências vigentes: [`PLANO_EXECUCAO_OBSERVATORIO.md`](../../../PLANO_EXECUCAO_OBSERVATORIO.md)
> e [`ESTADO_ATUAL_PROJETO.md`](../../../ESTADO_ATUAL_PROJETO.md).
> Movido em 2026-09-06 pela consolidação de governança.

---

# Plano de Execução — Observatório do Vale do Rio Real
## Da organização documental à entrega oficial para a FUNCAP

**Versão:** 1.1  
**Data-base:** 2026-09-04  
**Prazo interno do site:** 2026-09-14  
**Prazo de envio do pacote à FUNCAP:** 2026-09-22  
**Status:** Documento operacional de governança para orientar a equipe e a IA

---

# 1. Objetivo deste documento

Este documento orienta as próximas etapas do projeto até a entrega à FUNCAP.

A prioridade operacional é transformar os materiais existentes em evidência:

- localizável;
- íntegra;
- verificável;
- permanente;
- publicada de forma responsável.

O site é a interface pública dessa estrutura, mas a integridade documental, a privacidade e a conferência dos anexos têm prioridade sobre novas funcionalidades visuais.

---

# 2. Datas oficiais

## 2.1 14/09/2026 — prazo interno do site

Até 14/09 o site deve estar:

- publicado;
- navegável;
- funcional;
- com a Prestação de Contas acessível;
- com documentos públicos disponíveis;
- com documentos restritos protegidos;
- com inventário reconciliado;
- com URLs e hashes conferidos;
- com as rotas principais estáveis;
- pronto para revisão interna.

A partir de 14/09:

**não iniciar novas funcionalidades.**

Permitir apenas:

- correções críticas;
- privacidade;
- dados;
- links;
- acessibilidade;
- marcas;
- consistência documental.

---

## 2.2 22/09/2026 — envio à FUNCAP

O pacote oficial será preparado para envio em 22/09.

A janela entre 15/09 e 21/09 será usada para:

- auditoria;
- correções;
- revisão de conteúdo;
- validação de URLs;
- conferência de hashes;
- preparação dos pacotes;
- eventual Zenodo;
- fechamento do material destinado à FUNCAP.

---

# 3. Caderno de Estudos — não bloqueia o site

O **Caderno de Estudos ainda não está pronto** e, a partir desta versão do plano, **não é dependência para considerar o site pronto em 14/09**.

## 3.1 Regra para o site

A arquitetura deve deixar espaço para o Caderno, mas não inventar conteúdo.

Enquanto não houver arquivo aprovado:

```text
Caderno de Estudos
→ status: PENDENTE
→ sem URL
→ sem download fictício
→ sem conteúdo improvisado
```

A Home, Prestação de Contas ou área correspondente pode reservar o local estrutural do Caderno, desde que o estado pendente fique claro e não gere uma falsa impressão de disponibilidade.

## 3.2 Regra para a IA

A IA não deve:

- escrever o Caderno;
- completar trechos ausentes;
- gerar modelagem estatística por conta própria;
- criar PDF provisório apenas para preencher o espaço;
- bloquear o deploy do site por ausência do Caderno.

## 3.3 Regra administrativa

A retirada da dependência técnica **não altera automaticamente eventual obrigação formal perante a FUNCAP**.

Permanece recomendada a confirmação sobre:

- se o Caderno precisa integrar o pacote de 22/09;
- se a previsão posterior registrada anteriormente continua válida;
- como a FUNCAP deseja receber atualização/complementação da seção de anexos.

Até resposta oficial, o sistema deve apenas refletir a realidade documental: **Caderno pendente**.

---

# 4. Pasta local de fontes

A pasta:

```text
observatorio-fontes/
```

é a fonte de trabalho para os arquivos originais.

**Não colocar esta pasta dentro do Git.**

Estrutura recomendada:

```text
observatorio-fontes/

├── entrevistas/
│   ├── audios/
│   ├── transcricoes/
│   └── termos-consentimento/
│
├── fotos/
│
├── relatorios/
│   ├── originais-assinados/
│   └── versoes-publicas/
│
├── diagnosticos/
│
├── formularios/
│
├── identidade-visual/
│   ├── observatorio/
│   ├── coletivo/
│   └── referencias/
│
├── marcas/
│   ├── pnab/
│   ├── minc-governo-federal/
│   ├── funcap/
│   └── governo-sergipe/
│
├── caderno-estudos/
│
├── derivados-publicos/
│
└── nao-classificados/
```

---

# 5. Política de integridade documental

Nunca sobrescrever o original.

Quando um documento precisar de versão pública:

```text
ORIGINAL
→ preservado integralmente
→ hash próprio
→ RESTRITO quando necessário

DERIVADO PÚBLICO
→ novo arquivo
→ novo hash
→ relação explícita com o original
→ revisão de privacidade
```

O derivado nunca substitui historicamente o original.

---

# 6. Estados documentais oficiais

| Estado | Significado |
|---|---|
| `PUBLICAVEL` | Arquivo íntegro, revisado, autorizado e apto a acesso público |
| `RESTRITO` | Arquivo íntegro, necessário à conferência, mas não pode ter acesso público |
| `ESPELHAVEL` | Existe e está identificado, porém ainda precisa ser processado/uploadado |
| `IMPEDIDO` | Há problema objetivo que impede publicação ou conferência |
| `PENDENTE` | O entregável ainda não existe, não foi localizado ou aguarda aprovação |

## 6.1 Fail-closed

Nenhum item pode se tornar `PUBLICAVEL` por omissão.

Para publicação pública devem existir, no mínimo:

```text
estado = PUBLICAVEL
revisao_privacidade = concluida
```

Se a classificação humana não estiver registrada:

```text
NÃO PUBLICAR
```

---

# 7. Original ↔ derivado público

O modelo deve suportar relação explícita:

```text
original_restrito
      ↓
derivado_publico
```

O derivado deve registrar:

- documento de origem;
- tipo de derivação;
- data;
- hash;
- observação de proveniência.

---

# 8. Gate de privacidade

A revisão humana é obrigatória.

Além dela, deve existir um gate automatizado complementar para itens candidatos a publicação.

O gate pode procurar padrões determinísticos como:

- CPF;
- telefone;
- e-mail;
- outros identificadores configurados.

Regra:

> o gate automatizado pode vetar uma publicação, mas nunca pode declarar sozinho que um arquivo é seguro.

Um item não classificado ou sem revisão de privacidade deve falhar fechado.

---

# 9. Relatório de Objeto com dados sensíveis

O original deve permanecer:

```text
RESTRITO
```

A versão pública deve:

- ser um novo arquivo;
- remover/redigir dados pessoais desnecessários;
- manter o conteúdo necessário à prestação de contas;
- possuir hash próprio;
- registrar origem;
- indicar claramente que é uma versão pública redigida.

---

# 10. Entrevistas

Padrão inicial:

```text
Áudio        → RESTRITO
Transcrição  → RESTRITO
Termo        → RESTRITO
```

Uma transcrição só pode se tornar `PUBLICAVEL` após:

- consentimento verificado;
- revisão de privacidade;
- aprovação explícita.

A existência da entrevista ou da transcrição não equivale a autorização de publicação.

---

# 11. Reconciliação das entrevistas

Itens já identificados para conferência:

- Josenilson Bispo / “Nilsinho”;
- Oviêdo Abreu e Neide Abreu;
- Fundação de Cultura de São Cristóvão;
- Diretor de Turismo de São Cristóvão;
- Pedro Menezes / Recanto da Serra;
- Dílson / Prefeitura de Tobias Barreto;
- Laerte Aguiar / Tomar do Geru;
- Dona Madá / Ilha Grande.

A IA não deve:

- inventar entrevistado;
- inferir município;
- criar entrevista ausente;
- publicar automaticamente.

---

# 12. Nove documentos já identificados

Os seguintes itens possuem conteúdo já identificado em documentação existente:

```text
A02
A03
A04
A05
A06
B09
B10
B11
B12
```

## 12.1 Estado atual

**Não extrair ainda de versão antiga se relatórios atualizados estiverem chegando.**

A extração definitiva deve usar a fonte atualizada aprovada.

## 12.2 Quando extrair

Cada derivado deve registrar:

- código;
- título;
- fonte;
- páginas/trecho de origem quando aplicável;
- data de extração;
- hash;
- natureza de documento derivado.

Nunca apresentar um derivado como se fosse o original histórico.

---

# 13. Storage — dois ambientes separados

A separação público/privado é obrigatória antes do primeiro upload restrito.

## 13.1 Bucket público

Pode conter:

- PDFs públicos;
- datasets;
- imagens liberadas;
- transcrições autorizadas;
- derivados públicos.

## 13.2 Bucket privado

Deve conter:

- originais sensíveis;
- áudios;
- termos;
- relatórios integrais restritos;
- fotos/documentos protegidos.

O bucket privado:

- não pode aceitar acesso anônimo;
- não pode fornecer URL pública permanente direta.

Acesso deve ocorrer por mecanismo autenticado, por exemplo:

- URL assinada de curta duração;
- proxy autenticado;
- rota protegida.

---

# 14. Banco — três roles

A arquitetura passa a utilizar três níveis de privilégio.

## 14.1 `DATABASE_URL`

Role:

```text
app_observatorio
```

Permissões:

```text
SELECT
```

Sem DML de escrita.
Sem DDL.

Uso:

- Next.js;
- leitura durante build;
- leitura da aplicação.

---

## 14.2 `DATABASE_URL_MANUTENCAO`

Role:

```text
manutencao_observatorio
```

Permissões:

```text
SELECT
INSERT
UPDATE
DELETE
```

Sem DDL.

Uso:

- catalogação;
- espelhamento;
- importações;
- manutenção controlada;
- atualização de metadados.

---

## 14.3 `DATABASE_URL_MIGRACAO`

Uso:

- migrations;
- DDL;
- schema;
- funções;
- views;
- triggers;
- alterações estruturais.

---

# 15. Default privileges

Ao configurar privilégios futuros, a IA deve identificar o **role real que executa as migrations**.

Não usar placeholder cegamente.

Forma conceitual:

```sql
ALTER DEFAULT PRIVILEGES
FOR ROLE <role_real_das_migracoes>
IN SCHEMA public
GRANT SELECT ON TABLES TO app_observatorio;

ALTER DEFAULT PRIVILEGES
FOR ROLE <role_real_das_migracoes>
IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO manutencao_observatorio;
```

Também revisar:

- scripts;
- clientes de banco;
- `.env.example`;
- documentação;
- testes;
- CI;
- código que atualmente usa `DATABASE_URL`.

Criar a variável sem repontar os consumidores não conclui a tarefa.

---

# 16. Manifesto de Evidências

O Manifesto de Evidências passa a ser um produto de primeira classe desde o início.

**Não é uma fonte de verdade concorrente.**

A fonte canônica permanece o modelo estruturado/banco.

Fluxo:

```text
Banco / inventário canônico
          │
          ▼
Manifesto de Evidências
   ┌──────┼────────┬────────┐
   ▼      ▼        ▼        ▼
Web     JSON      CSV      PDF
   │
   ▼
Índice dos pacotes ZIP
```

Campos mínimos:

```text
codigo
entregavel
estado
url
sha256
doi
observacao
derivado_de
```

`doi` é opcional e não bloqueia a entrega.

O Manifesto deve existir cedo e evoluir junto com o acervo.

---

# 17. Pacotes de arquivos

Devem existir dois pacotes distintos.

## 17.1 Pacote público

```text
pacote-publico.zip
```

Contém somente:

```text
PUBLICAVEL
```

Nunca incluir `RESTRITO`.

---

## 17.2 Pacote de avaliação

Pode conter:

```text
PUBLICAVEL + RESTRITO
```

Somente por canal controlado.

O pacote de avaliação nunca deve ser hospedado como download público.

## 17.3 Regra regulatória

A existência destes pacotes é parte da estratégia de entrega documental.

**Não está confirmado que eles substituem qualquer obrigação formal do portal.**

Qualquer equivalência regulatória depende de confirmação da FUNCAP.

---

# 18. Prioridade atual

## Caminho crítico técnico

1. checkpoint seguro;
2. infraestrutura;
3. três roles;
4. dois buckets;
5. inventário;
6. estados;
7. privacidade;
8. versões públicas;
9. espelhamento;
10. hashes;
11. manifesto;
12. deploy;
13. auditoria.

## Não bloqueiam o site de 14/09

- Caderno de Estudos;
- Zenodo;
- novas animações;
- novos indicadores;
- expansão do mapa;
- novas ilustrações;
- refinamentos não essenciais.

---

# 19. Cronograma até 14/09

## 04–05/09 — Infraestrutura + organização local

Trilha técnica:

- checkpoint/commit;
- banco;
- migrations;
- três roles;
- dois buckets;
- variáveis;
- testes de isolamento.

Equipe:

- terminar organização de `observatorio-fontes/`;
- separar originais;
- termos;
- transcrições;
- marcas;
- relatórios atualizados.

---

## 06–07/09 — Inventário + modelo documental

- reconciliar inventário;
- incorporar relatórios atualizados;
- formalizar estados;
- implementar fail-closed;
- implementar relação original/derivado;
- iniciar Manifesto de Evidências.

---

## 08–09/09 — Privacidade + derivados

- criar versões públicas;
- aplicar revisão;
- gate automatizado;
- extrair os nove documentos quando a fonte atualizada estiver aprovada;
- gerar hashes;
- validar metadados.

---

## 10–11/09 — Espelhamento + integração

- upload público;
- upload privado;
- re-download;
- comparação de hashes;
- atualizar Manifesto;
- consolidar Prestação de Contas;
- consolidar site.

---

## 12/09 — BUFFER

Não agendar nova feature.

Usar apenas para:

- imprevistos;
- correções;
- infraestrutura;
- privacidade;
- inconsistências;
- links;
- arquivos.

---

## 13/09 — Auditoria cega

Uma pessoa que não participou da implementação recebe apenas a URL.

Não fornecer explicação prévia.

Ela deve tentar:

- entender o projeto;
- localizar Prestação de Contas;
- encontrar anexos;
- baixar arquivos;
- identificar estados;
- navegar em mobile/desktop;
- reportar qualquer ponto confuso.

---

## 14/09 — Freeze interno

Site entregue para revisão interna.

Não iniciar funcionalidades.

---

# 20. Período 15/09–21/09

Usar para:

- correções;
- segunda auditoria;
- revisão de marcas;
- validação externa;
- pacote público;
- pacote de avaliação;
- fechamento do Manifesto;
- eventual Zenodo;
- preparação do envio à FUNCAP.

---

# 21. Entrega de 22/09

Entregáveis devem derivar do Manifesto.

Formato mínimo:

```text
Código
Entregável
Estado
URL
SHA-256
DOI
Observação
```

Para item restrito:

```text
URL pública: —
Estado: RESTRITO
Acesso: canal controlado
```

Para o Caderno ainda indisponível:

```text
Estado: PENDENTE
URL: —
```

Não inventar arquivo ou link para preencher lacuna.

---

# 22. Pendências administrativas

Devem ser resolvidas por contato humano.

## 22.1 Caderno

Confirmar com a FUNCAP, se necessário:

- se precisa integrar o pacote de 22/09;
- se a previsão posterior continua válida.

## 22.2 Seção 9 / links do Drive

Confirmar:

- se a seção pode ser substituída;
- ou se uma tabela complementar com URLs permanentes pode ser anexada ao envio final.

## 22.3 Marcas

Confirmar dúvidas sobre:

- FUNCAP;
- Governo de Sergipe;
- PNAB;
- disposição obrigatória das assinaturas.

---

# 23. Pendências manuais de infraestrutura

Status deve ser atualizado pela equipe:

- [ ] domínio registrado;
- [ ] renovação automática configurada;
- [ ] bucket R2 público criado;
- [ ] bucket R2 privado criado;
- [ ] chaves geradas;
- [ ] conta Vercel pronta;
- [ ] domínio conectado;
- [ ] e-mail/contato sobre marcas realizado.

---

# 24. Regras obrigatórias para a IA

Antes de cada etapa, a IA deve:

1. ler este plano;
2. ler o estado atual válido do projeto;
3. ler a tarefa;
4. identificar bloqueios;
5. respeitar a regra de parada.

A IA nunca deve:

- inventar dados;
- inventar URL;
- inventar arquivo;
- inventar coordenada;
- publicar por omissão;
- expor arquivo restrito;
- alterar migration aplicada;
- usar credencial de migração para manutenção rotineira;
- sobrescrever original;
- criar conteúdo apenas para “completar” uma lista;
- transformar o Caderno em bloqueio técnico do site.

---

# 25. Gates obrigatórios

Quando houver código:

```bash
pnpm tipos
pnpm lint
pnpm teste
pnpm build
pnpm a11y
```

Quando houver documento público:

1. hash local;
2. upload;
3. download sem sessão;
4. hash do download;
5. comparação.

Quando houver documento candidato a público:

1. classificação explícita;
2. revisão de privacidade concluída;
3. gate automatizado;
4. integridade;
5. publicação.

---

# 26. Definition of Done — documento público

Um documento só está pronto quando:

- fonte conhecida;
- original preservado;
- classificação explícita;
- revisão de privacidade concluída;
- gate passou;
- hash calculado;
- upload correto;
- URL funcional;
- hash remoto coincide;
- metadados corretos;
- Manifesto atualizado;
- site reflete o estado corretamente.

---

# 27. Definition of Done — site em 14/09

O site pode ser considerado pronto mesmo com o Caderno `PENDENTE`, desde que:

- deploy de produção exista;
- domínio funcione;
- rotas principais funcionem;
- Prestação de Contas funcione;
- documentos públicos estejam acessíveis;
- restritos não vazem;
- hashes estejam conferidos;
- inventário esteja reconciliado;
- Manifesto exista;
- estados estejam corretos;
- mapa funcione;
- mobile funcione;
- teclado funcione;
- marcas essenciais estejam corretas;
- gates passem;
- nenhum conteúdo fictício tenha sido criado para preencher lacunas.

---

# 28. Sequência oficial para a IA

## Prompt 1 — Infraestrutura

- checkpoint;
- três roles;
- `FOR ROLE` correto;
- dois buckets;
- testes de isolamento;
- variáveis;
- revisão dos consumidores de banco.

## Prompt 2 — Inventário e fontes

- auditar `observatorio-fontes/`;
- reconciliar;
- detectar ausências;
- detectar duplicidades;
- esperar fonte atualizada quando necessário.

## Prompt 3 — Estados, privacidade e Manifesto

- cinco estados;
- fail-closed;
- revisão de privacidade;
- gate automatizado;
- original ↔ derivado;
- Manifesto de Evidências.

## Prompt 4 — Derivados e extrações

- versões públicas;
- nove documentos identificados;
- hashes;
- proveniência.

## Prompt 5 — Espelhamento

- público;
- privado;
- URLs;
- re-download;
- validação de hashes;
- pacotes ZIP.

## Prompt 6 — Deploy e auditoria

- produção;
- marcas;
- domínio;
- Manifesto final;
- auditoria;
- freeze.

---

# 29. Governança

Este plano é a referência operacional vigente.

Quando houver conflito:

- não corrigir silenciosamente;
- registrar a contradição;
- parar;
- solicitar decisão;
- atualizar ADR ou este plano quando necessário.

Evitar criar múltiplos documentos concorrentes de estado.

Preferir:

```text
PLANO_EXECUCAO_OBSERVATORIO
+
ESTADO_ATUAL_PROJETO
```

---

# 30. Próximo passo autorizado

O próximo passo técnico é:

> **Prompt 1 — Infraestrutura com três roles e dois buckets.**

Em paralelo, a equipe termina a organização de `observatorio-fontes/`.

A ausência do Caderno de Estudos **não bloqueia esta etapa e não bloqueia o site de 14/09**.

---

# 31. Princípio final

O projeto deve refletir a realidade documental.

Se algo ainda não existe:

> mostrar como pendente é correto.

Inventar um arquivo, link, número ou conteúdo para preencher a ausência é incorreto.

O sistema deve ser confiável justamente porque distingue claramente:

**o que existe, o que é público, o que é restrito e o que ainda está pendente.**
