import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { ActionLink } from "../src/componentes/ui/ActionLink";
import { Button } from "../src/componentes/ui/Button";

test("ação local preserva disabled e type nativos", () => {
  expect(
    renderToStaticMarkup(createElement(Button, { disabled: true }, "Buscar")),
  ).toContain('disabled=""');
  expect(
    renderToStaticMarkup(createElement(Button, {}, "Restaurar")),
  ).toContain('type="button"');
  expect(
    renderToStaticMarkup(createElement(Button, { type: "submit" }, "Buscar")),
  ).toContain('type="submit"');
});

test("download explícito não anuncia nova guia, incluindo nome vazio", () => {
  const html = renderToStaticMarkup(
    createElement(ActionLink, {
      variant: "document",
      href: "/anexos.json",
      download: "",
      children: "Baixar JSON",
    }),
  );
  expect(html).toContain('download=""');
  expect(html).not.toContain('target="_blank"');
  expect(html).not.toContain("Abre em nova guia");
});

test("documento externo mantém aviso e descrição existentes", () => {
  const html = renderToStaticMarkup(
    createElement(ActionLink, {
      variant: "document",
      href: "https://example.com/documento.pdf",
      "aria-describedby": "formato",
      children: "Abrir PDF",
    }),
  );
  expect(html).toContain('target="_blank"');
  expect(html).toMatch(/aria-describedby="formato [^"]+"/);
  expect(html).toContain("Abre em nova guia.");
});
