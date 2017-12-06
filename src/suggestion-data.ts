import { CompositeDisposable, Emitter } from "atom";
import { Suggestions, TextSuggestion } from "atom/autocomplete-plus";

import itemsFileData = require("../data/items.json");
import soundsFileData = require("../data/sounds.json");
import suggestionFileData = require("../data/suggestions.json");

import * as Config from "./config";

type TextSuggestions = TextSuggestion[];

export interface SuggestionDataFormat {
  actions: Suggestions;
  blocks: Suggestions;
  booleans: Suggestions;
  filters: Suggestions;
  operators: Suggestions;
  rarities: Suggestions;
  sockets: Suggestions;
  bases: TextSuggestions;
  classes: TextSuggestions;
  sounds: TextSuggestions;
  extraBases: Suggestions;
  extraBlocks: Suggestions;
  extraClasses: Suggestions;
  classWhitelist: TextSuggestions;
  baseWhitelist: TextSuggestions;
  [key: string]: Suggestions;
}

interface Emissions {
  "did-update-data": SuggestionDataFormat;
}

export class SuggestionData {
  private readonly subscriptions: CompositeDisposable;
  readonly emitter: Emitter<{}, Emissions>;
  data: SuggestionDataFormat;

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
   * Invoke the given callback whenever the suggestion data has been updated.
   * Returns a Disposable on which .dispose() can be called to unsubscribe.
   */
  onDidUpdateData(callback: (data: SuggestionDataFormat) => void) {
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

  /** Transforms each whitelist value in the given array into a TextSuggestion. */
  private processWhitelist(values: string[]): TextSuggestions {
    const result: TextSuggestions = [];
    const rightLabel = "Whitelisted";

    for (const value of values) {
      const valueText = value.indexOf(" ") !== -1 ? `"${value}"` : value;

      result.push({
        text: valueText,
        displayText: value,
        rightLabel,
      });
    }

    return result;
  }

  /** Updates the base whitelist for the given suggestion set. */
  private updateBaseWhitelist() {
    this.data.baseWhitelist = this.processWhitelist(Config.baseWhitelist.value);
  }

  /** Updates the class whitelist for the given suggestion set. */
  private updateClassWhitelist() {
    this.data.classWhitelist = this.processWhitelist(Config.classWhitelist.value);
  }

  /** Performs a full refresh on the base suggestion data. */
  private updateBaseData() {
    const result: SuggestionDataFormat = {
      actions: suggestionFileData.actions,
      blocks: suggestionFileData.blocks,
      booleans: suggestionFileData.booleans,
      filters: suggestionFileData.filters,
      operators: suggestionFileData.operators,
      rarities: suggestionFileData.rarities,
      sockets: suggestionFileData.sockets,
      bases: [],
      classes: [],
      sounds: [],
      extraBases: suggestionFileData.extras.bases,
      extraBlocks: suggestionFileData.extras.blocks,
      extraClasses: suggestionFileData.extras.classes,
      classWhitelist: [],
      baseWhitelist: [],
    };

    for (const itemClass in itemsFileData) {
      const classText = itemClass.indexOf(" ") !== -1 ? `"${itemClass}"` : itemClass;
      result.classes.push({
        text: classText,
        displayText: itemClass,
      });

      for (const itemBase of itemsFileData[itemClass]) {
        const baseText = itemBase.indexOf(" ") !== -1 ? `"${itemBase}"` : itemBase;
        result.bases.push({
          text: baseText,
          displayText: itemBase,
          rightLabel: itemClass,
        });
      }
    }

    // Generate PlayAlertSound suggestions based on the 'sound.json' entries.
    for (const id in soundsFileData) {
      const sound = soundsFileData[id];
      if (!sound) continue;

      const displayText = sound.label ? sound.label : id;
      result.sounds.push({ text: id, displayText });
    }

    const appendExtrasLabel = (suggestions: Suggestions) => {
      const labelText = "Extras";
      for (const suggestion of suggestions) {
        suggestion.rightLabel = labelText;
      }
    };

    appendExtrasLabel(result.extraBases);
    appendExtrasLabel(result.extraBlocks);
    appendExtrasLabel(result.extraClasses);

    this.data = result;
  }
}
