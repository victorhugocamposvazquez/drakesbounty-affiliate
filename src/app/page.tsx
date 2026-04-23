import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/**
 * Ruta concreta para `/` (sin depender solo del edge proxy). Alineado con
 * `localePrefix: "always"`: se envía al locale por defecto.
 */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
