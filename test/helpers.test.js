import * as Helpers from '../lib/helpers'

describe("Guards", function() {
  describe("FilterElements", function() {
    const block = { type: "block" }
    const rule = { type: "rule" }
    const empty = { type: "empty" }
    const lineComment = { type: "comment" }
    const unknown = { type: "unknown" }
    const isBlock = Helpers.Guards.isBlock
    const isRule = Helpers.Guards.isRule
    const isEmpty = Helpers.Guards.isEmpty
    const isLineComment = Helpers.Guards.isLineComment
    const isUnknown = Helpers.Guards.isUnknown

    const showBlock = { type: "block", ruleType: "show" }
    const hideBlock = { type: "block", ruleType: "hide" }
    const isShowBlock = Helpers.Guards.isShowBlock
    const isHideBlock = Helpers.Guards.isHideBlock

    const filterRule = { type: "rule", ruleType: "filter" }
    const itemLevelRule = { type: "rule", ruleType: "filter", filterName: "ItemLevel" }
    const dropLevelRule = { type: "rule", ruleType: "filter", filterName: "DropLevel" }
    const qualityRule = { type: "rule", ruleType: "filter", filterName: "Quality" }
    const rarityRule = { type: "rule", ruleType: "filter", filterName: "Rarity" }
    const classRule = { type: "rule", ruleType: "filter", filterName: "Class" }
    const baseTypeRule = { type: "rule", ruleType: "filter", filterName: "BaseType" }
    const socketsRule = { type: "rule", ruleType: "filter", filterName: "Sockets" }
    const linkedSocketsRule = { type: "rule", ruleType: "filter", filterName: "LinkedSockets" }
    const socketGroupRule = { type: "rule", ruleType: "filter", filterName: "SocketGroup" }
    const heightRule = { type: "rule", ruleType: "filter", filterName: "Height" }
    const widthRule = { type: "rule", ruleType: "filter", filterName: "Width" }
    const identifiedRule = { type: "rule", ruleType: "filter", filterName: "Identified" }
    const corruptedRule = { type: "rule", ruleType: "filter", filterName: "Corrupted" }
    const isFilterRule = Helpers.Guards.isFilterRule
    const isItemLevelRule = Helpers.Guards.isItemLevelRule
    const isDropLevelRule = Helpers.Guards.isDropLevelRule
    const isQualityRule = Helpers.Guards.isQualityRule
    const isRarityRule = Helpers.Guards.isRarityRule
    const isClassRule = Helpers.Guards.isClassRule
    const isBaseTypeRule = Helpers.Guards.isBaseTypeRule
    const isSocketsRule = Helpers.Guards.isSocketsRule
    const isLinkedSocketsRule = Helpers.Guards.isLinkedSocketsRule
    const isSocketGroupRule = Helpers.Guards.isSocketGroupRule
    const isHeightRule = Helpers.Guards.isHeightRule
    const isWidthRule = Helpers.Guards.isWidthRule
    const isIdentifiedRule = Helpers.Guards.isIdentifiedRule
    const isCorruptedRule = Helpers.Guards.isCorruptedRule

    const actionRule = { type: "rule", ruleType: "action" }
    const setBorderColorRule = { type: "rule", ruleType: "action", actionName: "SetBorderColor" }
		const setTextColorRule = { type: "rule", ruleType: "action", actionName: "SetTextColor" }
		const setBackgroundColorRule = { type: "rule", ruleType: "action", actionName: "SetBackgroundColor" }
		const playAlertSoundRule = { type: "rule", ruleType: "action", actionName: "PlayAlertSound" }
		const setFontSizeRule = { type: "rule", ruleType: "action", actionName: "SetFontSize" }
    const isActionRule = Helpers.Guards.isActionRule
    const isSetBorderColorRule = Helpers.Guards.isSetBorderColorRule
    const isSetTextColorRule = Helpers.Guards.isSetTextColorRule
    const isSetBackgroundColorRule = Helpers.Guards.isSetBackgroundColorRule
    const isPlayAlertSoundRule = Helpers.Guards.isPlayAlertSoundRule
    const isSetFontSizeRule = Helpers.Guards.isSetFontSizeRule

    describe("isBlock()", function() {
      it("returns true when given a filter Block", function() {
        assert(isBlock(block));
      })

      it("returns false when given any other Filter element", function() {
        assert(isBlock(lineComment) === false);
        assert(isBlock(unknown) === false);
      })
    })

    describe("isShowBlock()", function() {
      it("returns true when given a Show block", function() {
        assert(isShowBlock(showBlock));
      })

      it("returns false when give a Hide block", function() {
        assert(isShowBlock(hideBlock) === false);
      })

      it("returns false when given a Block", function() {
        assert(isShowBlock(block) === false);
      })

      it("returns false when given any other filter element", function() {
        assert(isShowBlock(empty) === false);
        assert(isShowBlock(itemLevelRule) === false);
      })
    })

    describe("isHideBlock()", function() {
      it("returns true when given a Hide block", function() {
        assert(isHideBlock(hideBlock));
      })

      it("returns false when give a Show block", function() {
        assert(isHideBlock(showBlock) === false);
      })

      it("returns false when given a Block", function() {
        assert(isHideBlock(block) === false);
      })

      it("returns false when given any other filter element", function() {
        assert(isHideBlock(empty) === false);
        assert(isHideBlock(itemLevelRule) === false);
      })
    })

    describe("isRule()", function() {
      it("returns true when given a filter Rule", function() {
        assert(isRule(rule));
      })

      it("returns false when given any other filter element", function() {
        assert(isRule(lineComment) === false);
        assert(isRule(unknown) === false);
      })
    })

    describe("isFilterRule()", function() {
      it("returns true when given a Filter rule", function() {
        assert(isFilterRule(filterRule));
      })

      it("returns false when give an Action rule", function() {
        assert(isFilterRule(actionRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isFilterRule(rule) === false);
      })

      it("returns false when given any other filter element", function() {
        assert(isFilterRule(empty) === false);
        assert(isFilterRule(setBorderColorRule) === false);
      })
    })

    describe("isItemLevelRule()", function() {
      it("returns true when given an ItemLevel rule", function() {
        assert(isItemLevelRule(itemLevelRule));
      })

      it("returns false when given a DropLevel rule", function() {
        assert(isItemLevelRule(dropLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isItemLevelRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isItemLevelRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isItemLevelRule(empty) === false);
        assert(isItemLevelRule(setBorderColorRule) === false);
      })
    })

		describe("isDropLevelRule()", function() {
      it("returns true when given a DropLevel rule", function() {
        assert(isDropLevelRule(dropLevelRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isDropLevelRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isDropLevelRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isDropLevelRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isDropLevelRule(empty) === false);
        assert(isDropLevelRule(setBorderColorRule) === false);
      })
    })

		describe("isQualityRule()", function() {
      it("returns true when given a Quality rule", function() {
        assert(isQualityRule(qualityRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isQualityRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isQualityRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isQualityRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isQualityRule(empty) === false);
        assert(isQualityRule(setBorderColorRule) === false);
      })
    })

		describe("isRarityRule()", function() {
      it("returns true when given a Rarity rule", function() {
        assert(isRarityRule(rarityRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isRarityRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isRarityRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isRarityRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isRarityRule(empty) === false);
        assert(isRarityRule(setBorderColorRule) === false);
      })
    })

		describe("isClassRule()", function() {
      it("returns true when given an Class rule", function() {
        assert(isClassRule(classRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isClassRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isClassRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isClassRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isClassRule(empty) === false);
        assert(isClassRule(setBorderColorRule) === false);
      })
    })

		describe("isBaseTypeRule()", function() {
      it("returns true when given an BaseType rule", function() {
        assert(isBaseTypeRule(baseTypeRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isBaseTypeRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isBaseTypeRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isBaseTypeRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isBaseTypeRule(empty) === false);
        assert(isBaseTypeRule(setBorderColorRule) === false);
      })
    })

		describe("isSocketsRule()", function() {
      it("returns true when given a Sockets rule", function() {
        assert(isSocketsRule(socketsRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isSocketsRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isSocketsRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isSocketsRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isSocketsRule(empty) === false);
        assert(isSocketsRule(setBorderColorRule) === false);
      })
    })

		describe("isLinkedSocketsRule()", function() {
      it("returns true when given a LinkedSockets rule", function() {
        assert(isLinkedSocketsRule(linkedSocketsRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isLinkedSocketsRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isLinkedSocketsRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isLinkedSocketsRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isLinkedSocketsRule(empty) === false);
        assert(isLinkedSocketsRule(setBorderColorRule) === false);
      })
    })

		describe("isSocketGroupRule()", function() {
      it("returns true when given a SocketGroup rule", function() {
        assert(isSocketGroupRule(socketGroupRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isSocketGroupRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isSocketGroupRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isSocketGroupRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isSocketGroupRule(empty) === false);
        assert(isSocketGroupRule(setBorderColorRule) === false);
      })
    })

		describe("isHeightRule()", function() {
      it("returns true when given a Height rule", function() {
        assert(isHeightRule(heightRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isHeightRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isHeightRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isHeightRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isHeightRule(empty) === false);
        assert(isHeightRule(setBorderColorRule) === false);
      })
    })

		describe("isWidthRule()", function() {
      it("returns true when given a Width rule", function() {
        assert(isWidthRule(widthRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isWidthRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isWidthRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isWidthRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isWidthRule(empty) === false);
        assert(isWidthRule(setBorderColorRule) === false);
      })
    })

		describe("isIdentifiedRule()", function() {
      it("returns true when given an Identified rule", function() {
        assert(isIdentifiedRule(identifiedRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isIdentifiedRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isIdentifiedRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isIdentifiedRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isIdentifiedRule(empty) === false);
        assert(isIdentifiedRule(setBorderColorRule) === false);
      })
    })

		describe("isCorruptedRule()", function() {
      it("returns true when given a Corrupted rule", function() {
        assert(isCorruptedRule(corruptedRule));
      })

      it("returns false when given an ItemLevel rule", function() {
        assert(isCorruptedRule(itemLevelRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isCorruptedRule(rule) === false);
      })

      it("returns false when given a Filter rule", function() {
        assert(isCorruptedRule(filterRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isCorruptedRule(empty) === false);
        assert(isCorruptedRule(setBorderColorRule) === false);
      })
    })

    describe("isActionRule()", function() {
      it("returns true when given an Action rule", function() {
        assert(Helpers.Guards.isActionRule(actionRule));
      })

      it("returns false when give a Filter rule", function() {
        assert(Helpers.Guards.isActionRule(filterRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(Helpers.Guards.isActionRule(rule) === false);
      })

      it("returns false when given any other filter element", function() {
        assert(Helpers.Guards.isActionRule(empty) === false);
        assert(Helpers.Guards.isActionRule(itemLevelRule) === false);
      })
    })

    describe("isSetBorderColorRule()", function() {
      it("returns true when given a SetBorderColor rule", function() {
        assert(isSetBorderColorRule(setBorderColorRule));
      })

      it("returns false when given a SetTextColor rule", function() {
        assert(isSetBorderColorRule(setTextColorRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isSetBorderColorRule(rule) === false);
      })

      it("returns false when given an Action rule", function() {
        assert(isSetBorderColorRule(actionRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isSetBorderColorRule(empty) === false);
        assert(isSetBorderColorRule(itemLevelRule) === false);
      })
    })

    describe("isSetTextColorRule()", function() {
      it("returns true when given a SetBorderColor rule", function() {
        assert(isSetTextColorRule(setTextColorRule));
      })

      it("returns false when given a SetBorderColor rule", function() {
        assert(isSetTextColorRule(setBorderColorRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isSetTextColorRule(rule) === false);
      })

      it("returns false when given an Action rule", function() {
        assert(isSetTextColorRule(actionRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isSetTextColorRule(empty) === false);
        assert(isSetTextColorRule(itemLevelRule) === false);
      })
    })

    describe("isSetBackgroundColorRule()", function() {
      it("returns true when given a SetBackgroundColor rule", function() {
        assert(isSetBackgroundColorRule(setBackgroundColorRule));
      })

      it("returns false when given a SetBorderColor rule", function() {
        assert(isSetBackgroundColorRule(setBorderColorRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isSetBackgroundColorRule(rule) === false);
      })

      it("returns false when given an Action rule", function() {
        assert(isSetBackgroundColorRule(actionRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isSetBackgroundColorRule(empty) === false);
        assert(isSetBackgroundColorRule(itemLevelRule) === false);
      })
    })

    describe("isPlayAlertSoundRule()", function() {
      it("returns true when given a PlayAlertSound rule", function() {
        assert(isPlayAlertSoundRule(playAlertSoundRule));
      })

      it("returns false when given a SetBorderColor rule", function() {
        assert(isPlayAlertSoundRule(setBorderColorRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isPlayAlertSoundRule(rule) === false);
      })

      it("returns false when given an Action rule", function() {
        assert(isPlayAlertSoundRule(actionRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isPlayAlertSoundRule(empty) === false);
        assert(isPlayAlertSoundRule(itemLevelRule) === false);
      })
    })

    describe("isSetFontSizeRule()", function() {
      it("returns true when given a FontSizeRule rule", function() {
        assert(isSetFontSizeRule(setFontSizeRule));
      })

      it("returns false when given a SetBorderColor rule", function() {
        assert(isSetFontSizeRule(setBorderColorRule) === false);
      })

      it("returns false when given a Rule", function() {
        assert(isSetFontSizeRule(rule) === false);
      })

      it("returns false when given an Action rule", function() {
        assert(isSetFontSizeRule(actionRule) === false);
      })

      it("return false when given any other filter element", function() {
        assert(isSetFontSizeRule(empty) === false);
        assert(isSetFontSizeRule(itemLevelRule) === false);
      })
    })

    describe("isEmpty()", function() {
      it("returns true when given a filter Rule", function() {
        assert(Helpers.Guards.isEmpty(empty));
      })

      it("returns false when given any other filter element", function() {
        assert(Helpers.Guards.isEmpty(lineComment) === false);
        assert(Helpers.Guards.isEmpty(unknown) === false);
      })
    })

    describe("isLineComment()", function() {
      it("returns true when given a filter Rule", function() {
        assert(Helpers.Guards.isLineComment(lineComment));
      })

      it("returns false when given any other filter element", function() {
        assert(Helpers.Guards.isLineComment(empty) === false);
        assert(Helpers.Guards.isLineComment(unknown) === false);
      })
    })

    describe("isUnknown()", function() {
      it("returns true when given a filter Rule", function() {
        assert(Helpers.Guards.isUnknown(unknown));
      })

      it("returns false when given any other filter element", function() {
        assert(Helpers.Guards.isUnknown(empty) === false);
        assert(Helpers.Guards.isUnknown(rule) === false);
      })
    })
  })

  describe("isTextSuggestion", function() {
    it("returns true when given a text suggestion", function() {
      let textSuggestion = { text: "" }
      assert(Helpers.Guards.isTextSuggestion(textSuggestion));
    })

    it("returns false when given a snippet suggestion", function() {
      let snippetSuggestion = { snippet: "" }
      assert(Helpers.Guards.isTextSuggestion(snippetSuggestion) === false);
    })
  })

  describe("isSnippetSuggestion", function() {
    it("returns true when given a snippet suggestion", function() {
      let snippetSuggestion = { snippet: "" }
      assert(Helpers.Guards.isSnippetSuggestion(snippetSuggestion));
    })

    it("returns false when given a text suggestion", function() {
      let textSuggestion = { text: "" }
      assert(Helpers.Guards.isSnippetSuggestion(textSuggestion) === false);
    })
  })
})
