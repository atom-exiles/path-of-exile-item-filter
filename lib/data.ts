/** Manages the JSON data, exporting the relevant data based on the package
 *  configuration. Changes to the configuration will result in the data being
 *  updated in place, with events being emitted for modules where this isn't
 *  adequate. */
import { Emitter, CompositeDisposable } from "atom";

import * as settings from "./settings";

interface JSONItemData {
  [index: string]: Array<string>
}

interface DataConfigValues {
  enableLeague?: boolean
  enableLegacy?: boolean
  enableRecipe?: boolean
}

const coreData: JSONItemData = require("../data/items/core.json");
const leagueData: JSONItemData = require("../data/items/league.json");
const legacyData: JSONItemData = require("../data/items/legacy.json");
const recipeData: JSONItemData = require("../data/items/recipes.json");

export var emitter: Emitter;
var subscriptions: CompositeDisposable;

const previousSettings: DataConfigValues = {};

export const itemData = new Map<string, string[]>();
export var injectedBases = new Array<string>();
export var injectedClasses = new Array<string>();

function mergeJSONItemData(list: JSONItemData) {
  for(var key in list) {
    const entries = list[key];
    if(itemData.has(key)) {
      const previousEntries = itemData.get(key);
      if(previousEntries) itemData.set(key, previousEntries.concat(entries));
      else itemData.set(key, entries);
    } else {
      itemData.set(key, entries);
    }
  }
}

function refreshItemData() {
  itemData.clear();
  mergeJSONItemData(coreData);
  if(settings.config.dataSettings.enableLeague.get()) mergeJSONItemData(leagueData);
  if(settings.config.dataSettings.enableLegacy.get()) mergeJSONItemData(legacyData);
  if(settings.config.dataSettings.enableRecipe.get()) mergeJSONItemData(recipeData);
  emitter.emit("poe-did-update-item-data", itemData);
}

export function setupSubscriptions() {
  if(subscriptions) subscriptions.dispose();
  if(emitter) emitter.dispose();

  subscriptions = new CompositeDisposable;
  emitter = new Emitter;
  refreshItemData();

  subscriptions.add(settings.config.dataSettings.enableLeague.observe(
      () => {
    const newValue = settings.config.dataSettings.enableLeague.get();

    if(previousSettings.enableLeague == undefined) {} // no-op on first pass
    else if(!(previousSettings.enableLeague && newValue)) refreshItemData();
    previousSettings.enableLeague = newValue;
  }));

  subscriptions.add(settings.config.dataSettings.enableLegacy.observe(
      () => {
    const newValue = settings.config.dataSettings.enableLegacy.get();

    if(previousSettings.enableLegacy == undefined) {} // no-op
    else if(!(previousSettings.enableLegacy && newValue)) refreshItemData();
    previousSettings.enableLegacy = newValue;
  }));

  subscriptions.add(settings.config.dataSettings.enableRecipe.observe(
      () => {
    const newValue = settings.config.dataSettings.enableRecipe.get();

    if(previousSettings.enableRecipe == undefined) {} // no-op
    else if(!(previousSettings.enableRecipe && newValue)) refreshItemData();
    previousSettings.enableRecipe = newValue;
  }));

  subscriptions.add(settings.config.dataSettings.classWhitelist.observe(
      () => {
    injectedClasses = settings.config.dataSettings.classWhitelist.get();
    emitter.emit('poe-did-update-injected-data', injectedClasses);
  }));

  subscriptions.add(settings.config.dataSettings.baseWhitelist.observe(
      () => {
    injectedBases = settings.config.dataSettings.baseWhitelist.get();
    emitter.emit('poe-did-update-injected-data', injectedBases);
  }));
}

export function removeSubscriptions() {
  itemData.clear();
  subscriptions.dispose();
  emitter.dispose();
}
