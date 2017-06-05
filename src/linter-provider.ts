import { CompositeDisposable, Disposable, Range } from "atom";

import ConfigManager from "./config-manager";
import FilterManager from "./filter-manager";

function gatherMessages(filter: Filter.Line[]) {
  const output: DataFormat.ValidationMessages = {
    errors: [],
    warnings: [],
    info: []
  };

  for(var line of filter) {
    if(line.messages.errors.length > 0) {
      output.errors = output.errors.concat(line.messages.errors);
    }

    if(line.messages.warnings.length > 0) {
      output.warnings = output.warnings.concat(line.messages.warnings);
    }

    if(line.messages.info.length > 0) {
      output.info = output.info.concat(line.messages.info);
    }
  }

  return output;
}

function transformMessage(message: DataFormat.ValidationMessage, severity: "error"|"warning"|"info") {
  if(message.file == null) throw new Error("transform message called with invalid file");

  let solution: Linter.ReplacementSolution|undefined;
  if(message.solution) {
    solution = {
      currentText: message.solution.currentText,
      replaceWith: message.solution.replaceWith,
      position: Range.fromObject(message.range)
    }
  }
  let solutions: Array<Linter.ReplacementSolution> = [];

  const output: Linter.Message = {
    excerpt: message.excerpt,
    description: message.description,
    severity,
    solutions,
    location: {
      file: message.file,
      position: Range.fromObject(message.range)
    }
  };
  return output;
}

function adjustMessagePaths(messages: DataFormat.ValidationMessages, newPath: string) {
  for(var message of messages.errors) message.file = newPath;
  for(var message of messages.warnings) message.file = newPath;
  for(var message of messages.info) message.file = newPath;

  return messages;
}

export default class LinterProvider {
  private readonly config: ConfigManager;
  private readonly filterManager: FilterManager;
  private readonly delegate: Linter.IndieDelegate;
  private readonly subscriptions: CompositeDisposable;
  private readonly editorSubs: Map<number, Disposable>;
  private readonly filterMessages: Map<number, DataFormat.ValidationMessages>;
  private readonly unsavedFilterMessages: Map<number, DataFormat.ValidationMessages>;
  private messageCache: Linter.Message[];

  constructor(config: ConfigManager, filterManager: FilterManager, delegate: Linter.IndieDelegate) {
    this.config = config;
    this.filterManager = filterManager;
    this.delegate = delegate;

    this.subscriptions = new CompositeDisposable;
    this.editorSubs = new Map;
    this.filterMessages = new Map;
    this.unsavedFilterMessages = new Map;
    this.messageCache = [];

    this.subscriptions.add(filterManager.observeProcessedFilters((data) => {
      const editor = data.editor;

      this.editorSubs.set(editor.id, editor.onDidChangePath((newPath) => {
        this.handlePathChange(editor.id, newPath);
      }));

      this.handleNewFilter(data);
    }));

    this.subscriptions.add(filterManager.onDidReprocessFilter((data) => {
      this.handleFilterUpdate(data);
    }));

    this.subscriptions.add(filterManager.onDidDestroyFilter((editorID) => {
      this.handleDestroyedFilter(editorID);
    }));

    this.subscriptions.add(this.config.general.enableLinter.onDidChange(() => {
      this.resetMessageCache();
    }));

    this.subscriptions.add(this.config.linter.enableWarnings.onDidChange(() => {
      this.resetMessageCache();
    }));

    this.subscriptions.add(this.config.linter.enableInfo.onDidChange((event) => {
      this.resetMessageCache();
    }));
  }

  dispose() {
    this.editorSubs.forEach((sub) => {
      sub.dispose();
    });
    this.subscriptions.dispose();
  }

  private handleNewFilter(data: Filter.Params.ProcessedFilterData) {
    const messages = gatherMessages(data.lines);
    if(data.editor.getPath()) {
      this.filterMessages.set(data.editor.id, messages);
      this.appendMessages(messages);
    } else {
      this.unsavedFilterMessages.set(data.editor.id, messages)
    }
  }

  private handleFilterUpdate(data: Filter.Params.ReprocessedFilterData) {
    const messages = gatherMessages(data.lines);
    if(data.editor.getPath()) {
      this.filterMessages.set(data.editor.id, messages);
      this.resetMessageCache();
    } else {
      this.unsavedFilterMessages.set(data.editor.id, messages);
    }
  }

  private handleDestroyedFilter(editorID: number) {
    const editorSubs = this.editorSubs.get(editorID);
    if(editorSubs) editorSubs.dispose();
    this.editorSubs.delete(editorID);
    this.filterMessages.delete(editorID);
    this.unsavedFilterMessages.delete(editorID);
    this.resetMessageCache();
  }

  private handlePathChange(editorID: number, newPath: string) {
    var messages = this.unsavedFilterMessages.get(editorID);
    if(messages != null) {
      this.unsavedFilterMessages.delete(editorID);
    } else {
      messages = this.filterMessages.get(editorID);
    }

    if(messages != null) {
      this.filterMessages.set(editorID, adjustMessagePaths(messages, newPath));
      this.resetMessageCache();
    }
  }

  processMessages(input: DataFormat.ValidationMessages) {
    const messages: Linter.Message[] = [];

    input.errors.forEach((message) => {
      messages.push(transformMessage(message, "error"));
    });

    if(this.config.linter.enableWarnings.value) {
      input.warnings.forEach((message) => {
        messages.push(transformMessage(message, "warning"));
      });
    }

    if(this.config.linter.enableInfo.value) {
      input.info.forEach((message) => {
        messages.push(transformMessage(message, "info"));
      });
    }

    return messages;
  }

  private appendMessages(m: DataFormat.ValidationMessages) {
    const messages = this.processMessages(m);
    this.messageCache = this.messageCache.concat(messages);
    this.delegate.setAllMessages(this.messageCache);
  }

  private resetMessageCache() {
    this.messageCache.length = 0;
    if(this.config.general.enableLinter.value) {
      this.filterMessages.forEach((messages) => {
        const processedMessages = this.processMessages(messages);
        this.messageCache = this.messageCache.concat(processedMessages);
      });
      this.delegate.setAllMessages(this.messageCache);
    } else {
      this.delegate.clearMessages();
    }
  }
}
