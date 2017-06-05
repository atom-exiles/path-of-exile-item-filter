/** @babel */

import * as Helpers from '../dist/helpers'

describe("Guards", function() {
  describe("FilterElements", function() {
    const block = { type: "block" }
    const rule = { type: "rule" }
    const empty = { type: "empty" }
    const lineComment = { type: "comment" }
    const unknown = { type: "unknown" }
    const isBlock = Helpers.Guards.FilterElements.isBlock
    const isRule = Helpers.Guards.FilterElements.isRule
    const isEmpty = Helpers.Guards.FilterElements.isEmpty
    const isLineComment = Helpers.Guards.FilterElements.isLineComment
    const isUnknown = Helpers.Guards.FilterElements.isUnknown

    const showBlock = { type: "block", ruleType: "show" }
    const hideBlock = { type: "block", ruleType: "hide" }
    const isShowBlock = Helpers.Guards.FilterElements.isShowBlock
    const isHideBlock = Helpers.Guards.FilterElements.isHideBlock

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
    const isFilterRule = Helpers.Guards.FilterElements.isFilterRule
    const isItemLevelRule = Helpers.Guards.FilterElements.isItemLevelRule
    const isDropLevelRule = Helpers.Guards.FilterElements.isDropLevelRule
    const isQualityRule = Helpers.Guards.FilterElements.isQualityRule
    const isRarityRule = Helpers.Guards.FilterElements.isRarityRule
    const isClassRule = Helpers.Guards.FilterElements.isClassRule
    const isBaseTypeRule = Helpers.Guards.FilterElements.isBaseTypeRule
    const isSocketsRule = Helpers.Guards.FilterElements.isSocketsRule
    const isLinkedSocketsRule = Helpers.Guards.FilterElements.isLinkedSocketsRule
    const isSocketGroupRule = Helpers.Guards.FilterElements.isSocketGroupRule
    const isHeightRule = Helpers.Guards.FilterElements.isHeightRule
    const isWidthRule = Helpers.Guards.FilterElements.isWidthRule
    const isIdentifiedRule = Helpers.Guards.FilterElements.isIdentifiedRule
    const isCorruptedRule = Helpers.Guards.FilterElements.isCorruptedRule

    const actionRule = { type: "rule", ruleType: "action" }
    const setBorderColorRule = { type: "rule", ruleType: "action", actionName: "SetBorderColor" }
		const setTextColorRule = { type: "rule", ruleType: "action", actionName: "SetTextColor" }
		const setBackgroundColorRule = { type: "rule", ruleType: "action", actionName: "SetBackgroundColor" }
		const playAlertSoundRule = { type: "rule", ruleType: "action", actionName: "PlayAlertSound" }
		const setFontSizeRule = { type: "rule", ruleType: "action", actionName: "SetFontSize" }
    const isActionRule = Helpers.Guards.FilterElements.isActionRule
    const isSetBorderColorRule = Helpers.Guards.FilterElements.isSetBorderColorRule
    const isSetTextColorRule = Helpers.Guards.FilterElements.isSetTextColorRule
    const isSetBackgroundColorRule = Helpers.Guards.FilterElements.isSetBackgroundColorRule
    const isPlayAlertSoundRule = Helpers.Guards.FilterElements.isPlayAlertSoundRule
    const isSetFontSizeRule = Helpers.Guards.FilterElements.isSetFontSizeRule

    describe("isBlock()", function() {
      it("returns true when given a filter Block", function() {
        expect(isBlock(block)).toBe(true)
      })

      it("returns false when given any other Filter element", function() {
        expect(isBlock(lineComment)).toBe(false)
        expect(isBlock(unknown)).toBe(false)
      })
    })

    describe("isShowBlock()", function() {
      it("returns true when given a Show block", function() {
        expect(isShowBlock(showBlock)).toBe(true)
      })

      it("returns false when give a Hide block", function() {
        expect(isShowBlock(hideBlock)).toBe(false)
      })

      it("returns false when given a Block", function() {
        expect(isShowBlock(block)).toBe(false)
      })

      it("returns false when given any other filter element", function() {
        expect(isShowBlock(empty)).toBe(false)
        expect(isShowBlock(itemLevelRule)).toBe(false)
      })
    })

    describe("isHideBlock()", function() {
      it("returns true when given a Hide block", function() {
        expect(isHideBlock(hideBlock)).toBe(true)
      })

      it("returns false when give a Show block", function() {
        expect(isHideBlock(showBlock)).toBe(false)
      })

      it("returns false when given a Block", function() {
        expect(isHideBlock(block)).toBe(false)
      })

      it("returns false when given any other filter element", function() {
        expect(isHideBlock(empty)).toBe(false)
        expect(isHideBlock(itemLevelRule)).toBe(false)
      })
    })

    describe("isRule()", function() {
      it("returns true when given a filter Rule", function() {
        expect(isRule(rule)).toBe(true)
      })

      it("returns false when given any other filter element", function() {
        expect(isRule(lineComment)).toBe(false)
        expect(isRule(unknown)).toBe(false)
      })
    })

    describe("isFilterRule()", function() {
      it("returns true when given a Filter rule", function() {
        expect(isFilterRule(filterRule)).toBe(true)
      })

      it("returns false when give an Action rule", function() {
        expect(isFilterRule(actionRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isFilterRule(rule)).toBe(false)
      })

      it("returns false when given any other filter element", function() {
        expect(isFilterRule(empty)).toBe(false)
        expect(isFilterRule(setBorderColorRule)).toBe(false)
      })
    })

    describe("isItemLevelRule()", function() {
      it("returns true when given an ItemLevel rule", function() {
        expect(isItemLevelRule(itemLevelRule)).toBe(true)
      })

      it("returns false when given a DropLevel rule", function() {
        expect(isItemLevelRule(dropLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isItemLevelRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isItemLevelRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isItemLevelRule(empty)).toBe(false)
        expect(isItemLevelRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isDropLevelRule()", function() {
      it("returns true when given a DropLevel rule", function() {
        expect(isDropLevelRule(dropLevelRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isDropLevelRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isDropLevelRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isDropLevelRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isDropLevelRule(empty)).toBe(false)
        expect(isDropLevelRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isQualityRule()", function() {
      it("returns true when given a Quality rule", function() {
        expect(isQualityRule(qualityRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isQualityRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isQualityRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isQualityRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isQualityRule(empty)).toBe(false)
        expect(isQualityRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isRarityRule()", function() {
      it("returns true when given a Rarity rule", function() {
        expect(isRarityRule(rarityRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isRarityRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isRarityRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isRarityRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isRarityRule(empty)).toBe(false)
        expect(isRarityRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isClassRule()", function() {
      it("returns true when given an Class rule", function() {
        expect(isClassRule(classRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isClassRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isClassRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isClassRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isClassRule(empty)).toBe(false)
        expect(isClassRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isBaseTypeRule()", function() {
      it("returns true when given an BaseType rule", function() {
        expect(isBaseTypeRule(baseTypeRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isBaseTypeRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isBaseTypeRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isBaseTypeRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isBaseTypeRule(empty)).toBe(false)
        expect(isBaseTypeRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isSocketsRule()", function() {
      it("returns true when given a Sockets rule", function() {
        expect(isSocketsRule(socketsRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isSocketsRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isSocketsRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isSocketsRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isSocketsRule(empty)).toBe(false)
        expect(isSocketsRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isLinkedSocketsRule()", function() {
      it("returns true when given a LinkedSockets rule", function() {
        expect(isLinkedSocketsRule(linkedSocketsRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isLinkedSocketsRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isLinkedSocketsRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isLinkedSocketsRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isLinkedSocketsRule(empty)).toBe(false)
        expect(isLinkedSocketsRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isSocketGroupRule()", function() {
      it("returns true when given a SocketGroup rule", function() {
        expect(isSocketGroupRule(socketGroupRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isSocketGroupRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isSocketGroupRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isSocketGroupRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isSocketGroupRule(empty)).toBe(false)
        expect(isSocketGroupRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isHeightRule()", function() {
      it("returns true when given a Height rule", function() {
        expect(isHeightRule(heightRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isHeightRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isHeightRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isHeightRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isHeightRule(empty)).toBe(false)
        expect(isHeightRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isWidthRule()", function() {
      it("returns true when given a Width rule", function() {
        expect(isWidthRule(widthRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isWidthRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isWidthRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isWidthRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isWidthRule(empty)).toBe(false)
        expect(isWidthRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isIdentifiedRule()", function() {
      it("returns true when given an Identified rule", function() {
        expect(isIdentifiedRule(identifiedRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isIdentifiedRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isIdentifiedRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isIdentifiedRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isIdentifiedRule(empty)).toBe(false)
        expect(isIdentifiedRule(setBorderColorRule)).toBe(false)
      })
    })

		describe("isCorruptedRule()", function() {
      it("returns true when given a Corrupted rule", function() {
        expect(isCorruptedRule(corruptedRule)).toBe(true)
      })

      it("returns false when given an ItemLevel rule", function() {
        expect(isCorruptedRule(itemLevelRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isCorruptedRule(rule)).toBe(false)
      })

      it("returns false when given a Filter rule", function() {
        expect(isCorruptedRule(filterRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isCorruptedRule(empty)).toBe(false)
        expect(isCorruptedRule(setBorderColorRule)).toBe(false)
      })
    })

    describe("isActionRule()", function() {
      it("returns true when given an Action rule", function() {
        expect(Helpers.Guards.FilterElements.isActionRule(actionRule)).toBe(true)
      })

      it("returns false when give a Filter rule", function() {
        expect(Helpers.Guards.FilterElements.isActionRule(filterRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(Helpers.Guards.FilterElements.isActionRule(rule)).toBe(false)
      })

      it("returns false when given any other filter element", function() {
        expect(Helpers.Guards.FilterElements.isActionRule(empty)).toBe(false)
        expect(Helpers.Guards.FilterElements.isActionRule(itemLevelRule)).toBe(false)
      })
    })

    describe("isSetBorderColorRule()", function() {
      it("returns true when given a SetBorderColor rule", function() {
        expect(isSetBorderColorRule(setBorderColorRule)).toBe(true)
      })

      it("returns false when given a SetTextColor rule", function() {
        expect(isSetBorderColorRule(setTextColorRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isSetBorderColorRule(rule)).toBe(false)
      })

      it("returns false when given an Action rule", function() {
        expect(isSetBorderColorRule(actionRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isSetBorderColorRule(empty)).toBe(false)
        expect(isSetBorderColorRule(itemLevelRule)).toBe(false)
      })
    })

    describe("isSetTextColorRule()", function() {
      it("returns true when given a SetBorderColor rule", function() {
        expect(isSetTextColorRule(setTextColorRule)).toBe(true)
      })

      it("returns false when given a SetBorderColor rule", function() {
        expect(isSetTextColorRule(setBorderColorRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isSetTextColorRule(rule)).toBe(false)
      })

      it("returns false when given an Action rule", function() {
        expect(isSetTextColorRule(actionRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isSetTextColorRule(empty)).toBe(false)
        expect(isSetTextColorRule(itemLevelRule)).toBe(false)
      })
    })

    describe("isSetBackgroundColorRule()", function() {
      it("returns true when given a SetBackgroundColor rule", function() {
        expect(isSetBackgroundColorRule(setBackgroundColorRule)).toBe(true)
      })

      it("returns false when given a SetBorderColor rule", function() {
        expect(isSetBackgroundColorRule(setBorderColorRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isSetBackgroundColorRule(rule)).toBe(false)
      })

      it("returns false when given an Action rule", function() {
        expect(isSetBackgroundColorRule(actionRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isSetBackgroundColorRule(empty)).toBe(false)
        expect(isSetBackgroundColorRule(itemLevelRule)).toBe(false)
      })
    })

    describe("isPlayAlertSoundRule()", function() {
      it("returns true when given a PlayAlertSound rule", function() {
        expect(isPlayAlertSoundRule(playAlertSoundRule)).toBe(true)
      })

      it("returns false when given a SetBorderColor rule", function() {
        expect(isPlayAlertSoundRule(setBorderColorRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isPlayAlertSoundRule(rule)).toBe(false)
      })

      it("returns false when given an Action rule", function() {
        expect(isPlayAlertSoundRule(actionRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isPlayAlertSoundRule(empty)).toBe(false)
        expect(isPlayAlertSoundRule(itemLevelRule)).toBe(false)
      })
    })

    describe("isSetFontSizeRule()", function() {
      it("returns true when given a FontSizeRule rule", function() {
        expect(isSetFontSizeRule(setFontSizeRule)).toBe(true)
      })

      it("returns false when given a SetBorderColor rule", function() {
        expect(isSetFontSizeRule(setBorderColorRule)).toBe(false)
      })

      it("returns false when given a Rule", function() {
        expect(isSetFontSizeRule(rule)).toBe(false)
      })

      it("returns false when given an Action rule", function() {
        expect(isSetFontSizeRule(actionRule)).toBe(false)
      })

      it("return false when given any other filter element", function() {
        expect(isSetFontSizeRule(empty)).toBe(false)
        expect(isSetFontSizeRule(itemLevelRule)).toBe(false)
      })
    })

    describe("isEmpty()", function() {
      it("returns true when given a filter Rule", function() {
        expect(Helpers.Guards.FilterElements.isEmpty(empty)).toBe(true)
      })

      it("returns false when given any other filter element", function() {
        expect(Helpers.Guards.FilterElements.isEmpty(lineComment)).toBe(false)
        expect(Helpers.Guards.FilterElements.isEmpty(unknown)).toBe(false)
      })
    })

    describe("isLineComment()", function() {
      it("returns true when given a filter Rule", function() {
        expect(Helpers.Guards.FilterElements.isLineComment(lineComment)).toBe(true)
      })

      it("returns false when given any other filter element", function() {
        expect(Helpers.Guards.FilterElements.isLineComment(empty)).toBe(false)
        expect(Helpers.Guards.FilterElements.isLineComment(unknown)).toBe(false)
      })
    })

    describe("isUnknown()", function() {
      it("returns true when given a filter Rule", function() {
        expect(Helpers.Guards.FilterElements.isUnknown(unknown)).toBe(true)
      })

      it("returns false when given any other filter element", function() {
        expect(Helpers.Guards.FilterElements.isUnknown(empty)).toBe(false)
        expect(Helpers.Guards.FilterElements.isUnknown(rule)).toBe(false)
      })
    })
  })

  describe("isTextSuggestion", function() {
    it("returns true when given a text suggestion", function() {
      let textSuggestion = { text: "" }
      expect(Helpers.Guards.isTextSuggestion(textSuggestion)).toBe(true)
    })

    it("returns false when given a snippet suggestion", function() {
      let snippetSuggestion = { snippet: "" }
      expect(Helpers.Guards.isTextSuggestion(snippetSuggestion)).toBe(false)
    })
  })

  describe("isSnippetSuggestion", function() {
    it("returns true when given a snippet suggestion", function() {
      let snippetSuggestion = { snippet: "" }
      expect(Helpers.Guards.isSnippetSuggestion(snippetSuggestion)).toBe(true)
    })

    it("returns false when given a text suggestion", function() {
      let textSuggestion = { text: "" }
      expect(Helpers.Guards.isSnippetSuggestion(textSuggestion)).toBe(false)
    })
  })
})
