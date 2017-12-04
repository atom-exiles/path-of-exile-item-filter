import { CompositeDisposable, Disposable, Range } from "atom";
import {
  LinterDelegate, Message as LinterMessage, ReplacementSolution
} from "atom-linter";

import { FilterManager, ProcessedFilterData, ReprocessedFilterData } from "./filter-manager";
import { ValidationMessage, ValidationMessages } from "./filter-processor";
import * as Helpers from "./helpers";
import * as Filter from "./item-filter";

function gatherMessages(filter: Filter.Line[]) {
  const output: ValidationMessages = {
    errors: [],
    warnings: [],
    info: [],
  };

  for (const line of filter) {
    if (line.messages.errors.length > 0) {
      output.errors = output.errors.concat(line.messages.errors);
    }

    if (line.messages.warnings.length > 0) {
      output.warnings = output.warnings.concat(line.messages.warnings);
    }

    if (line.messages.info.length > 0) {
      output.info = output.info.concat(line.messages.info);
    }
  }

  return output;
}

function transformMessage(message: ValidationMessage, severity: "error" | "warning" | "info") {
  if (message.file === undefined) {
    throw new Error("transform message called with invalid file");
  }

  const solutions: ReplacementSolution[] = message.solution ? [{
    currentText: message.solution.currentText,
    replaceWith: message.solution.replaceWith,
    position: Range.fromObject(message.range),
  }] : [];

  const output: LinterMessage = {
    excerpt: message.excerpt,
    description: message.description,
    severity,
    solutions,
    location: {
      file: message.file,
      position: Range.fromObject(message.range),
    },
  };
  return output;
}

function postProcessFilter(filter: Filter.Line[], file?: string) {
  // This will eventually be much more elaborate, but for now we're just going
  // to warn if any rules precede the first block.
  for (const line of filter) {
    if (Helpers.isBlock(line)) {
      return;
    } else if (Helpers.isEmpty(line) || Helpers.isUnknown(line) || Helpers.isLineComment(line)) {
      continue;
    } else {
      // This error should take precedence over all others.
      line.messages.errors.length = 0;
      line.messages.warnings.length = 0;
      line.messages.info.length = 0;

      line.invalid = true;
      line.messages.errors.push({
        excerpt: "A filter rule must be contained within a block.",
        file,
        range: line.range,
        url: "http://pathofexile.gamepedia.com/Item_filter",
      });
    }
  }
}

function adjustMessagePaths(messages: ValidationMessages, newPath: string) {
  for (const message of messages.errors) message.file = newPath;
  for (const message of messages.warnings) message.file = newPath;
  for (const message of messages.info) message.file = newPath;

  return messages;
}

export class LinterProvider {
  private delegate?: LinterDelegate;
  private readonly subscriptions: CompositeDisposable;
  private readonly editorSubs: Map<number, Disposable>;
  private readonly filterMessages: Map<number, ValidationMessages>;
  private readonly unsavedFilterMessages: Map<number, ValidationMessages>;
  private messageCache: LinterMessage[];

  constructor(filterManager: FilterManager) {
    this.subscriptions = new CompositeDisposable();
    this.editorSubs = new Map();
    this.filterMessages = new Map();
    this.unsavedFilterMessages = new Map();
    this.messageCache = [];

    this.subscriptions.add(filterManager.observeProcessedFilters(data => {
      const editor = data.editor;

      this.editorSubs.set(editor.id, editor.onDidChangePath(newPath => {
        this.handlePathChange(editor.id, newPath);
      }));

      postProcessFilter(data.lines, editor.getPath());
      this.handleNewFilter(data);
    }));

    this.subscriptions.add(filterManager.onDidReprocessFilter(data => {
      postProcessFilter(data.lines, data.editor.getPath());
      this.handleFilterUpdate(data);
    }));

    this.subscriptions.add(filterManager.onDidDestroyFilter(editorID => {
      this.handleDestroyedFilter(editorID);
    }));
  }

  dispose() {
    this.editorSubs.forEach(sub => {
      sub.dispose();
    });
    this.subscriptions.dispose();

    if (this.delegate) {
      this.delegate.clearMessages();
      this.delegate.dispose();
    }
  }

  setLinter(delegate: LinterDelegate) {
    this.delegate = delegate;
    this.resetMessageCache();
  }

  private handleNewFilter(data: ProcessedFilterData) {
    const messages = gatherMessages(data.lines);
    const editor = data.editor;

    if (data.editor.getPath()) {
      this.filterMessages.set(editor.id, messages);
      this.appendMessages(messages);
    } else {
      this.unsavedFilterMessages.set(editor.id, messages);
    }
  }

  private handleFilterUpdate(data: ReprocessedFilterData) {
    const messages = gatherMessages(data.lines);
    const editor = data.editor;

    if (data.editor.getPath()) {
      this.filterMessages.set(editor.id, messages);
      this.resetMessageCache();
    } else {
      this.unsavedFilterMessages.set(editor.id, messages);
    }
  }

  private handleDestroyedFilter(editorID: number) {
    const editorSubs = this.editorSubs.get(editorID);
    if (editorSubs) editorSubs.dispose();
    this.editorSubs.delete(editorID);
    this.filterMessages.delete(editorID);
    this.unsavedFilterMessages.delete(editorID);
    this.resetMessageCache();
  }

  private handlePathChange(editorID: number, newPath: string) {
    let messages = this.unsavedFilterMessages.get(editorID);
    if (messages !== undefined) {
      this.unsavedFilterMessages.delete(editorID);
    } else {
      messages = this.filterMessages.get(editorID);
    }

    if (messages !== undefined) {
      this.filterMessages.set(editorID, adjustMessagePaths(messages, newPath));
    }
    this.resetMessageCache();
  }

  private processMessages(input: ValidationMessages) {
    const messages: LinterMessage[] = [];

    input.errors.forEach(message => {
      messages.push(transformMessage(message, "error"));
    });

    input.warnings.forEach(message => {
      messages.push(transformMessage(message, "warning"));
    });

    input.info.forEach(message => {
      messages.push(transformMessage(message, "info"));
    });

    return messages;
  }

  private appendMessages(m: ValidationMessages) {
    const messages = this.processMessages(m);
    this.messageCache = this.messageCache.concat(messages);
    if (this.delegate) {
      this.delegate.setAllMessages(this.messageCache);
    }
  }

  private resetMessageCache() {
    this.messageCache.length = 0;
    this.filterMessages.forEach(messages => {
      const processedMessages = this.processMessages(messages);
      this.messageCache = this.messageCache.concat(processedMessages);
    });
    if (this.delegate) {
      this.delegate.setAllMessages(this.messageCache);
    }
  }
}
