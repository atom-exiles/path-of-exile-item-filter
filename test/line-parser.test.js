import LineParser from '../dist/line-parser';

describe('LineParser.constructor()', function() {
  it('sets LineParser.textStartIndex correctly', function() {
    var p = new LineParser('  Value', 0);
    assert.strictEqual(p.textStartIndex, 2);
  });

  it('sets LineParser.textEndIndex correctly', function() {
    var p = new LineParser('Value  ', 0);
    assert.strictEqual(p.textEndIndex, 5);
  });

  it('sets both textStartIndex and textEndIndex correctly', function() {
    var p = new LineParser('  Value   ', 0);
    assert.strictEqual(p.textStartIndex, 2);
    assert.strictEqual(p.textEndIndex, 7);
  });

  it('sets the textStartIndex and textEndIndex correctly when there are ' +
      'multiple text segments', function() {
    var p = new LineParser('Value Test', 0);
    assert.strictEqual(p.textStartIndex, 0);
    assert.strictEqual(p.textEndIndex, 10);
  });

  it('correctly sets textStartIndex and textEndIndex when given a segment ' +
      'containing numbers', function() {
    var p = new LineParser('  Value 42', 0);
    assert.strictEqual(p.textStartIndex, 2);
    assert.strictEqual(p.textEndIndex, 10);
  });

  it('sets the start and end index correctly when there is no ' +
      'whitespace', function() {
    var p = new LineParser('Value', 0);
    assert.strictEqual(p.textStartIndex, 0);
    assert.strictEqual(p.textEndIndex, 5);
  });

  it('sets the start and end index correctly even when both would ' +
      'be 0', function() {
    var p = new LineParser('', 0);
    assert.strictEqual(p.textStartIndex, 0);
    assert.strictEqual(p.textEndIndex, 0);
  });

  it('correctly sets the original length on a string', function() {
    var p = new LineParser('Test', 0);
    assert.strictEqual(p.originalLength, 4);
  });

  it('correctly sets the original length on an empty string', function() {
    var p = new LineParser('', 0);
    assert.strictEqual(p.originalLength, 0);
  });

  it('correctly identifies an empty string as such', function() {
    var p = new LineParser('', 0);
    assert(p.empty);
  });

  it('correctly identifies a commneted string as such', function() {
    var p = new LineParser('# Test', 0);
    assert(p.isCommented());
  });
});

describe('LineParser.empty -> boolean', function() {
  // Success Cases ============================================================
  it('correctly handles an empty line', function() {
    var p = new LineParser('', 0);
    assert(p.empty);
  });

  it('correctly handles a space-only line', function() {
    var p = new LineParser('  ', 0);
    assert(p.empty);
  });

  it('correctly handles a tab-only line', function() {
    var p = new LineParser('\t\t', 0);
    assert(p.empty);
  });

  it('correctly handles a mixed-whitespace line', function() {
    var p = new LineParser(' \t ', 0);
    assert(p.empty);
  });

  it('correctly handles whitespace led by a number', function() {
    var p = new LineParser('42 \t', 0);
    p.nextNumber();
    assert(p.empty);
  });

  it('correctly handles a lone boolean', function() {
    var p = new LineParser('True', 0);
    p.nextBoolean();
    assert(p.empty);
  });

  it('correctly handles whitespace led by an operator', function() {
    var p = new LineParser('>= \t ', 0);
    p.nextOperator();
    assert(p.empty);
  });

  it('correctly handles whitespace led by a word', function() {
    var p = new LineParser('text ', 0);
    p.nextWord();
    assert(p.empty);
  });

  it('correctly handles whitespace led by a string', function() {
    var p = new LineParser('"Test Text" \t', 0);
    p.nextString();
    assert(p.empty);
  });

  it('correctly handles a single word', function() {
    var p = new LineParser('Test', 0);
    assert.isFalse(p.empty);
  });

  it('correctly handles a word with leading space characters', function() {
    var p = new LineParser('  Test', 0);
    assert.isFalse(p.empty);
  });

  it('correctly handles a word with a leading tab character', function() {
    var p = new LineParser('\tTest', 0);
    assert.isFalse(p.empty);
  });

  it('correctly handles all filter-specific unicode characters', function() {
    var p = new LineParser('ö', 0);
    assert.isFalse(p.empty);
  });

  it('correctly handles filter-specific unicode characters with leading ' +
      'spaces', function() {
    var p = new LineParser('   ö', 0);
    assert.isFalse(p.empty);
  });

  it('correctly handles filter-specific unicode characters with a leading ' +
      'tab', function() {
    var p = new LineParser('\tö', 0);
    assert.isFalse(p.empty);
  });

  it('thinks of Path of Exile comments as normal text', function() {
    var p = new LineParser('#', 0);
    assert.isFalse(p.empty);
  });

  it('works properly when processing a string of many elements', function() {
    var p = new LineParser('42 Test "Test Value" \t', 0);
    p.nextNumber();
    assert.isFalse(p.empty);
    p.nextWord();
    assert.isFalse(p.empty);
    p.nextString();
    assert(p.empty);
  });

  // Failure Cases ============================================================
  it('throws when given multiple lines', function() {
    assert.throws(() => {
      const _ = new LineParser('\n', 0);
    });
  });
});

describe('LineParser.isCommented() -> boolean', function() {
  // Success Cases ============================================================
  it('correctly detects lone pound characters as comments', function() {
    var p = new LineParser('#', 0);
    assert(p.isCommented());
  });

  it('correctly detects standard Path of Exile comments', function() {
    var p = new LineParser('# Test', 0);
    assert(p.isCommented());
  });

  it('correctly detects comments with leading spaces', function() {
    var p = new LineParser('  # Test', 0);
    assert(p.isCommented());
  });

  it('correctly detects comments with a leading tab', function() {
    var p = new LineParser('\t# Test', 0);
    assert(p.isCommented());
  });

  it('correctly handles multiple pound signs', function() {
    var p = new LineParser('##Test', 0);
    assert(p.isCommented());
  });

  it('correctly detects comments with no spacing at all', function() {
    var p = new LineParser('#Test', 0);
    assert(p.isCommented());
  });

  it('correctly detects comments with trailing filter-specific ' +
      'unicode', function() {
    var p = new LineParser('#ö', 0);
    assert(p.isCommented());
  });

  it('correctly handles comments led by a string', function() {
    var p = new LineParser('"Test Value" # Test', 0);
    p.nextString();
    assert(p.isCommented());
  });

  it('correctly detects comments with leading filter-specific ' +
      'unicode', function() {
    var p = new LineParser('ö#', 0);
    assert.isFalse(p.isCommented());
  });

  it('correctly ignores comments with leading text', function() {
    var p = new LineParser('test#', 0);
    assert.isFalse(p.isCommented());
  });

  it('correctly ignores comments a leading word', function() {
    var p = new LineParser('test # ', 0);
    assert.isFalse(p.isCommented());
  });

  // Failure Cases ============================================================
  it('throws an expection if given multiple lines', function() {
    assert.throws(() => {
      const _ = new LineParser('# Test \n # Test', 0);
    });
  });
});

describe('LineParser.isIgnored() -> boolean', function() {
  // There are only really four cases that we need to test here, as both
  // isCommented() and isEmpty() are thoroughly tested.
  it(`knows that words shouldn't be ignored`, function() {
    var p = new LineParser('Test', 0);
    assert.isFalse(p.isIgnored());
  });

  it(`knows that strings shouldn't be ignored`, function() {
    var p = new LineParser('"Test"', 0);
    assert.isFalse(p.isIgnored());
  });

  it(`knows that numbers shouldn't be ignored`, function() {
    var p = new LineParser('42', 0);
    assert.isFalse(p.isIgnored());
  });

  it(`knows that operators shouldn't be ignored`, function() {
    var p = new LineParser('>=', 0);
    assert.isFalse(p.isIgnored());
  });

  it('knows not to ignore meaningful values followed by a comment', function() {
    var p = new LineParser(' Test # Text', 0);
    assert.isFalse(p.isIgnored());
  });

  it('knows an empty line can be ignored', function() {
    var p = new LineParser('', 0);
    assert(p.isIgnored());
  });

  it('knows a line consisting of only whitespace can be ignored', function() {
    var p = new LineParser(' \t \t', 0);
    assert(p.isIgnored());
  });

  it('knows a Path of Exile comment can be ignored', function() {
    var p = new LineParser('# Test', 0);
    assert(p.isIgnored());
  });
});

describe('LineParser.nextNumber() -> ParseResult', function() {
  // Success Cases ============================================================
  it('correctly handles a lone number', function() {
    var p = new LineParser('42', 0);
    let currentResult = p.nextNumber();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, 42);
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 2);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 2);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles leading space characters', function() {
    var p = new LineParser(' 42', 0);
    let currentResult = p.nextNumber();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, 42);
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 3);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 3);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles leading tab characters', function() {
    var p = new LineParser('\t42', 0);
    let currentResult = p.nextNumber();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, 42);
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 3);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 3);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles trailing text strings', function() {
    var p = new LineParser('  42 test', 0);
    let currentResult = p.nextNumber();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, 42);
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, ' test');
    assert.strictEqual(p.currentIndex, 4);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles trailing comments', function() {
    var p = new LineParser('  42 # test', 0);
    let currentResult = p.nextNumber();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, 42);
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, ' # test');
    assert.strictEqual(p.currentIndex, 4);
    assert.isFalse(p.empty);
    assert(p.isCommented());
  });

  it('correctly handles trailing filter-specific unicode ' +
      'characters', function() {
    var p = new LineParser('   42 ö', 0);
    let currentResult = p.nextNumber();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, 42);
    assert.strictEqual(currentResult.range.start.column, 3);
    assert.strictEqual(currentResult.range.end.column, 5);
    assert.strictEqual(p.text, ' ö');
    assert.strictEqual(p.currentIndex, 5);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles lines with a word', function() {
    var p = new LineParser('test', 0);
    let currentResult = p.nextNumber();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles a number led by a word', function() {
    var p = new LineParser('test 42', 0);
    let currentResult = p.nextNumber();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles mixed number, text strings', function() {
    var p = new LineParser('42test', 0);
    let currentResult = p.nextNumber();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles mixed number, strings with filter-specific unicode ' +
      'characters', function() {
    var p = new LineParser('42ö', 0);
    let currentResult = p.nextNumber();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles a number led by a comment', function() {
    var p = new LineParser('# 42', 0);
    let currentResult = p.nextNumber();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert(p.isCommented());
  });

  it(`doesn't mutate a following number when removing a number`, function() {
    var p = new LineParser('42 42', 0);
    p.nextNumber();
    assert.strictEqual(p.text, ' 42');
    assert.strictEqual(p.currentIndex, 2);
  });

  it(`doesn't mutate a following word when removing a number`, function() {
    var p = new LineParser('42 Test', 0);
    p.nextNumber();
    assert.strictEqual(p.text, ' Test');
    assert.strictEqual(p.currentIndex, 2);
  });

  it(`doesn't mutate a following string when removing a number`, function() {
    var p = new LineParser(' 42 "Test"', 0);
    p.nextNumber();
    assert.strictEqual(p.text, ' "Test"');
    assert.strictEqual(p.currentIndex, 3);
  });

  // Failure Cases ============================================================
  it('throws an error when given multiple lines', function() {
    assert.throws(() => {
      let _ = new LineParser('42\ntest', 0);
    });
  });
});

describe('LineParser.nextOperator() -> ParseResult', function() {
  // Success Cases ============================================================
  it(`correctly handles the '<' operator`, function() {
    var p = new LineParser('<', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, '<');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 1);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 1);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`correctly handles the '>' operator`, function() {
    var p = new LineParser('>', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, '>');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 1);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 1);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`correctly handles the '=' operator`, function() {
    var p = new LineParser('=', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, '=');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 1);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 1);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`correctly handles the '<=' operator`, function() {
    var p = new LineParser('<=', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, '<=');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 2);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 2);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`correctly handles the '>=' operator`, function() {
    var p = new LineParser('>=', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, '>=');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 2);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 2);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`correctly handles the '>=' operator`, function() {
    var p = new LineParser(' >', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, '>');
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 2);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 2);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles trailing whitespace', function() {
    var p = new LineParser('< ', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, '<');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 1);
    assert.strictEqual(p.text, ' ');
    assert.strictEqual(p.currentIndex, 1);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles surrounding whitespace', function() {
    var p = new LineParser(' > ', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, '>');
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 2);
    assert.strictEqual(p.text, ' ');
    assert.strictEqual(p.currentIndex, 2);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles tab whitespace characters', function() {
    var p = new LineParser('\t<\t', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, '<');
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 2);
    assert.strictEqual(p.text, '\t');
    assert.strictEqual(p.currentIndex, 2);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles filter-specific unicode characters', function() {
    var p = new LineParser('< ö', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, '<');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 1);
    assert.strictEqual(p.text, ' ö');
    assert.strictEqual(p.currentIndex, 1);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles an operator trailed by a commnet', function() {
    var p = new LineParser('> # Test', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.strictEqual(currentResult.value, '>');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 1);
    assert.strictEqual(p.text, ' # Test');
    assert.strictEqual(p.currentIndex, 1);
    assert.isFalse(p.empty);
    assert(p.isCommented());
  });

  it('correctly ignores an operaotr surrounded by text', function() {
    var p = new LineParser('a > b', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('ignores operators suffixed by a word', function() {
    var p = new LineParser('>test', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('ignores operators suffixed by a filter-specific unicode ' +
      'character', function() {
    var p = new LineParser('>ö', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('ignores operators prefixed by a filter-specific unicode ' +
      'character', function() {
    var p = new LineParser('ö>', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('ignores operators prefixed and suffixed by characters', function() {
    var p = new LineParser('a>b', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`does not consider multiple '>' characters to be an operator`, function() {
    var p = new LineParser('>>', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`does not consider multiple '<' characters to be an operator`, function() {
    var p = new LineParser('<<', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not consider "=<" to be an operator', function() {
    var p = new LineParser('=<', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not consider "==" to be an operator', function() {
    var p = new LineParser('==', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('ignores operators surrounded by double quotes', function() {
    var p = new LineParser('">"', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('ignores operators surrounded by single quotes', function() {
    var p = new LineParser(`'<'`, 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles an operator led by a comment', function() {
    var p = new LineParser('#Test >', 0);
    let currentResult = p.nextOperator();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert(p.isCommented());
  });

  it(`doesn't mutate a following number when removing an operator`, function() {
    var p = new LineParser('> 42', 0);
    p.nextOperator();
    assert.strictEqual(p.text, ' 42');
    assert.strictEqual(p.currentIndex, 1);
  });

  it(`doesn't mutate a following word when removing an operator`, function() {
    var p = new LineParser('< Test', 0);
    p.nextOperator();
    assert.strictEqual(p.text, ' Test');
    assert.strictEqual(p.currentIndex, 1);
  });

  it(`doesn't mutate a following string when removing an operator`, function() {
    var p = new LineParser(' >= "Test"', 0);
    p.nextOperator();
    assert.strictEqual(p.text, ' "Test"');
    assert.strictEqual(p.currentIndex, 3);
  });

  // Failure Cases ============================================================
  it('throws an error when given multiple lines', function() {
    assert.throws(() => {
      const _ = new LineParser('=\ntest', 0);
    });
  });
});

describe('LineParser.nextWord() -> ParseResult', function() {
  // Success Cases ============================================================
  it('properly handles a lone word', function() {
    var p = new LineParser('test', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 4);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles words with leading spaces', function() {
    var p = new LineParser(' test', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 5);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 5);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles words with leading tabs', function() {
    var p = new LineParser('\ttest', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 5);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 5);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles words with leading and trailing spaces', function() {
    var p = new LineParser('  test ', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, ' ');
    assert.strictEqual(p.currentIndex, 6);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles words with leading and trailing tabs', function() {
    var p = new LineParser('\t\ttest\t', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, '\t');
    assert.strictEqual(p.currentIndex, 6);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles a filter-specific unicode character', function() {
    var p = new LineParser(' ö', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'ö');
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 2);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 2);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles multiple filter-specific unicode ' +
      'characters', function() {
    var p = new LineParser('öö', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'öö');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 2);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 2);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles filter-specific unicode characters with leading ' +
      'whitespace', function() {
    var p = new LineParser('\t\töö', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'öö');
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 4);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles a word trailed by another word', function() {
    var p = new LineParser('test\tword', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, '\tword');
    assert.strictEqual(p.currentIndex, 4);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles a word with a trailing number', function() {
    var p = new LineParser('test \t42', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, ' \t42');
    assert.strictEqual(p.currentIndex, 4);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles a word with a trailing string', function() {
    var p = new LineParser('test "Test String"', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, ' "Test String"');
    assert.strictEqual(p.currentIndex, 4);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles a word trailed by a comment', function() {
    var p = new LineParser('test #Comment', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, ' #Comment');
    assert.strictEqual(p.currentIndex, 4);
    assert.isFalse(p.empty);
    assert(p.isCommented());
  });

  it(`doesn't mutate a following number when removing a word`, function() {
    var p = new LineParser('Test 42', 0);
    p.nextWord();
    assert.strictEqual(p.text, ' 42');
    assert.strictEqual(p.currentIndex, 4);
  });

  it(`doesn't mutate a following word when removing a word`, function() {
    var p = new LineParser('Test Word', 0);
    p.nextWord();
    assert.strictEqual(p.text, ' Word');
    assert.strictEqual(p.currentIndex, 4);
  });

  it(`doesn't mutate a following boolean when removing a word`, function() {
    var p = new LineParser('Test >=', 0);
    p.nextWord();
    assert.strictEqual(p.text, ' >=');
    assert.strictEqual(p.currentIndex, 4);
  });

  it(`doesn't mutate a following string when removing a word`, function() {
    var p = new LineParser(' Test "Word"', 0);
    p.nextWord();
    assert.strictEqual(p.text, ' "Word"');
    assert.strictEqual(p.currentIndex, 5);
  });

  it('does not consider pound as a valid character', function() {
    var p = new LineParser('#', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert(p.isCommented());
  });

  it('does not consider a word prefixed with pound as valid', function() {
    var p = new LineParser(' #test', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert(p.isCommented());
  });

  it('does not consider numbers as characters of a word', function() {
    var p = new LineParser('test42', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not ignore leading numbers to match a trailing word', function() {
    var p = new LineParser('42test', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given text with mixed words and numbers', function() {
    var p = new LineParser('test42test', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not consider double quotation marks to be a word', function() {
    var p = new LineParser('"', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not ignore leading quotes to match a trailing word', function() {
    var p = new LineParser('"Test', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not consider a word wrapped in double quotes as valid', function() {
    var p = new LineParser('"Test"', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not consider single quotation marks to be a word', function() {
    var p = new LineParser(`'`, 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not ignore leading single quotes to match a trailing ' +
      'word', function() {
    var p = new LineParser(`'Test`, 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not consider a word wrapped in single quotes as valid', function() {
    var p = new LineParser(`'Test'`, 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('ignores a string followed by a word', function() {
    var p = new LineParser('"test" test', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly ignores a word led by a comment', function() {
    var p = new LineParser('# Test', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert(p.isCommented());
  });

  it(`does not consider the '<' operator as a valid character`, function() {
    var p = new LineParser('test<value', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`does not consider the '>' operator as a valid character`, function() {
    var p = new LineParser('test>value', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`does not consider the '>=' operator as a valid character`, function() {
    var p = new LineParser('test>=value', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`does not consider the '<=' operator as a valid character`, function() {
    var p = new LineParser('test<=value', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`does not consider the '=' operator as a valid character`, function() {
    var p = new LineParser('test=value', 0);
    let currentResult = p.nextWord();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  // Failure Cases ============================================================
  it('throws an error when given multiple lines', function() {
    assert.throws(() => {
      const _ = new LineParser('Test\nWord', 0);
    });
  });
});

describe('LineParser.nextString() -> ParseResult', function() {
  // Success Cases ============================================================
  it('properly hands a lone word', function() {
    var p = new LineParser('test', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 4);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles back-to-back words', function() {
    var p = new LineParser('test value', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, ' value');
    assert.strictEqual(p.currentIndex, 4);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles words led by spaces', function() {
    var p = new LineParser('  test', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 6);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles words led by tabs', function() {
    var p = new LineParser('\t\ttest', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 6);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles words surrounded by whitespace', function() {
    var p = new LineParser(' \ttest\t ', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, '\t ');
    assert.strictEqual(p.currentIndex, 6);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles strings', function() {
    var p = new LineParser('"test"', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 6);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles a string led by a space', function() {
    var p = new LineParser(' "test"', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 7);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 7);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles empty strings', function() {
    var p = new LineParser('""', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, '');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 2);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 2);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles strings surrounded by whitespace', function() {
    var p = new LineParser(' \t""\t ', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, '');
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, '\t ');
    assert.strictEqual(p.currentIndex, 4);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles strings with multiple words', function() {
    var p = new LineParser('"test test"', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 11);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 11);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles strings follow by words', function() {
    var p = new LineParser('"test" test text', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, ' test text');
    assert.strictEqual(p.currentIndex, 6);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles filter-specific unicode strings', function() {
    var p = new LineParser('"ööö" test', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'ööö');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 5);
    assert.strictEqual(p.text, ' test');
    assert.strictEqual(p.currentIndex, 5);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles filter-specific unicode words', function() {
    var p = new LineParser('öö "test"', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'öö');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 2);
    assert.strictEqual(p.text, ' "test"');
    assert.strictEqual(p.currentIndex, 2);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('properly handles strings using multiple character sets', function() {
    var p = new LineParser('testöövalue', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'testöövalue');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 11);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 11);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('allows a filter-specific unicode string to be followed by a ' +
      'word', function() {
    var p = new LineParser('"testöövalue" test', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'testöövalue');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 13);
    assert.strictEqual(p.text, ' test');
    assert.strictEqual(p.currentIndex, 13);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('allows numbers to be used within strings', function() {
    var p = new LineParser(' test42', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test42');
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 7);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 7);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('allows numbers to be used within words', function() {
    var p = new LineParser('\t42test \t', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, '42test');
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 7);
    assert.strictEqual(p.text, ' \t');
    assert.strictEqual(p.currentIndex, 7);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('behaves properly when trailed by a number', function() {
    var p = new LineParser('"42 test" 321', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, '42 test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 9);
    assert.strictEqual(p.text, ' 321');
    assert.strictEqual(p.currentIndex, 9);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('behaves properly when trailed by a comment', function() {
    var p = new LineParser('"Test" # Value', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'Test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, ' # Value');
    assert.strictEqual(p.currentIndex, 6);
    assert.isFalse(p.empty);
    assert(p.isCommented());
  });

  it('supports words followed by number-only strings', function() {
    var p = new LineParser('test "42"', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, 'test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, ' "42"');
    assert.strictEqual(p.currentIndex, 4);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('supports operators if they are contained within a string', function() {
    var p = new LineParser('"> test"', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, '> test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 8);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 8);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`doesn't mutate a following number when removing a string`, function() {
    var p = new LineParser('"Test" 42', 0);
    p.nextString();
    assert.strictEqual(p.text, ' 42');
    assert.strictEqual(p.currentIndex, 6);
  });

  it(`doesn't mutate a following word when removing a string`, function() {
    var p = new LineParser('"Test" Text', 0);
    p.nextString();
    assert.strictEqual(p.text, ' Text');
    assert.strictEqual(p.currentIndex, 6);
  });

  it(`doesn't mutate a following boolean when removing a string`, function() {
    var p = new LineParser('"Test" <', 0);
    p.nextString();
    assert.strictEqual(p.text, ' <');
    assert.strictEqual(p.currentIndex, 6);
  });

  it(`doesn't mutate a following string when removing a string`, function() {
    var p = new LineParser('"Test" "Value"', 0);
    p.nextString();
    assert.strictEqual(p.text, ' "Value"');
    assert.strictEqual(p.currentIndex, 6);
  });

  it('fails when given neither a word or string', function() {
    var p = new LineParser('', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given a word containing a quotation mark', function() {
    var p = new LineParser('test"test', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('failes when given a string conjoined with a word', function() {
    var p = new LineParser('"test"test', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given a word conjoined with a string', function() {
    var p = new LineParser('test"test"', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not support single-quotation mark strings', function() {
    var p = new LineParser(`'test'`, 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not support single quote strings led by spaces', function() {
    var p = new LineParser(` 'test'`, 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not support single quote strings led by tabs', function() {
    var p = new LineParser(`/t'test'`, 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given a stray followed by a word', function() {
    var p = new LineParser('> test', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given an operator joined by a word', function() {
    var p = new LineParser('<test', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given an operator attached to a string', function() {
    var p = new LineParser('>"test"', 0);
    let currentResult = p.nextString();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  // Failure Cases ============================================================
  it('throws when given multiple lines', function() {
    assert.throws(() => {
      const _ = new LineParser('"Test"\n"Value"', 0);
    });
  });
});

describe('LineParser.nextBoolean() -> ParseResult', function() {
  it(`correctly handles a lone 'true'`, function() {
    var p = new LineParser('TRUE', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 4);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`correctly handles a lone 'false'`, function() {
    var p = new LineParser('FALSE', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.isFalse(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 5);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 5);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('is case insensitive for true', function() {
    var p = new LineParser('tRuE', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 4);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('is case insensitive for false', function() {
    var p = new LineParser('fAlSe', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.isFalse(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 5);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 5);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly handles boolean strings', function() {
    var p = new LineParser('"true"', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 6);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('is still case insensitive when handling strings', function() {
    var p = new LineParser('"FAlse"', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.isFalse(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 7);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 7);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly ignores leading space characters', function() {
    var p = new LineParser(' true', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 1);
    assert.strictEqual(currentResult.range.end.column, 5);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 5);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly ignores leading tab characters', function() {
    var p = new LineParser('\t\ttrue', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 6);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly ignores surrounding whitespace', function() {
    var p = new LineParser(' \tfalse\t ', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.isFalse(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 7);
    assert.strictEqual(p.text, '\t ');
    assert.strictEqual(p.currentIndex, 7);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly ignores trailing words', function() {
    var p = new LineParser('true test', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 4);
    assert.strictEqual(p.text, ' test');
    assert.strictEqual(p.currentIndex, 4);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly ignores trailing strings', function() {
    var p = new LineParser('false\t"test"', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.isFalse(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 5);
    assert.strictEqual(p.text, '\t"test"');
    assert.strictEqual(p.currentIndex, 5);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly ignores trailing commnets', function() {
    var p = new LineParser('false # Test', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.isFalse(currentResult.value);
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 5);
    assert.strictEqual(p.text, ' # Test');
    assert.strictEqual(p.currentIndex, 5);
    assert.isFalse(p.empty);
    assert(p.isCommented());
  });

  it(`doesn't mutate a following number when removing a boolean`, function() {
    var p = new LineParser('True 42', 0);
    p.nextBoolean();
    assert.strictEqual(p.text, ' 42');
    assert.strictEqual(p.currentIndex, 4);
  });

  it(`doesn't mutate a following word when removing a boolean`, function() {
    var p = new LineParser('False Test', 0);
    p.nextBoolean();
    assert.strictEqual(p.text, ' Test');
    assert.strictEqual(p.currentIndex, 5);
  });

  it(`doesn't mutate a following boolean when removing a boolean`, function() {
    var p = new LineParser('"True" =', 0);
    p.nextBoolean();
    assert.strictEqual(p.text, ' =');
    assert.strictEqual(p.currentIndex, 6);
  });

  it(`doesn't mutate a following string when removing a boolean`, function() {
    var p = new LineParser('"False" "Test"', 0);
    p.nextBoolean();
    assert.strictEqual(p.text, ' "Test"');
    assert.strictEqual(p.currentIndex, 7);
  });

  it('correctly handles a boolean led by a comment', function() {
    var p = new LineParser('# True', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert(p.isCommented());
  });

  it('fails when given a word', function() {
    var p = new LineParser('test', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given a valid value led by a word', function() {
    var p = new LineParser('test true', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given a valid string value led by a word', function() {
    var p = new LineParser('test "true"', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given a valid value led by a string', function() {
    var p = new LineParser('"test" true', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given only a number', function() {
    var p = new LineParser('42', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not use a naive regex for false', function() {
    var p = new LineParser('TALSE', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not use a naive regex for true', function() {
    var p = new LineParser('frue', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert.isFalse(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given an empty line', function() {
    var p = new LineParser('', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('fails when given a line containing only whitespace', function() {
    var p = new LineParser(' \t', 0);
    let currentResult = p.nextBoolean();
    assert.isDefined(currentResult.found);
    assert.isFalse(currentResult.found);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  // Failure Cases ============================================================
  it('throws an expection if given multiple lines', function() {
    assert.throws(() => {
      const _ = new LineParser('\n', 0);
    });
  });
});

describe('LineParser.parseComment() -> ParseResult', function() {
  it('correctly parses a line comment', function() {
    var p = new LineParser('# Test', 0);
    assert(p.isCommented());
    let currentResult = p.parseComment();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, '# Test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 6);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('correctly deals with leading whitespace', function() {
    var p = new LineParser('  # Test', 0);
    let currentResult = p.parseComment();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, '# Test');
    assert.strictEqual(currentResult.range.start.column, 2);
    assert.strictEqual(currentResult.range.end.column, 8);
    assert.strictEqual(p.text, '');
    assert.strictEqual(p.currentIndex, 8);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it('does not consume trailing whitespace', function() {
    var p = new LineParser('# Test  ', 0);
    let currentResult = p.parseComment();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, '# Test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 6);
    assert.strictEqual(p.text, '  ');
    assert.strictEqual(p.currentIndex, 6);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });

  it(`consumes '#' same as any other character`, function() {
    var p = new LineParser('# Test#Test  ', 0);
    let currentResult = p.parseComment();
    assert.isDefined(currentResult.found);
    assert(currentResult.found);
    assert.isDefined(currentResult.value);
    assert.strictEqual(currentResult.value, '# Test#Test');
    assert.strictEqual(currentResult.range.start.column, 0);
    assert.strictEqual(currentResult.range.end.column, 11);
    assert.strictEqual(p.text, '  ');
    assert.strictEqual(p.currentIndex, 11);
    assert(p.empty);
    assert.isFalse(p.isCommented());
  });
});
