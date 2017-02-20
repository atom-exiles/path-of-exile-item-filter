"use strict";
var atom_1 = require("atom");
var settings = require("./settings");
var data = require("./data");
var blocks = [
    {
        snippet: '##############################\n##  ${1:        Heading       }  ##\n##############################\n$2',
        displayText: '## Heading ##'
    },
    { snippet: 'Show\n  ${1:Filter}\n  ${2:Action}' },
    { snippet: 'Hide\n  ${1:Filter}' }
];
var filters = [
    { snippet: 'BaseType ${1:type}' },
    { snippet: 'Class ${1:class}' },
    { snippet: 'Rarity ${1:[operator]} ${2:rarity}' },
    { snippet: 'Identified ${1:True}' },
    { snippet: 'Corrupted ${1:True}' },
    { snippet: 'ItemLevel ${1:[operator]} ${2:level}' },
    { snippet: 'DropLevel ${1:[operator]} ${2:level}' },
    { snippet: 'Quality ${1:[operator]} ${2:quality}' },
    { snippet: 'Sockets ${1:[operator]} ${2:sockets}' },
    { snippet: 'LinkedSockets ${1:[operator]} ${2:links}' },
    { snippet: 'Height ${1:[operator]} ${2:height}' },
    { snippet: 'Width ${1:[operator]} ${2:width}' },
    { snippet: 'SocketGroup ${1:group}' }
];
var actions = [
    { snippet: 'SetBackgroundColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
    { snippet: 'SetBorderColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
    { snippet: 'SetTextColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
    { snippet: 'PlayAlertSound ${1:id} ${2:[volume]}' },
    { snippet: 'SetFontSize ${1:size}' }
];
var rarity = [
    { snippet: 'Normal' },
    { snippet: 'Magic' },
    { snippet: 'Rare' },
    { snippet: 'Unique' }
];
var operators = [
    { snippet: '>' },
    { snippet: '>=' },
    { snippet: '=' },
    { snippet: '<=' },
    { snippet: '<' }
];
var boolean = [
    { snippet: 'True' },
    { snippet: 'False' }
];
var blocksWithOperators = [
    'filter.item-level.poe',
    'filter.drop-level.poe',
    'filter.quality.poe',
    'filter.sockets.poe',
    'filter.linked-sockets.poe',
    'filter.height.poe',
    'filter.width.poe',
];
var defaults = [
    'Filter', 'Action',
    'type', 'class', 'rarity', 'True', 'level', 'quality', 'sockets', 'links',
    'height', 'width', 'group',
    'red', 'green', 'blue', '[alpha]', 'id', '[volume]', 'size',
    '[operator]'
];
var validBases = new Array();
var validClasses = new Array();
function updateItemData() {
    validBases = new Array();
    validClasses = new Array();
    data.itemData.forEach(function (value, key) {
        if (!validClasses.includes(key)) {
            if (key.indexOf(' ') != -1)
                validClasses.push({ snippet: '"' + key + '"',
                    displayText: key });
            else
                validClasses.push({ snippet: key, displayText: key });
        }
        value.forEach(function (v) {
            if (v.indexOf(' ') != -1)
                validBases.push({ snippet: '"' + v + '"',
                    displayText: v, leftLabel: key });
            else
                validBases.push({ snippet: v, displayText: v, leftLabel: key });
        });
    });
}
function reinjectClassWhitelist() {
}
function reinjectBaseWhitelist() {
}
function setupSubscriptions() {
    data.emitter.on("poe-did-update-item-data", updateItemData);
    data.emitter.on("poe-did-update-injected-classes", reinjectClassWhitelist);
    data.emitter.on("poe-did-update-injected-bases", reinjectBaseWhitelist);
    updateItemData();
    reinjectClassWhitelist();
    reinjectBaseWhitelist();
}
exports.setupSubscriptions = setupSubscriptions;
function removeSubscriptions() {
}
exports.removeSubscriptions = removeSubscriptions;
function isFirstToken(editor, position) {
    var line = editor.lineTextForBufferRow(position.row);
    var regex = new RegExp('^\\s*\\S+\\s*(\\S*)');
    var result = regex.exec(line);
    if (result) {
        var trailingText = result[1];
        if (trailingText.length > 0)
            return false;
        else
            return true;
    }
    else {
        return true;
    }
}
function isFirstValue(editor, position, hasOperator) {
    var line = editor.lineTextForBufferRow(position.row);
    var regex;
    if (hasOperator) {
        regex = new RegExp('^\\s*\\S+\\s*(>=|<=|>|<|=)?\\s*\\S*(.*)');
    }
    else {
        regex = new RegExp('^\\s*\\S+\\s*\\S*(.*)');
    }
    var result = regex.exec(line);
    if (result) {
        var trailingText = result[2];
        if (trailingText.length > 0)
            return false;
        else
            return true;
    }
    else {
        return true;
    }
}
function isPartialOperator(editor, position) {
    var leadingChar = editor.getTextInBufferRange([[position.row, position.column - 1], position]);
    if (leadingChar == ">" || leadingChar == "<")
        return true;
    else
        return false;
}
function getPrefix(editor, position) {
    var previousPositionScopes;
    if (position.column > 0) {
        var previousPosition = new atom_1.Point(position.row, position.column - 1);
        previousPositionScopes = editor.scopeDescriptorForBufferPosition(previousPosition).scopes;
    }
    var previousText = editor.getTextInBufferRange([[position.row, 0], position]);
    var prefix;
    if (previousPositionScopes && previousPositionScopes.indexOf('string.partial-quotation.poe') != -1) {
        var prefixRegex = /(\"[^"]*)$/;
        var result = prefixRegex.exec(previousText);
        if (result)
            prefix = result[1];
    }
    else if (previousPositionScopes && previousPositionScopes.indexOf('string.quotation.poe') != -1) {
        var stringRange = editor.bufferRangeForScopeAtCursor('string.quotation.poe');
        if (stringRange.end.column > position.column) {
            var prefixRegex = /(\"[^"]*)$/;
            var result = prefixRegex.exec(previousText);
            if (result)
                prefix = result[1];
        }
        else {
            var prefixRegex = /(\"[^"]*\")$/;
            var result = prefixRegex.exec(previousText);
            if (result)
                prefix = result[1];
        }
    }
    else {
        var prefixRegex = /([\s]*([^\s]*))*$/;
        var result = prefixRegex.exec(previousText);
        if (result)
            prefix = result[2];
    }
    if (prefix == undefined)
        prefix = '';
    return prefix;
}
function setReplacementPrefix(editor, position, prefix, suggestions) {
    for (var _i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
        var suggestion = suggestions_1[_i];
        var blockElement = false;
        for (var _a = 0, blocks_1 = blocks; _a < blocks_1.length; _a++) {
            var block = blocks_1[_a];
            if (suggestion.snippet == block.snippet) {
                var range = new atom_1.Range([position.row, 0], position);
                suggestion.replacementPrefix = editor.getTextInBufferRange(range);
                blockElement = true;
            }
        }
        if (!blockElement) {
            suggestion.replacementPrefix = prefix;
        }
    }
    return suggestions;
}
function pruneSuggestions(prefix, suggestions) {
    if (prefix.length == 0)
        return suggestions;
    var upperPrefix = prefix.toUpperCase();
    var prunedSuggestions = new Array();
    for (var _i = 0, suggestions_2 = suggestions; _i < suggestions_2.length; _i++) {
        var s = suggestions_2[_i];
        var text;
        if (s.snippet)
            text = s.snippet.toUpperCase();
        else if (s.text)
            text = s.text.toUpperCase();
        else
            continue;
        if (text.indexOf(upperPrefix) != -1)
            prunedSuggestions.push(s);
    }
    return prunedSuggestions;
}
function getSuggestions(args) {
    if (!settings.config.generalSettings.enableCompletion.get()) {
        return [];
    }
    var suggestions = new Array();
    var shouldPruneSuggestions = true;
    var prefix = getPrefix(args.editor, args.bufferPosition);
    var cursorScopes = args.scopeDescriptor.scopes;
    var topScope = cursorScopes[cursorScopes.length - 1];
    if (topScope == 'source.poe') {
        suggestions = suggestions.concat(blocks);
    }
    else if (topScope == 'line.empty.poe' || topScope == 'line.unknown.poe') {
        if (cursorScopes.indexOf('show.block.poe') != -1) {
            if (prefix == 'Action') {
                suggestions = suggestions.concat(actions);
                shouldPruneSuggestions = false;
            }
            else if (prefix == 'Filter') {
                suggestions = suggestions.concat(filters);
                shouldPruneSuggestions = false;
            }
            else {
                suggestions = suggestions.concat(blocks, actions, filters);
            }
        }
        else if (cursorScopes.indexOf('hide.block.poe') != -1) {
            if (prefix == 'Filter') {
                suggestions = suggestions.concat(filters);
                shouldPruneSuggestions = false;
            }
            else {
                suggestions = suggestions.concat(blocks, filters);
            }
        }
    }
    else {
        if (cursorScopes.indexOf('filter.rarity.poe') != -1) {
            if (prefix == '[operator]') {
                suggestions = suggestions.concat(operators, rarity);
                shouldPruneSuggestions = false;
            }
            else if (prefix == 'rarity') {
                suggestions = suggestions.concat(rarity);
                shouldPruneSuggestions = false;
            }
            else if (isFirstValue(args.editor, args.bufferPosition, true)) {
                suggestions = suggestions.concat(rarity);
            }
        }
        else if (cursorScopes.indexOf('filter.identified.poe') != -1) {
            if (!(prefix == "Identified")) {
                if (isFirstValue(args.editor, args.bufferPosition, true)) {
                    suggestions = suggestions.concat(boolean);
                }
            }
        }
        else if (cursorScopes.indexOf('filter.corrupted.poe') != -1) {
            if (!(prefix == "Corrupted")) {
                if (isFirstValue(args.editor, args.bufferPosition, true)) {
                    suggestions = suggestions.concat(boolean);
                }
            }
        }
        else if (cursorScopes.indexOf('filter.class.poe') != -1) {
            if (prefix == "class") {
                suggestions = suggestions.concat(validClasses);
                shouldPruneSuggestions = false;
            }
            else if (!(prefix == "Class")) {
                suggestions = suggestions.concat(validClasses);
            }
        }
        else if (cursorScopes.indexOf('filter.base-type.poe') != -1) {
            if (prefix == "type") {
                suggestions = suggestions.concat(validBases);
                shouldPruneSuggestions = false;
            }
            else if (!(prefix == "BaseType")) {
                suggestions = suggestions.concat(validBases);
            }
        }
        else {
            var numberValueRule = cursorScopes.indexOf('filter.item-level.poe') != 1 ||
                cursorScopes.indexOf('filter.drop-level.poe') != 1 ||
                cursorScopes.indexOf('filter.quality.poe') != 1 ||
                cursorScopes.indexOf('filter.socket.poe') != 1 ||
                cursorScopes.indexOf('filter.linked-sockets.poe') != 1 ||
                cursorScopes.indexOf('filter.height.poe') != 1 ||
                cursorScopes.indexOf('filter.width.poe') != 1;
            if (numberValueRule) {
                if (prefix == "[operator]") {
                    suggestions = suggestions.concat(operators);
                    shouldPruneSuggestions = false;
                }
            }
        }
    }
    setReplacementPrefix(args.editor, args.bufferPosition, prefix, suggestions);
    if (shouldPruneSuggestions) {
        suggestions = pruneSuggestions(prefix, suggestions);
    }
    return suggestions;
}
function removeConsecutiveQuotes(editor, position) {
    var leftCharLocation = new atom_1.Range([position.row, position.column - 1], position);
    var rightCharLocation = new atom_1.Range(position, [position.row,
        position.column + 1]);
    var leftChar = editor.getTextInBufferRange(leftCharLocation);
    var rightChar = editor.getTextInBufferRange(rightCharLocation);
    if (leftChar == '"' && rightChar == '"') {
        editor.setTextInBufferRange(rightCharLocation, "", { undo: 'skip' });
    }
}
function insertedSuggestion(params) {
    if (params.editor.hasMultipleCursors()) {
        var cursorPositions = params.editor.getCursorBufferPositions();
        for (var _i = 0, cursorPositions_1 = cursorPositions; _i < cursorPositions_1.length; _i++) {
            var cursorPosition = cursorPositions_1[_i];
            removeConsecutiveQuotes(params.editor, cursorPosition);
        }
    }
    else {
        var cursorPosition_1 = params.editor.getCursorBufferPosition();
        removeConsecutiveQuotes(params.editor, cursorPosition_1);
    }
}
exports.provider = {
    selector: '.source.poe',
    disableForSelector: '.source.poe .comment',
    inclusionPriority: 1,
    excludeLowerPriority: true,
    getSuggestions: getSuggestions,
    onDidInsertSuggestion: insertedSuggestion
};
