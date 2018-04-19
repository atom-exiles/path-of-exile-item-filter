import * as Filter from "./item-filter";
import { LineParser } from "./line-parser";
import { ValidationDataFormat } from "./validation-data";

/**
 * The format used by the parser to report errors. This type is essentially a
 * slimmed down version of a Linter message and will be transformed into that
 * type by the linter provider.
 */
export interface ValidationMessage {
  /** The range of the message in the editor. */
  range: Filter.Range;

  /** The text for the message. */
  excerpt: string;

  /** Markdown long description of the error. */
  description?: string;

  /** The path to the file to which the message applies. */
  file?: string;

  /** An HTTP link to a resource explaining the issue. */
  url?: string;

  /** A possible solution (which the user can invoke at will). */
  solution?: {
    /** The text being replaced by the solution. */
    currentText?: string;

    /** The replacement text that fixes the issue. */
    replaceWith: string;
  };
}

export interface ValidationMessages {
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  info: ValidationMessage[];
  [key: string]: ValidationMessage[];
}

interface ProcessLine {
  /** The text of the line being processed. */
  line: string;

  /** The data to validate the line against. */
  data: ValidationDataFormat;

  /** The line number for the line being processed. */
  row: number;

  /** The name of the file being processed. */
  file?: string;
}

interface ProcessLines {
  /** The text for each line to be processed. */
  lines: string[];

  /** The data to validate each line against. */
  data: ValidationDataFormat;

  /** The line number for the first line being processed. */
  row: number;

  /** The name of the file being processed. */
  file?: string;
}

interface LineInfo extends ProcessLine {
  parser: LineParser;
  messages: ValidationMessages;
  invalid: boolean;
  keyword: Filter.Keyword;
  range: Filter.Range;
}

function reportTrailingText(lineInfo: LineInfo, severity: "error"|"warning" = "error") {
  if (lineInfo.parser.empty) return;

  const range: Filter.Range = {
    start: { row: lineInfo.row, column: lineInfo.parser.currentIndex },
    end: { row: lineInfo.row, column: lineInfo.parser.textEndIndex },
  };

  let container: ValidationMessage[];
  let excerpt: string;
  if (severity === "error") {
    lineInfo.invalid = true;
    excerpt = "This trailing text will be considered an error by Path of Exile.";
    container = lineInfo.messages.errors;
  } else {
    excerpt = "This trailing text will be ignored by Path of Exile.";
    container = lineInfo.messages.warnings;
  }

  container.push({
    excerpt,
    file: lineInfo.file,
    url: "http://pathofexile.gamepedia.com/Item_filter_guide",
    range,
  });
}

function expectEqualityOperator(lineInfo: LineInfo) {
  const operator = parseOperator(lineInfo);
  if (operator && operator.text !== "=") {
    lineInfo.invalid = true;
    lineInfo.messages.errors.push({
      excerpt: `Invalid operator for the ${lineInfo.keyword.text} rule.`,
      description: `The ${lineInfo.keyword.text} rule only supports equality comparisons. ` +
        "Only the '=' operator can be used, though it is recommended that you don't " +
        "provide any operator at all.",
      file: lineInfo.file,
      range: operator.range,
      url: "http://pathofexile.gamepedia.com/Item_filter",
    });
  }
  return;
}

function expectMultipleStrings(lineInfo: LineInfo, validValues: string[], whitelist: string[]) {
  const values: Array<Filter.Value<string>> = [];
  while (true) {
    const valueResult = lineInfo.parser.nextString();

    if (!valueResult.found) {
      if (values.length === 0 && !lineInfo.invalid) {
        lineInfo.invalid = true;
        lineInfo.messages.errors.push({
          excerpt: "A string value was expected, yet not found.",
          file: lineInfo.file,
          url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
          range: {
            start: { row: lineInfo.row, column: lineInfo.parser.textStartIndex },
            end: { row: lineInfo.row, column: lineInfo.parser.originalLength },
          },
        });
      }
      break;
    }

    let found = false;
    for (const v of validValues) {
      if (v.includes(valueResult.value)) {
        found = true;
        break;
      }
    }
    if (!found) {
      for (const wv of whitelist) {
        if (wv.includes(valueResult.value)) {
          found = true;
          break;
        }
      }
    }

    if (found) {
      values.push({ value: valueResult.value, range: valueResult.range });
    } else {
      lineInfo.invalid = true;
      lineInfo.messages.errors.push({
        excerpt: "Invalid value for the given rule.",
        file: lineInfo.file,
        range: valueResult.range,
        url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
      });
    }
  }
  return values;
}

function parseBlock(lineInfo: LineInfo) {
  let trailingComment: Filter.Comment|undefined;
  if (lineInfo.parser.isCommented()) {
    const commentResult = lineInfo.parser.parseComment();
    if (commentResult.found) {
      trailingComment = { text: commentResult.value, range: commentResult.range };
    }
  }

  reportTrailingText(lineInfo, "warning");

  const result: Filter.Block = {
    type: "block",
    keyword: lineInfo.keyword,
    trailingComment,
    invalid: false,
    messages: lineInfo.messages,
    range: lineInfo.range,
  };
  return result;
}

function parseNumberInRange(lineInfo: LineInfo, min: number, max: number, required = true) {
  const numberResult = lineInfo.parser.nextNumber();
  if (numberResult.found) {
    if (numberResult.value >= min && numberResult.value <= max) {
      const result: Filter.Value<number> = {
        value: numberResult.value,
        range: numberResult.range,
      };
      return result;
    } else {
      lineInfo.invalid = true;
      lineInfo.messages.errors.push({
        excerpt: `The given value is invalid. Value is expected to be between ${min} and ${max}.`,
        file: lineInfo.file,
        url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
        range: numberResult.range,
      });
      return undefined;
    }
  } else {
    if (required) {
      lineInfo.invalid = true;
      lineInfo.messages.errors.push({
        excerpt: `A number between ${min} and ${max} was expected, yet not found.`,
        file: lineInfo.file,
        url: "http://pathofexile.gamepedia.com/Item_filter_guide#Conditions",
        range: {
          start: { row: lineInfo.row, column: lineInfo.parser.textStartIndex },
          end: { row: lineInfo.row, column: lineInfo.parser.originalLength },
        },
      });
    }
    return undefined;
  }
}

function parseOperator(lineInfo: LineInfo) {
  let result: Filter.Operator|undefined;

  const operatorResult = lineInfo.parser.nextOperator();
  if (operatorResult.found) {
    result = {
      text: operatorResult.value,
      range: operatorResult.range,
    };
  }

  return result;
}

function parseSingleNumberRule(lineInfo: LineInfo, min: number, max: number, equalityOnly = false) {
  let operator: Filter.Operator|undefined;
  if (equalityOnly) {
    expectEqualityOperator(lineInfo);
  } else {
    operator = parseOperator(lineInfo);
  }

  const value = parseNumberInRange(lineInfo, min, max);

  if (!lineInfo.invalid) reportTrailingText(lineInfo);

  return { operator, value };
}

function parseBooleanRule(lineInfo: LineInfo) {
  expectEqualityOperator(lineInfo);

  const booleanResult = lineInfo.parser.nextBoolean();
  let value: Filter.Value<boolean>|undefined;
  if (booleanResult.found) {
    value = { value: booleanResult.value, range: booleanResult.range };
  } else {
    lineInfo.invalid = true;
    lineInfo.messages.errors.push({
      excerpt: "A boolean value, either True or False, was expected, yet not found.",
      file: lineInfo.file,
      url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
      range: {
        start: { row: lineInfo.row, column: lineInfo.parser.textStartIndex },
        end: { row: lineInfo.row, column: lineInfo.parser.originalLength },
      },
    });
  }

  if (!lineInfo.invalid) reportTrailingText(lineInfo);

  return {
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    value,
  };
}

function parseColorRule(lineInfo: LineInfo) {
  expectEqualityOperator(lineInfo);

  let red: Filter.Value<number>|undefined;
  if (!lineInfo.invalid) red = parseNumberInRange(lineInfo, 0, 255);
  let green: Filter.Value<number>|undefined;
  if (!lineInfo.invalid) green = parseNumberInRange(lineInfo, 0, 255);
  let blue: Filter.Value<number>|undefined;
  if (!lineInfo.invalid) blue = parseNumberInRange(lineInfo, 0, 255);
  let alpha: Filter.Value<number>|undefined;
  if (!lineInfo.invalid) alpha = parseNumberInRange(lineInfo, 0, 255, false);

  let trailingComment: Filter.Comment|undefined;
  if (!lineInfo.invalid) {
    const trailingCommentResult = lineInfo.parser.parseComment();
    if (trailingCommentResult.found) {
      trailingComment = {
        text: trailingCommentResult.value,
        range: trailingCommentResult.range,
      };
    }
  }

  if (!lineInfo.invalid) reportTrailingText(lineInfo);

  return { red, green, blue, alpha, trailingComment };
}

function parseMultiStringRule(lineInfo: LineInfo, validValues: string[], whitelist: string[]) {
  expectEqualityOperator(lineInfo);

  let values: Array<Filter.Value<string>>|undefined;
  if (!lineInfo.invalid) {
    values = expectMultipleStrings(lineInfo, validValues, whitelist);
  }

  let result: Filter.Values<string>|undefined;
  if (!lineInfo.invalid && values) {
    const valuesStartIndex = values[0].range.start.column;
    const valuesEndIndex = values[values.length - 1].range.end.column;

    result = {
      values,
      range: {
        start: { row: lineInfo.row, column: valuesStartIndex },
        end: { row: lineInfo.row, column: valuesEndIndex },
      },
    };
  }
  return result;
}

function processShowBlock(lineInfo: LineInfo) {
  const block: Filter.Block = parseBlock(lineInfo);
  const showBlock: Filter.ShowBlock = {
    type: block.type,
    ruleType: "show",
    keyword: block.keyword,
    range: block.range,
    trailingComment: block.trailingComment,
    messages: block.messages,
    invalid: block.invalid,
  };
  return showBlock;
}

function processHideBlock(lineInfo: LineInfo) {
  const block: Filter.Block = parseBlock(lineInfo);
  const hideBlock: Filter.HideBlock = {
    type: block.type,
    ruleType: "hide",
    keyword: block.keyword,
    range: block.range,
    trailingComment: block.trailingComment,
    messages: block.messages,
    invalid: block.invalid,
  };
  return hideBlock;
}

function processItemLevelRule(lineInfo: LineInfo) {
  const { operator, value } = parseSingleNumberRule(lineInfo, 0, 100);

  const result: Filter.ItemLevelRule = {
    type: "rule", ruleType: "filter", filterName: "ItemLevel",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, operator, value,
  };
  return result;
}

function processDropLevelRule(lineInfo: LineInfo) {
  const { operator, value } = parseSingleNumberRule(lineInfo, 0, 100);

  const result: Filter.DropLevelRule = {
    type: "rule", ruleType: "filter", filterName: "DropLevel",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, operator, value,
  };
  return result;
}

function processQualityRule(lineInfo: LineInfo) {
  const { operator, value } = parseSingleNumberRule(lineInfo, 0, 20);

  const result: Filter.QualityRule = {
    type: "rule", ruleType: "filter", filterName: "Quality",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, operator, value,
  };
  return result;
}

function processRarityRule(lineInfo: LineInfo) {
  const operator = parseOperator(lineInfo);

  const valueResult = lineInfo.parser.nextString();
  let value: Filter.Value<string>|undefined;
  if (valueResult.found) {
    const validValues = [ "Normal", "Magic", "Rare", "Unique" ];
    if (validValues.includes(valueResult.value)) {
      value = { value: valueResult.value, range: valueResult.range };
    } else {
      lineInfo.invalid = true;
      lineInfo.messages.errors.push({
        excerpt: "The given value is invalid. The value is expected to be one of the following: " +
            validValues.toString(),
        file: lineInfo.file,
        url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
        range: valueResult.range,
      });
    }
  } else {
    lineInfo.invalid = true;
    lineInfo.messages.errors.push({
      excerpt: "An item rarity was expected to follow the keyword.",
      description: "Item rarities in Path of Exile include the following:" +
        "\n\n\tNormal\n\tMagic\n\tRare\n\tUnique",
      file: lineInfo.file,
      url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
      range: {
        start: { row: lineInfo.row, column: lineInfo.parser.textStartIndex },
        end: { row: lineInfo.row, column: lineInfo.parser.originalLength },
      },
    });
  }

  if (!lineInfo.invalid) reportTrailingText(lineInfo);

  const result: Filter.RarityRule = {
    type: "rule", ruleType: "filter", filterName: "Rarity",
    invalid: lineInfo.invalid, keyword: lineInfo.keyword, messages: lineInfo.messages,
    range: lineInfo.range, operator, value,
  };
  return result;
}

function processClassRule(lineInfo: LineInfo) {
  const values = parseMultiStringRule(lineInfo, lineInfo.data.validClasses,
      lineInfo.data.classWhitelist);

  const result: Filter.ClassRule = {
    type: "rule", ruleType: "filter", filterName: "Class",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, values,
  };
  return result;
}

function processBaseTypeRule(lineInfo: LineInfo) {
  const values = parseMultiStringRule(lineInfo, lineInfo.data.validBases,
      lineInfo.data.baseWhitelist);

  const result: Filter.BaseTypeRule = {
    type: "rule", ruleType: "filter", filterName: "BaseType",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, values,
  };
  return result;
}

function processSocketsRule(lineInfo: LineInfo) {
  const { operator, value } = parseSingleNumberRule(lineInfo, 0, 6);

  const result: Filter.SocketsRule = {
    type: "rule", ruleType: "filter", filterName: "Sockets",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, operator, value,
  };
  return result;
}

function processLinkedSocketsRule(lineInfo: LineInfo) {
  const operatorResult = lineInfo.parser.nextOperator();
  let operator: Filter.Operator|undefined;
  if (operatorResult.found) {
    operator = {
      text: operatorResult.value,
      range: operatorResult.range,
    };
  }

  const valueResult = lineInfo.parser.nextNumber();
  let value: Filter.Value<number>|undefined;
  if (valueResult.found) {
    if (valueResult.value === 0 || (valueResult.value >= 2 && valueResult.value <= 6)) {
      value = { value: valueResult.value, range: valueResult.range };
    } else {
      lineInfo.invalid = true;
      lineInfo.messages.errors.push({
        excerpt: "The given value is invalid. Valid values are 0 and 2-6.",
        file: lineInfo.file,
        url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
        range: valueResult.range,
      });
    }
  } else {
    lineInfo.invalid = true;
    lineInfo.messages.errors.push({
      excerpt: "A number was expected, yet not found. Valid values are 0 and 2-6.",
      file: lineInfo.file,
      url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
      range: {
        start: { row: lineInfo.row, column: lineInfo.parser.currentIndex },
        end: { row: lineInfo.row, column: lineInfo.parser.originalLength },
      },
    });
  }

  if (!lineInfo.invalid) reportTrailingText(lineInfo);

  const result: Filter.LinkedSocketsRule = {
    type: "rule",
    ruleType: "filter",
    filterName: "LinkedSockets",
    range: lineInfo.range,
    operator,
    value,
    keyword: lineInfo.keyword,
    invalid: lineInfo.invalid,
    messages: lineInfo.messages,
  };
  return result;
}

function processSocketGroup(lineInfo: LineInfo) {
  expectEqualityOperator(lineInfo);

  let value: Filter.Value<string>|undefined;
  if (!lineInfo.invalid) {
    const valueResult = lineInfo.parser.nextString();
    if (valueResult.found) {
      const groupRegex = new RegExp("^[rgbw]{1,6}$", "i");
      if (groupRegex.test(valueResult.value)) {
        value = { range: valueResult.range, value: valueResult.value };
      } else {
        lineInfo.invalid = true;
        lineInfo.messages.errors.push({
          excerpt: "The given value is invalid. A string consisting of the following characters" +
              " was expected: R, B, G, W.",
          file: lineInfo.file,
          url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
          range: {
            start: { row: lineInfo.row, column: lineInfo.parser.currentIndex },
            end: { row: lineInfo.row, column: lineInfo.parser.textEndIndex },
          },
        });
      }
    } else {
      lineInfo.invalid = true;
      lineInfo.messages.errors.push({
        excerpt: "A socket group was expected to follow the keyword.",
        description: "A socket group is a word that consists of the following characters: " +
            "R, B, G, W.",
        url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
        range: {
          start: { row: lineInfo.row, column: lineInfo.parser.currentIndex },
          end: { row: lineInfo.row, column: lineInfo.parser.textEndIndex },
        },
      });
    }
  }

  if (!lineInfo.invalid) {
    reportTrailingText(lineInfo);
  }

  const result: Filter.SocketGroupRule = {
    type: "rule", ruleType: "filter", filterName: "SocketGroup",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, value,
  };
  return result;
}

function processHeightRule(lineInfo: LineInfo) {
  const { operator, value } = parseSingleNumberRule(lineInfo, 1, 4);

  const result: Filter.HeightRule = {
    type: "rule", ruleType: "filter", filterName: "Height",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, operator, value,
  };
  return result;
}

function processWidthRule(lineInfo: LineInfo) {
  const { operator, value } = parseSingleNumberRule(lineInfo, 1, 2);

  const result: Filter.WidthRule = {
    type: "rule", ruleType: "filter", filterName: "Width",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, operator, value,
  };
  return result;
}

function processIdentifiedRule(lineInfo: LineInfo) {
  const { keyword, value, invalid, messages } = parseBooleanRule(lineInfo);

  const result: Filter.IdentifiedRule = {
    type: "rule", ruleType: "filter", filterName: "Identified",
    keyword, range: lineInfo.range, value, invalid, messages,
  };
  return result;
}

function processCorruptedRule(lineInfo: LineInfo) {
  const { keyword, value, invalid, messages } = parseBooleanRule(lineInfo);

  const result: Filter.CorruptedRule = {
    type: "rule", ruleType: "filter", filterName: "Corrupted",
    keyword, range: lineInfo.range, value, invalid, messages,
  };
  return result;
}

function processElderItemRule(lineInfo: LineInfo) {
  const { keyword, value, invalid, messages } = parseBooleanRule(lineInfo);

  const result: Filter.ElderItemRule = {
    type: "rule", ruleType: "filter", filterName: "ElderItem",
    keyword, range: lineInfo.range, value, invalid, messages,
  };
  return result;
}

function processShaperItemRule(lineInfo: LineInfo) {
  const { keyword, value, invalid, messages } = parseBooleanRule(lineInfo);

  const result: Filter.ShaperItemRule = {
    type: "rule", ruleType: "filter", filterName: "ShaperItem",
    keyword, range: lineInfo.range, value, invalid, messages,
  };
  return result;
}

function processShapedMapRule(lineInfo: LineInfo) {
  const { keyword, value, invalid, messages } = parseBooleanRule(lineInfo);

  const result: Filter.ShapedMapRule = {
    type: "rule", ruleType: "filter", filterName: "ShapedMap",
    keyword, range: lineInfo.range, value, invalid, messages,
  };
  return result;
}

function processElderMapRule(lineInfo: LineInfo) {
  const { keyword, value, invalid, messages } = parseBooleanRule(lineInfo);

  const result: Filter.ElderMapRule = {
    type: "rule", ruleType: "filter", filterName: "ElderMap",
    keyword, range: lineInfo.range, value, invalid, messages,
  };
  return result;
}

function processSetBorderColorRule(lineInfo: LineInfo) {
  const { red, green, blue, alpha, trailingComment } = parseColorRule(lineInfo);

  const result: Filter.SetBorderColorRule = {
    type: "rule", ruleType: "action", actionName: "SetBorderColor",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, red, green, blue, alpha, trailingComment,
  };
  return result;
}

function processSetTextColorRule(lineInfo: LineInfo) {
  const { red, green, blue, alpha, trailingComment } = parseColorRule(lineInfo);

  const result: Filter.SetTextColorRule = {
    type: "rule", ruleType: "action", actionName: "SetTextColor",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, red, green, blue, alpha, trailingComment,
  };
  return result;
}

function processSetBackgroundColorRule(lineInfo: LineInfo) {
  const { red, green, blue, alpha, trailingComment } = parseColorRule(lineInfo);

  const result: Filter.SetBackgroundColorRule = {
    type: "rule", ruleType: "action", actionName: "SetBackgroundColor",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, red, green, blue, alpha, trailingComment,
  };
  return result;
}

function processPlayAlertSoundRule(lineInfo: LineInfo) {
  expectEqualityOperator(lineInfo);

  let id: Filter.Value<string>|undefined;

  const orbResult = lineInfo.parser.nextWord();
  if (orbResult.found) {
    if (lineInfo.data.validSounds.includes(orbResult.value)) {
      id = { range: orbResult.range, value: orbResult.value };
    } else {
      lineInfo.invalid = true;
      lineInfo.messages.errors.push({
        excerpt: "Invalid value for the PlayAlertSound rule.",
        description: "Supported values:\n\n" + lineInfo.data.validSounds.toString(),
        file: lineInfo.file,
        range: orbResult.range,
        url: "https://pathofexile.gamepedia.com/Item_filter",
      });
    }
  } else {
    const n = parseNumberInRange(lineInfo, 1, 16, false);
    if (!lineInfo.invalid && n === undefined) {
      lineInfo.invalid = true;
      lineInfo.messages.errors.push({
        excerpt: "Invalid format. Expected either a number or word to follow.",
        description: "Supported values:\n\n" + lineInfo.data.validSounds.toString(),
        file: lineInfo.file,
        range: {
          start: { row: lineInfo.row, column: lineInfo.keyword.range.end.column + 1 },
          end: { row: lineInfo.row, column: lineInfo.parser.textEndIndex },
        },
        url: "https://pathofexile.gamepedia.com/Item_filter",
      });
    } else if (n !== undefined) {
      id = { range: n.range, value: `${n.value}` };
    }
  }

  let volume: Filter.Value<number>|undefined;
  if (!lineInfo.invalid) {
    volume = parseNumberInRange(lineInfo, 0, 300, false);
  }

  let trailingComment: Filter.Comment|undefined;
  if (!lineInfo.invalid) {
    const trailingCommentResult = lineInfo.parser.parseComment();
    if (trailingCommentResult.found) {
      trailingComment = { text: trailingCommentResult.value, range: trailingCommentResult.range };
    }
  }

  if (!lineInfo.invalid) reportTrailingText(lineInfo);

  const result: Filter.PlayAlertSoundRule = {
    type: "rule", ruleType: "action", actionName: "PlayAlertSound",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, id, volume, trailingComment,
  };
  return result;
}

function processSetFontSizeRule(lineInfo: LineInfo) {
  const { value } = parseSingleNumberRule(lineInfo, 18, 45, true);

  if (!lineInfo.invalid) reportTrailingText(lineInfo);

  const result: Filter.SetFontSizeRule = {
    type: "rule", ruleType: "action", actionName: "SetFontSize",
    keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
    range: lineInfo.range, value,
  };
  return result;
}

function processLineComment(parser: LineParser) {
  const commentResult = parser.parseComment();
  let text: string;
  let range: Filter.Range;
  if (commentResult.found) {
    text = commentResult.value;
    range = commentResult.range;
  } else {
    throw new Error("expected a comment to immediately follow on the line");
  }

  const result: Filter.CommentedLine = {
    type: "comment",
    invalid: false,
    text,
    range,
    messages: {
      errors: [],
      warnings: [],
      info: [],
    },
  };

  return result;
}

function processEmptyLine(parser: LineParser, row: number) {
  const result: Filter.EmptyLine = {
    type: "empty",
    invalid: false,
    messages: { errors: [], warnings: [], info: [] },
    range: {
      start: { row, column: 0},
      end: { row, column: parser.originalLength},
    },
  };

  return result;
}

function processUnknownKeyword(lineInfo: LineInfo) {
  const message: ValidationMessage = {
    excerpt: "Unknown filter keyword.",
    url: "http://pathofexile.gamepedia.com/Item_filter_guide",
    file: lineInfo.file,
    range: lineInfo.keyword.range,
  };

  const result: Filter.UnknownLine = {
    type: "unknown",
    range: lineInfo.range,
    invalid: true,
    text: lineInfo.line.substr(lineInfo.parser.textStartIndex, lineInfo.parser.textEndIndex),
    messages: {
      errors: [message],
      warnings: [],
      info: [],
    },
  };
  return result;
}

function processUnparseableKeyword(parser: LineParser, line: string, range:
    Filter.Range, file?: string) {
  const message: ValidationMessage = {
    excerpt: "Unreadable keyword, likely due to a stray character.",
    url: "http://pathofexile.gamepedia.com/Item_filter_guide",
    file,
    range,
  };

  const result: Filter.UnknownLine = {
    type: "unknown",
    text: line.substr(parser.textStartIndex, parser.textEndIndex),
    range,
    invalid: true,
    messages: {
      errors: [message],
      warnings: [],
      info: [],
    },
  };
  return result;
}

/** Processes the given line, returning a single line item filter line. */
function processLine({ line, row, file, data }: ProcessLine): Filter.Line {
  const parser = new LineParser(line, row);

  if (parser.empty) {
    return processEmptyLine(parser, row);
  }

  if (parser.isCommented()) {
    return processLineComment(parser);
  }

  const range: Filter.Range = {
    start: { row, column: parser.textStartIndex },
    end: { row, column: parser.textEndIndex },
  };

  const keywordResult = parser.nextWord();
  let keyword: Filter.Keyword;
  if (keywordResult.found) {
    keyword = { text: keywordResult.value, range: keywordResult.range };
  } else {
    return processUnparseableKeyword(parser, line, range, file);
  }

  const lineInfo: LineInfo = {
    line, row, file, data, parser, keyword, range,
    invalid: false,
    messages: { errors: [], warnings: [], info: [] },
  };

  switch (keywordResult.value) {
    case "Show":
      return processShowBlock(lineInfo);
    case "Hide":
      return processHideBlock(lineInfo);
    case "ItemLevel":
      return processItemLevelRule(lineInfo);
    case "DropLevel":
      return processDropLevelRule(lineInfo);
    case "Quality":
      return processQualityRule(lineInfo);
    case "Rarity":
      return processRarityRule(lineInfo);
    case "Class":
      return processClassRule(lineInfo);
    case "BaseType":
      return processBaseTypeRule(lineInfo);
    case "Sockets":
      return processSocketsRule(lineInfo);
    case "LinkedSockets":
      return processLinkedSocketsRule(lineInfo);
    case "SocketGroup":
      return processSocketGroup(lineInfo);
    case "Height":
      return processHeightRule(lineInfo);
    case "Width":
      return processWidthRule(lineInfo);
    case "Identified":
      return processIdentifiedRule(lineInfo);
    case "Corrupted":
      return processCorruptedRule(lineInfo);
    case "ElderItem":
      return processElderItemRule(lineInfo);
    case "ShaperItem":
      return processShaperItemRule(lineInfo);
    case "ShapedMap":
      return processShapedMapRule(lineInfo);
    case "ElderMap":
      return processElderMapRule(lineInfo);
    case "SetBorderColor":
      return processSetBorderColorRule(lineInfo);
    case "SetTextColor":
      return processSetTextColorRule(lineInfo);
    case "SetBackgroundColor":
      return processSetBackgroundColorRule(lineInfo);
    case "PlayAlertSound":
    case "PlayAlertSoundPositional":
      return processPlayAlertSoundRule(lineInfo);
    case "SetFontSize":
      return processSetFontSizeRule(lineInfo);
    default:
      return processUnknownKeyword(lineInfo);
  }
}

/** Processes each of the given lives, returning a segment of an item filter. */
export function processLines({ lines, data, row, file }: ProcessLines) {
  const result: Filter.Line[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    result.push(processLine({
      line,
      row: row + i,
      file,
      data,
    }));
  }

  return result;
}
