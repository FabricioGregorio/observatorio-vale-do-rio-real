# Dados territoriais — origem, camadas e estado

Pasta preparada na Tarefa 10B.1 e consolidada na 10B.2.1. **Nenhum arquivo de
dado foi criado ou baixado.** O que existe aqui é contrato (`tipos.ts`),
recorte editorial (`recorte.ts`) e procedência (`fontes.ts`).

## Modelo de camadas

O mapa trabalha com camadas conceituais separadas.

**Camada base** — os **75 municípios de Sergipe**, todos com fronteira oficial
e todos como objetos individuais. Não pode faltar município.

**Camadas de vínculo** — `relacoesTerritoriais` em cada município:

| Relação | Significado |
|---|---|
| `vale-rio-real` | pertence ao recorte territorial usado pelo projeto |
| `pesquisa-campo` | foi objeto de pesquisa de campo |
| `comparacao` | referência de comparação de políticas públicas |

São relações **independentes**. Um município pode estar no recorte sem ter sido
visitado, e pode ser estudado sem pertencer ao recorte. Foi por isso que o
booleano `pesquisado` saiu do contrato na 10B.2.1: ele forçava as duas coisas a
serem a mesma, e a primeira consequência prática seria pintar São Cristóvão
como se fosse Vale do Rio Real.

### Vale do Rio Real

Região **socioeconômica** associada ao curso superior e médio do rio Real —
não é divisão administrativa oficial. O projeto não cria divisão geográfica
nova: destaca os municípios do recorte que utiliza.

Definição do responsável, 2026-09-03: Tobias Barreto, Tomar do Geru,
Itabaianinha, Cristinápolis e Poço Verde.

### São Cristóvão

Entra como município de **referência e comparação de políticas públicas**, não
como município do Vale. Um teste em `testes/territorio.test.ts` falha se essa
distinção for desfeita.

### Pesquisa de campo

Consolidada em 2026-09-03 (10B.2.2), a partir das entrevistas registradas:
**Tobias Barreto**, **Tomar do Geru** e **São Cristóvão**.

A relação só é atribuída **com evidência documental**, guardada em
`evidenciasDePesquisa` no mesmo registro. Um teste garante que relação e
evidência andam juntas — não é possível afirmar que um município foi pesquisado
sem declarar por quê.

Itabaianinha, Cristinápolis e Poço Verde pertencem ao recorte e não carregam a
relação: não há evidência entre as fornecidas. Ausência de evidência fica
registrada como ausência, não preenchida por simetria com os vizinhos.

## Arquivos esperados

| Arquivo | Conteúdo | Estado |
|---|---|---|
| `municipios-sergipe.geojson` | Os 75 municípios, fronteira oficial | não obtido |
| `municipios-sergipe-nomes.json` | Código e nome dos 75 | não obtido |
| `sergipe.geojson` | Contorno externo do estado (opcional) | não obtido |
| `pontos-visita.json` | Pontos de visita de campo | não obtido |

## Fonte oficial

**IBGE — API de malhas territoriais v4** e **API de localidades v1**.
Verificadas em 2026-09-03 por requisição de leitura, sem gravar nada no
repositório.

```
GET .../api/v4/malhas/estados/28
      ?formato=application/vnd.geo+json&qualidade=intermediaria&intrarregiao=municipio
→ 200, FeatureCollection com 75 features, properties { "codarea": "<código>" }

GET .../api/v1/localidades/estados/SE/municipios
→ 200, ~32,6 kB, 75 itens com id, nome, microrregiao e regiao-imediata
```

A malha **não traz o nome** do município, só o código. Sem o arquivo de nomes,
a camada base não tem como rotular município nenhum.

### Qualidade da malha: intermediária

Medido na mesma data, para a malha por município:

| Qualidade | Bytes | Com gzip |
|---|---|---|
| `minima` | 34.077 | — |
| `intermediaria` | 92.720 | **20.039** |
| `maxima` | 432.106 | — |

Intermediária é a escolha do responsável (10B.2.1): equilíbrio entre precisão
do contorno, tamanho e carregamento em celular. Os ~20 kB que efetivamente
trafegam cabem com folga no orçamento de 500 kB da Home — o que
importa para o público rural e escolar em rede fraca.

## Regras desta pasta

- **Nenhum polígono desenhado à mão, nenhuma geometria derivada ou
  aproximada.** Contorno de município é dado oficial ou não é nada.
- **Nenhuma imagem de mapa pronta.** A malha é dado, não figura.
- **Todo arquivo de dado precisa de procedência completa** em `fontes.ts`:
  `origem`, `obtidoEm`, `licenca` e `sha256`. Um teste falha se aparecer
  arquivo sem isso — a mesma disciplina que a Prestação de Contas aplica aos
  anexos.
- **Nenhum dado de exemplo, nem temporário.** Num site de prestação de contas,
  GeoJSON de exemplo não é protótipo: é dado falso.
- **Código do IBGE é identificador técnico.** Casa o município com o feature
  certo da malha. Não é indicador, não é métrica, não mede nada.

## O que ainda falta

1. **Licença/termos oficiais precisam ser confirmados antes da
   disponibilização pública dos dados.** A API de malhas não publica termos; a
   página de dados abertos do IBGE respondeu HTTP 403 e um dos domínios de
   acesso à informação não resolveu. O que está em `fontes.ts` é o que se pôde
   verificar, mais a atribuição — não uma licença assumida. A definição de
   pronto exige licença declarada.
2. **Município de Serra dos Macacos e de Ilha Grande.** Nenhum documento lido os
   associa a um município, e deduzir por nome ou proximidade seria inventar
   localização. Recanto da Serra e Museu Borda da Mata já estão em Tobias
   Barreto.
3. **Apresentação dos pontos sem município** no mapa: a lista territorial é
   organizada por município, então hoje esses dois não apareceriam nela.
4. **Coordenadas dos pontos**, que dependem de conferência em campo ou de
   documento do projeto. Nunca de estimativa sobre mapa.
5. **Vocabulário de `tipo`** dos pontos: ecoparque, museu, comunidade e rota.

## Validação de entrada

O contrato do projeto exige validar entrada externa com Zod, e um `.geojson`
lido do disco é entrada externa. `zod` **não está instalado**, e nenhuma etapa
até aqui autorizou dependência nova. A validação precisa entrar junto com o
primeiro arquivo de dado — sem ela, um arquivo truncado ou com geometria
inesperada quebra a renderização em silêncio.
