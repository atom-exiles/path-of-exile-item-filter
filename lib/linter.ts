import { Range, CompositeDisposable } from "atom";

import * as path from "path";

import * as settings from "./settings";

interface LinterMessage {
  // If we ever need anything custom, see:
  // https://github.com/steelbrain/linter/blob/v1/docs/types/linter-message-v1.md#registering-custom-types
  type: "Error"|"Warning"|"Trace"
  filePath?: string
  range?: TextBuffer.IRange
  // trace?: Array<LinterTextTrace|LinterHTMLTrace -- unused
  fix?: LinterFix
  severity?: "error"|"warning"|"info"
}
interface LinterTextMessage extends LinterMessage { text: string }
interface LinterHTMLMessage extends LinterMessage { html: string }

interface LinterFix {
  range: TextBuffer.IRange
  newText: string
  oldText?: string
}

interface LinterProvider {
  name: string
  scope: string
  lintOnFly: boolean
  grammarScopes: Array<string>
  lint: (textEditor: AtomCore.TextEditor) => LintResult
}

type LintResult = Array<LinterTextMessage|LinterHTMLMessage>|
    Promise<Array<LinterTextMessage|LinterHTMLMessage>>

interface FilterBlock {

}

interface FilterCondition {

}

interface FilterAction {

}

interface FilterComment {

}

interface FilterLine {
  type?: FilterBlock|FilterCondition|FilterAction|FilterComment
  messages?: Array<LinterTextMessage|LinterHTMLMessage>
}

interface ItemFilterData {
  subscriptions: CompositeDisposable
  lines: Array<string>
  lineInfo: Array<FilterLine>
}

const knownBuffers = new Map<string, Promise<ItemFilterData>>();

export function setupSubscriptions() {

}

export function removeSubscriptions() {

}

/** Processes the entire item filter. */
function processBuffer(editor: AtomCore.TextEditor, bufferData: ItemFilterData) {
}

/** Performs a partial update on an item filter. */
function updateBuffer(editor: AtomCore.TextEditor, bufferData: ItemFilterData,
    event: any) {
}

/** Merges the messages stored line-by-line in the filter data into a single
 *  Array. */
function mergeBufferMessages(bufferData: Promise<ItemFilterData>): LintResult {
  const result = bufferData.then((bd): LintResult => {
    var messages: Array<LinterTextMessage|LinterHTMLMessage> = [];
    bd.lineInfo.forEach((line) => {
      if(line.messages) messages = messages.concat(line.messages);
    });
    return messages;
  })
  return result;
}

// The linter can be thought of as having two phases, with the first being
// initialization and the second maintenance. Initialization is the first
// pass on an entire file, which is an asynchronous and intensive operation,
// while maintenance is synchronous and (usually) lightweight.
//
/** Provided as a callback to the Linter provider. */
function lint(editor: AtomCore.TextEditor): LintResult {
  if(!settings.config.generalSettings.enableLinter.get()) return [];
  var result: LintResult;

  // Maintenance is done synchronously on a callback, so we can just return the
  // messages immediately (once intiailization completes).
  if(knownBuffers.has(editor.buffer.id)) {
    const bufferData = knownBuffers.get(editor.buffer.id);
    if(bufferData) result = mergeBufferMessages(bufferData);
    else result = [];
  } else {
    const subscriptions = new CompositeDisposable;

    const bufferData: Promise<ItemFilterData> = new Promise((resolve, reject) => {
      const lines = editor.buffer.getLines();
      const bd: ItemFilterData = {
        subscriptions: subscriptions,
        lines: lines,
        lineInfo: []
      };
      processBuffer(editor, bd);
      resolve(bd);
    })
    knownBuffers.set(editor.buffer.id, bufferData);

    subscriptions.add(editor.buffer.onDidChange(async (event) => {
      const processedData = await bufferData;
      updateBuffer(editor, processedData, event);
    }));

    subscriptions.add(editor.buffer.onDidDestroy(() => {
      subscriptions.dispose();
      knownBuffers.delete(editor.buffer.id);
    }));

    subscriptions.add(editor.buffer.onDidChangePath((newPath) => {
      if(!(path.extname(newPath) == '.filter')) {
        subscriptions.dispose();
        knownBuffers.delete(editor.buffer.id);
      }
    }));

    result = mergeBufferMessages(bufferData);
  }
  return result;
}

export var provider: LinterProvider = {
  name: 'POE Item Filter',
  scope: 'file',
  lintOnFly: true,
  grammarScopes: ['source.poe'],
  lint: lint
}
