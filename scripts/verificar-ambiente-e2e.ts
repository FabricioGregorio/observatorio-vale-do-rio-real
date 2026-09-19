/**
 * Preflight do gate de ponta a ponta.
 *
 * O gate deixou de rodar contra `next dev` com `reuseExistingServer`. Aquele
 * desenho tinha duas falhas caladas: o servidor podia ser um processo antigo,
 * de outra árvore de trabalho, e o que estava sob teste era o modo de
 * desenvolvimento — não a superfície publicada. Agora o Playwright sobe um
 * `next start` próprio, na porta 3100, e o derruba ao final.
 *
 * Um servidor que sobe sozinho só é confiável se o ambiente à volta estiver
 * limpo. Este script confere as três condições antes de a suíte começar, e
 * falha alto quando alguma não vale — falhar aqui custa um segundo; falhar
 * depois custa uma suíte inteira medindo a coisa errada.
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { createServer } from "node:net";
import { join, resolve } from "node:path";

const PORTA_E2E = 3100;

/** Pastas cujo conteúdo entra no build e, portanto, o envelhece. */
const FONTES = ["src", "public"] as const;

function conferirPortaLivre(): Promise<void> {
  return new Promise((resolver, rejeitar) => {
    const servidor = createServer();
    servidor.once("error", (erro: NodeJS.ErrnoException) => {
      if (erro.code === "EADDRINUSE") {
        rejeitar(
          new Error(
            `A porta ${PORTA_E2E} já está ocupada. Encerre o servidor antigo; o gate não reutiliza processos existentes.`,
          ),
        );
        return;
      }
      rejeitar(erro);
    });
    servidor.listen(PORTA_E2E, "127.0.0.1", () => {
      servidor.close((erro) => (erro ? rejeitar(erro) : resolver()));
    });
  });
}

/** Instante da modificação mais recente sob `dir`. */
function maisRecente(dir: string): number {
  let quando = 0;
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    const info = statSync(caminho);
    const candidato = info.isDirectory() ? maisRecente(caminho) : info.mtimeMs;
    if (candidato > quando) quando = candidato;
  }
  return quando;
}

async function principal(): Promise<void> {
  const buildId = resolve(".next", "BUILD_ID");
  if (!existsSync(buildId)) {
    throw new Error(
      "Build de produção ausente. Rode `pnpm build` antes de `pnpm a11y`, ou rode `pnpm verificar`, que já constrói antes de subir o servidor.",
    );
  }

  /*
    Um build presente mas velho é pior do que build nenhum: a suíte fica verde
    sobre código que não é o da árvore de trabalho. O `pnpm verificar` constrói
    logo antes, então nunca esbarra nisto; quem roda `pnpm a11y` solto depois
    de mexer no código, sim.
  */
  const construidoEm = statSync(buildId).mtimeMs;
  const alteradoEm = Math.max(...FONTES.map(maisRecente));
  if (alteradoEm > construidoEm) {
    throw new Error(
      "Build de produção desatualizado: há arquivo em src/ ou public/ mais novo que `.next/BUILD_ID`. Rode `pnpm build` de novo — a suíte testaria o código anterior.",
    );
  }

  await conferirPortaLivre();
  console.log(
    `[e2e] build de produção presente e atual; porta dedicada ${PORTA_E2E} livre.`,
  );
}

principal().catch((erro: unknown) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
