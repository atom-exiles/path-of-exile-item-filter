import * as jsonData from "./json-data";
import * as filterData from "./filter-manager";
import * as sound from "./sound";
import * as completion from "./completion";
import * as linter from "./linter";
import * as decorations from "./gutter-decorations";

export const config = require("../data/config.json");
const packageName = require("../package.json").name
var linterDelegate: Linter.IndieDelegate;

function readyToActivate() {
  jsonData.activate();
  filterData.activate();
  sound.activate();
  completion.activate();
  linter.activate(linterDelegate);
  decorations.activate();
}

export function activate() {
  require("atom-package-deps")
  .install(packageName)
  .then(readyToActivate);
}

export function deactivate() {
  decorations.deactivate();
  linter.deactivate();
  completion.deactivate();
  sound.deactivate();
  filterData.deactivate();
  jsonData.deactivate();
}

export function provideCompletion() {
  return [completion.provider];
}

export function consumeLinter(register: Linter.IndieRegister): void {
  linterDelegate = register({ name: packageName });
}
