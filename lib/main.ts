import { Emitter, CompositeDisposable, Range, TextEditor } from "atom";

import * as data from "./data";
import * as completion from "./completion";
import * as linter from "./linter";

export const config = require("../data/config.json");
const packageName = require("../package.json").name
var linterRegister: LinterRegister;

function readyToActivate() {
  data.setupSubscriptions();
  completion.setupSubscriptions();
  linter.setupSubscriptions(linterRegister);
}

export function activate() {
  require("atom-package-deps")
  .install(packageName)
  .then(readyToActivate);
}

export function deactivate() {
  linter.removeSubscriptions();
  completion.removeSubscriptions();
  data.removeSubscriptions();
}

export function provideCompletion() {
  return [completion.provider];
}

export function consumeLinter(registry: LinterRegistry): void {
  const register = registry.register({ name: packageName });
  linterRegister = register;
}
