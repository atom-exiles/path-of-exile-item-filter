import { Range } from "atom";
import * as assert from "assert";

import * as settings from "./settings";

interface ParseResult<T> {
  value?: T
  startIndex: number
  endIndex: number
  found: boolean
}

interface ProcessResult {
  messages: Linter.Message[]
  invalid: boolean
  operator?: Filter.Operator
  values: Filter.Value[]
  trailingComment?: Filter.Comment
}

interface LineInfo {
  editor: AtomCore.TextEditor
  number: number
  file?: string
  keyword: string
}

/** Parses data from a single line of a Path of Exile filter. */
export class LineParser {
  currentIndex: number;
  textStartIndex: number;
  textEndIndex: number;
  originalLength: number;

  empty: boolean;

  text: string;

  private readonly numberRegex = /^(\s*)([-0-9]+)(\s|$)/;
  private readonly wordRegex = /^(\s*)([A-Za-z\u00F6]+)(\s|$)/;
  private readonly stringRegex = /^(\s*)("[^"]*"|[^\s\"\'><=]+)(\s|$)/;
  private readonly eolRegex = /(\r|\n)/;
  private readonly commentRegex = /^(\s*)((#.*\S+)|(#\s*))(\s*)$/;
  private readonly textRegex = /\S+/;
  private readonly operatorRegex = /^(\s*)(<=|>=|=|<|>){1}(\s+|$)/;
  private readonly quotationRegex = /^(")([^\"]*)(")$/;
  private readonly booleanRegex = /^(\s*)("true"|true|"false"|false)(\s+|$)/i;
  private readonly colorHexRegex = /^(\s*)((#[A-F0-9]{8})|(#[A-F0-9]{6}))(\s|$)/i;
  private readonly surroundingWSRegex = /^(\s*)(.*\S)\s*$/;

  constructor(text: string) {
    assert(text != undefined, "fed undefined text");

    this.text = text;
    this.currentIndex = 0;
    this.originalLength = text.length;

    // Giving this parser string consisting of multiple lines is an outright
    // error.
    if(this.eolRegex.test(this.text))
    {
      throw new Error("LineParser given string containing multiple lines.");
    }

    if(this.textRegex.test(this.text)) {
      const surroundingResult = this.surroundingWSRegex.exec(this.text);

      var leadingWS: string = "";
      var payload: string = "";
      if(surroundingResult !== null) {
        if(surroundingResult.length >= 3) {
          leadingWS = surroundingResult[1];
          payload = surroundingResult[2];
        }
      }

      if(leadingWS) {
        this.textStartIndex = leadingWS.length;
      } else {
        this.textStartIndex = 0;
      }

      this.textEndIndex = this.textStartIndex + payload.length;
      this.empty = false;
    } else {
      this.textStartIndex = 0;
      this.textEndIndex = 0;
      this.empty = true;
    }
  }

  /** Returns whether or not the internal text value would be considered a
      comment by Path of Exile. */
  isCommented(): boolean {
    const result = this.text.search(this.commentRegex);
    if(result == -1) {
      return false;
    } else {
      return true;
    }
  }

  /** Returns whether or not the internal text string would be ignored entirely
      by Path of Exile. */
  isIgnored(): boolean {
    if(this.empty || this.isCommented()) {
      return true;
    } else {
      return false;
    }
  }

  /** Parses a single value from the given line using the given Regular
      Expression. */
  private parseSingleValue(regex: RegExp): ParseResult<string> {
    var result: ParseResult<string> = { found: false, startIndex: 0, endIndex: 0 };

    const regexResult = regex.exec(this.text);
    if(!regexResult) return result;

    var leadingWS = regexResult[1];
    if(!leadingWS) leadingWS = "";
    result.value = regexResult[2];
    result.found = true;
    const shiftBy = leadingWS.length + result.value.length;

    result.startIndex = this.currentIndex + leadingWS.length;
    result.endIndex = this.currentIndex + shiftBy;

    this.text = this.text.substr(shiftBy);
    this.currentIndex += shiftBy;

    if(!this.textRegex.test(this.text)) {
      this.empty = true;
    }

    return result;
  }

  /** Parses a number if one is next on the line. */
  nextNumber(): ParseResult<number> {
    const result = this.parseSingleValue(this.numberRegex);
    const output: ParseResult<number> = { found: result.found,
        startIndex: result.startIndex, endIndex: result.endIndex };

    if(result.found && result.value) {
      output.value = parseInt(result.value, 10);
    }

    return output;
  }

  /** Parses a boolean if one is next on the line. */
  nextBoolean(): ParseResult<boolean> {
    // Booleans are case-insensitive, and may be surrounded by either single or
    // double quotation marks.
    const result = this.parseSingleValue(this.booleanRegex);
    const output: ParseResult<boolean> = { found: result.found,
        startIndex: result.startIndex, endIndex: result.endIndex };

    if(result.found && result.value) {
      if(result.value.toLowerCase().indexOf("true") != -1) {
        output.value = true;
      } else {
        output.value = false;
      }
    }

    return output;
  }

  /** Parses an next operator if one is next on the line. */
  nextOperator(): ParseResult<string> {
    return this.parseSingleValue(this.operatorRegex);
  }

  /** Parses a word if one is next on the line.
      A word is considered a string of letters from any langauge. */
  nextWord(): ParseResult<string> {
    return this.parseSingleValue(this.wordRegex);
  }

  /** Parses a string if one is next on the line.
      Strings containing multiple words must be contained within double quotation marks. */
  nextString(): ParseResult<string> {
    var result = this.parseSingleValue(this.stringRegex);

    // We store the value internally without quotation marks, so the regex only
    // captures whatever is enclosed by them.
    if(result.found && result.value) {
      const quotationResult = this.quotationRegex.exec(result.value);
      if(quotationResult) result.value = quotationResult[2];
    }
    return result;
  }

  /** Parses a hexadecimal value if one is next on the line. */
  nextHex(): ParseResult<string> {
    return this.parseSingleValue(this.colorHexRegex);
  }

  /** Parses a comment if one is next on the line.
   *  A comment consumes the remainder of the line. */
  parseComment(): ParseResult<string> {
    return this.parseSingleValue(this.commentRegex);
  }
}

/** Processes an operator from the given line, returning an error message if
 * that operator isn't the equality operator. */
function expectEqualityOp(parser: LineParser, line: LineInfo):
    Linter.Message|undefined {
  var result: Linter.Message|undefined = undefined;

  var operator = parser.nextOperator();
  if(operator.found && operator.value != "=") {
    result = {
      location: {
        file: line.file,
        position: new Range([ line.number, operator.startIndex ],
            [ line.number, operator.endIndex ])
      },
      severity: "error",
      excerpt: "Invalid operator for \"" + line.keyword +
          "\". Only the '=' operator is supported for this rule.",
      description: "Path of Exile allows an operator to appear for most rule types, however for\n" +
          "some rules only the '=' operator is allowed. Any other operators will result in an error.",
      url: "http://pathofexile.gamepedia.com/Item_filter",
    };
  }

  return result;
}

/** Appends an error message to the given result if the remaining text is
 *  commented. */
function reportTrailingComment(parser: LineParser, line: LineInfo,
    result: ProcessResult) {
  if(parser.isCommented()) {
    const comment = parser.parseComment();
    result.messages.push({
      location: {
        file: line.file,
        position: new Range([line.number, comment.startIndex],
            [line.number, parser.originalLength])
      },
      severity: "error",
      excerpt: "A trailing comment for a \"" + line.keyword +
          "\" rule will result in an error.",
      description: "Path of Exile only allows for comments to trail the following rule types:" +
          "\n\n\tSetBorderColor\n\tSetTextColor\n\tSetBackgroundColor\n\tPlayAlertSound\n\n" +
          "Any other rule types with a trailing comment will result in an error.",
      url: "http://pathofexile.gamepedia.com/Item_filter"
    });
    result.invalid = true;
  }
}

/* Processes the PlayAlertSound rule, which has the following format:
 * PlayAlertSound <Id> [Volume] (1-9, 0-300) */
function processAlertSoundRule(parser: LineParser, line: LineInfo):
    ProcessResult {
  var result: ProcessResult = {
    messages: [],
    invalid: false,
    values: []
  };

  const operatorMessage = expectEqualityOp(parser, line);
  if(operatorMessage) {
    result.messages.push(operatorMessage);
    result.invalid = true;
    return result;
  }

  const retVal: ParseResult<number> = parser.nextNumber();
  if(!retVal.found || !retVal.value) {
    result.messages.push({
      location: {
        file: line.file,
        position: new Range([ line.number, parser.textStartIndex ],
            [ line.number, parser.originalLength ])
      },
      severity: "error",
      excerpt: "Invalid format. Expected \"" + line.keyword +
          " <Value> [Value]\".",
      url: "http://pathofexile.gamepedia.com/Item_filter#Actions"
    });
    result.invalid = true;
    return result;
  }

  const optVal: ParseResult<number> = parser.nextNumber();
  var outputText = "Invalid value for rule \"" + line.keyword + "\". Expected ";

  if(retVal.value < 1 || retVal.value > 9) {
    var outputRange = new Range([ line.number, retVal.startIndex ],
        [ line.number, retVal.endIndex ]);
    const text = outputText + "1-9.";

    result.messages.push({
      location: {
        file: line.file,
        position: outputRange
      },
      severity: "error",
      excerpt: text,
      url: "http://pathofexile.gamepedia.com/Item_filter#Actions"
    });
    result.invalid = true;
  }

  if(optVal.found && optVal.value != undefined && (optVal.value < 0 || optVal.value > 300)) {
    const text = outputText + "0-300.";
    var outputRange = new Range([ line.number, optVal.startIndex ],
        [ line.number, optVal.endIndex ]);
    result.messages.push({
      location: {
        file: line.file,
        position: outputRange
      },
      severity: "error",
      excerpt: text,
      url: "http://pathofexile.gamepedia.com/Item_filter#Actions"
    });
    result.invalid = true;
  }

  if(!result.invalid) {
    const value: Filter.Value = {
      value: retVal.value,
      range: new Range([line.number, retVal.startIndex], [line.number, retVal.endIndex])
    };
    result.values.push(value);
    if(optVal.found && optVal.value) {
      const optional: Filter.Value = {
        value: optVal.value,
        range: new Range([line.number, optVal.startIndex], [line.number, optVal.endIndex])
      };
      result.values.push(optional);
    }
  }

  if(parser.isCommented()) {
    const commentResult = parser.parseComment();
    if(commentResult.found && commentResult.value) {
      result.trailingComment = {
        text: commentResult.value,
        range: new Range([line.number, commentResult.startIndex],
            [line.number, commentResult.endIndex])
      };
    }
  }

  return result;
}

/** Processes filter rules that match the following format:
 *  <Rule> <Red> <Green> <Blue> [Alpha]
 * Each value being a number between 0 and 255. */
function processRGBARule(parser: LineParser, line: LineInfo):
    ProcessResult {
  var result: ProcessResult = {
    messages: [],
    invalid: false,
    values: []
  };

  const operatorMessage = expectEqualityOp(parser, line);
  if(operatorMessage) {
    result.messages.push(operatorMessage);
    result.invalid = true;
    return result;
  }

  // If we detect a hex value, then we can convert it to RGBA automatically.
  const hexResult = parser.nextHex();
  if(hexResult.found && hexResult.value) {
    const r = parseInt(hexResult.value.substr(1, 2), 16);
    const g = parseInt(hexResult.value.substr(3, 2), 16);
    const b = parseInt(hexResult.value.substr(5, 2), 16);

    var replacement: string = r + " " + g + " " + b;
    var replacementRange = new Range([line.number, hexResult.startIndex],
        [line.number, hexResult.endIndex]);
    if(hexResult.value.length == 9) {
      const a = parseInt(hexResult.value.substr(7, 2), 16);
      replacement = replacement + " " + a;
    }
    line.editor.setTextInBufferRange(replacementRange, replacement);

    // Adjust the old parser, as with the text insertion its indices have now
    // been invalidated.
    const adjustedLength = parser.originalLength - hexResult.value.length +
        replacement.length;
    const adjustedCurIndex = parser.currentIndex - hexResult.value.length;
    const adjustedEndIndex = parser.textEndIndex - hexResult.value.length +
        replacement.length;
    const newTextRange = new Range([line.number, adjustedCurIndex], [line.number,
        adjustedEndIndex]);

    parser.text = line.editor.getTextInBufferRange(newTextRange);
    parser.originalLength = adjustedLength;
    parser.currentIndex = adjustedCurIndex;
    parser.textEndIndex = adjustedEndIndex;
  }

  const red = parser.nextNumber();
  const green = parser.nextNumber();
  const blue = parser.nextNumber();
  const alpha = parser.nextNumber();
  if(!red.found || red.value == undefined || !green.found ||
      green.value == undefined || !blue.found || blue.value == undefined) {
    result.messages.push({
      location: {
        file: line.file,
        position: new Range([ line.number, parser.textStartIndex ],
            [ line.number, parser.originalLength ])
      },
      severity: "error",
      excerpt: "Invalid format. Expected \"" + line.keyword +
          " <Red> <Green> <Blue> [Alpha]\".",
      url: "http://pathofexile.gamepedia.com/Item_filter#Actions"
    });
    result.invalid = true;
    return result;
  }

  var partialMessage: Linter.Message = {
    location: {
      file: line.file,
      position: new Range([0, 0], [0, 0])
    },
    severity: "error",
    excerpt: "Invalid value for rule \"" + line.keyword + "\". Expected 0-255.",
    url: "http://pathofexile.gamepedia.com/Item_filter#Actions"
  };
  if(red.value < 0 || red.value > 255) {
    partialMessage.location.position = new Range([ line.number, red.startIndex],
        [ line.number, red.endIndex ]);
    result.messages.push(partialMessage);
    result.invalid = true;
  } else if(green.value < 0 || green.value > 255) {
    partialMessage.location.position = new Range([ line.number, green.startIndex],
        [ line.number, green.endIndex ]);
    result.messages.push(partialMessage);
    result.invalid = true;
  } else if(blue.value < 0 || blue.value > 255) {
    partialMessage.location.position = new Range([ line.number, blue.startIndex],
        [ line.number, blue.endIndex ]);
    result.messages.push(partialMessage);
    result.invalid = true;
  } else if(alpha.found && alpha.value && (alpha.value < 0 || alpha.value > 255)) {
    partialMessage.location.position = new Range([ line.number, alpha.startIndex],
        [ line.number, alpha.endIndex ]);
    result.messages.push(partialMessage);
    result.invalid = true;
  } else {
    const r: Filter.Value = {
      value: red.value,
      range: new Range([line.number, red.startIndex], [line.number, red.endIndex])
    };
    const g: Filter.Value = {
      value: green.value,
      range: new Range([line.number, green.startIndex], [line.number, green.endIndex])
    };
    const b: Filter.Value = {
      value: blue.value,
      range: new Range([line.number, blue.startIndex], [line.number, blue.endIndex])
    };
    result.values.push(r, g, b);
    if(alpha.found) {
      const a: Filter.Value = {
        value: alpha.value,
        range: new Range([line.number, alpha.startIndex], [line.number, alpha.endIndex])
      }
      result.values.push(a);
    }
  }

  if(parser.isCommented()) {
    const commentResult = parser.parseComment();
    if(commentResult.found && commentResult.value) {
      result.trailingComment = {
        text: commentResult.value,
        range: new Range([line.number, commentResult.startIndex],
            [line.number, commentResult.endIndex])
      };
    }
  }

  return result;
}

/* Processes filter rules that match the following format:
 * <Rule> [Operator] <Value, ...>
 * The value is expected to be one or more string, each of which will match
 * one of the expected values. */
function processMultiStringRule(parser: LineParser, line: LineInfo,
    expectedValues: string[], caseSensitive: boolean): ProcessResult {
  var result: ProcessResult = {
    messages: [],
    invalid: false,
    values: []
  };

  const operatorMessage = expectEqualityOp(parser, line);
  if(operatorMessage) {
    result.messages.push(operatorMessage);
    result.invalid = true;
    return result;
  }

  while(true) {
    const currentValue = parser.nextString();
    if(!currentValue.found && result.values.length == 0 && result.messages.length == 0) {
      result.messages.push({
        location: {
          file: line.file,
          position: new Range([ line.number, parser.textStartIndex ],
              [ line.number, parser.originalLength ])
        },
        severity: "error",
        excerpt: "Invalid format. Expected \"" + line.keyword + " <Text>...\".",
        description: "The '" + line.keyword + "' keyword should be followed by a list of words or strings.\n\n" +
            "Any value consisting of multiple words should be surrounded by double quotation marks.",
        url: "http://pathofexile.gamepedia.com/Item_filter#Conditions"
      });
      result.invalid = true;
      break;
    }

    if(!currentValue.found || !currentValue.value) break;

    var resultFound = false;
    for(var value of expectedValues) {
      if(caseSensitive) {
        if(value.includes(currentValue.value)) {
          resultFound = true;
        }
      } else {
        if(value.toUpperCase().includes(currentValue.value.toUpperCase())) {
          resultFound = true;
        }
      }

      if(resultFound) {
        const r = new Range([line.number, currentValue.startIndex],
            [line.number ,currentValue.endIndex]);
        const v: Filter.Value = { value: currentValue.value, range: r };
        result.values.push(v);
        break;
      }
    }
    if(!resultFound) {
      result.messages.push({
        location: {
          file: line.file,
          position: new Range([ line.number, currentValue.startIndex ],
              [ line.number, currentValue.endIndex ])
        },
        severity: "error",
        excerpt: "Invalid value for \"" + line.keyword + "\" rule.",
        url: "http://pathofexile.gamepedia.com/Item_filter#Conditions"
      });
      result.invalid = true;
    }
  }

  return result;
}

/** Processes the SocketGroup rule, which has the following format:
 *  SocketGroup <Group> (R,B,G,W...) */
function processSocketGroup(parser: LineParser, line: LineInfo):
    ProcessResult {
  var result: ProcessResult = {
    messages: [],
    invalid: false,
    values: []
  };

  const operatorMessage = expectEqualityOp(parser, line);
  if(operatorMessage) {
    result.messages.push(operatorMessage);
    result.invalid = true;
    return result;
  }

  var retVal = parser.nextString();
  if(!retVal.found || !retVal.value) {
    result.messages.push({
      location: {
        file: line.file,
        position: new Range([ line.number, parser.textStartIndex ],
            [ line.number, parser.originalLength ])
      },
      severity: "error",
      excerpt: "Invalid format. Expected \"" + line.keyword + " <Group>\".",
      url: "http://pathofexile.gamepedia.com/Item_filter#Conditions"
    });
    result.invalid = true;
  } else {
    const groupRegex: RegExp = new RegExp("^[rgbw]{1,6}$", "i");
    if(groupRegex.test(retVal.value)) {
      const value: Filter.Value = {
        value: retVal.value,
        range: new Range([line.number, retVal.startIndex],
            [line.number, retVal.endIndex])
      };
      result.values.push(value);
    } else {
      result.messages.push({
        location: {
          file: line.file,
          position: new Range([ line.number, retVal.startIndex ],
              [ line.number, retVal.endIndex ])
        },
        severity: "error",
        excerpt: "Invalid value for \"" + line.keyword +
            "\" rule. Valid characters are: R, B, G, W.",
        url: "http://pathofexile.gamepedia.com/Item_filter#Conditions"
      });
      result.invalid = true;
    }
  }
  return result;
}

/** Processes filter rules that match the following format:
 *  <Rule> [Operator] <Value>
 *  Where <Value> is expected to match one of the given values. */
function processOpNumberRule(parser: LineParser, line: LineInfo,
    values: number[]): ProcessResult {
  var result: ProcessResult = {
    messages: [],
    invalid: false,
    values: []
  }

  const operator: ParseResult<string> = parser.nextOperator();
  if(operator.found && operator.value) {
    const r = new Range([line.number, operator.startIndex],
        [line.number, operator.endIndex]);
    const op: Filter.Operator = { type: operator.value, range: r };
    result.operator = op;
  }

  const retVal = parser.nextNumber();
  if(!retVal.found || retVal.value == undefined) {
    result.messages.push({
      location: {
        file: line.file,
        position: new Range([ line.number, parser.textStartIndex ],
            [ line.number, parser.originalLength ])
      },
      severity: "error",
      excerpt: "Invalid format. Expected \"" + line.keyword +  " [Operator] <Number>\".",
      url: "http://pathofexile.gamepedia.com/Item_filter#Conditions"
    });
    result.invalid = true;
    return result;
  }

  if(values.indexOf(retVal.value) != -1) {
    const value: Filter.Value = {
      value: retVal.value,
      range: new Range([line.number, retVal.startIndex],
          [line.number, retVal.endIndex])
    };
    result.values.push(value);
  } else {
    result.messages.push({
      location: {
        file: line.file,
        position: new Range([ line.number, retVal.startIndex],
            [ line.number, retVal.endIndex ])
      },
      severity: "error",
      excerpt: "Invalid value for rule \"" + line.keyword + "\". Expected " +
          values.toString() + ".",
      url: "http://pathofexile.gamepedia.com/Item_filter#Conditions"
    });
    result.invalid = true;
  }

  reportTrailingComment(parser, line, result);
  return result;
}

/** Processes filter rules that match the following format:
 *  <Rule> [Operator] <String>
 * The string is an expected one, and will match one of the values in the
 * expectedValues parameter. */
function processStringRule(parser: LineParser, line: LineInfo,
    expectedValues: string[], caseSensitive: boolean): ProcessResult {
  var result: ProcessResult = {
    messages: [],
    invalid: false,
    values: []
  };

  // The game supports comparison operators for things like rarities. For
  // example, (Rare > Magic) -> True.
  var operator: ParseResult<string> = parser.nextOperator();
  if(operator.found && operator.value) {
    const op: Filter.Operator = {
      type: operator.value,
      range: new Range([line.number, operator.startIndex],
          [line.number, operator.endIndex])
    };
    result.operator = op;
  }

  const retVal = parser.nextString();
  if(!retVal.found) {
    result.messages.push({
      location: {
        file: line.file,
        position: new Range([ line.number, parser.textStartIndex ],
            [ line.number, parser.originalLength ])
      },
      severity: "error",
      excerpt: "Invalid format. Expected \"" + line.keyword +
          " [Operator] <Text>\".",
      url: "http://pathofexile.gamepedia.com/Item_filter#Conditions"
    });
    result.invalid = true;
    return result;
  }

  var matchFound: boolean = false;
  for(var s of expectedValues) {
    if(caseSensitive) {
      if(retVal.value == s) {
        matchFound = true;
      } else {
        continue;
      }
    } else {
      if(retVal.value && retVal.value.toLowerCase() == s.toLowerCase()) {
        matchFound = true;
      } else {
        continue;
      }
    }
  }

  if(matchFound && retVal.value) {
    const value: Filter.Value = {
      value: retVal.value,
      range: new Range([line.number, retVal.startIndex],
          [line.number, retVal.endIndex])
    };
    result.values.push(value);
  } else {
    var description = "The following values are valid for this rule:\n";
    expectedValues.forEach((value) => {
      description += "\n\t" + value;
    });

    result.messages.push({
      location: {
        file: line.file,
        position: new Range([ line.number, retVal.startIndex ],
            [ line.number, retVal.endIndex ])
      },
      severity: "error",
      excerpt: "Invalid value for \"" + line.keyword + "\" rule.",
      description,
      url: "http://pathofexile.gamepedia.com/Item_filter#Conditions"
    });
    result.invalid = true;
  }

  reportTrailingComment(parser, line, result);
  return result;
}

/** Processes filter rules that match the following format:
 *  <Rule> <Boolean> */
function processBooleanRule(parser: LineParser, line: LineInfo):
    ProcessResult {
  var result: ProcessResult = {
    messages: [],
    invalid: false,
    values: []
  };

  // Path of Exile allows booleans to have an operator, but I don't know the
  // actual impact of having anything except equals.
  const operatorMessage = expectEqualityOp(parser, line);
  if(operatorMessage) {
    result.messages.push(operatorMessage);
    result.invalid = true;
    return result;
  }

  var retVal: ParseResult<boolean> = parser.nextBoolean()
  if(!retVal.found) {
    result.messages.push({
      location: {
        file: line.file,
        position: new Range([ line.number, parser.textStartIndex ],
            [ line.number, parser.originalLength ])
      },
      severity: "error",
      excerpt: "Invalid format. Expected \"" + line.keyword + " <Boolean>\".",
      description: "A Boolean is a binary value that can be either 'True' or 'False'",
      url: "http://pathofexile.gamepedia.com/Item_filter#Conditions"
    });
    result.invalid = true;
  } else {
    const valueRange = new Range([line.number, retVal.startIndex],
      [line.number, retVal.endIndex]);
    const value: Filter.Value = {
      value: retVal.value,
      range: valueRange
    };
    result.values = [value];
  }

  reportTrailingComment(parser, line, result);
  return result;
}

/** Processes filter rules that match the following format:
 *  <Rule> [Operator] <Value>
 *  Where <Value> is expected to be a value between {min...max}. */
function processRangeRule(parser: LineParser, line: LineInfo,
    min: number, max: number, hasOperator = true): ProcessResult {
  var result: ProcessResult = {
    invalid: false,
    messages: [],
    values: []
  };

  const operator: ParseResult<string> = parser.nextOperator();
  if(hasOperator) {
    if(operator.found && operator.value) {
      result.operator = { type: operator.value, range: new Range([line.number,
          operator.startIndex], [line.number, operator.endIndex]) };
    }
  } else {
    if(operator.found) {
      result.messages.push({
        location: {
          file: line.file,
          position: new Range([line.number, operator.startIndex],
              [line.number, operator.endIndex])
        },
        severity: "error",
        excerpt: "An operator for a \"" + line.keyword + "\" rule is an error.",
        url: "http://pathofexile.gamepedia.com/Item_filter"
      });
      result.invalid = true;
    }
  }

  const retVal = parser.nextNumber();
  if(!retVal.found || retVal.value == undefined) {
    var partialMessageText = "Invalid format. Expected \"" + line.keyword;
    var messageText;
    if(hasOperator) {
      messageText = partialMessageText + " [Operator] <Number>\".";
    } else {
      messageText = partialMessageText + " <Number>\".";
    }

    result.messages.push({
      location: {
        file: line.file,
        position: new Range([line.number, parser.textStartIndex],
            [line.number, parser.originalLength])
      },
      severity: "error",
      excerpt: messageText,
      url: "http://pathofexile.gamepedia.com/Item_filter"
    });
    result.invalid = true;
  } else {
    if(retVal.value >= min && retVal.value <= max) {
      const r = new Range([line.number, retVal.startIndex],
          [line.number, retVal.endIndex]);
      const value: Filter.Value = { value: retVal.value, range: r };
      result.values = [value];
    } else {
      result.messages.push({
        location: {
          file: line.file,
          position: new Range([line.number, retVal.startIndex],
              [line.number, retVal.endIndex])
        },
        severity: "error",
        excerpt: "Invalid value for \"" + line.keyword + "\" rule. Expected "
            + min + "-" + max + ".",
        url: "http://pathofexile.gamepedia.com/Item_filter"
      });
      result.invalid = true;
    }
  }

  reportTrailingComment(parser, line, result);
  return result;
}

/** Processes filter rules that match the following format:
 *  <Show|Hide> */
function processBlock(parser: LineParser, line: LineInfo):
    ProcessResult {
  var result: ProcessResult = {
    messages: [],
    invalid: false,
    values: []
  };

  if(parser.isCommented()) {
    const r = parser.parseComment();
    if(r.found && r.value) {
      result.trailingComment = {
        text: r.value,
        range: new Range([line.number, r.startIndex], [line.number, r.endIndex])
      };
    }
  } else if(!parser.isIgnored()) {
    if(settings.config.linterSettings.enableWarnings.get()) {
      const position = new Range([ line.number, parser.currentIndex ],
          [ line.number, parser.originalLength ]);
      const currentText = line.editor.getTextInBufferRange(position);
      const replacement = " #" + currentText;
      const fix: Linter.TextSolution = {
        currentText,
        position,
        replaceWith: replacement,
        title: "Comment This Text"
      }

      result.messages.push({
        location: {
          file: line.file,
          position
        },
        severity: "warning",
        excerpt: "Trailing text for a \"" + line.keyword + "\" block will be ignored.",
        description: "Path of Exile will not consider this an error, however the text will " +
            "be completely ignored.\n\nCommenting this text with a '#' will remove this warning.",
        solutions: [ fix ],
        url: "http://pathofexile.gamepedia.com/Item_filter"
      });
    }
  }

  return result;
}

interface ParseLine {
  editor: AtomCore.TextEditor
  itemData: Data.Parser
  lineText: string
  row: number
}

/** Parses item filter data from a line in a text editor. */
export function parseLine(args: ParseLine): Filter.Line {
  const messages: Linter.Message[] = [];
  const parser = new LineParser(args.lineText);
  const filePath = args.editor.buffer.getPath();

  const validBases = args.itemData.bases.concat(args.itemData.whitelistBases);
  const validClasses = args.itemData.classes.concat(args.itemData.whitelistClasses);

  if(parser.isCommented()) {
    const commentRange = new Range([args.row, parser.textStartIndex], [args.row,
      parser.textEndIndex ]);
    const resultData: Filter.Comment = {
      text: parser.text,
      range: commentRange
    };
    return {
      type: "Comment",
      data: resultData,
      invalid: false,
      messages: []
    };
  }

  if(parser.empty) {
    return {
      type: "Empty",
      data: {},
      invalid: false,
      messages: []
    };
  }

  const keywordResult = parser.nextWord();
  if(!keywordResult.found || !keywordResult.value) {
    messages.push({
      location: {
        file: filePath,
        position: new Range([ args.row, parser.textStartIndex ],
            [ args.row, parser.originalLength])
      },
      severity: "error",
      excerpt: "Unreadable keyword, likely due to a stray character.",
      url: "http://pathofexile.gamepedia.com/Item_filter_guide"
    });

    const unknownRange = new Range([args.row, parser.textStartIndex,
        args.row, parser.textEndIndex]);
    const unknownData: Filter.Unknown = {
      text: args.lineText,
      range: unknownRange
    };

    return {
      type: "Unknown",
      data: unknownData,
      invalid: true,
      messages: messages
    };
  }

  const keyword = keywordResult.value;
  const resultKeyword: Filter.Keyword = {
    name: keyword,
    range: new Range([args.row, keywordResult.startIndex],
        [args.row, keywordResult.endIndex])
  };

  var processResult: ProcessResult = { invalid: false, messages: [],
      values: [] };
  const lineInfo: LineInfo = { editor: args.editor, number: args.row,
      file: filePath, keyword: keyword };

  var lineType: "Block"|"Comment"|"Rule"|"Empty"|"Unknown";
  var lineData: Filter.Block|Filter.Comment|Filter.Rule|Filter.Unknown|Filter.Empty;
  var invalid = false;

  if(keyword == "Show" || keyword == "Hide") {
    processResult = processBlock(parser, lineInfo);
    const ld: Filter.Block = {
      type: resultKeyword,
      scope: new Range([args.row, parser.textStartIndex],
          [args.row, parser.textEndIndex]),
      trailingComment: processResult.trailingComment
    };
    lineType = "Block";
    lineData = ld;
  } else {
    var ruleType: "condition"|"action"|undefined;

    if(keyword == "ItemLevel" || keyword == "DropLevel") {
      processResult = processRangeRule(parser, lineInfo, 0, 100);
      ruleType = "condition";
    } else if(keyword == "Quality") {
      processResult = processRangeRule(parser, lineInfo, 0, 20);
      ruleType = "condition";
    } else if(keyword == "Sockets") {
      processResult = processRangeRule(parser, lineInfo, 0, 6);
      ruleType = "condition";
    } else if(keyword == "Height") {
      processResult = processRangeRule(parser, lineInfo, 1, 4);
      ruleType = "condition";
    } else if(keyword == "Width") {
      processResult = processRangeRule(parser, lineInfo, 1, 2);
      ruleType = "condition";
    } else if(keyword == "Identified" || keyword == "Corrupted") {
      processResult = processBooleanRule(parser, lineInfo);
      ruleType = "condition";
    } else if(keyword == "Rarity") {
      const rarities: string[] = [ "Normal", "Magic", "Rare", "Unique" ];
      processResult = processStringRule(parser, lineInfo, rarities, false);
      ruleType = "condition";
    } else if(keyword == "LinkedSockets") {
      const values: number[] = [0, 2, 3, 4, 5, 6];
      processResult = processOpNumberRule(parser, lineInfo, values);
      ruleType = "condition";
    } else if(keyword == "SocketGroup") {
      processResult = processSocketGroup(parser, lineInfo);
      ruleType = "condition";
    } else if(keyword == "Class") {
      processResult = processMultiStringRule(parser, lineInfo, validClasses, false);
      ruleType = "condition";
    } else if(keyword == "BaseType") {
      processResult = processMultiStringRule(parser, lineInfo, validBases, false);
      ruleType = "condition";
    } else if(keyword == "SetFontSize") {
      processResult = processRangeRule(parser, lineInfo, 18, 45, false);
      ruleType = "action";
    } else if(keyword == "SetBorderColor" || keyword == "SetTextColor" ||
        keyword == "SetBackgroundColor") {
      processResult = processRGBARule(parser, lineInfo);
      ruleType = "action";
    } else if(keyword == "PlayAlertSound") {
      processResult = processAlertSoundRule(parser, lineInfo);
      ruleType = "action";
    }

    if(ruleType) {
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: ruleType,
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;

      if(!processResult.invalid && !parser.empty) {
        // Provide a fix to transform trailing text on action rules into comments.
        var fix: Linter.TextSolution|undefined;
        if(keyword == "SetBorderColor" || keyword == "SetTextColor" ||
            keyword == "SetBackgroundColor" || keyword == "PlayAlertSound") {
          const position = new Range([args.row, parser.currentIndex],
              [args.row, parser.textEndIndex]);
          const currentText = args.editor.getTextInBufferRange(position);
          const replacement = " #" + currentText;
          fix = {
            currentText,
            position,
            replaceWith: replacement,
            title: "Comment This Text"
          }
        }

        const message: Linter.Message = {
          location: {
            file: filePath,
            position: new Range([args.row, parser.currentIndex],
                [args.row, parser.textEndIndex])
          },
          severity: "error",
          excerpt: "Trailing text for a filter rule.",
          description: "Path of Exile will consider this an error.",
          url: "http://pathofexile.gamepedia.com/Item_filter_guide"
        }

        if(fix) message.solutions = [fix];
        messages.push(message);
        invalid = true;
      }
    } else {
      messages.push({
        location: {
          file: filePath,
          position: new Range([args.row, keywordResult.startIndex],
              [args.row, keywordResult.endIndex])
        },
        severity: "error",
        excerpt: "Unknown filter keyword.",
        url: "http://pathofexile.gamepedia.com/Item_filter_guide"
      });
      const ld: Filter.Unknown = {
        text: args.lineText,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex])
      };
      lineType = "Unknown";
      lineData = ld;
      invalid = true;
    }
  }

  if(processResult && processResult.messages.length > 0) {
    if(!invalid) invalid = processResult.invalid;
    if(processResult.messages) {
      processResult.messages.forEach((message) => messages.push(message));
    }
  }

  return { type: lineType, data: lineData, invalid: invalid, messages: messages };
}
