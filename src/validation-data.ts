import { CompositeDisposable, Emitter } from "atom";

import itemsFileData = require("../data/items.json");
import soundsFileData = require("../data/sounds.json");

import * as Config from "./config";

export interface ValidationDataFormat {
  validClasses: string[];
  validBases: string[];
  validSounds: string[];
  classWhitelist: string[];
  baseWhitelist: string[];
}

interface Emissions {
  "did-update-data": ValidationDataFormat;
}

export class ValidationData {
  private readonly subscriptions: CompositeDisposable;
  readonly emitter: Emitter<{}, Emissions>;
  data: ValidationDataFormat;

  constructor() {
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();

    this.setupSubscriptions();
    this.updateBaseData();
    this.updateBaseWhitelist();
    this.updateClassWhitelist();
    this.emitDataUpdate();
  }

  dispose() {
    this.subscriptions.dispose();
    this.emitter.dispose();
  }

  /**
   * Invoke the given callback whenever the validation data has been updated.
   * Returns a Disposable on which .dispose() can be called to unsubscribe.
   */
  onDidUpdateData(callback: (data: ValidationDataFormat) => void) {
    return this.emitter.on("did-update-data", callback);
  }

  /** Simply emits the 'did-update-data' event. */
  private emitDataUpdate() {
    this.emitter.emit("did-update-data", this.data);
  }

  /** Waits for any of our dependencies, then sets up the subscriptions. */
  private setupSubscriptions() {
    this.subscriptions.add(
      Config.baseWhitelist.onDidChange(_ => {
        this.updateBaseWhitelist();
        this.emitDataUpdate();
      }),
      Config.classWhitelist.onDidChange(_ => {
        this.updateClassWhitelist();
        this.emitDataUpdate();
      })
    );
  }

  /** Transforms the JSON data into the format expected by the parser. */
  private updateBaseData() {
    const validBases = [];
    const validClasses = [];
    for (const c in itemsFileData) {
      validClasses.push(c);
      for (const b of itemsFileData[c]) {
        validBases.push(b);
      }
    }

    const validSounds = [];
    for (const s in soundsFileData) {
      validSounds.push(s);
    }

    this.data = {
      validBases, validClasses, validSounds, classWhitelist: [], baseWhitelist: [],
    };
  }

  /** Updates the class whitelist for the given validation set. */
  private updateClassWhitelist() {
    this.data.classWhitelist = Config.classWhitelist.value ? Config.classWhitelist.value : [];
  }

  /** Updates the base whitelist for the given validation set. */
  private updateBaseWhitelist() {
    this.data.baseWhitelist = Config.baseWhitelist.value ? Config.baseWhitelist.value : [];
  }
}
