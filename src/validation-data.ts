import { CompositeDisposable, Emitter } from "atom";

import ConfigManager from "./config-manager";
import JSONData from "./json-data";

export default class ValidationData {
  private readonly config: ConfigManager;
  private readonly jsonData: JSONData;
  private readonly subscriptions: CompositeDisposable;
  readonly emitter: Emitter;
  data: Promise<DataFormat.ValidationData>;

  constructor(config: ConfigManager, jsonData: JSONData) {
    this.config = config;
    this.jsonData = jsonData;
    this.emitter = new Emitter;
    this.subscriptions = new CompositeDisposable;

    this.data = jsonData.data
      .then((jd) => { return this.setupSubscriptions(jd); })
      .then((jd) => { return this.processData(jd); })
      .then((data) => { return this.updateBothWhitelists(data); })
      .then((data) => { return this.emitDataUpdate(data); });
  }

  dispose() {
    this.subscriptions.dispose();
    this.emitter.dispose();
  }

  /** Invoke the given callback whenever the validation data has been updated.
   *  Returns a Disposable on which .dispose() can be called to unsubscribe. */
  onDidUpdateData(callback: (data: DataFormat.ValidationData) => void) {
    return this.emitter.on("did-update-data", callback);
  }

  /** Simply emits the 'did-update-data' event. */
  private emitDataUpdate(data: DataFormat.ValidationData) {
    this.emitter.emit("did-update-data", data);
    return Promise.resolve(data);
  }

  /** Waits for any of our dependencies, then sets up the subscriptions.*/
  private async setupSubscriptions(jd: DataFormat.JSONData) {
    await this.config.data.classWhitelist.promise;
    await this.config.data.baseWhitelist.promise;

    this.subscriptions.add(this.jsonData.onDidUpdateData((jd) => {
      this.data = this.processData(jd)
        .then((data) => { return this.updateBothWhitelists(data); })
        .then((data) => { return this.emitDataUpdate(data); });
    }));

    this.subscriptions.add(this.config.data.classWhitelist.onDidChange(async (event) => {
      const data = await this.data;
      this.data = this.updateClassWhitelist(data)
        .then((data) => { return this.emitDataUpdate(data); });
    }));

    this.subscriptions.add(this.config.data.baseWhitelist.onDidChange(async (event) => {
      const data = await this.data;
      this.data = this.updateBaseWhitelist(data)
        .then((data) => { return this.emitDataUpdate(data); });
    }));

    return jd;
  }

  /** Transforms the JSON data into the format expected by the parser. */
  private processJSONData(jsonData: DataFormat.JSONData) {
    const validBases = [];
    const validClasses = [];
    for(var c in jsonData.items) {
      validClasses.push(c);
      for(var b of jsonData.items[c]) {
        validBases.push(b);
      }
    }
    const result = { validBases, validClasses };
    return result;
  }

  /** Updates the class whitelist for the given validation set. */
  private async updateClassWhitelist(data: DataFormat.ValidationData) {
    data.classWhitelist = await this.config.data.classWhitelist.promise;
    return data;
  }

  /** Updates the base whitelist for the given validation set. */
  private async updateBaseWhitelist(data: DataFormat.ValidationData) {
    data.baseWhitelist = await this.config.data.baseWhitelist.promise;
    return data;
  }

  /** Updates both whitelists for the given validation set. */
  private async updateBothWhitelists(data: DataFormat.ValidationData):
      Promise<DataFormat.ValidationData> {
    return this.updateClassWhitelist(data)
      .then((d) => { return this.updateBaseWhitelist(d); });
  }

  /** Performs a full refresh on the base validation data. */
  private async processData(jd: DataFormat.JSONData) {
    const classWhitelist = await this.config.data.classWhitelist.promise;
    const baseWhitelist = await this.config.data.baseWhitelist.promise;
    const processedData = this.processJSONData(jd);

    let result: DataFormat.ValidationData = {
      validClasses: processedData.validClasses,
      validBases: processedData.validBases,
      classWhitelist,
      baseWhitelist
    }

    return result;
  }
}
