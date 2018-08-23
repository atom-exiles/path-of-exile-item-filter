"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const completion_provider_1 = require("./completion-provider");
const decoration_manager_1 = require("./decoration-manager");
const editor_registry_1 = require("./editor-registry");
const filter_manager_1 = require("./filter-manager");
const linter_provider_1 = require("./linter-provider");
const suggestion_data_1 = require("./suggestion-data");
const validation_data_1 = require("./validation-data");
function adjustGrammarDefaults() {
    const grammar = atom.grammars.grammarForScopeName("source.filter");
    if (grammar) {
        grammar.maxLineLength = 5000;
        grammar.maxTokensPerLine = 300;
    }
}
class AtomPackage {
    constructor() {
        this.autocompleteStubs = {
            onDidInsertSuggestion: () => undefined,
            getSuggestions: () => [],
            dispose: () => undefined,
        };
        this.consumeLinter = register => {
            const linterDelegate = register({ name: "path-of-exile-item-filter" });
            if (this.linterProvider)
                this.linterProvider.setLinter(linterDelegate);
        };
        this.autocompleteProvider = {
            selector: ".source.filter",
            disableForSelector: ".source.filter .comment",
            inclusionPriority: 1,
            excludeLowerPriority: true,
            getSuggestions: this.autocompleteStubs.getSuggestions,
            onDidInsertSuggestion: this.autocompleteStubs.onDidInsertSuggestion,
            dispose: this.autocompleteStubs.dispose,
        };
    }
    activate(_) {
        return __awaiter(this, void 0, void 0, function* () {
            adjustGrammarDefaults();
            this.subscriptions = new atom_1.CompositeDisposable();
            const validationData = new validation_data_1.ValidationData();
            const suggestionData = new suggestion_data_1.SuggestionData();
            const completionProvider = new completion_provider_1.CompletionProvider(suggestionData.data);
            const editorRegistry = new editor_registry_1.EditorRegistry();
            const filterManager = new filter_manager_1.FilterManager(validationData, editorRegistry);
            this.linterProvider = new linter_provider_1.LinterProvider(filterManager);
            const decorationManager = new decoration_manager_1.DecorationManager(filterManager);
            this.autocompleteProvider.getSuggestions = completionProvider.getSuggestions
                .bind(completionProvider);
            this.autocompleteProvider.onDidInsertSuggestion = completionProvider
                .onDidInsertSuggestion.bind(completionProvider);
            this.autocompleteProvider.dispose = completionProvider.dispose.bind(completionProvider);
            this.subscriptions.add(validationData, suggestionData, completionProvider, editorRegistry, filterManager, decorationManager);
            const packages = atom.packages.getAvailablePackageNames();
            if (!(packages.includes("atom-ide-ui") || packages.includes("linter"))) {
                const deps = yield Promise.resolve().then(() => require("atom-package-deps"));
                yield deps.install("path-of-exile-item-filter", true);
            }
        });
    }
    deactivate() {
        if (this.subscriptions)
            this.subscriptions.dispose();
        if (this.linterProvider)
            this.linterProvider.dispose();
        this.autocompleteProvider.getSuggestions = this.autocompleteStubs.getSuggestions;
        this.autocompleteProvider.onDidInsertSuggestion = this.autocompleteStubs.onDidInsertSuggestion;
        this.autocompleteProvider.dispose = this.autocompleteStubs.dispose;
    }
    serialize() {
        return {};
    }
    provideCompletion() {
        return [this.autocompleteProvider];
    }
}
exports.AtomPackage = AtomPackage;
