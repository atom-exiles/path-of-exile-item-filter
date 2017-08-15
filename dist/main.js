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
exports.config = require("../data/config.json");
const packageName = require("../package.json").name;
var subscriptions;
var linterDelegate;
const completionProvider = {
    selector: ".source.filter",
    disableForSelector: ".source.filter .comment",
    inclusionPriority: 1,
    excludeLowerPriority: true,
    getSuggestions: () => { return []; },
    onDidInsertSuggestion: () => void {},
    dispose: () => void {}
};
function readyToActivate(configManager, filterManager) {
    return __awaiter(this, void 0, void 0, function* () {
        const LPM = yield Promise.resolve().then(function () { return require("./linter-provider"); });
        const linterProvider = new LPM.LinterProvider(configManager, filterManager, linterDelegate);
        subscriptions.add(linterProvider);
    });
}
function activate(state) {
    return __awaiter(this, void 0, void 0, function* () {
        subscriptions = new atom_1.CompositeDisposable;
        const CMM = yield Promise.resolve().then(function () { return require("./config-manager"); });
        const configManager = new CMM.ConfigManager(packageName);
        subscriptions.add(configManager);
        const JDM = yield Promise.resolve().then(function () { return require("./json-data"); });
        const jsonData = new JDM.JSONData();
        subscriptions.add(jsonData);
        const SDM = yield Promise.resolve().then(function () { return require("./suggestion-data"); });
        const suggestionData = new SDM.SuggestionData(configManager, jsonData);
        subscriptions.add(suggestionData);
        const CPM = yield Promise.resolve().then(function () { return require("./completion-provider"); });
        const completion = new CPM.CompletionProvider(configManager, suggestionData);
        subscriptions.add(completion);
        completionProvider.getSuggestions = (args) => {
            return completion.getSuggestions(args);
        };
        completionProvider.onDidInsertSuggestion = (args) => {
            return completion.onDidInsertSuggestion(args);
        };
        completionProvider.dispose = () => {
            return completion.dispose();
        };
        const VDM = yield Promise.resolve().then(function () { return require("./validation-data"); });
        const validationData = new VDM.ValidationData(configManager, jsonData);
        subscriptions.add(validationData);
        const ERM = yield Promise.resolve().then(function () { return require("./editor-registry"); });
        const editorRegistry = new ERM.EditorRegistry(configManager, packageName);
        subscriptions.add(editorRegistry);
        const FMM = yield Promise.resolve().then(function () { return require("./filter-manager"); });
        const filterManager = new FMM.FilterManager(configManager, validationData, editorRegistry);
        subscriptions.add(filterManager);
        const SPM = yield Promise.resolve().then(function () { return require("./sound-player"); });
        const soundPlayer = new SPM.SoundPlayer(jsonData);
        subscriptions.add(soundPlayer);
        const DMM = yield Promise.resolve().then(function () { return require("./decoration-manager"); });
        const decorationManager = new DMM.DecorationManager(filterManager, soundPlayer, packageName);
        subscriptions.add(decorationManager);
        const packageDeps = yield Promise.resolve().then(function () { return require("atom-package-deps"); });
        packageDeps.install(packageName).then(() => {
            readyToActivate(configManager, filterManager);
        });
    });
}
exports.activate = activate;
function deactivate() {
    if (linterDelegate)
        linterDelegate.dispose();
    subscriptions.dispose();
    return {};
}
exports.deactivate = deactivate;
function provideCompletion() {
    return [completionProvider];
}
exports.provideCompletion = provideCompletion;
function consumeLinter(register) {
    linterDelegate = register({ name: packageName });
}
exports.consumeLinter = consumeLinter;
