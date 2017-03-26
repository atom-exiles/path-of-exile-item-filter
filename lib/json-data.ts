// Manages the JSON data, exporting the relevant data based on the package
// configuration. Changes to the configuration will result in the data being
// updated in place, with events being emitted for modules where this isn't
// adequate.
import { Emitter, CompositeDisposable } from "atom";

import * as settings from "./settings";

interface ItemDataLayout {
  [index: string]: Array<string>
}

interface SuggestionsDataLayout {
  blocks: Completion.Suggestions
  filters: Completion.Suggestions
  actions: Completion.Suggestions
  rarities: Completion.Suggestions
  socketGroup: Completion.Suggestions
  operators: Completion.Suggestions
  booleans: Completion.Suggestions
  extraBlocks: Completion.Suggestions
  extraBases: Completion.Suggestions
  extraClasses: Completion.Suggestions
  [key: string]: Completion.Suggestions;
}

interface FileData {
  items: {
    core:       ItemDataLayout
    league:     ItemDataLayout
    legacy:     ItemDataLayout
    recipe:     ItemDataLayout
  },
  suggestions: SuggestionsDataLayout
}

interface ProcessedData {
  completion: Data.Completion
  linter: Data.Parser
}

export const files: FileData = {
  items: {
    core: require("../data/items/core.json"),
    league: require("../data/items/league.json"),
    legacy: require("../data/items/legacy.json"),
    recipe: require("../data/items/recipes.json")
  },
  suggestions: require("../data/suggestions.json")
}

export var emitter: Emitter;
var subscriptions: CompositeDisposable;

// export var completionData: Promise<Data.Completion>;
// export var filterItemData: Promise<Data.Parser>;
export var promise: Promise<ProcessedData>;

/** Shapes the item data into the format expected by each module. */
function mergeItemData(container: ProcessedData,
    itemList: ItemDataLayout): ProcessedData {
  const enableRightLabel = settings.config.completionSettings.enableRightLabel.get();

  for(var itemClass in itemList) {
    const itemBases = itemList[itemClass];

    var knownClass = false;
    for(var c of container.completion.classes) {
      if(c.displayText && c.displayText == itemClass) knownClass = true;
    }

    if(!knownClass) {
      var classText = itemClass;
      if(classText.indexOf(" ") != -1) classText = '"' + itemClass + '"';

      // Completion - Classes =================================================
      container.completion.classes.push({
        text: classText,
        displayText: itemClass
      })

      // Linter - Classes =====================================================
      container.linter.classes.push(classText);
    }

    for(var base of itemBases) {
      var baseText = base;
      if(baseText.indexOf(" ") != -1) baseText = '"' + base + '"';

      // Completion - Bases ===================================================
      var rightLabel: string|undefined = undefined;
      if(enableRightLabel) rightLabel = itemClass;

      container.completion.bases.push({
        text: baseText,
        displayText: base,
        rightLabel: rightLabel,
        custom: {
          backupRightLabel: itemClass
        }
      })

      // Linter - Bases =======================================================
      container.linter.bases.push(baseText);
    }
  }
  return container;
}

async function processItemData(): Promise<ProcessedData> {
  var result: ProcessedData = {
    completion: {
      classes: [],
      bases: [],
      whitelistClasses: [],
      whitelistBases: []
    },
    linter: {
      classes: [],
      bases: [],
      whitelistClasses: [],
      whitelistBases: []
    }
  }

  result = await mergeItemData(result, files.items.core);
  if(settings.config.dataSettings.enableLeague.get()) {
    result = await mergeItemData(result, files.items.league);
  }
  if(settings.config.dataSettings.enableLegacy.get()) {
    result = await mergeItemData(result, files.items.legacy);
  }
  if(settings.config.dataSettings.enableRecipe.get()) {
    result = await mergeItemData(result, files.items.recipe)
  }

  return result;
}

function updateWhitelists(itemData: ProcessedData) {
  const bases = settings.config.dataSettings.baseWhitelist.get();
  const classes = settings.config.dataSettings.classWhitelist.get();
  const enableRightLabel = settings.config.completionSettings.enableRightLabel.get();
  const labelText = "Whitelisted";

  itemData.completion.whitelistClasses = [];
  itemData.completion.whitelistBases = [];
  itemData.linter.whitelistClasses = [];
  itemData.linter.whitelistBases = [];

  const action = (data: string[], c: Completion.Suggestions, l: Array<string>) => {
    for(var v of data) {
      var text = v;
      if(v.indexOf(" ") != -1) {
        text = '"' + text + '"';
      }
      var rightLabel: string|undefined = undefined;
      if(enableRightLabel) rightLabel = labelText;
      c.push({ text: text, displayText: v, rightLabel: labelText,
          custom: { backupRightLabel: labelText }});
      l.push(text);
    }
  }

  action(classes, itemData.completion.whitelistClasses, itemData.linter.whitelistClasses);
  action(bases, itemData.completion.whitelistBases, itemData.linter.whitelistBases);
}

/** Iterates over all completion suggestions and updates the decoration properties
 *  based on the value of configuration variables. */
function updateDecorations(cd: Data.Completion) {
  const enableRightLabel = settings.config.completionSettings.enableRightLabel.get();
  const enableIcon = settings.config.completionSettings.enableIcon.get();

  // In order to allow specific decorations to be disabled, we store backup values
  // under the same name, except prefixed by an underscore.
  const action = (s: Completion.TextSuggestion): void => {
    if(enableRightLabel && s.custom && s.custom.backupRightLabel) {
      s.rightLabel = s.custom.backupRightLabel;
    } else {
      s.rightLabel = undefined;
    }

    if(enableIcon) {} // no-op until icons are implemented.
  }

  cd.classes.forEach(action);
  cd.bases.forEach(action);
  cd.whitelistClasses.forEach(action);
  cd.whitelistBases.forEach(action);
  for(var key in files.suggestions) {
    const sb: Completion.Suggestions = files.suggestions[key];
    sb.forEach(action);
  }
}

export function activate() {
  if(subscriptions) subscriptions.dispose();
  if(emitter) emitter.dispose();

  subscriptions = new CompositeDisposable;
  emitter = new Emitter;

  var itemData = processItemData();
  promise = itemData.then((id): ProcessedData => {
    updateWhitelists(id);
    updateDecorations(id.completion);
    return id;
  });

  const action = async (itemList: ItemDataLayout, event: { oldValue: boolean,
      newValue: boolean }) => {
    if(event.newValue) {
      const id = await itemData;
      mergeItemData(id, itemList);
    } else {
      itemData = processItemData();
      promise = itemData;
    }
    emitter.emit("poe-did-update-item-data");
  };

  subscriptions.add(settings.config.dataSettings.enableLeague.onDidChange((event) => {
    action(files.items.league, event);
  }));

  subscriptions.add(settings.config.dataSettings.enableLegacy.onDidChange((event) => {
    action(files.items.legacy, event);
  }));

  subscriptions.add(settings.config.dataSettings.enableRecipe.onDidChange((event) => {
    action(files.items.recipe, event);
  }));

  subscriptions.add(settings.config.completionSettings.enableRightLabel.onDidChange(async (event) => {
    const newData = await promise;
    updateDecorations(newData.completion);
  }));

  subscriptions.add(settings.config.completionSettings.enableIcon.onDidChange(async (event) => {
    const newData = await promise;
    updateDecorations(newData.completion);
  }));

  subscriptions.add(settings.config.dataSettings.classWhitelist.onDidChange(async (event) => {
    const id = await itemData;
    updateWhitelists(id);
    emitter.emit("poe-did-update-injected-data");
  }));

  subscriptions.add(settings.config.dataSettings.baseWhitelist.onDidChange(async (event) => {
    const id = await itemData;
    updateWhitelists(id);
    emitter.emit("poe-did-update-injected-data");
  }));
}

export function deactivate() {
  subscriptions.dispose();
  emitter.dispose();
}
