import { CompositeDisposable } from "atom";
import { AutocompleteProvider } from "atom-autocomplete";
import { LinterConsumer } from "atom-linter";

import { CompletionProvider } from "./completion-provider";
// import {} from "./decoration-manager";
import { EditorRegistry } from "./editor-registry";
import { FilterManager } from "./filter-manager";
import { log } from "./helpers";
// import {} from "./sound-player";
import { LinterProvider } from "./linter-provider";
import { SuggestionData } from "./suggestion-data";
import { ValidationData } from "./validation-data";

interface PackageState {}

/**
 * Adjusts the grammar defaults to be more suitable for item filters.
 * It's not uncommon for item filters to have lines containing thousands of
 * characters with hundreds of tokens.
 */
function adjustGrammarDefaults() {
  const grammar = atom.grammars.grammarForScopeName("source.filter");
  if (grammar) {
    grammar.maxLineLength = 5000;
    grammar.maxTokensPerLine = 300;
  }
}

export class AtomPackage {
  private autocompleteProvider: AutocompleteProvider;
  private linterProvider: LinterProvider;
  private subscriptions: CompositeDisposable;
  private readonly autocompleteStubs = {
    onDidInsertSuggestion: () => undefined,
    getSuggestions: () => [],
    dispose: () => undefined,
  };

  constructor() {
    this.autocompleteProvider = {
      selector: ".source.filter",
      disableForSelector: ".source.filter .comment",
      inclusionPriority: 1,
      excludeLowerPriority: true,
      getSuggestions: this.autocompleteStubs.getSuggestions,
      onDidInsertSuggestion: this.autocompleteStubs.onDidInsertSuggestion,
      dispose: this.autocompleteStubs.dispose,
    };
    log("info", "package constructed");
  }

  async activate(_: PackageState) {
    log("info", "beginning package activation");
    adjustGrammarDefaults();

    this.subscriptions = new CompositeDisposable();
    const validationData = new ValidationData();
    const suggestionData = new SuggestionData();
    const completionProvider = new CompletionProvider(suggestionData.data);
    const editorRegistry = new EditorRegistry();
    const filterManager = new FilterManager(validationData, editorRegistry);
    this.linterProvider = new LinterProvider(filterManager);

    // tslint:disable:no-unsafe-any
    this.autocompleteProvider.getSuggestions = completionProvider.getSuggestions
        .bind(completionProvider);
    this.autocompleteProvider.onDidInsertSuggestion = completionProvider
        .onDidInsertSuggestion.bind(completionProvider);
    this.autocompleteProvider.dispose = completionProvider.dispose.bind(completionProvider);
    // tslint:enable:no-unsafe-any

    this.subscriptions.add(
      validationData,
      suggestionData,
      completionProvider,
      editorRegistry,
      filterManager
    );

    const packages = atom.packages.getAvailablePackageNames();
    if (!(packages.includes("atom-ide-ui") || packages.includes("linter"))) {
      log("info", "using package deps to install AtomIDE");
      const deps = await import("atom-package-deps");
      await deps.install("path-of-exile-item-filter", true);
    }
    log("info", "successfully activated the package");
  }

  deactivate() {
    log("info", "beginning package deactivation");
    this.subscriptions.dispose();
    this.linterProvider.dispose();

    this.autocompleteProvider.getSuggestions = this.autocompleteStubs.getSuggestions;
    this.autocompleteProvider.onDidInsertSuggestion = this.autocompleteStubs.onDidInsertSuggestion;
    this.autocompleteProvider.dispose = this.autocompleteStubs.dispose;
    log("info", "successfully deactivated the package");
  }

  serialize(): PackageState {
    return {};
  }

  provideCompletion() {
    log("info", "providing the Autocomplete service");
    return [this.autocompleteProvider];
  }

  consumeLinter: LinterConsumer = register => {
    log("info", "registering with the linter service");
    const linterDelegate = register({ name: "path-of-exile-item-filter" });
    this.linterProvider.setLinter(linterDelegate);
  }
}
