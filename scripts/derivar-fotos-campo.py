"""Derivados web das fotografias de campo (B01) e das fichas da Home.

Um script só, porque duas rotinas separadas divergiriam: os arquivos das
fichas em `public/media/pesquisa/` são exatamente os mesmos bytes dos
derivados que vão ao acervo público. A seleção das fichas é um recorte do
conjunto, nunca uma segunda codificação.

## O que entra

Todo arquivo de `OBSERVATORIO_FONTES_DIR/fotos/`. São 63 arquivos com 59
conteúdos distintos: quatro fotografias existem em duas pastas com os mesmos
bytes. A deduplicação é por SHA-256 do original, e o caminho canônico é o da
pasta de lugar quando ela existe — a pasta de lugar descreve onde a fotografia
foi feita, a pasta de pessoa descreve em qual visita.

## O que o derivado preserva e o que perde

Permitido, e é só isto: orientação EXIF aplicada, redimensionamento para no
máximo 1280 px de largura, conversão para WebP e remoção de metadados. Sem
recorte. Proibido, e o script não faz: acrescentar ou remover pessoas, alterar
cenário, aplicar filtro ou gerar pixel por IA.

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
from PIL import Image, ImageOps

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
    "centro-cultural-museu-borda-da-mata/frente-do-museu-borda-da-mata.heic": (
        "borda-frente-museu.webp",
        "Fachada do Museu Borda da Mata, com objetos expostos.",
    ),
    "centro-cultural-museu-borda-da-mata/geladeira-em-conversa-com-discos-e-cds-dentro.heic": (
        "borda-geladeira-discos.webp",
        "Geladeira reutilizada como acervo de discos e CDs no Borda da Mata.",
    ),
    "centro-cultural-museu-borda-da-mata/lhucas-concedendo-entrevista-a-pedro.heic": (
        "borda-entrevista-campo.webp",
        "Entrevista de campo dentro do Centro Cultural e Museu Borda da Mata.",
    ),
}

# Imagem principal de cada ficha, por decisão humana de 2026-09-16.
PRINCIPAIS = {
    "recanto-da-serra/recanto-da-serra.png",
    "centro-cultural-museu-borda-da-mata/frente-casa-de-taipa.heic",
}

TRANSFORMACAO = (
    "orientação aplicada; imagem integral sem crop; largura máxima de "
    f"{LARGURA_MAXIMA} px; conversão para WebP; metadados removidos"
)


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

        if origem.suffix.lower() == ".svg":
            saida = destino / f"{base}-v1.svg"
            saida.write_bytes(origem.read_bytes())
            largura = altura = None
            derivado = False
            transformacao = "nenhuma; vetor publicado integral"
        else:
            with Image.open(origem) as aberta:
                imagem = ImageOps.exif_transpose(aberta).convert("RGB")
                original["largura"], original["altura"] = imagem.size
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

    if len(itens) != 59:
        raise SystemExit(f"Esperados 59 conteúdos únicos; obtidos {len(itens)}.")
    if len(recorte) != len(FICHAS):
        raise SystemExit("Recorte das fichas não bateu com a seleção declarada.")

    (destino / "manifesto-b01.json").write_text(
        json.dumps(itens, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    Path("src/dados/pesquisa/lugares-derivados.json").write_text(
        json.dumps(recorte, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"{len(itens)} derivados em {destino}; {len(recorte)} arquivos de ficha.")


if __name__ == "__main__":
    principal()
