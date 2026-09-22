#!/usr/bin/env python3
"""Deriva o CSV do inventário a partir de `inventario-de-anexos.xlsx`.

O XLSX é a **fonte canônica versionada**. Este CSV é **artefato derivado**:
pode ser apagado, é regenerável, não deve ser editado à mão e não substitui o
XLSX.

Elimina a exportação manual, que era o ponto onde o fluxo podia divergir:
editar o XLSX, esquecer de exportar, e carregar o banco com a versão antiga.

Só stdlib: `zipfile`, `xml.etree.ElementTree`, `csv`, `hashlib`. Nenhuma
dependência, nenhum OCR, nenhum Excel ou LibreOffice.

Uso:
    python scripts/derivar-inventario.py
    python scripts/derivar-inventario.py --verificar   # não escreve; só valida
    python scripts/derivar-inventario.py --stdout      # CSV atual em memória
"""

from __future__ import annotations

import csv
import hashlib
import io
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "inventario-de-anexos.xlsx"
DESTINO = RAIZ / "inventario-de-anexos.csv"
SIDECAR = RAIZ / "inventario-de-anexos.csv.origem"

ABA = "Inventário"

# Contrato do inventário. Coluna ausente ou desconhecida é erro: o schema da
# planilha é parte do contrato, e mudança silenciosa nele quebraria a carga.
COLUNAS = [
    "ID",
    "Categoria",
    "Item",
    "Tipo (enum)",
    "Exigido pelo edital",
    "Status",
    "Fonte atual",
    "Link atual",
    "Slug proposto",
    "Responsável",
    "Prazo",
    "Espelhado",
    "URL permanente",
    "SHA-256",
    "Observações",
    "Natureza",
]

NATUREZAS = {"item_exigido", "evidencia_complementar", "item_nao_exigido"}
ESPERADO = {"item_exigido": 28, "evidencia_complementar": 3, "item_nao_exigido": 2}
LINHAS_ESPERADAS = 33


class ErroDerivacao(RuntimeError):
    """Falha de contrato do inventário. Nunca degrada em saída parcial."""


def _indice_coluna(ref: str) -> int:
    """`C12` → 2. Coluna em letras para índice zero-based."""
    letras = "".join(c for c in ref if c.isalpha())
    n = 0
    for c in letras:
        n = n * 26 + (ord(c.upper()) - 64)
    return n - 1


def _strings_compartilhadas(z: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in z.namelist():
        return []
    raiz = ET.fromstring(z.read("xl/sharedStrings.xml"))
    return [
        "".join(t.text or "" for t in si.iter(f"{M}t"))
        for si in raiz.findall("m:si", NS)
    ]


def _caminho_da_aba(z: zipfile.ZipFile, nome: str) -> str:
    """Resolve a aba **pelo nome**, não pelo índice.

    A ordem das abas pode mudar no editor sem aviso; o nome é o contrato.
    O `r:id` da aba aponta para o rels do workbook, que dá o arquivo real.
    """
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rid = None
    for aba in wb.find("m:sheets", NS):
        if aba.get("name") == nome:
            rid = aba.get(
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
            )
            break
    if rid is None:
        nomes = [a.get("name") for a in wb.find("m:sheets", NS)]
        raise ErroDerivacao(f"Aba {nome!r} não existe. Abas: {nomes}")

    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    for rel in rels:
        if rel.get("Id") == rid:
            alvo = rel.get("Target")
            # Relação relativa (`worksheets/sheet1.xml`) e relação absoluta
            # (`/xl/worksheets/sheet1.xml`) são válidas no pacote OOXML.
            # Normalizar antes de prefixar evita formar `xl/xl/...`.
            normalizado = alvo.lstrip("/")
            return normalizado if normalizado.startswith("xl/") else f"xl/{normalizado}"
    raise ErroDerivacao(f"Relacionamento {rid!r} da aba {nome!r} não encontrado.")


def ler_aba(caminho_xlsx: Path, nome_aba: str) -> list[list[str]]:
    """Devolve a aba como matriz de strings, já resolvendo sharedStrings."""
    with zipfile.ZipFile(caminho_xlsx) as z:
        compartilhadas = _strings_compartilhadas(z)
        folha = ET.fromstring(z.read(_caminho_da_aba(z, nome_aba)))

    linhas: list[list[str]] = []
    for row in folha.iter(f"{M}row"):
        celulas: dict[int, str] = {}
        for c in row.findall("m:c", NS):
            i = _indice_coluna(c.get("r", "A1"))
            v = c.find("m:v", NS)
            inline = c.find("m:is", NS)
            if c.get("t") == "s" and v is not None:
                indice = int(v.text or "0")
                if indice >= len(compartilhadas):
                    raise ErroDerivacao(
                        f"Célula {c.get('r')} aponta para string {indice}, "
                        f"fora da tabela de {len(compartilhadas)}."
                    )
                celulas[i] = compartilhadas[indice]
            elif inline is not None:
                celulas[i] = "".join(t.text or "" for t in inline.iter(f"{M}t"))
            elif v is not None:
                celulas[i] = v.text or ""
            else:
                celulas[i] = ""
        if not celulas:
            continue
        largura = max(celulas) + 1
        linhas.append([celulas.get(i, "").strip() for i in range(largura)])

    # normaliza a largura pelo cabeçalho
    largura = len(linhas[0]) if linhas else 0
    for l in linhas:
        if len(l) < largura:
            l.extend([""] * (largura - len(l)))
        del l[largura:]
    return linhas


def validar(linhas: list[list[str]]) -> dict[str, int]:
    """Valida o contrato. Qualquer divergência levanta ErroDerivacao."""
    if not linhas:
        raise ErroDerivacao("Aba vazia.")

    cabecalho = linhas[0]
    faltando = [c for c in COLUNAS if c not in cabecalho]
    if faltando:
        raise ErroDerivacao(f"Colunas obrigatórias ausentes: {faltando}")
    desconhecidas = [c for c in cabecalho if c and c not in COLUNAS]
    if desconhecidas:
        raise ErroDerivacao(
            f"Colunas desconhecidas no inventário: {desconhecidas}. "
            "O schema da planilha é contrato — atualize COLUNAS de propósito."
        )

    dados = linhas[1:]
    if len(dados) != LINHAS_ESPERADAS:
        raise ErroDerivacao(
            f"Esperava {LINHAS_ESPERADAS} itens, encontrei {len(dados)}."
        )

    i_id = cabecalho.index("ID")
    i_exig = cabecalho.index("Exigido pelo edital")
    i_nat = cabecalho.index("Natureza")

    vistos: dict[str, int] = {}
    contagem = dict.fromkeys(ESPERADO, 0)

    for n, linha in enumerate(dados, start=2):
        codigo = linha[i_id]
        if not codigo:
            raise ErroDerivacao(f"Linha {n} sem ID.")
        if codigo in vistos:
            raise ErroDerivacao(
                f"ID duplicado {codigo!r}: linhas {vistos[codigo]} e {n}."
            )
        vistos[codigo] = n

        natureza = linha[i_nat]
        if natureza not in NATUREZAS:
            raise ErroDerivacao(
                f"{codigo}: Natureza {natureza!r} fora do vocabulário {sorted(NATUREZAS)}."
            )
        contagem[natureza] += 1

        exigido = linha[i_exig]
        if exigido not in {"Sim", "Não"}:
            raise ErroDerivacao(
                f"{codigo}: 'Exigido pelo edital' com {exigido!r}; use Sim ou Não."
            )
        if (natureza == "item_exigido") != (exigido == "Sim"):
            raise ErroDerivacao(
                f"{codigo}: Natureza ({natureza}) contradiz "
                f"'Exigido pelo edital' ({exigido})."
            )

    for natureza, esperado in ESPERADO.items():
        if contagem[natureza] != esperado:
            raise ErroDerivacao(
                f"Esperava {esperado} itens de natureza {natureza}, "
                f"encontrei {contagem[natureza]}."
            )

    return contagem


def escrever_csv(linhas: list[list[str]], destino: Path) -> None:
    """CSV determinístico: UTF-8, `\\n`, ordem e conteúdo iguais aos da aba."""
    with destino.open("w", encoding="utf-8", newline="") as f:
        escritor = csv.writer(f, lineterminator="\n")
        escritor.writerows(linhas)


def sha256_do_arquivo(caminho: Path) -> str:
    h = hashlib.sha256()
    with caminho.open("rb") as f:
        for bloco in iter(lambda: f.read(1024 * 1024), b""):
            h.update(bloco)
    return h.hexdigest()


def principal(argv: list[str]) -> int:
    apenas_verificar = "--verificar" in argv

    if not ORIGEM.exists():
        print(f"[derivar] fonte canônica ausente: {ORIGEM}", file=sys.stderr)
        return 1

    try:
        linhas = ler_aba(ORIGEM, ABA)
        contagem = validar(linhas)
    except ErroDerivacao as e:
        print(f"[derivar] contrato do inventário violado: {e}", file=sys.stderr)
        return 1

    if "--stdout" in argv:
        # Consumo direto pelo executor: sem CSV/sidecar persistido ou stale.
        memoria = io.StringIO(newline="")
        csv.writer(memoria, lineterminator="\n").writerows(linhas)
        sys.stdout.buffer.write(memoria.getvalue().encode("utf-8"))
        return 0

    origem_sha = sha256_do_arquivo(ORIGEM)
    print(f"[derivar] fonte:   {ORIGEM.name}")
    print(f"[derivar] sha256:  {origem_sha}")
    print(f"[derivar] itens:   {len(linhas) - 1}")
    print(f"[derivar] colunas: {len(linhas[0])}")
    for natureza in ("item_exigido", "evidencia_complementar", "item_nao_exigido"):
        print(f"[derivar]   {natureza}: {contagem[natureza]}")

    if apenas_verificar:
        if not DESTINO.exists():
            print("[derivar] --verificar: CSV derivado não existe.", file=sys.stderr)
            return 1
        registrado = SIDECAR.read_text(encoding="utf-8").strip() if SIDECAR.exists() else ""
        if registrado != origem_sha:
            print(
                "[derivar] --verificar: CSV está DESATUALIZADO em relação ao XLSX.\n"
                f"           registrado: {registrado or '(nenhum)'}\n"
                f"           atual:      {origem_sha}\n"
                "           rode `python scripts/derivar-inventario.py`.",
                file=sys.stderr,
            )
            return 1
        print("[derivar] --verificar: CSV corresponde ao XLSX atual.")
        return 0

    escrever_csv(linhas, DESTINO)
    SIDECAR.write_text(f"{origem_sha}\n", encoding="utf-8")
    print(f"[derivar] escrito:  {DESTINO.name} ({DESTINO.stat().st_size} bytes)")
    print(f"[derivar] sidecar:  {SIDECAR.name}")
    print("[derivar] o CSV é artefato derivado: não editar à mão.")
    return 0


if __name__ == "__main__":
    sys.exit(principal(sys.argv[1:]))
