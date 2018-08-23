export { }

declare module "atom" {
  interface Grammar {
    maxLineLength: number;
    maxTokensPerLine: number;
  }
}
