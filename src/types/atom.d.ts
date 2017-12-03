export {}

declare module "atom" {
  interface ConfigValues {}

  interface Emissions {}

  interface Grammar {
    scopeName: string;
    maxLineLength: number;
    maxTokensPerLine: number;
  }
}
