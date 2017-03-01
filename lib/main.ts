import * as data from "./data";
import * as filterData from "./filter-data";
import * as sound from "./sound";
import * as completion from "./completion";
import * as linter from "./linter";
import * as decorations from "./gutter-decorations";

export const config = require("../data/config.json");
const packageName = require("../package.json").name
var linterRegister: Linter.Register;

function readyToActivate() {
  data.activate();
  filterData.activate();
  sound.activate();
  completion.activate();
  linter.activate(linterRegister);
  decorations.activate();
}

export function activate() {
  require("atom-package-deps")
  .install(packageName)
  .then(readyToActivate);
}

export function deactivate() {
  decorations.deactivate();
  linterRegister.deleteMessages();
  linter.deactivate();
  completion.deactivate();
  sound.deactivate();
  filterData.deactivate();
  data.deactivate();
}

export function provideCompletion() {
  return [completion.provider];
}

export function consumeLinter(registry: Linter.Registry): void {
  const register = registry.register({ name: packageName });
  linterRegister = register;
}
