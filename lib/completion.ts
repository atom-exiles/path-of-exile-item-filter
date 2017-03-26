import { Point, Range } from "atom";

import * as settings from "./settings";
import * as jsonData from "./json-data";

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

/** Determines whether or not an operator could be inserted into the given position
 *  in the buffer. */
function isPotentialOperator(editor: AtomCore.TextEditor, position: Point): boolean {
  const line = editor.lineTextForBufferRow(position.row);
  const regex = /^\s*\S+\s*(>|<)?$/;
  const result = regex.exec(line);
  if(result) return true;
  return false;
}

/** Determines whether or not text inserted at the given position in the editor
 *  would be the first value for the filter rule. */
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

    for(var block of jsonData.files.suggestions.blocks) {
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

  const data = await jsonData.promise;
  var suggestions: Completion.Suggestions = [];
  var prefix = getPrefix(args.editor, args.bufferPosition);
  const cursorScopes = args.scopeDescriptor.scopes;
  const topScope = cursorScopes[cursorScopes.length - 1];

  var shouldPruneSuggestions = true;
  const enableExtraSuggestions = settings.config.completionSettings.
      enableExtraSuggestions.get();

  if(topScope == "source.poe") {
    suggestions = suggestions.concat(jsonData.files.suggestions.blocks);
  } else if(topScope == "line.empty.poe" || topScope == "line.unknown.poe") {
    if(cursorScopes.indexOf("block.poe") != -1) {
      suggestions = suggestions.concat(jsonData.files.suggestions.blocks,
          jsonData.files.suggestions.actions, jsonData.files.suggestions.filters);
      if(enableExtraSuggestions) {
        suggestions = suggestions.concat(jsonData.files.suggestions.extraBlocks);
      }
    }
  } else {
    if(cursorScopes.indexOf("filter.rarity.poe") != -1) {
      if(isFirstValue(args.editor, args.bufferPosition, true)) {
        suggestions = suggestions.concat(jsonData.files.suggestions.rarities);
      }
      if(isPotentialOperator(args.editor, args.bufferPosition)) {
        suggestions = suggestions.concat(jsonData.files.suggestions.operators);
      }
    } else if(cursorScopes.indexOf("filter.identified.poe") != -1) {
      if(isFirstValue(args.editor, args.bufferPosition, true)) {
        suggestions = suggestions.concat(jsonData.files.suggestions.booleans);
      }
    } else if(cursorScopes.indexOf("filter.corrupted.poe") != -1) {
      if(isFirstValue(args.editor, args.bufferPosition, true)) {
        suggestions = suggestions.concat(jsonData.files.suggestions.booleans);
      }
    } else if(cursorScopes.indexOf("filter.class.poe") != -1) {
      suggestions = suggestions.concat(data.completion.classes, data.completion.whitelistClasses);
      if(enableExtraSuggestions)  {
        suggestions = suggestions.concat(jsonData.files.suggestions.extraClasses);
      }
    } else if(cursorScopes.indexOf("filter.base-type.poe") != -1) {
      suggestions = suggestions.concat(data.completion.bases, data.completion.whitelistBases);
      if(enableExtraSuggestions) {
        suggestions = suggestions.concat(jsonData.files.suggestions.extraBases);
      }
    } else if(cursorScopes.indexOf("filter.socket-group.poe") != -1) {
      // Not pruning the suggestions, so this is necessary.
      if(!(prefix == "SocketGroup")) {
        shouldPruneSuggestions = false;
        if(isFirstValue(args.editor, args.bufferPosition, true) && prefix.length < 6) {
          prefix = "";
          suggestions = suggestions.concat(jsonData.files.suggestions.socketGroup);
        }
      }
    } else {
      const numberValueRule = cursorScopes.indexOf("filter.item-level.poe") != -1 ||
          cursorScopes.indexOf("filter.drop-level.poe") != -1 ||
          cursorScopes.indexOf("filter.quality.poe") != -1 ||
          cursorScopes.indexOf("filter.sockets.poe") != -1 ||
          cursorScopes.indexOf("filter.linked-sockets.poe") != -1 ||
          cursorScopes.indexOf("filter.height.poe") != -1 ||
          cursorScopes.indexOf("filter.width.poe") != -1;
      if(numberValueRule) {
        if(isPotentialOperator(args.editor, args.bufferPosition)) {
          suggestions = suggestions.concat(jsonData.files.suggestions.operators);
        }
      }
    }
  }

  if(shouldPruneSuggestions) suggestions = pruneSuggestions(prefix, suggestions);
  setReplacementPrefix(args.editor, args.bufferPosition, prefix, suggestions);
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
}

export const provider = {
  selector: ".source.poe",
  disableForSelector: ".source.poe .comment",
  inclusionPriority: 1,
  excludeLowerPriority: true,
  getSuggestions: getSuggestions,
  onDidInsertSuggestion: insertedSuggestion
}
