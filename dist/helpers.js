"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isItemFilter(editor) {
    let grammar = editor.getGrammar();
    if (grammar.scopeName === "source.poe") {
        return true;
    }
    else {
        return false;
    }
}
exports.isItemFilter = isItemFilter;
var Guards;
(function (Guards) {
    var FilterElements;
    (function (FilterElements) {
        function isBlock(line) {
            if (line.type === "block")
                return true;
            else
                return false;
        }
        FilterElements.isBlock = isBlock;
        function isRule(line) {
            if (line.type === "rule")
                return true;
            else
                return false;
        }
        FilterElements.isRule = isRule;
        function isEmpty(line) {
            if (line.type === "empty")
                return true;
            else
                return false;
        }
        FilterElements.isEmpty = isEmpty;
        function isLineComment(line) {
            if (line.type === "comment")
                return true;
            else
                return false;
        }
        FilterElements.isLineComment = isLineComment;
        function isUnknown(line) {
            if (line.type === "unknown")
                return true;
            else
                return false;
        }
        FilterElements.isUnknown = isUnknown;
        function isShowBlock(line) {
            if (isBlock(line)) {
                if (line.ruleType === "show")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isShowBlock = isShowBlock;
        function isHideBlock(line) {
            if (isBlock(line)) {
                if (line.ruleType === "hide")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isHideBlock = isHideBlock;
        function isFilterRule(line) {
            if (isRule(line)) {
                if (line.ruleType === "filter")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isFilterRule = isFilterRule;
        function isItemLevelRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "ItemLevel")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isItemLevelRule = isItemLevelRule;
        function isDropLevelRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "DropLevel")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isDropLevelRule = isDropLevelRule;
        function isQualityRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "Quality")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isQualityRule = isQualityRule;
        function isRarityRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "Rarity")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isRarityRule = isRarityRule;
        function isClassRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "Class")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isClassRule = isClassRule;
        function isBaseTypeRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "BaseType")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isBaseTypeRule = isBaseTypeRule;
        function isSocketsRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "Sockets")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isSocketsRule = isSocketsRule;
        function isLinkedSocketsRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "LinkedSockets")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isLinkedSocketsRule = isLinkedSocketsRule;
        function isSocketGroupRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "SocketGroup")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isSocketGroupRule = isSocketGroupRule;
        function isHeightRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "Height")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isHeightRule = isHeightRule;
        function isWidthRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "Width")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isWidthRule = isWidthRule;
        function isIdentifiedRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "Identified")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isIdentifiedRule = isIdentifiedRule;
        function isCorruptedRule(line) {
            if (isFilterRule(line)) {
                if (line.filterName === "Corrupted")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isCorruptedRule = isCorruptedRule;
        function isActionRule(line) {
            if (isRule(line)) {
                if (line.ruleType === "action")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isActionRule = isActionRule;
        function isSetBorderColorRule(line) {
            if (isActionRule(line)) {
                if (line.actionName === "SetBorderColor")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isSetBorderColorRule = isSetBorderColorRule;
        function isSetTextColorRule(line) {
            if (isActionRule(line)) {
                if (line.actionName === "SetTextColor")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isSetTextColorRule = isSetTextColorRule;
        function isSetBackgroundColorRule(line) {
            if (isActionRule(line)) {
                if (line.actionName === "SetBackgroundColor")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isSetBackgroundColorRule = isSetBackgroundColorRule;
        function isPlayAlertSoundRule(line) {
            if (isActionRule(line)) {
                if (line.actionName === "PlayAlertSound")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isPlayAlertSoundRule = isPlayAlertSoundRule;
        function isSetFontSizeRule(line) {
            if (isActionRule(line)) {
                if (line.actionName === "SetFontSize")
                    return true;
                else
                    return false;
            }
            else {
                return false;
            }
        }
        FilterElements.isSetFontSizeRule = isSetFontSizeRule;
    })(FilterElements = Guards.FilterElements || (Guards.FilterElements = {}));
    function isTextSuggestion(suggestion) {
        return suggestion.text !== undefined;
    }
    Guards.isTextSuggestion = isTextSuggestion;
    function isSnippetSuggestion(suggestion) {
        return suggestion.snippet !== undefined;
    }
    Guards.isSnippetSuggestion = isSnippetSuggestion;
})(Guards = exports.Guards || (exports.Guards = {}));
