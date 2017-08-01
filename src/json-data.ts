import { File } from "atom";
import * as path from "path";

import ConfigManager from "config-manager";

interface FileList {
  items: File,
  suggestions: File
}

/** File handling for our data files. */
export default class JSONData {
  private readonly config: ConfigManager;
  private readonly dataPath: string;
  /** A promise to the data loaded in from our JSON files. */
  data: Promise<DataFormat.JSONData>;

  constructor(config: ConfigManager) {
    this.config = config;
    this.dataPath = path.join(__dirname, "../data");

    this.data = this.updateData();
  }

  dispose() {
    return;
  }

  /** Asynchronously reads and processes the given JSON data file. */
  private async processJSONFile<T>(file: File) {
    const content = await file.read();

    let result: T;
    try {
      result = JSON.parse(content);
    } catch(e) {
      const message = e.message + ' within "' + file.getBaseName() + '"';
      atom.notifications.addFatalError(message, {
        dismissable: true,
        stack: e.stack
      });
      throw new Error(message);
    }

    return result;
  }

  /** Begin the asynchronous loading of the JSON data for the given dataset. */
  private async updateData() {
    const list: FileList = {
      items: new File(path.join(this.dataPath, "items.json")),
      suggestions: new File(path.join(this.dataPath, "suggestions.json"))
    }

    const result: DataFormat.JSONData = {
      items: await this.processJSONFile<DataFormat.ItemFile>(list.items),
      suggestions: await this.processJSONFile<DataFormat.SuggestionFile>(list.suggestions)
    }

    return result;
  }
}
