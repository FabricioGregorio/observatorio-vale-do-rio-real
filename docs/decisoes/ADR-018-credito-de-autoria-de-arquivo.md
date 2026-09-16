# ADR-018 - Crédito de autoria por objeto físico

## Status

Em análise

## Data

2026-09-16

## Contexto

A decisão humana de 2026-09-16 manteve públicas as duas fotografias de campo
com autoria de terceiro e tornou o crédito **obrigatório** em toda superfície
onde a fotografia apareça individualmente identificável:

| Original | Autor | Crédito exibido |
|---|---|---|
| `fotos/diretor-turismo-sao-cristovao/marcio-ramos-foto-por-dani-santos.jpg` | Dani Santos | `Foto: Dani Santos` |
| `fotos/fundacao-cultura-sao-cristovao/paola-rodrigues-foto-por-iago-de-andrade-santos.jpeg` | Iago de Andrade Santos | `Foto: Iago de Andrade Santos` |

O modelo documental não tem onde guardar isso. `documento.autoria` é `text[]`
da **obra**, e `B01` é um documento único com 59 fotografias: atribuir o
conjunto a um dos dois autores seria falso, e é exatamente o tipo de afirmação
que um site de prestação de contas não pode emitir. `arquivo` não tem coluna
de autoria; `origem_sistema` e `origem_url` descrevem de onde o binário veio,
não quem o fez.

O único texto por objeto físico que a arquitetura oferece hoje é
`documento_arquivo.rotulo`.

## Decisão

**Proposta, não aplicada.** Acrescentar a `arquivo` duas colunas, em migração
versionada nova:

- `credito_autoria text` — o nome do autor, sem prefixo de exibição;
- `credito_fonte text` — em que a atribuição se apoia.

Com o CHECK `arquivo_credito_coerente`:
`num_nonnulls(credito_autoria, credito_fonte) <> 1`. Autoria sem fonte é
afirmação sem lastro; fonte sem autoria não diz nada.

`vw_anexo_publico` passaria a expor as duas colunas, e
`separarCredito`/`montarRotulo` seriam removidos.

Alterar schema não é atribuição do agente (AGENTS.md, hierarquia de fontes de
verdade). Esta ADR devolve a decisão ao responsável.

## Solução provisória em uso

Enquanto isso, o crédito viaja **dentro** de `documento_arquivo.rotulo`, com
separador declarado em `src/dados/pesquisa/credito-fotografico.ts`:

```
B01 · diretor-turismo-sao-cristovao/marcio-ramos-foto-por-dani-santos.jpg — Foto: Dani Santos
```

`montarRotulo` compõe, `separarCredito` desfaz, e **nenhum outro lugar escreve
ou lê essa forma à mão**. A declaração de origem é única, em
`scripts/derivar-fotos-campo.py`, e se propaga ao manifesto de B01, ao lote de
publicação, ao banco e às quatro superfícies de exibição.

Isso funciona e está coberto por `testes/credito-fotografico.test.ts`, mas é
acordo de texto, não campo tipado: uma gravação feita fora de `montarRotulo`
pode quebrar a separação sem que o banco reclame.

## Alternativas consideradas

- **Tabela própria de créditos.** Rejeitada: o responsável pediu explicitamente
  para não criar estrutura paralela para duas imagens, e a relação é 1-1 com
  `arquivo`.
- **`documento.autoria` no B01.** Rejeitada: atribuiria as 59 fotografias a
  dois autores que fizeram uma cada.
- **Crédito só no manifesto fora do Git.** Rejeitada: o Acervo lê o banco, não
  o manifesto, e a atribuição desapareceria da interface.
- **Crédito embutido na imagem.** Rejeitada: o responsável pediu para não
  prejudicar a área principal da fotografia, e marca d'água é alteração do
  documento fotográfico.

## Consequências

Benefícios da coluna própria:

- atribuição consultável por SQL, sem parsing de string;
- `credito_fonte` registra que a atribuição se apoia no nome do arquivo — e
  não em EXIF, XMP ou IPTC, ausentes nos dois originais;
- o rótulo volta a ser só identidade do arquivo.

Custos:

- migração nova, com leitura à mão antes de aceitar (doc 03 §6);
- `vw_anexo_publico` recriada por `CREATE OR REPLACE VIEW` dentro da migração;
- `AnexoPublico`, `/anexos.json`, Sala e Acervo mudam de forma.

## Impacto técnico

Arquivos ou módulos afetados: `db/schema.ts`, nova migração `0009`,
`src/dados/consultas/anexos.ts`, `src/app/anexos.json/route.ts`,
`src/componentes/acervo/`, `src/dados/pesquisa/credito-fotografico.ts`
(removido), `src/dados/lote-publicacao.ts`,
`scripts/gravar-creditos-fotograficos.ts`.
