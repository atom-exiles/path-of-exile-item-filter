"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isItemFilter(editor) {
    const grammar = editor.getGrammar();
    if (grammar.scopeName === "source.filter") {
        return true;
    }
    else {
        return false;
    }
}
exports.isItemFilter = isItemFilter;
function isTextSuggestion(suggestion) {
    return suggestion.text !== undefined;
}
exports.isTextSuggestion = isTextSuggestion;
function isSnippetSuggestion(suggestion) {
    return suggestion.snippet !== undefined;
}
exports.isSnippetSuggestion = isSnippetSuggestion;
function isBlock(line) {
    return line.type === "block";
}
exports.isBlock = isBlock;
function isRule(line) {
    return line.type === "rule";
}
exports.isRule = isRule;
function isEmpty(line) {
    return line.type === "empty";
}
exports.isEmpty = isEmpty;
function isLineComment(line) {
    return line.type === "comment";
}
exports.isLineComment = isLineComment;
function isUnknown(line) {
    return line.type === "unknown";
}
exports.isUnknown = isUnknown;
function isShowBlock(line) {
    if (isBlock(line)) {
        return line.ruleType === "show";
    }
    else {
        return false;
    }
}
exports.isShowBlock = isShowBlock;
function isHideBlock(line) {
    if (isBlock(line)) {
        return line.ruleType === "hide";
    }
    else {
        return false;
    }
}
exports.isHideBlock = isHideBlock;
function isFilterRule(line) {
    if (isRule(line)) {
        return line.ruleType === "filter";
    }
    else {
        return false;
    }
}
exports.isFilterRule = isFilterRule;
function isItemLevelRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "ItemLevel";
    }
    else {
        return false;
    }
}
exports.isItemLevelRule = isItemLevelRule;
function isDropLevelRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "DropLevel";
    }
    else {
        return false;
    }
}
exports.isDropLevelRule = isDropLevelRule;
function isQualityRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "Quality";
    }
    else {
        return false;
    }
}
exports.isQualityRule = isQualityRule;
function isRarityRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "Rarity";
    }
    else {
        return false;
    }
}
exports.isRarityRule = isRarityRule;
function isClassRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "Class";
    }
    else {
        return false;
    }
}
exports.isClassRule = isClassRule;
function isBaseTypeRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "BaseType";
    }
    else {
        return false;
    }
}
exports.isBaseTypeRule = isBaseTypeRule;
function isSocketsRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "Sockets";
    }
    else {
        return false;
    }
}
exports.isSocketsRule = isSocketsRule;
function isLinkedSocketsRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "LinkedSockets";
    }
    else {
        return false;
    }
}
exports.isLinkedSocketsRule = isLinkedSocketsRule;
function isSocketGroupRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "SocketGroup";
    }
    else {
        return false;
    }
}
exports.isSocketGroupRule = isSocketGroupRule;
function isHeightRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "Height";
    }
    else {
        return false;
    }
}
exports.isHeightRule = isHeightRule;
function isWidthRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "Width";
    }
    else {
        return false;
    }
}
exports.isWidthRule = isWidthRule;
function isIdentifiedRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "Identified";
    }
    else {
        return false;
    }
}
exports.isIdentifiedRule = isIdentifiedRule;
function isCorruptedRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "Corrupted";
    }
    else {
        return false;
    }
}
exports.isCorruptedRule = isCorruptedRule;
function isElderItemRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "ElderItem";
    }
    else {
        return false;
    }
}
exports.isElderItemRule = isElderItemRule;
function isShaperItemRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "ShaperItem";
    }
    else {
        return false;
    }
}
exports.isShaperItemRule = isShaperItemRule;
function isShapedMapRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "ShapedMap";
    }
    else {
        return false;
    }
}
exports.isShapedMapRule = isShapedMapRule;
function isElderMapRule(line) {
    if (isFilterRule(line)) {
        return line.filterName === "ElderMap";
    }
    else {
        return false;
    }
}
exports.isElderMapRule = isElderMapRule;
function isActionRule(line) {
    if (isRule(line)) {
        return line.ruleType === "action";
    }
    else {
        return false;
    }
}
exports.isActionRule = isActionRule;
function isSetBorderColorRule(line) {
    if (isActionRule(line)) {
        return line.actionName === "SetBorderColor";
    }
    else {
        return false;
    }
}
exports.isSetBorderColorRule = isSetBorderColorRule;
function isSetTextColorRule(line) {
    if (isActionRule(line)) {
        return line.actionName === "SetTextColor";
    }
    else {
        return false;
    }
}
exports.isSetTextColorRule = isSetTextColorRule;
function isSetBackgroundColorRule(line) {
    if (isActionRule(line)) {
        return line.actionName === "SetBackgroundColor";
    }
    else {
        return false;
    }
}
exports.isSetBackgroundColorRule = isSetBackgroundColorRule;
function isPlayAlertSoundRule(line) {
    if (isActionRule(line)) {
        return line.actionName === "PlayAlertSound";
    }
    else {
        return false;
    }
}
exports.isPlayAlertSoundRule = isPlayAlertSoundRule;
function isSetFontSizeRule(line) {
    if (isActionRule(line)) {
        return line.actionName === "SetFontSize";
    }
    else {
        return false;
    }
}
exports.isSetFontSizeRule = isSetFontSizeRule;
