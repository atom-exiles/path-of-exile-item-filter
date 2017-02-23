interface LinterFix {
  range: TextBuffer.IRange
  newText: string
  oldText?: string
}

interface LinterMessage {
  type: "Error"|"Warning"|"Trace"
  filePath?: string
  range?: TextBuffer.IRange
  fix?: LinterFix
  severity?: "error"|"warning"|"info"
}
interface LinterTextMessage extends LinterMessage { text: string }
interface LinterHTMLMessage extends LinterMessage { html: string }

interface LinterProvider {
  name: string
  scope: string
  lintOnFly: boolean
  grammarScopes: Array<string>
  lint: (textEditor: AtomCore.TextEditor) => LintResult
}

type LintResult = Array<LinterTextMessage|LinterHTMLMessage>|
    Promise<Array<LinterTextMessage|LinterHTMLMessage>>

interface LinterRegistry {
  register(config: { name: string }): LinterRegister;
}

interface LinterRegister extends AtomEventKit.IDisposable {
  deleteMessages(): void;
  setMessages(messages: LintResult): void;
}
