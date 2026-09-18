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

const FORMATOS_PUBLICOS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "Planilha XLSX",
  "text/markdown": "Markdown",
  "image/webp": "Fotografia WebP",
  "image/svg+xml": "Elemento gráfico SVG",
  "audio/mp4": "Áudio M4A",
  "audio/x-m4a": "Áudio M4A",
  "audio/mpeg": "Áudio MP3",
};

export function formatoPublico(mimeType: string): string {
  return FORMATOS_PUBLICOS[mimeType] ?? mimeType;
}
