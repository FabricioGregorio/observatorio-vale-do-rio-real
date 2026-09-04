/**
 * Configuração do PostCSS.
 *
 * É este arquivo que liga o Tailwind ao build. Sem ele o plugin
 * `@tailwindcss/postcss` nunca roda: `@import "tailwindcss"` não é resolvido,
 * `@theme` chega ao navegador como at-rule desconhecida — e o navegador
 * descarta o bloco inteiro, deixando todos os tokens indefinidos — e nenhuma
 * classe utilitária é gerada. Foi o estado do projeto até 2026-09-02.
 *
 * Formato exigido pelo Next 16 (`next/dist/docs/01-app/01-getting-started/
 * 11-css.md`). O Turbopack procura a configuração na raiz do projeto.
 */
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
