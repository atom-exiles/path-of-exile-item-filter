"use strict";
var atom_1 = require("atom");
var settings = require("./settings");
var coreData = require("../data/items/core.json");
var leagueData = require("../data/items/league.json");
var legacyData = require("../data/items/legacy.json");
var recipeData = require("../data/items/recipes.json");
var subscriptions;
var previousSettings = {};
exports.itemData = new Map();
exports.injectedBases = new Array();
exports.injectedClasses = new Array();
function mergeJSONItemData(list) {
    for (var key in list) {
        var entries = list[key];
        if (exports.itemData.has(key)) {
            var previousEntries = exports.itemData.get(key);
            if (previousEntries)
                exports.itemData.set(key, previousEntries.concat(entries));
            else
                exports.itemData.set(key, entries);
        }
        else {
            exports.itemData.set(key, entries);
        }
    }
}
function refreshItemData() {
    console.log("PoE Status: completely refreshing item data.");
    exports.itemData.clear();
    mergeJSONItemData(coreData);
    if (settings.config.dataSettings.enableLeague.get())
        mergeJSONItemData(leagueData);
    if (settings.config.dataSettings.enableLegacy.get())
        mergeJSONItemData(legacyData);
    if (settings.config.dataSettings.enableRecipe.get())
        mergeJSONItemData(recipeData);
    exports.emitter.emit("poe-did-update-item-data", exports.itemData);
}
function setupSubscriptions() {
    if (subscriptions)
        subscriptions.dispose();
    if (exports.emitter)
        exports.emitter.dispose();
    subscriptions = new atom_1.CompositeDisposable;
    exports.emitter = new atom_1.Emitter;
    refreshItemData();
    subscriptions.add(settings.config.dataSettings.enableLeague.observe(function () {
        var newValue = settings.config.dataSettings.enableLeague.get();
        if (previousSettings.enableLeague == undefined) { }
        else if (!(previousSettings.enableLeague && newValue))
            refreshItemData();
        previousSettings.enableLeague = newValue;
    }));
    subscriptions.add(settings.config.dataSettings.enableLegacy.observe(function () {
        var newValue = settings.config.dataSettings.enableLegacy.get();
        if (previousSettings.enableLegacy == undefined) { }
        else if (!(previousSettings.enableLegacy && newValue))
            refreshItemData();
        previousSettings.enableLegacy = newValue;
    }));
    subscriptions.add(settings.config.dataSettings.enableRecipe.observe(function () {
        var newValue = settings.config.dataSettings.enableRecipe.get();
        if (previousSettings.enableRecipe == undefined) { }
        else if (!(previousSettings.enableRecipe && newValue))
            refreshItemData();
        previousSettings.enableRecipe = newValue;
    }));
    subscriptions.add(settings.config.dataSettings.classWhitelist.observe(function () {
        exports.injectedClasses = settings.config.dataSettings.classWhitelist.get();
        exports.emitter.emit('poe-did-update-injected-classes', exports.injectedClasses);
    }));
    subscriptions.add(settings.config.dataSettings.baseWhitelist.observe(function () {
        exports.injectedBases = settings.config.dataSettings.baseWhitelist.get();
        exports.emitter.emit('poe-did-update-injected-bases', exports.injectedBases);
    }));
}
exports.setupSubscriptions = setupSubscriptions;
function removeSubscriptions() {
    exports.itemData.clear();
    subscriptions.dispose();
    exports.emitter.dispose();
}
exports.removeSubscriptions = removeSubscriptions;
