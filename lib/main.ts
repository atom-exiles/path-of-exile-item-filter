import { Emitter, CompositeDisposable, Range } from "atom";

import * as data from "./data";
import * as completion from "./completion";

export const config = require('../data/config.json');
const packageName = require('../package.json').name

function readyToActivate() {
  data.setupSubscriptions();
  completion.setupSubscriptions();
}

export function activate() {
  require("atom-package-deps")
  .install(packageName)
  .then(readyToActivate);
}

export function deactivate() {
  completion.removeSubscriptions();
  data.removeSubscriptions();
}

export function provideCompletion() {
  return [completion.provider];
}
