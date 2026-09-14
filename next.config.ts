import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // El cliente de Prisma vive en app/generated/prisma (ruta de salida
  // personalizada, no node_modules/.prisma/client), así que el file
  // tracer de Next.js no detecta por sí solo que hay que copiar los
  // binarios del motor de consultas al paquete de la función
  // serverless. Sin esto, Vercel no encuentra
  // libquery_engine-rhel-openssl-3.0.x.so.node en producción.
  outputFileTracingIncludes: {
    "/*": ["./app/generated/prisma/**/*"],
  },
};

export default withNextIntl(nextConfig);
