"""Derivados web das fotografias de campo (B01) e das fichas da Home.

Um script só, porque duas rotinas separadas divergiriam: os arquivos das
fichas em `public/media/pesquisa/` são exatamente os mesmos bytes dos
derivados que vão ao acervo público. A seleção das fichas é um recorte do
conjunto, nunca uma segunda codificação.

## O que entra

Todo arquivo de `OBSERVATORIO_FONTES_DIR/fotos/`. São 61 arquivos com 58
conteúdos distintos: três fotografias existem em duas pastas com os mesmos
bytes. A deduplicação é por SHA-256 do original, e o caminho canônico é o da
pasta de lugar quando ela existe — a pasta de lugar descreve onde a fotografia
foi feita, a pasta de pessoa descreve em qual visita.

A árvore `fotos/` é a seleção editorial vigente, por decisão de 2026-09-18:
o que está lá é o que pode ser publicado, e fotografia retirada de lá sai do
Acervo. Quem declara o conjunto é `corpus-b01-autorizado.json`, por hash.

## O que o derivado preserva e o que perde

Permitido, e é só isto: orientação EXIF aplicada, tarja de privacidade quando
declarada, redimensionamento para no máximo 1280 px de largura, conversão para
WebP e remoção de metadados. Sem recorte. Proibido, e o script não faz:
acrescentar ou remover pessoas, alterar cenário, aplicar filtro ou gerar pixel
por IA.

O SVG da Bodega dos Tropeiros é ilustração vetorial, não fotografia: ele passa
inteiro, sem recodificação, porque converter vetor em WebP destruiria o que ele
é. O manifesto registra `derivado = false` para ele.

## Reprodutibilidade

Depende de Pillow e pillow-heif, que não estão no Python do sistema. Executar:

    uv run --with pillow --with pillow-heif python scripts/derivar-fotos-campo.py

Determinístico: mesmos originais produzem os mesmos bytes.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import unicodedata
from pathlib import Path

import pillow_heif
from PIL import Image, ImageDraw, ImageOps

pillow_heif.register_heif_opener()

LARGURA_MAXIMA = 1280
QUALIDADE = 78
METODO = 6

# Pastas que nomeiam um lugar; vencem a pasta de pessoa na deduplicação.
PASTAS_DE_LUGAR = (
    "recanto-da-serra",
    "centro-cultural-museu-borda-da-mata",
    "ilha-grande",
    "serra-dos-macacos",
)

# Pasta -> lugar de campo, quando a pasta corresponde a um lugar da pesquisa.
#
# Duas colunas, porque são duas coisas diferentes. `id` é a identidade do lugar
# — a mesma de `IDS_DOS_LUGARES` em `src/dados/territorio/referencias.ts` — e é
# por ela que a ficha territorial encontra suas fotografias. `rotulo` é texto de
# exibição e pode ser reescrito sem quebrar vínculo nenhum.
#
# A correspondência é declarada, nunca inferida: `centro-cultural-museu-borda-
# da-mata` vira `borda-da-mata` porque esta tabela diz. O espelho em TypeScript
# é `LUGAR_DA_PASTA_DO_CORPUS`, e um teste confere que os dois concordam.
LUGAR_DA_PASTA = {
    "recanto-da-serra": {"id": "recanto-da-serra", "rotulo": "Recanto da Serra"},
    "centro-cultural-museu-borda-da-mata": {
        "id": "borda-da-mata",
        "rotulo": "Borda da Mata",
    },
    "ilha-grande": {"id": "ilha-grande", "rotulo": "Ilha Grande"},
    "serra-dos-macacos": {
        "id": "serra-dos-macacos",
        "rotulo": "Serra dos Macacos",
    },
}

# Fotografias de autoria de terceiro. A decisão humana de 2026-09-16 manteve
# as duas públicas e tornou o crédito obrigatório.
#
# A autoria foi conferida em 2026-09-16: **a única fonte documental é o nome do
# arquivo**. Nenhum dos dois originais traz EXIF `Artist`, `Copyright` ou
# `XPAuthor`, XMP `dc:creator` ou by-line IPTC. A auditoria de 2026-09-05
# (`docs/auditorias/AUDITORIA_FONTES_2026-09-05.md` §"Crédito de terceiro
# embutido no nome do arquivo") já registrava os mesmos dois nomes, com a
# grafia `Dani-Santos` preservada. Não existe forma mais completa a preservar.
CREDITO_DE_TERCEIRO = {
    "diretor-turismo-sao-cristovao/marcio-ramos-foto-por-dani-santos.jpg": {
        "autor": "Dani Santos",
        "fonte": "nome do arquivo original; sem EXIF, XMP ou IPTC de autoria",
    },
    "fundacao-cultura-sao-cristovao/paola-rodrigues-foto-por-iago-de-andrade-santos.jpeg": {
        "autor": "Iago de Andrade Santos",
        "fonte": "nome do arquivo original; sem EXIF, XMP ou IPTC de autoria",
    },
}

# Recorte das fichas da Home: original -> (nome publicado, alt).
# O alt é texto humano de acessibilidade, obrigatório para imagem renderizada.
FICHAS = {
    "recanto-da-serra/estufa.jpg": (
        "recanto-estufa.webp",
        "Estufa e mudas do Recanto da Serra.",
    ),
    "recanto-da-serra/momento-da-entrevista-com-pedro-menezes.jpg": (
        "recanto-entrevista-pedro-menezes.webp",
        "Entrevista de campo realizada sob uma árvore no Recanto da Serra.",
    ),
    "recanto-da-serra/museu-dona-maria.jpg": (
        "recanto-museu-dona-maria.webp",
        "Entrada do Museu Dona Maria, no Recanto da Serra.",
    ),
    "recanto-da-serra/por dentro da budega.jpg": (
        "recanto-interior-bodega.webp",
        "Interior da Bodega dos Tropeiros, com objetos e painel expositivo.",
    ),
    "recanto-da-serra/recanto-da-serra.png": (
        "recanto-da-serra.webp",
        "Placa do Recanto da Serra junto à área ajardinada.",
    ),
    "recanto-da-serra/volte-sempre.jpg": (
        "recanto-volte-sempre.webp",
        "Visitantes passam sob a placa Volte Sempre no Recanto da Serra.",
    ),
    "centro-cultural-museu-borda-da-mata/conversa-com-oviedo-dentro-da-casa-de-taipa.heic": (
        "borda-conversa-casa-de-taipa.webp",
        "Conversa de campo dentro da casa de taipa do Borda da Mata.",
    ),
    "centro-cultural-museu-borda-da-mata/conversa-com-oviedo-e-neide-abreu.heic": (
        "borda-conversa-oviedo-neide.webp",
        "Equipe em conversa com Oviêdo e Neide Abreu no Borda da Mata.",
    ),
    "centro-cultural-museu-borda-da-mata/espaco-do-historiador.heic": (
        "borda-espaco-historiador.webp",
        "Espaço do historiador no Centro Cultural e Museu Borda da Mata.",
    ),
    "centro-cultural-museu-borda-da-mata/frente-casa-de-taipa.heic": (
        "borda-frente-casa-de-taipa.webp",
        "Fachada da casa de taipa do Centro Cultural e Museu Borda da Mata.",
    ),
    "centro-cultural-museu-borda-da-mata/geladeira-em-conversa-com-discos-e-cds-dentro.heic": (
        "borda-geladeira-discos.webp",
        "Geladeira reutilizada como acervo de discos e CDs no Borda da Mata.",
    ),
    "centro-cultural-museu-borda-da-mata/lhucas-concedendo-entrevista-a-pedro.heic": (
        "borda-entrevista-campo.webp",
        "Entrevista de campo dentro do Centro Cultural e Museu Borda da Mata.",
    ),
    # Serra dos Macacos: as oito do conjunto, todas publicadas no Acervo em
    # 2026-09-18 sob o ADR-020. O nome da ponte é o que a Home já servia —
    # mesmos bytes, mesmo endereço.
    "serra-dos-macacos/atravessando-a-ponte.jpg": (
        "serra-dos-macacos-atravessando-a-ponte.webp",
        "Carro vermelho atravessa uma ponte de madeira ladeada por estacas amarelas, com um morro coberto de mata ao fundo, visto de dentro de outro veículo.",
    ),
    "serra-dos-macacos/cafe-na-casa-de-um-dos-moradores.jpg": (
        "serra-dos-macacos-mesa-compartilhada.webp",
        "Mesa posta com cuscuz, macaxeira cozida, pães e uma panela, com pessoas sentadas ao redor.",
    ),
    "serra-dos-macacos/dentro-da-igreja-do-mata-7.jpg": (
        "serra-dos-macacos-interior-da-igreja.webp",
        "Altar circular diante de uma parede rosa, com cruzes enfeitadas de fitas, flores, velas acesas e um arco de flores pintadas acima.",
    ),
    "serra-dos-macacos/igreja-do-mata-7.jpg": (
        "serra-dos-macacos-pequena-igreja-branca.webp",
        "Pequena igreja de paredes brancas, com cruzes pintadas na fachada, porta aberta e uma cruz no alto.",
    ),
    "serra-dos-macacos/igreja-serra-dos-macacos.jpg": (
        "serra-dos-macacos-igreja.webp",
        "Igreja branca com torre e cruz, porta sob arco e janelas vazadas, em terreno de chão batido.",
    ),
    "serra-dos-macacos/principal-capa.jpg": (
        "serra-dos-macacos-paisagem.webp",
        "Pessoas caminham em fila por um pasto de capim alto, com árvores, um poste e uma casa ao fundo.",
    ),
    "serra-dos-macacos/serra-na-serra-dos-macacos.jpg": (
        "serra-dos-macacos-caminho-entre-os-morros.webp",
        "Trilha por um pasto verde, com árvores isoladas e um morro coberto de mata ao fundo, sob céu nublado.",
    ),
    "serra-dos-macacos/serras-da-serra-dos-macacos.jpg": (
        "serra-dos-macacos-serras-e-nuvens.webp",
        "Morros cobertos de mata e roçados no vale, com capim alto e arbustos em primeiro plano, sob céu com nuvens.",
    ),
    # Ilha Grande: as oito do conjunto publicado. Substituem, nas superfícies
    # públicas, os três derivados da H3, feitos de originais que o
    # responsável retirou ou trocou em 2026-09-18.
    "ilha-grande/arvores-preservadas.png": (
        "ilha-grande-area-arborizada.webp",
        "Árvores e vegetação junto a uma cerca, sob céu azul com nuvens.",
    ),
    "ilha-grande/cais-ou-pier-ilha-grande.jpg": (
        "ilha-grande-pier.webp",
        "Píer de tábuas vermelhas com guarda-corpo branco avança sobre o rio, com mata na margem oposta.",
    ),
    "ilha-grande/campo-verde-de-grama-e-arvores.jpg": (
        "ilha-grande-campo-gramado.webp",
        "Capim alto com flores alaranjadas sob árvores frondosas.",
    ),
    "ilha-grande/dona-mada.jpg": (
        "ilha-grande-pessoa-a-porta.webp",
        "Mulher de cabelos brancos e roupa azul fala e gesticula junto à porta de uma casa.",
    ),
    "ilha-grande/forno-a-lenha.jpg": (
        "ilha-grande-forno-a-lenha.webp",
        "Forno circular de tijolo e barro com fogo aceso e massa sobre a chapa, numa área coberta.",
    ),
    "ilha-grande/forno-a-lenha2.jpg": (
        "ilha-grande-preparo-junto-ao-forno.webp",
        "Porções de massa sobre a chapa de um forno a lenha, com uma bacia e um cesto de alimentos ao lado.",
    ),
    "ilha-grande/igrejinha.jpg": (
        "ilha-grande-pequena-igreja.webp",
        "Fachada branca e azul de uma pequena igreja, com a inscrição 1933 e uma cruz no alto.",
    ),
    "ilha-grande/principal-capa.jpg": (
        "ilha-grande-margem.webp",
        "O povoado visto do rio, a partir de uma embarcação: casas, coqueiros, um píer com quiosque e uma pequena igreja na margem.",
    ),
}

# Data de cada fotografia de ficha, quando há fonte que a sustente.
#
# Duas procedências, e nenhuma é estimativa:
#
# - **declarada**: Ilha Grande, 11/04/2026, por decisão do responsável em
#   2026-09-21. Os originais dessa pasta não trazem EXIF de data.
# - **EXIF confirmado por visita documentada**: a data de captura gravada no
#   original só vale quando coincide com uma visita registrada no doc 02 §6.4
#   ("02/08 (III, Serra dos Macacos)" e "II Visita à Serra dos Macacos em
#   05/04/2026"). Uma fonte sozinha não basta; as duas juntas bastam.
#
# Pasta fora das duas tabelas fica sem data, e a interface não a inventa.
DATA_DECLARADA_POR_PASTA = {
    "ilha-grande": (
        "2026-04-11",
        "declarada pelo responsável em 2026-09-21",
    ),
}
VISITAS_DOCUMENTADAS = {
    "serra-dos-macacos": frozenset({"2025-08-02", "2026-04-05"}),
}

EXIF_DATA_ORIGINAL = 36867  # DateTimeOriginal, no IFD Exif
IFD_EXIF = 0x8769


def data_da_fotografia(
    imagem: Image.Image, pasta: str
) -> tuple[str | None, str | None]:
    """Data ISO e procedência, ou ``(None, None)`` quando nada a sustenta."""
    declarada = DATA_DECLARADA_POR_PASTA.get(pasta)
    if declarada:
        return declarada
    visitas = VISITAS_DOCUMENTADAS.get(pasta)
    if not visitas:
        return (None, None)
    bruta = imagem.getexif().get_ifd(IFD_EXIF).get(EXIF_DATA_ORIGINAL)
    if not bruta:
        return (None, None)
    iso = str(bruta)[:10].replace(":", "-")
    if iso not in visitas:
        raise SystemExit(
            f"fotos/{pasta}: EXIF {bruta} não coincide com visita documentada. "
            "Nada foi gravado."
        )
    return (iso, "EXIF do original, coincidente com visita registrada no doc 02 §6.4")

# Imagem principal de cada ficha, por decisão humana. Capa é a abertura da
# ficha territorial: não é o `principal` de um documento no Acervo, que é
# preferência de link (ADR-016), nem a primeira posição de um array.
#
# As duas últimas vêm do ADR-020, de 2026-09-17. Passaram a valer em
# 2026-09-21, quando os originais de Serra dos Macacos e Ilha Grande entraram
# em FICHAS — os mesmos bytes publicados no Acervo no lote de 2026-09-18.
#
# O nome do arquivo não decide nada: o corpus usa `principal-capa` em duas
# pastas e `capa-principal` numa terceira. Quem identifica é o sha256, e ele
# está no ADR.
PRINCIPAIS = {
    "recanto-da-serra/recanto-da-serra.png",
    "centro-cultural-museu-borda-da-mata/frente-casa-de-taipa.heic",
    "serra-dos-macacos/principal-capa.jpg",
    "ilha-grande/principal-capa.jpg",
}

TRANSFORMACAO = (
    "orientação aplicada; imagem integral sem crop; largura máxima de "
    f"{LARGURA_MAXIMA} px; conversão para WebP; metadados removidos"
)

# Originais que só podem ser publicados com tarja de privacidade.
#
# Declarado à parte de `TARJAS` de propósito: assim apagar as coordenadas por
# acidente quebra a derivação em vez de publicar o que devia estar coberto.
# Um `dict.get` que devolve `None` seria silencioso; esta lista não é.
#
# Decisão humana de 2026-09-17 (ADR-020): a placa do veículo em
# `atravessando-a-ponte.jpg` fica ilegível **no derivado**, e o original nunca
# é modificado.
EXIGEM_TARJA = frozenset(
    {
        "serra-dos-macacos/atravessando-a-ponte.jpg",
    }
)

# Retângulos opacos, em coordenadas do original **já orientado**, aplicados
# antes do redimensionamento — o que torna a tarja parte do pixel e não uma
# camada removível. Opaco, e não desfoque ou pixelização: as duas últimas
# preservam informação e já foram revertidas em casos públicos.
#
# São duas regiões, não uma. A auditoria de 2026-09-18 encontrou o mesmo
# emplacamento **refletido no capô do carro de onde a foto foi feita**, na
# parte inferior do quadro, e parcialmente legível. Cobrir só a placa do
# veículo à frente deixaria uma cópia espelhada recuperável.
TARJAS: dict[str, tuple[tuple[int, int, int, int], ...]] = {
    "serra-dos-macacos/atravessando-a-ponte.jpg": (
        (1495, 2305, 1670, 2385),
        (1500, 3250, 1710, 3375),
    ),
}

COR_DA_TARJA = (0, 0, 0)


def normalizar(texto: str) -> str:
    sem_acento = "".join(
        c
        for c in unicodedata.normalize("NFD", texto)
        if unicodedata.category(c) != "Mn"
    )
    bruto = re.sub(r"[^a-z0-9]+", "-", sem_acento.lower())
    return bruto.strip("-")


def sha256(caminho: Path) -> str:
    return hashlib.sha256(caminho.read_bytes()).hexdigest()


def aplicar_tarjas(
    imagem: Image.Image, relativo: str
) -> tuple[tuple[int, int, int, int], ...]:
    """Pinta as tarjas declaradas para este original e devolve as que aplicou.

    Falha fechada em três frentes, porque tarja que não cobre é pior que tarja
    nenhuma — ela dá a impressão de que o assunto foi tratado:

    - original em ``EXIGEM_TARJA`` sem retângulo declarado interrompe tudo;
    - retângulo fora dos limites da imagem interrompe tudo, em vez de pintar
      no vazio: é o sintoma de coordenada medida noutra orientação;
    - retângulo degenerado, com largura ou altura nula, também interrompe.

    A tarja é pintada no original já orientado e **antes** do
    redimensionamento, de modo que o pixel coberto não existe no derivado.
    """
    tarjas = TARJAS.get(relativo, ())
    if relativo in EXIGEM_TARJA and not tarjas:
        raise SystemExit(
            f"{relativo} exige tarja de privacidade e nenhuma foi declarada.\n"
            "    Nada foi gravado. Declare o retângulo em TARJAS."
        )
    if not tarjas:
        return ()

    largura, altura = imagem.size
    pincel = ImageDraw.Draw(imagem)
    for x0, y0, x1, y1 in tarjas:
        if x1 <= x0 or y1 <= y0:
            raise SystemExit(
                f"{relativo}: tarja degenerada {(x0, y0, x1, y1)}. "
                "Nada foi gravado."
            )
        if not (0 <= x0 < x1 <= largura and 0 <= y0 < y1 <= altura):
            raise SystemExit(
                f"{relativo}: tarja {(x0, y0, x1, y1)} cai fora de "
                f"{largura}x{altura}. Coordenada é do original já orientado. "
                "Nada foi gravado."
            )
        pincel.rectangle((x0, y0, x1 - 1, y1 - 1), fill=COR_DA_TARJA)
    return tarjas


def prioridade(relativo: str) -> tuple[int, str]:
    pasta = relativo.split("/", 1)[0]
    return (0 if pasta in PASTAS_DE_LUGAR else 1, relativo)


def canonicos(raiz_fotos: Path) -> list[tuple[str, list[str]]]:
    """Um caminho canônico por conteúdo, com as duplicatas byte a byte anexadas."""
    por_hash: dict[str, list[str]] = {}
    for arquivo in sorted(raiz_fotos.rglob("*")):
        if arquivo.is_file():
            relativo = arquivo.relative_to(raiz_fotos).as_posix()
            por_hash.setdefault(sha256(arquivo), []).append(relativo)
    escolhidos = []
    for caminhos in por_hash.values():
        ordenados = sorted(caminhos, key=prioridade)
        escolhidos.append((ordenados[0], ordenados[1:]))
    return sorted(escolhidos, key=lambda par: prioridade(par[0]))


CORPUS_AUTORIZADO = Path("src/dados/pesquisa/corpus-b01-autorizado.json")


def conferir_corpus(itens: list[dict]) -> None:
    """Compara o corpus encontrado com o conjunto declarado, por conteúdo.

    No lugar de ``len(itens) != 59``. O número dizia pouco e protegia menos do
    que parecia: trocar um original por outro mantinha a contagem, e o script
    regravaria manifesto e derivados sem uma palavra. Também quebrava em toda
    mudança legítima do corpus, e a única saída óbvia era aumentar o número —
    o que dissolve o gate em vez de responder a ele.

    A declaração é uma lista de ``{arquivo, sha256}`` versionada no repositório,
    no mesmo espírito de ``ORIGINAIS`` em ``derivar-pesquisa-campo.ts``: o
    pipeline só deriva o que alguém declarou, e a divergência aparece **com
    nome**, não como um número que não bate.

    Ampliar o corpus é acrescentar entradas à declaração — um ato explícito,
    revisável no diff, que é exatamente o que se quer de uma autorização.
    """
    declarado = {
        item["sha256"]: item["arquivo"]
        for item in json.loads(CORPUS_AUTORIZADO.read_text(encoding="utf-8"))
    }
    encontrado = {item["original"]["sha256"]: item["original"]["arquivo"] for item in itens}

    ausentes = [declarado[h] for h in declarado.keys() - encontrado.keys()]
    intrusos = [encontrado[h] for h in encontrado.keys() - declarado.keys()]
    if ausentes or intrusos:
        linhas = [f"Corpus divergente de {CORPUS_AUTORIZADO}."]
        if ausentes:
            linhas.append(f"  declarados e ausentes do corpus ({len(ausentes)}):")
            linhas += [f"    - {a}" for a in sorted(ausentes)]
        if intrusos:
            linhas.append(f"  presentes e não declarados ({len(intrusos)}):")
            linhas += [f"    + {a}" for a in sorted(intrusos)]
        linhas.append("  Nada foi gravado. Declare o conjunto autorizado ou restaure o corpus.")
        raise SystemExit("\n".join(linhas))

    # Mesmo conteúdo sob outro caminho também é divergência: a procedência é o
    # par arquivo+hash, e só o hash coincidir não basta.
    renomeados = [
        f"{declarado[h]} -> {encontrado[h]}" for h in declarado if declarado[h] != encontrado[h]
    ]
    if renomeados:
        raise SystemExit(
            "Conteúdo autorizado mudou de caminho; declare o novo:\n"
            + "\n".join(f"    ~ {r}" for r in sorted(renomeados))
        )


def principal() -> None:
    raiz = Path(os.environ["OBSERVATORIO_FONTES_DIR"])
    raiz_fotos = raiz / "fotos"
    destino = raiz / "derivados-publicos" / "B01"
    fichas = Path("public/media/pesquisa")
    destino.mkdir(parents=True, exist_ok=True)
    fichas.mkdir(parents=True, exist_ok=True)

    itens: list[dict] = []
    recorte: list[dict] = []

    for relativo, duplicatas in canonicos(raiz_fotos):
        origem = raiz_fotos / relativo
        pasta, nome = relativo.split("/", 1)
        base = f"b01-{normalizar(pasta)}-{normalizar(Path(nome).stem)}"
        original: dict = {
            "arquivo": f"fotos/{relativo}",
            "largura": None,
            "altura": None,
            "bytes": origem.stat().st_size,
            "sha256": sha256(origem),
            "duplicatas_byte_a_byte": [f"fotos/{d}" for d in duplicatas],
        }

        data = fonte_da_data = None
        if origem.suffix.lower() == ".svg":
            saida = destino / f"{base}-v1.svg"
            saida.write_bytes(origem.read_bytes())
            largura = altura = None
            derivado = False
            transformacao = "nenhuma; vetor publicado integral"
        else:
            with Image.open(origem) as aberta:
                data, fonte_da_data = (
                    data_da_fotografia(aberta, pasta)
                    if relativo in FICHAS
                    else (None, None)
                )
                imagem = ImageOps.exif_transpose(aberta).convert("RGB")
                original["largura"], original["altura"] = imagem.size
                tarjas = aplicar_tarjas(imagem, relativo)
                if imagem.width > LARGURA_MAXIMA:
                    nova = round(imagem.height * LARGURA_MAXIMA / imagem.width)
                    imagem = imagem.resize(
                        (LARGURA_MAXIMA, nova), Image.Resampling.LANCZOS
                    )
                saida = destino / f"{base}-v1.webp"
                imagem.save(saida, "WEBP", quality=QUALIDADE, method=METODO)
                largura, altura = imagem.size
            derivado = True
            transformacao = TRANSFORMACAO
            if tarjas:
                original["tarjas_aplicadas"] = [list(r) for r in tarjas]
                transformacao = (
                    f"{len(tarjas)} tarja(s) opaca(s) de privacidade aplicada(s) "
                    f"antes do redimensionamento; {TRANSFORMACAO}"
                )

        credito = CREDITO_DE_TERCEIRO.get(relativo)
        item = {
            "arquivo": saida.name,
            "largura": largura,
            "altura": altura,
            "bytes": saida.stat().st_size,
            "sha256": sha256(saida),
            "lugar": (LUGAR_DA_PASTA.get(pasta) or {}).get("id"),
            "rotulo_do_lugar": (LUGAR_DA_PASTA.get(pasta) or {}).get("rotulo"),
            # Autoria de terceiro: `autor` é o nome, `credito` é a forma exata
            # de exibição, e `fonte` diz em que se apoia a atribuição.
            "autor": credito["autor"] if credito else None,
            "credito": f"Foto: {credito['autor']}" if credito else None,
            "fonte_do_credito": credito["fonte"] if credito else None,
            "derivado": derivado,
            "original": original,
            "transformacao": transformacao,
        }
        itens.append(item)

        ficha = FICHAS.get(relativo)
        if ficha:
            publicado, alt = ficha
            (fichas / publicado).write_bytes(saida.read_bytes())
            recorte.append(
                {
                    "arquivo": publicado,
                    "largura": largura,
                    "altura": altura,
                    "bytes": item["bytes"],
                    "sha256": item["sha256"],
                    "alt": alt,
                    # `local` é rótulo de exibição; `lugar` é a identidade
                    # de que a ficha territorial depende.
                    "local": LUGAR_DA_PASTA[pasta]["rotulo"],
                    "lugar": LUGAR_DA_PASTA[pasta]["id"],
                    # Viaja junto com a foto: a Home não pode perder a
                    # atribuição que o Acervo conhece.
                    "autor": item["autor"],
                    "credito": item["credito"],
                    "principal": relativo in PRINCIPAIS,
                    # ISO 8601 ou null; a procedência viaja junto e nunca é
                    # exibida — o visitante vê a data, não como ela foi obtida.
                    "data": data,
                    "fonte_da_data": fonte_da_data,
                    "acervo": saida.name,
                    "original": {
                        "arquivo": original["arquivo"],
                        "largura": original["largura"],
                        "altura": original["altura"],
                        "bytes": original["bytes"],
                        "sha256": original["sha256"],
                    },
                    "transformacao": transformacao,
                }
            )

    conferir_corpus(itens)
    if len(recorte) != len(FICHAS):
        raise SystemExit("Recorte das fichas não bateu com a seleção declarada.")

    # `newline="\n"` explícito: sem ele, o Python no Windows grava CRLF, o
    # `.gitattributes` normaliza para LF no commit e o working tree fica
    # divergente do índice — que é a origem dos avisos de fim de linha no lint.
    (destino / "manifesto-b01.json").write_text(
        json.dumps(itens, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    Path("src/dados/pesquisa/lugares-derivados.json").write_text(
        json.dumps(recorte, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"{len(itens)} derivados em {destino}; {len(recorte)} arquivos de ficha.")


if __name__ == "__main__":
    principal()
