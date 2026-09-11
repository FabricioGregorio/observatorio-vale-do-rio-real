/**
 * Formatação numérica determinística para os indicadores.
 *
 * Por que não `Intl.NumberFormat`: o resultado dele depende do ICU embutido no
 * runtime. Um build feito em máquina com `small-icu` devolveria outra string
 * para o mesmo número, e num site de prestação de contas o valor exibido é
 * parte da prova. Aqui a regra é explícita, versionada e testada — e a saída é
 * a mesma em qualquer máquina.
 *
 * Convenção pt-BR: ponto separa milhar, vírgula separa decimal.
 */

/**
 * Arredondamento meio-para-cima em valor absoluto, na casa pedida.
 *
 * `Math.round` sozinho arredonda meio-para-cima só nos positivos: -0,5 vira
 * -0 e não -1. Aqui o sinal é separado antes, para que a regra valha nos dois
 * lados — despesa e saldo negativo aparecem na mesma seção.
 */
export function arredondar(valor: number, casas: number): number {
  const escala = 10 ** casas;
  const sinal = valor < 0 ? -1 : 1;
  return (sinal * Math.round(Math.abs(valor) * escala)) / escala;
}

function separarMilhar(inteiro: string): string {
  let saida = "";
  for (let i = 0; i < inteiro.length; i += 1) {
    const restantes = inteiro.length - i;
    saida += inteiro[i];
    if (restantes > 1 && (restantes - 1) % 3 === 0) saida += ".";
  }
  return saida;
}

/** Número absoluto com casas fixas e separadores pt-BR, sem sinal. */
function corpoNumerico(valor: number, casas: number): string {
  const arredondado = arredondar(Math.abs(valor), casas);
  const texto = arredondado.toFixed(casas);
  const [inteiro = "0", decimal] = texto.split(".");
  const comMilhar = separarMilhar(inteiro);
  return decimal === undefined ? comMilhar : `${comMilhar},${decimal}`;
}

/** `0.9339802439` → `"93,4%"`. A escala percentual é aplicada aqui. */
export function formatarPercentual(valor: number, casas = 1): string {
  const sinal = valor < 0 ? "−" : "";
  return `${sinal}${corpoNumerico(valor * 100, casas)}%`;
}

/** `18762.52` → `"R$ 18.762,52"`. Negativo usa o sinal de menos tipográfico. */
export function formatarReais(valor: number, casas = 2): string {
  const sinal = valor < 0 ? "−" : "";
  return `${sinal}R$ ${corpoNumerico(valor, casas)}`;
}

/** `684` → `"684"`; `1234` → `"1.234"`. */
export function formatarContagem(valor: number): string {
  const sinal = valor < 0 ? "−" : "";
  return `${sinal}${corpoNumerico(valor, 0)}`;
}

/** `1.195064968` → `"1,20×"`. */
export function formatarFator(valor: number, casas = 2): string {
  const sinal = valor < 0 ? "−" : "";
  return `${sinal}${corpoNumerico(valor, casas)}×`;
}

/**
 * Aplica a regra de exibição que o próprio indicador declara.
 *
 * O parâmetro é estrutural de propósito: assim o módulo de formato não importa
 * o dataset, e o dataset não importa o formato. Quem junta os dois é o
 * componente.
 */
export function exibirIndicador(indicador: {
  readonly valorBruto: number;
  readonly unidade: "percentual" | "reais" | "contagem" | "fator";
  readonly casasDecimais: number;
}): string {
  switch (indicador.unidade) {
    case "percentual":
      return formatarPercentual(indicador.valorBruto, indicador.casasDecimais);
    case "reais":
      return formatarReais(indicador.valorBruto, indicador.casasDecimais);
    case "fator":
      return formatarFator(indicador.valorBruto, indicador.casasDecimais);
    default:
      return formatarContagem(indicador.valorBruto);
  }
}
