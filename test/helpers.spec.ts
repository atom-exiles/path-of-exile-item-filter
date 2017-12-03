import * as Helpers from "../src/helpers";

const assert = global.assert;

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
