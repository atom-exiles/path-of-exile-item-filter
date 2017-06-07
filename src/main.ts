import { CompositeDisposable } from "atom";

import ConfigManager from "./config-manager";
import JSONData from "./json-data";
import SuggestionData from "./suggestion-data";
import CompletionProvider from "./completion-provider";
import SoundPlayer from "./sound-player";
import ValidationData from "./validation-data";
import EditorRegistry from "./editor-registry";
import FilterManager from "./filter-manager";
import DecorationManager  from "./decoration-manager";
import LinterProvider from "./linter-provider";

export const config = require("../data/config.json");
const packageName = require("../package.json").name;
var subscriptions: CompositeDisposable;
var completionProvider: Autocomplete.Provider;
var linterDelegate: Linter.IndieDelegate;

interface PackageState {}

// Anything that depends on another Atom package is optional. The user will
// be prompted by 'atom-package-deps' to install any missing packages. The user
// may choose to either ignore or forever dismiss the prompt.
function readyToActivate(config: ConfigManager, manager: FilterManager) {
  const linterProvider = new LinterProvider(config, manager, linterDelegate);
  subscriptions.add(linterProvider);
}

export function activate(state: PackageState) {
  subscriptions = new CompositeDisposable;

  const configManager = new ConfigManager(packageName);
  subscriptions.add(configManager);

  const jsonData = new JSONData(configManager);
  subscriptions.add(jsonData);

  const suggestionData = new SuggestionData(configManager, jsonData);
  subscriptions.add(suggestionData);

  const completion = new CompletionProvider(configManager, suggestionData);
  subscriptions.add(completion);
  completionProvider = completion;

  const validationData = new ValidationData(configManager, jsonData);
  subscriptions.add(validationData);

  const editorRegistry = new EditorRegistry(configManager, packageName);
  subscriptions.add(editorRegistry);

  const filterManager = new FilterManager(configManager, validationData, editorRegistry);
  subscriptions.add(filterManager);

  const soundPlayer = new SoundPlayer();
  subscriptions.add(soundPlayer);

  const decorationManager = new DecorationManager(filterManager, soundPlayer, packageName);
  subscriptions.add(decorationManager);

  require('atom-package-deps')
    .install(packageName)
    .then(() => {
      readyToActivate(configManager, filterManager);
    });
}

export function deactivate() {
  if(linterDelegate) linterDelegate.dispose();
  subscriptions.dispose();
  return {};
}

export function provideCompletion(): [Autocomplete.Provider] {
  return [completionProvider];
}

export function consumeLinter(register: (config: Linter.Config) => Linter.IndieDelegate) {
  linterDelegate = register({ name: packageName });
}
