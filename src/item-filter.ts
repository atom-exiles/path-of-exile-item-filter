import { RangeLike, TextChange, TextEditor } from "atom";
import * as _ from "lodash";

import { processLines, ValidationMessages } from "./filter-processor";
import { ValidationData } from "./validation-data";

export type Range = RangeLike;

/**
 * A slimmed down version of Atom's TextChange, with only the properties that
 * we use within our code. This simplifies the creation of these objects.
 */
interface FilterChange {
  newRange: Range;
  oldRange: Range;
}

export interface Text {
  text: string;
  range: Range;
}

export type Keyword = Text;
export type Comment = Text;
export type ThemeTag = Text;
export type Operator = Text;

export interface Value<T> {
  value: T;
  range: Range;
}

export interface Values<T> {
  values: Array<Value<T>>;
  range: Range;
}

interface Color {
  red?: Value<number>;
  green?: Value<number>;
  blue?: Value<number>;
  alpha?: Value<number>;
}

// interface Themeable {
//   tag?: ThemeTag;
// }

export interface Line {
  range: Range;
  invalid: boolean;
  messages: ValidationMessages;
}

export interface Block extends Line {
  type: "block";
  keyword: Keyword;
  trailingComment?: Comment;
}

export interface Rule extends Line {
  type: "rule";
  keyword: Keyword;
}

export interface FilterRule extends Rule {
  ruleType: "filter";
}

export interface ActionRule extends Rule {
  ruleType: "action";
}

export interface EmptyLine extends Line {
  type: "empty";
}

export interface CommentedLine extends Line {
  type: "comment";
  text: string;
}

export interface UnknownLine extends Line {
  type: "unknown";
  text: string;
}

export interface ShowBlock extends Block {
  ruleType: "show";
}

export interface HideBlock extends Block {
  ruleType: "hide";
}

export interface ItemLevelRule extends FilterRule {
  filterName: "ItemLevel";
  operator?: Operator;
  value?: Value<number>;
}

export interface DropLevelRule extends FilterRule {
  filterName: "DropLevel";
  operator?: Operator;
  value?: Value<number>;
}

export interface QualityRule extends FilterRule {
  filterName: "Quality";
  operator?: Operator;
  value?: Value<number>;
}

export interface RarityRule extends FilterRule {
  filterName: "Rarity";
  operator?: Operator;
  value?: Value<string>;
}

export interface ClassRule extends FilterRule {
  filterName: "Class";
  values?: Values<string>;
}

export interface BaseTypeRule extends FilterRule {
  filterName: "BaseType";
  values?: Values<string>;
}

export interface SocketsRule extends FilterRule {
  filterName: "Sockets";
  operator?: Operator;
  value?: Value<number>;
}

export interface LinkedSocketsRule extends FilterRule {
  filterName: "LinkedSockets";
  operator?: Operator;
  value?: Value<number>;
}

export interface SocketGroupRule extends FilterRule {
  filterName: "SocketGroup";
  value?: Value<string>;
}

export interface HeightRule extends FilterRule {
  filterName: "Height";
  operator?: Operator;
  value?: Value<number>;
}

export interface WidthRule extends FilterRule {
  filterName: "Width";
  operator?: Operator;
  value?: Value<number>;
}

export interface IdentifiedRule extends FilterRule {
  filterName: "Identified";
  value?: Value<boolean>;
}

export interface CorruptedRule extends FilterRule {
  filterName: "Corrupted";
  value?: Value<boolean>;
}

export interface ElderItemRule extends FilterRule {
  filterName: "ElderItem";
  value?: Value<boolean>;
}

export interface ShaperItemRule extends FilterRule {
  filterName: "ShaperItem";
  value?: Value<boolean>;
}

export interface ShapedMapRule extends FilterRule {
  filterName: "ShapedMap";
  value?: Value<boolean>;
}

export interface ElderMapRule extends FilterRule {
  filterName: "ElderMap";
  value?: Value<boolean>;
}

export interface SetBorderColorRule extends ActionRule, Color {
  actionName: "SetBorderColor";
  trailingComment?: Comment;
}

export interface SetTextColorRule extends ActionRule, Color {
  actionName: "SetTextColor";
  trailingComment?: Comment;
}

export interface SetBackgroundColorRule extends ActionRule, Color {
  actionName: "SetBackgroundColor";
  trailingComment?: Comment;
}

export interface PlayAlertSoundRule extends ActionRule {
  actionName: "PlayAlertSound";
  id?: Value<string>;
  volume?: Value<number>;
  trailingComment?: Comment;
}

export interface SetFontSizeRule extends ActionRule {
  actionName: "SetFontSize";
  value?: Value<number>;
}

// tslint:disable:no-any no-unsafe-any
function recursivelyShiftRanges(obj: any, shift: number) {
  for (const property of Object.keys(obj)) {
    const value = obj[property];
    if (_.has(value, "start.row") && _.has(value, "end.row")) {
      value.start.row += shift;
      value.end.row += shift;
    } else if (typeof value === "object") {
      recursivelyShiftRanges(value, shift);
    }
  }
}
// tslint:enable:no-any no-unsafe-any

/** Shifts all ranges within each item filter line by given number of rows. */
function shiftLineRanges(lines: Line[], shift: number) {
  for (const line of lines) {
    recursivelyShiftRanges(line, shift);
  }
}

export class ItemFilter {
  private readonly validationData: ValidationData;
  private readonly editor: TextEditor;
  lines: Line[];

  constructor(validationData: ValidationData, editor: TextEditor) {
    this.validationData = validationData;
    this.editor = editor;

    this.processFilter();
  }

  dispose() {}

  update(changes: TextChange[]) {
    if (changes.length === 0) return;

    const editorLines = this.editor.getBuffer().getLines();
    const filterLines = this.lines;

    let startIndex: number;
    let upperPartition: Line[]|undefined;
    let lowerPartition: Line[]|undefined;

    let change: FilterChange;
    if (changes.length === 1) {
      const atomChange = changes[0];
      change = {
        oldRange: atomChange.oldRange.copy(),
        newRange: atomChange.newRange.copy(),
      };
      startIndex = atomChange.start.row;
    } else {
      const first = _.first(changes) as TextChange;
      const last = _.last(changes) as TextChange;

      change = {
        oldRange: first.oldRange.union(last.oldRange),
        newRange: first.newRange.union(last.newRange),
      };
      startIndex = first.start.row;
    }

    const reprocessCount = change.newRange.end.row - change.newRange.start.row + 1;

    if (change.oldRange.start.row !== 0) {
      upperPartition = filterLines.slice(0, change.oldRange.start.row);
    }

    if (change.oldRange.end.row < filterLines.length) {
      const partition = filterLines.slice(change.oldRange.end.row + 1, filterLines.length);
      shiftLineRanges(partition, change.newRange.end.row - change.oldRange.end.row);
      lowerPartition = partition;
    }

    const processedLines = processLines({
      lines: editorLines.slice(startIndex, startIndex + reprocessCount),
      data: this.validationData.data,
      row: startIndex,
      file: this.editor.getBuffer().getPath(),
    });

    let result: Line[] = [];
    result = upperPartition ? result.concat(upperPartition, processedLines) : processedLines;
    if (lowerPartition) result = result.concat(lowerPartition);
    if (result.length !== editorLines.length) {
      throw new Error(`Update output has ${result.length} lines, yet the editor contains` +
        ` ${editorLines.length} lines.`);
    }

    this.lines = result;
  }

  fullUpdate() {
    const editorLines = this.editor.getBuffer().getLines();
    const newLines = processLines({
      lines: editorLines,
      data: this.validationData.data,
      row: 0,
      file: this.editor.getBuffer().getPath(),
    });

    if (newLines.length !== editorLines.length) {
      throw new Error(`Full update output has ${newLines.length} lines, yet the editor` +
        ` contains ${editorLines.length} lines`);
    }

    this.lines = newLines;
  }

  processFilter() {
    const lines = this.editor.getBuffer().getLines();

    this.lines = processLines({
      lines, data: this.validationData.data, row: 0, file: this.editor.getBuffer().getPath(),
    });
  }
}
