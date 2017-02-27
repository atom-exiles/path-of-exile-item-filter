"use strict";
const atom_1 = require("atom");
const assert = require("assert");
class LineParser {
    constructor(text) {
        this.numberRegex = new RegExp("^(\\s*)([-0-9]+)(\\s|$)");
        this.wordRegex = new RegExp("^(\\s*)([A-Za-z\u00F6]+)(\\s|$)");
        this.stringRegex = /^(\s*)("[^"]*"|[^\s\"\'><=]+)(\s|$)/;
        this.eolRegex = new RegExp("(\r|\n)");
        this.commentRegex = /^(\s*)((#.*\S+)|(#\s*))(\s*)$/;
        this.textRegex = new RegExp("\\S+");
        this.operatorRegex = new RegExp("^(\\s*)(<=|>=|=|<|>){1}(\\s+|$)");
        this.quotationRegex = /^(")([^\"]*)(")$/;
        this.booleanRegex = new RegExp("^(\\s*)(\"true\"|true|\"false\"|false)(\\s+|$)", "i");
        this.surroundingWSRegex = new RegExp("^(\\s*)(.*\\S)\\s*$");
        assert(text != undefined, "fed undefined text");
        this.text = text;
        this.currentIndex = 0;
        this.originalLength = text.length;
        if (this.eolRegex.test(this.text)) {
            throw new Error("LineParser given string containing multiple lines.");
        }
        if (this.textRegex.test(this.text)) {
            const surroundingResult = this.surroundingWSRegex.exec(this.text);
            var leadingWS = "";
            var payload = "";
            if (surroundingResult !== null) {
                if (surroundingResult.length >= 3) {
                    leadingWS = surroundingResult[1];
                    payload = surroundingResult[2];
                }
            }
            if (leadingWS) {
                this.textStartIndex = leadingWS.length;
            }
            else {
                this.textStartIndex = 0;
            }
            this.textEndIndex = this.textStartIndex + payload.length - 1;
            this.empty = false;
        }
        else {
            this.textStartIndex = 0;
            this.textEndIndex = 0;
            this.empty = true;
        }
    }
    getCurrentIndex() {
        return this.currentIndex;
    }
    getText() {
        return this.text;
    }
    isEmpty() {
        return this.empty;
    }
    isCommented() {
        const result = this.text.search(this.commentRegex);
        if (result == -1) {
            return false;
        }
        else {
            return true;
        }
    }
    isIgnored() {
        if (this.isEmpty() || this.isCommented()) {
            return true;
        }
        else {
            return false;
        }
    }
    parseSingleValue(regex) {
        var result = { found: false, startIndex: 0, endIndex: 0 };
        const regexResult = regex.exec(this.text);
        if (!regexResult)
            return result;
        var leadingWS = regexResult[1];
        if (!leadingWS)
            leadingWS = "";
        result.value = regexResult[2];
        result.found = true;
        const shiftBy = leadingWS.length + result.value.length;
        result.startIndex = this.currentIndex + leadingWS.length;
        result.endIndex = this.currentIndex + shiftBy;
        this.text = this.text.substr(shiftBy);
        this.currentIndex += shiftBy;
        if (!this.textRegex.test(this.text)) {
            this.empty = true;
        }
        return result;
    }
    nextNumber() {
        const result = this.parseSingleValue(this.numberRegex);
        const output = { found: result.found,
            startIndex: result.startIndex, endIndex: result.endIndex };
        if (result.found && result.value) {
            output.value = parseInt(result.value, 10);
        }
        return output;
    }
    nextBoolean() {
        const result = this.parseSingleValue(this.booleanRegex);
        const output = { found: result.found,
            startIndex: result.startIndex, endIndex: result.endIndex };
        if (result.found && result.value) {
            if (result.value.toLowerCase().indexOf("true") != -1) {
                output.value = true;
            }
            else {
                output.value = false;
            }
        }
        return output;
    }
    nextOperator() {
        return this.parseSingleValue(this.operatorRegex);
    }
    nextWord() {
        return this.parseSingleValue(this.wordRegex);
    }
    nextString() {
        var result = this.parseSingleValue(this.stringRegex);
        if (result.found && result.value) {
            const quotationResult = this.quotationRegex.exec(result.value);
            if (quotationResult)
                result.value = quotationResult[2];
        }
        return result;
    }
    parseComment() {
        return this.parseSingleValue(this.commentRegex);
    }
}
function expectEqualityOp(parser, line) {
    var result = undefined;
    var operator = parser.nextOperator();
    if (operator.found && operator.value != "=") {
        result = {
            type: "Error",
            text: "Invalid operator for \"" + line.keyword +
                "\". Only the equality operator (=) is supported for this rule.",
            filePath: line.file,
            range: new atom_1.Range([line.number, operator.startIndex], [line.number, operator.endIndex])
        };
    }
    return result;
}
function processAlertSoundRule(parser, line) {
    var result = {
        messages: [],
        invalid: false,
        values: []
    };
    const operatorMessage = expectEqualityOp(parser, line);
    if (operatorMessage) {
        result.messages.push(operatorMessage);
        return result;
    }
    const retVal = parser.nextNumber();
    if (!retVal.found) {
        result.messages.push({
            type: "Error",
            text: "Invalid format. Expected \"" + line.keyword +
                " <Value> [Value]\".",
            filePath: line.file,
            range: new atom_1.Range([line.number, parser.textStartIndex], [line.number, parser.originalLength])
        });
        return result;
    }
    const optVal = parser.nextNumber();
    var outputText = "Invalid value for rule \"" + line.keyword + "\". Expected ";
    if (retVal.value < 1 || retVal.value > 9) {
        var outputRange = new atom_1.Range([line.number, retVal.startIndex], [line.number, retVal.endIndex]);
        const text = outputText + "1-9.";
        result.messages.push({
            type: "Error",
            text: text,
            filePath: line.file,
            range: outputRange
        });
        result.invalid = true;
    }
    if (optVal.found && optVal.value != undefined && (optVal.value < 0 || optVal.value > 300)) {
        const text = outputText + "0-300.";
        var outputRange = new atom_1.Range([line.number, optVal.startIndex], [line.number, optVal.endIndex]);
        result.messages.push({
            type: "Error",
            text: text,
            filePath: line.file,
            range: outputRange
        });
        result.invalid = true;
    }
    if (!result.invalid) {
        const value = {
            value: retVal.value,
            range: new atom_1.Range([line.number, retVal.startIndex], [line.number, retVal.endIndex])
        };
        result.values.push(value);
        if (optVal.found && optVal.value) {
            const optional = {
                value: optVal.value,
                range: new atom_1.Range([line.number, optVal.startIndex], [line.number, optVal.endIndex])
            };
            result.values.push(optional);
        }
    }
    return result;
}
function processRGBARule(parser, line) {
    var result = {
        messages: [],
        invalid: false,
        values: []
    };
    const operatorMessage = expectEqualityOp(parser, line);
    if (operatorMessage) {
        result.messages.push(operatorMessage);
        return result;
    }
    const red = parser.nextNumber();
    const green = parser.nextNumber();
    const blue = parser.nextNumber();
    const alpha = parser.nextNumber();
    if (!red.found || !green.found || !blue.found) {
        result.messages.push({
            type: "Error",
            text: "Invalid format. Expected \"" + line.keyword +
                " <Red> <Green> <Blue> [Alpha]\".",
            filePath: line.file,
            range: new atom_1.Range([line.number, parser.textStartIndex], [line.number, parser.originalLength])
        });
        return result;
    }
    var partialMessage = {
        type: "Error",
        text: "Invalid value for rule \"" + line.keyword + "\". Expected 0-255.",
        filePath: line.file,
        range: undefined
    };
    if (red.value < 0 || red.value > 255) {
        partialMessage.range = new atom_1.Range([line.number, red.startIndex], [line.number, red.endIndex]);
        result.messages.push(partialMessage);
    }
    else if (green.value < 0 || green.value > 255) {
        partialMessage.range = new atom_1.Range([line.number, green.startIndex], [line.number, green.endIndex]);
        result.messages.push(partialMessage);
    }
    else if (blue.value < 0 || blue.value > 255) {
        partialMessage.range = new atom_1.Range([line.number, blue.startIndex], [line.number, blue.endIndex]);
        result.messages.push(partialMessage);
    }
    else if (alpha.found && (alpha.value < 0 || alpha.value > 255)) {
        partialMessage.range = new atom_1.Range([line.number, alpha.startIndex], [line.number, alpha.endIndex]);
        result.messages.push(partialMessage);
    }
    else {
        const r = {
            value: red.value,
            range: new atom_1.Range([line.number, red.startIndex], [line.number, red.endIndex])
        };
        const g = {
            value: green.value,
            range: new atom_1.Range([line.number, green.startIndex], [line.number, green.endIndex])
        };
        const b = {
            value: blue.value,
            range: new atom_1.Range([line.number, blue.startIndex], [line.number, blue.endIndex])
        };
        result.values.push(r, g, b);
        if (alpha.found) {
            const a = {
                value: alpha.value,
                range: new atom_1.Range([line.number, alpha.startIndex], [line.number, alpha.endIndex])
            };
            result.values.push(a);
        }
    }
    return result;
}
function processMultiStringRule(parser, line, expectedValues, caseSensitive) {
    var result = {
        messages: [],
        invalid: false,
        values: []
    };
    const operatorMessage = expectEqualityOp(parser, line);
    if (operatorMessage) {
        result.messages.push(operatorMessage);
        return result;
    }
    while (true) {
        const currentValue = parser.nextString();
        if (!currentValue.found && result.values.length == 0 && result.messages.length == 0) {
            result.messages.push({
                type: "Error",
                text: "Invalid format. Expected \"" + line.keyword +
                    " [Operator] <String>\".",
                filePath: line.file,
                range: new atom_1.Range([line.number, parser.textStartIndex], [line.number, parser.originalLength])
            });
            break;
        }
        if (!currentValue.found || !currentValue.value)
            break;
        var resultFound = false;
        for (var value of expectedValues) {
            if (caseSensitive) {
                if (value.includes(currentValue.value)) {
                    resultFound = true;
                }
            }
            else {
                if (value.toUpperCase().includes(currentValue.value.toUpperCase())) {
                    resultFound = true;
                }
            }
            if (resultFound) {
                const r = new atom_1.Range([line.number, currentValue.startIndex], [line.number, currentValue.endIndex]);
                const v = { value: currentValue.value, range: r };
                result.values.push(v);
                break;
            }
        }
        if (!resultFound) {
            result.messages.push({
                type: "Error",
                text: "Invalid value for \"" + line.keyword + "\" rule.",
                filePath: line.file,
                range: new atom_1.Range([line.number, currentValue.startIndex], [line.number, currentValue.endIndex])
            });
        }
    }
    return result;
}
function processSocketGroup(parser, line) {
    var result = {
        messages: [],
        invalid: false,
        values: []
    };
    const operatorMessage = expectEqualityOp(parser, line);
    if (operatorMessage) {
        result.messages.push(operatorMessage);
        return result;
    }
    var retVal = parser.nextString();
    if (!retVal.found || !retVal.value) {
        result.messages.push({
            type: "Error",
            text: "Invalid format. Expected \"" + line.keyword + " <Group>\".",
            filePath: line.file,
            range: new atom_1.Range([line.number, parser.textStartIndex], [line.number, parser.originalLength])
        });
    }
    else {
        const groupRegex = new RegExp("^[rgbw]{1,6}$", "i");
        if (groupRegex.test(retVal.value)) {
            const value = {
                value: retVal.value,
                range: new atom_1.Range([line.number, retVal.startIndex], [line.number, retVal.endIndex])
            };
            result.values.push(value);
        }
        else {
            result.messages.push({
                type: "Error",
                text: "Invalid value for \"" + line.keyword +
                    "\" rule. Valid characters are: R, B, G, W.",
                filePath: line.file,
                range: new atom_1.Range([line.number, retVal.startIndex], [line.number, retVal.endIndex])
            });
        }
    }
    return result;
}
function processOpNumberRule(parser, line, values) {
    var result = {
        messages: [],
        invalid: false,
        values: []
    };
    const operator = parser.nextOperator();
    if (operator.found && operator.value) {
        const r = new atom_1.Range([line.number, operator.startIndex], [line.number, operator.endIndex]);
        const op = { type: operator.value, range: r };
        result.operator = op;
    }
    const retVal = parser.nextNumber();
    if (!retVal.found || retVal.value == undefined) {
        result.messages.push({
            type: "Error",
            text: "Invalid format. Expected \"" + line.keyword + " [Operator] <Value>\".",
            filePath: line.file,
            range: new atom_1.Range([line.number, parser.textStartIndex], [line.number, parser.originalLength])
        });
        return result;
    }
    if (values.indexOf(retVal.value) != -1) {
        const value = {
            value: retVal.value,
            range: new atom_1.Range([line.number, retVal.startIndex], [line.number, retVal.endIndex])
        };
        result.values.push(value);
    }
    else {
        result.messages.push({
            type: "Error",
            text: "Invalid value for rule \"" + line.keyword + "\". Expected " +
                values.toString() + ".",
            filePath: line.file,
            range: new atom_1.Range([line.number, retVal.startIndex], [line.number, retVal.endIndex])
        });
    }
    return result;
}
function processStringRule(parser, line, expectedValues, caseSensitive) {
    var result = {
        messages: [],
        invalid: false,
        values: []
    };
    var operator = parser.nextOperator();
    if (operator.found && operator.value) {
        const op = {
            type: operator.value,
            range: new atom_1.Range([line.number, operator.startIndex], [line.number, operator.endIndex])
        };
        result.operator = op;
    }
    const retVal = parser.nextString();
    if (!retVal.found) {
        result.messages.push({
            type: "Error",
            text: "Invalid format. Expected \"" + line.keyword +
                " [Operator] <String>\".",
            filePath: line.file,
            range: new atom_1.Range([line.number, parser.textStartIndex], [line.number, parser.originalLength])
        });
        return result;
    }
    var matchFound = false;
    for (var s of expectedValues) {
        if (caseSensitive) {
            if (retVal.value == s) {
                matchFound = true;
            }
            else {
                continue;
            }
        }
        else {
            if (retVal.value && retVal.value.toLowerCase() == s.toLowerCase()) {
                matchFound = true;
            }
            else {
                continue;
            }
        }
    }
    if (matchFound && retVal.value) {
        const value = {
            value: retVal.value,
            range: new atom_1.Range([line.number, retVal.startIndex], [line.number, retVal.endIndex])
        };
        result.values.push(value);
    }
    else {
        result.messages.push({
            type: "Error",
            text: "Invalid value for \"" + line.keyword + "\" rule.",
            filePath: line.file,
            range: new atom_1.Range([line.number, retVal.startIndex], [line.number, retVal.endIndex])
        });
        result.invalid = true;
    }
    return result;
}
function processBooleanRule(parser, line) {
    var result = {
        messages: [],
        invalid: false,
        values: []
    };
    const operatorMessage = expectEqualityOp(parser, line);
    if (operatorMessage) {
        result.messages.push(operatorMessage);
        result.invalid = true;
        return result;
    }
    var retVal = parser.nextBoolean();
    if (!retVal.found) {
        result.messages.push({
            type: "Error",
            text: "Invalid format. Expected \"" + line.keyword + " <True|False>\".",
            filePath: line.file,
            range: new atom_1.Range([line.number, parser.textStartIndex], [line.number, parser.originalLength])
        });
    }
    else {
        const valueRange = new atom_1.Range([line.number, retVal.startIndex], [line.number, retVal.endIndex]);
        const value = {
            value: retVal.value,
            range: valueRange
        };
        result.values = [value];
    }
    return result;
}
function processRangeRule(parser, line, min, max) {
    var result = {
        invalid: false,
        messages: [],
        values: []
    };
    const operator = parser.nextOperator();
    if (!operator.found || !operator.value) {
        operator.value = "=";
    }
    else {
        result.operator = { type: operator.value, range: new atom_1.Range([line.number,
                operator.startIndex], [line.number, operator.endIndex]) };
    }
    const retVal = parser.nextNumber();
    if (!retVal.found || retVal.value == undefined) {
        result.messages.push({
            type: "Error",
            text: "Invalid format. Expected \"" + line.keyword +
                " [Operator] <Value>\".",
            filePath: line.file,
            range: new atom_1.Range([line.number, parser.textStartIndex], [line.number, parser.originalLength])
        });
    }
    else {
        if (retVal.value >= min && retVal.value <= max) {
            const r = new atom_1.Range([line.number, retVal.startIndex], [line.number, retVal.endIndex]);
            const value = { value: retVal.value, range: r };
            result.values = [value];
        }
        else {
            result.messages.push({
                type: "Error",
                text: "Invalid value for \"" + line.keyword + "\" rule. Expected "
                    + min + "-" + max + ".",
                filePath: line.file,
                range: new atom_1.Range([line.number, retVal.startIndex], [line.number, retVal.endIndex])
            });
        }
    }
    return result;
}
function processBlock(parser, line) {
    var result = {
        messages: [],
        invalid: false,
        values: []
    };
    if (parser.isCommented()) {
        const r = parser.parseComment();
        if (r.found && r.value) {
            result.trailingComment = {
                text: r.value,
                range: new atom_1.Range([line.number, r.startIndex], [line.number, r.endIndex])
            };
        }
    }
    else if (!parser.isIgnored()) {
        result.messages.push({
            type: "Warning",
            text: "Trailing text for a \"" + line.keyword + "\" block will be ignored.",
            filePath: line.file,
            range: new atom_1.Range([line.number, parser.getCurrentIndex()], [line.number, parser.originalLength])
        });
    }
    return result;
}
function parseLine(args) {
    const messages = [];
    const parser = new LineParser(args.lineText);
    const validBases = args.itemData.bases;
    const validClasses = args.itemData.classes;
    if (parser.isCommented()) {
        const commentRange = new atom_1.Range([args.row, parser.textStartIndex], [args.row,
            parser.textEndIndex]);
        const resultData = {
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
    if (parser.isEmpty()) {
        return {
            type: "Empty",
            data: {},
            invalid: false,
            messages: []
        };
    }
    const keywordResult = parser.nextWord();
    if (!keywordResult.found || !keywordResult.value) {
        messages.push({
            type: "Error",
            text: "Unreadable keyword, likely due to a stray character.",
            filePath: args.filePath,
            range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.originalLength])
        });
        const unknownRange = new atom_1.Range([args.row, parser.textStartIndex,
            args.row, parser.textEndIndex]);
        const unknownData = {
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
    const resultKeyword = {
        type: keyword,
        range: new atom_1.Range([args.row, keywordResult.startIndex], [args.row, keywordResult.endIndex])
    };
    var processResult = { invalid: false, messages: [],
        values: [] };
    const lineInfo = { number: args.row, file: args.filePath,
        keyword: keyword };
    var lineType;
    var lineData;
    var invalid = false;
    switch (keyword) {
        case "Show":
        case "Hide":
            {
                processResult = processBlock(parser, lineInfo);
                const ld = {
                    type: resultKeyword,
                    scope: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment
                };
                lineType = "Block";
                lineData = ld;
            }
            break;
        case "ItemLevel":
        case "DropLevel":
            {
                processResult = processRangeRule(parser, lineInfo, 0, 100);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "condition",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "Quality":
            {
                processResult = processRangeRule(parser, lineInfo, 0, 20);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "condition",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "Sockets":
            {
                processResult = processRangeRule(parser, lineInfo, 0, 6);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "condition",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "Height":
            {
                processResult = processRangeRule(parser, lineInfo, 1, 4);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "condition",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "Width":
            {
                processResult = processRangeRule(parser, lineInfo, 1, 2);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "condition",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "Identified":
        case "Corrupted":
            {
                processResult = processBooleanRule(parser, lineInfo);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "condition",
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "Rarity":
            {
                const rarities = ["Normal", "Magic", "Rare", "Unique"];
                processResult = processStringRule(parser, lineInfo, rarities, false);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "condition",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "LinkedSockets":
            {
                const values = [0, 2, 3, 4, 5, 6];
                processResult = processOpNumberRule(parser, lineInfo, values);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "condition",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "SocketGroup":
            {
                processResult = processSocketGroup(parser, lineInfo);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "condition",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "Class":
            {
                processResult = processMultiStringRule(parser, lineInfo, validClasses, false);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "condition",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "BaseType":
            {
                processResult = processMultiStringRule(parser, lineInfo, validBases, false);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "condition",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "SetFontSize":
            {
                processResult = processRangeRule(parser, lineInfo, 18, 45);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "action",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "SetBorderColor":
        case "SetTextColor":
        case "SetBackgroundColor":
            {
                processResult = processRGBARule(parser, lineInfo);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "action",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        case "PlayAlertSound":
            {
                processResult = processAlertSoundRule(parser, lineInfo);
                const ld = {
                    type: resultKeyword,
                    range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex]),
                    trailingComment: processResult.trailingComment,
                    category: "action",
                    operator: processResult.operator,
                    values: processResult.values
                };
                lineType = "Rule";
                lineData = ld;
            }
            break;
        default:
            messages.push({
                text: "Unknown filter keyword.",
                type: "Error",
                filePath: args.filePath,
                range: new atom_1.Range([args.row, keywordResult.startIndex], [args.row, keywordResult.endIndex])
            });
            const ld = {
                text: args.lineText,
                range: new atom_1.Range([args.row, parser.textStartIndex], [args.row, parser.textEndIndex])
            };
            lineType = "Unknown";
            lineData = ld;
            invalid = true;
            break;
    }
    if (processResult && processResult.messages.length > 0) {
        invalid = processResult.invalid;
        if (processResult.messages) {
            processResult.messages.forEach((message) => messages.push(message));
        }
    }
    return { type: lineType, data: lineData, invalid: invalid, messages: messages };
}
exports.parseLine = parseLine;
