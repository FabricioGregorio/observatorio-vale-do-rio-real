import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { defineConfig } from "vitest/config";

/*
  `.env.local` continua sendo carregado: vários testes dependem de configuração
  que não é banco — `OBSERVATORIO_FONTES_DIR` para a conferência dos
  indicadores, `STORAGE_PUBLIC_URL` e `TESTE_R2_ESCRITA` para o R2.

  As três credenciais de PostgreSQL, porém, são removidas depois da carga.

  ## Por que

  Os testes de integração deste repositório já se protegem com
  `describe.skipIf(!process.env.DATABASE_URL...)`: a intenção declarada sempre
  foi "só conecte quando alguém pedir explicitamente". Só que carregar
  `.env.local` aqui **entregava a credencial a eles**, e o `skipIf` nunca
  disparava numa máquina de desenvolvimento. O resultado é que `pnpm teste`
  abria conexão com o banco remoto a cada execução — inclusive
  `configuracao-producao.test.ts`, que nem tem `skipIf` e consultava a projeção
  pública inteira duas vezes.

  Isso é errado por si só: teste unitário que depende de serviço remoto falha
  por motivo que não é o código. E foi um dos consumidores da cota de
  transferência do provedor, que estourou em 2026-09-23.

  ## O que isto muda

  `pnpm teste` passa a rodar inteiramente offline e determinístico. Os testes
  de integração continuam existindo e continuam executáveis — mas por decisão
  explícita de quem executa, informando a credencial na própria linha:

      DATABASE_URL_MANUTENCAO=… pnpm vitest run testes/publicacao-multiarquivo.test.ts

  Não se suprime nenhum teste e não se esconde nenhuma falha: o que muda é
  quem decide abrir a conexão.
*/
if (existsSync(".env.local")) loadEnvFile(".env.local");

for (const credencial of [
  "DATABASE_URL",
  "DATABASE_URL_MANUTENCAO",
  "DATABASE_URL_MIGRACAO",
]) {
  delete process.env[credencial];
}

export default defineConfig({
  test: {
    include: ["testes/**/*.test.ts"],
  },
});
