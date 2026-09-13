import localFont from "next/font/local";

// DESIGN.md — tipografía de display (h1/h2, logo, encabezados de sección).
// .woff2 servidos desde el paquete "computer-modern" (CMU Serif), sin CDN externo.
export const cmuSerif = localFont({
  src: "../node_modules/computer-modern/fonts/cmu-serif-500-roman.woff2",
  variable: "--font-cmu-serif",
  weight: "400",
  style: "normal",
  display: "swap",
});
