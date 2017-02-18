import { Emitter, CompositeDisposable, Range } from "atom";

import * as path from "path";

import * as data from "./data";

const config = require('../data/config.json');
const packageName = require('../package.json').name

interface PackageState {
}

class Main {
  config = config;
  emitter: Emitter;
  subscriptions: CompositeDisposable;
  packageName: string;

  // linterRegister: Filter.LinterRegister;

  readyToActivate = () => {
    data.setupSubscriptions();
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.packageName = packageName;
  }

  activate() {
    require("atom-package-deps")
    .install(packageName)
    .then(this.readyToActivate);
  }

  deactivate() {
    this.subscriptions.dispose();
    this.emitter.dispose();
    data.removeSubscriptions();
  }

  // provideCompletion = require("./completion");

  // consumeLinter(registry: Filter.LinterRegistry): void {
  //   const register = registry.register({ name: this.packageName });
  //   this.linterRegister = register;
  // }
}

var main = new Main()
export = main
