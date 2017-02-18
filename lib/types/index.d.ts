/// <reference types="chai" />
/// <reference path="./event-kit/index.d.ts" />
/// <reference path="./pathwatcher/index.d.ts" />
/// <reference path="./text-buffer/index.d.ts" />
/// <reference path="./atom/index.d.ts" />

declare namespace Filter {
  interface LinterRegistry {
    register(config: { name: string}): LinterRegister;
  }

  interface LinterRegister extends AtomEventKit.IDisposable {
    deleteMessages(): void;
    setMessages(messages: Array<LinterMessage>): void;
  }

  interface LinterMessage {
      type: "Error" | "Warning"
      text: string // mutually exclusive with "html", which we don't use
      filePath: string
      range: TextBuffer.IRange
  }

  interface ItemData {
    bases: Array<string>
    classes: Array<string>
  }

  interface ParseResult {
    value: any,
    startIndex: number,
    endIndex: number,
    found: boolean
  }

  interface ProcessResult {
    messages: LinterMessage[],
    operator: Operator,
    values: any[]
  }

  enum Block {
    Show,
    Hide
  }

  enum Condition {
    ItemLevel,
    DropLevel,
    Quality,
    Rarity,
    Class,
    BaseType,
    Sockets,
    LinkedSockets,
    SocketGroup,
    Height,
    Width,
    Identified
  }

  enum Action {
    SetBorderColor,
    SetTextColor,
    SetBackgroundColor,
    PlayAlertSound,
    SetFontSize
  }

  enum Operator {
    LessThan,
    LessThanEqual,
    GreaterThan,
    GreaterThanEqual,
    Equal,
    None
  }

  interface LineInfo {
    number: number
    file: string
    keyword: string
    keywordHash: number
  }

  interface ConditionData {
    line: number,
    startIndex: number,
    endIndex: number,
    condition: Condition
    operator: Operator
    operands: any[]
  }

  interface ActionData {
    line: number,
    startIndex: number,
    endIndex: number,
    action: Action,
    operator: Operator
    operands: any[]
  }

  interface BlockData {
    line: number,
    startIndex: number,
    endIndex: number,
    blockType: Block,
    conditionals: ConditionData[]
    actions: ActionData[]
  }

  interface FilterData {
    file: string
    blocks: BlockData[]
  }

  interface LineParser {
    readonly textStartIndex: number
    readonly textEndIndex: number
    readonly originalLength: number

    isEmpty(): boolean
    isCommented(): boolean
    isIgnored(): boolean

    nextNumber(): ParseResult
    nextBoolean(): ParseResult
    nextOperator(): ParseResult
    nextWord(): ParseResult
    nextString(): ParseResult
    // TODO(glen): implement this when we upgrade the linter to 2.0
    // nextHex(): ParseResult

    getCurrentIndex(): number
    getText(): string
  }
}
