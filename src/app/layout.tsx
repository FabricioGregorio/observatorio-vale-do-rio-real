import type { Metadata } from "next";
import "../estilos/tokens.css";

export const metadata: Metadata = {
  title: "Observatório do Vale do Rio Real",
  description: "Arquivo público do Observatório do Vale do Rio Real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
