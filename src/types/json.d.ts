declare module "*/items.json" {
  interface f {
    [itemClass: string]: string[];
  }
  const e: f;
  export = e;
}

declare module "*/sounds.json" {
  interface f {
    [id: string]: {
      filename: string;
      label?: string;
    }
  }
  const e: f;
  export = e;
}

declare module "*/suggestions.json" {
  import { Suggestions } from "atom/autocomplete-plus";
  interface f {
    actions: Suggestions;
    blocks: Suggestions;
    booleans: Suggestions;
    extras: {
      bases: Suggestions;
      blocks: Suggestions;
      classes: Suggestions;
    }
    filters: Suggestions;
    operators: Suggestions;
    rarities: Suggestions;
    sockets: Suggestions;
  }
  const e: f;
  export = e;
}
