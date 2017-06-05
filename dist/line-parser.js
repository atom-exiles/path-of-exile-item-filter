"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
class ParseResult {
    constructor() {
        this._found = false;
    }
    get value() {
        if (this._found) {
            return this._value;
        }
        else {
            throw new Error("access violation for the value of a ParseResult");
        }
    }
    set value(v) {
        this._value = v;
        if (this._range != null) {
            this._found = true;
        }
    }
    get range() {
        if (this._found) {
            return this._range;
        }
        else {
            throw new Error("access violation for the range of a ParseResult");
        }
    }
    set range(r) {
        this._range = r;
        if (this._value != null) {
            this._found = true;
        }
    }
    get found() {
        return this._found;
    }
}
class LineParser {
    constructor(text, row) {
        if (eolRegex.test(text))
            throw new Error("string spans multiple lines");
        this.text = text;
        this.row = row;
        this.currentIndex = 0;
        this.originalLength = text.length;
        if (textRegex.test(text)) {
            const surroundingResult = surroundingWSRegex.exec(text);
            if (!surroundingResult)
                throw new Error("unexpected RegExp result");
            this.textStartIndex = surroundingResult[1].length;
            this.textEndIndex = this.textStartIndex + surroundingResult[2].length;
            this.empty = false;
        }
        else {
            this.textStartIndex = 0;
            this.textEndIndex = 0;
            this.empty = true;
        }
    }
    isCommented() {
        let result = this.text.search(commentRegex);
        if (result == -1) {
            return false;
        }
        else {
            return true;
        }
    }
    isIgnored() {
        if (this.empty || this.isCommented()) {
            return true;
        }
        else {
            return false;
        }
    }
    parseSingleValue(regex) {
        const result = new ParseResult();
        const regexResult = regex.exec(this.text);
        if (!regexResult)
            return result;
        const leadingWS = regexResult[1];
        const value = regexResult[2];
        const shiftBy = leadingWS.length + value.length;
        result.value = value;
        result.range = {
            start: { row: this.row, column: this.currentIndex + leadingWS.length },
            end: { row: this.row, column: this.currentIndex + shiftBy }
        };
        this.text = this.text.substr(shiftBy);
        this.currentIndex += shiftBy;
        if (!textRegex.test(this.text)) {
            this.empty = true;
        }
        return result;
    }
    nextNumber() {
        const result = this.parseSingleValue(numberRegex);
        const output = new ParseResult();
        if (result.found) {
            output.value = parseInt(result.value, 10);
            output.range = result.range;
        }
        return output;
    }
    nextBoolean() {
        const result = this.parseSingleValue(booleanRegex);
        const output = new ParseResult();
        if (result.found) {
            if (result.value.toLowerCase().indexOf('true') != -1) {
                output.value = true;
            }
            else {
                output.value = false;
            }
            output.range = result.range;
        }
        return output;
    }
    nextOperator() {
        return this.parseSingleValue(operatorRegex);
    }
    nextWord() {
        return this.parseSingleValue(wordRegex);
    }
    nextString() {
        const result = this.parseSingleValue(stringRegex);
        if (result.found && result.value) {
            const quotationResult = quotationRegex.exec(result.value);
            if (quotationResult)
                result.value = quotationResult[2];
        }
        return result;
    }
    parseComment() {
        return this.parseSingleValue(commentRegex);
    }
}
exports.default = LineParser;
