"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_parser_1 = require("./line-parser");
function reportTrailingText(lineInfo, severity = "error") {
    if (lineInfo.parser.empty)
        return;
    const range = {
        start: { row: lineInfo.row, column: lineInfo.parser.currentIndex },
        end: { row: lineInfo.row, column: lineInfo.parser.textEndIndex }
    };
    let container;
    let excerpt;
    if (severity == "error") {
        lineInfo.invalid = true;
        excerpt = "This trailing text will be considered an error by Path of Exile.";
        container = lineInfo.messages.errors;
    }
    else {
        excerpt = "This trailing text will be ignored by Path of Exile.";
        container = lineInfo.messages.warnings;
    }
    container.push({
        excerpt,
        file: lineInfo.file,
        url: "http://pathofexile.gamepedia.com/Item_filter_guide",
        range
    });
}
function expectEqualityOperator(lineInfo) {
    const operator = parseOperator(lineInfo);
    if (operator && operator.text != "=") {
        lineInfo.invalid = true;
        lineInfo.messages.errors.push({
            excerpt: "Invalid operator for the " + lineInfo.keyword.text + " rule.",
            description: "The " + lineInfo.keyword.text + " rule only supports equality comparisons. " +
                "Only the '=' operator can be used, though it is recommended that you don't " +
                "provide any operator at all.",
            file: lineInfo.file,
            range: operator.range,
            url: "http://pathofexile.gamepedia.com/Item_filter"
        });
    }
    return;
}
function expectMultipleStrings(lineInfo, validValues, whitelist) {
    let values = [];
    while (true) {
        const valueResult = lineInfo.parser.nextString();
        if (!valueResult.found) {
            if (values.length == 0 && !lineInfo.invalid) {
                lineInfo.invalid = true;
                lineInfo.messages.errors.push({
                    excerpt: "A string value was expected, yet not found.",
                    file: lineInfo.file,
                    url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
                    range: {
                        start: { row: lineInfo.row, column: lineInfo.parser.textStartIndex },
                        end: { row: lineInfo.row, column: lineInfo.parser.originalLength }
                    }
                });
            }
            break;
        }
        var found = false;
        for (var v of validValues) {
            if (v.includes(valueResult.value)) {
                found = true;
                break;
            }
        }
        if (!found) {
            for (var wv of whitelist) {
                if (wv.includes(valueResult.value)) {
                    found = true;
                    break;
                }
            }
        }
        if (found) {
            values.push({ value: valueResult.value, range: valueResult.range });
        }
        else {
            lineInfo.invalid = true;
            lineInfo.messages.errors.push({
                excerpt: "Invalid value for the given rule.",
                file: lineInfo.file,
                range: valueResult.range,
                url: "http://pathofexile.gamepedia.com/Item_filter#Conditions"
            });
        }
    }
    return values;
}
function parseBlock(lineInfo) {
    let trailingComment;
    if (lineInfo.parser.isCommented()) {
        const commentResult = lineInfo.parser.parseComment();
        if (commentResult.found) {
            trailingComment = { text: commentResult.value, range: commentResult.range };
        }
    }
    reportTrailingText(lineInfo, "warning");
    let result = {
        type: "block",
        keyword: lineInfo.keyword,
        trailingComment,
        invalid: false,
        messages: lineInfo.messages,
        range: lineInfo.range
    };
    return result;
}
function parseNumberInRange(lineInfo, min, max, required = true) {
    const numberResult = lineInfo.parser.nextNumber();
    if (numberResult.found) {
        if (numberResult.value >= min && numberResult.value <= max) {
            const result = {
                value: numberResult.value,
                range: numberResult.range
            };
            return result;
        }
        else {
            lineInfo.invalid = true;
            lineInfo.messages.errors.push({
                excerpt: "The given value is invalid. Value is expected to be between "
                    + min + " and " + max + ".",
                file: lineInfo.file,
                url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
                range: numberResult.range
            });
            return;
        }
    }
    else {
        if (required) {
            lineInfo.invalid = true;
            lineInfo.messages.errors.push({
                excerpt: "A number between " + min + " and " + max + " was expected, yet not found.",
                file: lineInfo.file,
                url: "http://pathofexile.gamepedia.com/Item_filter_guide#Conditions",
                range: {
                    start: { row: lineInfo.row, column: lineInfo.parser.textStartIndex },
                    end: { row: lineInfo.row, column: lineInfo.parser.originalLength }
                }
            });
        }
        return;
    }
}
function parseOperator(lineInfo) {
    let result;
    const operatorResult = lineInfo.parser.nextOperator();
    if (operatorResult.found) {
        result = {
            text: operatorResult.value,
            range: operatorResult.range
        };
    }
    return result;
}
function parseSingleNumberRule(lineInfo, min, max, equalityOnly = false) {
    let operator;
    if (equalityOnly) {
        expectEqualityOperator(lineInfo);
    }
    else {
        operator = parseOperator(lineInfo);
    }
    const value = parseNumberInRange(lineInfo, min, max);
    if (!lineInfo.invalid)
        reportTrailingText(lineInfo);
    return { operator, value };
}
function parseBooleanRule(lineInfo) {
    expectEqualityOperator(lineInfo);
    const booleanResult = lineInfo.parser.nextBoolean();
    let value;
    if (booleanResult.found) {
        value = { value: booleanResult.value, range: booleanResult.range };
    }
    else {
        lineInfo.invalid = true;
        lineInfo.messages.errors.push({
            excerpt: "A boolean value, either True or False, was expected, yet not found.",
            file: lineInfo.file,
            url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
            range: {
                start: { row: lineInfo.row, column: lineInfo.parser.textStartIndex },
                end: { row: lineInfo.row, column: lineInfo.parser.originalLength }
            }
        });
    }
    if (!lineInfo.invalid)
        reportTrailingText(lineInfo);
    return {
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        value
    };
}
function parseColorRule(lineInfo) {
    expectEqualityOperator(lineInfo);
    let red;
    if (!lineInfo.invalid)
        red = parseNumberInRange(lineInfo, 0, 255);
    let green;
    if (!lineInfo.invalid)
        green = parseNumberInRange(lineInfo, 0, 255);
    let blue;
    if (!lineInfo.invalid)
        blue = parseNumberInRange(lineInfo, 0, 255);
    let alpha;
    if (!lineInfo.invalid)
        alpha = parseNumberInRange(lineInfo, 0, 255, false);
    let trailingComment;
    if (!lineInfo.invalid) {
        const trailingCommentResult = lineInfo.parser.parseComment();
        if (trailingCommentResult.found) {
            trailingComment = { text: trailingCommentResult.value, range: trailingCommentResult.range };
        }
    }
    if (!lineInfo.invalid)
        reportTrailingText(lineInfo);
    return { red, green, blue, alpha, trailingComment };
}
function parseMultiStringRule(lineInfo, validValues, whitelist) {
    expectEqualityOperator(lineInfo);
    let values;
    if (!lineInfo.invalid) {
        values = expectMultipleStrings(lineInfo, validValues, whitelist);
    }
    let result;
    if (!lineInfo.invalid && values) {
        let valuesStartIndex = values[0].range.start.column;
        let valuesEndIndex = values[values.length - 1].range.end.column;
        result = {
            values,
            range: {
                start: { row: lineInfo.row, column: valuesStartIndex },
                end: { row: lineInfo.row, column: valuesEndIndex }
            }
        };
    }
    return result;
}
function processShowBlock(lineInfo) {
    const block = parseBlock(lineInfo);
    const showBlock = {
        type: block.type,
        ruleType: "show",
        keyword: block.keyword,
        range: block.range,
        trailingComment: block.trailingComment,
        messages: block.messages,
        invalid: block.invalid
    };
    return showBlock;
}
function processHideBlock(lineInfo) {
    const block = parseBlock(lineInfo);
    const hideBlock = {
        type: block.type,
        ruleType: "hide",
        keyword: block.keyword,
        range: block.range,
        trailingComment: block.trailingComment,
        messages: block.messages,
        invalid: block.invalid
    };
    return hideBlock;
}
function processItemLevelRule(lineInfo) {
    const { operator, value } = parseSingleNumberRule(lineInfo, 0, 100);
    const result = {
        type: "rule", ruleType: "filter", filterName: "ItemLevel",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, operator, value
    };
    return result;
}
function processDropLevelRule(lineInfo) {
    const { operator, value } = parseSingleNumberRule(lineInfo, 0, 100);
    const result = {
        type: "rule", ruleType: "filter", filterName: "DropLevel",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, operator, value
    };
    return result;
}
function processQualityRule(lineInfo) {
    const { operator, value } = parseSingleNumberRule(lineInfo, 0, 20);
    const result = {
        type: "rule", ruleType: "filter", filterName: "Quality",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, operator, value
    };
    return result;
}
function processRarityRule(lineInfo) {
    const operator = parseOperator(lineInfo);
    const valueResult = lineInfo.parser.nextString();
    let value;
    if (valueResult.found) {
        const validValues = ["Normal", "Magic", "Rare", "Unique"];
        if (validValues.includes(valueResult.value)) {
            value = { value: valueResult.value, range: valueResult.range };
        }
        else {
            lineInfo.invalid = true;
            lineInfo.messages.errors.push({
                excerpt: "The given value is invalid. The value is expected to be one of the following: " +
                    validValues.toString(),
                file: lineInfo.file,
                url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
                range: valueResult.range
            });
        }
    }
    else {
        lineInfo.invalid = true;
        lineInfo.messages.errors.push({
            excerpt: "An item rarity was expected to follow the keyword.",
            description: "Item rarities in Path of Exile include the following:" +
                "\n\n\tNormal\n\tMagic\n\tRare\n\tUnique",
            file: lineInfo.file,
            url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
            range: {
                start: { row: lineInfo.row, column: lineInfo.parser.textStartIndex },
                end: { row: lineInfo.row, column: lineInfo.parser.originalLength }
            }
        });
    }
    if (!lineInfo.invalid)
        reportTrailingText(lineInfo);
    const result = {
        type: "rule", ruleType: "filter", filterName: "Rarity",
        invalid: lineInfo.invalid, keyword: lineInfo.keyword, messages: lineInfo.messages,
        range: lineInfo.range, operator, value
    };
    return result;
}
function processClassRule(lineInfo) {
    const values = parseMultiStringRule(lineInfo, lineInfo.data.validClasses, lineInfo.data.classWhitelist);
    const result = {
        type: "rule", ruleType: "filter", filterName: "Class",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, values
    };
    return result;
}
function processBaseTypeRule(lineInfo) {
    const values = parseMultiStringRule(lineInfo, lineInfo.data.validBases, lineInfo.data.baseWhitelist);
    const result = {
        type: "rule", ruleType: "filter", filterName: "BaseType",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, values
    };
    return result;
}
function processSocketsRule(lineInfo) {
    const { operator, value } = parseSingleNumberRule(lineInfo, 0, 6);
    const result = {
        type: "rule", ruleType: "filter", filterName: "Sockets",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, operator, value
    };
    return result;
}
function processLinkedSocketsRule(lineInfo) {
    const operatorResult = lineInfo.parser.nextOperator();
    let operator;
    if (operatorResult.found) {
        operator = {
            text: operatorResult.value,
            range: operatorResult.range
        };
    }
    const valueResult = lineInfo.parser.nextNumber();
    let value;
    if (valueResult.found) {
        if (valueResult.value == 0 || (valueResult.value >= 2 && valueResult.value <= 6)) {
            value = { value: valueResult.value, range: valueResult.range };
        }
        else {
            lineInfo.invalid = true;
            lineInfo.messages.errors.push({
                excerpt: "The given value is invalid. Valid values are 0 and 2-6.",
                file: lineInfo.file,
                url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
                range: valueResult.range
            });
        }
    }
    else {
        lineInfo.invalid = true;
        lineInfo.messages.errors.push({
            excerpt: "A number was expected, yet not found. Valid values are 0 and 2-6.",
            file: lineInfo.file,
            url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
            range: {
                start: { row: lineInfo.row, column: lineInfo.parser.currentIndex },
                end: { row: lineInfo.row, column: lineInfo.parser.originalLength }
            }
        });
    }
    if (!lineInfo.invalid)
        reportTrailingText(lineInfo);
    const result = {
        type: "rule",
        ruleType: "filter",
        filterName: "LinkedSockets",
        range: lineInfo.range,
        operator,
        value,
        keyword: lineInfo.keyword,
        invalid: lineInfo.invalid,
        messages: lineInfo.messages
    };
    return result;
}
function processSocketGroup(lineInfo) {
    expectEqualityOperator(lineInfo);
    var value;
    if (!lineInfo.invalid) {
        const valueResult = lineInfo.parser.nextString();
        if (valueResult.found) {
            const groupRegex = new RegExp('^[rgbw]{1,6}$', 'i');
            if (groupRegex.test(valueResult.value)) {
                value = { range: valueResult.range, value: valueResult.value };
            }
            else {
                lineInfo.invalid = true;
                lineInfo.messages.errors.push({
                    excerpt: "The given value is invalid. A string consisting of the following characters was expected: R, B, G, W.",
                    file: lineInfo.file,
                    url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
                    range: {
                        start: { row: lineInfo.row, column: lineInfo.parser.currentIndex },
                        end: { row: lineInfo.row, column: lineInfo.parser.textEndIndex }
                    }
                });
            }
        }
        else {
            lineInfo.invalid = true;
            lineInfo.messages.errors.push({
                excerpt: "A socket group was expected to follow the keyword.",
                description: "A socket group is a word that consists of the following characters: R, B, G, W.",
                url: "http://pathofexile.gamepedia.com/Item_filter#Conditions",
                range: {
                    start: { row: lineInfo.row, column: lineInfo.parser.currentIndex },
                    end: { row: lineInfo.row, column: lineInfo.parser.textEndIndex }
                }
            });
        }
    }
    if (!lineInfo.invalid) {
        reportTrailingText(lineInfo);
    }
    const result = {
        type: "rule", ruleType: "filter", filterName: "SocketGroup",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, value
    };
    return result;
}
function processHeightRule(lineInfo) {
    const { operator, value } = parseSingleNumberRule(lineInfo, 1, 4);
    const result = {
        type: "rule", ruleType: "filter", filterName: "Height",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, operator, value
    };
    return result;
}
function processWidthRule(lineInfo) {
    const { operator, value } = parseSingleNumberRule(lineInfo, 1, 2);
    const result = {
        type: "rule", ruleType: "filter", filterName: "Width",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, operator, value
    };
    return result;
}
function processIdentifiedRule(lineInfo) {
    const { keyword, value, invalid, messages } = parseBooleanRule(lineInfo);
    const result = {
        type: "rule", ruleType: "filter", filterName: "Identified",
        keyword, range: lineInfo.range, value, invalid, messages
    };
    return result;
}
function processCorruptedRule(lineInfo) {
    const { keyword, value, invalid, messages } = parseBooleanRule(lineInfo);
    const result = {
        type: "rule", ruleType: "filter", filterName: "Corrupted",
        keyword, range: lineInfo.range, value, invalid, messages
    };
    return result;
}
function processSetBorderColorRule(lineInfo) {
    const { red, green, blue, alpha, trailingComment } = parseColorRule(lineInfo);
    const result = {
        type: "rule", ruleType: "action", actionName: "SetBorderColor",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, red, green, blue, alpha, trailingComment
    };
    return result;
}
function processSetTextColorRule(lineInfo) {
    const { red, green, blue, alpha, trailingComment } = parseColorRule(lineInfo);
    const result = {
        type: "rule", ruleType: "action", actionName: "SetTextColor",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, red, green, blue, alpha, trailingComment
    };
    return result;
}
function processSetBackgroundColorRule(lineInfo) {
    const { red, green, blue, alpha, trailingComment } = parseColorRule(lineInfo);
    const result = {
        type: "rule", ruleType: "action", actionName: "SetBackgroundColor",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, red, green, blue, alpha, trailingComment
    };
    return result;
}
function processPlayAlertSoundRule(lineInfo) {
    expectEqualityOperator(lineInfo);
    const id = parseNumberInRange(lineInfo, 1, 9);
    let volume;
    if (!lineInfo.invalid) {
        volume = parseNumberInRange(lineInfo, 0, 300, false);
    }
    let trailingComment;
    if (!lineInfo.invalid) {
        const trailingCommentResult = lineInfo.parser.parseComment();
        if (trailingCommentResult.found) {
            trailingComment = { text: trailingCommentResult.value, range: trailingCommentResult.range };
        }
    }
    if (!lineInfo.invalid)
        reportTrailingText(lineInfo);
    const result = {
        type: "rule", ruleType: "action", actionName: "PlayAlertSound",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, id, volume, trailingComment
    };
    return result;
}
function processSetFontSizeRule(lineInfo) {
    const { value } = parseSingleNumberRule(lineInfo, 18, 45, true);
    if (!lineInfo.invalid)
        reportTrailingText(lineInfo);
    const result = {
        type: "rule", ruleType: "action", actionName: "SetFontSize",
        keyword: lineInfo.keyword, invalid: lineInfo.invalid, messages: lineInfo.messages,
        range: lineInfo.range, value
    };
    return result;
}
function processLineComment(parser) {
    const commentResult = parser.parseComment();
    if (commentResult.found) {
        var text = commentResult.value;
        var range = commentResult.range;
    }
    else {
        throw new Error("expected a comment to immediately follow on the line");
    }
    const result = {
        type: "comment",
        invalid: false,
        text,
        range,
        messages: {
            errors: [],
            warnings: [],
            info: []
        }
    };
    return result;
}
function processEmptyLine(parser, row) {
    const result = {
        type: "empty",
        invalid: false,
        messages: { errors: [], warnings: [], info: [] },
        range: {
            start: { row, column: 0 },
            end: { row, column: parser.originalLength }
        }
    };
    return result;
}
function processUnknownKeyword(lineInfo) {
    const message = {
        excerpt: "Unknown filter keyword.",
        url: "http://pathofexile.gamepedia.com/Item_filter_guide",
        file: lineInfo.file,
        range: lineInfo.keyword.range
    };
    const result = {
        type: "unknown",
        range: lineInfo.range,
        invalid: true,
        text: lineInfo.line.substr(lineInfo.parser.textStartIndex, lineInfo.parser.textEndIndex),
        messages: {
            errors: [message],
            warnings: [],
            info: []
        }
    };
    return result;
}
function processUnparseableKeyword(parser, line, range, row, file) {
    const message = {
        excerpt: "Unreadable keyword, likely due to a stray character.",
        url: "http://pathofexile.gamepedia.com/Item_filter_guide",
        file,
        range
    };
    const result = {
        type: "unknown",
        text: line.substr(parser.textStartIndex, parser.textEndIndex),
        range,
        invalid: true,
        messages: {
            errors: [message],
            warnings: [],
            info: []
        }
    };
    return result;
}
function processLine({ line, row, file, data }) {
    const parser = new line_parser_1.default(line, row);
    if (parser.empty) {
        return processEmptyLine(parser, row);
    }
    if (parser.isCommented()) {
        return processLineComment(parser);
    }
    const range = {
        start: { row, column: parser.textStartIndex },
        end: { row, column: parser.textEndIndex }
    };
    const keywordResult = parser.nextWord();
    let keyword;
    if (keywordResult.found) {
        keyword = { text: keywordResult.value, range: keywordResult.range };
    }
    else {
        return processUnparseableKeyword(parser, line, range, row, file);
    }
    const lineInfo = {
        line, row, file, data, parser, keyword, range,
        invalid: false,
        messages: { errors: [], warnings: [], info: [] }
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
        case "SetBorderColor":
            return processSetBorderColorRule(lineInfo);
        case "SetTextColor":
            return processSetTextColorRule(lineInfo);
        case "SetBackgroundColor":
            return processSetBackgroundColorRule(lineInfo);
        case "PlayAlertSound":
            return processPlayAlertSoundRule(lineInfo);
        case "SetFontSize":
            return processSetFontSizeRule(lineInfo);
        default:
            return processUnknownKeyword(lineInfo);
    }
}
function processLines({ lines, data, row, file }) {
    const result = [];
    for (var i = 0; i < lines.length; i++) {
        const line = lines[i];
        result.push(processLine({
            line,
            row: row + i,
            file,
            data
        }));
    }
    return result;
}
exports.processLines = processLines;
