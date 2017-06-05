/** @babel */

import LineParser from '../dist/line-parser';

describe("LineParser.constructor()", function() {
  it("sets LineParser.textStartIndex correctly", function() {
    var p = new LineParser("  Value", 0)
    expect(p.textStartIndex).toBe(2)
  })

  it("sets LineParser.textEndIndex correctly", function() {
    var p = new LineParser("Value  ", 0)
    expect(p.textEndIndex).toBe(5)
  })

  it("sets both textStartIndex and textEndIndex correctly", function() {
    var p = new LineParser("  Value   ", 0)
    expect(p.textStartIndex).toBe(2)
    expect(p.textEndIndex).toBe(7)
  })

  it("sets the textStartIndex and textEndIndex correctly when there are multiple text segments", function() {
    var p = new LineParser("Value Test", 0)
    expect(p.textStartIndex).toBe(0)
    expect(p.textEndIndex).toBe(10)
  })

  it("correctly sets textStartIndex and textEndIndex when given a segment containing numbers", function() {
    var p = new LineParser("  Value 42", 0)
    expect(p.textStartIndex).toBe(2)
    expect(p.textEndIndex).toBe(10)
  })

  it("sets the start and end index correctly when there is no whitespace", function() {
    var p = new LineParser("Value", 0)
    expect(p.textStartIndex).toBe(0)
    expect(p.textEndIndex).toBe(5)
  })

  it("sets the start and end index correctly even when both would be 0", function() {
    var p = new LineParser("", 0)
    expect(p.textStartIndex).toBe(0)
    expect(p.textEndIndex).toBe(0)
  })

  it("correctly sets the original length on a string", function() {
    var p = new LineParser("Test", 0)
    expect(p.originalLength).toBe(4)
  })

  it("correctly sets the original length on an empty string", function() {
    var p = new LineParser("", 0)
    expect(p.originalLength).toBe(0)
  })

  it("correctly identifies an empty string as such", function() {
    var p = new LineParser("", 0)
    expect(p.empty).toBe(true)
  })

  it("correctly identifies a commneted string as such", function() {
    var p = new LineParser("# Test", 0)
    expect(p.isCommented()).toBe(true)
  })
})

describe("LineParser.empty -> boolean", function() {
  // Success Cases ============================================================
  it("correctly handles an empty line", function() {
    var p = new LineParser("", 0)
    expect(p.empty).toBe(true)
  })

  it("correctly handles a space-only line", function() {
    var p = new LineParser("  ", 0)
    expect(p.empty).toBe(true)
  })

  it("correctly handles a tab-only line", function() {
    var p = new LineParser("\t\t", 0)
    expect(p.empty).toBe(true)
  })

  it("correctly handles a mixed-whitespace line", function() {
    var p = new LineParser(" \t ", 0)
    expect(p.empty).toBe(true)
  })

  it("correctly handles whitespace led by a number", function() {
    var p = new LineParser("42 \t", 0)
    p.nextNumber()
    expect(p.empty).toBe(true)
  })

  it("correctly handles a lone boolean", function() {
    var p = new LineParser("True", 0)
    p.nextBoolean()
    expect(p.empty).toBe(true)
  })

  it("correctly handles whitespace led by an operator", function() {
    var p = new LineParser(">= \t ", 0)
    p.nextOperator()
    expect(p.empty).toBe(true)
  })

  it("correctly handles whitespace led by a word", function() {
    var p = new LineParser("text ", 0)
    p.nextWord()
    expect(p.empty).toBe(true)
  })

  it("correctly handles whitespace led by a string", function() {
    var p = new LineParser('"Test Text" \t', 0)
    p.nextString()
    expect(p.empty).toBe(true)
  })

  it("correctly handles a single word", function() {
    var p = new LineParser("Test", 0)
    expect(p.empty).toBe(false)
  })

  it("correctly handles a word with leading space characters", function() {
    var p = new LineParser("  Test", 0)
    expect(p.empty).toBe(false)
  })

  it("correctly handles a word with a leading tab character", function() {
    var p = new LineParser("\tTest", 0)
    expect(p.empty).toBe(false)
  })

  it("correctly handles all filter-specific unicode characters", function() {
    var p = new LineParser("ö", 0)
    expect(p.empty).toBe(false)
  })

  it("correctly handles filter-specific unicode characters with leading spaces", function() {
    var p = new LineParser("   ö", 0)
    expect(p.empty).toBe(false)
  })

  it("correctly handles filter-specific unicode characters with a leading tab", function() {
    var p = new LineParser("\tö", 0)
    expect(p.empty).toBe(false)
  })

  it("thinks of Path of Exile comments as normal text", function() {
    var p = new LineParser("#", 0)
    expect(p.empty).toBe(false)
  })

  it("works properly when processing a string of many elements", function() {
    var p = new LineParser('42 Test "Test Value" \t', 0)
    p.nextNumber()
    expect(p.empty).toBe(false)
    p.nextWord()
    expect(p.empty).toBe(false)
    p.nextString()
    expect(p.empty).toBe(true)
  })

  // Failure Cases ============================================================
  it("throws when given multiple lines", function() {
    expect(function() {
      var p = new LineParser("\n", 0)
    }).toThrow()
  })
})

describe("LineParser.isCommented() -> boolean", function() {
  // Success Cases ============================================================
  it("correctly detects lone pound characters as comments", function() {
    var p = new LineParser("#", 0)
    expect(p.isCommented()).toBe(true)
  })

  it("correctly detects standard Path of Exile comments", function() {
    var p = new LineParser("# Test", 0)
    expect(p.isCommented()).toBe(true)
  })

  it("correctly detects comments with leading spaces", function() {
    var p = new LineParser("  # Test", 0)
    expect(p.isCommented()).toBe(true)
  })

  it("correctly detects comments with a leading tab", function() {
    var p = new LineParser("\t# Test", 0)
    expect(p.isCommented()).toBe(true)
  })

  it("correctly handles multiple pound signs", function() {
    var p = new LineParser("##Test", 0)
    expect(p.isCommented()).toBe(true)
  })

  it("correctly detects comments with no spacing at all", function() {
    var p = new LineParser("#Test", 0)
    expect(p.isCommented()).toBe(true)
  })

  it("correctly detects comments with trailing filter-specific unicode", function() {
    var p = new LineParser("#ö", 0)
    expect(p.isCommented()).toBe(true)
  })

  it("correctly handles comments led by a string", function() {
    var p = new LineParser('"Test Value" # Test', 0)
    p.nextString()
    expect(p.isCommented()).toBe(true)
  })

  it("correctly detects comments with leading filter-specific unicode", function() {
    var p = new LineParser("ö#", 0)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly ignores comments with leading text", function() {
    var p = new LineParser("test#", 0)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly ignores comments a leading word", function() {
    var p = new LineParser("test # ", 0)
    expect(p.isCommented()).toBe(false)
  })

  // Failure Cases ============================================================
  it("throws an expection if given multiple lines", function() {
    expect(function() {
      var p = new LineParser("# Test \n # Test", 0)
    }).toThrow()
  })
})

describe("LineParser.isIgnored() -> boolean", function() {
  // There are only really four cases that we need to test here, as both
  // isCommented() and isEmpty() are thoroughly tested.
  it("knows that words shouldn't be ignored", function() {
    var p = new LineParser("Test", 0)
    expect(p.isIgnored()).toBe(false)
  })

  it("knows that strings shouldn't be ignored", function() {
    var p = new LineParser('"Test"', 0)
    expect(p.isIgnored()).toBe(false)
  })

  it("knows that numbers shouldn't be ignored", function() {
    var p = new LineParser("42", 0)
    expect(p.isIgnored()).toBe(false)
  })

  it("knows that operators shouldn't be ignored", function() {
    var p = new LineParser(">=", 0)
    expect(p.isIgnored()).toBe(false)
  })

  it("knows not to ignore meaningful values followed by a comment", function() {
    var p = new LineParser(" Test # Text", 0)
    expect(p.isIgnored()).toBe(false)
  })

  it("knows an empty line can be ignored", function() {
    var p = new LineParser("", 0)
    expect(p.isIgnored()).toBe(true)
  })

  it("knows a line consisting of only whitespace can be ignored", function() {
    var p = new LineParser(" \t \t", 0)
    expect(p.isIgnored()).toBe(true)
  })

  it("knows a Path of Exile comment can be ignored", function() {
    var p = new LineParser("# Test", 0)
    expect(p.isIgnored()).toBe(true)
  })
})

describe("LineParser.nextNumber() -> ParseResult", function() {
  var currentResult = {
    found: undefined,
    value: undefined,
    range: undefined
  }

  beforeEach(function() {
    currentResult.found = undefined
    currentResult.value = undefined
    currentResult.range = undefined
  })

  // Success Cases ============================================================
  it("correctly handles a lone number", function() {
    var p = new LineParser("42", 0)
    currentResult = p.nextNumber()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe(42)
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(2)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(2)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles leading space characters", function() {
    var p = new LineParser(" 42", 0)
    currentResult = p.nextNumber()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe(42)
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(3)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(3)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles leading tab characters", function() {
    var p = new LineParser("\t42", 0)
    currentResult = p.nextNumber()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe(42)
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(3)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(3)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles trailing text strings", function() {
    var p = new LineParser("  42 test", 0)
    currentResult = p.nextNumber()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe(42)
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe(" test")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles trailing comments", function() {
    var p = new LineParser("  42 # test", 0)
    currentResult = p.nextNumber()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe(42)
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe(" # test")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(true)
  })

  it("correctly handles trailing filter-specific unicode characters", function() {
    var p = new LineParser("   42 ö", 0)
    currentResult = p.nextNumber()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe(42)
    expect(currentResult.range.start.column).toBe(3)
    expect(currentResult.range.end.column).toBe(5)
    expect(p.text).toBe(" ö")
    expect(p.currentIndex).toBe(5)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles lines with a word", function() {
    var p = new LineParser("test", 0)
    currentResult = p.nextNumber()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles a number led by a word", function() {
    var p = new LineParser("test 42", 0)
    currentResult = p.nextNumber()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles mixed number, text strings", function() {
    var p = new LineParser("42test", 0)
    currentResult = p.nextNumber()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles mixed number, strings with filter-specific unicode characters", function() {
    var p = new LineParser("42ö", 0)
    currentResult = p.nextNumber()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles a number led by a comment", function() {
    var p = new LineParser("# 42", 0)
    currentResult = p.nextNumber()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(true)
  })

  it("doesn't mutate a following number when removing a number", function() {
    var p = new LineParser("42 42", 0)
    currentResult = p.nextNumber()
    expect(p.text).toBe(" 42")
    expect(p.currentIndex).toBe(2)
  })

  it("doesn't mutate a following word when removing a number", function() {
    var p = new LineParser("42 Test", 0)
    currentResult = p.nextNumber()
    expect(p.text).toBe(" Test")
    expect(p.currentIndex).toBe(2)
  })

  it("doesn't mutate a following string when removing a number", function() {
    var p = new LineParser(' 42 "Test"', 0)
    currentResult = p.nextNumber()
    expect(p.text).toBe(' "Test"')
    expect(p.currentIndex).toBe(3)
  })

  // Failure Cases ============================================================
  it("throws an error when given multiple lines", function() {
    expect(function() {
      var p = new LineParser("42\ntest", 0)
    }).toThrow()
  })
})

describe("LineParser.nextOperator() -> ParseResult", function() {
  var currentResult = {
    found: undefined,
    value: undefined,
    range: undefined
  }

  beforeEach(function() {
    currentResult.found = undefined
    currentResult.value = undefined
    currentResult.range = undefined
  })

  // Success Cases ============================================================
  it("correctly handles the '<' operator", function() {
    var p = new LineParser("<", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe("<")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(1)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(1)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles the '>' operator", function() {
    var p = new LineParser(">", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe(">")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(1)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(1)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles the '=' operator", function() {
    var p = new LineParser("=", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe("=")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(1)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(1)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles the '<=' operator", function() {
    var p = new LineParser("<=", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe("<=")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(2)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(2)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles the '>=' operator", function() {
    var p = new LineParser(">=", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe(">=")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(2)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(2)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles the '>=' operator", function() {
    var p = new LineParser(" >", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe(">")
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(2)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(2)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles trailing whitespace", function() {
    var p = new LineParser("< ", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe("<")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(1)
    expect(p.text).toBe(" ")
    expect(p.currentIndex).toBe(1)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles surrounding whitespace", function() {
    var p = new LineParser(" > ", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe(">")
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(2)
    expect(p.text).toBe(" ")
    expect(p.currentIndex).toBe(2)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles tab whitespace characters", function() {
    var p = new LineParser("\t<\t", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe("<")
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(2)
    expect(p.text).toBe("\t")
    expect(p.currentIndex).toBe(2)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles filter-specific unicode characters", function() {
    var p = new LineParser("< ö", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe("<")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(1)
    expect(p.text).toBe(" ö")
    expect(p.currentIndex).toBe(1)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles an operator trailed by a commnet", function() {
    var p = new LineParser("> # Test", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBe(">")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(1)
    expect(p.text).toBe(" # Test")
    expect(p.currentIndex).toBe(1)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(true)
  })

  it("correctly ignores an operaotr surrounded by text", function() {
    var p = new LineParser("a > b", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("ignores operators suffixed by a word", function() {
    var p = new LineParser(">test", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("ignores operators suffixed by a filter-specific unicode character", function() {
    var p = new LineParser(">ö", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("ignores operators prefixed by a filter-specific unicode character", function() {
    var p = new LineParser("ö>", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("ignores operators prefixed and suffixed by characters", function() {
    var p = new LineParser("a>b", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not consider multiple '>' characters to be an operator", function() {
    var p = new LineParser(">>", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not consider multiple '<' characters to be an operator", function() {
    var p = new LineParser("<<", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it('does not consider "=<" to be an operator', function() {
    var p = new LineParser("=<", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it('does not consider "==" to be an operator', function() {
    var p = new LineParser("==", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("ignores operators surrounded by double quotes", function() {
    var p = new LineParser('">"', 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("ignores operators surrounded by single quotes", function() {
    var p = new LineParser("'<'", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles an operator led by a comment", function() {
    var p = new LineParser("#Test >", 0)
    currentResult = p.nextOperator()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(true)
  })

  it("doesn't mutate a following number when removing an operator", function() {
    var p = new LineParser("> 42", 0)
    currentResult = p.nextOperator()
    expect(p.text).toBe(" 42")
    expect(p.currentIndex).toBe(1)
  })

  it("doesn't mutate a following word when removing an operator", function() {
    var p = new LineParser("< Test", 0)
    currentResult = p.nextOperator()
    expect(p.text).toBe(" Test")
    expect(p.currentIndex).toBe(1)
  })

  it("doesn't mutate a following string when removing an operator", function() {
    var p = new LineParser(' >= "Test"', 0)
    currentResult = p.nextOperator()
    expect(p.text).toBe(' "Test"')
    expect(p.currentIndex).toBe(3)
  })

  // Failure Cases ============================================================
  it("throws an error when given multiple lines", function() {
    expect(function() {
      var p = new LineParser("=\ntest", 0)
    }).toThrow()
  })
})

describe("LineParser.nextWord() -> ParseResult", function() {
  var currentResult = {
    found: undefined,
    value: undefined,
    range: undefined
  }

  beforeEach(function() {
    currentResult.found = undefined
    currentResult.value = undefined
    currentResult.range = undefined
  })

  // Success Cases ============================================================
  it("properly handles a lone word", function() {
    var p = new LineParser("test", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles words with leading spaces", function() {
    var p = new LineParser(" test", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(5)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(5)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles words with leading tabs", function() {
    var p = new LineParser("\ttest", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(5)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(5)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles words with leading and trailing spaces", function() {
    var p = new LineParser("  test ", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe(" ")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles words with leading and trailing tabs", function() {
    var p = new LineParser("\t\ttest\t", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe("\t")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles a filter-specific unicode character", function() {
    var p = new LineParser(" ö", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("ö")
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(2)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(2)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles multiple filter-specific unicode characters", function() {
    var p = new LineParser("öö", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("öö")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(2)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(2)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles filter-specific unicode characters with leading whitespace", function() {
    var p = new LineParser("\t\töö", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("öö")
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles a word trailed by another word", function() {
    var p = new LineParser("test\tword", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe("\tword")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles a word with a trailing number", function() {
    var p = new LineParser("test \t42", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe(" \t42")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles a word with a trailing string", function() {
    var p = new LineParser('test "Test String"', 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe(' "Test String"')
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles a word trailed by a comment", function() {
    var p = new LineParser("test #Comment", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe(" #Comment")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(true)
  })

  it("doesn't mutate a following number when removing a word", function() {
    var p = new LineParser("Test 42", 0)
    currentResult = p.nextWord()
    expect(p.text).toBe(" 42")
    expect(p.currentIndex).toBe(4)
  })

  it("doesn't mutate a following word when removing a word", function() {
    var p = new LineParser("Test Word", 0)
    currentResult = p.nextWord()
    expect(p.text).toBe(" Word")
    expect(p.currentIndex).toBe(4)
  })

  it("doesn't mutate a following boolean when removing a word", function() {
    var p = new LineParser("Test >=", 0)
    currentResult = p.nextWord()
    expect(p.text).toBe(" >=")
    expect(p.currentIndex).toBe(4)
  })

  it("doesn't mutate a following string when removing a word", function() {
    var p = new LineParser(' Test "Word"', 0)
    currentResult = p.nextWord()
    expect(p.text).toBe(' "Word"')
    expect(p.currentIndex).toBe(5)
  })

  it("does not consider pound as a valid character", function() {
    var p = new LineParser("#", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(true)
  })

  it("does not consider a word prefixed with pound as valid", function() {
    var p = new LineParser(" #test", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(true)
  })

  it("does not consider numbers as characters of a word", function() {
    var p = new LineParser("test42", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not ignore leading numbers to match a trailing word", function() {
    var p = new LineParser("42test", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given text with mixed words and numbers", function() {
    var p = new LineParser("test42test", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not consider double quotation marks to be a word", function() {
    var p = new LineParser('"', 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not ignore leading quotes to match a trailing word", function() {
    var p = new LineParser('"Test', 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not consider a word wrapped in double quotes as valid", function() {
    var p = new LineParser('"Test"', 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not consider single quotation marks to be a word", function() {
    var p = new LineParser("'", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not ignore leading single quotes to match a trailing word", function() {
    var p = new LineParser("'Test", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not consider a word wrapped in single quotes as valid", function() {
    var p = new LineParser("'Test'", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("ignores a string followed by a word", function() {
    var p = new LineParser('"test" test', 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly ignores a word led by a comment", function() {
    var p = new LineParser('# Test', 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(true)
  })

  it("does not consider the '<' operator as a valid character", function() {
    var p = new LineParser("test<value", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not consider the '>' operator as a valid character", function() {
    var p = new LineParser("test>value", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not consider the '>=' operator as a valid character", function() {
    var p = new LineParser("test>=value", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not consider the '<=' operator as a valid character", function() {
    var p = new LineParser("test<=value", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not consider the '=' operator as a valid character", function() {
    var p = new LineParser("test=value", 0)
    currentResult = p.nextWord()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  // Failure Cases ============================================================
  it("throws an error when given multiple lines", function() {
    expect(function() {
      var p = new LineParser("Test\nWord", 0)
    }).toThrow()
  })
})

describe("LineParser.nextString() -> ParseResult", function() {
  var currentResult = {
    found: undefined,
    value: undefined,
    range: undefined
  }

  beforeEach(function() {
    currentResult.found = undefined
    currentResult.value = undefined
    currentResult.range = undefined
  })

  // Success Cases ============================================================
  it("properly hands a lone word", function() {
    var p = new LineParser("test", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles back-to-back words", function() {
    var p = new LineParser("test value", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe(" value")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles words led by spaces", function() {
    var p = new LineParser("  test", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles words led by tabs", function() {
    var p = new LineParser("\t\ttest", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles words surrounded by whitespace", function() {
    var p = new LineParser(" \ttest\t ", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe("\t ")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles strings", function() {
    var p = new LineParser('"test"', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles a string led by a space", function() {
    var p = new LineParser(' "test"', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(7)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(7)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles empty strings", function() {
    var p = new LineParser('""', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(2)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(2)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles strings surrounded by whitespace", function() {
    var p = new LineParser(' \t""\t ', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("")
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe("\t ")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles strings with multiple words", function() {
    var p = new LineParser('"test test"', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(11)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(11)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles strings follow by words", function() {
    var p = new LineParser('"test" test text', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe(" test text")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles filter-specific unicode strings", function() {
    var p = new LineParser('"ööö" test', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("ööö")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(5)
    expect(p.text).toBe(" test")
    expect(p.currentIndex).toBe(5)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles filter-specific unicode words", function() {
    var p = new LineParser('öö "test"', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("öö")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(2)
    expect(p.text).toBe(' "test"')
    expect(p.currentIndex).toBe(2)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("properly handles strings using multiple character sets", function() {
    var p = new LineParser("testöövalue", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("testöövalue")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(11)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(11)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("allows a filter-specific unicode string to be followed by a word", function() {
    var p = new LineParser('"testöövalue" test', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("testöövalue")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(13)
    expect(p.text).toBe(" test")
    expect(p.currentIndex).toBe(13)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("allows numbers to be used within strings", function() {
    var p = new LineParser(" test42", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test42")
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(7)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(7)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("allows numbers to be used within words", function() {
    var p = new LineParser("\t42test \t", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("42test")
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(7)
    expect(p.text).toBe(" \t")
    expect(p.currentIndex).toBe(7)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("behaves properly when trailed by a number", function() {
    var p = new LineParser('"42 test" 321', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("42 test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(9)
    expect(p.text).toBe(" 321")
    expect(p.currentIndex).toBe(9)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("behaves properly when trailed by a comment", function() {
    var p = new LineParser('"Test" # Value', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("Test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe(" # Value")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(true)
  })

  it("supports words followed by number-only strings", function() {
    var p = new LineParser('test "42"', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe(' "42"')
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("supports operators if they are contained within a string", function() {
    var p = new LineParser('"> test"', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("> test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(8)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(8)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("doesn't mutate a following number when removing a string", function() {
    var p = new LineParser('"Test" 42', 0)
    currentResult = p.nextString()
    expect(p.text).toBe(" 42")
    expect(p.currentIndex).toBe(6)
  })

  it("doesn't mutate a following word when removing a string", function() {
    var p = new LineParser('"Test" Text', 0)
    currentResult = p.nextString()
    expect(p.text).toBe(" Text")
    expect(p.currentIndex).toBe(6)
  })

  it("doesn't mutate a following boolean when removing a string", function() {
    var p = new LineParser('"Test" <', 0)
    currentResult = p.nextString()
    expect(p.text).toBe(" <")
    expect(p.currentIndex).toBe(6)
  })

  it("doesn't mutate a following string when removing a string", function() {
    var p = new LineParser('"Test" "Value"', 0)
    currentResult = p.nextString()
    expect(p.text).toBe(' "Value"')
    expect(p.currentIndex).toBe(6)
  })

  it("fails when given neither a word or string", function() {
    var p = new LineParser("", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given a word containing a quotation mark", function() {
    var p = new LineParser('test"test', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("failes when given a string conjoined with a word", function() {
    var p = new LineParser('"test"test', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given a word conjoined with a string", function() {
    var p = new LineParser('test"test"', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not support single-quotation mark strings", function() {
    var p = new LineParser("'test'", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not support single quote strings led by spaces", function() {
    var p = new LineParser(" 'test'", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not support single quote strings led by tabs", function() {
    var p = new LineParser("/t'test'", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given a stray followed by a word", function() {
    var p = new LineParser("> test", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given an operator joined by a word", function() {
    var p = new LineParser("<test", 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given an operator attached to a string", function() {
    var p = new LineParser('>"test"', 0)
    currentResult = p.nextString()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  // Failure Cases ============================================================
  it("throws when given multiple lines", function() {
    expect(function() {
      var p = new LineParser('"Test"\n"Value"', 0)
    }).toThrow()
  })
})

describe("LineParser.nextBoolean() -> ParseResult", function() {
  var currentResult = {
    found: undefined,
    value: undefined,
    range: undefined
  }

  beforeEach(function() {
    currentResult.found = undefined
    currentResult.value = undefined
    currentResult.range = undefined
  })

  it("correctly handles a lone 'true'", function() {
    var p = new LineParser("TRUE", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(true)
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles a lone 'false'", function() {
    var p = new LineParser("FALSE", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(false)
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(5)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(5)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("is case insensitive for true", function() {
    var p = new LineParser("tRuE", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(true)
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("is case insensitive for false", function() {
    var p = new LineParser("fAlSe", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(false)
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(5)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(5)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly handles boolean strings", function() {
    var p = new LineParser('"true"', 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(true)
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("is still case insensitive when handling strings", function() {
    var p = new LineParser('"FAlse"', 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(false)
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(7)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(7)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly ignores leading space characters", function() {
    var p = new LineParser(" true", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(true)
    expect(currentResult.range.start.column).toBe(1)
    expect(currentResult.range.end.column).toBe(5)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(5)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly ignores leading tab characters", function() {
    var p = new LineParser("\t\ttrue", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(true)
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly ignores surrounding whitespace", function() {
    var p = new LineParser(" \tfalse\t ", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(false)
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(7)
    expect(p.text).toBe("\t ")
    expect(p.currentIndex).toBe(7)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly ignores trailing words", function() {
    var p = new LineParser("true test", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(true)
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(4)
    expect(p.text).toBe(" test")
    expect(p.currentIndex).toBe(4)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly ignores trailing strings", function() {
    var p = new LineParser('false\t"test"', 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(false)
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(5)
    expect(p.text).toBe('\t"test"')
    expect(p.currentIndex).toBe(5)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly ignores trailing commnets", function() {
    var p = new LineParser('false # Test', 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe(false)
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(5)
    expect(p.text).toBe(" # Test")
    expect(p.currentIndex).toBe(5)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(true)
  })

  it("doesn't mutate a following number when removing a boolean", function() {
    var p = new LineParser("True 42", 0)
    currentResult = p.nextBoolean()
    expect(p.text).toBe(" 42")
    expect(p.currentIndex).toBe(4)
  })

  it("doesn't mutate a following word when removing a boolean", function() {
    var p = new LineParser("False Test", 0)
    currentResult = p.nextBoolean()
    expect(p.text).toBe(" Test")
    expect(p.currentIndex).toBe(5)
  })

  it("doesn't mutate a following boolean when removing a boolean", function() {
    var p =new LineParser('"True" =', 0)
    currentResult = p.nextBoolean()
    expect(p.text).toBe(" =")
    expect(p.currentIndex).toBe(6)
  })

  it("doesn't mutate a following string when removing a boolean", function() {
    var p = new LineParser('"False" "Test"', 0)
    currentResult = p.nextBoolean()
    expect(p.text).toBe(' "Test"')
    expect(p.currentIndex).toBe(7)
  })

  it("correctly handles a boolean led by a comment", function() {
    var p = new LineParser("# True", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(true)
  })

  it("fails when given a word", function() {
    var p = new LineParser("test", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given a valid value led by a word", function() {
    var p = new LineParser("test true", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given a valid string value led by a word", function() {
    var p = new LineParser('test "true"', 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given a valid value led by a string", function() {
    var p = new LineParser('"test" true', 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given only a number", function() {
    var p = new LineParser("42", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not use a naive regex for false", function() {
    var p = new LineParser("TALSE", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("does not use a naive regex for true", function() {
    var p = new LineParser("frue", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(false)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given an empty line", function() {
    var p = new LineParser("", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("fails when given a line containing only whitespace", function() {
    var p = new LineParser(" \t", 0)
    currentResult = p.nextBoolean()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(false)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  // Failure Cases ============================================================
  it("throws an expection if given multiple lines", function() {
    expect(function() {
      var p = new LineParser("\n", 0)
    }).toThrow()
  })
})

describe("LineParser.parseComment() -> ParseResult", function() {
  var currentResult = {
    found: undefined,
    value: undefined,
    range: undefined
  }

  beforeEach(function() {
    currentResult.found = undefined
    currentResult.value = undefined
    currentResult.range = undefined
  })

  it("correctly parses a line comment", function() {
    var p = new LineParser("# Test", 0)
    expect(p.isCommented()).toBe(true)
    currentResult = p.parseComment()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("# Test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("correctly deals with leading whitespace", function() {
    var p = new LineParser("  # Test", 0)
    currentResult = p.parseComment()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("# Test")
    expect(currentResult.range.start.column).toBe(2)
    expect(currentResult.range.end.column).toBe(8)
    expect(p.text).toBe("")
    expect(p.currentIndex).toBe(8)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("does not consume trailing whitespace", function() {
    var p = new LineParser("# Test  ", 0)
    currentResult = p.parseComment()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("# Test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(6)
    expect(p.text).toBe("  ")
    expect(p.currentIndex).toBe(6)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })

  it("consumes '#' same as any other character", function() {
    var p = new LineParser("# Test#Test  ", 0)
    currentResult = p.parseComment()
    expect(currentResult.found).toBeDefined()
    expect(currentResult.found).toBe(true)
    expect(currentResult.value).toBeDefined()
    expect(currentResult.value).toBe("# Test#Test")
    expect(currentResult.range.start.column).toBe(0)
    expect(currentResult.range.end.column).toBe(11)
    expect(p.text).toBe("  ")
    expect(p.currentIndex).toBe(11)
    expect(p.empty).toBe(true)
    expect(p.isCommented()).toBe(false)
  })
})
