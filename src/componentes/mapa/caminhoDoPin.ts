/** Gota cartográfica com a ponta em (0, 0), na coordenada confirmada. */
export function caminhoDoPin(raio: number): string {
  const duasCasas = (valor: number) => Number(valor.toFixed(2));
  return `M0 0C${duasCasas(-0.45 * raio)} ${duasCasas(-0.9 * raio)} ${duasCasas(-raio)} ${duasCasas(-1.35 * raio)} ${duasCasas(-raio)} ${duasCasas(-2 * raio)}A${duasCasas(raio)} ${duasCasas(raio)} 0 1 1 ${duasCasas(raio)} ${duasCasas(-2 * raio)}C${duasCasas(raio)} ${duasCasas(-1.35 * raio)} ${duasCasas(0.45 * raio)} ${duasCasas(-0.9 * raio)} 0 0Z`;
}
