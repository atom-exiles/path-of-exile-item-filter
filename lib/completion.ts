import { Point, Range, CompositeDisposable } from "atom";

import * as settings from "./settings";
import * as data from "./data";

var validBases = new Array<TextSuggestion>();
var validClasses = new Array<TextSuggestion>();
var injectedBases = new Array<TextSuggestion>();
var injectedClasses = new Array<TextSuggestion>();
var subscriptions = new CompositeDisposable;

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
  suggestion: TextSuggestion|SnippetSuggestion
}

interface Suggestion {
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
  /** Stores the unmodified rightLabel for the suggestion. Depending on user
   *  configuration, the rightLabel field may be set to undefined. This property
   *  allows us to restore it when necessary. */
  _rightLabel?: string
}

interface SnippetSuggestion extends Suggestion {
  /** A snippet string. This will allow users to tab through function arguments
   *  or other options. */
  snippet: string
}

interface TextSuggestion extends Suggestion {
  /** The text which will be inserted into the editor, in place of the prefix. */
  text: string
}

const blocks: Array<TextSuggestion|SnippetSuggestion> = [
  {
    snippet: '##############################\n##  ${1:        Heading       }  ##\n##############################\n$2',
    displayText: '## Heading ##'
  },
  { snippet: 'Show\n  ${1:Rule}' },
  { snippet: 'Hide\n  ${1:Rule}' }
]

const filters: Array<TextSuggestion|SnippetSuggestion> = [
  { snippet: 'BaseType ${1:type}' },
  { snippet: 'Class ${1:class}' },
  { snippet: 'Rarity ${1:[operator]} ${2:rarity}' },
  { snippet: 'Identified ${1:True|False}' },
  { snippet: 'Corrupted ${1:True|False}' },
  { snippet: 'ItemLevel ${1:[operator]} ${2:level}' },
  { snippet: 'DropLevel ${1:[operator]} ${2:level}' },
  { snippet: 'Quality ${1:[operator]} ${2:quality}' },
  { snippet: 'Sockets ${1:[operator]} ${2:sockets}' },
  { snippet: 'LinkedSockets ${1:[operator]} ${2:links}' },
  { snippet: 'Height ${1:[operator]} ${2:height}' },
  { snippet: 'Width ${1:[operator]} ${2:width}' },
  { snippet: 'SocketGroup ${1:group}' }
]

const actions: Array<TextSuggestion|SnippetSuggestion> = [
  { snippet: 'SetBackgroundColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
  { snippet: 'SetBorderColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
  { snippet: 'SetTextColor ${1:red} ${2:green} ${3:blue} ${4:[alpha]}' },
  { snippet: 'PlayAlertSound ${1:id} ${2:[volume]}' },
  { snippet: 'SetFontSize ${1:size}' }
]

const rarities: Array<TextSuggestion|SnippetSuggestion> = [
  { text: 'Normal' },
  { text: 'Magic' },
  { text: 'Rare' },
  { text: 'Unique' }
]

const operators: Array<TextSuggestion|SnippetSuggestion> = [
  { text: '>'},
  { text: '>='},
  { text: '='},
  { text: '<='},
  { text: '<'}
]

const booleans: Array<TextSuggestion|SnippetSuggestion> = [
  { text: 'True'},
  { text: 'False'}
]

/** Transforms the base item data into the format used by this completion provider. */
function updateItemData(externalCall = true) {
  validBases = new Array<TextSuggestion>();
  validClasses = new Array<TextSuggestion>();

  data.itemData.forEach((value, key) => {
    var knownClass = false;
    for(var c of validClasses) {
      if(c.text == key) {
        knownClass = true;
      }
    }

    if(!knownClass) {
      if(key.indexOf(' ') != -1) validClasses.push({ text: '"' + key + '"',
          displayText: key });
      else validClasses.push({ text: key, displayText: key });
    }
    value.forEach((v) => {
      if(v.indexOf(' ') != -1) validBases.push({ text: '"' + v + '"',
          displayText: v, _rightLabel: key });
      else validBases.push({ text: v, displayText: v, _rightLabel: key });
    });
  });
  if(externalCall) updateDecorations();
}

function updateWhitelists(externalCall = true) {
  injectedBases = new Array<TextSuggestion>();
  injectedClasses = new Array<TextSuggestion>();

  const bases = settings.config.dataSettings.baseWhitelist.get();
  const classes = settings.config.dataSettings.classWhitelist.get();
  const labelText = "Whitelisted";

  // TODO(glen): can this return undefined?
  for(var c of classes) {
    if(c.indexOf(' ') != -1) injectedClasses.push({ text: '"' + c + '"',
        displayText: c, _rightLabel: labelText });
    else injectedClasses.push({ text: c, displayText: c, _rightLabel: labelText });
  }

  for(var b of bases) {
    if(b.indexOf(' ') != -1) injectedBases.push({ text: '"' + b + '"',
        displayText: b, _rightLabel: labelText });
    else injectedBases.push({ text: b, displayText: b, _rightLabel: labelText });
  }
  if(externalCall) updateDecorations();
}

/** Manages the decoration data for each of the item data suggestions. */
function updateDecorations() {
  const enableRightLabel = settings.config.completionSettings.enableRightLabel.get();
  const enableIcon = settings.config.completionSettings.enableIcon.get();

  // In order to allow specific decorations to be disabled, we store backup values
  // under the same name, except prefixed by an underscore.
  const action = (s: TextSuggestion): void => {
    if(enableRightLabel) s.rightLabel = s._rightLabel;
    else s.rightLabel = undefined;

    if(enableIcon) {} // no-op until icons are implemented.
  }

  validBases.forEach(action);
  injectedClasses.forEach(action);
  injectedBases.forEach(action);
}

export function setupSubscriptions() {
  subscriptions = new CompositeDisposable;

  data.emitter.on("poe-did-update-item-data", updateItemData);
  data.emitter.on("poe-did-update-injected-data", updateWhitelists);

  subscriptions.add(settings.config.completionSettings.enableRightLabel.onDidChange(
      updateDecorations));
  subscriptions.add(settings.config.completionSettings.enableIcon.onDidChange(
      updateDecorations));

  updateItemData(false);
  updateWhitelists(false);
  updateDecorations();
}

export function removeSubscriptions() {
  subscriptions.dispose();
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
    const prefixRegex = /(\"[^"]*)$/;
    const result = prefixRegex.exec(previousText);
    if(result) prefix = result[1];

  } else if(previousPositionScopes && previousPositionScopes.indexOf(
      'string.quotation.poe') != -1) {
    // The closing quotation mark might be further in on the line, which
    // requires a different regex.
    const stringRange = editor.bufferRangeForScopeAtCursor('string.quotation.poe');
    if(stringRange.end.column > position.column) {
      const prefixRegex = /(\"[^"]*)$/;
      const result = prefixRegex.exec(previousText);
      if(result) prefix = result[1];
    } else {
      const prefixRegex = /(\"[^"]*\")$/;
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
    prefix: string, suggestions: Array<TextSuggestion|SnippetSuggestion>):
    Array<TextSuggestion|SnippetSuggestion> {

  for(var suggestion of suggestions) {
    var blockElement = false;

    for(var block of blocks) {
      if((<SnippetSuggestion>suggestion).snippet && (<SnippetSuggestion>block).snippet) {
        if((<SnippetSuggestion>suggestion).snippet == (<SnippetSuggestion>block).snippet) {
          blockElement = true;
        }
      } else if((<TextSuggestion>suggestion).text && (<TextSuggestion>block).text) {
        if((<TextSuggestion>suggestion).text == (<TextSuggestion>block).text) {
          blockElement = true;
        }
      }
    }

    if(blockElement) {
      const range = new Range([position.row, 0], position);
      suggestion.replacementPrefix = editor.getTextInBufferRange(range);
    } else {
      suggestion.replacementPrefix = prefix;
    }
  }
  return suggestions;
}

/** Removes suggestions that do not contain the prefix. */
function pruneSuggestions(prefix: string, suggestions:
    Array<TextSuggestion|SnippetSuggestion>): Array<TextSuggestion|SnippetSuggestion> {
  if(prefix.length == 0) return suggestions;

  const upperPrefix = prefix.toUpperCase();
  const prunedSuggestions = new Array<TextSuggestion|SnippetSuggestion>();

  for(var s of suggestions) {
    var text: string;
    if((<SnippetSuggestion>s).snippet) {
      text = (<SnippetSuggestion>s).snippet.toUpperCase();
    } else if((<TextSuggestion>s).text) {
      text = (<TextSuggestion>s).text.toUpperCase();
    } else continue;

    if(text.indexOf(upperPrefix) != -1) prunedSuggestions.push(s);
  }
  return prunedSuggestions;
}

/** A callback which we provide to the autocompletion engine for Atom. */
function getSuggestions(args: SuggestionParams) {
  if(!settings.config.generalSettings.enableCompletion.get()) {
    return [];
  }

  var suggestions = new Array<TextSuggestion|SnippetSuggestion>();
  var shouldPruneSuggestions = true;
  const prefix = getPrefix(args.editor, args.bufferPosition);
  const cursorScopes = args.scopeDescriptor.scopes;
  const topScope = cursorScopes[cursorScopes.length - 1];

  if(topScope == 'source.poe') {
    suggestions = suggestions.concat(blocks);
  } else if(topScope == 'line.empty.poe' || topScope == 'line.unknown.poe') {
    if(cursorScopes.indexOf('block.poe') != -1) {
      if(prefix == 'Rule') {
        suggestions = suggestions.concat(actions, filters);
        shouldPruneSuggestions = false;
      } else {
        suggestions = suggestions.concat(blocks, actions, filters);
      }
    }
  } else {
    if(cursorScopes.indexOf('filter.rarity.poe') != -1) {
      if(prefix == '[operator]') {
        suggestions = suggestions.concat(operators, rarities);
        shouldPruneSuggestions = false;
      } else if(prefix == 'rarity') {
        suggestions = suggestions.concat(rarities);
        shouldPruneSuggestions = false;
      } else if(isFirstValue(args.editor, args.bufferPosition, true)) {
        suggestions = suggestions.concat(rarities);
      }
    } else if(cursorScopes.indexOf('filter.identified.poe') != -1) {
      if(prefix == 'True|False') {
        suggestions = suggestions.concat(booleans);
        shouldPruneSuggestions = false;
      } else if(!(prefix == "Identified")) {
        if(isFirstValue(args.editor, args.bufferPosition, true)) {
          suggestions = suggestions.concat(booleans);
        }
      }
    } else if(cursorScopes.indexOf('filter.corrupted.poe') != -1) {
      if(prefix == 'True|False') {
        suggestions = suggestions.concat(booleans);
        shouldPruneSuggestions = false;
      } else if(!(prefix == "Corrupted")) {
        if(isFirstValue(args.editor, args.bufferPosition, true)) {
          suggestions = suggestions.concat(booleans);
        }
      }
    } else if(cursorScopes.indexOf('filter.class.poe') != -1) {
      if(prefix == "class") {
        suggestions = suggestions.concat(validClasses, injectedClasses);
        shouldPruneSuggestions = false;
      } else if(!(prefix == "Class")) {
        suggestions = suggestions.concat(validClasses, injectedClasses);
      }
    } else if(cursorScopes.indexOf('filter.base-type.poe') != -1) {
      if(prefix == "type") {
        suggestions = suggestions.concat(validBases, injectedBases);
        shouldPruneSuggestions = false;
      } else if(!(prefix == "BaseType")) {
        suggestions = suggestions.concat(validBases, injectedBases);
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
    suggestions = pruneSuggestions(prefix, suggestions);
  }
  return suggestions;
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

/** Removes the trailing Rarity placeholder value 'rarity' if it exists
 *  following the given position in the buffer. */
function removeRarityPlaceholder(editor: AtomCore.TextEditor, startPosition: Point) {
  const endPosition = new Point(startPosition.row, startPosition.column + 7);
  const text = editor.getTextInBufferRange([startPosition, endPosition]);
  if(text == ' rarity') {
    editor.setTextInBufferRange([startPosition, endPosition], '', { undo: 'skip' });
  }
}

/** Performs the buffer manipulations necessary following a suggestion insertion. */
function insertedSuggestion(params: TextInsertionParams) {
  // Whenever the user opens with quotation marks and accepts a suggestion,
  // two closing quotation marks will be left at the end:
  //    BaseType "Cha" -> accepts "Chaos Orb"
  //    BaseType "Chaos Orb""
  if(params.editor.hasMultipleCursors()) {
    const cursorPositions = params.editor.getCursorBufferPositions();
    for(var cursorPosition of cursorPositions) {
      removeConsecutiveQuotes(params.editor, cursorPosition);
    }
  } else {
    const cursorPosition = params.editor.getCursorBufferPosition();
    removeConsecutiveQuotes(params.editor, cursorPosition);
  }

  // The rarity rule is currently the only one with an operator that we also
  // provide value completion for. That operator is also optional, so if the
  // user were to choose to insert one of the rarity suggestions while the
  // prefix is the operator placeholder, they would end up with a line like this:
  //    Rarity Normal rarity
  // We need to detect this case and automatically remove ' rarity' from the
  // buffer.
  var wasRarity = false;
  for(var r of rarities) {
    const suggestion = params.suggestion;
    if((<TextSuggestion>suggestion).text && (<TextSuggestion>r).text) {
      if((<TextSuggestion>suggestion).text == (<TextSuggestion>r).text) {
        wasRarity = true;
        break;
      }
    } else if((<SnippetSuggestion>suggestion).snippet && (<SnippetSuggestion>r).snippet) {
      if((<SnippetSuggestion>suggestion).snippet == (<SnippetSuggestion>r).snippet) {
        wasRarity = true;
        break;
      }
    }
  }

  if(wasRarity && params.editor.hasMultipleCursors()) {
    const cursorPositions = params.editor.getCursorBufferPositions();
    for(var cursorPosition of cursorPositions) {
      removeRarityPlaceholder(params.editor, cursorPosition);
    }
  } else if(wasRarity) {
    const cursorPosition = params.editor.getCursorBufferPosition();
    removeRarityPlaceholder(params.editor, cursorPosition);
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
