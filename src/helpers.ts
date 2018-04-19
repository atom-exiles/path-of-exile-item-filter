import { TextEditor } from "atom";
import { SnippetSuggestion, TextSuggestion } from "atom-autocomplete";

import * as Filter from "./item-filter";

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

/** Returns whether or not the given line is a filter block. */
export function isBlock(line: Filter.Line): line is Filter.Block {
  return (<Filter.Block> line).type === "block";
}

/** Returns whether or not the given line is a rule. */
export function isRule(line: Filter.Line): line is Filter.Rule {
  return (<Filter.Rule> line).type === "rule";
}

/** Returns whether or not the given line is empty. */
export function isEmpty(line: Filter.Line): line is Filter.EmptyLine {
  return (<Filter.EmptyLine> line).type === "empty";
}

/** Returns whether or not the given line is a line comment. */
export function isLineComment(line: Filter.Line): line is Filter.CommentedLine {
  return (<Filter.CommentedLine> line).type === "comment";
}

/** Returns whether or not the given line is unknown. */
export function isUnknown(line: Filter.Line): line is Filter.UnknownLine {
  return (<Filter.UnknownLine> line).type === "unknown";
}

/** Returns whether or not the given line is a Show block. */
export function isShowBlock(line: Filter.Line): line is Filter.ShowBlock {
  if (isBlock(line)) {
    return (<Filter.ShowBlock> line).ruleType === "show";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Hide block. */
export function isHideBlock(line: Filter.Line): line is Filter.HideBlock {
  if (isBlock(line)) {
    return (<Filter.HideBlock> line).ruleType === "hide";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a filter rule. */
export function isFilterRule(line: Filter.Line): line is Filter.FilterRule {
  if (isRule(line)) {
    return (<Filter.FilterRule> line).ruleType === "filter";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is an ItemLevel rule. */
export function isItemLevelRule(line: Filter.Line): line is Filter.ItemLevelRule {
  if (isFilterRule(line)) {
    return (<Filter.ItemLevelRule> line).filterName === "ItemLevel";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a DropLevel rule. */
export function isDropLevelRule(line: Filter.Line): line is Filter.DropLevelRule {
  if (isFilterRule(line)) {
    return (<Filter.DropLevelRule> line).filterName === "DropLevel";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Quality rule. */
export function isQualityRule(line: Filter.Line): line is Filter.QualityRule {
  if (isFilterRule(line)) {
    return (<Filter.QualityRule> line).filterName === "Quality";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Rarity rule. */
export function isRarityRule(line: Filter.Line): line is Filter.RarityRule {
  if (isFilterRule(line)) {
    return (<Filter.RarityRule> line).filterName === "Rarity";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Class rule. */
export function isClassRule(line: Filter.Line): line is Filter.ClassRule {
  if (isFilterRule(line)) {
    return (<Filter.ClassRule> line).filterName === "Class";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a BaseType rule. */
export function isBaseTypeRule(line: Filter.Line): line is Filter.BaseTypeRule {
  if (isFilterRule(line)) {
    return (<Filter.BaseTypeRule> line).filterName === "BaseType";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Sockets rule. */
export function isSocketsRule(line: Filter.Line): line is Filter.SocketsRule {
  if (isFilterRule(line)) {
    return (<Filter.SocketsRule> line).filterName === "Sockets";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a LinkedSockets rule. */
export function isLinkedSocketsRule(line: Filter.Line): line is Filter.LinkedSocketsRule {
  if (isFilterRule(line)) {
    return (<Filter.LinkedSocketsRule> line).filterName === "LinkedSockets";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a SocketGroup rule. */
export function isSocketGroupRule(line: Filter.Line): line is Filter.SocketGroupRule {
  if (isFilterRule(line)) {
    return (<Filter.SocketGroupRule> line).filterName === "SocketGroup";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Height rule. */
export function isHeightRule(line: Filter.Line): line is Filter.HeightRule {
  if (isFilterRule(line)) {
    return (<Filter.HeightRule> line).filterName === "Height";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Width rule. */
export function isWidthRule(line: Filter.Line): line is Filter.WidthRule {
  if (isFilterRule(line)) {
    return (<Filter.WidthRule> line).filterName === "Width";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is an Identified rule. */
export function isIdentifiedRule(line: Filter.Line): line is Filter.IdentifiedRule {
  if (isFilterRule(line)) {
    return (<Filter.IdentifiedRule> line).filterName === "Identified";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Corrupted rule. */
export function isCorruptedRule(line: Filter.Line): line is Filter.CorruptedRule {
  if (isFilterRule(line)) {
    return (<Filter.CorruptedRule> line).filterName === "Corrupted";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Corrupted rule. */
export function isElderItemRule(line: Filter.Line): line is Filter.ElderItemRule {
  if (isFilterRule(line)) {
    return (<Filter.ElderItemRule> line).filterName === "ElderItem";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Corrupted rule. */
export function isShaperItemRule(line: Filter.Line): line is Filter.ShaperItemRule {
  if (isFilterRule(line)) {
    return (<Filter.ShaperItemRule> line).filterName === "ShaperItem";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Corrupted rule. */
export function isShapedMapRule(line: Filter.Line): line is Filter.ShapedMapRule {
  if (isFilterRule(line)) {
    return (<Filter.ShapedMapRule> line).filterName === "ShapedMap";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a Corrupted rule. */
export function isElderMapRule(line: Filter.Line): line is Filter.ElderMapRule {
  if (isFilterRule(line)) {
    return (<Filter.ElderMapRule> line).filterName === "ElderMap";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is an action rule. */
export function isActionRule(line: Filter.Line): line is Filter.ActionRule {
  if (isRule(line)) {
    return (<Filter.ActionRule> line).ruleType === "action";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a SetBorderColor rule. */
export function isSetBorderColorRule(line: Filter.Line): line is Filter.SetBorderColorRule {
  if (isActionRule(line)) {
    return (<Filter.SetBorderColorRule> line).actionName === "SetBorderColor";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a SetTextColor rule. */
export function isSetTextColorRule(line: Filter.Line): line is Filter.SetTextColorRule {
  if (isActionRule(line)) {
    return (<Filter.SetTextColorRule> line).actionName === "SetTextColor";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a SetBackgroundColor rule. */
export function isSetBackgroundColorRule(line: Filter.Line): line is Filter.SetBackgroundColorRule {
  if (isActionRule(line)) {
    return (<Filter.SetBackgroundColorRule> line).actionName === "SetBackgroundColor";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a PlayAlertSound rule. */
export function isPlayAlertSoundRule(line: Filter.Line): line is Filter.PlayAlertSoundRule {
  if (isActionRule(line)) {
    return (<Filter.PlayAlertSoundRule> line).actionName === "PlayAlertSound";
  } else {
    return false;
  }
}

/** Returns whether or not the given line is a SetFontSize rule. */
export function isSetFontSizeRule(line: Filter.Line): line is Filter.SetFontSizeRule {
  if (isActionRule(line)) {
    return (<Filter.SetFontSizeRule> line).actionName === "SetFontSize";
  } else {
    return false;
  }
}
