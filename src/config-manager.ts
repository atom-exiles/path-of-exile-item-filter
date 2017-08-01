import { Disposable } from "atom";

/** Represents a single configuration variable within Atom. */
class ConfigValue<T> {
  private readonly packageName: string;
  private readonly key: string;
  private subscription: Disposable;

  /** A Promise that resolves to the current value of the configuration variable.
   *  Atom may initialize configuration variables -after- it activates our package,
   *  which this promise is designed to workaround. */
  promise: Promise<T>;

  constructor(packageName: string, key: string) {
    this.packageName = packageName;
    this.key = key;

    this.promise = new Promise<T>((resolve, reject) => {
      let observed = false;
      this.subscription = this.observe((value) => {
        // Observe will feed us undefined values for whatever reason, then
        // emit a second time with the actual value.
        if(value != null && observed) {
          this.promise = Promise.resolve(value);
        } else if(value != null) {
          observed = true;
          resolve(value);
        } // else no-op
      });
    });
  }

  dispose() {
    this.subscription.dispose();
  }

  /** The current value of the configuration variable. */
  get value(): T|undefined {
    return atom.config.get(this.packageName + "." + this.key);
  }
  set value(value: T|undefined) {
    atom.config.set(this.packageName + "." + this.key, value);
  }

  /** Restore the configuration variable to its default value. */
  unset() {
    atom.config.unset(this.packageName + "." + this.key);
  }

  /** Invoke the given callback with the current value and any future values for the
   *  configuration variable. */
  observe(callback: (value: T) => void) {
    return atom.config.observe(this.packageName + "." + this.key, callback);
  }

  /** Invoke the given callback whenever the configuration value has changed. */
  onDidChange(callback: (values: { oldValue: T, newValue: T }) => void) {
    return atom.config.onDidChange(this.packageName + "." + this.key, callback);
  }
}

/** A wrapper for the Atom Config class. It simplifies usage, while also providing
 *  type declarations for our configuration variables. */
export default class ConfigManager {
  /** General settings for the package. */
  readonly general: {
    /** Whether or not the Completion provider should be active. */
    enableCompletion: ConfigValue<boolean>
    /** Whether or not the Linter provider should be active. */
    enableLinter: ConfigValue<boolean>
    /** Whether or not we should display our gutter within the text editor. */
    enableGutter: ConfigValue<boolean>
    /** The maximum number of lines to process at any given time. */
    chunkSize: ConfigValue<number>
  };
  /** Data settings for the package. */
  readonly data: {
    /** A list of item classes that the user wishes to inject into the dataset. */
    classWhitelist: ConfigValue<string[]>
    /** A list of item bases that the user wishes to inject into the dataset. */
    baseWhitelist: ConfigValue<string[]>
  };
  /** Settings specific to the Completion provider. */
  readonly completion: {
    /** Whether or not the Completion provider should provide extra suggestions. */
    enableExtraSuggestions: ConfigValue<boolean>
    /** Whether or not the right label should be displayed by the Completion provider. */
    enableRightLabel: ConfigValue<boolean>
  };
  /** Settings specific to the Linter provider. */
  readonly linter: {
    /** Whether or not the Linter provider should display warnings. */
    enableWarnings: ConfigValue<boolean>,
    enableInfo: ConfigValue<boolean>
  };

  constructor(packageName: string) {
    this.general = {
      enableCompletion: new ConfigValue<boolean>(packageName, "general.enableCompletion"),
      enableLinter: new ConfigValue<boolean>(packageName, "general.enableLinter"),
      enableGutter: new ConfigValue<boolean>(packageName, "general.enableGutter"),
      chunkSize: new ConfigValue<number>(packageName, "general.chunkSize")
    };
    this.data = {
      classWhitelist: new ConfigValue<string[]>(packageName, "data.classWhitelist"),
      baseWhitelist: new ConfigValue<string[]>(packageName, "data.baseWhitelist")
    };
    this.completion = {
      enableExtraSuggestions: new ConfigValue<boolean>(packageName, "completion.enableExtraSuggestions"),
      enableRightLabel: new ConfigValue<boolean>(packageName, "completion.enableRightLabel")
    };
    this.linter = {
      enableWarnings: new ConfigValue<boolean>(packageName, "linter.enableWarnings"),
      enableInfo: new ConfigValue<boolean>(packageName, "linter.enableInfo")
    };
  }

  /** Disposes of each ConfigValue instance within the given Object. */
  private groupDisposal(group: { [key: string]: ConfigValue<any> }) {
    for(var key in group) {
      group[key].dispose();
    }

    return;
  }

  /** Disposes of all active subscriptions for this ConfigManager instance. */
  dispose() {
    this.groupDisposal(this.general);
    this.groupDisposal(this.data);
    this.groupDisposal(this.completion);
    this.groupDisposal(this.linter);

    return;
  }
}
