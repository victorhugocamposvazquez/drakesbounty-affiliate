import type { ReactNode } from "react";
import "./globals.css";

/**
 * Capa mínima exigida por el App Router. El `<html>` real está en `[locale]/layout`.
 * Ver: https://next-intl.dev/docs/getting-started/app-router
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
