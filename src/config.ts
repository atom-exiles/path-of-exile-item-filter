// Simplified access to each of our configuration values.

import * as assert from "assert";

/** Represents a single configuration variable within Atom. */
class ConfigValue<T> {
  private readonly accessKey: string;

  constructor(key: string) {
    this.accessKey = `path-of-exile-item-filter.${key}`;
  }

  /** The current value of the configuration variable. */
  get value(): T {
    const value = <T> atom.config.get(this.accessKey);
    assert(value !== undefined, "expected all configuration values to be defined");
    return value;
  }
  set value(value: T) {
    atom.config.set(this.accessKey, value);
  }

  /** Restore the configuration variable to its default value. */
  unset() {
    atom.config.unset(this.accessKey);
  }

  /**
   * Invoke the given callback with the current value and any future values for the
   * configuration variable.
   */
  observe(callback: (value: T) => void) {
    return atom.config.observe(this.accessKey, callback);
  }

  /** Invoke the given callback whenever the configuration value has changed. */
  onDidChange(callback: (values: { newValue: T, oldValue?: T }) => void) {
    return atom.config.onDidChange(this.accessKey, callback);
  }
}

/** Whether or not we should display our gutter within the text editor. */
export const enableGutter = new ConfigValue<boolean>("enableGutter");

/** A list of item classes that the user wishes to inject into the dataset. */
export const classWhitelist = new ConfigValue<string[]>("classWhitelist");

/** A list of item bases that the user wishes to inject into the dataset. */
export const baseWhitelist = new ConfigValue<string[]>("baseWhitelist");
