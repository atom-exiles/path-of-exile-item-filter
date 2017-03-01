declare namespace Data {
  interface Completion {
    classes: Array<Completion.TextSuggestion|Completion.SnippetSuggestion>
    bases: Array<Completion.TextSuggestion|Completion.SnippetSuggestion>
    whitelistClasses: Array<Completion.TextSuggestion|Completion.SnippetSuggestion>
    whitelistBases: Array<Completion.TextSuggestion|Completion.SnippetSuggestion>
  }

  interface Parser {
    classes: string[]
    bases: string[]
    whitelistClasses: string[]
    whitelistBases: string[]
  }
}

declare namespace Sound {
  namespace Params {
    interface PlayAlertSound {
      id: number
      volume?: number
    }
  }
}

declare namespace Completion {
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

    custom?: {
      /** Set whenever the suggestion is one of the item rarities. */
      itemRarity?: boolean
      /** Stores the unmodified rightLabel for the suggestion. Depending on user
       *  configuration, the rightLabel field may be set to undefined. This
       *  property allows us to restore it when necessary. */
      backupRightLabel?: string
    }
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
  type Suggestions = Array<TextSuggestion|SnippetSuggestion>;
}

declare namespace Linter {
  interface Fix {
    range: TextBuffer.IRange
    newText: string
    oldText?: string
  }

  interface Message {
    type: "Error"|"Warning"|"Trace"
    filePath?: string
    range?: TextBuffer.IRange
    fix?: Fix
    severity?: "error"|"warning"|"info"
  }

  interface TextMessage extends Message { text: string }
  interface HTMLMessage extends Message { html: string }
  type Messages = Array<TextMessage|HTMLMessage>;

  interface Registry {
    register(config: { name: string }): Register;
  }

  interface Register extends AtomEventKit.IDisposable {
    deleteMessages(): void;
    setMessages(messages: Messages): void;
  }

  interface Provider {
    name: string
    scope: string
    lintOnFly: boolean
    grammarScopes: Array<string>
    lint: (textEditor: AtomCore.TextEditor) => Messages
  }
}

declare namespace Filter {
  namespace Params {
    interface DataUpdate {
      editor: AtomCore.TextEditor
      lines: Line[]
    }
  }

  interface Value {
    value: any
    range: TextBuffer.Range
  }

  interface Operator {
    type: string
    range: TextBuffer.Range
  }

  interface Keyword {
    name: string
    range: TextBuffer.Range
  }

  interface Block {
    type: Keyword
    scope: TextBuffer.Range
    trailingComment?: Comment
  }

  interface Rule {
    type: Keyword
    category: "condition"|"action"
    operator?: Operator
    values: Value[]
    trailingComment?: Comment
    range: TextBuffer.Range
  }

  interface Comment {
    text: string
    range: TextBuffer.Range
  }

  interface Unknown {
    text: string
    range: TextBuffer.Range
  }

  interface Empty {}

  interface Line {
    type: "Block"|"Comment"|"Rule"|"Unknown"|"Empty"
    data: Block|Comment|Rule|Unknown|Empty
    invalid: boolean
    messages?: (Linter.TextMessage|Linter.HTMLMessage)[]
  }
}
