import { Point, Range, TextEditor } from "atom";
import {
  Suggestions, SuggestionsRequestedEvent, SuggestionInsertedEvent
} from "atom-autocomplete";

import { isSnippetSuggestion, isTextSuggestion } from "./helpers";
import { SuggestionDataFormat } from "./suggestion-data";

export class CompletionProvider {
  private readonly suggestions: SuggestionDataFormat;

  constructor(suggestions: SuggestionDataFormat) {
    this.suggestions = suggestions;
  }

  dispose() {}

  /** The callback which Autocomplete+ calls into whenever it needs suggestions for the user. */
  getSuggestions(event: SuggestionsRequestedEvent) {
    let result: Suggestions = [];
    const { editor, bufferPosition, scopeDescriptor } = event;
    let prefix = this.getPrefix(editor, bufferPosition);
    const cursorScopes = scopeDescriptor.getScopesArray();
    const lastScope = cursorScopes[cursorScopes.length - 1];

    let shouldPruneSuggestions = true;
    if (lastScope === "source.filter") {
      result = result.concat(this.suggestions.blocks, this.suggestions.extraBlocks);
    } else if (lastScope === "line.empty.filter" || lastScope === "line.unknown.filter") {
      if (cursorScopes.indexOf("block.filter") === -1) {
        result = result.concat(this.suggestions.blocks, this.suggestions.extraBlocks);
      } else {
        result = result.concat(this.suggestions.blocks, this.suggestions.actions,
            this.suggestions.filters, this.suggestions.extraBlocks);
      }
    } else {
      if (cursorScopes.includes("rarity.filter")) {
        if (this.isFirstValue(editor, bufferPosition, true)) {
          result = result.concat(this.suggestions.rarities);
        }
        if (this.isPotentialOperator(editor, bufferPosition)) {
          result = result.concat(this.suggestions.operators);
        }
      } else if (cursorScopes.includes("identified.filter")) {
        if (prefix !== "Identified" && this.isFirstValue(editor, bufferPosition, true)) {
          result = result.concat(this.suggestions.booleans);
        }
      } else if (cursorScopes.includes("corrupted.filter")) {
        if (prefix !== "Corrupted" && this.isFirstValue(editor, bufferPosition, true)) {
          result = result.concat(this.suggestions.booleans);
        }
      } else if (cursorScopes.includes("elder-item.filter")) {
        if (prefix !== "ElderItem" && this.isFirstValue(editor, bufferPosition, true)) {
          result = result.concat(this.suggestions.booleans);
        }
      } else if (cursorScopes.includes("shaper-item.filter")) {
        if (prefix !== "ShaperItem" && this.isFirstValue(editor, bufferPosition, true)) {
          result = result.concat(this.suggestions.booleans);
        }
      } else if (cursorScopes.includes("shaped-map.filter")) {
        if (prefix !== "ShapedMap" && this.isFirstValue(editor, bufferPosition, true)) {
          result = result.concat(this.suggestions.booleans);
        }
      } else if (cursorScopes.includes("elder-map.filter")) {
        if (prefix !== "ElderMap" && this.isFirstValue(editor, bufferPosition, true)) {
          result = result.concat(this.suggestions.booleans);
        }
      } else if (cursorScopes.includes("class.filter")) {
        if (prefix !== "Class") {
          result = result.concat(this.suggestions.classes, this.suggestions.classWhitelist,
              this.suggestions.extraClasses);
        }
      } else if (cursorScopes.includes("base-type.filter")) {
        if (prefix !== "BaseType") {
          result = result.concat(this.suggestions.bases, this.suggestions.baseWhitelist,
              this.suggestions.extraBases);
        }
      } else if (cursorScopes.includes("socket-group.filter")) {
        // Not pruning the suggestions, so this is necessary.
        if (prefix !== "SocketGroup") {
          shouldPruneSuggestions = false;
          if (this.isFirstValue(editor, bufferPosition, true) && prefix.length < 6) {
            prefix = "";
            result = result.concat(this.suggestions.sockets);
          }
        }
      } else if (cursorScopes.includes("play-alert-sound.filter")) {
        if (this.isFirstValue(editor, bufferPosition, true)) {
          result = result.concat(result, this.suggestions.sounds);
        }
      } else {
        const numberValueRule = cursorScopes.includes("item-level.filter") ||
            cursorScopes.includes("drop-level.filter") ||
            cursorScopes.includes("quality.filter") ||
            cursorScopes.includes("sockets.filter") ||
            cursorScopes.includes("linked-sockets.filter") ||
            cursorScopes.includes("height.filter") ||
            cursorScopes.includes("width.filter");
        if (numberValueRule) {
          if (this.isPotentialOperator(editor, bufferPosition)) {
            result = result.concat(this.suggestions.operators);
          }
        }
      }
    }

    if (shouldPruneSuggestions) result = this.pruneSuggestions(prefix, result);
    this.setReplacementPrefix(editor, bufferPosition, prefix, result);
    return result;
  }

  /** Performs the buffer manipulations necessary following a suggestion insertion. */
  onDidInsertSuggestion(event: SuggestionInsertedEvent) {
    const editor = event.editor;

    // Whenever the user opens with quotation marks and accepts a suggestion,
    // two closing quotation marks will be left at the end:
    //    BaseType "Cha" -> accepts "Chaos Orb"
    //    BaseType "Chaos Orb""
    if (editor.hasMultipleCursors()) {
      const cursorPositions = editor.getCursorBufferPositions();
      for (const cursorPosition of cursorPositions) {
        this.removeConsecutiveQuotes(editor, cursorPosition);
      }
    } else {
      const cursorPosition = editor.getCursorBufferPosition();
      this.removeConsecutiveQuotes(editor, cursorPosition);
    }

    return;
  }

  /**
   * Determines whether or not an operator could be inserted into the given position
   * in the buffer.
   */
  private isPotentialOperator(editor: TextEditor, position: Point) {
    const line = editor.lineTextForBufferRow(position.row);
    const regex = /^\s*\S+\s*(>|<)?$/;
    const result = regex.exec(line);
    if (result) return true;
    return false;
  }

  /**
   * Determines whether or not text inserted at the given position in the editor
   * would be the first value for the filter rule.
   */
  private isFirstValue(editor: TextEditor, position: Point, hasOperator: boolean) {
    const line = editor.lineTextForBufferRow(position.row);
    const regex = hasOperator ? /^\s*\S+\s*(>=|<=|>|<|=)?\s*\S*(.*)/ : /^\s*\S+\s*\S*(.*)/;

    const result = regex.exec(line);
    if (result) {
      const trailingText = hasOperator ? result[2] : result[1];
      if (trailingText && trailingText.length > 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  /**
   * Returns a prefix tailored towards item filters, with support for things
   * like value strings.
   */
  private getPrefix(editor: TextEditor, position: Point) {
    // The previous position in the editor is often a lot more useful than the
    // current ones, as it will contain the scopes for the value which the user
    // may still be editing.
    let previousPositionScopes: string[]|undefined;
    if (position.column > 0) {
      const previousPosition = new Point(position.row, position.column - 1);
      previousPositionScopes = editor.scopeDescriptorForBufferPosition(
          previousPosition).getScopesArray();
    }

    const previousText = editor.getTextInBufferRange([[position.row, 0], position]);
    let prefix: string|undefined;
    if (previousPositionScopes && previousPositionScopes.indexOf(
        "string.partial-quotation.filter") !== -1) {
      const prefixRegex = /(\"[^"]*)$/;
      const result = prefixRegex.exec(previousText);
      if (result) prefix = result[1];
    } else if (previousPositionScopes && previousPositionScopes.indexOf(
        "string.quotation.filter") !== -1) {
      // The closing quotation mark might be further in on the line, which
      // requires a different regex.
      const stringRange = editor.bufferRangeForScopeAtCursor("string.quotation.filter");
      if (stringRange.end.column > position.column) {
        const prefixRegex = /(\"[^"]*)$/;
        const result = prefixRegex.exec(previousText);
        if (result) prefix = result[1];
      } else {
        const prefixRegex = /(\"[^"]*\")$/;
        const result = prefixRegex.exec(previousText);
        if (result) prefix = result[1];
      }
    // Default back to using the previous word value. If the previous character
    // was a whitespace character, then use an empty prefix.
    } else {
      const prefixRegex = /([\s]*([^\s]*))*$/;
      const result = prefixRegex.exec(previousText);
      if (result) prefix = result[2];
    }

    if (prefix === undefined) prefix = "";
    return prefix;
  }

  /** Removes suggestions that do not contain the prefix. */
  private pruneSuggestions(prefix: string, suggestions: Suggestions) {
    if (prefix.length === 0) return suggestions;

    const result: Suggestions = [];
    const upperPrefix = prefix.toUpperCase();
    const firstChar = prefix.charAt(0);

    for (const s of suggestions) {
      let text: string;
      if (s.displayText && firstChar !== '"') {
        text = s.displayText.toUpperCase();
      } else if (isSnippetSuggestion(s)) {
        text = s.snippet.toUpperCase();
      } else if (isTextSuggestion(s)) {
        text = s.text.toUpperCase();
      } else continue;

      if (text.indexOf(upperPrefix) !== -1) result.push(s);
    }

    return result;
  }

  /**
   * Handles any special casing in regards to the prefix for autocompletion suggestions.
   * For example, block elements will have the whitespace prepended onto the prefix,
   * so that they are left aligned on column #0 on text insertion.
   */
  private setReplacementPrefix(editor: TextEditor, position: Point, prefix: string,
      suggestions: Suggestions) {
    for (const suggestion of suggestions) {
      let blockElement = false;
      for (const block of this.suggestions.blocks) {
        if (isSnippetSuggestion(suggestion) && isSnippetSuggestion(block)) {
          if (suggestion.snippet === block.snippet) blockElement = true;
        } else if (isTextSuggestion(suggestion) && isTextSuggestion(block)) {
          if (suggestion.text === block.text) blockElement = true;
        }
      }

      if (blockElement) {
        const range = new Range([position.row, 0], position);
        suggestion.replacementPrefix = editor.getTextInBufferRange(range);
      } else {
        suggestion.replacementPrefix = prefix;
      }
    }

    return;
  }

  /**
   * Determines whether the given position in the editor is surrounded on both
   * sides by double quotation marks, removing one if so.
   */
  private removeConsecutiveQuotes(editor: TextEditor, position: Point) {
    const leftCharLocation = new Range([position.row, position.column - 1],
        position);
    const rightCharLocation = new Range(position, [position.row, position.column + 1]);
    const leftChar = editor.getTextInBufferRange(leftCharLocation);
    const rightChar = editor.getTextInBufferRange(rightCharLocation);

    if (leftChar === '"' && rightChar === '"') {
      editor.setTextInBufferRange(rightCharLocation, "", { undo: "skip" });
    }

    return;
  }
}
