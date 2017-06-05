import { Disposable, Emitter, File } from "atom";
import * as path from "path";

import ConfigManager from "config-manager";

interface FileList {
  items: File,
  suggestions: File
}

/** Manages the data for the currently active dataset. The data can be accessed
 *  directly off of the exported "data" Promise. A change to the active dataset
 *  will result in that promise being overwritten, with the "did-update-data"
 *  event being emitted once the data for the dataset is available. */
export default class JSONData {
  private readonly config: ConfigManager;
  private readonly dataPath: string;
  private subscription: Disposable;
  readonly emitter: Emitter;
  /** A promise to the data loaded in from our JSON files. */
  data: Promise<DataFormat.JSONData>;

  constructor(config: ConfigManager) {
    this.config = config;
    this.dataPath = path.join(__dirname, "../data");
    this.emitter = new Emitter;

    this.data = this.setupSubscription().then(() => {
      return this.updateData();
    });
  }

  dispose() {
    this.subscription.dispose();
    this.emitter.dispose();

    return;
  }

  /** Invoke the given callback whenever the JSON data has been updated.
   *  Returns a Disposable on which .dispose() can be called to unsubscribe. */
  onDidUpdateData(callback: (data: DataFormat.JSONData) => void) {
    return this.emitter.on("did-update-data", (data: DataFormat.JSONData) => {
      callback(data);
    });
  }

  /** Waits for any of our dependencies, then sets up the subscription. */
  private async setupSubscription() {
    await this.config.data.dataset.promise;

    this.subscription = this.config.data.dataset.onDidChange(() => {
      this.data = this.updateData();
    });

    return;
  }

  /** Creates a list of files to be loaded off of disk for the given dataset. */
  private generateFileList(dataset: string) {
    const datasetPath = path.join(this.dataPath, dataset);
    const result: FileList = {
      items: new File(path.join(datasetPath, "items.json")),
      suggestions: new File(path.join(datasetPath, "suggestions.json"))
    }

    return result;
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
    const dataset = await this.config.data.dataset.promise;
    const list = this.generateFileList(dataset);

    const result: DataFormat.JSONData = {
      items: await this.processJSONFile<DataFormat.ItemFile>(list.items),
      suggestions: await this.processJSONFile<DataFormat.SuggestionFile>(list.suggestions)
    }
    this.emitter.emit("did-update-data", result);

    return result;
  }
}
