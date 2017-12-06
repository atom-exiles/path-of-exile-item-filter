export { }

declare module "atom" {
  interface Grammar {
    scopeName: string;
    maxLineLength: number;
    maxTokensPerLine: number;
  }
}
