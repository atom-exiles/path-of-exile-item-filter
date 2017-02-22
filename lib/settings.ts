import { Disposable } from "atom";

export const packageName = require("../package.json").name;
export const schema = require("../data/config.json");

// A simple class containing all operations you can perform on a configuration
// variable in Atom.
class SettingValue<T> {
  private readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  get(): T {
    return atom.config.get(packageName + "." + this.key);
  }

  set(value: T) {
    atom.config.set(packageName + "." + this.key, value);
  }

  unset() {
    atom.config.unset(packageName + "." + this.key);
  }

  observe(callback: (value: T) => void): Disposable {
    return atom.config.observe(packageName + "." + this.key, callback);
  }

  onDidChange(callback: (event: { oldValue: T, newValue: T }) => void):
      Disposable {
    return atom.config.onDidChange(packageName + "." + this.key, callback);
  }
}

export const config = {
  generalSettings: {
    enableCompletion: new SettingValue<boolean>("generalSettings.enableCompletion"),
    enableLinter: new SettingValue<boolean>("generalSettings.enableLinter")
  },

  dataSettings: {
    enableLeague: new SettingValue<boolean>("dataSettings.enableLeague"),
    enableLegacy: new SettingValue<boolean>("dataSettings.enableLegacy"),
    enableRecipe: new SettingValue<boolean>("dataSettings.enableRecipe"),
    classWhitelist: new SettingValue<Array<string>>("dataSettings.classWhitelist"),
    baseWhitelist: new SettingValue<Array<string>>("dataSettings.baseWhitelist")
  },

  completionSettings: {
    enableExtraSuggestions: new SettingValue<boolean>("completionSettings.enableExtraSuggestions"),
    enableRightLabel: new SettingValue<boolean>("completionSettings.enableRightLabel"),
    enableIcon: new SettingValue<boolean>("completionSettings.enableIcon")
  },

  linterSettings: {
    enableWarnings: new SettingValue<boolean>("linterSettings.enableWarnings"),
    method: new SettingValue<string>("linterSettings.method")
  }
}
