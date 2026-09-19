# ADR-021 — Política de distribuição do PodObservar

## Status

Aceita

## Data

2026-09-19

## Numeração

Esta decisão foi proposta como "ADR-020". Esse número já pertence à
ADR-020 — Curadoria fotográfica da Serra e capas, aceita anteriormente e já
versionada. Segue-se a regra do próximo número disponível: **021**.

## Contexto

O PodObservar é o podcast do Observatório de Cultura e Economia Criativa da
Região do Vale do Rio Real. A migração 0010 criou a fundação técnica prevista
em `docs/02-arquitetura-banco.md` §9: `temporada`, `episodio` e a view pública
`vw_episodio_publico`.

Aquele documento supõe que o site distribui o áudio. §9 afirma textualmente
que "o feed RSS 2.0 com namespace iTunes é gerado no build a partir dessas
tabelas — o site é o dono do feed, não a plataforma". A view da 0010 traduziu
isso literalmente: só expunha um episódio quando o áudio estivesse público,
espelhado e com URL, e entregava `audio_url`, `audio_mime_type` e
`audio_bytes` na projeção pública.

A equipe decidiu, depois disso, concentrar a reprodução dos episódios no
Spotify. O motivo é de audiência, não técnico: um player próprio no site
fragmenta as escutas entre o site e a plataforma, e a métrica que interessa
ao projeto é a da plataforma.

Isso não é um detalhe de interface. Um player próprio exige áudio publicamente
endereçável, e áudio publicamente endereçável exige um gate que a view já
implementava. A decisão editorial, portanto, muda o contrato do banco.

## Conflito normativo

Há conflito material com `docs/02-arquitetura-banco.md` §9 em três pontos:

| docs/02 §9 prevê | Decisão desta ADR |
|---|---|
| áudio publicamente distribuível pelo site | áudio permanece ativo interno |
| feed RSS próprio, gerado no build | RSS suspenso enquanto esta política valer |
| `<enclosure>` apontando para o objeto do site | nenhum enclosure é gerado |

A instrução humana é posterior e superior ao documento (`AGENTS.md`,
hierarquia de fontes de verdade, item 1). Esta ADR registra a exceção sem
reescrever `docs/02`, que permanece o documento normativo para tudo o mais —
inclusive para a estrutura das tabelas, que não muda.

## Distinção que sustenta a decisão

A decisão **não** é "o Observatório não deve possuir o áudio". É "o visitante
não deve receber o áudio pelo site".

O master canônico continua referenciado por `episodio.audio_id`, que continua
`NOT NULL`, para custódia, integridade, hash, extração de duração,
preservação e cadeia documental. Num site de prestação de contas isso não é
opcional: o áudio é evidência de execução do objeto. O que muda é que
`arquivo.visibilidade = 'publico'` deixa de ser condição para o episódio
existir publicamente.

## Decisão

1. O site não reproduz áudio do PodObservar.
2. O site não oferece download do episódio.
3. O site não expõe URL direta do arquivo de áudio.
4. O Spotify é o destino primário de escuta.
5. O YouTube é destino secundário opcional, quando houver URL oficial.
6. A transcrição revisada permanece pública, obrigatória para publicação e
   derivada do áudio final — nunca do roteiro de produção.
7. `episodio.audio_id` permanece como referência ao ativo canônico interno.
8. O master pode permanecer privado sem impedir a publicação do episódio.
9. O feed RSS próprio com enclosure fica **suspenso**, não cancelado: a
   estrutura de banco que o sustentaria não é removida.
10. Nenhum iframe ou embed de Spotify ou YouTube. Mesmo servido pela
    infraestrutura da plataforma, um embed é reprodução dentro do site, e
    ainda acrescentaria terceiro, cookie e peso — o que `AGENTS.md` proíbe.
11. Mudar esta política exige nova decisão humana registrada em ADR.

## Gate público resultante

Um episódio aparece em `vw_episodio_publico` somente quando:

```
status = 'publicado'
AND publicado_em IS NOT NULL
AND publicado_em <= now()
AND transcricao não vazia
AND url_spotify presente e não vazia
```

`url_spotify` **não** vira `NOT NULL` na tabela. Rascunho e episódio em
revisão existem antes de a publicação externa ocorrer, e o schema deve
conseguir representar esse estado legítimo. A obrigação pertence ao momento da
publicação, e o lugar dela é o gate — fail-closed, como em `vw_anexo_publico`.

A capa não entra no gate: `capa_id` é anulável em `docs/02` §9, e nenhum
documento normativo a exige para publicar.

## Consequências

**Banco.** A migração 0011 substitui `vw_episodio_publico`. A projeção pública
perde `audio_url`, `audio_mime_type` e `audio_bytes`, e a view deixa de
juntar `arquivo` pelo áudio — não há mais caminho, a partir da view, até o
master. `audio_id` nunca esteve exposto e continua fora.

**Interface, contrato para P0.3.**

- Home: CTA principal → *Ouvir no Spotify ↗*
- `/podobservar`: por episódio → título, data, duração, resumo, CTA Spotify,
  YouTube opcional, transcrição
- `/podobservar/t1/[episodio]`: metadata + transcrição + CTA externo

Proibidos: `<audio>`, iframe do Spotify, iframe do YouTube, SDK de qualquer
uma das duas, player próprio, link direto para WAV/MP3/M4A, botão "Baixar
episódio".

Permitidos: link externo comum, com indicação de saída do site.

**Descoberta.** Transcrição, título, resumo, duração e capa permanecem
indexáveis. A decisão reduz a escuta no site a zero, e não reduz em nada a
presença do PodObservar na busca.

**Storage.** Deixa de determinar publicação. Um episódio é publicável com o
master em bucket privado; o que o torna público é o estado editorial mais o
destino externo de escuta.

## Alternativas descartadas

**Embed do Spotify.** Resolveria a métrica — a escuta contaria para a
plataforma — mas mantém a reprodução dentro do site e adiciona terceiro e
cookie. Descartada pelo item 10.

**Manter `audio_url` na view e não usá-la no frontend.** Deixaria o master
publicamente endereçável e dependente de disciplina de quem escreve a
interface. O projeto já decidiu, na ADR-015, que o gate mora no banco.

**Reescrever `docs/02` §9.** Não é atribuição do agente, e os documentos de
arquitetura estão sob edição humana pendente. A ADR registra a exceção.

## Pendências que esta decisão cria

- `preview_observatorio` não tem `SELECT` em `vw_episodio_publico`. Sem
  superfície visual, não precisa; precisará em P0.3/homologação.
- Não existe tripwire de produção para o PodObservar equivalente ao
  `validarAcervoPublico` do Acervo. Um episódio retido pelo gate ou descartado
  pela validação Zod desaparece em silêncio. Avaliar em P0.3.
- A suspensão do RSS deve ser revisitada se a política mudar; nada no schema
  precisa ser recriado para isso.
