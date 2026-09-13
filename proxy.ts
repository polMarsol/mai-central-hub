import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // No aplicar el middleware de locale a /api, internals de Next ni ficheros estáticos.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
