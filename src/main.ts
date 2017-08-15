import { CompositeDisposable } from "atom";

export const config = require("../data/config.json");
const packageName = require("../package.json").name;
var subscriptions: CompositeDisposable;
var linterDelegate: Linter.IndieDelegate;

// We provide Autocomplete with stubbed out functions, which will be replaced
// once we're actually ready to provide completion results.
var completionProvider: Autocomplete.Provider = {
  selector: ".source.filter",
  disableForSelector: ".source.filter .comment",
  inclusionPriority: 1,
  excludeLowerPriority: true,
  getSuggestions: (): any => { return []; },
  onDidInsertSuggestion: () => void {},
  dispose: () => void {}
}

interface PackageState {}

// Anything that depends on another Atom package is optional. The user will
// be prompted by 'atom-package-deps' to install any missing packages. The user
// may choose to either ignore or forever dismiss the prompt.
async function readyToActivate(configManager: any, filterManager: any) {
  const LPM = await import("./linter-provider");
  const linterProvider = new LPM.LinterProvider(configManager, filterManager, linterDelegate);
  subscriptions.add(linterProvider);
}

export async function activate(state: PackageState) {
  subscriptions = new CompositeDisposable;

  const CMM = await import("./config-manager");
  const configManager = new CMM.ConfigManager(packageName);
  subscriptions.add(configManager);

  const JDM = await import("./json-data");
  const jsonData = new JDM.JSONData();
  subscriptions.add(jsonData);

  const SDM = await import("./suggestion-data");
  const suggestionData = new SDM.SuggestionData(configManager, jsonData);
  subscriptions.add(suggestionData);

  const CPM = await import("./completion-provider");
  const completion = new CPM.CompletionProvider(configManager, suggestionData);
  subscriptions.add(completion);

  // Overwrite the previously stubbed functions.
  completionProvider.getSuggestions = (args) => {
    return completion.getSuggestions(args);
  };
  completionProvider.onDidInsertSuggestion = (args) => {
    return completion.onDidInsertSuggestion(args);
  };
  completionProvider.dispose = () => {
    return completion.dispose();
  };

  const VDM = await import("./validation-data");
  const validationData = new VDM.ValidationData(configManager, jsonData);
  subscriptions.add(validationData);

  const ERM = await import("./editor-registry");
  const editorRegistry = new ERM.EditorRegistry(configManager, packageName);
  subscriptions.add(editorRegistry);

  const FMM = await import("./filter-manager");
  const filterManager = new FMM.FilterManager(configManager, validationData, editorRegistry);
  subscriptions.add(filterManager);

  const SPM = await import("./sound-player");
  const soundPlayer = new SPM.SoundPlayer(jsonData);
  subscriptions.add(soundPlayer);

  const DMM = await import("./decoration-manager");
  const decorationManager = new DMM.DecorationManager(filterManager, soundPlayer, packageName);
  subscriptions.add(decorationManager);

  const packageDeps = await import("atom-package-deps");
  packageDeps.install(packageName).then(() => {
    readyToActivate(configManager, filterManager);
  });
}

export function deactivate(): PackageState {
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
