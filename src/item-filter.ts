import * as assert from "assert";
import { RangeLike, TextEditor } from "atom";
import * as _ from "lodash";

import { BufferChange } from "./filter-manager";
import { processLines, ValidationMessages } from "./filter-processor";
import { ValidationData } from "./validation-data";

export type Range = RangeLike;

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

  update(changes: BufferChange[]) {
    assert(changes.length > 0, "update called with no changes");
    const lines = this.editor.getBuffer().getLines();
    const filterData = this.lines;

    let result: Line[] = [];
    let shift = 0;
    let currentIndex = 0;

    for (const change of changes) {
      if (change.start !== currentIndex) {
        const upperPartition = filterData.slice(currentIndex, change.start);
        if (shift !== 0) shiftLineRanges(upperPartition, shift);
        result = result.concat(upperPartition);
        currentIndex += upperPartition.length;
      }

      const changedLines = lines.slice(currentIndex, currentIndex + change.newExtent + 1);
      const processedLines = processLines({
        lines: changedLines,
        data: this.validationData.data,
        row: change.start,
        file: this.editor.getBuffer().getPath(),
      });

      result = result.concat(processedLines);
      currentIndex += processedLines.length;

      shift += change.newExtent - change.oldExtent;
    }

    const lastChange = <BufferChange> _.last(changes);
    const sliceIndex = lastChange.start + lastChange.oldExtent + 1;
    const slice = filterData.splice(sliceIndex);
    if (shift !== 0) shiftLineRanges(slice, shift);
    result = result.concat(slice);

    // We should have line data for every line within the editor.
    assert(result.length === lines.length,
        `output size mismatch (${result.length} vs ${lines.length})`);
    this.lines = result;
  }

  processFilter() {
    const lines = this.editor.getBuffer().getLines();

    this.lines = processLines({
      lines, data: this.validationData.data, row: 0, file: this.editor.getBuffer().getPath(),
    });
  }
}
