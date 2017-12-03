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

// export namespace Guards {
//   /** Returns whether or not the given line is a filter block. */
//   export function isBlock(line: Filter.Line): line is Filter.Block {
//     if((<Filter.Block>line).type === "block") return true;
//     else return false;
//   }

//   /** Returns whether or not the given line is a rule. */
//   export function isRule(line: Filter.Line): line is Filter.Rule {
//     if((<Filter.Rule>line).type === "rule") return true;
//     else return false;
//   }

//   /** Returns whether or not the given line is empty. */
//   export function isEmpty(line: Filter.Line): line is Filter.Element.Empty {
//     if((<Filter.Element.Empty>line).type === "empty") return true;
//     else return false;
//   }

//   /** Returns whether or not the given line is a line comment. */
//   export function isLineComment(line: Filter.Line): line is Filter.Element.LineComment {
//     if((<Filter.Element.LineComment>line).type === "comment") return true;
//     else return false;
//   }

//   /** Returns whether or not the given line is unknown. */
//   export function isUnknown(line: Filter.Line): line is Filter.Element.Unknown {
//     if((<Filter.Element.Unknown>line).type === "unknown") return true;
//     else return false;
//   }

//   /** Returns whether or not the given line is a Show block. */
//   export function isShowBlock(line: Filter.Line): line is Filter.Element.ShowBlock {
//     if(isBlock(line)) {
//       if((<Filter.Element.ShowBlock>line).ruleType === "show") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a Hide block. */
//   export function isHideBlock(line: Filter.Line): line is Filter.Element.HideBlock {
//     if(isBlock(line)) {
//       if((<Filter.Element.HideBlock>line).ruleType === "hide") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a filter rule. */
//   export function isFilterRule(line: Filter.Line): line is Filter.FilterRule {
//     if(isRule(line)) {
//       if((<Filter.FilterRule>line).ruleType === "filter") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is an ItemLevel rule. */
//   export function isItemLevelRule(line: Filter.Line): line is Filter.Element.ItemLevelRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.ItemLevelRule>line).filterName === "ItemLevel") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a DropLevel rule. */
//   export function isDropLevelRule(line: Filter.Line): line is Filter.Element.DropLevelRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.DropLevelRule>line).filterName === "DropLevel") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a Quality rule. */
//   export function isQualityRule(line: Filter.Line): line is Filter.Element.QualityRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.QualityRule>line).filterName === "Quality") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a Rarity rule. */
//   export function isRarityRule(line: Filter.Line): line is Filter.Element.RarityRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.RarityRule>line).filterName === "Rarity") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a Class rule. */
//   export function isClassRule(line: Filter.Line): line is Filter.Element.ClassRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.ClassRule>line).filterName === "Class") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a BaseType rule. */
//   export function isBaseTypeRule(line: Filter.Line): line is Filter.Element.BaseTypeRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.BaseTypeRule>line).filterName === "BaseType") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a Sockets rule. */
//   export function isSocketsRule(line: Filter.Line): line is Filter.Element.SocketsRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.SocketsRule>line).filterName === "Sockets") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a LinkedSockets rule. */
//   export function isLinkedSocketsRule(line: Filter.Line):
//      line is Filter.Element.LinkedSocketsRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.LinkedSocketsRule>line).filterName === "LinkedSockets") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a SocketGroup rule. */
//   export function isSocketGroupRule(line: Filter.Line): line is Filter.Element.SocketGroupRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.SocketGroupRule>line).filterName === "SocketGroup") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a Height rule. */
//   export function isHeightRule(line: Filter.Line): line is Filter.Element.HeightRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.HeightRule>line).filterName === "Height") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a Width rule. */
//   export function isWidthRule(line: Filter.Line): line is Filter.Element.WidthRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.WidthRule>line).filterName === "Width") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is an Identified rule. */
//   export function isIdentifiedRule(line: Filter.Line): line is Filter.Element.IdentifiedRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.IdentifiedRule>line).filterName === "Identified") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a Corrupted rule. */
//   export function isCorruptedRule(line: Filter.Line): line is Filter.Element.CorruptedRule {
//     if(isFilterRule(line)) {
//       if((<Filter.Element.CorruptedRule>line).filterName === "Corrupted") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is an action rule. */
//   export function isActionRule(line: Filter.Line): line is Filter.ActionRule {
//     if(isRule(line)) {
//       if((<Filter.ActionRule>line).ruleType === "action") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a SetBorderColor rule. */
//   export function isSetBorderColorRule(line: Filter.Line):
// line is Filter.Element.SetBorderColorRule {
//     if(isActionRule(line)) {
//       if((<Filter.Element.SetBorderColorRule>line).actionName === "SetBorderColor") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a SetTextColor rule. */
//   export function isSetTextColorRule(line: Filter.Line):
// line is Filter.Element.SetTextColorRule {
//     if(isActionRule(line)) {
//       if((<Filter.Element.SetTextColorRule>line).actionName === "SetTextColor") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a SetBackgroundColor rule. */
//   export function isSetBackgroundColorRule(line: Filter.Line):
// line is Filter.Element.SetBackgroundColorRule {
//     if(isActionRule(line)) {
//       if((<Filter.Element.SetBackgroundColorRule>line).actionName === "SetBackgroundColor") {
// return true; }
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a PlayAlertSound rule. */
//   export function isPlayAlertSoundRule(line: Filter.Line):
// line is Filter.Element.PlayAlertSoundRule {
//     if(isActionRule(line)) {
//       if((<Filter.Element.PlayAlertSoundRule>line).actionName === "PlayAlertSound") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }

//   /** Returns whether or not the given line is a SetFontSize rule. */
//   export function isSetFontSizeRule(line: Filter.Line): line is Filter.Element.SetFontSizeRule {
//     if(isActionRule(line)) {
//       if((<Filter.Element.SetFontSizeRule>line).actionName === "SetFontSize") return true;
//       else return false;
//     } else {
//       return false;
//     }
//   }
// }
