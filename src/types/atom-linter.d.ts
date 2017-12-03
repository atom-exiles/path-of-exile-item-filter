// Type definitions for Atom Linter v2
// Project: https://github.com/steelbrain/linter

// Type definitions for the few data structures referenced in the Linter
// documentation found here:
//  http://steelbrain.me/linter/

declare module "atom-linter" {
  import { Disposable, Point, Range, TextEditor } from "atom";

  interface ReplacementSolution {
    title?: string;
    position: Range;
    priority?: number;
    currentText?: string;
    replaceWith: string;
  }

  interface CallbackSolution {
    title?: string;
    position: Range;
    priority?: number;
    // tslint:disable-next-line:no-any
    apply(): any;
  }

  interface Message {
    /** The location of the issue (aka where to highlight). */
    location: {
      /** The path to the file to which the message applies. */
      file: string;

      /** The range of the message in the editor. */
      position: Range;
    };

    /** A reference to a different location in the editor. */
    reference?: {
      /** The path to the file being referenced. */
      file: string;

      /** The point being referenced in that file. */
      position?: Point;
    };

    /** An HTTP link to a resource explaining the issue. Default is a google search. */
    url?: string;

    /** The name of the octicon to show in the gutter. */
    icon?: string;

    /** The text for the message. */
    excerpt: string;

    /** The severity level for the message. */
    severity: "error"|"warning"|"info";

    /** Possible solutions (which the user can invoke at will). */
    solutions?: Array<ReplacementSolution|CallbackSolution>;

    /**
     * Markdown long description of the error. Accepts a callback so that you can
     * do things like HTTP requests.
     */
    description?: string|(() => Promise<string>|string);
  }

  interface LinterDelegate {
    name: string;
    getMessages(): Message[];
    clearMessages(): void;
    setMessages(filePath: string, messages: Message[]): void;
    setAllMessages(messages: Message[]): void;
    onDidUpdate(callback: () => void): Disposable;
    onDidDestroy(callback: () => void): Disposable;
    dispose(): void;
  }

  interface LinterConfig {
    name: string;
  }

  interface LinterProvider {
    name: string;
    scope: "file"|"project";
    lintsOnChange: boolean;
    grammarScopes: string[];
    lint(textEditor: TextEditor): Message[]|void|Promise<Message[]|undefined>;
  }

  type LinterConsumer = (register: (config: LinterConfig) => LinterDelegate) => void;
}
