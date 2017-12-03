import { TextEditor } from "atom";

declare module "atom" {
  interface Emissions {
    "did-add-editor": TextEditor;
    "did-destroy-editor": number;
    "did-add-filter": TextEditor;
    "did-destroy-filter": number;
  }

  interface Grammar {
    scopeName: string;
    maxLineLength: number;
    maxTokensPerLine: number;
  }
}
