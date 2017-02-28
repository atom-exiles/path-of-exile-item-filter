import { Point, Range } from "atom";

import * as settings from "./settings";
import * as data from "./data";

interface SuggestionRequest {
  editor: AtomCore.TextEditor
  bufferPosition: TextBuffer.Point
  scopeDescriptor: AtomCore.ScopeDescriptor
  prefix: string
  activatedManually: boolean
}

interface SuggestionInserted {
  editor: AtomCore.TextEditor
  triggerPosition: TextBuffer.IPoint
  suggestion: Completion.TextSuggestion|Completion.SnippetSuggestion
}

export function activate() {}
export function deactivate() {}

/** Determines whether or text entered at the given position in the editor
 *  would be the first value for the filter rule which precedes that position.*/
function isFirstValue(editor: AtomCore.TextEditor, position: Point,
    hasOperator: boolean): boolean {
  const line = editor.lineTextForBufferRow(position.row);
  var regex: RegExp;
  if(hasOperator) {
    regex = /^\s*\S+\s*(>=|<=|>|<|=)?\s*\S*(.*)/
  } else {
    regex = /^\s*\S+\s*\S*(.*)/
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

/** Returns a prefix tailored towards item filters, with support for things
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
      "string.partial-quotation.poe") != -1) {
    const prefixRegex = /(\"[^"]*)$/;
    const result = prefixRegex.exec(previousText);
    if(result) prefix = result[1];

  } else if(previousPositionScopes && previousPositionScopes.indexOf(
      "string.quotation.poe") != -1) {
    // The closing quotation mark might be further in on the line, which
    // requires a different regex.
    const stringRange = editor.bufferRangeForScopeAtCursor("string.quotation.poe");
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

  if(prefix == undefined) prefix = "";
  return prefix;
}

/** Handles any special casing in regards to the prefix for autocompletion suggestions.
 *  For example, block elements will have the whitespace prepended onto the prefix,
 *  so that they are left aligned on column #0 on text insertion. */
function setReplacementPrefix(editor: AtomCore.TextEditor, position: Point,
    prefix: string, suggestions: Completion.Suggestions): Completion.Suggestions {

  for(var suggestion of suggestions) {
    var blockElement = false;

    for(var block of data.files.suggestions.blocks) {
      if((<Completion.SnippetSuggestion>suggestion).snippet && (<Completion.SnippetSuggestion>block).snippet) {
        if((<Completion.SnippetSuggestion>suggestion).snippet == (<Completion.SnippetSuggestion>block).snippet) {
          blockElement = true;
        }
      } else if((<Completion.TextSuggestion>suggestion).text && (<Completion.TextSuggestion>block).text) {
        if((<Completion.TextSuggestion>suggestion).text == (<Completion.TextSuggestion>block).text) {
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
    Completion.Suggestions): Completion.Suggestions {
  if(prefix.length == 0) return suggestions;

  const upperPrefix = prefix.toUpperCase();
  const prunedSuggestions: Completion.Suggestions = [];
  const firstChar = prefix.charAt(0);

  for(var s of suggestions) {
    var text: string;
    if(s.displayText && firstChar != '"') {
      text = s.displayText.toUpperCase();
    } else if((<Completion.SnippetSuggestion>s).snippet) {
      text = (<Completion.SnippetSuggestion>s).snippet.toUpperCase();
    } else if((<Completion.TextSuggestion>s).text) {
      text = (<Completion.TextSuggestion>s).text.toUpperCase();
    } else continue;

    if(text.indexOf(upperPrefix) != -1) prunedSuggestions.push(s);
  }
  return prunedSuggestions;
}

/** A callback which we provide to the autocompletion engine for Atom. */
async function getSuggestions(args: SuggestionRequest):
    Promise<Completion.Suggestions> {
  if(!settings.config.generalSettings.enableCompletion.get()) {
    return [];
  }

  const cd = await data.completionData;

  var suggestions: Completion.Suggestions = [];
  var shouldPruneSuggestions = true;
  const prefix = getPrefix(args.editor, args.bufferPosition);
  const cursorScopes = args.scopeDescriptor.scopes;
  const topScope = cursorScopes[cursorScopes.length - 1];

  if(topScope == "source.poe") {
    suggestions = suggestions.concat(data.files.suggestions.blocks);
  } else if(topScope == "line.empty.poe" || topScope == "line.unknown.poe") {
    if(cursorScopes.indexOf("block.poe") != -1) {
      if(prefix == "Rule") {
        suggestions = suggestions.concat(data.files.suggestions.actions,
            data.files.suggestions.filters);
        shouldPruneSuggestions = false;
      } else {
        suggestions = suggestions.concat(data.files.suggestions.blocks,
            data.files.suggestions.actions, data.files.suggestions.filters);
        if(settings.config.completionSettings.enableExtraSuggestions.get()) {
          suggestions = suggestions.concat(data.files.suggestions.extraBlocks);
        }
      }
    }
  } else {
    if(cursorScopes.indexOf("filter.rarity.poe") != -1) {
      if(prefix == "[operator]") {
        suggestions = suggestions.concat(data.files.suggestions.operators,
            data.files.suggestions.rarities);
        shouldPruneSuggestions = false;
      } else if(prefix == "rarity") {
        suggestions = suggestions.concat(data.files.suggestions.rarities);
        shouldPruneSuggestions = false;
      } else if(isFirstValue(args.editor, args.bufferPosition, true)) {
        suggestions = suggestions.concat(data.files.suggestions.rarities);
      }
    } else if(cursorScopes.indexOf("filter.identified.poe") != -1) {
      if(prefix == "True|False") {
        suggestions = suggestions.concat(data.files.suggestions.booleans);
        shouldPruneSuggestions = false;
      } else if(!(prefix == "Identified")) {
        if(isFirstValue(args.editor, args.bufferPosition, true)) {
          suggestions = suggestions.concat(data.files.suggestions.booleans);
        }
      }
    } else if(cursorScopes.indexOf("filter.corrupted.poe") != -1) {
      if(prefix == "True|False") {
        suggestions = suggestions.concat(data.files.suggestions.booleans);
        shouldPruneSuggestions = false;
      } else if(!(prefix == "Corrupted")) {
        if(isFirstValue(args.editor, args.bufferPosition, true)) {
          suggestions = suggestions.concat(data.files.suggestions.booleans);
        }
      }
    } else if(cursorScopes.indexOf("filter.class.poe") != -1) {
      if(prefix == "class") {
        suggestions = suggestions.concat(cd.classes, cd.whitelistClasses);
        shouldPruneSuggestions = false;
      } else if(!(prefix == "Class")) {
        suggestions = suggestions.concat(cd.classes, cd.whitelistClasses);
      }
    } else if(cursorScopes.indexOf("filter.base-type.poe") != -1) {
      if(prefix == "type") {
        suggestions = suggestions.concat(cd.bases, cd.whitelistBases);
        shouldPruneSuggestions = false;
      } else if(!(prefix == "BaseType")) {
        suggestions = suggestions.concat(cd.bases, cd.whitelistBases);
      }
      if(settings.config.completionSettings.enableExtraSuggestions.get()) {
        suggestions = suggestions.concat(data.files.suggestions.extraBases);
      }
    } else {
      const numberValueRule = cursorScopes.indexOf("filter.item-level.poe") != 1 ||
          cursorScopes.indexOf("filter.drop-level.poe") != 1 ||
          cursorScopes.indexOf("filter.quality.poe") != 1 ||
          cursorScopes.indexOf("filter.socket.poe") != 1 ||
          cursorScopes.indexOf("filter.linked-sockets.poe") != 1 ||
          cursorScopes.indexOf("filter.height.poe") != 1 ||
          cursorScopes.indexOf("filter.width.poe") != 1;
      if(numberValueRule) {
        if(prefix == "[operator]") {
          suggestions = suggestions.concat(data.files.suggestions.operators);
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
    editor.setTextInBufferRange(rightCharLocation, "");
  }
}

/** Removes the trailing Rarity placeholder value "rarity" if it exists
 *  following the given position in the buffer. */
function removeRarityPlaceholder(editor: AtomCore.TextEditor, startPosition: Point) {
  const endPosition = new Point(startPosition.row, startPosition.column + 7);
  const text = editor.getTextInBufferRange([startPosition, endPosition]);
  if(text == " rarity") {
    editor.setTextInBufferRange([startPosition, endPosition], "");
  }
}

/** Performs the buffer manipulations necessary following a suggestion insertion. */
function insertedSuggestion(params: SuggestionInserted) {
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
  // We need to detect this case and automatically remove " rarity" from the
  // buffer.
  if(params.suggestion.custom && params.suggestion.custom.itemRarity) {
    if(params.editor.hasMultipleCursors()) {
      const cursorPositions = params.editor.getCursorBufferPositions();
      for(var cursorPosition of cursorPositions) {
        removeRarityPlaceholder(params.editor, cursorPosition);
      }
    } else {
      const cursorPosition = params.editor.getCursorBufferPosition();
      removeRarityPlaceholder(params.editor, cursorPosition);
    }
  }
}

export const provider = {
  selector: ".source.poe",
  disableForSelector: ".source.poe .comment",
  inclusionPriority: 1,
  excludeLowerPriority: true,
  getSuggestions: getSuggestions,
  onDidInsertSuggestion: insertedSuggestion
}
