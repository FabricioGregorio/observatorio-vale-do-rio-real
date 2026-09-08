# Auditoria funcional pré-freeze — 2026-09-08

## 1. Escopo

Auditoria funcional do site antes do freeze interno de 14/09/2026, executada sem build, storage, upload, publicação ou alteração persistente de banco. Foram verificadas as rotas reais do App Router, Home, mapa territorial, Sala do Avaliador vazia, `/anexos.json`, contratos de Manifesto e ZIP, links, conteúdo público, privacidade, responsividade, acessibilidade, teclado, console e sinais óbvios de performance.

Fontes vigentes consultadas: `PLANO_EXECUCAO_OBSERVATORIO.md`, `ESTADO_ATUAL_PROJETO.md`, arquiteturas de informação e banco, tarefas relacionadas, ADRs 003, 006, 009, 010, 012, 013, 015 e 016 e o snapshot técnico datado de 2026-09-08.

## 2. Metodologia

- Baseline: `git status`, histórico recente, `pnpm tipos`, `pnpm lint` e `pnpm teste`.
- Inventário estático de `src/app`, componentes cliente, links, botões, textos de desenvolvimento e termos de privacidade.
- Servidor `pnpm dev` em `localhost`, com banco, storage e fontes explicitamente desabilitados no processo.
- Navegação real nas 15 superfícies HTTP, conferência de status, DOM, landmarks, títulos, links e console.
- Responsividade em 375, 768, 1024 e 1440 px na Home, Sala e versão imprimível.
- Teclado: Tab, Shift+Tab, Enter, Espaço e Escape no menu; Enter no CTA principal; setas, Enter, Espaço e Escape no mapa cobertos pela suíte existente.
- Axe/Playwright: 33 testes existentes passaram antes das correções.
- Manifesto, multiarquivo, ZIP e exclusão de privados: revisão de código e testes em memória, sem gerar pacote.

O baseline passou. O lint registrou somente os quatro avisos já conhecidos de `!important` no bloco de movimento reduzido de `src/estilos/tokens.css`.

**Ressalva operacional:** o primeiro `pnpm teste` herdou a configuração local e executou dez casos de integração contra o banco configurado. Os casos envolvidos encapsulam toda escrita em transação com `ROLLBACK`; não houve persistência. Assim que isso foi identificado, as verificações específicas e o gate final foram repetidos com todas as variáveis de banco e storage desabilitadas no processo. O resultado final sem integrações externas foi 226 testes aprovados e 13 pulados.

## 3. Rotas auditadas

Todas responderam `200` no servidor local.

| Rota | Fonte | Renderização relevante | Finalidade | Dados | CTA/recurso | Estado vazio |
|---|---|---|---|---|---|---|
| `/` | `src/app/page.tsx` | Server; ilhas cliente de menu e mapa | Home | arquivos territoriais validados | Sala, caminhos, JSON e impressão | acervo e seções em preparação |
| `/observatorio` | `src/app/observatorio/page.tsx` | Server | rota editorial | não | não | explícito |
| `/pesquisa` | `src/app/pesquisa/page.tsx` | Server | rota editorial | não | não | explícito |
| `/dados` | `src/app/dados/page.tsx` | Server | rota editorial | não | não | explícito |
| `/campo` | `src/app/campo/page.tsx` | Server | rota editorial | não | não | explícito |
| `/podobservar` | `src/app/podobservar/page.tsx` | Server | rota editorial | não | não | explícito |
| `/educacao` | `src/app/educacao/page.tsx` | Server | rota editorial | não | não | explícito |
| `/prestacao-de-contas` | `src/app/prestacao-de-contas/page.tsx` | Server, consulta em build time | Sala do Avaliador | anexos públicos | JSON, impressão e ZIP quando existente | corrigido e explícito |
| `/prestacao-de-contas/imprimir` | `src/app/prestacao-de-contas/imprimir/page.tsx` | Server, consulta em build time | versão imprimível | anexos públicos | não | corrigido e explícito |
| `/anexos.json` | `src/app/anexos.json/route.ts` | Route Handler estático | contrato por máquina | anexos públicos | JSON | `total: 0`, `anexos: []` |
| `/imprensa` | `src/app/imprensa/page.tsx` | Server | rota editorial | não | não | explícito |
| `/acessibilidade` | `src/app/acessibilidade/page.tsx` | Server | rota editorial | não | não | explícito |
| `/privacidade` | `src/app/privacidade/page.tsx` | Server | rota editorial | não | não | explícito |
| `/contato` | `src/app/contato/page.tsx` | Server | rota editorial | não | não | explícito |
| `/dev/estilos` | `src/app/dev/estilos/page.tsx` | Server | referência visual interna | tokens CSS | controles de exemplo | não se aplica |

A rota inexistente usada pela suíte retornou `404` e ofereceu caminhos válidos para a Sala, Dados e Home. Não foram encontradas rotas documentadas centrais ausentes na fatia implementada.

## 4. Achados críticos

Nenhum.

## 5. Achados altos

Nenhum.

## 6. Achados médios

### MEDIO-01 — estado vazio da Sala omitia gates e item PENDENTE

O texto dizia que espelhar arquivos e publicar documentos bastaria para exibir a tabela. Isso omitia estado documental, privacidade, visibilidade pública e o fato de que o Caderno de Estudos continua `PENDENTE`. Não havia link falso ou vazamento, mas a redação da superfície central podia induzir uma leitura operacional incorreta.

**Situação:** corrigido. O estado vazio agora declara que zero anexos não significa prestação concluída, distingue o Caderno `PENDENTE` de anexo indisponível e condiciona a tabela aos gates documental, de privacidade e de publicação.

### MEDIO-02 — dez rotas editoriais compartilhavam o mesmo título

As dez páginas-stub usavam o título genérico da raiz. O conteúdo e o `h1` estavam corretos, mas tecnologias assistivas não recebiam um anúncio de rota suficientemente distinto nas transições.

**Situação:** corrigido. Cada rota recebeu metadata descritiva, sem conteúdo editorial adicional.

## 7. Achados baixos

### BAIXO-01 — referência de desenvolvimento acessível por URL pública

`/dev/estilos` responde `200` e contém “Link de exemplo” e “Botão de exemplo”. A página está fora da navegação e declara ser interna, não expõe dados privados e não interfere nas rotas centrais. Ainda assim, são dois elementos de demonstração alcançáveis por URL e o botão não executa ação funcional.

**Situação:** não corrigido. Remover, restringir ou manter a referência visual é decisão humana sobre o ambiente de produção. Não bloqueia o freeze pelos critérios desta auditoria.

## 8. Correções realizadas

1. Estado vazio da Sala e da versão imprimível alinhado ao gate canônico e ao Caderno `PENDENTE`.
2. Títulos únicos e descritivos para dez rotas editoriais.
3. Testes Playwright adicionados para estado vazio, ausência de ZIP, JSON vazio sem marcadores privados e títulos das rotas.

Foram corrigidas duas famílias de defeitos; os testes constituem a cobertura das correções.

## 9. Pendências humanas

- Decidir se `/dev/estilos` deve permanecer acessível em produção, ser restringida ou removida antes do freeze.
- O manual de marcas E02 e o bloco definitivo de créditos continuam pendentes conforme as fontes vigentes; não foram inventados.
- O Caderno de Estudos permanece `PENDENTE`. Nenhum arquivo, URL ou prazo novo foi criado.
- A01 permanece impedido; nenhum link de Figma foi apresentado como anexo disponível.

## 10. Privacidade

Nenhum vazamento encontrado. O HTML público e o JSON auditados não exibiram bucket ou chave privados, endpoint S3, credencial, caminho local, fonte canônica, entrevistas restritas, nomes pessoais não aprovados ou D01-08.

`/anexos.json` respondeu `200`, `application/json; charset=utf-8` e:

```json
{"total":0,"anexos":[]}
```

O campo temporal `gerado_em` foi omitido deste excerto por variar a cada execução. A rota não incluiu A04, D01-08 ou qualquer objeto privado.

## 11. Acessibilidade

- Landmarks de banner, navegação, conteúdo principal e rodapé presentes.
- Um `h1` por página auditada; hierarquia da Home e mapa coerente.
- Skip link aponta para `main#conteudo`.
- Menu mobile abre por Enter e Espaço, fecha por Escape, move foco para o painel e o devolve ao gatilho.
- Tab e Shift+Tab preservam ordem previsível.
- Mapa vira uma única parada de Tab, tem 75 opções nomeadas e alternativa textual completa.
- Foco, seleção e camadas do mapa não dependem somente de cor; movimento reduzido é respeitado.
- Os 33 testes axe/teclado existentes passaram antes das correções; os testes novos das correções também passaram isoladamente.

Único problema encontrado nesta dimensão foi o título duplicado das páginas-stub, já corrigido.

## 12. Responsividade

Home, Sala e versão imprimível foram verificadas em 375, 768, 1024 e 1440 px. Não houve overflow horizontal, clipping de conteúdo, sobreposição ou controle inacessível. O SVG preservou a proporção e permaneceu dentro do contêiner. A tabela não é renderizada no estado vazio; o componente mantém contêiner horizontal para quando houver linhas.

O menu mobile aparece em 375 px e cede lugar à navegação larga a partir de 768 px. O cabeçalho pode ocupar duas linhas em 768 px, sem colisão ou perda de item.

## 13. Estado vazio

- Sala: funcional com zero anexos, sem contagem falsa e sem link de ZIP.
- Impressão: funcional com o mesmo estado vazio.
- JSON: válido com total zero.
- Manifesto público: zero arquivos no estado confirmado.
- Rotas editoriais: ausência declarada, sem “Lorem ipsum”, número, parceiro ou indicador inventado.
- Home: informa que o acervo está em preparação e mantém a Sala como CTA principal.

## 14. Riscos para freeze de 14/09

- A decisão sobre `/dev/estilos` deve ser tomada antes da exposição definitiva, embora não seja bloqueadora.
- Quando o primeiro lote público for efetivamente autorizado, deve haver novo smoke test com o conjunto real das saídas Sala/JSON/ZIP; esta auditoria respeitou o estado de zero arquivos e não tocou R2 ou banco.
- E02 continua impedindo o bloco definitivo de marcas e créditos, conforme já documentado. A reserva textual atual é explícita e não usa marca inventada.
- A propagação DNS não foi verificada nem alterada nesta tarefa.

Não foi identificado bloqueador atual segundo os critérios definidos: não houve vazamento privado, rota central quebrada, erro generalizado, quebra mobile central, fato inventado, acessibilidade impeditiva ou gate público incorreto.

## 15. Conclusão

O site está funcional no estado pré-publicação com zero anexos públicos. Home, mapa, Sala, impressão e JSON funcionam sem banco ou storage; o Manifesto e o ZIP permanecem fail-closed; e D01-08 não alcança superfície pública. As duas inconsistências objetivas encontradas foram corrigidas e cobertas por testes. Resta uma decisão humana de baixa severidade sobre a rota interna de estilos, sem bloqueio atual para o freeze de 14/09.
