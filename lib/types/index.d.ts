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
  interface TextSolution {
    title?: string,
    position: TextBuffer.Range,
    priority?: number,
    currentText?: string,
    replaceWith: string,
  }

  interface CallbackSolution {
    title?: string,
    position: TextBuffer.Range,
    priority?: number,
    apply: (() => any),
  }

  interface Message {
    /** The location of the issue (aka where to highlight). */
    location: {
      /** The file to which the message applies. MUST be an absolute path. */
      // Technically, this is required; however, we manage messages in such a way
      // that only messages with this property defined are ever passed to the Linter.
      file?: string,
      position: TextBuffer.Range,
    },
    /** A reference to a different location in the editor, useful for jumping to classes etc. */
    reference?: {
      /** The file containing the referenced position. MUST be an absolute path. */
      file: string,
      position?: TextBuffer.Point,
    },
    /** HTTP link to a resource explaining the issue. Default is a google search. */
    // Optional, but Google results aren't particularly useful for item filters.
    url: string,
    /** The name of the octicon to show in gutter. */
    icon?: string,
    /** The text to display for the message. */
    excerpt: string,
    /** The severity level for the message. */
    severity: "error"|"warning"|"info",
    /** The possible solutions for the issue (which users can invoke at will). */
    solutions?: Array<TextSolution|CallbackSolution>,
    /** A Markdown long description of the error, accepts callback so you can do
     *  http requests etc. */
    description?: string | (() => Promise<string> | string)
  }

  interface Config {
    name: string
  }

  interface IndieDelegate {
    readonly name: string
    getMessages(): Message[]
    clearMessages(): void
    /** Replaces the last stored messages for the given filePath for your delegate. */
    setMessages(filePath: string, messages: Message[]): void
    /** Replaces the list of messages Linter has stored for your provider.
     *  Any existing messages, regardless of the file they are associated with, are discarded. */
    setAllMessages(messages: Message[]): void
    onDidUpdate(callback: Function): AtomEventKit.Disposable
    onDidDestroy(callback: Function): AtomEventKit.Disposable
    dispose(): void
  }

  type IndieRegister = (params: Linter.Config) => Linter.IndieDelegate;
}

declare namespace Filter {
  namespace Params {
    interface DataUpdate {
      editor: AtomCore.TextEditor
      lines: Line[]
    }

    interface FilterRename {
      editor: AtomCore.TextEditor
      path: string
    }

    interface BufferChanges {
      oldRange: TextBuffer.Range
      newRange: TextBuffer.Range
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
    messages?: Linter.Message[]
  }
}
