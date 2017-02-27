import { Range } from "atom";
import * as assert from "assert";

import * as data from "./data";

interface ParseResult<T> {
  value?: T
  startIndex: number
  endIndex: number
  found: boolean
}

interface ProcessResult {
  messages: Linter.TextMessage[]
  invalid: boolean
  operator?: Filter.Operator
  values: Filter.Value[]
  trailingComment?: Filter.Comment
}

interface LineInfo {
  number: number
  file: string
  keyword: string
}

/** Parses data from a single line of a Path of Exile filter. */
class LineParser {
  readonly textStartIndex: number
  readonly textEndIndex: number
  readonly originalLength: number

  private empty: boolean
  private currentIndex: number
  private text: string

  private readonly numberRegex = new RegExp("^(\\s*)([-0-9]+)(\\s|$)")
  private readonly wordRegex = new RegExp("^(\\s*)([A-Za-z\u00F6]+)(\\s|$)")
  private readonly stringRegex = /^(\s*)("[^"]*"|[^\s\"\'><=]+)(\s|$)/
  private readonly eolRegex = new RegExp("(\r|\n)")
  private readonly commentRegex = /^(\s*)((#.*\S+)|(#\s*))(\s*)$/
  private readonly textRegex = new RegExp("\\S+")
  private readonly operatorRegex = new RegExp("^(\\s*)(<=|>=|=|<|>){1}(\\s+|$)")
  private readonly quotationRegex = /^(")([^\"]*)(")$/
  private readonly booleanRegex = new RegExp("^(\\s*)(\"true\"|true|\"false\"|false)(\\s+|$)", "i")
  private readonly surroundingWSRegex = new RegExp("^(\\s*)(.*\\S)\\s*$")

  constructor(text: string) {
    assert(text != undefined, "fed undefined text")

    this.text = text
    this.currentIndex = 0
    this.originalLength = text.length

    // Giving this parser string consisting of multiple lines is an outright
    // error.
    if(this.eolRegex.test(this.text))
    {
      throw new Error("LineParser given string containing multiple lines.")
    }

    if(this.textRegex.test(this.text)) {
      const surroundingResult = this.surroundingWSRegex.exec(this.text)

      var leadingWS: string = ""
      var payload: string = ""
      if(surroundingResult !== null) {
        if(surroundingResult.length >= 3) {
          leadingWS = surroundingResult[1];
          payload = surroundingResult[2];
        }
      }

      if(leadingWS) {
        this.textStartIndex = leadingWS.length
      } else {
        this.textStartIndex = 0
      }

      this.textEndIndex = this.textStartIndex + payload.length - 1
      this.empty = false
    } else {
      this.textStartIndex = 0
      this.textEndIndex = 0
      this.empty = true
    }
  }

  /** Returns the current index of the parser on the original line. */
  getCurrentIndex(): number {
    return this.currentIndex
  }

  /** Returns current internal text value.
      This string may have been modified since it was originally passsed in.*/
  getText(): string {
    return this.text
  }

  /** Returns whether or not the internal text value is an empty string. */
  isEmpty(): boolean {
    return this.empty
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
    if(this.isEmpty() || this.isCommented()) {
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

  /** Parses the next number from the given line, advancing the text buffer to
      beyond that number (if found). */
  nextNumber(): ParseResult<number> {
    const result = this.parseSingleValue(this.numberRegex);
    const output: ParseResult<number> = { found: result.found,
        startIndex: result.startIndex, endIndex: result.endIndex };

    if(result.found && result.value) {
      output.value = parseInt(result.value, 10);
    }

    return output;
  }

  /** Parses the next boolean contained within the line.  */
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

  /** Parses any operator supported by Path of Exile from the given live,
      returning the operator as a string with no surrounding whitespace. */
  nextOperator(): ParseResult<string> {
    return this.parseSingleValue(this.operatorRegex);
  }

  /** Parses the next word from the given line.
      A word is considered a string of letters from any langauge. */
  nextWord(): ParseResult<string> {
    return this.parseSingleValue(this.wordRegex);
  }

  /** Parses the next string contained within the line.
      Strings containing multiple words must be contained within double quotation marks. */
  nextString(): ParseResult<string> {
    var result = this.parseSingleValue(this.stringRegex);

    // We store the value internally without quotation marks, so the regex only
    // captures whatever is enclosed by them.
    if(result.found && result.value) {
      const quotationResult = this.quotationRegex.exec(result.value)
      if(quotationResult) result.value = quotationResult[2]
    }
    return result
  }

  parseComment(): ParseResult<string> {
    return this.parseSingleValue(this.commentRegex);
  }
}

/** Processes an operator from the given line, returning an error message if
 * that operator isn't the equality operator. */
function expectEqualityOp(parser: LineParser, line: LineInfo):
    Linter.TextMessage|undefined {
  var result: Linter.TextMessage|undefined = undefined;

  var operator = parser.nextOperator();
  if(operator.found && operator.value != "=") {
    result = {
      type: "Error",
      text: "Invalid operator for \"" + line.keyword +
          "\". Only the equality operator (=) is supported for this rule.",
      filePath: line.file,
      range: new Range([ line.number, operator.startIndex ],
          [ line.number, operator.endIndex ])
    };
  }

  return result;
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
    return result;
  }

  const retVal: ParseResult<number> = parser.nextNumber();
  if(!retVal.found) {
    result.messages.push({
      type: "Error",
      text: "Invalid format. Expected \"" + line.keyword +
          " <Value> [Value]\".",
      filePath: line.file,
      range: new Range([ line.number, parser.textStartIndex ],
          [ line.number, parser.originalLength ])
    });
    return result;
  }

  const optVal: ParseResult<number> = parser.nextNumber();
  var outputText = "Invalid value for rule \"" + line.keyword + "\". Expected ";

  if(retVal.value < 1 || retVal.value > 9) {
    var outputRange = new Range([ line.number, retVal.startIndex ],
        [ line.number, retVal.endIndex ]);
    const text = outputText + "1-9.";

    result.messages.push({
      type: "Error",
      text: text,
      filePath: line.file,
      range: outputRange
    });
    result.invalid = true;
  }

  if(optVal.found && optVal.value != undefined && (optVal.value < 0 || optVal.value > 300)) {
    const text = outputText + "0-300.";
    var outputRange = new Range([ line.number, optVal.startIndex ],
        [ line.number, optVal.endIndex ]);
    result.messages.push({
      type: "Error",
      text: text,
      filePath: line.file,
      range: outputRange
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
    return result;
  }

  const red = parser.nextNumber();
  const green = parser.nextNumber();
  const blue = parser.nextNumber();
  const alpha = parser.nextNumber();
  if(!red.found || !green.found || !blue.found) {
    result.messages.push({
      type: "Error",
      text: "Invalid format. Expected \"" + line.keyword +
          " <Red> <Green> <Blue> [Alpha]\".",
      filePath: line.file,
      range: new Range([ line.number, parser.textStartIndex ],
          [ line.number, parser.originalLength ])
    });
    return result;
  }

  var partialMessage: Linter.TextMessage = {
    type: "Error",
    text: "Invalid value for rule \"" + line.keyword + "\". Expected 0-255.",
    filePath: line.file,
    range: undefined
  };
  if(red.value < 0 || red.value > 255) {
    partialMessage.range = new Range([ line.number, red.startIndex],
        [ line.number, red.endIndex ]);
    result.messages.push(partialMessage);
  } else if(green.value < 0 || green.value > 255) {
    partialMessage.range = new Range([ line.number, green.startIndex],
        [ line.number, green.endIndex ]);
    result.messages.push(partialMessage);
  } else if(blue.value < 0 || blue.value > 255) {
    partialMessage.range = new Range([ line.number, blue.startIndex],
        [ line.number, blue.endIndex ]);
    result.messages.push(partialMessage);
  } else if(alpha.found && (alpha.value < 0 || alpha.value > 255)) {
    partialMessage.range = new Range([ line.number, alpha.startIndex],
        [ line.number, alpha.endIndex ]);
    result.messages.push(partialMessage);
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
    return result;
  }

  while(true) {
    const currentValue = parser.nextString();
    if(!currentValue.found && result.values.length == 0 && result.messages.length == 0) {
      result.messages.push({
        type: "Error",
        text: "Invalid format. Expected \"" + line.keyword +
            " [Operator] <String>\".",
        filePath: line.file,
        range: new Range([ line.number, parser.textStartIndex ],
            [ line.number, parser.originalLength ])
      });
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
        type: "Error",
        text: "Invalid value for \"" + line.keyword + "\" rule.",
        filePath: line.file,
        range: new Range([ line.number, currentValue.startIndex ],
            [ line.number, currentValue.endIndex ])
      });
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
    return result;
  }

  var retVal = parser.nextString();
  if(!retVal.found || !retVal.value) {
    result.messages.push({
      type: "Error",
      text: "Invalid format. Expected \"" + line.keyword + " <Group>\".",
      filePath: line.file,
      range: new Range([ line.number, parser.textStartIndex ],
          [ line.number, parser.originalLength ])
    });
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
        type: "Error",
        text: "Invalid value for \"" + line.keyword +
            "\" rule. Valid characters are: R, B, G, W.",
        filePath: line.file,
        range: new Range([ line.number, retVal.startIndex ],
            [ line.number, retVal.endIndex ])
      });
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
      type: "Error",
      text: "Invalid format. Expected \"" + line.keyword +  " [Operator] <Value>\".",
      filePath: line.file,
      range: new Range([ line.number, parser.textStartIndex ],
          [ line.number, parser.originalLength ])
    });
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
      type: "Error",
      text: "Invalid value for rule \"" + line.keyword + "\". Expected " +
          values.toString() + ".",
      filePath: line.file,
      range: new Range([ line.number, retVal.startIndex],
          [ line.number, retVal.endIndex ])
    });
  }

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
      type: "Error",
      text: "Invalid format. Expected \"" + line.keyword +
          " [Operator] <String>\".",
      filePath: line.file,
      range: new Range([ line.number, parser.textStartIndex ],
          [ line.number, parser.originalLength ])
    });
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
    result.messages.push({
      type: "Error",
      text: "Invalid value for \"" + line.keyword + "\" rule.",
      filePath: line.file,
      range: new Range([ line.number, retVal.startIndex ],
          [ line.number, retVal.endIndex ])
    });
    result.invalid = true;
  }

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
      type: "Error",
      text: "Invalid format. Expected \"" + line.keyword + " <True|False>\".",
      filePath: line.file,
      range: new Range([ line.number, parser.textStartIndex ],
          [ line.number, parser.originalLength ])
    });
  } else {
    const valueRange = new Range([line.number, retVal.startIndex],
      [line.number, retVal.endIndex]);
    const value: Filter.Value = {
      value: retVal.value,
      range: valueRange
    };
    result.values = [value];
  }

  return result;
}

/** Processes filter rules that match the following format:
 *  <Rule> [Operator] <Value>
 *  Where <Value> is expected to be a value between {min...max}. */
function processRangeRule(parser: LineParser, line: LineInfo,
    min: number, max: number): ProcessResult {
  var result: ProcessResult = {
    invalid: false,
    messages: [],
    values: []
  };

  const operator: ParseResult<string> = parser.nextOperator();
  if(!operator.found || !operator.value) {
    operator.value = "=";
  } else {
    result.operator = { type: operator.value, range: new Range([line.number,
        operator.startIndex], [line.number, operator.endIndex]) };
  }

  const retVal = parser.nextNumber();
  if(!retVal.found || retVal.value == undefined) {
    result.messages.push({
      type: "Error",
      text: "Invalid format. Expected \"" + line.keyword +
          " [Operator] <Value>\".",
      filePath: line.file,
      range: new Range([ line.number, parser.textStartIndex ],
          [ line.number, parser.originalLength ])
    });
  } else {
    if(retVal.value >= min && retVal.value <= max) {
      const r = new Range([line.number, retVal.startIndex],
          [line.number, retVal.endIndex]);
      const value: Filter.Value = { value: retVal.value, range: r };
      result.values = [value];
    } else {
      result.messages.push({
        type: "Error",
        text: "Invalid value for \"" + line.keyword + "\" rule. Expected "
            + min + "-" + max + ".",
        filePath: line.file,
        range: new Range([ line.number, retVal.startIndex ],
            [line.number, retVal.endIndex])
      });
    }
  }

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
    result.messages.push({
      type: "Warning",
      text: "Trailing text for a \"" + line.keyword + "\" block will be ignored.",
      filePath: line.file,
      range: new Range([ line.number, parser.getCurrentIndex() ],
          [ line.number, parser.originalLength ])
    });
  }

  return result;
}

interface ParseLine {
  itemData: Data.Parser
  lineText: string
  row: number
  filePath: string
}

export function parseLine(args: ParseLine): Filter.Line {
  const messages: Linter.TextMessage[] = [];
  const parser = new LineParser(args.lineText);

  const validBases = args.itemData.bases;
  const validClasses = args.itemData.classes;

  if(parser.isCommented()) {
    const commentRange = new Range([args.row, parser.textStartIndex], [args.row,
      parser.textEndIndex ]);
    const resultData: Filter.Comment = {
      text: parser.getText(),
      range: commentRange
    };
    return {
      type: "Comment",
      data: resultData,
      invalid: false,
      messages: []
    };
  }

  if(parser.isEmpty()) {
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
      type: "Error",
      text: "Unreadable keyword, likely due to a stray character.",
      filePath: args.filePath,
      range: new Range([ args.row, parser.textStartIndex ],
          [ args.row, parser.originalLength])
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
    type: keyword,
    range: new Range([args.row, keywordResult.startIndex],
        [args.row, keywordResult.endIndex])
  };

  var processResult: ProcessResult = { invalid: false, messages: [],
      values: [] };
  const lineInfo: LineInfo = { number: args.row, file: args.filePath,
      keyword: keyword };

  var lineType: "Block"|"Comment"|"Rule"|"Empty"|"Unknown";
  var lineData: Filter.Block|Filter.Comment|Filter.Rule|Filter.Unknown|Filter.Empty;
  var invalid = false;

  // TODO(glen): clean up the code duplication below somehow.
  switch(keyword) {
    case "Show":
    case "Hide": {
      processResult = processBlock(parser, lineInfo);
      const ld: Filter.Block = {
        type: resultKeyword,
        scope: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment
      };
      lineType = "Block";
      lineData = ld;
    } break;
    // ItemLevel [Operator] <Value> (0-100)
    // DropLevel [Operator] <Value> (0-100)
    case "ItemLevel":
    case "DropLevel": {
      processResult = processRangeRule(parser, lineInfo, 0, 100);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "condition",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // Quality [Operator] <Value> (0-20)
    case "Quality": {
      processResult = processRangeRule(parser, lineInfo, 0, 20);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "condition",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // Sockets [Operator] <Value> (0-6)
    case "Sockets": {
      processResult = processRangeRule(parser, lineInfo, 0, 6);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "condition",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // Height [Operator] <Value> (1-4)
    case "Height": {
      processResult = processRangeRule(parser, lineInfo, 1, 4);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "condition",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // Width [Operator] <Value> (1-2)
    case "Width": {
      processResult = processRangeRule(parser, lineInfo, 1, 2);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "condition",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // Identified <Boolean>
    // Corrupted <Boolean>
    case "Identified":
    case "Corrupted": {
      processResult = processBooleanRule(parser, lineInfo);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "condition",
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // Rarity [Operator] <String> (Normal, Magic, Rare, Unique)
    case "Rarity": {
      const rarities: string[] = [ "Normal", "Magic", "Rare", "Unique" ];
      processResult = processStringRule(parser, lineInfo, rarities, false);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "condition",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // LinkedSockets [Operator] <Value> (0, 2-6)
    case "LinkedSockets": {
      const values: number[] = [0, 2, 3, 4, 5, 6];

      processResult = processOpNumberRule(parser, lineInfo, values);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "condition",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // SocketGroup [Group] (R, G, B, W)
    case "SocketGroup": {
      processResult = processSocketGroup(parser, lineInfo);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "condition",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // Class <Class> (String[])
    case "Class": {
      processResult = processMultiStringRule(parser, lineInfo, validClasses, false);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "condition",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // BaseType <BaseType> (String[])
    case "BaseType": {
      processResult = processMultiStringRule(parser, lineInfo, validBases, false);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "condition",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // SetFontSize <Value> (18-45)
    case "SetFontSize": {
      processResult = processRangeRule(parser, lineInfo, 18, 45);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "action",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // SetBorderColor <Red> <Green> <Blue> [Alpha] (0-255)
    // SetTextColor <Red> <Green> <Blue> [Alpha] (0-255)
    // SetBackgroundColor <Red> <Green> <Blue> [Alpha] (0-255)
    case "SetBorderColor":
    case "SetTextColor":
    case "SetBackgroundColor": {
      processResult = processRGBARule(parser, lineInfo);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "action",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    // PlayAlertSound <Value> [Value]	(1-9, [0-300])
    case "PlayAlertSound": {
      processResult = processAlertSoundRule(parser, lineInfo);
      const ld: Filter.Rule = {
        type: resultKeyword,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex]),
        trailingComment: processResult.trailingComment,
        category: "action",
        operator: processResult.operator,
        values: processResult.values
      };
      lineType = "Rule";
      lineData = ld;
    } break;
    default:
      messages.push({
        text: "Unknown filter keyword.",
        type: "Error",
        filePath: args.filePath,
        range: new Range([args.row, keywordResult.startIndex],
            [args.row, keywordResult.endIndex])
      });
      const ld: Filter.Unknown = {
        text: args.lineText,
        range: new Range([args.row, parser.textStartIndex],
            [args.row, parser.textEndIndex])
      };
      lineType = "Unknown";
      lineData = ld;
      invalid = true;
      break;
  }

  if(processResult && processResult.messages.length > 0) {
    invalid = processResult.invalid;
    if(processResult.messages) {
      processResult.messages.forEach((message) => messages.push(message));
    }
  }

  return { type: lineType, data: lineData, invalid: invalid, messages: messages };
}
