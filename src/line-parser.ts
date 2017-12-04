import { Range } from "./item-filter";

const numberRegex = /^(\s*)([-0-9]+)(\s|$)/;
const wordRegex = /^(\s*)([A-Za-z\u00F6]+)(\s|$)/;
const stringRegex = /^(\s*)("[^"]*"|[^\s\"\'><=]+)(\s|$)/;
const commentRegex = /^(\s*)((#.*\S+)|(#\s*))(\s*)$/;
const operatorRegex = /^(\s*)(<=|>=|=|<|>){1}(\s+|$)/;
const booleanRegex = /^(\s*)("true"|true|"false"|false)(\s+|$)/i;

const quotationRegex = /^(")([^\"]*)(")$/;
const textRegex = /\S+/;
const eolRegex = /(\r|\n)/;
const surroundingWSRegex = /^(\s*)(.*\S)\s*$/;

/**
 * Manages access attempts to the result of a parse. Enforces the notion that a
 * value will always have a range.
 */
class ParseResult<T> {
  private _found: boolean;
  private _value: T;
  private _range: Range;

  constructor() {
    this._found = false;
  }

  get value() {
    if (this._found) {
      return this._value;
    } else {
      throw new Error("access violation for the value of a ParseResult");
    }
  }

  set value(v: T) {
    this._value = v;

    if (this._range !== null) {
      this._found = true;
    }
  }

  get range() {
    if (this._found) {
      return this._range;
    } else {
      throw new Error("access violation for the range of a ParseResult");
    }
  }

  set range(r: Range) {
    this._range = r;

    if (this._value !== null) {
      this._found = true;
    }
  }

  get found() {
    return this._found;
  }
}

/** Parses data from a single line of a Path of Exile filter. */
export class LineParser {
  private text: string;
  readonly originalLength: number;
  readonly row: number;
  readonly textStartIndex: number;
  readonly textEndIndex: number;
  currentIndex: number;
  empty: boolean;

  constructor(text: string, row: number) {
    if (eolRegex.test(text)) throw new Error("string spans multiple lines");

    this.text = text;
    this.row = row;
    this.currentIndex = 0;
    this.originalLength = text.length;

    if (textRegex.test(text)) {
      const surroundingResult = surroundingWSRegex.exec(text);
      if (!surroundingResult) throw new Error("unexpected RegExp result");

      this.textStartIndex = surroundingResult[1].length;
      this.textEndIndex = this.textStartIndex + surroundingResult[2].length;
      this.empty = false;
    } else {
      this.textStartIndex = 0;
      this.textEndIndex = 0;
      this.empty = true;
    }
  }

  /**
   * Returns whether or not the internal text value would be considered a
   * comment by Path of Exile.
   */
  isCommented() {
    const result = this.text.search(commentRegex);
    if (result === -1) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Returns whether or not the internal text string would be ignored entirely
   * by Path of Exile.
   */
  isIgnored() {
    if (this.empty || this.isCommented()) {
      return true;
    } else {
      return false;
    }
  }

  /** Parses a single value from the given line using the given Regular Expression. */
  parseSingleValue(regex: RegExp) {
    const result = new ParseResult<string>();

    const regexResult = regex.exec(this.text);
    if (!regexResult) return result;

    const leadingWS = regexResult[1];
    const value = regexResult[2];
    const shiftBy = leadingWS.length + value.length;
    result.value = value;
    result.range = {
      start: { row: this.row, column: this.currentIndex + leadingWS.length },
      end: { row: this.row, column: this.currentIndex + shiftBy },
    };

    this.text = this.text.substr(shiftBy);
    this.currentIndex += shiftBy;

    if (!textRegex.test(this.text)) {
      this.empty = true;
    }

    return result;
  }

  /** Parses a number if one is next on the line. */
  nextNumber() {
    const result = this.parseSingleValue(numberRegex);
    const output = new ParseResult<number>();

    if (result.found) {
      output.value = parseInt(result.value, 10);
      output.range = result.range;
    }

    return output;
  }

  /** Parses a boolean if one is next on the line. */
  nextBoolean() {
    // Booleans are case-insensitive, and may be surrounded by either single or
    // double quotation marks.
    const result = this.parseSingleValue(booleanRegex);
    const output = new ParseResult<boolean>();

    if (result.found) {
      output.value = result.value.toLowerCase().indexOf("true") === -1 ? false : true;
      output.range = result.range;
    }

    return output;
  }

  /** Parses an next operator if one is next on the line. */
  nextOperator() {
    return this.parseSingleValue(operatorRegex);
  }

  /**
   * Parses a word if one is next on the line.
   * A word is considered a string of letters from any langauge.
   */
  nextWord() {
    return this.parseSingleValue(wordRegex);
  }

  /**
   * Parses a string if one is next on the line.
   * Strings containing multiple words must be contained within double quotation marks.
   */
  nextString() {
    const result = this.parseSingleValue(stringRegex);

    // We store the value internally without quotation marks, so the regex only
    // captures whatever is enclosed by them.
    if (result.found && result.value) {
      const quotationResult = quotationRegex.exec(result.value);
      if (quotationResult) result.value = quotationResult[2];
    }
    return result;
  }

  /**
   * Parses a comment if one is next on the line.
   * A comment consumes the remainder of the line.
   */
  parseComment() {
    return this.parseSingleValue(commentRegex);
  }
}
