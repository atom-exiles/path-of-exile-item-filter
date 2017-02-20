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
      if(key.indexOf(' ') != -1) validClasses.push({ snippet: '"' + key + '"' });
      else validClasses.push({ snippet: key });
    }
    value.forEach((v) => {
      if(v.indexOf(' ') != -1) validBases.push({ snippet: '"' + v + '"' });
      else validBases.push({ snippet: v });
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
  // var prefix = args.prefix;
  var currentScope = args.scopeDescriptor.scopes[
      args.scopeDescriptor.scopes.length - 1];

  // TODO(glen): we need to somehow support operators as they are being inputted.
  // User hasn't inputted a block.
  if(currentScope == 'source.poe') {
    suggestions = suggestions.concat(blocks);
  } else if(currentScope == 'line.empty.poe' || currentScope == 'line.unknown.poe') {
    if(args.scopeDescriptor.scopes.indexOf('show.block.poe') != -1) {
      if(args.prefix == 'Action') {
        suggestions = suggestions.concat(actions);
        shouldPruneSuggestions = false;
      } else if(args.prefix == 'Filter') {
        suggestions = suggestions.concat(filters);
        shouldPruneSuggestions = false;
      } else {
        suggestions = suggestions.concat(blocks, actions, filters);
      }
    } else if(args.scopeDescriptor.scopes.indexOf('hide.block.poe') != -1) {
      if(args.prefix == 'Filter') {
        suggestions = suggestions.concat(filters);
        shouldPruneSuggestions = false;
      } else {
        suggestions = suggestions.concat(blocks, filters);
      }
    }
  } else {
    if(args.scopeDescriptor.scopes.indexOf('filter.rarity.poe') != -1) {
      if(isFirstToken(args.editor, args.bufferPosition) || args.prefix == '[operator]') {
        suggestions = suggestions.concat(operators, rarity);
        shouldPruneSuggestions = false;
      } else if(args.prefix == 'rarity') {
        suggestions = suggestions.concat(rarity);
        shouldPruneSuggestions = false;
      } else if(isPartialOperator(args.editor, args.bufferPosition)) {
        suggestions = suggestions.concat(operators);
      } else if(isFirstValue(args.editor, args.bufferPosition, true)) {
        suggestions = suggestions.concat(rarity);
      }
    } else if(args.scopeDescriptor.scopes.indexOf('filter.identified.poe') != -1) {
      if(!(args.prefix == "Identified")) {
        if(isFirstValue(args.editor, args.bufferPosition, true)) {
          suggestions = suggestions.concat(boolean);
        }
      }
    } else if(args.scopeDescriptor.scopes.indexOf('filter.corrupted.poe') != -1) {
      if(!(args.prefix == "Corrupted")) {
        if(isFirstValue(args.editor, args.bufferPosition, true)) {
          suggestions = suggestions.concat(boolean);
        }
      }
    } else if(args.scopeDescriptor.scopes.indexOf('filter.class.poe') != -1) {
      if(!(args.prefix == "Class")) {
        suggestions = suggestions.concat(validClasses);
      }
    } else if(args.scopeDescriptor.scopes.indexOf('filter.base-type.poe') != -1) {
      if(!(args.prefix == "BaseType")) {
        suggestions = suggestions.concat(validBases);
      }
    }
  }

  setReplacementPrefix(args.editor, args.bufferPosition, args.prefix, suggestions);
  if(shouldPruneSuggestions) {
    suggestions = pruneSuggestions(args.prefix, suggestions)
  }
  return suggestions
}

export const provider = {
  selector: '.source.poe',
  disableForSelector: '.source.poe .comment',
  inclusionPriority: 1,
  excludeLowerPriority: true,
  getSuggestions: getSuggestions
}
