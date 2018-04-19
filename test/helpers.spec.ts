import * as Helpers from "../src/helpers";
import * as Filter from "../src/item-filter";

const assert = global.assert;

describe("Helpers", () => {
  describe("isTextSuggestion", () => {
    it("returns true when given a text suggestion", () => {
      const textSuggestion = { text: "" };
      assert.isTrue(Helpers.isTextSuggestion(textSuggestion));
    });

    it("returns false when given a snippet suggestion", () => {
      const snippetSuggestion = { snippet: "" };
      assert.isFalse(Helpers.isTextSuggestion(snippetSuggestion));
    });
  });

  describe("isSnippetSuggestion", () => {
    it("returns true when given a snippet suggestion", () => {
      const snippetSuggestion = { snippet: "" };
      assert.isTrue(Helpers.isSnippetSuggestion(snippetSuggestion));
    });

    it("returns false when given a text suggestion", () => {
      const textSuggestion = { text: "" };
      assert.isFalse(Helpers.isSnippetSuggestion(textSuggestion));
    });
  });

  // @ts-ignore
  const block: Filter.Block = { type: "block" };
  // @ts-ignore
  const rule: Filter.Rule = { type: "rule" };
  // @ts-ignore
  const empty: Filter.EmptyLine = { type: "empty" };
  // @ts-ignore
  const lineComment: Filter.CommentedLine = { type: "comment" };
  // @ts-ignore
  const unknown: Filter.UnknownLine = { type: "unknown" };
  // @ts-ignore
  const showBlock: Filter.ShowBlock = { type: "block", ruleType: "show" };
  // @ts-ignore
  const hideBlock: Filter.HideBlock = { type: "block", ruleType: "hide" };
  // @ts-ignore
  const filterRule: Filter.FilterRule = {
    type: "rule", ruleType: "filter",
  };
  // @ts-ignore
  const itemLevelRule: Filter.ItemLevelRule = {
    type: "rule", ruleType: "filter", filterName: "ItemLevel",
  };
  // @ts-ignore
  const dropLevelRule: Filter.DropLevelRule = {
    type: "rule", ruleType: "filter", filterName: "DropLevel",
  };
  // @ts-ignore
  const qualityRule: Filter.QualityRule = {
    type: "rule", ruleType: "filter", filterName: "Quality",
  };
  // @ts-ignore
  const rarityRule: Filter.RarityRule = {
    type: "rule", ruleType: "filter", filterName: "Rarity",
  };
  // @ts-ignore
  const classRule: Filter.ClassRule = {
    type: "rule", ruleType: "filter", filterName: "Class",
  };
  // @ts-ignore
  const baseTypeRule: Filter.BaseTypeRule = {
    type: "rule", ruleType: "filter", filterName: "BaseType",
  };
  // @ts-ignore
  const socketsRule: Filter.SocketsRule = {
    type: "rule", ruleType: "filter", filterName: "Sockets",
  };
  // @ts-ignore
  const linkedSocketsRule: Filter.LinkedSocketsRule = {
    type: "rule", ruleType: "filter", filterName: "LinkedSockets",
  };
  // @ts-ignore
  const socketGroupRule: Filter.SocketGroupRule = {
    type: "rule", ruleType: "filter", filterName: "SocketGroup",
  };
  // @ts-ignore
  const heightRule: Filter.HeightRule = {
    type: "rule", ruleType: "filter", filterName: "Height",
  };
  // @ts-ignore
  const widthRule: Filter.WidthRule = {
    type: "rule", ruleType: "filter", filterName: "Width",
  };
  // @ts-ignore
  const identifiedRule: Filter.IdentifiedRule = {
    type: "rule", ruleType: "filter", filterName: "Identified",
  };
  // @ts-ignore
  const corruptedRule: Filter.CorruptedRule = {
    type: "rule", ruleType: "filter", filterName: "Corrupted",
  };
  // @ts-ignore
  const elderItemRule: Filter.ElderItemRule = {
    type: "rule", ruleType: "filter", filterName: "ElderItem",
  };
  // @ts-ignore
  const shaperItemRule: Filter.ShaperItemRule = {
    type: "rule", ruleType: "filter", filterName: "ShaperItem",
  };
  // @ts-ignore
  const shapedMapRule: Filter.ShapedMapRule = {
    type: "rule", ruleType: "filter", filterName: "ShapedMap",
  };
  // @ts-ignore
  const elderMapRule: Filter.ElderMapRule = {
    type: "rule", ruleType: "filter", filterName: "ElderMap",
  };
  // @ts-ignore
  const actionRule: Filter.ActionRule = {
    type: "rule", ruleType: "action",
  };
  // @ts-ignore
  const setBorderColorRule: Filter.SetBorderColorRule = {
    type: "rule", ruleType: "action", actionName: "SetBorderColor",
  };
  // @ts-ignore
  const setTextColorRule: Filter.SetTextColorRule = {
    type: "rule", ruleType: "action", actionName: "SetTextColor",
  };
  // @ts-ignore
  const setBackgroundColorRule: Filter.SetBackgroundColorRule = {
    type: "rule", ruleType: "action", actionName: "SetBackgroundColor",
  };
  // @ts-ignore
  const playAlertSoundRule: Filter.PlayAlertSoundRule = {
    type: "rule", ruleType: "action", actionName: "PlayAlertSound",
  };
  // @ts-ignore
  const setFontSizeRule: Filter.SetFontSizeRule = {
    type: "rule", ruleType: "action", actionName: "SetFontSize",
  };

  describe("isBlock()", () => {
    it("returns true when given a filter Block", () => {
      assert(Helpers.isBlock(block));
    });

    it("returns false when given any other Filter element", () => {
      assert(!Helpers.isBlock(lineComment));
      assert(!Helpers.isBlock(unknown));
    });
  });

  describe("isShowBlock()", () => {
    it("returns true when given a Show block", () => {
      assert(Helpers.isShowBlock(showBlock));
    });

    it("returns false when give a Hide block", () => {
      assert(!Helpers.isShowBlock(hideBlock));
    });

    it("returns false when given a Block", () => {
      assert(!Helpers.isShowBlock(block));
    });

    it("returns false when given any other filter element", () => {
      assert(!Helpers.isShowBlock(empty));
      assert(!Helpers.isShowBlock(itemLevelRule));
    });
  });

  describe("isHideBlock()", () => {
    it("returns true when given a Hide block", () => {
      assert(Helpers.isHideBlock(hideBlock));
    });

    it("returns false when give a Show block", () => {
      assert(!Helpers.isHideBlock(showBlock));
    });

    it("returns false when given a Block", () => {
      assert(!Helpers.isHideBlock(block));
    });

    it("returns false when given any other filter element", () => {
      assert(!Helpers.isHideBlock(empty));
      assert(!Helpers.isHideBlock(itemLevelRule));
    });
  });

  describe("isRule()", () => {
    it("returns true when given a filter Rule", () => {
      assert(Helpers.isRule(rule));
    });

    it("returns false when given any other filter element", () => {
      assert(!Helpers.isRule(lineComment));
      assert(!Helpers.isRule(unknown));
    });
  });

  describe("isFilterRule()", () => {
    it("returns true when given a Filter rule", () => {
      assert(Helpers.isFilterRule(filterRule));
    });

    it("returns false when give an Action rule", () => {
      assert(!Helpers.isFilterRule(actionRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isFilterRule(rule));
    });

    it("returns false when given any other filter element", () => {
      assert(!Helpers.isFilterRule(empty));
      assert(!Helpers.isFilterRule(setBorderColorRule));
    });
  });

  describe("isItemLevelRule()", () => {
    it("returns true when given an ItemLevel rule", () => {
      assert(Helpers.isItemLevelRule(itemLevelRule));
    });

    it("returns false when given a DropLevel rule", () => {
      assert(!Helpers.isItemLevelRule(dropLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isItemLevelRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isItemLevelRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isItemLevelRule(empty));
      assert(!Helpers.isItemLevelRule(setBorderColorRule));
    });
  });

  describe("isDropLevelRule()", () => {
    it("returns true when given a DropLevel rule", () => {
      assert(Helpers.isDropLevelRule(dropLevelRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isDropLevelRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isDropLevelRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isDropLevelRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isDropLevelRule(empty));
      assert(!Helpers.isDropLevelRule(setBorderColorRule));
    });
  });

  describe("isQualityRule()", () => {
    it("returns true when given a Quality rule", () => {
      assert(Helpers.isQualityRule(qualityRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isQualityRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isQualityRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isQualityRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isQualityRule(empty));
      assert(!Helpers.isQualityRule(setBorderColorRule));
    });
  });

  describe("isRarityRule()", () => {
    it("returns true when given a Rarity rule", () => {
      assert(Helpers.isRarityRule(rarityRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isRarityRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isRarityRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isRarityRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isRarityRule(empty));
      assert(!Helpers.isRarityRule(setBorderColorRule));
    });
  });

  describe("isClassRule()", () => {
    it("returns true when given an Class rule", () => {
      assert(Helpers.isClassRule(classRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isClassRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isClassRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isClassRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isClassRule(empty));
      assert(!Helpers.isClassRule(setBorderColorRule));
    });
  });

  describe("isBaseTypeRule()", () => {
    it("returns true when given an BaseType rule", () => {
      assert(Helpers.isBaseTypeRule(baseTypeRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isBaseTypeRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isBaseTypeRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isBaseTypeRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isBaseTypeRule(empty));
      assert(!Helpers.isBaseTypeRule(setBorderColorRule));
    });
  });

  describe("isSocketsRule()", () => {
    it("returns true when given a Sockets rule", () => {
      assert(Helpers.isSocketsRule(socketsRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isSocketsRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isSocketsRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isSocketsRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isSocketsRule(empty));
      assert(!Helpers.isSocketsRule(setBorderColorRule));
    });
  });

  describe("isLinkedSocketsRule()", () => {
    it("returns true when given a LinkedSockets rule", () => {
      assert(Helpers.isLinkedSocketsRule(linkedSocketsRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isLinkedSocketsRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isLinkedSocketsRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isLinkedSocketsRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isLinkedSocketsRule(empty));
      assert(!Helpers.isLinkedSocketsRule(setBorderColorRule));
    });
  });

  describe("isSocketGroupRule()", () => {
    it("returns true when given a SocketGroup rule", () => {
      assert(Helpers.isSocketGroupRule(socketGroupRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isSocketGroupRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isSocketGroupRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isSocketGroupRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isSocketGroupRule(empty));
      assert(!Helpers.isSocketGroupRule(setBorderColorRule));
    });
  });

  describe("isHeightRule()", () => {
    it("returns true when given a Height rule", () => {
      assert(Helpers.isHeightRule(heightRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isHeightRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isHeightRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isHeightRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isHeightRule(empty));
      assert(!Helpers.isHeightRule(setBorderColorRule));
    });
  });

  describe("isWidthRule()", () => {
    it("returns true when given a Width rule", () => {
      assert(Helpers.isWidthRule(widthRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isWidthRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isWidthRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isWidthRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isWidthRule(empty));
      assert(!Helpers.isWidthRule(setBorderColorRule));
    });
  });

  describe("isIdentifiedRule()", () => {
    it("returns true when given an Identified rule", () => {
      assert(Helpers.isIdentifiedRule(identifiedRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isIdentifiedRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isIdentifiedRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isIdentifiedRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isIdentifiedRule(empty));
      assert(!Helpers.isIdentifiedRule(setBorderColorRule));
    });
  });

  describe("isCorruptedRule()", () => {
    it("returns true when given a Corrupted rule", () => {
      assert(Helpers.isCorruptedRule(corruptedRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isCorruptedRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isCorruptedRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isCorruptedRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isCorruptedRule(empty));
      assert(!Helpers.isCorruptedRule(setBorderColorRule));
    });
  });

  describe("isElderItemRule()", () => {
    it("returns true when given a ElderItem rule", () => {
      assert(Helpers.isElderItemRule(elderItemRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isElderItemRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isElderItemRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isElderItemRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isElderItemRule(empty));
      assert(!Helpers.isElderItemRule(setBorderColorRule));
    });
  });

  describe("isShaperItemRule()", () => {
    it("returns true when given a ShaperItem rule", () => {
      assert(Helpers.isShaperItemRule(shaperItemRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isShaperItemRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isShaperItemRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isShaperItemRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isShaperItemRule(empty));
      assert(!Helpers.isShaperItemRule(setBorderColorRule));
    });
  });

  describe("isShapedMapRule()", () => {
    it("returns true when given a ShapedMap rule", () => {
      assert(Helpers.isShapedMapRule(shapedMapRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isShapedMapRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isShapedMapRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isShapedMapRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isShapedMapRule(empty));
      assert(!Helpers.isShapedMapRule(setBorderColorRule));
    });
  });

  describe("isElderMapRule()", () => {
    it("returns true when given a ElderMap rule", () => {
      assert(Helpers.isElderMapRule(elderMapRule));
    });

    it("returns false when given an ItemLevel rule", () => {
      assert(!Helpers.isElderMapRule(itemLevelRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isElderMapRule(rule));
    });

    it("returns false when given a Filter rule", () => {
      assert(!Helpers.isElderMapRule(filterRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isElderMapRule(empty));
      assert(!Helpers.isElderMapRule(setBorderColorRule));
    });
  });

  describe("isActionRule()", () => {
    it("returns true when given an Action rule", () => {
      assert(Helpers.isActionRule(actionRule));
    });

    it("returns false when give a Filter rule", () => {
      assert(!Helpers.isActionRule(filterRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isActionRule(rule));
    });

    it("returns false when given any other filter element", () => {
      assert(!Helpers.isActionRule(empty));
      assert(!Helpers.isActionRule(itemLevelRule));
    });
  });

  describe("isSetBorderColorRule()", () => {
    it("returns true when given a SetBorderColor rule", () => {
      assert(Helpers.isSetBorderColorRule(setBorderColorRule));
    });

    it("returns false when given a SetTextColor rule", () => {
      assert(!Helpers.isSetBorderColorRule(setTextColorRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isSetBorderColorRule(rule));
    });

    it("returns false when given an Action rule", () => {
      assert(!Helpers.isSetBorderColorRule(actionRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isSetBorderColorRule(empty));
      assert(!Helpers.isSetBorderColorRule(itemLevelRule));
    });
  });

  describe("isSetTextColorRule()", () => {
    it("returns true when given a SetBorderColor rule", () => {
      assert(Helpers.isSetTextColorRule(setTextColorRule));
    });

    it("returns false when given a SetBorderColor rule", () => {
      assert(!Helpers.isSetTextColorRule(setBorderColorRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isSetTextColorRule(rule));
    });

    it("returns false when given an Action rule", () => {
      assert(!Helpers.isSetTextColorRule(actionRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isSetTextColorRule(empty));
      assert(!Helpers.isSetTextColorRule(itemLevelRule));
    });
  });

  describe("isSetBackgroundColorRule()", () => {
    it("returns true when given a SetBackgroundColor rule", () => {
      assert(Helpers.isSetBackgroundColorRule(setBackgroundColorRule));
    });

    it("returns false when given a SetBorderColor rule", () => {
      assert(!Helpers.isSetBackgroundColorRule(setBorderColorRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isSetBackgroundColorRule(rule));
    });

    it("returns false when given an Action rule", () => {
      assert(!Helpers.isSetBackgroundColorRule(actionRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isSetBackgroundColorRule(empty));
      assert(!Helpers.isSetBackgroundColorRule(itemLevelRule));
    });
  });

  describe("isPlayAlertSoundRule()", () => {
    it("returns true when given a PlayAlertSound rule", () => {
      assert(Helpers.isPlayAlertSoundRule(playAlertSoundRule));
    });

    it("returns false when given a SetBorderColor rule", () => {
      assert(!Helpers.isPlayAlertSoundRule(setBorderColorRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isPlayAlertSoundRule(rule));
    });

    it("returns false when given an Action rule", () => {
      assert(!Helpers.isPlayAlertSoundRule(actionRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isPlayAlertSoundRule(empty));
      assert(!Helpers.isPlayAlertSoundRule(itemLevelRule));
    });
  });

  describe("isSetFontSizeRule()", () => {
    it("returns true when given a FontSizeRule rule", () => {
      assert(Helpers.isSetFontSizeRule(setFontSizeRule));
    });

    it("returns false when given a SetBorderColor rule", () => {
      assert(!Helpers.isSetFontSizeRule(setBorderColorRule));
    });

    it("returns false when given a Rule", () => {
      assert(!Helpers.isSetFontSizeRule(rule));
    });

    it("returns false when given an Action rule", () => {
      assert(!Helpers.isSetFontSizeRule(actionRule));
    });

    it("return false when given any other filter element", () => {
      assert(!Helpers.isSetFontSizeRule(empty));
      assert(!Helpers.isSetFontSizeRule(itemLevelRule));
    });
  });

  describe("isEmpty()", () => {
    it("returns true when given a filter Rule", () => {
      assert(Helpers.isEmpty(empty));
    });

    it("returns false when given any other filter element", () => {
      assert(!Helpers.isEmpty(lineComment));
      assert(!Helpers.isEmpty(unknown));
    });
  });

  describe("isLineComment()", () => {
    it("returns true when given a filter Rule", () => {
      assert(Helpers.isLineComment(lineComment));
    });

    it("returns false when given any other filter element", () => {
      assert(!Helpers.isLineComment(empty));
      assert(!Helpers.isLineComment(unknown));
    });
  });

  describe("isUnknown()", () => {
    it("returns true when given a filter Rule", () => {
      assert(Helpers.isUnknown(unknown));
    });

    it("returns false when given any other filter element", () => {
      assert(!Helpers.isUnknown(empty));
      assert(!Helpers.isUnknown(rule));
    });
  });
});
