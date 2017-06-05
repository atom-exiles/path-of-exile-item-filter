// Type definitions for Atom Linter v2
// Project: https://github.com/steelbrain/linter

// Type definitions for the few data structures referenced in the Linter
// documentation found here:
//  http://steelbrain.me/linter/

declare namespace Linter {
  interface Solution {
    title?: string
    position: TextBuffer.Range
    priority?: number
  }

  interface ReplacementSolution extends Solution {
    currentText?: string
    replaceWith: string
  }

  interface CallbackSolution extends Solution {
    apply: () => any
  }

  interface Message {
    /** The location of the issue (aka where to highlight). */
    location: {
      /** The path to the file to which the message applies. */
      file: string

      /** The range of the message in the editor. */
      position: TextBuffer.Range
    }

    /** A reference to a different location in the editor. */
    reference?: {
      /** The path to the file being referenced. */
      file: string

      /** The point being referenced in that file. */
      position?: TextBuffer.Point
    }

    /** An HTTP link to a resource explaining the issue. Default is a google search. */
    url?: string

    /** The name of the octicon to show in the gutter. */
    icon?: string

    /** The text for the message. */
    excerpt: string

    /** The severity level for the message. */
    severity: "error"|"warning"|"info"

    /** Possible solutions (which the user can invoke at will). */
    solutions?: Array<ReplacementSolution|CallbackSolution>

    /** Markdown long description of the error. Accepts a callback so that you can
     *  do things like HTTP requests. */
    description?: string|(() => Promise<string>|string)
  }

  interface Config {
    name: string
  }

  interface IndieDelegate {
    name: string
    getMessages(): Array<Message>
    clearMessages(): void
    setMessages(filePath: string, messages: Array<Message>): void
    setAllMessages(messages: Array<Message>): void
    onDidUpdate(callback: Function): AtomEventKit.Disposable
    onDidDestroy(callback: Function): AtomEventKit.Disposable
    dispose(): void
  }
}
