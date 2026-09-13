import messages from "./messages/es.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: "es" | "ca" | "en";
    Messages: typeof messages;
  }
}
