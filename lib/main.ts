interface CompletionProvider {
  selector: string
  disableForSelector: string
  inclusionPriority: number
  excludeLowerPriority: boolean
  getSuggestions: (args: Completion.Params.SuggestionRequest) =>
      Completion.Suggestions|Promise<Completion.Suggestions>
  onDidInsertSuggestion: (args: Completion.Params.SuggestionInserted) => void
}

export const config = require("../data/config.json");
const packageName = require("../package.json").name;
var linterDelegate: Linter.IndieDelegate;
const deactivators: Function[] = [];

function readyToActivate() {
  // Only initialize modules once Atom itself has finished its initialization.
  const jsonData = require("./json-data");
  jsonData.activate();
  deactivators.push(jsonData.deactivate);

  const filterData = require("./filter-manager");
  filterData.activate();
  deactivators.push(filterData.deactivate);

  const sound = require("./sound");
  sound.activate();
  deactivators.push(sound.deactivate);

  const completion = require("./completion");
  completion.activate();
  deactivators.push(completion.deactivate);
  completionProvider.getSuggestions = completion.getSuggestions;
  completionProvider.onDidInsertSuggestion = completion.insertedSuggestion;

  const linter = require("./linter");
  linter.activate(linterDelegate);
  deactivators.push(linter.deactivate);

  const decorations = require("./gutter-decorations");
  decorations.activate();
  deactivators.push(linter.deactivate);
}

export function activate() {
  require("atom-package-deps")
  .install(packageName)
  .then(readyToActivate);
}

export function deactivate() {
  for(var i = deactivators.length - 1; i >= 0; i--) {
    deactivators[i]();
  }
}

// Provide stubs for the two callback functions, which will be replaced with the
// actual functions once package activation is fired.
const completionProvider: CompletionProvider = {
  selector: ".source.poe",
  disableForSelector: ".source.poe .comment",
  inclusionPriority: 1,
  excludeLowerPriority: true,
  getSuggestions: () => { return []; },
  onDidInsertSuggestion: () => { return; }
}

export function provideCompletion() {
  return [completionProvider];
}

export function consumeLinter(register: Linter.IndieRegister): void {
  linterDelegate = register({ name: packageName });
}
