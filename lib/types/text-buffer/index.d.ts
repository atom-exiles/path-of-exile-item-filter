// Type definitions for text-buffer v10.2.16
// Project: https://github.com/atom/text-buffer/tree/v10.2.16
// Definitions by: GlenCFL <https://github.com/GlenCFL/>

// NOTE: these typings are currently incomplete. Missing chunks are being
//    written over time.

/// <reference path="../event-kit/index.d.ts" />
/// <reference path="../pathwatcher/index.d.ts" />

// API Documentation: https://atom.io/docs/api/v1.14.3/
//
// These definitions are written to ultimately be used within a global 'atom'
// module, with each of these submodules being a direct dependency of that
// parent module. As such, this module is not intended to be imported and used
// as a standalone NPM module.
//
// The following classes are importable directly off of the "atom" module:
//  - Point
//  - Range
//  - TextBuffer

export as namespace TextBuffer;
export = TextBuffer;

declare namespace TextBuffer {
  /** Objects that appear as parameters to callbacks, broken off for easy
   *  callback definition (both here and in user code). */
  namespace Params {
    interface MarkerChangeEvent {
      /** Point representing the former head position. */
      oldHeadPosition: Point

      /** Point representing the new head position. */
      newHeadPosition: Point

      /** Point representing the former tail position. */
      oldTailPosition: Point

      /** Point representing the new tail position. */
      newTailPosition: Point

      /** Boolean indicating whether the marker was valid before the change. */
      wasValid: boolean

      /** Boolean indicating whether the marker is now valid. */
      isValid: boolean

      /** Boolean indicating whether the marker had a tail before the change. */
      hadTail: boolean

      /** Boolean indicating whether the marker now has a tail. */
      hasTail: boolean

      /** Boolean indicating whether this change was caused by a textual
       *  change to the buffer or whether the marker was manipulated directly
       *  via its public API. */
      textChanged: boolean
    }

    interface BufferModifiedEvent {
      /** Range of the old text. */
      oldRange: Range,

      /** Range of the new text. */
      newRange: Range,

      /** String containing the text that was replaced. */
      oldText: string,

      /** String containing the text that was inserted. */
      newText: string
    }

    interface FileSaveEvent {
      /** The path to which the buffer was saved. */
      path: string
    }

    interface BufferWatchError {
      /** The error object. */
      error: Error,

      /** Call this function to indicate you have handled the error.
       *  The error will not be thrown if this function is called. */
      handle(): void;
    }
  }

  interface IPoint {
    row: number;
    column: number;
  }

  /** Represents a point in a buffer in row/column coordinates. */
  class Point implements IPoint {
    // Properties =============================================================
    /** A zero-indexed number representing the row of the Point. */
    row: number;
    /** A zero-indexed number representing the column of the Point. */
    column: number;

    // Construction ===========================================================
    /** Create a Point from an array containing two numbers representing the
     *  row and column. */
    static fromObject(object: [number, number]): Point;
    /** Create a Point from an existing object which implements IPoint. */
    static fromObject(object: IPoint, copy?: boolean): Point;

    /** Construct a Point object */
    constructor(row?: number, column?: number);

    /** Returns a new Point with the same row and column. */
    copy(): Point;

    /** Returns a new Point with the row and column negated. */
    negate(): Point;

    // Comparison =============================================================
    /** Returns the given Point that is earlier in the buffer. */
    static min(point1: IPoint, point2: IPoint): Point;
    /** Returns the given Point that is earlier in the buffer. */
    static min(point1: [number, number], point2: [number, number]): Point;
    /** Returns the given Point that is earlier in the buffer. */
    static min(point1: IPoint, point2: [number, number]): Point;
    /** Returns the given Point that is earlier in the buffer. */
    static min(point1: [number, number], point2: IPoint): Point;

    /** Compare another Point to this Point instance.
     *  Returns -1 if this point precedes the argument.
     *  Returns 0 if this point is equivalent to the argument.
     *  Returns 1 if this point follows the argument. */
    compare(other: IPoint): number;
    /** Compare another Point to this Point instance.
     *  Returns -1 if this point precedes the argument.
     *  Returns 0 if this point is equivalent to the argument.
     *  Returns 1 if this point follows the argument. */
    compare(other: [number, number]): number;

    /** Returns a boolean indicating whether this point has the same row and
     *  column as the given Point */
    isEqual(other: Range): boolean;
    /** Returns a boolean indicating whether this point has the same row and
     *  column as the given Point */
    isEqual(other: [number, number]): boolean;

    /** Returns a Boolean indicating whether this point precedes the given Point. */
    isLessThan(other: IPoint): boolean;
    /** Returns a Boolean indicating whether this point precedes the given Point. */
    isLessThan(other: [number, number]): boolean;

    /** Returns a Boolean indicating whether this point precedes or is equal to
     *  the given Point. */
    isLessThanOrEqual(other: IPoint): boolean;
    /** Returns a Boolean indicating whether this point precedes or is equal to
     *  the given Point. */
    isLessThanOrEqual(other: [number, number]): boolean;

    /** Returns a Boolean indicating whether this point follows the given Point. */
    isGreaterThan(other: IPoint): boolean;
    /** Returns a Boolean indicating whether this point follows the given Point. */
    isGreaterThan(other: [number, number]): boolean;

    /** Returns a Boolean indicating whether this point follows or is equal to
     *  the given Point. */
    isGreaterThanOrEqual(other: IPoint): boolean;
    /** Returns a Boolean indicating whether this point follows or is equal to
     *  the given Point. */
    isGreaterThanOrEqual(other: [number, number]): boolean;

    // Operations =============================================================
    /** Makes this point immutable and returns itself. */
    // TODO(glen): TypeScript 2.1.3 -> use Readonly<Point> here.
    freeze(): Point;

    /** Build and return a new point by adding the rows and columns of the
     *  given point. */
    translate(other: IPoint): Point;
    /** Build and return a new point by adding the rows and columns of the
     *  given point. */
    translate(other: [number, number]): Point;

    /** Build and return a new Point by traversing the rows and columns
     *  specified by the given point. */
    traverse(other: IPoint): Point;
    /** Build and return a new Point by traversing the rows and columns
     *  specified by the given point. */
    traverse(other: [number, number]): Point;

    /** Returns an array of this point's row and column. */
    toArray(): [number, number];

    /** Returns an array of this point's row and column. */
    serialize(): [number, number];

    /** Returns a string representation of the point. */
    toString(): string;
  }

  interface IRange {
    start: Point;
    end: Point;
  }

  /** Represents a region in a buffer in row/column coordinates. */
  class Range implements IRange {
    // Properties =============================================================
    /** A Point representing the start of the Range. */
    start: Point;
    /** A Point representing the end of the Range. */
    end: Point;

    // Construction ===========================================================
    /** Convert any range-compatible object to a Range. */
    static fromObject(object: IRange, copy?: boolean): Range
    /** Convert any range-compatible object to a Range. */
    static fromObject(object: [IPoint, IPoint]): Range;
    /** Convert any range-compatible object to a Range. */
    static fromObject(object: [IPoint, [number, number]]): Range;
    /** Convert any range-compatible object to a Range. */
    static fromObject(object: [[number, number], IPoint]): Range;

    /** Construct a Range object. */
    constructor(pointA?: IPoint, pointB?: IPoint);
    /** Construct a Range object. */
    constructor(pointA: [number, number], pointB?: [number, number]);
    /** Construct a Range object. */
    constructor(pointA: IPoint, pointB: [number, number]);
    /** Construct a Range object. */
    constructor(pointA: [number, number], pointB: IPoint);

    /** Returns a new range with the same start and end positions. */
    copy(): Range;

    /** Returns a new range with the start and end positions negated. */
    negate(): Range;

    // Serialization and Deserialization ======================================
    /** Call this with the result of Range::serialize to construct a new Range. */
    static deserialize(array: Object): Range;

    /** Returns a plain javascript object representation of the range. */
    serialize(): Array<Array<number>>;

    // Range Details ==========================================================
    /** Is the start position of this range equal to the end position? */
    isEmpty(): boolean;

    /** Returns a boolean indicating whether this range starts and ends on the
     *  same row. */
    isSingleLine(): boolean;

    /** Get the number of rows in this range. */
    getRowCount(): number;

    /** Returns an array of all rows in the range. */
    getRows(): Array<number>;

    // Operations =============================================================
    /** Freezes the range and its start and end point so it becomes immutable
     *  and returns itself. */
    // TODO(glen): TypeScript 2.1.3 -> use Readonly<Point> here.
    freeze(): Range;

    // This function doesn't actually take a range-compatible parameter.
    /** Returns a new range that contains this range and the given range. */
    union(other: IRange): Range;

    /** Build and return a new range by translating this range's start and end
     *  points by the given delta(s). */
    translate(startDelta: IPoint, endDelta?: IPoint): Range;
    /** Build and return a new range by translating this range's start and end
     *  points by the given delta(s). */
    translate(startDelta: [number, number], endDelta?: [number, number]): Range;
    /** Build and return a new range by translating this range's start and end
     *  points by the given delta(s). */
    translate(startDelta: IPoint, endDelta?: [number, number]): Range;
    /** Build and return a new range by translating this range's start and end
     *  points by the given delta(s). */
    translate(startDelta: [number, number], endDelta?: IPoint): Range;

    /** Build and return a new range by traversing this range's start and end
     *  points by the given delta. */
    traverse(delta: IPoint): Range;
    /** Build and return a new range by traversing this range's start and end
     *  points by the given delta. */
    traverse(delta: [number, number]): Range;

    // Comparison =============================================================
    /** Compare two Ranges.
     *  Returns -1 if this range starts before the argument or contains it.
     *  Returns 0 if this range is equivalent to the argument.
     *  Returns 1 if this range starts after the argument or is contained by it. */
    compare(otherRange: IRange): number;
    /** Compare two Ranges.
     *  Returns -1 if this range starts before the argument or contains it.
     *  Returns 0 if this range is equivalent to the argument.
     *  Returns 1 if this range starts after the argument or is contained by it. */
    compare(otherRange: [IPoint, IPoint]): number;
    /** Compare two Ranges.
     *  Returns -1 if this range starts before the argument or contains it.
     *  Returns 0 if this range is equivalent to the argument.
     *  Returns 1 if this range starts after the argument or is contained by it. */
    compare(otherRange: [[number, number], [number, number]]): number;
    /** Compare two Ranges.
     *  Returns -1 if this range starts before the argument or contains it.
     *  Returns 0 if this range is equivalent to the argument.
     *  Returns 1 if this range starts after the argument or is contained by it. */
    compare(otherRange: [IPoint, [number, number]]): number;
    /** Compare two Ranges.
     *  Returns -1 if this range starts before the argument or contains it.
     *  Returns 0 if this range is equivalent to the argument.
     *  Returns 1 if this range starts after the argument or is contained by it. */
    compare(otherRange: [[number, number], IPoint]): number;

    /** Returns a Boolean indicating whether this range has the same start and
     *  end points as the given Range. */
    isEqual(otherRange: IRange): boolean;
    /** Returns a Boolean indicating whether this range has the same start and
     *  end points as the given Range. */
    isEqual(otherRange: [IPoint, IPoint]): boolean;
    /** Returns a Boolean indicating whether this range has the same start and
     *  end points as the given Range. */
    isEqual(otherRange: [[number, number], [number, number]]): boolean;
    /** Returns a Boolean indicating whether this range has the same start and
     *  end points as the given Range. */
    isEqual(otherRange: [IPoint, [number, number]]): boolean;
    /** Returns a Boolean indicating whether this range has the same start and
     *  end points as the given Range. */
    isEqual(otherRange: [[number, number], IPoint]): boolean;

    // This function doesn't actually take a range-compatible parameter.
    /** Returns a Boolean indicating whether this range starts and ends on the
     *  same row as the argument. */
    coversSameRows(otherRange: IRange): boolean;

    // This function doesn't actually take a range-compatible parameter.
    /** Determines whether this range intersects with the argument. */
    intersectsWith(otherRange: IRange, exclusive?: boolean): boolean;

    /** Returns a boolean indicating whether this range contains the given range. */
    containsRange(otherRange: IRange, exclusive: boolean): boolean;
    /** Returns a boolean indicating whether this range contains the given range. */
    containsRange(otherRange: [IPoint, IPoint], exclusive: boolean): boolean;
    /** Returns a boolean indicating whether this range contains the given range. */
    containsRange(otherRange: [[number, number], [number, number]],
        exclusive: boolean): boolean;
    /** Returns a boolean indicating whether this range contains the given range. */
    containsRange(otherRange: [IPoint, [number, number]], exclusive: boolean):
        boolean;
    /** Returns a boolean indicating whether this range contains the given range. */
    containsRange(otherRange: [[number, number], IPoint], exclusive: boolean):
        boolean;

    /** Returns a boolean indicating whether this range contains the given point. */
    containsPoint(point: IPoint, exclusive: boolean): boolean;
    /** Returns a boolean indicating whether this range contains the given point. */
    containsPoint(point: [number, number], exclusive: boolean): boolean;

    /** Returns a boolean indicating whether this range intersects the given
     *  row number. */
    intersectsRow(row: number): boolean;

    /** Returns a boolean indicating whether this range intersects the row range
     *  indicated by the given startRow and endRow numbers. */
    intersectsRowRange(startRow: number, endRow: number): boolean;

    // Conversion =============================================================
    /** Returns a string representation of the range. */
    toString(): string;
  }

  /** Represents a buffer annotation that remains logically stationary even as
   *  the buffer changes. */
  class Marker {
    // Properties =============================================================
    tailed: boolean;
    reversed: boolean;
    valid: boolean;
    invalidate: string;

    // Lifecycle ==============================================================
    /** Creates and returns a new Marker with the same properties as this
     *  marker. */
    copy(options?: {
        tailed?: boolean,
        reversed?: boolean,
        invalidate?: "never"|"surround"|"overlap"|"inside"|"touch",
        exclusive?: boolean
      }): Marker;

    /** Destroys the marker, causing it to emit the "destroyed" event. */
    destroy(): void

    // Event Subscription =====================================================
    /** Invoke the given callback when the marker is destroyed. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the state of the marker changes. */
    onDidChange(callback: (event: Params.MarkerChangeEvent) => void):
        AtomEventKit.Disposable;

    // Marker Details =========================================================
    /** Returns the current range of the marker. The range is immutable. */
    getRange(): Range;

    /** Returns a point representing the marker's current head position. */
    getHeadPosition(): Point;

    /** Returns a point representing the marker's current tail position. */
    getTailPosition(): Point;

    /** Returns a point representing the start position of the marker, which
     *  could be the head or tail position, depending on its orientation. */
    getStartPosition(): Point;

    /** Returns a point representing the end position of the marker, which
     *  could be the head or tail position, depending on its orientation. */
    getEndPosition(): Point;

    /** Returns a boolean indicating whether the head precedes the tail. */
    isReversed(): boolean;

    /** Returns a boolean indicating whether the marker has a tail. */
    hasTail(): boolean;

    /** Is the marker valid? */
    isValid(): boolean;

    /** Is the marker destroyed? */
    isDestroyed(): boolean;

    /** Returns a boolean indicating whether changes that occur exactly at
     *  the marker's head or tail cause it to move. */
    isExclusive(): boolean;

    /** Get the invalidation strategy for this marker. */
    getInvalidationStrategy(): string;

    /** Returns a string representation of the marker. */
    toString(): string;

    // Mutating Markers =======================================================
    /** Sets the range of the marker.
     *  Returns a boolean indicating whether or not the marker was updated. */
    setRange(range: IRange, params?: {
        reversed?: boolean,
        exclusive?: boolean
      }): boolean;
    /** Sets the range of the marker.
     *  Returns a boolean indicating whether or not the marker was updated. */
    setRange(range: [IPoint, IPoint], params?: {
        reversed?: boolean,
        exclusive?: boolean
      }): boolean;
    /** Sets the range of the marker.
     *  Returns a boolean indicating whether or not the marker was updated. */
    setRange(range: [[number, number], [number, number]], params?: {
        reversed?: boolean,
        exclusive?: boolean
      }): boolean;
    /** Sets the range of the marker.
     *  Returns a boolean indicating whether or not the marker was updated. */
    setRange(range: [IPoint, [number, number]], params?: {
        reversed?: boolean,
        exclusive?: boolean
      }): boolean;
    /** Sets the range of the marker.
     *  Returns a boolean indicating whether or not the marker was updated. */
    setRange(range: [[number, number], IPoint], params?: {
        reversed?: boolean,
        exclusive?: boolean
      }): boolean;

    /** Sets the head position of the marker.
     *  Returns a boolean indicating whether or not the marker was updated. */
    setHeadPosition(position: IPoint): boolean;
    /** Sets the head position of the marker.
     *  Returns a boolean indicating whether or not the marker was updated. */
    setHeadPosition(position: [number, number]): boolean;

    /** Sets the tail position of the marker.
     *  Returns a boolean indicating whether or not the marker was updated. */
    setTailPosition(position: IPoint): boolean;
    /** Sets the tail position of the marker.
     *  Returns a boolean indicating whether or not the marker was updated. */
    setTailPosition(position: [number, number]): boolean;

    /** Removes the marker's tail.
     *  Returns a boolean indicating whether or not the marker was updated. */
    clearTail(): boolean;

    /** Plants the marker's tail at the current head position.
     *  Returns a boolean indicating whether or not the marker was updated. */
    plantTail(): boolean;

    // Comparison =============================================================
    /** Returns a boolean indicating whether this marker is equivalent to
     *  another marker, meaning they have the same range and options. */
    isEqual(other: Marker): boolean;

    /** Compares this marker to another based on their ranges.
     *  Returns "-1" if this marker precedes the argument.
     *  Returns "0" if this marker is equivalent to the argument.
     *  Returns "1" if this marker follows the argument. */
    compare(other: Marker): number;
  }

  /** Experimental: A container for a related set of markers. */
  class MarkerLayer {
    // Lifecycle ==============================================================
    /** Create a copy of this layer with markers in the same state and locations. */
    copy(): MarkerLayer;

    /** Destroy this layer. */
    destroy(): boolean;

    /** Determine whether this layer has been destroyed. */
    isDestroyed(): boolean;

    // Querying ===============================================================
    /** Get an existing marker by its id. */
    getMarker(id: number): Marker|undefined;

    /** Get all existing markers on the marker layer. */
    getMarkers(): Array<Marker>;

    /** Get the number of markers in the marker layer. */
    getMarkerCount(): number;

    /** Find markers in the layer conforming to the given parameters. */
    findMarkers(params: {
        startPosition?: IPoint|[number, number],
        endPosition?: IPoint|[number, number],
        containsPoint?: IPoint|[number, number],
        containsRange?: IRange|[IPoint, IPoint]|[[number, number], [number, number]]|
            [IPoint, [number, number]]|[[number, number], IPoint]
        startRow?: number,
        endRow?: number,
        intersectsRow?: number
      }): Array<Marker>;

    // Marker Creation ========================================================
    /** Create a marker with the given range. */
    markRange(range: IRange, options?: {
        reversed?: boolean,
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;
    /** Create a marker with the given range. */
    markRange(range: [IPoint, IPoint], options?: {
        reversed?: boolean,
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;
    /** Create a marker with the given range. */
    markRange(range: [[number, number], [number, number]], options?: {
        reversed?: boolean,
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;
    /** Create a marker with the given range. */
    markRange(range: [IPoint, [number, number]], options?: {
        reversed?: boolean,
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;
    /** Create a marker with the given range. */
    markRange(range: [[number, number], IPoint], options?: {
        reversed?: boolean,
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;

    /** Create a marker at with its head at the given position with no tail. */
    markPosition(position: IPoint, options?: {
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;
    /** Create a marker at with its head at the given position with no tail. */
    markPosition(position: [number, number], options?: {
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;

    // Event Subscription =====================================================
    /** Subscribe to be notified asynchronously whenever markers are created,
     *  updated, or destroyed on this layer. */
    onDidUpdate(callback: () => void): AtomEventKit.Disposable;

    /** Subscribe to be notified synchronously whenever markers are created on
     *  this layer. */
    onDidCreateMarker(callback: (marker: Marker) => void): AtomEventKit.Disposable;

    /** Subscribe to be notified synchronously when this layer is destroyed. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;
  }

  // NOTE(glen): this should be moved out into 'atom-patch'.
  class RegionIterator {
    // TODO(glen): implement and add tests.
  }

  // NOTE(glen): this should be moved out into 'atom-patch'.
  class ChangeIterator {
    // TODO(glen): implement and add tests.
  }

  // NOTE(glen): this should be moved out into 'atom-patch'.
  class Patch {
    // TODO(glen): add tests.
    splice(start: Point, oldExtent: Point, newExtent: Point, newText: string):
        void;
    clear(): void;
    regions(): RegionIterator;
    changes(): ChangeIterator;
    toInputPosition(outputPosition: Point): Point;
    toOutputPosition(inputPosition: Point): Point;
  }

  /** A mutable text container with undo/redo support and the ability to
   *  annotate logical regions in the text. */
  class TextBuffer {
    // Properties =============================================================
    file: PathWatcher.File;
    lines: Array<string>;
		lineEndings: Array<string>;
    stoppedChangingDelay: number;
    conflict: boolean;
    loaded: boolean;
    id: string;

    // Construction ===========================================================
    /** Create a new buffer with the given starting text. */
    constructor(text: string);
    /** Create a new buffer with the given params. */
    constructor(params?: {
        /** A boolean, true to asynchronously load the buffer from disk after initialization. */
        load?: boolean,
        /** The initial string text of the buffer. */
        text?: string
      });

    // Event Subscription =====================================================
    /** Invoke the given callback synchronously before the content of the buffer
     *  changes. */
    onWillChange(callback: (event: Params.BufferModifiedEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback synchronously when the content of the buffer
     *  changes. */
    onDidChange(callback: (event: Params.BufferModifiedEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback asynchronously following one or more changes after
     *  ::getStoppedChangingDelay milliseconds elapse without an additional change. */
    onDidStopChanging(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the in-memory contents of the buffer become
     *  in conflict with the contents of the file on disk. */
    onDidConflict(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback if the value of ::isModified changes. */
    onDidChangeModified(callback: (modified: boolean) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when all marker ::onDidChange observers have been
     *  notified following a change to the buffer. */
    onDidUpdateMarkers(callback: () => void): AtomEventKit.Disposable;

    onDidCreateMarker(callback: (marker: Marker) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when the value of ::getPath changes. */
    onDidChangePath(callback: (path: string) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the value of ::getEncoding changes. */
    onDidChangeEncoding(callback: (encoding: string) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback before the buffer is saved to disk. */
    onWillSave(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback after the buffer is saved to disk. */
    onDidSave(callback: (event: Params.FileSaveEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback after the file backing the buffer is deleted. */
    onDidDelete(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback before the buffer is reloaded from the contents
     *  of its file on disk. */
    onWillReload(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback after the buffer is reloaded from the contents
     *  of its file on disk. */
    onDidReload(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the buffer is destroyed. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when there is an error in watching the file. */
    onWillThrowWatchError(callback: (errorObject: Params.BufferWatchError) =>
        void): AtomEventKit.Disposable;

    /** Get the number of milliseconds that will elapse without a change before
     *  ::onDidStopChanging observers are invoked following a change. */
    getStoppedChangingDelay(): number;

    // File Details ===========================================================
    /** Determine if the in-memory contents of the buffer differ from its contents
     *  on disk.
     *  If the buffer is unsaved, always returns true unless the buffer is empty. */
    isModified(): boolean;

    /** Determine if the in-memory contents of the buffer conflict with the on-disk
     *  contents of its associated file. */
    isInConflict(): boolean;

    /** Get the path of the associated file. */
    getPath(): string;

    /** Set the path for the buffer's associated file. */
    setPath(filePath: string): void;

    /** Sets the character set encoding for this buffer. */
    setEncoding(encoding: string): void;

    /** Returns the string encoding of this buffer. */
    getEncoding(): string;

    /** Get the path of the associated file. */
    getUri(): string;

    // Reading Text ===========================================================
    /** Determine whether the buffer is empty. */
    isEmpty(): boolean;

    /** Get the entire text of the buffer. */
    getText(): string;

    /** Get the text in a range. */
    getTextInRange(range: IRange): string;
    /** Get the text in a range. */
    getTextInRange(range: [IPoint, IPoint]): string;
    /** Get the text in a range. */
    getTextInRange(range: [[number, number], [number, number]]): string;
    /** Get the text in a range. */
    getTextInRange(range: [IPoint, [number, number]]): string;
    /** Get the text in a range. */
    getTextInRange(range: [[number, number], IPoint]): string;

    /** Get the text of all lines in the buffer, without their line endings. */
    getLines(): Array<string>;

    /** Get the text of the last line of the buffer, without its line ending. */
    getLastLine(): string;

    /** Get the text of the line at the given row, without its line ending. */
    lineForRow(row: number): string|undefined;

    /** Get the line ending for the given 0-indexed row. */
    lineEndingForRow(row: number): string|undefined;

    /** Get the length of the line for the given 0-indexed row, without its line
     *  ending. */
    lineLengthForRow(row: number): number;

    /** Determine if the given row contains only whitespace. */
    isRowBlank(row: number): boolean;

    /** Given a row, find the first preceding row that's not blank.
     *  Returns a number or null if there's no preceding non-blank row. */
    previousNonBlankRow(startRow: number): number|null;

    /** Given a row, find the next row that's not blank.
     *  Returns a number or null if there's no next non-blank row. */
    nextNonBlankRow(startRow: number): number|null;

    // Mutating Text ==========================================================
    /** Replace the entire contents of the buffer with the given text. */
    setText(text: string): Range;

    /** Replace the current buffer contents by applying a diff based on the
     *  given text. */
    setTextViaDiff(text: string): void;

    /** Set the text in the given range. */
    setTextInRange(range: IRange, text: string, options?: {
        normalizeLineEndings?: boolean,
        undo?: 'skip'
      }): Range;
    /** Set the text in the given range. */
    setTextInRange(range: [IPoint, IPoint], text: string, options?: {
        normalizeLineEndings?: boolean,
        undo?: 'skip'
      }): Range;
    /** Set the text in the given range. */
    setTextInRange(range: [[number, number], [number, number]], text: string, options?: {
        normalizeLineEndings?: boolean,
        undo?: 'skip'
      }): Range;
    /** Set the text in the given range. */
    setTextInRange(range: [IPoint, [number, number]], text: string, options?: {
        normalizeLineEndings?: boolean,
        undo?: 'skip'
      }):
        Range;
    /** Set the text in the given range. */
    setTextInRange(range: [[number, number], IPoint], text: string, options?: {
        normalizeLineEndings?: boolean,
        undo?: 'skip'
      }): Range;

    /** Insert text at the given position. */
    insert(position: IPoint, text: string, options?: {
        normalizeLineEndings?: boolean,
        undo?: 'skip'
      }): Range;
    /** Insert text at the given position. */
    insert(position: [number, number], text: string, options?: {
        normalizeLineEndings?: boolean,
        undo?: 'skip'
      }): Range;

    /** Append text to the end of the buffer. */
    append(text: string, options?: {
        normalizeLineEndings?: boolean,
        undo?: 'skip'
      }): Range;

    /** Delete the text in the given range. */
    delete(range: IRange): Range;
    /** Delete the text in the given range. */
    delete(range: [IPoint, IPoint]): Range;
    /** Delete the text in the given range. */
    delete(range: [[number, number], [number, number]]): Range;
    /** Delete the text in the given range. */
    delete(range: [IPoint, [number, number]]): Range;
    /** Delete the text in the given range. */
    delete(range: [[number, number], IPoint]): Range;

    /** Delete the line associated with a specified row. */
    deleteRow(row: number): Range;

    /** Delete the lines associated with the specified row range. */
    deleteRows(startRow: number, endRow: number): Range;

    // Markers ================================================================
    /** Create a layer to contain a set of related markers. */
    addMarkerLayer(options: {
        maintainHistory?: boolean,
        persistent?: boolean
      }): MarkerLayer;

    /** Get a MarkerLayer by id.
     *  Returns a MarkerLayer or `` if no layer exists with the given id. */
    getMarkerLayer(id: string): MarkerLayer|undefined;

    /** Get the default MarkerLayer. */
    getDefaultMarkerLayer(): MarkerLayer

    /** Create a marker with the given range in the default marker layer. */
    markRange(range: IRange, properties: {
        reversed?: boolean,
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;
    /** Create a marker with the given range in the default marker layer. */
    markRange(range: [IPoint, IPoint], properties: {
        reversed?: boolean,
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;
    /** Create a marker with the given range in the default marker layer. */
    markRange(range: [[number, number], [number, number]], properties: {
        reversed?: boolean,
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;
    /** Create a marker with the given range in the default marker layer. */
    markRange(range: [IPoint, [number, number]], properties: {
        reversed?: boolean,
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;
    /** Create a marker with the given range in the default marker layer. */
    markRange(range: [[number, number], IPoint], properties: {
        reversed?: boolean,
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;

    /** Create a marker at the given position with no tail in the default marker layer. */
    markPosition(position: IPoint, options?: {
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;
    /** Create a marker at the given position with no tail in the default marker layer. */
    markPosition(position: [number, number], options?: {
        invalidate?: 'never'|'surround'|'overlap'|'inside'|'touch',
        exclusive?: boolean
      }): Marker;

    /** Get all existing markers on the default marker layer. */
    getMarkers(): Array<Marker>;

    /** Get an existing marker by its id from the default marker layer. */
    getMarker(id: number): Marker;

    /** Find markers conforming to the given parameters in the default marker layer. */
    findMarkers(params: {
        startPosition?: IPoint|[number, number],
        endPosition?: IPoint|[number, number],
        containsPoint?: IPoint|[number, number],
        containsRange?: IRange | [IPoint, IPoint] | [[number, number], [number, number]] |
            [IPoint, [number, number]] | [[number, number], IPoint]
        startRow?: number,
        endRow?: number,
        intersectsRow?: number
      }): Array<Marker>;

    /** Get the number of markers in the default marker layer. */
    getMarkerCount(): number;

    // History ================================================================
    /** Undo the last operation. If a transaction is in progress, aborts it. */
    undo(): boolean;

    /** Redo the last operation. */
    redo(): boolean;

    /** Batch multiple operations as a single undo/redo step. */
    transact<T>(groupingInterval: number, fn: () => T): T;
    transact<T>(fn: () => T): T;

    /** Call within a transaction to terminate the function's execution and
     *  revert any changes performed up to the abortion. */
    abortTransaction(): void;

    /** Clear the undo stack. When calling this method within a transaction,
     *  the ::onDidChangeText event will not be triggered because the information
     *  describing the changes is lost. */
    clearUndoStack(): void;

    /** Create a pointer to the current state of the buffer for use with
     *  ::revertToCheckpoint and ::groupChangesSinceCheckpoint. */
    createCheckpoint(): number;

    /** Revert the buffer to the state it was in when the given checkpoint was created.
     *  Returns a boolean indicating whether the operation succeeded. */
    revertToCheckpoint(checkpoint: number): boolean;

    /** Group all changes since the given checkpoint into a single transaction for
     *  purposes of undo/redo.
     *  Returns a boolean indicating whether the operation succeeded. */
    groupChangesSinceCheckpoint(checkpoint: number): Patch|boolean;

    /** Returns a list of changes since the given checkpoint.
     *  If the given checkpoint is no longer present in the undo history, this method
     *  will return an empty Array. */
    getChangesSinceCheckpoint(checkpoint: number): Array<{
        /** A Point representing where the change started. */
        start: Point,

        /** A Point representing the replaced extent. */
        oldExtent: Point,

        /** A Point representing the replacement extent. */
        newExtent: Point,

        /** A String representing the replacement text. */
        newText: string
      }>;

    // Search and Replace =====================================================
    /** Scan regular expression matches in the entire buffer, calling the given
     *  iterator function on each match. */
    scan(regex: RegExp, iterator: (match: Object, matchText: string, range: Range,
        stop: Function, replace: Function) => void): void;

    /** Scan regular expression matches in the entire buffer in reverse order,
     *  calling the given iterator function on each match. */
    backwardsScan(regex: RegExp, iterator: (match: Object, matchText: string,
        range: Range, stop: Function, replace: Function) => void): void;

    /** Scan regular expression matches in a given range , calling the given
     *  iterator function on each match. */
    scanInRange(regex: RegExp, range: IRange, iterator: (match: Object,
        matchText: string, range: Range, stop: Function, replace: Function) =>
        void): void;
    /** Scan regular expression matches in a given range , calling the given
     *  iterator function on each match. */
    scanInRange(regex: RegExp, range: [IPoint, IPoint], iterator: (match: Object,
        matchText: string, range: Range, stop: Function, replace: Function) =>
        void): void;
    /** Scan regular expression matches in a given range , calling the given
     *  iterator function on each match. */
    scanInRange(regex: RegExp, range: [[number, number], [number, number]],
        iterator: (match: Object, matchText: string, range: Range, stop: Function,
        replace: Function) => void): void;
    /** Scan regular expression matches in a given range , calling the given
     *  iterator function on each match. */
    scanInRange(regex: RegExp, range: [IRange, [number, number]], iterator:
        (match: Object, matchText: string, range: Range, stop: Function,
        replace: Function) => void): void;
    /** Scan regular expression matches in a given range , calling the given
     *  iterator function on each match. */
    scanInRange(regex: RegExp, range: [[number, number], IRange], iterator:
        (match: Object, matchText: string, range: Range, stop: Function,
        replace: Function) => void): void;

    /** Scan regular expression matches in a given range in reverse order,
     *  calling the given iterator function on each match. */
    backwardsScanInRange(regex: RegExp, range: IRange, iterator: (match: Object,
       matchText: string, range: Range, stop: Function, replace: Function) =>
       void): void;
    /** Scan regular expression matches in a given range in reverse order,
     *  calling the given iterator function on each match. */
    backwardsScanInRange(regex: RegExp, range: [IPoint, IPoint], iterator: (match: Object,
       matchText: string, range: Range, stop: Function, replace: Function) =>
       void): void;
    /** Scan regular expression matches in a given range in reverse order,
     *  calling the given iterator function on each match. */
    backwardsScanInRange(regex: RegExp, range: [[number, number], [number, number]],
       iterator: (match: Object, matchText: string, range: Range, stop: Function,
       replace: Function) => void): void;
    /** Scan regular expression matches in a given range in reverse order,
     *  calling the given iterator function on each match. */
    backwardsScanInRange(regex: RegExp, range: [IRange, [number, number]], iterator:
       (match: Object, matchText: string, range: Range, stop: Function,
       replace: Function) => void): void;
    /** Scan regular expression matches in a given range in reverse order,
     *  calling the given iterator function on each match. */
    backwardsScanInRange(regex: RegExp, range: [[number, number], IRange], iterator:
       (match: Object, matchText: string, range: Range, stop: Function,
       replace: Function) => void): void;

    /** Replace all regular expression matches in the entire buffer. */
    replace(regex: RegExp, replacementText: string): number;

    // Buffer Range Details ===================================================
    /** Get the range spanning from [0, 0] to ::getEndPosition. */
    getRange(): Range;

    /** Get the number of lines in the buffer. */
    getLineCount(): number;

    /** Get the last 0-indexed row in the buffer. */
    getLastRow(): number;

    /** Get the first position in the buffer, which is always [0, 0]. */
    getFirstPosition(): Point;

    /** Get the maximal position in the buffer, where new text would be appended. */
    getEndPosition(): Point;

    /** Get the length of the buffer in characters. */
    getMaxCharacterIndex(): number;

    /** Get the range for the given row. */
    rangeForRow(row: number, includeNewline: boolean): Range;

    /** Convert a position in the buffer in row/column coordinates to an absolute
     *  character offset, inclusive of line ending characters. */
    characterIndexForPosition(position: Point): number;
    /** Convert a position in the buffer in row/column coordinates to an absolute
     *  character offset, inclusive of line ending characters. */
    characterIndexForPosition(position: [number, number]): number;

    /** Convert an absolute character offset, inclusive of newlines, to a position
     *  in the buffer in row/column coordinates. */
    positionForCharacterIndex(offset: number): Point;

    /** Clip the given range so it starts and ends at valid positions. */
    clipRange(range: IRange): Range;
    /** Clip the given range so it starts and ends at valid positions. */
    clipRange(range: [IPoint, IPoint]): Range;
    /** Clip the given range so it starts and ends at valid positions. */
    clipRange(range: [[number, number], [number, number]]): Range;
    /** Clip the given range so it starts and ends at valid positions. */
    clipRange(range: [IPoint, [number, number]]): Range;
    /** Clip the given range so it starts and ends at valid positions. */
    clipRange(range: [[number, number], [IPoint]]): Range;

    /** Clip the given point so it is at a valid position in the buffer. */
    clipPosition(position: IPoint): Point;
    /** Clip the given point so it is at a valid position in the buffer. */
    clipPosition(position: [number, number]): Point;

    // Buffer Operations ======================================================
    /** Save the buffer. */
    save(): void;

    /** Save the buffer at a specific path. */
    saveAs(filePath: string): void;

    /** Reload the buffer's contents from disk. */
    reload(): void;
  }
}
