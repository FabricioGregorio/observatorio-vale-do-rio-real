"""Derivados web das marcas institucionais de fomento.

## O que entra

Cinco assinaturas oficiais de `OBSERVATORIO_FONTES_DIR/marcas/`, escolhidas pelos
manuais e não por conveniência:

- as assinaturas atuais da Política Nacional Aldir Blanc e do Ministério da
  Cultura/Governo do Brasil, extraídas da aplicação horizontal colorida da
  página 9 do `manual pnab.pdf`;
- a marca do Sistema Nacional de Cultura — SNC, extraída da mesma aplicação;
- `FUNCAP-HORIZONTAL.png` — versão colorida, horizontal;
- `SECRETARIA DE CULTURA + GOVERNO DE SERGIPE HORIZONTAL.png` — assinatura
  conjunta oficial, com tipologia, proporção e espaçamento já compostos.

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

    uv run --with pillow --with pypdfium2 python scripts/derivar-marcas-institucionais.py

Determinístico: mesmos originais produzem os mesmos bytes. O manifesto com
origem, hash do original, hash do derivado e transformação é gravado ao lado
dos arquivos, e `testes/marcas-institucionais.test.ts` o confere.
"""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

import pypdfium2 as pdfium
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
ALTURA_APOIO = 46

# A aplicação horizontal colorida oficial está na página 9 do manual PNAB.
# Os recortes usam pontos PDF e isolam exatamente as marcas atuais que não
# existem como arquivos avulsos no corpus. A rasterização transparente mantém
# a arte vetorial e remove apenas o fundo da página.
PAGINA_REGUA_PNAB = 9
ESCALA_RENDER_PDF = 6

MARCAS = [
    {
        "id": "mincultura-governo-federal",
        "origem": "manual pnab.pdf",
        "arquivo": "minc-governo-federal.webp",
        "entidade": "Ministério da Cultura · Governo do Brasil",
        "bloco": "realizacao",
        "medida": {"tipo": "largura", "valor": LARGURA_FEDERAL},
        "pagina": PAGINA_REGUA_PNAB,
        "recorte": {
            "esquerda": 1255,
            "inferior": 600,
            "direita": 200,
            "superior": 350,
        },
        "regra": (
            "Manual PNAB Sergipe, página 9, e Manual do Governo Federal v1.2, "
            "páginas 4–6 e 13–15: assinatura atual Ministério da Cultura/"
            "Governo do Brasil em RGB; redução máxima em meios eletrônicos de "
            "200 px; última à direita na assinatura horizontal."
        ),
    },
    {
        "id": "pnab",
        "origem": "manual pnab.pdf",
        "arquivo": "pnab.webp",
        "entidade": "Política Nacional Aldir Blanc",
        "bloco": "realizacao",
        "medida": {"tipo": "largura", "valor": 150},
        "pagina": PAGINA_REGUA_PNAB,
        "recorte": {
            "esquerda": 955,
            "inferior": 625,
            "direita": 680,
            "superior": 315,
        },
        "regra": (
            "Manual de uso da marca PNAB Sergipe, página 9: a marca oficial "
            "Aldir Blanc fica ao lado da assinatura Ministério da Cultura/"
            "Governo do Brasil, separada por um traço, e não ultrapassa a "
            "altura nem a largura da marca federal."
        ),
    },
    {
        "id": "snc",
        "origem": "manual pnab.pdf",
        "arquivo": "sistema-nacional-de-cultura.webp",
        "entidade": "Sistema Nacional de Cultura",
        "bloco": "realizacao",
        "medida": {"tipo": "altura", "valor": 52},
        "pagina": PAGINA_REGUA_PNAB,
        "recorte": {
            "esquerda": 765,
            "inferior": 595,
            "direita": 995,
            "superior": 360,
        },
        "regra": (
            "Manual de uso da marca PNAB Sergipe, página 9: o Sistema "
            "Nacional de Cultura abre o bloco de Realização na aplicação "
            "horizontal colorida de uso preferencial."
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
        "id": "secretaria-sergipe",
        "origem": "SECRETARIA DE CULTURA + GOVERNO DE SERGIPE HORIZONTAL.png",
        "arquivo": "secretaria-especial-governo-sergipe.webp",
        "entidade": "Secretaria Especial da Cultura · Governo do Estado de Sergipe",
        "bloco": "apoio",
        "medida": {"tipo": "largura", "valor": 210},
        "regra": (
            "Manual de uso Governo de Sergipe, páginas 14–16: assinatura "
            "conjunta horizontal preferencial, com nome da Secretaria em "
            "caixa alta, proporção e espaçamento oficiais preservados."
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
        pagina = marca.get("pagina")
        recorte = marca.get("recorte")
        if pagina is None:
            imagem = Image.open(origem).convert("RGBA")
            largura_original, altura_original = imagem.size
            transformacao_inicial = (
                "moldura transparente removida pela caixa delimitadora do alfa"
            )
        else:
            if not isinstance(recorte, dict):
                raise SystemExit(f"{marca['id']}: recorte do manual ausente.")
            documento = pdfium.PdfDocument(origem)
            folha = documento[int(pagina) - 1]
            largura_original, altura_original = map(round, folha.get_size())
            imagem = folha.render(
                scale=ESCALA_RENDER_PDF,
                crop=(
                    recorte["esquerda"],
                    recorte["inferior"],
                    recorte["direita"],
                    recorte["superior"],
                ),
                fill_color=(255, 255, 255, 0),
                rev_byteorder=True,
            ).to_pil()
            transformacao_inicial = (
                f"marca vetorial extraída da página {pagina} do manual PNAB, "
                "no recorte oficial registrado em pontos PDF; fundo da página "
                "mantido transparente; caixa delimitadora do alfa aplicada"
            )

        # A caixa delimitadora do alfa remove a moldura transparente vazia do
        # arquivo ou do recorte da página. A arte não é tocada.
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
                    "largura": largura_original,
                    "altura": altura_original,
                    "larguraDaArte": largura_arte,
                    "alturaDaArte": altura_arte,
                    "bytes": origem.stat().st_size,
                    "sha256": sha256(origem),
                    **(
                        {
                            "pagina": pagina,
                            "recorte": {
                                **recorte,
                                "unidade": "ponto_pdf",
                            },
                        }
                        if pagina is not None
                        else {}
                    ),
                },
                "transformacao": (
                    f"{transformacao_inicial}; redimensionamento proporcional "
                    f"para {ESCALA}x da "
                    "medida de exibição; conversão para WebP sem perda; cores, "
                    "proporção e transparência preservadas"
                ),
            }
        )
        print(f"{saida} — {largura_css}x{altura_css} css, {saida.stat().st_size} B")

    MANIFESTO.write_text(
        json.dumps(itens, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"{MANIFESTO} — {len(itens)} marcas")


if __name__ == "__main__":
    principal()
