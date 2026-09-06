import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import {
  conferirDerivacao,
  explicarDerivacao,
} from "../src/lib/inventario-derivado";

/**
 * Derivação do inventário: XLSX é fonte canônica, CSV é artefato derivado.
 *
 * A parte que exercita a derivação de verdade depende de Python 3, que existe
 * na máquina de manutenção mas **não é garantido no CI** — o workflow não usa
 * `setup-python`. Por isso ela é `skipIf`, no mesmo padrão dos testes de
 * integração de banco: o skip aparece na saída do Vitest, então a ausência de
 * cobertura fica visível em vez de silenciosa.
 *
 * A guarda contra CSV desatualizado é testada sempre, sem Python.
 */

function temPython(): boolean {
  try {
    execFileSync("python", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const PYTHON = temPython();

function derivar(args: string[] = []): string {
  return execFileSync("python", ["scripts/derivar-inventario.py", ...args], {
    encoding: "utf8",
  });
}

describe("guarda contra CSV desatualizado", () => {
  test("fonte ausente é reportada, não ignorada", async () => {
    const estado = await conferirDerivacao(
      "nao-existe.xlsx",
      "nao-existe.origem",
    );
    expect(estado.situacao).toBe("sem_fonte");
    expect(explicarDerivacao(estado)).toContain("Fonte canônica ausente");
  });

  test("sidecar ausente não passa por atual", async () => {
    const dir = await mkdtemp(join(tmpdir(), "deriv-"));
    try {
      const xlsx = join(dir, "fonte.xlsx");
      await writeFile(xlsx, "conteudo qualquer");
      const estado = await conferirDerivacao(xlsx, join(dir, "sem-sidecar"));
      expect(estado.situacao).toBe("sem_sidecar");
      expect(explicarDerivacao(estado)).toContain("derivar-inventario.py");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("sidecar com hash divergente é denunciado", async () => {
    const dir = await mkdtemp(join(tmpdir(), "deriv-"));
    try {
      const xlsx = join(dir, "fonte.xlsx");
      const sidecar = join(dir, "fonte.csv.origem");
      await writeFile(xlsx, "versao nova");
      await writeFile(sidecar, `${"0".repeat(64)}\n`);
      const estado = await conferirDerivacao(xlsx, sidecar);
      expect(estado.situacao).toBe("desatualizado");
      expect(explicarDerivacao(estado)).toContain("DESATUALIZADO");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("sidecar com o hash correto é aceito", async () => {
    const dir = await mkdtemp(join(tmpdir(), "deriv-"));
    try {
      const xlsx = join(dir, "fonte.xlsx");
      const sidecar = join(dir, "fonte.csv.origem");
      const conteudo = "versao coerente";
      await writeFile(xlsx, conteudo);
      const sha = createHash("sha256").update(conteudo).digest("hex");
      await writeFile(sidecar, `${sha}\n`);
      const estado = await conferirDerivacao(xlsx, sidecar);
      expect(estado.situacao).toBe("atual");
      if (estado.situacao === "atual") expect(estado.sha256).toBe(sha);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe.skipIf(!PYTHON)("derivação real do XLSX (requer Python 3)", () => {
  function lerCsvSimples(texto: string): string[][] {
    // O derivador só cita campo com vírgula, aspas ou quebra de linha.
    const linhas: string[][] = [];
    let campo = "";
    let linha: string[] = [];
    let dentro = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (dentro) {
        if (c === '"' && texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else if (c === '"') dentro = false;
        else campo += c;
      } else if (c === '"') dentro = true;
      else if (c === ",") {
        linha.push(campo);
        campo = "";
      } else if (c === "\n") {
        linha.push(campo);
        linhas.push(linha);
        linha = [];
        campo = "";
      } else campo += c;
    }
    if (campo || linha.length) {
      linha.push(campo);
      linhas.push(linha);
    }
    return linhas;
  }

  async function csv(): Promise<string[][]> {
    derivar();
    return lerCsvSimples(await readFile("inventario-de-anexos.csv", "utf8"));
  }

  test("produz 33 itens e 16 colunas", async () => {
    const linhas = await csv();
    expect(linhas).toHaveLength(34); // cabeçalho + 33
    for (const l of linhas) expect(l).toHaveLength(16);
  });

  test("cabeçalho preservado, com Natureza ao fim", async () => {
    const [cabecalho] = await csv();
    expect(cabecalho?.[0]).toBe("ID");
    expect(cabecalho?.[4]).toBe("Exigido pelo edital");
    expect(cabecalho?.at(-1)).toBe("Natureza");
  });

  test("28 item_exigido, 3 evidencia_complementar, 2 item_nao_exigido", async () => {
    const [cabecalho, ...dados] = await csv();
    const iNat = cabecalho?.indexOf("Natureza") ?? -1;
    const conta = (v: string) => dados.filter((l) => l[iNat] === v).length;
    expect(conta("item_exigido")).toBe(28);
    expect(conta("evidencia_complementar")).toBe(3);
    expect(conta("item_nao_exigido")).toBe(2);
  });

  test("B13, B14 e A11 são complementares e não exigidos", async () => {
    const [cabecalho, ...dados] = await csv();
    const iNat = cabecalho?.indexOf("Natureza") ?? -1;
    const iExig = cabecalho?.indexOf("Exigido pelo edital") ?? -1;
    for (const codigo of ["B13", "B14", "A11"]) {
      const linha = dados.find((l) => l[0] === codigo);
      expect(linha, `${codigo} ausente`).toBeDefined();
      expect(linha?.[iNat]).toBe("evidencia_complementar");
      expect(linha?.[iExig]).toBe("Não");
    }
  });

  test("B07 preservado como exigido e sem arquivo", async () => {
    const [cabecalho, ...dados] = await csv();
    const iExig = cabecalho?.indexOf("Exigido pelo edital") ?? -1;
    const iNat = cabecalho?.indexOf("Natureza") ?? -1;
    const iUrl = cabecalho?.indexOf("URL permanente") ?? -1;
    const iSha = cabecalho?.indexOf("SHA-256") ?? -1;
    const b07 = dados.find((l) => l[0] === "B07");
    expect(b07?.[iExig]).toBe("Sim");
    expect(b07?.[iNat]).toBe("item_exigido");
    expect(b07?.[iUrl]).toBe("");
    expect(b07?.[iSha]).toBe("");
    expect(b07?.[2]).toContain("Itabaianinha");
  });

  test("nenhum campo deslocado: ID e Categoria coerentes em todas as linhas", async () => {
    const [, ...dados] = await csv();
    const CATEGORIAS = new Set([
      "Análise de dados",
      "Comprovação de campo",
      "Produto final",
      "Publicidade",
      "Conformidade",
    ]);
    for (const l of dados) {
      expect(l[0]).toMatch(/^[A-E][0-9]{2}$/);
      expect(CATEGORIAS.has(l[1] ?? "")).toBe(true);
    }
  });

  test("caracteres portugueses preservados", async () => {
    const [cabecalho, ...dados] = await csv();
    expect(cabecalho).toContain("Observações");
    expect(cabecalho).toContain("Responsável");
    const textos = dados.map((l) => l.join(" ")).join(" ");
    expect(textos).toContain("Comprovação de campo");
    expect(textos).toContain("São Cristóvão");
    expect(textos).toMatch(/Madá|Dona Mad/);
    expect(textos).not.toContain("Ã©");
    expect(textos).not.toContain("�");
  });

  test("derivação é determinística", async () => {
    derivar();
    const primeiro = await readFile("inventario-de-anexos.csv", "utf8");
    derivar();
    const segundo = await readFile("inventario-de-anexos.csv", "utf8");
    expect(segundo).toBe(primeiro);
  });

  test("--verificar aprova o derivado recém-gerado", () => {
    derivar();
    expect(derivar(["--verificar"])).toContain("corresponde ao XLSX atual");
  });
});
