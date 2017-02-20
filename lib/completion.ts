import { Point, Range } from "atom";

import * as settings from "./settings";
import * as data from "./data";

interface SuggestionParams {
  editor: AtomCore.TextEditor
  bufferPosition: Point
  scopeDescriptor: AtomCore.ScopeDescriptor
  prefix: string
  activatedManually: boolean
}

interface TextInsertionParams {
  editor: AtomCore.TextEditor
  triggerPosition: Point
  suggestion: Suggestion
}

interface Suggestion {
  /** The text which will be inserted into the editor, in place of the prefix. */
  text?: string
  /** A snippet string. This will allow users to tab through function arguments
   *  or other options. */
  snippet?: string
  /** A string that will show in the UI for this suggestion. When not set,
   *  snippet || text is displayed. */
  displayText?: string
  /** The text immediately preceding the cursor, which will be replaced by the
   *  text. */
  replacementPrefix?: string
  /** The suggestion type. It will be converted into an icon shown against the
   *  suggestion. */
  type?: string
  /** This is shown before the suggestion. Useful for return values. */
  leftLabel?:  string
  /** Use this instead of leftLabel if you want to use html for the left label. */
  leftLabelHTML?: string
  /** An indicator (e.g. function, variable) denoting the "kind" of suggestion
   *  this represents. */
  rightLabel?: string
  /** Use this instead of rightLabel if you want to use html for the right label. */
  rightLabelHTML?: string
  /** Class name for the suggestion in the suggestion list. Allows you to style
   *  your suggestion via CSS, if desired. */
  className?: string
  /** If you want complete control over the icon shown against the suggestion.
   *  e.g. iconHTML: '<i class="icon-move-right"></i>' */
  iconHTML?: string
  /** A doc-string summary or short description of the suggestion. When specified,
   *  it will be displayed at the bottom of the suggestions list. */
  description?: string
  /** A url to the documentation or more information about this suggestion. When
   *  specified, a More.. link will be displayed in the description area. */
  descriptionMoreURL?: string
}

const blocks = [
  {
    snippet: '##############################\n##  ${1:        Heading       }  ##\n##############################\n$2',
    displayText: '## Heading ##'
  },
  { snippet: 'Show\n  ${1:Filter}\n  ${2:Action}' },
  { snippet: 'Hide\n  ${1:Filter}' }
]

const filters = [
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
]

const actions = [
  { snippet: 'SetBackgroundColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
  { snippet: 'SetBorderColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
  { snippet: 'SetTextColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
  { snippet: 'PlayAlertSound ${1:id} ${2:[volume]}' },
  { snippet: 'SetFontSize ${1:size}' }
]

const rarity = [
  { snippet: 'Normal' },
  { snippet: 'Magic' },
  { snippet: 'Rare' },
  { snippet: 'Unique' }
]

const operators = [
  { snippet: '>'},
  { snippet: '>='},
  { snippet: '='},
  { snippet: '<='},
  { snippet: '<'}
]

const boolean = [
  { snippet: 'True'},
  { snippet: 'False'}
]

// const excludedPrefixes = [
//   // filters
//   'Class',   'BaseType',      'ItemLevel',   'DropLevel', 'Quality', 'Rarity',
//   'Sockets', 'LinkedSockets', 'SocketGroup', 'Height',    'Width',   'Identified',
//   // actions
//   'PlayAlertSound', 'SetBackgroundColor', 'SetBorderColor', 'SetFontSize',
//   'SetTextColor',
//   // misc
//   '[operator]'
// ]

const blocksWithOperators = [
  'filter.item-level.poe',
  'filter.drop-level.poe',
  'filter.quality.poe',
  'filter.sockets.poe',
  'filter.linked-sockets.poe',
  'filter.height.poe',
  'filter.width.poe',
  // 'filter.rarity.poe'
]

const defaults = [
  'Filter', 'Action',
  // filters
  'type', 'class', 'rarity', 'True', 'level', 'quality', 'sockets', 'links',
  'height', 'width', 'group',
  // actions
  'red', 'green', 'blue', '[alpha]', 'id', '[volume]', 'size',
  // operators
  '[operator]'
]

var validBases = new Array<Suggestion>();
var validClasses = new Array<Suggestion>();

function updateItemData() {
  validBases = new Array<Suggestion>();
  validClasses = new Array<Suggestion>();

  data.itemData.forEach((value, key) => {
    if(!validClasses.includes(key)) {
      if(key.indexOf(' ') != -1) validClasses.push({ snippet: '"' + key + '"',
          displayText: key });
      else validClasses.push({ snippet: key, displayText: key });
    }
    value.forEach((v) => {
      if(v.indexOf(' ') != -1) validBases.push({ snippet: '"' + v + '"',
          displayText: v, leftLabel: key });
      else validBases.push({ snippet: v, displayText: v, leftLabel: key });
    });
  });
}

function reinjectClassWhitelist() {
}

function reinjectBaseWhitelist() {
}

export function setupSubscriptions() {
  data.emitter.on("poe-did-update-item-data", updateItemData);
  data.emitter.on("poe-did-update-injected-classes", reinjectClassWhitelist);
  data.emitter.on("poe-did-update-injected-bases", reinjectBaseWhitelist);

  updateItemData();
  reinjectClassWhitelist();
  reinjectBaseWhitelist();
}

export function removeSubscriptions() {

}

/** Determines whether or not text entered at the given position in the editor
 *  would be the first token for the filter rule which precedes that position. */
function isFirstToken(editor: AtomCore.TextEditor, position: Point): boolean {
  const line: string = editor.lineTextForBufferRow(position.row);
  const regex = new RegExp('^\\s*\\S+\\s*(\\S*)');
  const result = regex.exec(line);

  if(result) {
    const trailingText = result[1];
    if(trailingText.length > 0) return false;
    else return true;
  } else {
    return true;
  }
}

/** Determines whether or text entered at the given position in the editor
 *  would be the first value for the filter rule which precedes that position.*/
function isFirstValue(editor: AtomCore.TextEditor, position: Point,
    hasOperator: boolean): boolean {
  const line = editor.lineTextForBufferRow(position.row);
  var regex: RegExp;
  if(hasOperator) {
    regex = new RegExp('^\\s*\\S+\\s*(>=|<=|>|<|=)?\\s*\\S*(.*)');
  } else {
    regex = new RegExp('^\\s*\\S+\\s*\\S*(.*)');
  }

  const result = regex.exec(line);
  if(result) {
    const trailingText = result[2];
    if(trailingText.length > 0) return false;
    else return true;
  } else {
    return true;
  }
}

/** Returns whether or not the preceding characters at the given position in the
 *  editor can be combined with other characters to form a valid filter operator. */
function isPartialOperator(editor: AtomCore.TextEditor, position: Point): boolean {
  const leadingChar = editor.getTextInBufferRange(
      [[position.row, position.column - 1], position]);

  if(leadingChar == ">" || leadingChar == "<") return true;
  else return false;
}

/** Returns a prefix tailored towards loot filters, with support for things
 *  like value strings. */
function getPrefix(editor: AtomCore.TextEditor, position: Point): string {
  // The previous position in the editor is often a lot more useful than the
  // current ones, as it will contain the scopes for the value which the user
  // may still be editing.
  var previousPositionScopes: Array<string>|undefined;
  if(position.column > 0) {
    const previousPosition = new Point(position.row, position.column - 1);
    previousPositionScopes = editor.scopeDescriptorForBufferPosition(
        previousPosition).scopes;
  }

  const previousText = editor.getTextInBufferRange([[position.row, 0], position]);
  var prefix: string|undefined;
  if(previousPositionScopes && previousPositionScopes.indexOf(
      'string.partial-quotation.poe') != -1) {
    const prefixRegex = /(\"[^"]*)$/
    const result = prefixRegex.exec(previousText);
    if(result) prefix = result[1];

  } else if(previousPositionScopes && previousPositionScopes.indexOf(
      'string.quotation.poe') != -1) {
    // The closing quotation mark might be further in on the line, which
    // requires a different regex.
    const stringRange = editor.bufferRangeForScopeAtCursor('string.quotation.poe');
    if(stringRange.end.column > position.column) {
      const prefixRegex = /(\"[^"]*)$/
      const result = prefixRegex.exec(previousText);
      if(result) prefix = result[1];
    } else {
      const prefixRegex = /(\"[^"]*\")$/
      const result = prefixRegex.exec(previousText);
      if(result) prefix = result[1];
    }

  // Default back to using the previous word value. If the previous character
  // was a whitespace character, then use an empty prefix.
  } else {
    const prefixRegex = /([\s]*([^\s]*))*$/;
    const result = prefixRegex.exec(previousText);
    if(result) prefix = result[2];
  }

  if(prefix == undefined) prefix = '';
  return prefix;
}

/** Handles any special casing in regards to the prefix for autocompletion suggestions.
 *  For example, block elements will have the whitespace prepended onto the prefix,
 *  so that they are left aligned on column #0 on text insertion. */
function setReplacementPrefix(editor: AtomCore.TextEditor, position: Point,
    prefix: string, suggestions: Array<Suggestion>): Array<Suggestion> {

  for(var suggestion of suggestions) {
    var blockElement = false;

    for(var block of blocks) {
      if(suggestion.snippet == block.snippet) {
        const range = new Range([position.row, 0], position);
        suggestion.replacementPrefix = editor.getTextInBufferRange(range);
        blockElement = true;
      }
    }

    if(!blockElement) {
      suggestion.replacementPrefix = prefix;
    }
  }
  return suggestions;
}

/** Removes suggestions that do not contain the prefix. */
function pruneSuggestions(prefix: string, suggestions: Array<Suggestion>):
    Array<Suggestion> {
  if(prefix.length == 0) return suggestions;

  const upperPrefix = prefix.toUpperCase();
  const prunedSuggestions = new Array<Suggestion>();

  for(var s of suggestions) {
    var text: string;
    if(s.snippet) text = s.snippet.toUpperCase();
    else if(s.text) text = s.text.toUpperCase();
    else continue;

    if(text.indexOf(upperPrefix) != -1) prunedSuggestions.push(s);
  }
  return prunedSuggestions;
}

/** A callback which we provide to the autocompletion engine for Atom. */
function getSuggestions(args: SuggestionParams) {
  if(!settings.config.generalSettings.enableCompletion.get()) {
    return [];
  }

  var suggestions = new Array<Suggestion>();
  var shouldPruneSuggestions = true;
  const prefix = getPrefix(args.editor, args.bufferPosition);
  const cursorScopes = args.scopeDescriptor.scopes;
  const topScope = cursorScopes[
      cursorScopes.length - 1];

  // TODO(glen): we need to somehow support operators as they are being inputted.
  // User hasn't inputted a block.
  if(topScope == 'source.poe') {
    suggestions = suggestions.concat(blocks);
  } else if(topScope == 'line.empty.poe' || topScope == 'line.unknown.poe') {
    if(cursorScopes.indexOf('show.block.poe') != -1) {
      if(prefix == 'Action') {
        suggestions = suggestions.concat(actions);
        shouldPruneSuggestions = false;
      } else if(prefix == 'Filter') {
        suggestions = suggestions.concat(filters);
        shouldPruneSuggestions = false;
      } else {
        suggestions = suggestions.concat(blocks, actions, filters);
      }
    } else if(cursorScopes.indexOf('hide.block.poe') != -1) {
      if(prefix == 'Filter') {
        suggestions = suggestions.concat(filters);
        shouldPruneSuggestions = false;
      } else {
        suggestions = suggestions.concat(blocks, filters);
      }
    }
  } else {
    if(cursorScopes.indexOf('filter.rarity.poe') != -1) {
      if(prefix == '[operator]') {
        suggestions = suggestions.concat(operators, rarity);
        shouldPruneSuggestions = false;
      } else if(prefix == 'rarity') {
        suggestions = suggestions.concat(rarity);
        shouldPruneSuggestions = false;
      } else if(isFirstValue(args.editor, args.bufferPosition, true)) {
        suggestions = suggestions.concat(rarity);
      }
    } else if(cursorScopes.indexOf('filter.identified.poe') != -1) {
      if(!(prefix == "Identified")) {
        if(isFirstValue(args.editor, args.bufferPosition, true)) {
          suggestions = suggestions.concat(boolean);
        }
      }
    } else if(cursorScopes.indexOf('filter.corrupted.poe') != -1) {
      if(!(prefix == "Corrupted")) {
        if(isFirstValue(args.editor, args.bufferPosition, true)) {
          suggestions = suggestions.concat(boolean);
        }
      }
    } else if(cursorScopes.indexOf('filter.class.poe') != -1) {
      if(prefix == "class") {
        suggestions = suggestions.concat(validClasses);
        shouldPruneSuggestions = false;
      } else if(!(prefix == "Class")) {
        suggestions = suggestions.concat(validClasses);
      }
    } else if(cursorScopes.indexOf('filter.base-type.poe') != -1) {
      if(prefix == "type") {
        suggestions = suggestions.concat(validBases);
        shouldPruneSuggestions = false;
      } else if(!(prefix == "BaseType")) {
        suggestions = suggestions.concat(validBases);
      }
    } else {
      const numberValueRule = cursorScopes.indexOf('filter.item-level.poe') != 1 ||
          cursorScopes.indexOf('filter.drop-level.poe') != 1 ||
          cursorScopes.indexOf('filter.quality.poe') != 1 ||
          cursorScopes.indexOf('filter.socket.poe') != 1 ||
          cursorScopes.indexOf('filter.linked-sockets.poe') != 1 ||
          cursorScopes.indexOf('filter.height.poe') != 1 ||
          cursorScopes.indexOf('filter.width.poe') != 1;
      if(numberValueRule) {
        if(prefix == "[operator]") {
          suggestions = suggestions.concat(operators);
          shouldPruneSuggestions = false;
        }
      }
    }
  }

  setReplacementPrefix(args.editor, args.bufferPosition, prefix, suggestions);
  if(shouldPruneSuggestions) {
    suggestions = pruneSuggestions(prefix, suggestions)
  }
  return suggestions
}

/** Determines whether the given position in the editor is surrounded on both
 *  sides by double quotation marks, removing one if so. */
function removeConsecutiveQuotes(editor: AtomCore.TextEditor, position: Point) {
  const leftCharLocation = new Range([position.row, position.column - 1],
      position);
  const rightCharLocation = new Range(position, [position.row,
      position.column + 1]);
  const leftChar = editor.getTextInBufferRange(leftCharLocation);
  const rightChar = editor.getTextInBufferRange(rightCharLocation);

  if(leftChar == '"' && rightChar == '"') {
    editor.setTextInBufferRange(rightCharLocation, "", { undo: 'skip' });
  }
}

/** Performs the buffer manipulations necessary following a suggestion insertion. */
function insertedSuggestion(params: TextInsertionParams) {
  // Whenever the user opens with quotation marks and accepts a suggestion,
  // two closing quotation marks will be left at the end:
  //  BaseType "Cha" -> accepts "Chaos Orb"
  //  BaseType "Chaos Orb""
  if(params.editor.hasMultipleCursors()) {
    const cursorPositions = params.editor.getCursorBufferPositions();
    for(var cursorPosition of cursorPositions) {
      removeConsecutiveQuotes(params.editor, cursorPosition);
    }
  } else {
    const cursorPosition = params.editor.getCursorBufferPosition();
    removeConsecutiveQuotes(params.editor, cursorPosition);
  }
}

export const provider = {
  selector: '.source.poe',
  disableForSelector: '.source.poe .comment',
  inclusionPriority: 1,
  excludeLowerPriority: true,
  getSuggestions: getSuggestions,
  onDidInsertSuggestion: insertedSuggestion
}
