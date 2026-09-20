"""Derivados web das marcas institucionais de fomento.

## O que entra

Quatro arquivos de `OBSERVATORIO_FONTES_DIR/marcas/`, escolhidos pelos manuais
oficiais e não por conveniência:

- `MINISTERIO DA CULTURA + GOVERNO FEDERAL SEM FUNDO HORIZONTAL.png` — a
  versão completa e original em cores sólidas. O manual do Governo Federal
  (v1.2) determina que ela seja usada em **todas as peças exceto impressas**,
  e uma página web não é peça impressa;
- `PNAB3.png` — a variante cuja paleta bate exatamente com a do manual da PNAB
  Sergipe (#FFCF00, #183EFF, #FF0000, #00CF00) e cuja assinatura é azul. A
  variante de assinatura amarela seria ilegível sobre branco, e PNAB1/PNAB2
  usam cores que não estão na paleta do manual;
- `FUNCAP-HORIZONTAL.png` — versão colorida, horizontal;
- `GOVERNO DE SERGIPE HORIZONTAL SEM FUNDO.png` — brasão azul sobre
  transparência, que é a versão positiva do manual do Governo de Sergipe.

Os 23 arquivos da pasta são todos 8000x4500 px com transparência e a arte
centrada numa moldura vazia. Servir um deles numa faixa de rodapé seria
transferir ~300 kB para exibir 260 px.

## O que o derivado preserva, e o que ele não faz

Preserva: proporção exata da arte, cores originais pixel a pixel, canal alfa.

Não faz, e os manuais proíbem: recortar a arte, alterar cor, rotacionar,
distorcer, aplicar contorno, moldura, glow ou marca-d'água, recompor
elementos, fabricar versão branca por filtro. O recorte pela caixa delimitadora
do canal alfa **não é crop da marca**: remove só a moldura transparente vazia
do arquivo de origem, e é o que torna a proporção declarada igual à proporção
da arte.

## As medidas, e de onde elas vêm

O manual do Governo Federal fixa **200 px de largura como redução máxima em
meios eletrônicos** para a marca do Governo Federal, e o manual da PNAB Sergipe
determina que nenhuma marca do bloco ultrapasse a altura e a largura total da
marca nominativa do Governo Federal.

Daí as larguras de exibição: a federal em 260 px — acima do mínimo, com folga —
e as demais dimensionadas por altura, sempre abaixo da altura e da largura
dela. Os arquivos são gerados em 2x para telas de densidade dupla.

## Reprodutibilidade

    uv run --with pillow python scripts/derivar-marcas-institucionais.py

Determinístico: mesmos originais produzem os mesmos bytes. O manifesto com
origem, hash do original, hash do derivado e transformação é gravado ao lado
dos arquivos, e `testes/marcas-institucionais.test.ts` o confere.
"""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

from PIL import Image

# WebP sem perda: a arte é de cor chapada, e uma compressão com perda
# introduziria franja em volta das formas — alteração de cor, que o manual
# proíbe. Sem perda, estes arquivos ficam menores que o JPEG equivalente.
SEM_PERDA = True
METODO = 6

DESTINO = Path("public/media/marcas")
MANIFESTO = Path("src/dados/institucional/marcas-derivadas.json")

# Densidade dupla: o arquivo sai em 2x e é exibido em 1x.
ESCALA = 2

# Largura de exibição da marca federal, em CSS px. O manual fixa 200 px como
# redução máxima em meios eletrônicos; 260 dá folga sem esmagar o bloco.
LARGURA_FEDERAL = 260

# Altura de exibição das demais, em CSS px. Nenhuma ultrapassa a altura nem a
# largura da federal, que é a regra do manual da PNAB.
ALTURA_REALIZACAO = 56
ALTURA_APOIO = 46

MARCAS = [
    {
        "id": "mincultura-governo-federal",
        "origem": "MINISTERIO DA CULTURA + GOVERNO FEDERAL SEM FUNDO HORIZONTAL.png",
        "arquivo": "minc-governo-federal.webp",
        "entidade": "Ministério da Cultura · Governo Federal",
        "bloco": "realizacao",
        "medida": {"tipo": "largura", "valor": LARGURA_FEDERAL},
        "regra": (
            "Manual de uso da marca do Governo Federal v1.2: versão completa e "
            "original em cores sólidas para peças não impressas; redução máxima "
            "em meios eletrônicos de 200 px; última à direita na assinatura "
            "horizontal."
        ),
    },
    {
        "id": "pnab",
        "origem": "PNAB3.png",
        "arquivo": "pnab.webp",
        "entidade": "Política Nacional Aldir Blanc",
        "bloco": "realizacao",
        "medida": {"tipo": "altura", "valor": ALTURA_REALIZACAO},
        "regra": (
            "Manual de uso da marca PNAB Sergipe: a marca fica ao lado da "
            "assinatura Ministério da Cultura/Governo Federal, separada por um "
            "traço, e não ultrapassa a altura nem a largura da marca federal."
        ),
    },
    {
        "id": "funcap",
        "origem": "FUNCAP-HORIZONTAL.png",
        "arquivo": "funcap.webp",
        "entidade": "Fundação de Cultura e Arte Aperipê de Sergipe",
        "bloco": "apoio",
        "medida": {"tipo": "altura", "valor": ALTURA_APOIO},
        "regra": (
            "Manual de uso da marca PNAB Sergipe: a FUNCAP integra o bloco de "
            "apoio e não ultrapassa a altura nem a largura da marca federal."
        ),
    },
    {
        "id": "governo-sergipe",
        "origem": "GOVERNO DE SERGIPE HORIZONTAL SEM FUNDO.png",
        "arquivo": "governo-de-sergipe.webp",
        "entidade": "Governo do Estado de Sergipe",
        "bloco": "apoio",
        "medida": {"tipo": "altura", "valor": ALTURA_APOIO},
        "regra": (
            "Manual de uso Governo de Sergipe: versão positiva do brasão, sem "
            "alteração de cor, diagramação ou proporção, com área de segurança "
            "preservada e nunca sobre fundo que comprometa a legibilidade."
        ),
    },
]


def sha256(caminho: Path) -> str:
    return hashlib.sha256(caminho.read_bytes()).hexdigest()


def principal() -> None:
    raiz = Path(os.environ["OBSERVATORIO_FONTES_DIR"]) / "marcas"
    DESTINO.mkdir(parents=True, exist_ok=True)
    MANIFESTO.parent.mkdir(parents=True, exist_ok=True)

    itens = []
    for marca in MARCAS:
        origem = raiz / str(marca["origem"])
        imagem = Image.open(origem).convert("RGBA")

        # A caixa delimitadora do alfa remove a moldura transparente vazia do
        # arquivo de origem. A arte não é tocada.
        caixa = imagem.getchannel("A").getbbox()
        if caixa is None:
            raise SystemExit(f"{origem.name}: arquivo sem conteúdo opaco.")
        arte = imagem.crop(caixa)
        largura_arte, altura_arte = arte.size

        medida = marca["medida"]
        if medida["tipo"] == "largura":
            largura_css = int(medida["valor"])
            altura_css = round(largura_css * altura_arte / largura_arte)
        else:
            altura_css = int(medida["valor"])
            largura_css = round(altura_css * largura_arte / altura_arte)

        saida = DESTINO / str(marca["arquivo"])
        redimensionada = arte.resize(
            (largura_css * ESCALA, altura_css * ESCALA), Image.LANCZOS
        )
        redimensionada.save(saida, "WEBP", lossless=SEM_PERDA, method=METODO)

        itens.append(
            {
                "id": marca["id"],
                "entidade": marca["entidade"],
                "bloco": marca["bloco"],
                "arquivo": str(marca["arquivo"]),
                "largura": largura_css,
                "altura": altura_css,
                "escala": ESCALA,
                "bytes": saida.stat().st_size,
                "sha256": sha256(saida),
                "regra": marca["regra"],
                "original": {
                    "arquivo": f"marcas/{marca['origem']}",
                    "largura": imagem.size[0],
                    "altura": imagem.size[1],
                    "larguraDaArte": largura_arte,
                    "alturaDaArte": altura_arte,
                    "bytes": origem.stat().st_size,
                    "sha256": sha256(origem),
                },
                "transformacao": (
                    "moldura transparente removida pela caixa delimitadora do "
                    f"alfa; redimensionamento proporcional para {ESCALA}x da "
                    "medida de exibição; conversão para WebP sem perda; cores, "
                    "proporção e transparência preservadas"
                ),
            }
        )
        print(f"{saida} — {largura_css}x{altura_css} css, {saida.stat().st_size} B")

    MANIFESTO.write_text(
        json.dumps(itens, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"{MANIFESTO} — {len(itens)} marcas")


if __name__ == "__main__":
    principal()
