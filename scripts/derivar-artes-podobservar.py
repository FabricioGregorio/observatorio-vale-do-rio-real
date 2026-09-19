"""Deriva as artes oficiais do PodObservar sem alterar os originais.

Os quatro originais são identificados por caminho e SHA-256. A saída WebP
quadrada preserva a composição integral, limita o lado a 1200 px e não leva
EXIF, XMP ou ICC. O logo também é copiado para ``public/``; capas de episódio
são servidas pelo storage público e chegam à interface por ``capa_id``.
"""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

from PIL import Image, ImageOps


LADO = 1200
QUALIDADE = 84
METODO = 6

ARTES = (
    {
        "id": "logo",
        "papel": "logo",
        "origem": "podcast/PodObservar Logo.jpg",
        "sha256_original": "da90f55bf3970ffb989878259335032369838b6cf35c0bbe4e8b2072879867f6",
        "arquivo": "podobservar-logo-1200.webp",
        "chave_privada": "originais/podobservar/podobservar-logo.jpg",
        "chave_publica": "arquivos/podobservar/artes/podobservar-logo-v1.webp",
        "slug_episodio": None,
    },
    {
        "id": "ep01",
        "papel": "capa_episodio",
        "origem": "podcast/ep-01/Capa - EP 1.jpg",
        "sha256_original": "5251f72f54102a8985d6df3acdbe34ce68ea7d2fdb1179ff9140f122d3033c2c",
        "arquivo": "podobservar-ep01-1200.webp",
        "chave_privada": "originais/podobservar/t1-ep-01-capa.jpg",
        "chave_publica": "arquivos/podobservar/artes/t1-ep-01-capa-v1.webp",
        "slug_episodio": "01-o-que-e-o-vale-do-rio-real",
    },
    {
        "id": "ep02",
        "papel": "capa_episodio",
        "origem": "podcast/ep-02/Capa - EP 1 (2).jpg",
        "sha256_original": "017270453a2d330e536369b41469971aea6b38fd0af932302ed7aa8392b280b8",
        "arquivo": "podobservar-ep02-1200.webp",
        "chave_privada": "originais/podobservar/t1-ep-02-capa.jpg",
        "chave_publica": "arquivos/podobservar/artes/t1-ep-02-capa-v1.webp",
        "slug_episodio": "02-conheca-o-recanto-da-serra",
    },
    {
        "id": "ep03",
        "papel": "capa_episodio",
        "origem": "podcast/ep-03/capa-ep-03.jpg",
        "sha256_original": "13a85a6b2a7fef265767b5cca6bbd3c6e0c711996187535653f33ff4e8621bab",
        "arquivo": "podobservar-ep03-1200.webp",
        "chave_privada": "originais/podobservar/t1-ep-03-capa.jpg",
        "chave_publica": "arquivos/podobservar/artes/t1-ep-03-capa-v1.webp",
        "slug_episodio": "03-conheca-o-museu-borda-da-mata",
    },
)


def sha256(caminho: Path) -> str:
    return hashlib.sha256(caminho.read_bytes()).hexdigest()


def principal() -> None:
    raiz = Path(os.environ["OBSERVATORIO_FONTES_DIR"])
    destino = raiz / "derivados-publicos" / "podobservar"
    destino_publico = Path("public/media/podobservar")
    destino.mkdir(parents=True, exist_ok=True)
    destino_publico.mkdir(parents=True, exist_ok=True)

    manifesto = []
    for declarada in ARTES:
        origem = raiz / declarada["origem"]
        hash_original = sha256(origem)
        if hash_original != declarada["sha256_original"]:
            raise SystemExit(f"Original divergente: {declarada['origem']}")

        with Image.open(origem) as aberta:
            imagem = ImageOps.exif_transpose(aberta).convert("RGB")
            dimensoes_originais = imagem.size
            imagem.thumbnail((LADO, LADO), Image.Resampling.LANCZOS)
            saida = destino / declarada["arquivo"]
            imagem.save(saida, "WEBP", quality=QUALIDADE, method=METODO)
            dimensoes_derivadas = imagem.size

        if declarada["papel"] == "logo":
            (destino_publico / declarada["arquivo"]).write_bytes(saida.read_bytes())

        manifesto.append(
            {
                **declarada,
                "original": {
                    "largura": dimensoes_originais[0],
                    "altura": dimensoes_originais[1],
                    "bytes": origem.stat().st_size,
                    "sha256": hash_original,
                    "alpha": False,
                    "formato": "JPEG",
                },
                "derivado": {
                    "largura": dimensoes_derivadas[0],
                    "altura": dimensoes_derivadas[1],
                    "bytes": saida.stat().st_size,
                    "sha256": sha256(saida),
                    "mime_type": "image/webp",
                    "metadados_removidos": ["EXIF", "XMP", "ICC"],
                    "transformacao": (
                        "orientação EXIF aplicada; RGB; redimensionamento Lanczos "
                        "para 1200x1200; WebP quality=84 method=6; metadados removidos"
                    ),
                },
            }
        )

    Path("src/dados/podobservar-artes.json").write_text(
        json.dumps(manifesto, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"{len(manifesto)} artes derivadas em {destino}")


if __name__ == "__main__":
    principal()
