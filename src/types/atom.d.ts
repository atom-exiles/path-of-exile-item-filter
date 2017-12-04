import { TextEditor } from "atom";

import { FilterData, ProcessedFilterData, ReprocessedFilterData } from "../filter-manager";

declare module "atom" {
  interface Emissions {
    "registry-did-add-editor": TextEditor;
    "registry-did-destroy-editor": number;
    "registry-did-add-filter": TextEditor;
    "registry-did-destroy-filter": number;

    "manager-did-add-filter": FilterData;
    "manager-did-destroy-filter": number;
    "manager-did-process-filter": ProcessedFilterData;
    "manager-did-reprocess-filter": ReprocessedFilterData;
  }

  interface Grammar {
    scopeName: string;
    maxLineLength: number;
    maxTokensPerLine: number;
  }
}
