/// <reference types="atom-typings" />
/// <reference path="./autocomplete.d.ts" />
/// <reference path="./package-deps.d.ts" />

// We have a custom property for Autocomplete::Suggestion, which we can just
// merge in here.
declare namespace Autocomplete {
  interface Suggestion {
    custom?: {
      /** Stores the rightLabel whenever it has been disabled by the user, allowing us to re-enable it
       *  without a full data refresh. */
      backupRightLabel?: string
    }
  }
}

declare namespace DataFormat {
  interface ItemFile {
    [itemClass: string]: Array<string>
  }

  interface SuggestionFile {
    actions: Autocomplete.Suggestions
    blocks: Autocomplete.Suggestions
    booleans: Autocomplete.Suggestions
    extras: {
      bases: Autocomplete.Suggestions
      blocks: Autocomplete.Suggestions
      classes: Autocomplete.Suggestions
    }
    filters: Autocomplete.Suggestions
    operators: Autocomplete.Suggestions
    rarities: Autocomplete.Suggestions
    sockets: Autocomplete.Suggestions
  }

  interface SoundFile {
    [id: string]: {
      filename: string
      label?: string
    }
  }

  interface JSONData {
    items: ItemFile
    suggestions: SuggestionFile
    sounds: SoundFile
  }

  interface SuggestionData {
    actions: Autocomplete.Suggestions
    blocks: Autocomplete.Suggestions
    booleans: Autocomplete.Suggestions
    filters: Autocomplete.Suggestions
    operators: Autocomplete.Suggestions
    rarities: Autocomplete.Suggestions
    sockets: Autocomplete.Suggestions
    bases: Autocomplete.TextSuggestions
    classes: Autocomplete.TextSuggestions
    sounds: Autocomplete.TextSuggestions
    extraBases: Autocomplete.Suggestions
    extraBlocks: Autocomplete.Suggestions
    extraClasses: Autocomplete.Suggestions
    classWhitelist: Autocomplete.TextSuggestions
    baseWhitelist: Autocomplete.TextSuggestions
    [key: string]: Autocomplete.Suggestions
  }

  interface ValidationData {
    validClasses: string[]
    validBases: string[]
    validSounds: string[]
    classWhitelist: string[]
    baseWhitelist: string[]
  }

  /** The format used by the parser to report errors. This type is essentially a
   *  slimmed down version of a Linter Message and will be transformed into that
   *  type by our Linter provider. */
  interface ValidationMessage {
    /** The range of the message in the editor. */
    range: Filter.Components.Range
    /** The text for the message. */
    excerpt: string
    /** Markdown long description of the error. */
    description?: string
    /** The path to the file to which the message applies. */
    file?: string
    /** An HTTP link to a resource explaining the issue. */
    url?: string
    /** A possible solution (which the user can invoke at will). */
    solution?: {
      /** The text being replaced by the solution. */
      currentText?: string
      /** The replacement text that fixes the issue. */
      replaceWith: string
    }
  }

  interface ValidationMessages {
    errors: ValidationMessage[]
    warnings: ValidationMessage[]
    info: ValidationMessage[]
    [key: string]: ValidationMessage[]
  }
}

declare namespace Filter {
  export namespace Params {
    interface BufferChange {
      newExtent: number
      oldExtent: number
      start: number
    }

    interface ProcessLines {
      /** The text for each line to be processed. */
      lines: string[],
      /** The data to validate each line against. */
      data: DataFormat.ValidationData,
      /** The line number for the first line being processed. */
      row: number,
      /** The name of the file being processed. */
      file?: string,
    }

    interface ProcessLinesTask extends ProcessLines {
      /** The maximum number of lines to process at any given time. */
      chunkSize: number
    }

    interface ProcessedFilterData {
      editor: AtomCore.TextEditor
      lines: Filter.Line[]
    }

    interface ReprocessedFilterData extends ProcessedFilterData {
      changes: Filter.Params.BufferChange[]
    }
  }

  export namespace Components {
    interface Range extends TextBuffer.IRange {}

    interface Text {
      text: string, range: Range
    }
    interface Keyword extends Text {}
    interface Comment extends Text {}
    interface ThemeTag extends Text {}
    interface Operator extends Text {}

    interface Value<T> {
      value: T
      range: Range
    }

    interface Values<T> {
      values: Value<T>[]
      range: Range
    }

    interface Color {
      red?: Value<number>
      green?: Value<number>
      blue?: Value<number>
      alpha?: Value<number>
    }

    interface Themeable {
      tag?: ThemeTag
    }
  }

  interface Line {
    range: Components.Range
    invalid: boolean
    messages: DataFormat.ValidationMessages
  }

  interface Block extends Line {
    type: "block"
    keyword: Components.Keyword
    trailingComment?: Components.Comment
  }

  interface Rule extends Line {
    type: "rule"
    keyword: Components.Keyword
  }

  interface FilterRule extends Rule {
    ruleType: "filter"
  }

  interface ActionRule extends Rule {
    ruleType: "action"
  }

  namespace Element {
    interface Empty extends Line {
      type: "empty"
    }

    interface LineComment extends Line {
      type: "comment"
      text: string
    }

    interface Unknown extends Line {
      type: "unknown"
      text: string
    }

    interface ShowBlock extends Block {
      ruleType: "show"
    }

    interface HideBlock extends Block {
      ruleType: "hide"
    }

    interface ItemLevelRule extends FilterRule {
      filterName: "ItemLevel"
      operator?: Components.Operator
      value?: Components.Value<number>
    }

    interface DropLevelRule extends FilterRule {
      filterName: "DropLevel"
      operator?: Components.Operator
      value?: Components.Value<number>
    }

    interface QualityRule extends FilterRule {
      filterName: "Quality"
      operator?: Components.Operator
      value?: Components.Value<number>
    }

    interface RarityRule extends FilterRule {
      filterName: "Rarity"
      operator?: Components.Operator
      value?: Components.Value<string>
    }

    interface ClassRule extends FilterRule {
      filterName: "Class"
      values?: Components.Values<string>
    }

    interface BaseTypeRule extends FilterRule {
      filterName: "BaseType"
      values?: Components.Values<string>
    }

    interface SocketsRule extends FilterRule {
      filterName: "Sockets"
      operator?: Components.Operator
      value?: Components.Value<number>
    }

    interface LinkedSocketsRule extends FilterRule {
      filterName: "LinkedSockets"
      operator?: Components.Operator
      value?: Components.Value<number>
    }

    interface SocketGroupRule extends FilterRule {
      filterName: "SocketGroup"
      value?: Components.Value<string>
    }

    interface HeightRule extends FilterRule {
      filterName: "Height"
      operator?: Components.Operator
      value?: Components.Value<number>
    }

    interface WidthRule extends FilterRule {
      filterName: "Width"
      operator?: Components.Operator
      value?: Components.Value<number>
    }

    interface IdentifiedRule extends FilterRule {
      filterName: "Identified"
      value?: Components.Value<boolean>
    }

    interface CorruptedRule extends FilterRule {
      filterName: "Corrupted"
      value?: Components.Value<boolean>
    }

    interface SetBorderColorRule extends ActionRule, Components.Color {
      actionName: "SetBorderColor"
      trailingComment?: Components.Comment
    }

    interface SetTextColorRule extends ActionRule, Components.Color {
      actionName: "SetTextColor"
      trailingComment?: Components.Comment
    }

    interface SetBackgroundColorRule extends ActionRule, Components.Color {
      actionName: "SetBackgroundColor"
      trailingComment?: Components.Comment
    }

    interface PlayAlertSoundRule extends ActionRule {
      actionName: "PlayAlertSound"
      id?: Components.Value<string>
      volume?: Components.Value<number>
      trailingComment?: Components.Comment
    }

    interface SetFontSizeRule extends ActionRule {
      actionName: "SetFontSize"
      value?: Components.Value<number>
    }
  }
}
