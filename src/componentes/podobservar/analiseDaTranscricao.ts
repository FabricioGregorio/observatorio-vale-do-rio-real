/**
 * Análise da transcrição para renderização segura.
 *
 * O nome não é `transcricao.ts` porque `Transcricao.tsx` vive ao lado, e em
 * sistema de arquivos insensível a maiúsculas os dois seriam o mesmo módulo —
 * o TypeScript recusa com TS1149.
 *
 * A transcrição chega do banco como texto puro, e é texto puro que vai para o
 * HTML: **nada aqui produz marcação a partir do conteúdo**, e nenhum consumidor
 * usa `dangerouslySetInnerHTML`. O que esta função faz é classificar cada
 * linha, para que o componente escolha o elemento semântico certo. Se a
 * classificação errar, o pior resultado possível é um parágrafo onde caberia
 * um rótulo — nunca injeção.
 *
 * As quatro formas foram medidas no material real dos três episódios, não
 * supostas:
 *
 * - **tempo** — `[00:00]`, 81 ocorrências nos três episódios;
 * - **som** — `[risos]`, `[vinheta de transição]`, `[som de carro em estrada
 *   de terra]`: acessibilidade, e por isso nunca descartadas;
 * - **locutor** — linha inteiramente em maiúsculas, opcionalmente com
 *   ` — FUNÇÃO`;
 * - **fala** — todo o resto.
 *
 * Linhas de fala consecutivas formam **um** parágrafo. O PDF de origem quebra
 * na margem, no meio da frase, e renderizar cada quebra como parágrafo
 * produziria um texto ilegível. A quebra em branco é o que separa parágrafos.
 * Nada disso altera o que está gravado: o campo continua intacto, isto é
 * apresentação.
 */

export type BlocoTranscricao =
  | { tipo: "tempo"; valor: string }
  | { tipo: "som"; valor: string }
  | { tipo: "locutor"; nome: string; funcao: string | null }
  | { tipo: "fala"; texto: string };

/**
 * Rótulo de locutor: maiúsculas de ponta a ponta, sem pontuação final de
 * frase.
 *
 * Conferido contra os três episódios: nenhuma linha de fala é inteiramente
 * maiúscula, e nenhum rótulo termina em `.`, `!` ou `?`. Os únicos rótulos
 * longos são os que carregam função — `OVIÊDO ABREU — GESTOR DO CENTRO
 * CULTURAL E MUSEU BORDA DA MATA` —, e por isso o limite é generoso.
 */
function ehLocutor(linha: string): boolean {
  if (linha.length > 120) return false;
  if (/[.!?…]$/.test(linha)) return false;
  if (!/\p{Lu}/u.test(linha)) return false;
  return linha === linha.toLocaleUpperCase("pt-BR");
}

export function analisarTranscricao(texto: string): BlocoTranscricao[] {
  const blocos: BlocoTranscricao[] = [];
  let paragrafo: string[] = [];

  const fecharParagrafo = () => {
    if (paragrafo.length === 0) return;
    blocos.push({ tipo: "fala", texto: paragrafo.join(" ") });
    paragrafo = [];
  };

  for (const bruta of texto.split("\n")) {
    const linha = bruta.trim();

    if (linha === "") {
      fecharParagrafo();
      continue;
    }

    if (linha.startsWith("[") && linha.endsWith("]")) {
      fecharParagrafo();
      const dentro = linha.slice(1, -1).trim();
      blocos.push(
        /^\d{1,2}:\d{2}(:\d{2})?$/.test(dentro)
          ? { tipo: "tempo", valor: dentro }
          : { tipo: "som", valor: dentro },
      );
      continue;
    }

    if (ehLocutor(linha)) {
      fecharParagrafo();
      const [nome, funcao] = linha.split(" — ");
      blocos.push({
        tipo: "locutor",
        nome: (nome ?? linha).trim(),
        funcao: funcao?.trim() ?? null,
      });
      continue;
    }

    paragrafo.push(linha);
  }

  fecharParagrafo();
  return blocos;
}
