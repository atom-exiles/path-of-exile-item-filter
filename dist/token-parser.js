"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const numberRegex = /^(\s*)([-0-9]+)(\s|$)/;
const wordRegex = /^(\s*)([A-Za-z\u00F6]+)(\s|$)/;
const stringRegex = /^(\s*)("[^"]*"|[^\s\"\'><=]+)(\s|$)/;
const commentRegex = /^(\s*)((#.*\S+)|(#\s*))(\s*)$/;
const operatorRegex = /^(\s*)(<=|>=|=|<|>){1}(\s+|$)/;
const booleanRegex = /^(\s*)("true"|true|"false"|false)(\s+|$)/i;
const quotationRegex = /^"([^\"]*)"$/;
const textRegex = /\S+/;
const eolRegex = /\r|\n/;
const surroundingWSRegex = /^(\s*)(.*\S)\s*$/;
class TokenParser {
    constructor(text, row, startingIndex = 0) {
        if (eolRegex.test(text))
            throw new Error("string spans multiple lines");
        this.text = startingIndex === 0 ? text : text.slice(startingIndex);
        this.row = row;
        this.currentIndex = startingIndex;
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
    getTextRange() {
        return {
            start: {
                row: this.row,
                column: this.textStartIndex
            },
            end: {
                row: this.row,
                column: this.textEndIndex
            }
        };
    }
    getRemainingTextRange() {
        return {
            start: {
                row: this.row,
                column: this.currentIndex
            },
            end: {
                row: this.row,
                column: this.textEndIndex
            }
        };
    }
    getTextStartToEndRange() {
        return {
            start: {
                row: this.row,
                column: this.textStartIndex
            },
            end: {
                row: this.row,
                column: this.originalLength
            }
        };
    }
    isCommented() {
        const result = this.text.search(commentRegex);
        if (result === -1) {
            return false;
        }
        else {
            return true;
        }
    }
    isEmpty() {
        return this.empty;
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
        const regexResult = regex.exec(this.text);
        if (!regexResult)
            return undefined;
        const leadingWS = regexResult[1];
        const value = regexResult[2];
        const shiftBy = leadingWS.length + value.length;
        const range = {
            start: { row: this.row, column: this.currentIndex + leadingWS.length },
            end: { row: this.row, column: this.currentIndex + shiftBy }
        };
        this.text = this.text.slice(shiftBy);
        this.currentIndex += shiftBy;
        if (!textRegex.test(this.text)) {
            this.empty = true;
        }
        return { value, range };
    }
    nextNumber() {
        const result = this.parseSingleValue(numberRegex);
        if (result) {
            const value = parseInt(result.value, 10);
            const range = result.range;
            return { value, range };
        }
        else {
            return undefined;
        }
    }
    nextBoolean() {
        const result = this.parseSingleValue(booleanRegex);
        if (result) {
            const value = result.value.toLowerCase().indexOf("true") === -1 ? false : true;
            const range = result.range;
            return { value, range };
        }
        else {
            return undefined;
        }
    }
    nextOperator() {
        return this.parseSingleValue(operatorRegex);
    }
    nextWord() {
        return this.parseSingleValue(wordRegex);
    }
    nextString() {
        const result = this.parseSingleValue(stringRegex);
        if (result) {
            const quotationResult = quotationRegex.exec(result.value);
            if (quotationResult)
                result.value = quotationResult[1];
            return result;
        }
        else {
            return undefined;
        }
    }
    parseComment() {
        return this.parseSingleValue(commentRegex);
    }
}
exports.TokenParser = TokenParser;
