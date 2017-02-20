// Type definitions for Atom v1.12.6
// Project: https://github.com/atom/atom/tree/v1.12.6
// Definitions by: GlenCFL <https://github.com/GlenCFL/>

// NOTE: these typings contain only what is used by the packages that I maintain
//    due to the size of the Atom API.

/// <reference types="node" />
/// <reference path="../text-buffer/index.d.ts" />
/// <reference path="../event-kit/index.d.ts" />

// API Documentation: https://atom.io/docs/api/v1.12.6/
//
// The goal of these type definitions is to provide full coverage of the public
// Atom API. These definitions are not exhaustive, and aim to only define class
// methods, member functions, and properties mentioned in the above
// documentation. Extra properties for some classes are provided for
// convenience, though it is still recommended that you use the appropriate
// get/set functions for each property, as these are under the API's contract
// and are unlikely to change.

declare namespace AtomCore {
  /** Objects that appear as parameters to callbacks, broken off for easy
   *  callback definition (both here and in user code). */
  namespace CallbackArgs {
    interface KMMatchedBinding {
      keystrokes: string,
      binding: KeyBinding,
      keyboardEventTarget: Element
    }

    interface KMPartiallyMatchBinds {
      keystrokes: string,
      partiallyMatchedBindings: Array<KeyBinding>,
      keyboardEventTarget: Element
    }

    interface KMFailedMatchBinding {
      keystrokes: string,
      keyboardEventTarget: Element
    }

    interface KMFileReadFailure {
      message: string,
      stack: string
    }

    interface SMHTMLStyleElement extends HTMLStyleElement {
      sourcePath: string;
      context: string;
    }

    interface WSPaneEvent {
      pane: Pane
    }

    interface WSPaneItemEvent {
      item: Object,
      pane: Pane,
      index: number
    }

    interface WSPaneItemOpenEvent extends WSPaneItemEvent {
      uri: string,
    }

    interface WSTextEditorEvent {
      textEditor: TextEditor,
      pane: Pane,
      index: number
    }

    interface AEThrownError {
      originalError: Error,
      message: string,
      url: string,
      line: number,
      column: number
    }

    interface AEPreventableThrownError extends AEThrownError {
      preventDefault: () => void
    }

    interface GRChangeEvent {
      path: string,
      /** This value can be passed to ::isStatusModified or ::isStatusNew to get more
       *  information. */
      pathStatus: number
    }

    interface PaneItemListEvent {
      /** The pane item that was added or removed. */
      item: Object,
      /** A number indicating where the item is located. */
      index: number
    }

    interface PaneItemMoveEvent {
      /** The removed pane item. */
      item: Object,
      /** A number indicating where the item was located. */
      oldIndex: number,
      /** A number indicating where the item is now located. */
      newIndex: number
    }

    interface TEDidChange {
      /** A Point representing where the change started. */
      start: TextBuffer.Point,

      /** A Point representing the replaced extent. */
      oldExtent: TextBuffer.Point,

      /** A Point representing the replacement extent. */
      newExtent: TextBuffer.Point,

      /** A String representing the replacement text. */
      newText: string
    }

    interface TEStoppedChangesEvent  {
      changes: Array<TEDidChange>
    }
  }

  // Base Classes =============================================================
  /** Wraps an Array of Strings. The Array describes a path from the root of the
   *  syntax tree to a token including all scope names for the entire path. */
  class ScopeDescriptor {
    scopes: Array<string>

    constructor(object: { scopes: Array<string> })

    /** Returns all scopes for this descriptor. */
    getScopesArray(): Array<string>
  }

  class KeyBinding {
    // Properties =============================================================
    keystrokeArray: string[];
    keystrokeCount: number;
    selector: string;

    // Comparison =============================================================
    /** Determines whether the given keystroke matches any contained within this binding. */
    matches(keystroke: string): boolean;

    /** Compare another KeyBinding to this instance.
     *  Returns <= -1 if the argument is considered lesser or of lower priority.
     *  Returns 0 if this binding is equivalent to the argument.
     *  Returns >= 1 if the argument is considered greater or of higher priority. */
    compare(other: KeyBinding): number;
  }

  /** A notification to the user containing a message and type. */
  class Notification {
    // Properties =============================================================
    dismissed: boolean;
    displayed: boolean;
    timestamp: Date;

    // Event Subscription =====================================================
    /** Invoke the given callback when the notification is dismissed. */
    onDidDismiss(callback: (notification: Notification) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when the notification is displayed. */
    onDidDisplay(callback: (notification: Notification) => void):
        AtomEventKit.Disposable;

    // Methods ================================================================
    /** Returns the Notification's type. */
    getType(): string;

    /** Returns the Notification's message. */
    getMessage(): string;

    /** Dismisses the notification, removing it from the UI. Calling this
     *  programmatically will call all callbacks added via onDidDismiss. */
    dismiss(): void;
  }

  /** Represents the underlying git operations performed by Atom. */
  class GitRepository {
    // Construction and Destruction ===========================================
    /** Creates a new GitRepository instance. */
    static open(path: string, options?: { refreshOnWindowFocus: boolean }):
        GitRepository;

    /** Destroy this GitRepository object. */
    destroy(): void;

    /** Returns a boolean indicating if this repository has been destroyed. */
    isDestroyed(): boolean;

    // Event Subscription =====================================================
    /** Invoke the given callback when a specific file's status has changed. When
     *  a file is updated, reloaded, etc, and the status changes, this will be fired. */
    onDidChangeStatus(callback: (event: CallbackArgs.GRChangeEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a multiple files' statuses have changed. */
    onDidChangeStatuses(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when this GitRepository's destroy() method is
     *  invoked. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;

    // Repository Details =====================================================
    /** A string indicating the type of version control system used by this repository. */
    getType(): "git";

    /** Returns the string path of the repository. */
    getPath(): string;

    /** Returns the string working directory path of the repository. */
    getWorkingDirectory(): string;

    /** Returns true if at the root, false if in a subfolder of the repository. */
    isProjectAtRoot(): boolean;

    /** Makes a path relative to the repository's working directory. */
    relativize(): string;

    /** Returns true if the given branch exists. */
    hasBranch(branch: string): boolean;

    /** Retrieves a shortened version of the HEAD reference value. */
    getShortHead(path?: string): string;

    /** Is the given path a submodule in the repository? */
    isSubmodule(path: string): boolean;

    /** Returns the number of commits behind the current branch is from the its
     *  upstream remote branch. The default reference is the HEAD. */
    getAheadBehindCount(path?: string):
        { ahead: number, behind: number};
    /** Returns the number of commits behind the current branch is from the its
     *  upstream remote branch. The default reference is the HEAD. */
    getAheadBehindCount(reference: string, path?: string):
        { ahead: number, behind: number};

    /** Get the cached ahead/behind commit counts for the current branch's
     *  upstream branch. */
    getCachedUpstreamAheadBehindCount(path?: string):
        { ahead: number, behind: number };

    /** Returns the git configuration value specified by the key. */
    getConfigValue(key: string, path?: string): string;

    /** Returns the origin url of the repository. */
    getOriginURL(path?: string): string;

    /** Returns the upstream branch for the current HEAD, or null if there is no
     *  upstream branch for the current HEAD. */
    getUpstreamBranch(path?: string): string|null;

    /** Gets all the local and remote references. */
    getReferences(path?: string): { heads: Array<string>, remotes: Array<string>,
        tags: Array<string> }

    /** Returns the current string SHA for the given reference. */
    getReferenceTarget(reference: string, path?: string): string;

    // Reading Status =========================================================
    /** Returns true if the given path is modified. */
    isPathModified(path: string): boolean;

    /** Returns true if the given path is new. */
    isPathNew(path: string): boolean;

    /** Is the given path ignored? */
    isPathIgnored(path: string): boolean;

    /** Get the status of a directory in the repository's working directory. */
    getDirectoryStatus(path: string): number;

    /** Get the status of a single path in the repository. */
    getPathStatus(path: string): number;

    /** Get the cached status for the given path. */
    getCachedPathStatus(path: string): number|null;

    /** Returns true if the given status indicates modification. */
    isStatusModified(status: number): boolean;

    /** Returns true if the given status indicates a new path. */
    isStatusNew(status: number): boolean;

    // Retrieving Diffs =======================================================
    /** Retrieves the number of lines added and removed to a path.
     *  This compares the working directory contents of the path to the HEAD version. */
    getDiffStats(path: string): { added: number, deleted: number };

    /** Retrieves the line diffs comparing the HEAD version of the given path
     *  and the given text. */
    getLineDiffs(path: string, text: string): Array<{ oldStart: number,
        newStart: number, oldLines: number, newLines: number }>;

    // Checking Out ===========================================================
    /** Restore the contents of a path in the working directory and index to the
     *  version at HEAD. */
    checkoutHead(path: string): boolean;

    /** Checks out a branch in your repository. */
    checkoutReference(reference: string, create: boolean): boolean;
  }

  /** Grammar that tokenizes lines of text. */
  class Grammar {
    // Event Subscription =====================================================
    /** Invoke the given callback when this grammar is updated due to a grammar
     *  it depends on being added or removed from the registry. */
    onDidUpdate(callback: () => void): AtomEventKit.Disposable;

    // Tokenizing =============================================================
    /** Tokenize all lines in the given text. */
    tokenizeLines(text: string): Array<Array<{ value: string, scopes: string}>>;

    /** Tokenize the line of text. */
    tokenizeLine(line: string, firstLine?: boolean): { line: string,
        tags: Array<number|string>, tokens: Array<{ value: string, scopes: string}>,
        ruleStack: Array<Object> }
    /** Tokenize the line of text. */
    tokenizeLine(line: string, ruleStack: Array<Object>, firstLine?: boolean): {
        line: string, tags: Array<number|string>, tokens: Array<{ value: string,
        scopes: string}>, ruleStack: Array<Object> }
  }

  /** Loads and activates a package's main module and resources such as stylesheets,
   *  keymaps, grammar, editor properties, and menus. */
  class Package {
    // Event Subscription =====================================================
    /** Invoke the given callback when all packages have been activated. */
    onDidDeactivate(callback: () => void): AtomEventKit.Disposable;

    // Native Module Compatibility ============================================
    /** Are all native modules depended on by this package correctly compiled
     *  against the current version of Atom? */
    isCompatible(): boolean;

    /** Rebuild native modules in this package's dependencies for the current
     *  version of Atom. */
    // TODO(glen): determine the types for stdout and stderr here.
    rebuild(): Promise<{ code: number, stdout: Object, stderr: Object }>;

    /** If a previous rebuild failed, get the contents of stderr. */
    getBuildFailureOutput(): string|null;
  }

  /** A container for presenting content in the center of the workspace. */
  class Pane {
    // Event Subscription =====================================================
    /** Invoke the given callback when the pane resizes. */
    onDidChangeFlexScale(callback: (flexScale: number) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback with the current and future values of ::getFlexScale. */
    observeFlexScale(callback: (flexScale: number) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when the pane is activated. */
    onDidActivate(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback before the pane is destroyed. */
    onWillDestroy(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the pane is destroyed. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the value of the ::isActive property changes. */
    onDidChangeActive(callback: (active: boolean) => void): AtomEventKit.Disposable;

    /** Invoke the given callback with the current and future values of the ::isActive
     *  property. */
    observeActive(callback: (active: boolean) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when an item is added to the pane. */
    onDidAddItem(callback: (event: CallbackArgs.PaneItemListEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when an item is removed from the pane. */
    onDidRemoveItem(callback: (event: CallbackArgs.PaneItemListEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback before an item is removed from the pane. */
    onWillRemoveItem(callback: (event: CallbackArgs.PaneItemListEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when an item is moved within the pane. */
    onDidMoveItem(callback: (event: CallbackArgs.PaneItemMoveEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback with all current and future items. */
    observeItems(callback: (item: Object) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the value of ::getActiveItem changes. */
    onDidChangeActiveItem(callback: (activeItem: Object) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback with the current and future values of ::getActiveItem. */
    observeActiveItem(callback: (activeItem: Object) => void): AtomEventKit.Disposable;

    /** Invoke the given callback before items are destroyed. */
    onWillDestroyItem(callback: (event: CallbackArgs.PaneItemListEvent) => void):
        AtomEventKit.Disposable;

    // Items ==================================================================
    // TODO(glen): figure out the common interface for these items
    /** Get the items in this pane. */
    getItems(): Array<Object>;

    /** Get the active pane item in this pane. */
    getActiveItem(): Object;

    /** Return the item at the given index. */
    itemAtIndex(index: number): Object|null;

    /** Makes the next item active. */
    activateNextItem(): void;

    /** Makes the previous item active. */
    activatePreviousItem(): void;

    /** Move the active tab to the right. */
    moveItemRight(): void;

    /** Move the active tab to the left. */
    moveItemLeft(): void;

    /** Get the index of the active item. */
    getActiveItemIndex(): number;

    /** Activate the item at the given index. */
    activateItemAtIndex(index: number): void;

    /** Make the given item active, causing it to be displayed by the pane's view. */
    activateItem(options?: { pending: boolean }): void;

    /** Add the given item to the pane. */
    addItem(item: Object, options?: { index?: number, pending?: boolean }): Object;

    /** Add the given items to the pane. */
    addItems(items: Array<Object>, index?: number): Array<Object>;

    /** Move the given item to the given index. */
    moveItem(item: Object, index: number): void;

    /** Move the given item to the given index on another pane. */
    moveItemToPane(item: Object, pane: Pane, index: number): void;

    /** Destroy the active item and activate the next item. */
    destroyActiveItem(): void;

    /** Destroy the given item. */
    destroyItem(item: Object): void;

    /** Destroy all items. */
    destroyItems(): void;

    /** Destroy all items except for the active item. */
    destroyInactiveItems(): void;

    /** Save the active item. */
    saveActiveItem(): void;

    /** Prompt the user for a location and save the active item with the path
     *  they select. */
    saveActiveItemAs<T>(nextAction?: (error?: Error) => T): T|undefined;

    /** Save the given item. */
    saveItem<T>(item: Object, nextAction?: (error?: Error) => T): T|undefined;

    /** Prompt the user for a location and save the active item with the path
     *  they select. */
    saveItemAs<T>(item: Object, nextAction?: (error?: Error) => T): T|undefined;

    /** Save all items. */
    saveItems(): void;

    /** Return the first item that matches the given URI or undefined if none exists. */
    itemForURI(uri: string): Object|undefined;

    /** Activate the first item that matches the given URI. */
    activateItemForURI(uri: string): boolean;

    // Lifecycle ==============================================================
    /** Determine whether the pane is active. */
    isActive(): boolean;

    /** Makes this pane the active pane, causing it to gain focus. */
    activate(): void;

    /** Close the pane and destroy all its items. */
    destroy(): void;

    // Splitting ==============================================================
    /** Create a new pane to the left of this pane. */
    splitLeft(params?: { items?: Object, copyActiveItem?: boolean }): Pane;

    /** Create a new pane to the right of this pane. */
    splitRight(params?: { items?: Object, copyActiveItem?: boolean }): Pane;

    /** Creates a new pane above the receiver. */
    splitUp(params?: { items?: Object, copyActiveItem?: boolean }): Pane;

    /** Creates a new pane below the receiver. */
    splitDown(params?: { items?: Object, copyActiveItem?: boolean }): Pane;
  }

  /** A container representing a panel on the edges of the editor window. You
   *  should not create a Panel directly, instead use Workspace::addTopPanel and
   *  friends to add panels. */
  class Panel {
    // Construction and Destruction
    /** Destroy and remove this panel from the UI. */
    destroy(): void;

    // Event Subscription
    /** Invoke the given callback when the pane hidden or shown. */
    onDidChangeVisible(callback: (visible: boolean) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the pane is destroyed. */
    onDidDestroy(callback: (panel: Panel) => void): AtomEventKit.Disposable;

    // Panel Details
    /** Returns the panel's item. */
    getItem(): Object;

    /** Returns a number indicating this panel's priority. */
    getPriority(): number;

    /** Returns a boolean true when the panel is visible. */
    isVisible(): boolean;

    /** Hide this panel. */
    hide(): void;

    /** Show this panel. */
    show(): void;
  }

  /** This class represents all essential editing state for a single TextBuffer,
   *  including cursor and selection positions, folds, and soft wraps. */
  class TextEditor {
    buffer: TextBuffer.TextBuffer;

    // Event Subscription =====================================================
    /** Calls your callback when the buffer's title has changed. */
    onDidChangeTitle(callback: (title: string) => void): AtomEventKit.Disposable;

    /** Calls your callback when the buffer's path, and therefore title, has changed. */
    onDidChangePath(callback: (path: string) => void): AtomEventKit.Disposable;

    /** Invoke the given callback synchronously when the content of the buffer
     *  changes. */
    onDidChange(callback: (event: Array<CallbackArgs.TEDidChange>) => void):
        AtomEventKit.Disposable;

    /** Invoke callback when the buffer's contents change. It is emit
     *  asynchronously 300ms after the last buffer change. This is a good place
     *  to handle changes to the buffer without compromising typing performance. */
    onDidStopChanging(callback: (event: CallbackArgs.TEStoppedChangesEvent) => void):
        AtomEventKit.Disposable;

    // onDidChangeCursorPosition(callback): AtomEventKit.Disposable;
    // onDidChangeSelectionRange(callback): AtomEventKit.Disposable;
    // onDidSave(callback): AtomEventKit.Disposable;
    // onDidDestroy(callback): AtomEventKit.Disposable;
    // getBuffer(): AtomEventKit.Disposable;
    // observeGutters(callback): AtomEventKit.Disposable;
    // onDidAddGutter(callback): AtomEventKit.Disposable;
    // onDidRemoveGutter(callback): AtomEventKit.Disposable;
    // onDidChangeSoftWrapped(callback): AtomEventKit.Disposable;
    // onDidChangeEncoding(callback): AtomEventKit.Disposable;
    // observeGrammar(callback): AtomEventKit.Disposable;
    // onDidChangeGrammar(callback): AtomEventKit.Disposable;
    // onDidChangeModified(callback): AtomEventKit.Disposable;
    // onDidConflict(callback): AtomEventKit.Disposable;
    // onWillInsertText(callback): AtomEventKit.Disposable;
    // onDidInsertText(callback): AtomEventKit.Disposable;
    // observeCursors(callback): AtomEventKit.Disposable;
    // onDidAddCursor(callback): AtomEventKit.Disposable;
    // onDidRemoveCursor(callback): AtomEventKit.Disposable;
    // observeSelections(callback): AtomEventKit.Disposable;
    // onDidAddSelection(callback): AtomEventKit.Disposable;
    // onDidRemoveSelection(callback): AtomEventKit.Disposable;
    // observeDecorations(callback): AtomEventKit.Disposable;
    // onDidAddDecoration(callback): AtomEventKit.Disposable;
    // onDidRemoveDecoration(callback): AtomEventKit.Disposable;
    // onDidChangePlaceholderText(callback): AtomEventKit.Disposable;

    // File Details ===========================================================
    // getTitle()
    // getLongTitle()
    // getPath()
    // isModified()
    // isEmpty()
    // getEncoding()
    // setEncoding(encoding)

    // File Operations ========================================================
    // save()
    // saveAs(filePath)

    // Reading Text ===========================================================
    /** Returns a string representing the entire contents of the editor. */
    getText(): string;

    /** Get the text in the given range in buffer coordinates. */
    getTextInBufferRange(range: TextBuffer.IRange): string;
    /** Get the text in the given range in buffer coordinates. */
    getTextInBufferRange(range: [TextBuffer.IPoint, TextBuffer.IPoint]): string;
    /** Get the text in the given range in buffer coordinates. */
    getTextInBufferRange(range: [[number, number], [number, number]]): string;
    /** Get the text in the given range in buffer coordinates. */
    getTextInBufferRange(range: [TextBuffer.IPoint, [number, number]]): string;
    /** Get the text in the given range in buffer coordinates. */
    getTextInBufferRange(range: [[number, number], TextBuffer.IPoint]): string;

    /** Returns a number representing the number of lines in the buffer. */
    getLineCount(): number;

    /** Returns a number representing the number of screen lines in the editor.
     *  This accounts for folds. */
    getScreenLineCount(): number;

    /** Returns a number representing the last zero-indexed buffer row number of
     *  the editor. */
    getLastBufferRow(): number;

    /** Returns a number representing the last zero-indexed screen row number of
     *  the editor. */
    getLastScreenRow(): number;

    /** Returns a string representing the contents of the line at the given
     *  buffer row. */
    lineTextForBufferRow(bufferRow: number): string;

    /** Returns a string representing the contents of the line at the given
     *  screen row. */
    lineTextForScreenRow(screenRow: number): string;

    /** Get the range of the paragraph surrounding the most recently added cursor. */
    getCurrentParagraphBufferRange(): TextBuffer.Range;

    // Mutating Text ==========================================================
    /** Replaces the entire contents of the buffer with the given string. */
    setText(text: string): void;

    /** Set the text in the given Range in buffer coordinates. */
    setTextInBufferRange(range: TextBuffer.IRange, text: string, options?: {
        normalizeLineEndings?: boolean, undo?: 'skip' }): void;
    /** Set the text in the given Range in buffer coordinates. */
    setTextInBufferRange(range: [TextBuffer.IPoint, TextBuffer.IPoint],
        text: string, options?: { normalizeLineEndings?: boolean,
        undo?: 'skip' }):void;
    /** Set the text in the given Range in buffer coordinates. */
    setTextInBufferRange(range: [[number, number], [number, number]],
        text: string, options?: { normalizeLineEndings?: boolean,
        undo?: 'skip' }): void;
    /** Set the text in the given Range in buffer coordinates. */
    setTextInBufferRange(range: [TextBuffer.IPoint, [number, number]],
        text: string, options?: { normalizeLineEndings?: boolean,
        undo?: 'skip' }): void;
    /** Set the text in the given Range in buffer coordinates. */
    setTextInBufferRange(range: [[number, number], TextBuffer.IPoint],
        text: string, options?: { normalizeLineEndings?: boolean,
        undo?: 'skip' }): void;

    /* For each selection, replace the selected text with the given text. */
    insertText(text: string, options?: { select?: boolean, autoIndent?: boolean,
        autoIndentNewline?: boolean, autoDecreaseIndent?: boolean,
        normalizeLineEndings?: boolean, undo?: 'skip' }): TextBuffer.Range|false;

    /** For each selection, replace the selected text with a newline. */
    insertNewline(): void;

    /** For each selection, if the selection is empty, delete the character following
     *  the cursor. Otherwise delete the selected text. */
    delete(): void;

    /** For each selection, if the selection is empty, delete the character preceding
     *  the cursor. Otherwise delete the selected text. */
    backspace(): void;

    /** Mutate the text of all the selections in a single transaction.
     *  All the changes made inside the given Function can be reverted with a single
     *  call to ::undo. */
    mutateSelectedText(fn: (selection: AtomCore.Selection, index: number) => void): void;

    /** For each selection, transpose the selected text.
     *  If the selection is empty, the characters preceding and following the cursor
     *  are swapped. Otherwise, the selected characters are reversed. */
    transpose(): void;

    /** Convert the selected text to upper case.
     *  For each selection, if the selection is empty, converts the containing word
     *  to upper case. Otherwise convert the selected text to upper case. */
    upperCase(): void;

    /** Convert the selected text to lower case.
     *  For each selection, if the selection is empty, converts the containing word
     *  to upper case. Otherwise convert the selected text to upper case. */
    lowerCase(): void;

    /** Toggle line comments for rows intersecting selections.
     *  If the current grammar doesn't support comments, does nothing. */
    toggleLineCommentsInSelection(): void;

    /** For each cursor, insert a newline at beginning the following line. */
    insertNewlineBelow(): void;

    /** For each cursor, insert a newline at the end of the preceding line. */
    insertNewlineAbove(): void;

    /** For each selection, if the selection is empty, delete all characters of the
     *  containing word that precede the cursor. Otherwise delete the selected text. */
    deleteToBeginningOfWord(): void;

    /** Similar to ::deleteToBeginningOfWord, but deletes only back to the previous
     *  word boundary. */
    deleteToPreviousWordBoundary(): void;

    /** Similar to ::deleteToEndOfWord, but deletes only up to the next word boundary. */
    deleteToNextWordBoundary(): void;

    /** For each selection, if the selection is empty, delete all characters of the
     *  containing subword following the cursor. Otherwise delete the selected text. */
    deleteToBeginningOfSubword(): void;

    /** For each selection, if the selection is empty, delete all characters of the
     *  containing subword following the cursor. Otherwise delete the selected text. */
    deleteToEndOfSubword(): void;

    /** For each selection, if the selection is empty, delete all characters of the
     *  containing line that precede the cursor. Otherwise delete the selected text. */
    deleteToBeginningOfLine(): void;

    /** For each selection, if the selection is not empty, deletes the selection;
     *  otherwise, deletes all characters of the containing line following the cursor.
     *  If the cursor is already at the end of the line, deletes the following newline. */
    deleteToEndOfLine(): void;

    /** For each selection, if the selection is empty, delete all characters of the
     *  containing word following the cursor. Otherwise delete the selected text. */
    deleteToEndOfWord(): void;

    /** Delete all lines intersecting selections. */
    deleteLine(): void;

    // History ================================================================
    // undo()
    // redo()
    // transact([groupingInterval], fn)
    // abortTransaction()
    // createCheckpoint()
    // revertToCheckpoint()
    // groupChangesSinceCheckpoint()

    // TextEditor Coordinates =================================================
    // screenPositionForBufferPosition(bufferPosition, [options])
    // bufferPositionForScreenPosition(bufferPosition, [options])
    // screenRangeForBufferRange(bufferRange)
    // bufferRangeForScreenRange(screenRange)
    // clipBufferPosition(bufferPosition)
    // clipBufferRange(range)
    // clipScreenPosition(screenPosition, [options])
    // clipScreenRange(range, [options])

    // Decorations ============================================================
    // decorateMarker(marker, decorationParams)
    // decorateMarkerLayer(markerLayer, decorationParams)
    // getDecorations([propertyFilter])
    // getLineDecorations([propertyFilter])
    // getLineNumberDecorations([propertyFilter])
    // getHighlightDecorations([propertyFilter])
    // getOverlayDecorations([propertyFilter])

    // Markers ================================================================
    // markBufferRange(range, properties)
    // markScreenRange(range, properties)
    // markBufferPosition(bufferPosition, [options])
    // markScreenPosition(screenPosition, [options])
    // findMarkers(properties)
    // addMarkerLayer(options)
    // getMarkerLayer(id)
    // getDefaultMarkerLayer()
    // getMarker(id)
    // getMarkers()
    // getMarkerCount()

    // Cursors ================================================================
    /** Get the position of the most recently added cursor in buffer coordinates. */
    getCursorBufferPosition(): TextBuffer.Point;

    /** Get the position of all the cursor positions in buffer coordinates. */
    getCursorBufferPositions(): Array<TextBuffer.Point>;

    /** Move the cursor to the given position in buffer coordinates.
     *  If there are multiple cursors, they will be consolidated to a single cursor. */
    setCursorBufferPosition(position: TextBuffer.IPoint, options:
        { autoscroll: boolean }): void;
    /** Move the cursor to the given position in buffer coordinates.
     *  If there are multiple cursors, they will be consolidated to a single cursor. */
    setCursorBufferPosition(position: [number, number], options?:
        { autoscroll: boolean }): void;

    /** Get a Cursor at given screen coordinates Point. */
    getCursorAtScreenPosition(position: TextBuffer.IPoint): AtomCore.Cursor|undefined;
    /** Get a Cursor at given screen coordinates Point. */
    getCursorAtScreenPosition(position: [number, number]): AtomCore.Cursor|undefined;

    /** Get the position of the most recently added cursor in screen coordinates. */
    getCursorScreenPosition(): TextBuffer.Point;

    /** Get the position of all the cursor positions in screen coordinates. */
    getCursorScreenPositions(): Array<TextBuffer.Point>;

    /** Move the cursor to the given position in screen coordinates.
     *  If there are multiple cursors, they will be consolidated to a single cursor. */
    setCursorScreenPosition(position: TextBuffer.IPoint,
        options?: { autoscroll: boolean }): void;
    /** Move the cursor to the given position in screen coordinates.
     *  If there are multiple cursors, they will be consolidated to a single cursor. */
    setCursorScreenPosition(position: [number, number],
        options?: { autoscroll: boolean }): void;

    /** Add a cursor at the given position in buffer coordinates. */
    addCursorAtBufferPosition(bufferPosition: TextBuffer.IPoint): AtomCore.Cursor;
    /** Add a cursor at the given position in buffer coordinates. */
    addCursorAtBufferPosition(bufferPosition: [number, number]): AtomCore.Cursor;

    /** Add a cursor at the position in screen coordinates. */
    addCursorAtScreenPosition(screenPosition: TextBuffer.IPoint): AtomCore.Cursor;
    /** Add a cursor at the position in screen coordinates. */
    addCursorAtScreenPosition(screenPosition: [number, number]): AtomCore.Cursor;

    /** Returns a boolean indicating whether or not there are multiple cursors. */
    hasMultipleCursors(): boolean;

    /** Move every cursor up one row in screen coordinates. */
    moveUp(lineCount?: number): void;

    /** Move every cursor down one row in screen coordinates. */
    moveDown(lineCount?: number): void;

    /** Move every cursor left one column. */
    moveLeft(columnCount?: number): void;

    /** Move every cursor right one column. */
    moveRight(columnCount?: number): void;

    /** Move every cursor to the beginning of its line in buffer coordinates. */
    moveToBeginningOfLine(): void;

    /** Move every cursor to the beginning of its line in screen coordinates. */
    moveToBeginningOfScreenLine(): void;

    /** Move every cursor to the first non-whitespace character of its line. */
    moveToFirstCharacterOfLine(): void;

    /** Move every cursor to the end of its line in buffer coordinates. */
    moveToEndOfLine(): void;

    /** Move every cursor to the end of its line in screen coordinates. */
    moveToEndOfScreenLine(): void;

    /** Move every cursor to the beginning of its surrounding word. */
    moveToBeginningOfWord(): void;

    /** Move every cursor to the end of its surrounding word. */
    moveToEndOfWord(): void;

    /** Move every cursor to the top of the buffer.
     *  If there are multiple cursors, they will be merged into a single cursor. */
    moveToTop(): void;

    /** Move every cursor to the bottom of the buffer.
     *  If there are multiple cursors, they will be merged into a single cursor. */
    moveToBottom(): void;

    /** Move every cursor to the beginning of the next word. */
    moveToBeginningOfNextWord(): void;

    /** Move every cursor to the previous word boundary. */
    moveToPreviousWordBoundary(): void;

    /** Move every cursor to the next word boundary. */
    moveToNextWordBoundary(): void;

    /** Move every cursor to the previous subword boundary. */
    moveToPreviousSubwordBoundary(): void;

    /** Move every cursor to the next subword boundary. */
    moveToNextSubwordBoundary(): void;

    /** Move every cursor to the beginning of the next paragraph. */
    moveToBeginningOfNextParagraph(): void;

    /** Move every cursor to the beginning of the previous paragraph. */
    moveToBeginningOfPreviousParagraph(): void;

    /** Returns the most recently added Cursor. */
    getLastCursor(): AtomCore.Cursor;

    /** Returns the word surrounding the most recently added cursor. */
    getWordUnderCursor(options?: { wordRegex?: RegExp,
        includeNonWordCharacters: boolean, allowPrevious: boolean }): string;

    /** Get an Array of all Cursors. */
    getCursors(): Array<AtomCore.Cursor>;

    /** Get all Cursorss, ordered by their position in the buffer instead of the
     *  order in which they were added. */
    getCursorsOrderedByBufferPosition(): Array<AtomCore.Cursor>;

    // Selections =============================================================
    // getSelectedText()
    // getSelectedBufferRange()
    // getSelectedBufferRanges()
    // setSelectedBufferRange(bufferRange, [options])
    // setSelectedBufferRanges(bufferRanges, [options])
    // getSelectedScreenRange()
    // getSelectedScreenRanges()
    // setSelectedScreenRange(screenRange, [options])
    // setSelectedScreenRanges(screenRanges, [options])
    // addSelectionForBufferRange(bufferRange, [options])
    // addSelectionForScreenRange(screenRange, [options])
    // selectToBufferPosition(position)
    // selectToScreenPosition(position)
    // selectUp([rowCount])
    // selectDown([rowCount])
    // selectLeft([columnCount])
    // selectRight([columnCount])
    // selectToTop()
    // selectToBottom()
    // selectAll()
    // selectToBeginningOfLine()
    // selectToFirstCharacterOfLine()
    // selectToEndOfLine()
    // selectToBeginningOfWord()
    // selectToEndOfWord()
    // selectLinesContainingCursors()
    // selectWordsContainingCursors()
    // selectToPreviousSubwordBoundary()
    // selectToNextSubwordBoundary()
    // selectToPreviousWordBoundary()
    // selectToNextWordBoundary()
    // selectToBeginningOfNextWord()
    // selectToBeginningOfNextParagraph()
    // selectToBeginningOfPreviousParagraph()
    // selectMarker(marker)
    // getLastSelection()
    // getSelections()
    // getSelectionsOrderedByBufferPosition()
    // selectionIntersectsBufferRange(bufferRange)

    // Searching and Replacing ================================================
    // scan(regex, iterator)
    // scanInBufferRange(regex, range, iterator)
    // backwardsScanInBufferRange(regex, range, iterator)

    // Tab Behavior ===========================================================
    // getSoftTabs()
    // setSoftTabs(softTabs)
    // toggleSoftTabs()
    // getTabLength()
    // setTabLength(tabLength)
    // usesSoftTabs()
    // getTabText()

    // Soft Wrap Behavior =====================================================
    // isSoftWrapped()
    // setSoftWrapped(softWrapped)
    // toggleSoftWrapped()
    // getSoftWrapColumn()

    // Indentation ============================================================
    // indentationForBufferRow(bufferRow)
    // setIndentationForBufferRow(bufferRow, newLevel, [options])
    // indentSelectedRows()
    // outdentSelectedRows()
    // indentLevelForLine(line)
    // autoIndentSelectedRows()

    // Grammars ===============================================================
    // getGrammar()
    // setGrammar(grammar)

    // Managing Syntax Scopes =================================================
    /** Returns a ScopeDescriptor that includes this editor's language.
     *  e.g. ['.source.ruby'], or ['.source.coffee']. */
    getRootScopeDescriptor(): AtomCore.ScopeDescriptor;

    /** Get the syntactic scopeDescriptor for the given position in buffer coordinates. */
    scopeDescriptorForBufferPosition(bufferPosition: TextBuffer.IPoint):
        AtomCore.ScopeDescriptor;
    /** Get the syntactic scopeDescriptor for the given position in buffer coordinates. */
    scopeDescriptorForBufferPosition(bufferPosition: [number, number]):
        AtomCore.ScopeDescriptor;

    /** Get the range in buffer coordinates of all tokens surrounding the cursor
     *  that match the given scope selector. */
    bufferRangeForScopeAtCursor(scopeSelector: string): TextBuffer.Range;

    /** Determine if the given row is entirely a comment. */
    isBufferRowCommented(bufferRow: number): boolean;

    // Clipboard Operations ===================================================
    // copySelectedText()
    // cutSelectedText()
    // pasteText([options])
    // cutToEndOfLine()
    // cutToEndOfBufferLine()

    // Folds ==================================================================
    // foldCurrentRow()
    // unfoldCurrentRow()
    // foldBufferRow(bufferRow)
    // unfoldBufferRow(bufferRow)
    // foldSelectedLines()
    // foldAll()
    // unfoldAll()
    // foldAllAtIndentLevel(level)
    // isFoldableAtBufferRow(bufferRow)
    // isFoldableAtScreenRow(bufferRow)
    // toggleFoldAtBufferRow()
    // isFoldedAtCursorRow()
    // isFoldedAtBufferRow(bufferRow)
    // isFoldedAtScreenRow(screenRow)

    // Gutters ================================================================
    // addGutter(options)
    // getGutters()
    // gutterWithName()

    // Scrolling the TextEditor ===============================================
    // scrollToCursorPosition([options])
    // scrollToBufferPosition(bufferPosition, [options])
    // scrollToScreenPosition(screenPosition, [options])

    // TextEditor Rendering ===================================================
    // getPlaceholderText()
    // setPlaceholderText(placeholderText)
  }

  // TODO(glen): implement from -> https://atom.io/docs/api/v1.14.3/Cursor
  class Cursor {

  }

  // TODO(glen): implement from -> https://atom.io/docs/api/v1.14.3/Selection
  class Selection {

  }

  // Managers and Registries ==================================================
  /** Associates listener functions with commands in a context-sensitive way
   *  using CSS selectors. */
  class CommandRegistry {
    // Register a single command.
    add(target: string|Element, commandName: string, callback: (event: Event) => void):
    AtomEventKit.Disposable

    // Register multiple commands.
    add(target: string|Element, commands: { values: Object }): AtomEventKit.CompositeDisposable

    /** Find all registered commands matching a query. */
    findCommands(params: { target: Object }): Array<{ name: string, displayName: string }>

    /** Simulate the dispatch of a command on a DOM node. */
    dispatch(target: Object, commandName: string): void;

    /** Invoke the given callback before dispatching a command event. */
    onWillDispatch(callback: (event: Event) => void): AtomEventKit.Disposable;

    /** Invoke the given callback after dispatching a command event. */
    onDidDispatch(callback: (event: Event) => void): AtomEventKit.Disposable;
  }

  /** Used to access all of Atom's configuration details. */
  class Config {
    // Config Subscription ====================================================
    /** Add a listener for changes to a given key path. This is different than ::onDidChange in
     *  that it will immediately call your callback with the current value of the config entry. */
    observe(keyPath: string, callback: (value: any) => void):
        AtomEventKit.Disposable;
    /** Add a listener for changes to a given key path. This is different than ::onDidChange in
     *  that it will immediately call your callback with the current value of the config entry. */
    observe(keyPath: string, options: { scope: ScopeDescriptor },
        callback: (value: any) => void): AtomEventKit.Disposable;
    /** Add a listener for changes to a given key path. This is different than ::onDidChange in
     *  that it will immediately call your callback with the current value of the config entry. */
    observe(keyPath: string, options: { scope: Array<string> },
        callback: (value: any) => void): AtomEventKit.Disposable;

    /** Add a listener for changes to a given key path. If keyPath is not specified, your
     *  callback will be called on changes to any key. */
    onDidChange(callback: (values: {
        newValue: any, oldValue: any }) => void): AtomEventKit.Disposable;
    /** Add a listener for changes to a given key path. If keyPath is not specified, your
     *  callback will be called on changes to any key. */
    onDidChange(keyPath: string, callback: (values: {
        newValue: any, oldValue: any }) => void): AtomEventKit.Disposable;
    /** Add a listener for changes to a given key path. If keyPath is not specified, your
     *  callback will be called on changes to any key. */
    onDidChange(keyPath: string, options: { scope: ScopeDescriptor },
        callback: (values: { newValue: any, oldValue: any }) => void):
        AtomEventKit.Disposable;
    /** Add a listener for changes to a given key path. If keyPath is not specified, your
     *  callback will be called on changes to any key. */
    onDidChange(keypath: string, options: { scope: Array<string> },
        callback: (values: { newValue: any, oldValue: any }) => void):
        AtomEventKit.Disposable;

    // Managing Settings ======================================================
    /** Retrieves the setting for the given key. */
    get(keyPath: string): any;
    /** Retrieves the setting for the given key. */
    get(keyPath: string, options: {
        sources?: Array<string>,
        excludeSources?: Array<string>,
        scope?: ScopeDescriptor
      }): any;
    /** Retrieves the setting for the given key. */
    get(keyPath: string, options: {
        sources?: Array<string>,
        excludeSources?: Array<string>,
        scope?: Array<string>
      }): any;

    /** Sets the value for a configuration setting.
     *  This value is stored in Atom's internal configuration file. */
    set(keyPath: string, value: any): void;
    /** Sets the value for a configuration setting.
     *  This value is stored in Atom's internal configuration file. */
    set(keyPath: string, value: any, options: {
        scopeSelector?: string,
        source?: string
      }): void;

    /** Restore the setting at keyPath to its default value. */
    unset(keyPath: string): void;
    /** Restore the setting at keyPath to its default value. */
    unset(keyPath: string, options: {
        scopeSelector?: string,
        source?: string
      }): void;

    /** Get all of the values for the given key-path, along with their associated
     *  scope selector. */
    getAll(keyPath: string): Array<{ scopeDescriptor: ScopeDescriptor,
        value: any}>;
    /** Get all of the values for the given key-path, along with their associated
     *  scope selector. */
    getAll(keyPath: string, options: {
        sources?: Array<string>,
        excludeSources?: Array<string>,
        scope?: ScopeDescriptor
      }): Array<{ scopeDescriptor: ScopeDescriptor, value: any}>;

    /** Get an Array of all of the source Strings with which settings have been added
     *  via ::set. */
    getSources(): Array<string>;
    /** Retrieve the schema for a specific key path. The schema will tell you what type
     *  the keyPath expects, and other metadata about the config option. */
    getSchema(keyPath: string): Object;
    /** Get the string path to the config file being used. */
    getUserConfigPath(): string;
    /** Suppress calls to handler functions registered with ::onDidChange and ::observe
     *  for the duration of callback. After callback executes, handlers will be called
     *  once if the value for their key-path has changed. */
    transact(callback: Function): any;
  }

  /** Represents the clipboard used for copying and pasting in Atom. */
  class Clipboard {
    /** Write the given text to the clipboard. */
    write(text: string, metadata?: Object): void;

    /** Read the text from the clipboard. */
    read(): string;

    /** Read the text from the clipboard and return both the text and the associated
     *  metadata. */
    readWithMetadata(): { text: string, metadata: Object };
  }

  /** Provides a registry for commands that you'd like to appear in the context menu. */
  class ContextMenuManager {
    /** Add context menu items scoped by CSS selectors. */
    add(itemsBySelector: {
        label?: string,
        command?: string,
        enabled?: boolean,
        submenu?: Array<Object>,
        type?: "separator",
        visible?: boolean,
        created?: (event: Event) => void,
        shouldDisplay?: (event: Event) => void
      }): AtomEventKit.Disposable;
  }

  /** Provides a registry for menu items that you'd like to appear in the application menu. */
  class MenuManager {
    /** Adds the given items to the application menu. */
    add(items: Array<{
        label: string,
        submenu?: Object,
        command?: string
      }>): AtomEventKit.Disposable;
    /** Refreshes the currently visible menu. */
    update(): void;
  }

  /** Allows commands to be associated with keystrokes in a context-sensitive way.
   *  In Atom, you can access a global instance of this object via atom.keymaps. */
  class KeymapManager {
    // Class Methods ==========================================================
    /** Create a keydown DOM event for testing purposes. */
    static buildKeydownEvent(key: string, options?: {
        ctrl?: boolean,
        alt?: boolean,
        shift?: boolean,
        cmd?: boolean,
        which?: number,
        target?: Element
      }): void;

    // Construction and Destruction ===========================================
    constructor(options: { defaultTarget?: Object });

    /** Clear all registered key bindings and enqueued keystrokes. For use in tests. */
    clear(): void;

    /** Unwatch all watched paths. */
    destroy(): void;

    // Event Subscription =====================================================
    /** Invoke the given callback when one or more keystrokes completely match a key binding. */
    onDidMatchBinding(callback: (event: CallbackArgs.KMMatchedBinding) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when one or more keystrokes partially match a binding. */
    onDidPartiallyMatchBindings(callback: (event: CallbackArgs.KMPartiallyMatchBinds) =>
        void): AtomEventKit.Disposable;

    /** Invoke the given callback when one or more keystrokes fail to match any bindings. */
    onDidFailToMatchBinding(callback: (event: CallbackArgs.KMFailedMatchBinding) =>
        void): AtomEventKit.Disposable;

    /** Invoke the given callback when a keymap file not able to be loaded. */
    onDidFailToReadFile(callback: (error: CallbackArgs.KMFileReadFailure) => void):
        AtomEventKit.Disposable;

    // Adding and Removing Bindings ===========================================
    /** Add sets of key bindings grouped by CSS selector. */
    add(source: string, bindings: Object, priority: number): AtomEventKit.Disposable;

    // Accessing Bindings =====================================================
    /** Get all current key bindings. */
    getKeyBindings(): Array<KeyBinding>;

    /** Get the key bindings for a given command and optional target. */
    findKeyBindings(params: {
        keystrokes?: string,
        command?: string,
        target?: Element
      }): Array<KeyBinding>;

    // Managing Keymap Files ==================================================
    /** Load the key bindings from the given path. */
    loadKeymap(path: string, options?: { watch?: boolean, priority?: boolean }): void;

    /** Cause the keymap to reload the key bindings file at the given path whenever
     *  it changes. */
    watchKeymap(path: string, options?: { priority?: boolean }): void;

    // Managing Keyboard Events ===============================================
    /** Dispatch a custom event associated with the matching key binding for the
     *  given KeyboardEvent if one can be found. */
    handleKeyboardEvent(event: KeyboardEvent): void;

    /** Translate a keydown event to a keystroke string. */
    keystrokeForKeyboardEvent(event: KeyboardEvent): string;

    /** Customize translation of raw keyboard events to keystroke strings. This API
     *  is useful for working around Chrome bugs or changing how Atom resolves certain
     *  key combinations. If multiple resolvers are installed, the most recently-added
     *  resolver returning a string for a given keystroke takes precedence. */
    addKeystrokeResolver(resolver: (keystroke: string, event: KeyboardEvent,
        layoutName: string, keymap: Object) => void): AtomEventKit.Disposable;

    /** Get the number of milliseconds allowed before pending states caused by partial
     *  matches of multi-keystroke bindings are terminated. */
    getPartialMatchTimeout(): number;
  }

  /** Associates tooltips with HTML elements or selectors. */
  class TooltipManager {
    /** Add a tooltip to the given element. */
    add(target: HTMLElement, options: {
        animation?: boolean,
        container?: string|false,
        delay?: number|{ "show": number, "hide": number },
        html?: boolean,
        placement?: string|Function,
        selector?: string,
        template?: string,
        title?: string|Function,
        viewport?: string|Object|Function,
        trigger?: "click"|"hover"|"focus"|"manual",
        keyBindingCommand?: string,
        keyBindingTarget?: HTMLElement
    }): AtomEventKit.IDisposable;
  }

  /** A notification manager used to create Notifications to be shown to the user. */
  class NotificationManager {
    // Properties =============================================================
    notifications: Array<Notification>;

    // Events =================================================================
    /** Invoke the given callback after a notification has been added. */
    onDidAddNotification(callback: (notification: Notification) => void):
        AtomEventKit.Disposable;

    // Adding Notifications ===================================================
    /** Add a success notification. */
    addSuccess(message: string, options?: {
        buttons?: {
          className?: string,
          onDidClick?: Function,
          text?: string
        }
        description?: string,
        detail?: string,
        dismissable?: boolean,
        icon?: string
      }): Notification;

    /** Add an informational notification. */
    addInfo(message: string, options?: {
        buttons?: {
          className?: string,
          onDidClick?: Function,
          text?: string
        }
        description?: string,
        detail?: string,
        dismissable?: boolean,
        icon?: string
      }): Notification;

    /** Add a warning notification. */
    addWarning(message: string, options?: {
        buttons?: {
          className?: string,
          onDidClick?: Function,
          text?: string
        }
        description?: string,
        detail?: string,
        dismissable?: boolean,
        icon?: string
      }): Notification;

    /** Add an error notification. */
    addError(message: string, options?: {
        buttons?: {
          className?: string,
          onDidClick?: Function,
          text?: string
        }
        description?: string,
        detail?: string,
        dismissable?: boolean,
        icon?: string
        stack?: string
      }): Notification;

    /** Add a fatal error notification. */
    addFatalError(message: string, options?: {
        buttons?: {
          className?: string,
          onDidClick?: Function,
          text?: string
        }
        description?: string,
        detail?: string,
        dismissable?: boolean,
        icon?: string
        stack?: string
      }): Notification;

    // Getting Notifications ==================================================
    /** Get all the notifications. */
    getNotifications(): Array<Notification>;
  }

  /** Represents a project that's opened in Atom. */
  class Project {
    // Event Subscription =====================================================
    /** Invoke the given callback when the project paths change. */
    onDidChangePaths(callback: (projectPaths: Array<string>) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a text buffer is added to the project. */
    onDidAddBuffer(callback: (buffer: TextBuffer.TextBuffer) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback with all current and future text buffers in
     *  the project. */
    observeBuffers(callback: (buffer: TextBuffer.TextBuffer) => void):
        AtomEventKit.Disposable;

    // Accessing the Git Repository ===========================================
    /** Get an Array of GitRepositorys associated with the project's directories. */
    getRepositories(): Array<GitRepository>;

    /** Get the repository for a given directory asynchronously. */
    repositoryForDirectory(directory: PathWatcher.Directory):
        Promise<GitRepository|null>;

    // Managing Paths =========================================================
    /** Get an Array of strings containing the paths of the project's directories. */
    getPaths(): Array<string>;

    /** Set the paths of the project's directories. */
    setPaths(projectPaths: Array<string>): void;

    /** Add a path to the project's list of root paths. */
    addPath(projectPath: string): void;

    /** Remove a path from the project's list of root paths. */
    removePath(projectPath: string): void;

    /** Get an Array of Directorys associated with this project. */
    getDirectories(): Array<PathWatcher.Directory>;

    /** Get the path to the project directory that contains the given path, and
     *  the relative path from that project directory to the given path. */
    relativizePath(fullPath: string): Array<any>;

    /** Determines whether the given path (real or symbolic) is inside the
     *  project's directory. */
    contains(pathToCheck: string): boolean;
  }

  /** Registry containing one or more grammars. */
  class GrammarRegistry {
    // Event Subscription =====================================================
    /** Invoke the given callback when a grammar is added to the registry. */
    onDidAddGrammar(callback: (grammar: Grammar) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when a grammar is updated due to a grammar it
     *  depends on being added or removed from the registry. */
    onDidUpdateGrammar(callback: (grammar: Grammar) => void):
        AtomEventKit.Disposable;

    // Managing Grammars ======================================================
    /** Get all the grammars in this registry. */
    getGrammars(): Array<Grammar>;

    /** Get a grammar with the given scope name. */
    grammarForScopeName(scopeName: string): Grammar|undefined;

    /** Add a grammar to this registry. */
    addGrammar(grammar: Grammar): AtomEventKit.Disposable;

    /** Remove the grammar with the given scope name. */
    removeGrammarForScopeName(scopeName: string): Grammar|undefined;

    /** Read a grammar synchronously but don't add it to the registry. */
    readGrammarSync(grammarPath: string): Grammar;

    /** Read a grammar asynchronously but doesn't add it to the registry. */
    readGrammar(grammarPath: string, callback: (error: Error|null,
        grammar: Grammar|null) => void): void;

    /** Read a grammar synchronously and add it to this registry. */
    loadGrammarSync(grammarPath: string): Grammar;

    /** Read a grammar asynchronously and add it to the registry. */
    loadGrammar(grammarPath: string, callback: (error: Error|null,
        grammar: Grammar|null) => void): void;
  }

  /** Package manager for coordinating the lifecycle of Atom packages. */
  class PackageManager {
    // Event Subscription =====================================================
    /** Invoke the given callback when all packages have been loaded. */
    onDidLoadInitialPackages(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when all packages have been activated. */
    onDidActivateInitialPackages(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when a package is activated. */
    onDidActivatePackage(callback: (package: Package) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a package is deactivated. */
    onDidDeactivatePackage(callback: (package: Package) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a package is loaded. */
    onDidLoadPackage(callback: (package: Package) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a package is unloaded. */
    onDidUnloadPackage(callback: (package: Package) => void):
        AtomEventKit.Disposable;

    // Package System Data ====================================================
    /** Get the path to the apm command. */
    getApmPath(): string;

    /** Get the paths being used to look for packages. */
    getPackageDirPaths(): Array<string>;

    // General Package Data ===================================================
    /** Resolve the given package name to a path on disk. */
    resolvePackagePath(name: string): string|undefined;

    /** Is the package with the given name bundled with Atom? */
    isBundledPackage(name: string): boolean;

    // Enabling and Disabling Packages ========================================
    /** Enable the package with the given name. */
    enablePackage(name: string): Package|null;

    /** Disable the package with the given name. */
    disablePackage(name: string): Package|null;

    /** Is the package with the given name disabled? */
    isPackageDisabled(name: string): boolean;

    // Accessing Active Packages ==============================================
    /** Get an Array of all the active Packages. */
    getActivePackages(): Array<Package>;

    /** Get the active Package with the given name. */
    getActivePackage(name: string): Package|undefined;

    /** Is the Package with the given name active? */
    isPackageActive(name: string): boolean;

    /** Returns a boolean indicating whether package activation has occurred. */
    hasActivatedInitialPackages(): boolean;

    // Accessing Loaded Packages ==============================================
    /** Get an Array of all the loaded Packages. */
    getLoadedPackages(): Array<Package>;

    /** Get the loaded Package with the given name. */
    getLoadedPackage(name: string): Package|undefined;

    /** Is the package with the given name loaded? */
    isPackageLoaded(name: string): boolean;

    /** Returns a boolean indicating whether package loading has occurred. */
    hasLoadedInitialPackages(): boolean;

    // Accessing Available Packages ===========================================
    /** Returns an Array of strings of all the available package paths. */
    getAvailablePackagePaths(): Array<string>;

    /** Returns an Array of strings of all the available package names.  */
    getAvailablePackageNames(): Array<string>;

    /** Returns an Array of strings of all the available package metadata. */
    getAvailablePackageMetadata(): Array<string>;
  }

  /** Handles loading and activating available themes. */
  class ThemeManager {
    // Event Subscription =====================================================
    /** Invoke callback when style sheet changes associated with updating the
     *  list of active themes have completed. */
    onDidChangeActiveThemes(callback: () => void): AtomEventKit.Disposable;

    // Accessing Loaded Themes ================================================
    /** Returns an Array of strings of all the loaded theme names. */
    getLoadedThemeNames(): Array<string>|undefined;

    /** Returns an Array of all the loaded themes. */
    getLoadedThemes(): Array<Package>|undefined;

    // Accessing Active Themes ================================================
    /** Returns an Array of strings all the active theme names. */
    getActiveThemeNames(): Array<string>|undefined;

    /** Returns an Array of all the active themes. */
    getActiveThemes(): Array<Package>|undefined;

    // Managing Enabled Themes ================================================
    /** Get the enabled theme names from the config. */
    getEnabledThemeNames(): Array<string>;
  }

  /** A singleton instance of this class available via atom.styles, which you can
   *  use to globally query and observe the set of active style sheets. */
  class StyleManager {
    // Event Subscription =====================================================
    /** Invoke callback for all current and future style elements. */
    observeStyleElements(callback: (styleElement: CallbackArgs.SMHTMLStyleElement) =>
        void): AtomEventKit.Disposable;

    /** Invoke callback when a style element is added. */
    onDidAddStyleElement(callback: (styleElement: CallbackArgs.SMHTMLStyleElement) =>
        void): AtomEventKit.Disposable;

    /** Invoke callback when a style element is removed. */
    onDidRemoveStyleElement(callback: (styleElement: HTMLStyleElement) => void):
        AtomEventKit.Disposable;

    /** Invoke callback when an existing style element is updated. */
    onDidUpdateStyleElement(callback: (styleElement: CallbackArgs.SMHTMLStyleElement) =>
        void): AtomEventKit.Disposable;

    // Reading Style Elements =================================================
    /** Get all loaded style elements. */
    getStyleElements(): Array<HTMLStyleElement>;

    // Paths ==================================================================
    /** Get the path of the user style sheet in ~/.atom. */
    getUserStyleSheetPath(): string;
  }

  /** Manages the deserializers used for serialized state. */
  class DeserializerManager {
    /** Register the given class(es) as deserializers. */
    add(deserializers: Array<{ name: string, deserialize: Function }>):
        AtomEventKit.Disposable;

    /** Deserialize the state and params. */
    deserialize(state: Object): Object;
  }

  /** ViewRegistry handles the association between model and view types in Atom.
   *  We call this association a View Provider. As in, for a given model, this class
   *  can provide a view via ::getView, as long as the model/view association was
   *  registered via ::addViewProvider. */
  class ViewRegistry {
    /** Add a provider that will be used to construct views in the workspace's view
     *  layer based on model objects in its model layer. */
    addViewProvider(createView: () => HTMLElement|undefined): AtomEventKit.Disposable;
    /** Add a provider that will be used to construct views in the workspace's view
     *  layer based on model objects in its model layer. */
    addViewProvider(modelConstructor: Function, createView: () =>
        HTMLElement|undefined): AtomEventKit.Disposable;

    /** Get the view associated with an object in the workspace. */
    getView(object: Object): Element;
  }

  /** Represents the state of the user interface for the entire window. */
  class Workspace {
    // Event Subscription =====================================================
    /** Invoke the given callback with all current and future text editors in
     *  the workspace. */
    observeTextEditors(callback: (editor: TextEditor) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback with all current and future panes items in the
     *  workspace. */
    observePaneItems(callback: (item: Object) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the active pane item changes. */
    onDidChangeActivePaneItem(callback: (item: Object) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when the active pane item stops changing. */
    onDidStopChangingActivePaneItem(callback: (item: Object) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback with the current active pane item and with all
     *  future active pane items in the workspace. */
    observeActivePaneItem(callback: (item: Object) => void): AtomEventKit.Disposable;

    /** Invoke the given callback whenever an item is opened. Unlike ::onDidAddPaneItem,
     *  observers will be notified for items that are already present in the workspace
     *  when they are reopened. */
    onDidOpen(callback: (event: CallbackArgs.WSPaneItemOpenEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a pane is added to the workspace. */
    onDidAddPane(callback: (event: CallbackArgs.WSPaneEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback before a pane is destroyed in the workspace. */
    onWillDestroyPane(callback: (event: CallbackArgs.WSPaneEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a pane is destroyed in the workspace. */
    onDidDestroyPane(callback: (event: CallbackArgs.WSPaneEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback with all current and future panes in the workspace. */
    observePanes(callback: (event: Pane) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the active pane changes. */
    onDidChangeActivePane(callback: (event: Pane) => void): AtomEventKit.Disposable;

    /** Invoke the given callback with the current active pane and when the
     *  active pane changes. */
    observeActivePane(callback: (event: Pane) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when a pane item is added to the workspace. */
    onDidAddPaneItem(callback: (event: CallbackArgs.WSPaneItemEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a pane item is about to be destroyed,
     *  before the user is prompted to save it. */
    onWillDestroyPaneItem(callback: (event: CallbackArgs.WSPaneItemEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a pane item is destroyed. */
    onDidDestroyPaneItem(callback: (event: CallbackArgs.WSPaneItemEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a text editor is added to the workspace. */
    onDidAddTextEditor(callback: (event: CallbackArgs.WSTextEditorEvent) => void):
        AtomEventKit.Disposable;

    // Opening ================================================================
    /** Opens the given URI in Atom asynchronously. If the URI is already open,
     *  the existing item for that URI will be activated. If no URI is given, or
     *  no registered opener can open the URI, a new empty TextEditor will be created. */
    open(): Promise<TextEditor>;
    /** Opens the given URI in Atom asynchronously. If the URI is already open,
     *  the existing item for that URI will be activated. If no URI is given, or
     *  no registered opener can open the URI, a new empty TextEditor will be created. */
    open(uri: string, options?: {
        initialLine: number,
        initialColumn: number,
        split: "left"|"right"|"up"|"down",
        activatePane: boolean,
        activateItem: boolean,
        pending: boolean,
        searchAllPanes: boolean
      }): Promise<TextEditor>;

    /** Returns a boolean that is true if object is a TextEditor. */
    isTextEditor(object: Object): boolean;

    /** Asynchronously reopens the last-closed item's URI if it hasn't already
     *  been reopened. */
    reopenItem(): Promise<TextEditor|undefined>;

    /** Register an opener for a URI. */
    addOpener(opener: (uri: string) => any): AtomEventKit.Disposable;

    /** Create a new text editor. */
    buildTextEditor(): TextEditor;

    // Pane Items =============================================================
    /** Get all pane items in the workspace. */
    getPaneItems(): Array<Object>;

    /** Get the active Pane's active item. */
    getActivePaneItem(): Object;

    /** Get all text editors in the workspace. */
    getTextEditors(): Array<TextEditor>;

    /** Get all text editors in the workspace. */
    getActiveTextEditor(): TextEditor|undefined;

    // Panes ==================================================================
    /** Get all panes in the workspace. */
    getPanes(): Array<Pane>;

    /** Get the active Pane. */
    getActivePane(): Pane;

    /** Make the next pane active. */
    activateNextPane(): boolean;

    /** Make the previous pane active. */
    activatePreviousPane(): boolean

    /** Get the first Pane with an item for the given URI. */
    paneForURI(uri: string): Pane|undefined;

    /** Get the Pane containing the given item. */
    paneForItem(item: Object): Pane|undefined;

    // Panels =================================================================
    /** Get an Array of all the panel items at the bottom of the editor window. */
    getBottomPanels(): Array<Panel>;

    /** Adds a panel item to the bottom of the editor window. */
    addBottomPanel(options: { item: Object, visible?: boolean, priority?: number }):
        Panel;

    /** Get an Array of all the panel items to the left of the editor window. */
    getLeftPanels(): Array<Panel>;

    /** Adds a panel item to the left of the editor window. */
    addLeftPanel(options: { item: Object, visible?: boolean, priority?: number }):
        Panel;

    /** Get an Array of all the panel items to the right of the editor window. */
    getRightPanels(): Array<Panel>;

    /** Adds a panel item to the right of the editor window. */
    addRightPanel(options: { item: Object, visible?: boolean, priority?: number }):
        Panel;

    /** Get an Array of all the panel items at the top of the editor window. */
    getTopPanels(): Array<Panel>;

    /** Adds a panel item to the top of the editor window above the tabs. */
    addTopPanel(options: { item: Object, visible?: boolean, priority?: number }):
        Panel;

    /** Get an Array of all the panel items in the header. */
    getHeaderPanels(): Array<Panel>;

    /** Adds a panel item to the header. */
    addHeaderPanel(options: { item: Object, visible?: boolean, priority?: number }):
        Panel;

    /** Get an Array of all the panel items in the footer. */
    getFooterPanels(): Array<Panel>;

    /** Adds a panel item to the footer. */
    addFooterPanel(options: { item: Object, visible?: boolean, priority?: number }):
        Panel;

    /** Get an Array of all the modal panel items. */
    getModalPanels(): Array<Panel>;

    /** Adds a panel item as a modal dialog. */
    addModalPanel(options: { item: Object, visible?: boolean, priority?: number }):
        Panel;

    /** Returns the Panel associated with the given item or null when the item
     *  has no panel. */
    panelForItem(item: Object): Panel|null;

    // Searching and Replacing ================================================
    /** Performs a search across all files in the workspace. */
    scan(regex: RegExp, iterator: Function): Promise<{ cancel: () => void }>;
    /** Performs a search across all files in the workspace. */
    scan(regex: RegExp, options: {
        paths: Array<string>,
        onPathsSearched?: (pathsSearched: number) => void
      }, iterator: Function): Promise<{ cancel: () => void }>;

    // TODO(glen): figure out what arguments the iterator here is actually being passed
    /** Performs a replace across all the specified files in the project. */
    replace(regex: RegExp, replacementText: string, filePaths: Array<string>,
        iterator: Function): Promise<undefined>;
  }

  /** Experimental: This global registry tracks registered TextEditors. */
  class TextEditorRegistry {
    // Managing Text Editors ==================================================
    /** Remove all editors from the registry. */
    clear(): void;

    /** Register a TextEditor. */
    add(editor: TextEditor): AtomEventKit.Disposable;

    /** Remove the given TextEditor from the registry. */
    remove(editor: TextEditor): boolean;

    /** Keep a TextEditor's configuration in sync with Atom's settings. */
    maintainConfig(editor: TextEditor): AtomEventKit.Disposable;

    /** Set a TextEditor's grammar based on its path and content, and continue
     *  to update its grammar as gramamrs are added or updated, or the editor's
     *  file path changes. */
    maintainGrammar(editor: TextEditor): AtomEventKit.Disposable;

    /** Force a TextEditor to use a different grammar than the one that would
     *  otherwise be selected for it. */
    setGrammarOverride(editor: TextEditor, scopeName: string): void;

    /** Retrieve the grammar scope name that has been set as a grammar override
     *  for the given TextEditor. */
    getGrammarOverride(editor: TextEditor): string|null;

    /** Remove any grammar override that has been set for the given {TextEditor}. */
    clearGrammarOverride(editor: TextEditor): void;

    // Event Subscription =====================================================
    /** Invoke the given callback with all the current and future registered TextEditors. */
    observe(callback: (editor: TextEditor) => void): AtomEventKit.Disposable;
  }

  /** Atom global for dealing with packages, themes, menus, and the window.
   *  An instance of this class is always available as the atom global. */
  class AtomEnvironment {
    // Properties =============================================================
    /** A CommandRegistry instance. */
    commands: CommandRegistry;
    /** A Config instance. */
    config: Config;
    /** A Clipboard instance. */
    clipboard: Clipboard;
    /** A ContextMenuManager instance. */
    contextMenu: ContextMenuManager;
    /** A MenuManager instance. */
    menu: MenuManager;
    /** A KeymapManager instance. */
    keymaps: KeymapManager;
    /** A TooltipManager instance. */
    tooltips: TooltipManager;
    /** A NotificationManager instance. */
    notifications: NotificationManager;
    /** A Project instance. */
    project: Project;
    /** A GrammarRegistry instance. */
    grammars: GrammarRegistry;
    /** A PackageManager instance. */
    packages: PackageManager;
    /** A ThemeManager instance. */
    themes: ThemeManager;
    /** A StyleManager instance. */
    styles: StyleManager;
    /** A DeserializerManager instance. */
    deserializers: DeserializerManager;
    /** A ViewRegistry instance. */
    views: ViewRegistry;
    /** A Workspace instance. */
    workspace: Workspace;
    /** A TextEditorRegistry instance. */
    textEditors: TextEditorRegistry;

    // Event Subscription =====================================================
    /** Invoke the given callback whenever ::beep is called. */
    onDidBeep(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when there is an unhandled error, but before
     *  the devtools pop open. */
    onWillThrowError(callback: (event: CallbackArgs.AEPreventableThrownError) =>
        void): AtomEventKit.Disposable;

    /** Invoke the given callback whenever there is an unhandled error. */
    onDidThrowError(callback: (event: CallbackArgs.AEThrownError) => void):
        AtomEventKit.Disposable;

    // Atom Details ===========================================================
    /** Returns a boolean that is true if the current window is in development mode. */
    inDevMode(): boolean;

    /** Returns a boolean that is true if the current window is in safe mode. */
    inSafeMode(): boolean;

    /** Returns a boolean that is true if the current window is running specs. */
    inSpecMode(): boolean;

    /** Get the version of the Atom application. */
    getVersion(): string;

    /** Returns a boolean that is true if the current version is an official release. */
    isReleasedVersion(): boolean;

    /** Get the time taken to completely load the current window. */
    getWindowLoadTime(): number;

    /** Get the load settings for the current window. */
    getLoadSettings(): Object;

    // Managing the Atom Window ===============================================
    /** Open a new Atom window using the given options. */
    open(params: {
        pathsToOpen: Array<string>,
        newWindow: boolean,
        devMode: boolean,
        safeMode: boolean
      }): void;

    /** Close the current window. */
    close(): void;

    /** Get the size of current window. */
    getSize(): { width: number, height: number };

    /** Set the size of current window. */
    setSize(width: number, height: number): void;

    /** Get the position of current window. */
    getPosition(): { x: number, y: number };

    /** Set the position of current window. */
    setPosition(x: number, y: number): void;

    /** Prompt the user to select one or more folders. */
    pickFolder(callback: (paths: Array<string>|null) => void): void;

    /** Get the current window. */
    getCurrentWindow(): Object; // This is from the Electron API, I think.

    /** Move current window to the center of the screen. */
    center(): void;

    /** Focus the current window. */
    focus(): void;

    /** Show the current window. */
    show(): void;

    /** Hide the current window. */
    hide(): void;

    /** Reload the current window. */
    reload(): void;

    /** Relaunch the entire application. */
    restartApplication(): void;

    /** Returns a boolean that is true if the current window is maximized. */
    isMaximized(): boolean;

    /** Returns a boolean that is true if the current window is in full screen mode. */
    isFullScreen(): boolean;

    /** Set the full screen state of the current window. */
    setFullScreen(fullScreen: boolean): void;

    /** Toggle the full screen state of the current window. */
    toggleFullScreen(): void;

    // Messaging the User =====================================================
    /** Visually and audibly trigger a beep. */
    beep(): void;

    /** A flexible way to open a dialog akin to an alert dialog.
     *  Returns the chosen button index number if the buttons option was an array. */
    confirm(options: {
        message: string,
        detailedMessage?: string,
        buttons?: Array<string>
      }): number;

    /** A flexible way to open a dialog akin to an alert dialog.
     *  Returns the chosen button index number if the buttons option was an array. */
    confirm(options: {
        message: string,
        detailedMessage?: string,
        buttons?: Object,
      }): number;

    // Managing the Dev Tools =================================================
    // TODO(glen): get the actual types for the following three.
    /** Open the dev tools for the current window. */
    openDevTools(): Promise<undefined>;

    /** Toggle the visibility of the dev tools for the current window. */
    toggleDevTools(): Promise<undefined>;

    /** Execute code in dev tools. */
    executeJavaScriptInDevTools(code: any): any;

  }
}

declare var atom: AtomCore.AtomEnvironment

declare module "atom" {
  /** Represents a point in a buffer in row/column coordinates. */
  export class Point extends TextBuffer.Point {}

  /** Represents a region in a buffer in row/column coordinates. */
  export class Range extends TextBuffer.Range {}

  /** A handle to a resource that can be disposed. */
  export class Disposable extends AtomEventKit.Disposable {}

  /** An object that aggregates multiple Disposable instances together into a
   *  single disposable, so they can all be disposed as a group. */
  export class CompositeDisposable extends AtomEventKit.CompositeDisposable {}

  /** Utility class to be used when implementing event-based APIs that allows
   *  for handlers registered via ::on to be invoked with calls to ::emit. */
  export class Emitter extends AtomEventKit.Emitter {}

  /** Represents an individual file that can be watched, read from, and written to. */
  export class File extends PathWatcher.File {}

  /** Represents a directory on disk that can be watched for changes. */
  export class Directory extends PathWatcher.Directory {}
}
