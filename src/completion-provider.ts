import { Point, Range } from "atom";

import ConfigManager from "config-manager";
import SuggestionData from "suggestion-data";
import * as Helpers from "./helpers";

export default class CompletionProvider implements Autocomplete.Provider {
  private readonly config: ConfigManager;
  private readonly suggestions: SuggestionData;
  readonly selector: string;
  readonly disableForSelector: string;
  readonly inclusionPriority: number;
  readonly excludeLowerPriority: boolean;

  constructor(config: ConfigManager, suggestions: SuggestionData) {
    this.config = config;
    this.suggestions = suggestions;
    this.selector = ".source.filter";
    this.disableForSelector = ".source.filter .comment";
    this.inclusionPriority = 1;
    this.excludeLowerPriority = true;
  }

  dispose() {}

  /** The callback which Autocomplete+ calls into whenever it needs suggestions for the user. */
  async getSuggestions({ editor, bufferPosition, scopeDescriptor, prefix, activatedManually }:
      Autocomplete.Params.SuggestionRequest) {
    const enableCompletion = await this.config.general.enableCompletion.promise;
    if(!enableCompletion) return [];

    const suggestionData = await this.suggestions.data;
    const enableExtraSuggestions = this.config.completion.enableExtraSuggestions.value;

    let result: Autocomplete.Suggestions = [];
    prefix = this.getPrefix(editor, bufferPosition);
    const cursorScopes = scopeDescriptor.scopes;
    const lastScope = cursorScopes[cursorScopes.length - 1];

    let shouldPruneSuggestions = true;
    if(lastScope == "source.filter") {
      result = result.concat(suggestionData.blocks);
      if(enableExtraSuggestions) {
        result = result.concat(suggestionData.extraBlocks);
      }
    } else if(lastScope == "line.empty.filter" || lastScope == "line.unknown.filter") {
      if(cursorScopes.indexOf("block.filter") != -1) {
        result = result.concat(suggestionData.blocks,
            suggestionData.actions, suggestionData.filters);
        if(enableExtraSuggestions) {
          result = result.concat(suggestionData.extraBlocks);
        }
      }
    } else {
      if(cursorScopes.includes("rarity.filter")) {
        if(this.isFirstValue(editor, bufferPosition, true)) {
          result = result.concat(suggestionData.rarities);
        }
        if(this.isPotentialOperator(editor, bufferPosition)) {
          result = result.concat(suggestionData.operators);
        }
      } else if(cursorScopes.includes("identified.filter")) {
        if(this.isFirstValue(editor, bufferPosition, true)) {
          result = result.concat(suggestionData.booleans);
        }
      } else if(cursorScopes.includes("corrupted.filter")) {
        if(this.isFirstValue(editor, bufferPosition, true)) {
          result = result.concat(suggestionData.booleans);
        }
      } else if(cursorScopes.includes("class.filter")) {
        result = result.concat(suggestionData.classes, suggestionData.classWhitelist);
        if(enableExtraSuggestions)  {
          result = result.concat(suggestionData.extraClasses);
        }
      } else if(cursorScopes.includes("base-type.filter")) {
        result = result.concat(suggestionData.bases, suggestionData.baseWhitelist);
        if(enableExtraSuggestions) {
          result = result.concat(suggestionData.extraBases);
        }
      } else if(cursorScopes.includes("socket-group.filter")) {
        // Not pruning the suggestions, so this is necessary.
        if(!(prefix == "SocketGroup")) {
          shouldPruneSuggestions = false;
          if(this.isFirstValue(editor, bufferPosition, true) && prefix.length < 6) {
            prefix = "";
            result = result.concat(suggestionData.sockets);
          }
        }
      } else {
        const numberValueRule = cursorScopes.includes("item-level.filter") ||
            cursorScopes.includes("drop-level.filter") ||
            cursorScopes.includes("quality.filter") ||
            cursorScopes.includes("sockets.filter") ||
            cursorScopes.includes("linked-sockets.filter") ||
            cursorScopes.includes("height.filter") ||
            cursorScopes.includes("width.filter");
        if(numberValueRule) {
          if(this.isPotentialOperator(editor, bufferPosition)) {
            result = result.concat(suggestionData.operators);
          }
        }
      }
    }

    if(shouldPruneSuggestions) result = this.pruneSuggestions(prefix, result);
    this.setReplacementPrefix(editor, suggestionData, bufferPosition, prefix, result);
    return result;
  }

  /** Performs the buffer manipulations necessary following a suggestion insertion. */
  onDidInsertSuggestion({ editor, suggestion }: Autocomplete.Params.SuggestionInserted) {
    // Whenever the user opens with quotation marks and accepts a suggestion,
    // two closing quotation marks will be left at the end:
    //    BaseType "Cha" -> accepts "Chaos Orb"
    //    BaseType "Chaos Orb""
    if(editor.hasMultipleCursors()) {
      let cursorPositions = editor.getCursorBufferPositions();
      for(var cursorPosition of cursorPositions) {
        this.removeConsecutiveQuotes(editor, cursorPosition);
      }
    } else {
      let cursorPosition = editor.getCursorBufferPosition();
      this.removeConsecutiveQuotes(editor, cursorPosition);
    }

    return;
  }

  /** Determines whether or not an operator could be inserted into the given position
   * in the buffer. */
  private isPotentialOperator(editor: AtomCore.TextEditor, position: Point) {
    const line = editor.lineTextForBufferRow(position.row);
    const regex = /^\s*\S+\s*(>|<)?$/;
    const result = regex.exec(line);
    if(result) return true;
    return false;
  }

  /** Determines whether or not text inserted at the given position in the editor
   * would be the first value for the filter rule. */
  private isFirstValue(editor: AtomCore.TextEditor, position: Point, hasOperator: boolean) {
    const line = editor.lineTextForBufferRow(position.row);
    if(hasOperator) {
      var regex = /^\s*\S+\s*(>=|<=|>|<|=)?\s*\S*(.*)/;
    } else {
      var regex = /^\s*\S+\s*\S*(.*)/;
    }

    const result = regex.exec(line);
    if(result) {
      const trailingText = result[2];
      if(trailingText.length > 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  /** Returns a prefix tailored towards item filters, with support for things
   * like value strings. */
  private getPrefix(editor: AtomCore.TextEditor, position: Point) {
    // The previous position in the editor is often a lot more useful than the
    // current ones, as it will contain the scopes for the value which the user
    // may still be editing.
    let previousPositionScopes: string[]|undefined;
    if(position.column > 0) {
      const previousPosition = new Point(position.row, position.column - 1);
      previousPositionScopes = editor.scopeDescriptorForBufferPosition(
          previousPosition).scopes;
    }

    const previousText = editor.getTextInBufferRange([[position.row, 0], position]);
    let prefix: string|undefined;
    if(previousPositionScopes && previousPositionScopes.indexOf(
        "string.partial-quotation.filter") != -1) {
      const prefixRegex = /(\"[^"]*)$/;
      const result = prefixRegex.exec(previousText);
      if(result) prefix = result[1];
    } else if(previousPositionScopes && previousPositionScopes.indexOf(
        "string.quotation.filter") != -1) {
      // The closing quotation mark might be further in on the line, which
      // requires a different regex.
      const stringRange = editor.bufferRangeForScopeAtCursor("string.quotation.filter");
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

  /** Removes suggestions that do not contain the prefix. */
  private pruneSuggestions(prefix: string, suggestions: Autocomplete.Suggestions) {
    if(prefix.length == 0) return suggestions;

    const result: Autocomplete.Suggestions = [];
    const upperPrefix = prefix.toUpperCase();
    const firstChar = prefix.charAt(0);

    for(var s of suggestions) {
      if(s.displayText && firstChar != '"') {
        var text = s.displayText.toUpperCase();
      } else if(Helpers.Guards.isSnippetSuggestion(s)) {
        var text = s.snippet.toUpperCase();
      } else if(Helpers.Guards.isTextSuggestion(s)) {
        var text = s.text.toUpperCase();
      } else continue;

      if(text.indexOf(upperPrefix) != -1) result.push(s);
    }

    return result;
  }

  /** Handles any special casing in regards to the prefix for autocompletion suggestions.
   *  For example, block elements will have the whitespace prepended onto the prefix,
   *  so that they are left aligned on column #0 on text insertion. */
  private setReplacementPrefix(editor: AtomCore.TextEditor, data: DataFormat.SuggestionData,
      position: Point, prefix: string, suggestions: Autocomplete.Suggestions) {
    for(var suggestion of suggestions) {
      let blockElement = false;
      for(var block of data.blocks) {
        if(Helpers.Guards.isSnippetSuggestion(suggestion) && Helpers.Guards.isSnippetSuggestion(block)) {
          if(suggestion.snippet == block.snippet) blockElement = true;
        } else if(Helpers.Guards.isTextSuggestion(suggestion) && Helpers.Guards.isTextSuggestion(block)) {
          if(suggestion.text == block.text) blockElement = true;
        }
      }

      if(blockElement) {
        const range = new Range([position.row, 0], position);
        suggestion.replacementPrefix = editor.getTextInBufferRange(range);
      } else {
        suggestion.replacementPrefix = prefix;
      }
    }

    return;
  }

  /** Determines whether the given position in the editor is surrounded on both
   * sides by double quotation marks, removing one if so. */
  private removeConsecutiveQuotes(editor: AtomCore.TextEditor, position: Point) {
    const leftCharLocation = new Range([position.row, position.column - 1],
        position);
    const rightCharLocation = new Range(position, [position.row,
        position.column + 1]);
    const leftChar = editor.getTextInBufferRange(leftCharLocation);
    const rightChar = editor.getTextInBufferRange(rightCharLocation);

    if(leftChar == '"' && rightChar == '"') {
      editor.setTextInBufferRange(rightCharLocation, "", { undo: "skip" });
    }

    return;
  }
}
