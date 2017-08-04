"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const config_manager_1 = require("./config-manager");
const json_data_1 = require("./json-data");
const suggestion_data_1 = require("./suggestion-data");
const completion_provider_1 = require("./completion-provider");
const sound_player_1 = require("./sound-player");
const validation_data_1 = require("./validation-data");
const editor_registry_1 = require("./editor-registry");
const filter_manager_1 = require("./filter-manager");
const decoration_manager_1 = require("./decoration-manager");
const linter_provider_1 = require("./linter-provider");
exports.config = require("../data/config.json");
const packageName = require("../package.json").name;
var subscriptions;
var completionProvider;
var linterDelegate;
function readyToActivate(config, manager) {
    const linterProvider = new linter_provider_1.default(config, manager, linterDelegate);
    subscriptions.add(linterProvider);
}
function activate(state) {
    subscriptions = new atom_1.CompositeDisposable;
    const configManager = new config_manager_1.default(packageName);
    subscriptions.add(configManager);
    const jsonData = new json_data_1.default(configManager);
    subscriptions.add(jsonData);
    const suggestionData = new suggestion_data_1.default(configManager, jsonData);
    subscriptions.add(suggestionData);
    const completion = new completion_provider_1.default(configManager, suggestionData);
    subscriptions.add(completion);
    completionProvider = completion;
    const validationData = new validation_data_1.default(configManager, jsonData);
    subscriptions.add(validationData);
    const editorRegistry = new editor_registry_1.default(configManager, packageName);
    subscriptions.add(editorRegistry);
    const filterManager = new filter_manager_1.default(configManager, validationData, editorRegistry);
    subscriptions.add(filterManager);
    const soundPlayer = new sound_player_1.default(jsonData);
    subscriptions.add(soundPlayer);
    const decorationManager = new decoration_manager_1.default(filterManager, soundPlayer, packageName);
    subscriptions.add(decorationManager);
    require('atom-package-deps')
        .install(packageName)
        .then(() => {
        readyToActivate(configManager, filterManager);
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
