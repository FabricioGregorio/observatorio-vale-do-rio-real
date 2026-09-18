const TIPOS_PUBLICOS: Record<string, string> = {
  relatorio_tecnico: "Relatório técnico",
  entrevista_transcricao: "Entrevista",
  formulario_modelo: "Respostas de formulário",
  painel_dados: "Dados e indicadores",
  identidade_visual: "Identidade visual",
};

export function tipoPublico(tipo: string, slug: string): string {
  if (tipo === "outro" && slug === "fotografias-visitas-i-vii")
    return "Registro fotográfico";
  return TIPOS_PUBLICOS[tipo] ?? tipo;
}
