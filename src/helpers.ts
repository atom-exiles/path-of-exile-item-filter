import { TextEditor } from "atom";
import { SnippetSuggestion, TextSuggestion } from "atom-autocomplete";

/**
 *  Logs the given message with our specific format if the editor is runnin in
 *  development mode.
 *  @param severity The severity of the message. Tacked onto the message for now,
 *  but in the future this will affect the message's channel.
 *  @param message The message to log.
 */
export function log(severity: "info"|"warning"|"error", message: string) {
  // The Atom team seems to be working on a logging API, which we will eventually
  // leverage here. Until that is released, messages will only be logged to the
  // console in development mode.
  if (atom.inDevMode()) {
    // tslint:disable-next-line:no-console
    console.log(`${severity.toUpperCase()}: ${message}. (path-of-exile-item-filter)`);
  }
}

/** Returns whether or not the given editor contains an item filter. */
export function isItemFilter(editor: TextEditor) {
  const grammar = editor.getGrammar();
  if (grammar.scopeName === "source.filter") {
    return true;
  } else {
    return false;
  }
}

/** Returns whether or not the given suggestion is a TextSuggestion. */
export function isTextSuggestion(suggestion: TextSuggestion|SnippetSuggestion):
  suggestion is TextSuggestion {
  return (<TextSuggestion> suggestion).text !== undefined;
}

/** Returns whether or not the given suggestion is a SnippetSuggestion. */
export function isSnippetSuggestion(suggestion: TextSuggestion|SnippetSuggestion):
  suggestion is SnippetSuggestion {
  return (<SnippetSuggestion> suggestion).snippet !== undefined;
}
