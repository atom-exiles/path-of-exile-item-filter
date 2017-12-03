import { CompositeDisposable } from "atom";
import { AutocompleteProvider } from "atom-autocomplete";
import { LinterConsumer, LinterDelegate } from "atom-linter";

import { CompletionProvider } from "./completion-provider";
// import {} from "./decoration-manager";
// import {} from "./editor-registry";
// import {} from "./filter-manager";
// import {} from "./sound-player";
import { SuggestionData } from "./suggestion-data";
import { ValidationData } from "./validation-data";

interface PackageState {}

function getSuggestionsStub() {
  return [];
}

function onDidInsertSuggestionStub() {
  return;
}

export class AtomPackage {
  private subscriptions: CompositeDisposable;
  private linterDelegate: LinterDelegate;
  private autocompleteProvider: AutocompleteProvider;

  constructor() {
    this.autocompleteProvider = {
      selector: ".source.filter",
      disableForSelector: ".source.filter .comment",
      inclusionPriority: 1,
      excludeLowerPriority: true,
      getSuggestions: getSuggestionsStub,
      onDidInsertSuggestion: onDidInsertSuggestionStub,
      dispose: () => undefined,
    };
  }

  activate(_: PackageState) {
    this.subscriptions = new CompositeDisposable();
    const validationData = new ValidationData();
    const suggestionData = new SuggestionData();
    const completionProvider = new CompletionProvider(suggestionData.data);

    this.autocompleteProvider.getSuggestions = completionProvider.getSuggestions
        .bind(completionProvider);
    this.autocompleteProvider.onDidInsertSuggestion = completionProvider
        .onDidInsertSuggestion.bind(completionProvider);

    this.subscriptions.add(
      validationData,
      suggestionData,
      completionProvider
    );
  }

  deactivate() {
    this.subscriptions.dispose();
    if (this.linterDelegate) this.linterDelegate.dispose();

    this.autocompleteProvider.getSuggestions = getSuggestionsStub;
    this.autocompleteProvider.onDidInsertSuggestion = onDidInsertSuggestionStub;
  }

  serialize(): PackageState {
    return {};
  }

  provideCompletion() {
    return [this.autocompleteProvider];
  }

  consumeLinter: LinterConsumer = register => {
    this.linterDelegate = register({ name: "path-of-exile-item-filter" });
  }
}
