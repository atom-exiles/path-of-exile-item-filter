import { CompositeDisposable, Emitter } from "atom";

import ConfigManager from "./config-manager";
import JSONData from "./json-data";

export default class SuggestionData {
  private readonly config: ConfigManager;
  private readonly jsonData: JSONData;
  private readonly subscriptions: CompositeDisposable;
  readonly emitter: Emitter;
  data: Promise<DataFormat.SuggestionData>;

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

  /** Invoke the given callback whenever the suggestion data has been updated.
   *  Returns a Disposable on which .dispose() can be called to unsubscribe. */
  onDidUpdateData(callback: (data: DataFormat.SuggestionData) => void) {
    return this.emitter.on("did-update-data", callback);
  }

  /** Simply emits the 'did-update-data' event. */
  private emitDataUpdate(data: DataFormat.SuggestionData) {
    this.emitter.emit("did-update-data", data);
    return Promise.resolve(data);
  }

  /** Waits for any of our dependencies, then sets up the subscriptions.*/
  private async setupSubscriptions(jd: DataFormat.JSONData) {
    await this.config.data.classWhitelist.promise;
    await this.config.data.baseWhitelist.promise;
    await this.config.completion.enableRightLabel.promise;

    this.subscriptions.add(this.config.completion.enableRightLabel.onDidChange((event) => {
      this.handleRightLabelToggle(event.newValue);
    }));

    this.subscriptions.add(this.jsonData.onDidUpdateData((jd) => {
      this.data = this.processData(jd)
        .then((data) => { return this.updateBothWhitelists(data); })
        .then((data) => { return this.emitDataUpdate(data); });
    }));

    this.subscriptions.add(this.config.data.classWhitelist.onDidChange(async () => {
      const data = await this.data;
      this.data = this.updateClassWhitelist(data)
        .then((data) => { return this.emitDataUpdate(data); });
    }));

    this.subscriptions.add(this.config.data.baseWhitelist.onDidChange(async () => {
      const data = await this.data;
      this.data = this.updateBaseWhitelist(data)
        .then((data) => { return this.emitDataUpdate(data); });
    }));

    return jd;
  }

  /** Appends the Extras label onto each suggestion in the given array. */
  private appendExtraLabel(suggestions: Autocomplete.Suggestion[],
      enableRightLabel: boolean) {
    const labelText = "Extras";
    for(var suggestion of suggestions) {
      suggestion.custom = {
        backupRightLabel: labelText
      }
      if(enableRightLabel) suggestion.rightLabel = labelText;
    }

    return;
  }

  /** Processes each suggestion, performing any necessary work in order to toggle the right label. */
  private async handleRightLabelToggle(value: boolean) {
    const suggestions = await this.data;

    for(var subcategory in suggestions) {
      const array = suggestions[subcategory];
      for(var suggestion of array) {
        if(value) {
          if(suggestion.custom && suggestion.custom.backupRightLabel) {
            suggestion.rightLabel = suggestion.custom.backupRightLabel;
          }
        } else {
          if(suggestion.rightLabel) {
            suggestion.custom = {
              backupRightLabel: suggestion.rightLabel
            }
            suggestion.rightLabel = undefined;
          }
        }
      }
    }

    return suggestions;
  }

  /** Transforms each whitelist value in the given array into a TextSuggestion. */
  private async processWhitelist(values: string[]) {
    const result: Autocomplete.TextSuggestions = [];
    const enableRightLabel = await this.config.completion.enableRightLabel.promise;
    const labelText = "Whitelisted";

    for(var value of values) {
      if(value.indexOf(" ") != -1) {
        var valueText = '"' + value + '"'
      } else {
        var valueText = value;
      }

      let rightLabel: string|undefined;
      if(enableRightLabel) {
        rightLabel = labelText;
      }

      result.push({
        text: valueText,
        displayText: value,
        rightLabel: rightLabel,
        custom: {
          backupRightLabel: labelText
        }
      });
    }

    return result;
  }

  /** Updates the class whitelist for the given suggestion set. */
  private async updateClassWhitelist(suggestions: DataFormat.SuggestionData) {
    const values = await this.config.data.classWhitelist.promise;
    suggestions.classWhitelist = await this.processWhitelist(values);
    return suggestions;
  }

  /** Updates the base whitelist for the given suggestion set. */
  private async updateBaseWhitelist(suggestions: DataFormat.SuggestionData) {
    const values = await this.config.data.baseWhitelist.promise;
    suggestions.baseWhitelist = await this.processWhitelist(values);
    return suggestions;
  }

  /** Updates both whitelists for the given suggestion set. */
  private async updateBothWhitelists(suggestions: DataFormat.SuggestionData):
      Promise<DataFormat.SuggestionData> {
    return this.updateClassWhitelist(suggestions)
      .then((s) => { return this.updateBaseWhitelist(s); });
  }

  /** Performs a full refresh on the base suggestion data. */
  private async processData(jd: DataFormat.JSONData) {
    const result: DataFormat.SuggestionData = {
      actions: jd.suggestions.actions,
      blocks: jd.suggestions.blocks,
      booleans: jd.suggestions.booleans,
      filters: jd.suggestions.filters,
      operators: jd.suggestions.operators,
      rarities: jd.suggestions.rarities,
      sockets: jd.suggestions.sockets,
      bases: [],
      classes: [],
      extraBases: jd.suggestions.extras.bases,
      extraBlocks: jd.suggestions.extras.blocks,
      extraClasses: jd.suggestions.extras.classes,
      classWhitelist: [],
      baseWhitelist: []
    };

    const enableRightLabel = await this.config.completion.enableRightLabel.promise;

    for(var itemClass in jd.items) {
      if(itemClass.indexOf(" ") != -1) {
        var classText = '"' + itemClass + '"';
      } else {
        var classText = itemClass;
      }
      result.classes.push({
        text: classText,
        displayText: itemClass
      });

      for(var itemBase of jd.items[itemClass]) {
        if(itemBase.indexOf(" ") != -1) {
          var baseText = '"' + itemBase + '"';
        } else {
          var baseText = itemBase;
        }

        let rightLabel: string|undefined;
        if(enableRightLabel) rightLabel = itemClass;

        result.bases.push({
          text: baseText,
          displayText: itemBase,
          rightLabel: rightLabel,
          custom: {
            backupRightLabel: itemClass
          }
        });
      }
    }

    this.appendExtraLabel(result.extraBases, enableRightLabel);
    this.appendExtraLabel(result.extraBlocks, enableRightLabel);
    this.appendExtraLabel(result.extraClasses, enableRightLabel);

    return result;
  }
}
