// Type definitions for Atom v1.15.0
// Project: https://github.com/atom/atom/tree/v1.15.0
// Definitions by: GlenCFL <https://github.com/GlenCFL/>

// NOTE: the View essential class is missing from these type definitions.

/// <reference types="node" />
/// <reference path="../text-buffer/index.d.ts" />
/// <reference path="../event-kit/index.d.ts" />

// API Documentation: https://atom.io/docs/api/v1.15.0/
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
  namespace Params {
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

    interface CursorChangeEvent {
      oldBufferPosition: TextBuffer.Point
      oldScreenPosition: TextBuffer.Point
      newBufferPosition: TextBuffer.Point
      newScreenPosition: TextBuffer.Point
      textChanged: boolean
      Cursor:	Cursor
    }

    interface SelectionChangeEvent {
      oldBufferRange: TextBuffer.Range
      oldScreenRange: TextBuffer.Range
      newBufferRange: TextBuffer.Range
      newScreenRange: TextBuffer.Range
      selection: Selection
    }

    interface DisplayMarkerChangeEvent {
      /** Point representing the former head buffer position. */
      oldHeadBufferPosition: TextBuffer.Point
      /** Point representing the new head buffer position. */
      newHeadBufferPosition: TextBuffer.Point
      // Point representing the former tail buffer position. */
      oldTailBufferPosition: TextBuffer.Point
      /** Point representing the new tail buffer position. */
      newTailBufferPosition: TextBuffer.Point
      /** Point representing the former head screen position. */
      oldHeadScreenPosition: TextBuffer.Point
      /** Point representing the new head screen position. */
      newHeadScreenPosition: TextBuffer.Point
      /** Point representing the former tail screen position. */
      oldTailScreenPosition: TextBuffer.Point
      /** Point representing the new tail screen position. */
      newTailScreenPosition: TextBuffer.Point
      /** Boolean indicating whether the marker was valid before the change. */
      wasValid: boolean
      /** Boolean indicating whether the marker is now valid. */
      isValid: boolean
      /** Boolean indicating whether the marker had a tail before the change. */
      hadTail: boolean
      /** Boolean indicating whether the marker now has a tail */
      hasTail: boolean
      /** Object containing the marker's custom properties before the change. */
      oldProperties: Object
      /** Object containing the marker's custom properties after the change. */
      newProperties: Object
      /** Boolean indicating whether this change was caused by a textual change to the
       *  buffer or whether the marker was manipulated directly via its public API. */
      textChanged: boolean
    }

    interface DecorationChangeEvent {
      /** Object the old parameters the decoration used to have. */
      oldProperties: Object
      /** Object the new parameters the decoration now has */
      newProperties: Object
    }

    interface MarkerProperties {
      /** Only include markers starting at this Point in buffer coordinates. */
      startBufferPosition?: TextBuffer.IPoint|[number, number]
      /** Only include markers ending at this Point in buffer coordinates. */
      endBufferPosition?: TextBuffer.IPoint|[number, number]
      /** Only include markers starting at this Point in screen coordinates. */
      startScreenPosition?: TextBuffer.IPoint|[number, number]
      /** Only include markers ending at this Point in screen coordinates. */
      endScreenPosition?: TextBuffer.IPoint|[number, number]
      /** Only include markers starting at this row in buffer coordinates. */
      startBufferRow?: number
      /** Only include markers ending at this row in buffer coordinates. */
      endBufferRow?: number
      /** Only include markers starting at this row in screen coordinates. */
      startScreenRow?: number
      /** Only include markers ending at this row in screen coordinates. */
      endScreenRow?: number
      /** Only include markers intersecting this Array of [startRow, endRow] in
       *  buffer coordinates. */
      intersectsBufferRowRange?: [number, number]
      /** Only include markers intersecting this Array of [startRow, endRow] in
       *  screen coordinates. */
      intersectsScreenRowRange?: [number, number]
      /** Only include markers containing this Range in buffer coordinates. */
      containsBufferRange?: TextBuffer.IRange|[TextBuffer.IPoint, TextBuffer.IPoint]|
          [TextBuffer.IPoint, [number, number]]|[[number, number], TextBuffer.IPoint]|
          [[number, number], [number, number]]
      /** Only include markers containing this Point in buffer coordinates. */
      containsBufferPosition?: TextBuffer.IPoint|[number, number]
      /** Only include markers contained in this Range in buffer coordinates. */
      containedInBufferRange?: TextBuffer.IRange|[TextBuffer.IPoint, TextBuffer.IPoint]|
          [TextBuffer.IPoint, [number, number]]|[[number, number], TextBuffer.IPoint]|
          [[number, number], [number, number]]
      /** Only include markers contained in this Range in screen coordinates. */
      containedInScreenRange?: TextBuffer.IRange|[TextBuffer.IPoint, TextBuffer.IPoint]|
          [TextBuffer.IPoint, [number, number]]|[[number, number], TextBuffer.IPoint]|
          [[number, number], [number, number]]
      /** Only include markers intersecting this Range in buffer coordinates. */
      intersectsBufferRange?: TextBuffer.IRange|[TextBuffer.IPoint, TextBuffer.IPoint]|
          [TextBuffer.IPoint, [number, number]]|[[number, number], TextBuffer.IPoint]|
          [[number, number], [number, number]]
      /** Only include markers intersecting this Range in screen coordinates. */
      intersectsScreenRange?: TextBuffer.IRange|[TextBuffer.IPoint, TextBuffer.IPoint]|
          [TextBuffer.IPoint, [number, number]]|[[number, number], TextBuffer.IPoint]|
          [[number, number], [number, number]]
    }

    interface TextInsertion {
      select?: boolean
      autoIndent?: boolean
      autoIndentNewline?: boolean
      autoDecreaseIndent?: boolean
      normalizeLineEndings?: boolean
      undo?: "skip"
    }

    interface SharedDecorationOptions {
      /** This CSS class will be applied to the decorated line number, line, highlight,
       *  or overlay. */
      class: string
      /** An HTMLElement or a model Object with a corresponding view registered. Only
       *  applicable to the gutter, overlay and block types. */
      item?: HTMLElement
      /** If true, the decoration will only be applied to the head of the DisplayMarker.
       *  Only applicable to the line and line-number types. */
      onlyHead?: boolean
      /** If true, the decoration will only be applied if the associated DisplayMarker
       *  is empty. Only applicable to the gutter, line, and line-number types. */
      onlyEmpty?: boolean
      /** If true, the decoration will only be applied if the associated DisplayMarker
       *  is non-empty. Only applicable to the gutter, line, and line-number types. */
      onlyNonEmpty?: boolean
      /** Only applicable to decorations of type overlay and block. Controls where the
       *  view is positioned relative to the TextEditorMarker. Values can be
       *  'head' (the default) or 'tail' for overlay decorations, and 'before' (the default)
       *  or 'after' for block decorations. */
      position?: "head"|"tail"|"before"|"after"
      /** Only applicable to decorations of type overlay. Determines whether the decoration
       *  adjusts its horizontal or vertical position to remain fully visible when it would
       *  otherwise overflow the editor. Defaults to true. */
      avoidOverflow?: boolean
    }

    interface DecorationOptions extends SharedDecorationOptions {
      /** One of several supported decoration types. */
      type: "line"|"line-number"|"highlight"|"overlay"|"gutter"|"block"
      /** The name of the gutter we're decorating, if type is "gutter". */
      gutterName: string
    }

    interface DecorationLayerOptions extends SharedDecorationOptions {
      /** One of several supported decoration types. */
      type: "line"|"line-number"|"highlight"|"block"
    }
  }

  // Base Classes =============================================================
  /** Wraps an Array of Strings. The Array describes a path from the root of the
   *  syntax tree to a token including all scope names for the entire path. */
  class ScopeDescriptor {
    scopes: Array<string>;

    constructor(object: { scopes: Array<string> });

    /** Returns all scopes for this descriptor. */
    getScopesArray(): Array<string>;
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
    onDidChangeStatus(callback: (event: Params.GRChangeEvent) => void):
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
    // Properties =============================================================
    readonly name: string;
    readonly packageName: string;
    readonly path: string;
    readonly scopeName: string;

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
    rebuild(): Promise<{ code: number, stdout: string, stderr: string }>;

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
    onDidAddItem(callback: (event: Params.PaneItemListEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when an item is removed from the pane. */
    onDidRemoveItem(callback: (event: Params.PaneItemListEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback before an item is removed from the pane. */
    onWillRemoveItem(callback: (event: Params.PaneItemListEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when an item is moved within the pane. */
    onDidMoveItem(callback: (event: Params.PaneItemMoveEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback with all current and future items. */
    observeItems(callback: (item: Object) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the value of ::getActiveItem changes. */
    onDidChangeActiveItem(callback: (activeItem: Object) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when ::activateNextRecentlyUsedItem has been called,
     *  either initiating or continuing a forward MRU traversal of pane items. */
    onChooseNextMRUItem(callback: (nextRecentlyUsedItem: Object) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when ::activatePreviousRecentlyUsedItem has been called,
     *  either initiating or continuing a reverse MRU traversal of pane items. */
    onChooseLastMRUItem(callback: (previousRecentlyUsedItem: Object) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when ::moveActiveItemToTopOfStack has been called,
     *  terminating an MRU traversal of pane items and moving the current active item
     *  to the top of the stack. Typically bound to a modifier (e.g. CTRL) key up event. */
    onDoneChoosingMRUItem(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback with the current and future values of ::getActiveItem. */
    observeActiveItem(callback: (activeItem: Object) => void): AtomEventKit.Disposable;

    /** Invoke the given callback before items are destroyed. */
    onWillDestroyItem(callback: (event: Params.PaneItemListEvent) => void):
        AtomEventKit.Disposable;

    // Items ==================================================================
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
    visible: boolean;

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
    onDidChange(callback: (event: Array<Params.TEDidChange>) => void):
        AtomEventKit.Disposable;

    /** Invoke callback when the buffer's contents change. It is emit
     *  asynchronously 300ms after the last buffer change. This is a good place
     *  to handle changes to the buffer without compromising typing performance. */
    onDidStopChanging(callback: (event: Params.TEStoppedChangesEvent) => void):
        AtomEventKit.Disposable;

    /** Calls your callback when a Cursor is moved. If there are multiple cursors,
     *  your callback will be called for each cursor. */
    onDidChangeCursorPosition(callback: (event: Params.CursorChangeEvent) => void):
        AtomEventKit.Disposable;

    /** Calls your callback when a selection's screen range changes. */
    onDidChangeSelectionRange(callback: (event: Params.SelectionChangeEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback after the buffer is saved to disk. */
    onDidSave(callback: (event: { path: string }) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the editor is destroyed. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;

    /** Retrieves the current TextBuffer. */
    getBuffer(): TextBuffer.TextBuffer;

    /** Calls your callback when a Gutter is added to the editor. Immediately calls
     *  your callback for each existing gutter. */
    observeGutters(callback: (gutter: Gutter) => void): AtomEventKit.Disposable;

    /** Calls your callback when a Gutter is added to the editor. */
    onDidAddGutter(callback: (gutter: Gutter) => void): AtomEventKit.Disposable;

    /** Calls your callback when a Gutter is removed from the editor. */
    onDidRemoveGutter(callback: (name: string) => void): AtomEventKit.Disposable;

    /** Calls your callback when soft wrap was enabled or disabled. */
    onDidChangeSoftWrapped(callback: (softWrapped: boolean) => void):
        AtomEventKit.Disposable;

    /** Calls your callback when the buffer's encoding has changed. */
    onDidChangeEncoding(callback: (encoding: string) => void): AtomEventKit.Disposable;

    /** Calls your callback when the grammar that interprets and colorizes the text
     *  has been changed. Immediately calls your callback with the current grammar. */
    observeGrammar(callback: (grammar: Grammar) => void): AtomEventKit.Disposable;

    /** Calls your callback when the grammar that interprets and colorizes the text
     *  has been changed. */
    onDidChangeGrammar(callback: (grammar: Grammar) => void): AtomEventKit.Disposable;

    /** Calls your callback when the result of ::isModified changes. */
    onDidChangeModified(callback: (modified: boolean) => void): AtomEventKit.Disposable;

    /** Calls your callback when the buffer's underlying file changes on disk at a
     *  moment when the result of ::isModified is true. */
    onDidConflict(callback: () => void): AtomEventKit.Disposable;

    /** Calls your callback before text has been inserted. */
    onWillInsertText(callback: (event: { text: string, cancel: Function }) => void):
        AtomEventKit.Disposable;

    /** Calls your callback after text has been inserted. */
    onDidInsertText(callback: (event: { text: string }) => void): AtomEventKit.Disposable;

    /** Calls your callback when a Cursor is added to the editor. Immediately calls
     *  your callback for each existing cursor. */
    observeCursors(callback: (cursor: Cursor) => void): AtomEventKit.Disposable;

    /** Calls your callback when a Cursor is added to the editor. */
    onDidAddCursor(callback: (cursor: Cursor) => void): AtomEventKit.Disposable;

    /** Calls your callback when a Cursor is removed from the editor. */
    onDidRemoveCursor(callback: (cursor: Cursor) => void): AtomEventKit.Disposable;

    /** Calls your callback when a Selection is added to the editor. Immediately
     *  calls your callback for each existing selection. */
    observeSelections(callback: (selection: Selection) => void): AtomEventKit.Disposable;

    /** Calls your callback when a Selection is added to the editor. */
    onDidAddSelection(callback: (selection: Selection) => void): AtomEventKit.Disposable;

    /** Calls your callback when a Selection is removed from the editor. */
    onDidRemoveSelection(callback: (selection: Selection) => void):
        AtomEventKit.Disposable;

    /** Calls your callback with each Decoration added to the editor. Calls your
     *  callback immediately for any existing decorations. */
    observeDecorations(callback: (decoration: Decoration) => void): AtomEventKit.Disposable;

    /** Calls your callback when a Decoration is added to the editor. */
    onDidAddDecoration(callback: (decoration: Decoration) => void): AtomEventKit.Disposable;

    /** Calls your callback when a Decoration is removed from the editor. */
    onDidRemoveDecoration(callback: (decoration: Decoration) => void):
        AtomEventKit.Disposable;

    /** Calls your callback when the placeholder text is changed. */
    onDidChangePlaceholderText(callback: (placeholderText: string) => void):
        AtomEventKit.Disposable;

    // File Details ===========================================================
    /** Get the editor's title for display in other parts of the UI such as the tabs.
     *  If the editor's buffer is saved, its title is the file name. If it is unsaved,
     *  its title is "untitled". */
    getTitle(): string;

    /** Get unique title for display in other parts of the UI, such as the window title.
     *  If the editor's buffer is unsaved, its title is "untitled" If the editor's
     *  buffer is saved, its unique title is formatted as one of the following,
     *
     *  "" when it is the only editing buffer with this file name.
     *  " — " when other buffers have this file name. */
    getLongTitle(): string;

    /** Returns the string path of this editor's text buffer. */
    getPath(): string|undefined;

    /** Returns boolean true if this editor has been modified. */
    isModified(): boolean;

    /** Returns boolean true if this editor has no content. */
    isEmpty(): boolean;

    /** Returns the string character set encoding of this editor's text buffer. */
    getEncoding(): string;

    /** Set the character set encoding to use in this editor's text buffer. */
    setEncoding(encoding: string): void;

    // File Operations ========================================================
    /** Saves the editor's text buffer.
     *  See TextBuffer::save for more details. */
    save(): void;

    /** Saves the editor's text buffer as the given path.
     *  See TextBuffer::saveAs for more details. */
    saveAs(filePath: string): void;

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
        normalizeLineEndings?: boolean, undo?: "skip" }): void;
    /** Set the text in the given Range in buffer coordinates. */
    setTextInBufferRange(range: [TextBuffer.IPoint, TextBuffer.IPoint],
        text: string, options?: { normalizeLineEndings?: boolean,
        undo?: "skip" }):void;
    /** Set the text in the given Range in buffer coordinates. */
    setTextInBufferRange(range: [[number, number], [number, number]],
        text: string, options?: { normalizeLineEndings?: boolean,
        undo?: "skip" }): void;
    /** Set the text in the given Range in buffer coordinates. */
    setTextInBufferRange(range: [TextBuffer.IPoint, [number, number]],
        text: string, options?: { normalizeLineEndings?: boolean,
        undo?: "skip" }): void;
    /** Set the text in the given Range in buffer coordinates. */
    setTextInBufferRange(range: [[number, number], TextBuffer.IPoint],
        text: string, options?: { normalizeLineEndings?: boolean,
        undo?: "skip" }): void;

    /* For each selection, replace the selected text with the given text. */
    insertText(text: string, options?: { select?: boolean, autoIndent?: boolean,
        autoIndentNewline?: boolean, autoDecreaseIndent?: boolean,
        normalizeLineEndings?: boolean, undo?: "skip" }): TextBuffer.Range|false;

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
    /** Undo the last change. */
    undo(): void;

    /** Redo the last change. */
    redo(): void;

    /** Batch multiple operations as a single undo/redo step.
     *  Any group of operations that are logically grouped from the perspective of undoing
     *  and redoing should be performed in a transaction. If you want to abort the transaction,
     *  call ::abortTransaction to terminate the function's execution and revert any changes
     *  performed up to the abortion. */
    transact(fn: () => void): void;
    /** Batch multiple operations as a single undo/redo step.
     *  Any group of operations that are logically grouped from the perspective of undoing
     *  and redoing should be performed in a transaction. If you want to abort the transaction,
     *  call ::abortTransaction to terminate the function's execution and revert any changes
     *  performed up to the abortion. */
    transact(groupingInterval: number, fn: () => void): void;

    /** Abort an open transaction, undoing any operations performed so far within the transaction. */
    abortTransaction(): void;

    /** Create a pointer to the current state of the buffer for use with ::revertToCheckpoint
     *  and ::groupChangesSinceCheckpoint. */
    createCheckpoint(): number;

    /** Revert the buffer to the state it was in when the given checkpoint was created.
     *  The redo stack will be empty following this operation, so changes since the checkpoint
     *  will be lost. If the given checkpoint is no longer present in the undo history, no
     *  changes will be made to the buffer and this method will return false. */
    revertToCheckpoint(checkpoint: number): boolean;

    /** Group all changes since the given checkpoint into a single transaction for purposes
     *  of undo/redo.
     *  If the given checkpoint is no longer present in the undo history, no grouping will be
     *  performed and this method will return false. */
    groupChangesSinceCheckpoint(checkpoint: number): boolean;

    // TextEditor Coordinates =================================================
    /** Convert a position in buffer-coordinates to screen-coordinates. */
    screenPositionForBufferPosition(bufferPosition: TextBuffer.IPoint, options?:
        { clipDirection: "backward"|"forward"|"closest"}): TextBuffer.Point;
    /** Convert a position in buffer-coordinates to screen-coordinates. */
    screenPositionForBufferPosition(bufferPosition: [number, number], options?:
        { clipDirection: "backward"|"forward"|"closest"}): TextBuffer.Point;

    /** Convert a position in screen-coordinates to buffer-coordinates. */
    bufferPositionForScreenPosition(bufferPosition: TextBuffer.IPoint, options?:
        { clipDirection: "backward"|"forward"|"closest"}): TextBuffer.Point;
    /** Convert a position in screen-coordinates to buffer-coordinates. */
    bufferPositionForScreenPosition(bufferPosition: [number, number], options?:
        { clipDirection: "backward"|"forward"|"closest"}): TextBuffer.Point;

    /** Convert a range in buffer-coordinates to screen-coordinates. */
    screenRangeForBufferRange(bufferRange: TextBuffer.IRange): TextBuffer.Range;
    /** Convert a range in buffer-coordinates to screen-coordinates. */
    screenRangeForBufferRange(bufferRange: [TextBuffer.IPoint, TextBuffer.IPoint]):
        TextBuffer.Range;
    /** Convert a range in buffer-coordinates to screen-coordinates. */
    screenRangeForBufferRange(bufferRange: [TextBuffer.IPoint, [number, number]]):
        TextBuffer.Range;
    /** Convert a range in buffer-coordinates to screen-coordinates. */
    screenRangeForBufferRange(bufferRange: [[number, number], TextBuffer.IPoint]):
        TextBuffer.Range;
    /** Convert a range in buffer-coordinates to screen-coordinates. */
    screenRangeForBufferRange(bufferRange: [[number, number], [number, number]]):
        TextBuffer.Range;

    /** Convert a range in screen-coordinates to buffer-coordinates. */
    bufferRangeForScreenRange(screenRange: TextBuffer.IRange): TextBuffer.Range;
    /** Convert a range in screen-coordinates to buffer-coordinates. */
    bufferRangeForScreenRange(screenRange: [TextBuffer.IPoint, TextBuffer.IPoint]):
        TextBuffer.Range;
    /** Convert a range in screen-coordinates to buffer-coordinates. */
    bufferRangeForScreenRange(screenRange: [TextBuffer.IPoint, [number, number]]):
        TextBuffer.Range;
    /** Convert a range in screen-coordinates to buffer-coordinates. */
    bufferRangeForScreenRange(screenRange: [[number, number], TextBuffer.IPoint]):
        TextBuffer.Range;
    /** Convert a range in screen-coordinates to buffer-coordinates. */
    bufferRangeForScreenRange(screenRange: [[number, number], [number, number]]):
        TextBuffer.Range;

    /** Clip the given Point to a valid position in the buffer. */
    clipBufferPosition(bufferPosition: TextBuffer.IPoint): TextBuffer.Point;
    /** Clip the given Point to a valid position in the buffer. */
    clipBufferPosition(bufferPosition: [number, number]): TextBuffer.Point;

    /** Clip the start and end of the given range to valid positions in the buffer.
     *  See ::clipBufferPosition for more information. */
    clipBufferRange(range: TextBuffer.IRange): TextBuffer.Range;
    /** Clip the start and end of the given range to valid positions in the buffer.
     *  See ::clipBufferPosition for more information. */
    clipBufferRange(range: [TextBuffer.IPoint, TextBuffer.IPoint]): TextBuffer.Range;
    /** Clip the start and end of the given range to valid positions in the buffer.
     *  See ::clipBufferPosition for more information. */
    clipBufferRange(range: [TextBuffer.IPoint, [number, number]]): TextBuffer.Range;
    /** Clip the start and end of the given range to valid positions in the buffer.
     *  See ::clipBufferPosition for more information. */
    clipBufferRange(range: [[number, number], TextBuffer.IPoint]): TextBuffer.Range;
    /** Clip the start and end of the given range to valid positions in the buffer.
     *  See ::clipBufferPosition for more information. */
    clipBufferRange(range: [[number, number], [number, number]]): TextBuffer.Range;

    /** Clip the given Point to a valid position on screen. */
    clipScreenPosition(screenPosition: TextBuffer.IPoint, options?:
        { clipDirection: "backward"|"forward"|"closest"}): TextBuffer.Point;
    /** Clip the given Point to a valid position on screen. */
    clipScreenPosition(screenPosition: [number, number], options?:
        { clipDirection: "backward"|"forward"|"closest"}): TextBuffer.Point;

    /** Clip the start and end of the given range to valid positions on screen.
     *  See ::clipScreenPosition for more information. */
    clipScreenRange(range: TextBuffer.IRange, options?:
        { clipDirection: "backward"|"forward"|"closest"}): TextBuffer.Range;
    /** Clip the start and end of the given range to valid positions on screen.
     *  See ::clipScreenPosition for more information. */
    clipScreenRange(range: [TextBuffer.IPoint, TextBuffer.IPoint], options?:
        { clipDirection: "backward"|"forward"|"closest"}): TextBuffer.Range;
    /** Clip the start and end of the given range to valid positions on screen.
     *  See ::clipScreenPosition for more information. */
    clipScreenRange(range: [TextBuffer.IPoint, [number, number]], options?:
        { clipDirection: "backward"|"forward"|"closest"}): TextBuffer.Range;
    /** Clip the start and end of the given range to valid positions on screen.
     *  See ::clipScreenPosition for more information. */
    clipScreenRange(range: [[number, number], TextBuffer.IPoint], options?:
        { clipDirection: "backward"|"forward"|"closest"}): TextBuffer.Range;
    /** Clip the start and end of the given range to valid positions on screen.
     *  See ::clipScreenPosition for more information. */
    clipScreenRange(range: [[number, number], [number, number]], options?:
        { clipDirection: "backward"|"forward"|"closest"}): TextBuffer.Range;

    // Decorations ============================================================
    /** Add a decoration that tracks a DisplayMarker. When the marker moves, is
     *  invalidated, or is destroyed, the decoration will be updated to reflect
     *  the marker's state. */
    decorateMarker(marker: DisplayMarker, decorationParams: Params.DecorationOptions):
        Decoration;

    /** Add a decoration to every marker in the given marker layer. Can be used to
     *  decorate a large number of markers without having to create and manage many
     *  individual decorations. */
    decorateMarkerLayer(markerLayer: TextBuffer.MarkerLayer|DisplayMarkerLayer,
        decorationParams: Params.DecorationLayerOptions): LayerDecoration;

    /** Get all decorations. */
    getDecorations(propertyFilter?: Params.DecorationOptions): Array<Decoration>;

    /** Get all decorations of type 'line'. */
    getLineDecorations(propertyFilter?: Params.DecorationOptions): Array<Decoration>;

    /** Get all decorations of type 'line-number'. */
    getLineNumberDecorations(propertyFilter?: Params.DecorationOptions): Array<Decoration>;

    /** Get all decorations of type 'highlight'. */
    getHighlightDecorations(propertyFilter?: Params.DecorationOptions): Array<Decoration>;

    /** Get all decorations of type 'overlay'. */
    getOverlayDecorations(propertyFilter?: Params.DecorationOptions): Array<Decoration>;

    // Markers ================================================================
    /** Create a marker on the default marker layer with the given range in buffer coordinates.
     *  This marker will maintain its logical location as the buffer is changed, so if you mark
     *  a particular word, the marker will remain over that word even if the word's location
     *  in the buffer changes. */
    markBufferRange(range: TextBuffer.IRange, properties?: { maintainHistory?: boolean,
        reversed?: boolean, invalidate?: "never"|"surround"|"overlap"|"inside"|"touch" }):
        DisplayMarker;
    /** Create a marker on the default marker layer with the given range in buffer coordinates.
     *  This marker will maintain its logical location as the buffer is changed, so if you mark
     *  a particular word, the marker will remain over that word even if the word's location
     *  in the buffer changes. */
    markBufferRange(range: [TextBuffer.IPoint, TextBuffer.IPoint], properties?: {
        maintainHistory?: boolean, reversed?: boolean, invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch" }): DisplayMarker;
    /** Create a marker on the default marker layer with the given range in buffer coordinates.
     *  This marker will maintain its logical location as the buffer is changed, so if you mark
     *  a particular word, the marker will remain over that word even if the word's location
     *  in the buffer changes. */
    markBufferRange(range: [TextBuffer.IPoint, [number, number]], properties?: {
        maintainHistory?: boolean, reversed?: boolean, invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch" }): DisplayMarker;
    /** Create a marker on the default marker layer with the given range in buffer coordinates.
     *  This marker will maintain its logical location as the buffer is changed, so if you mark
     *  a particular word, the marker will remain over that word even if the word's location
     *  in the buffer changes. */
    markBufferRange(range: [[number, number], TextBuffer.IPoint], properties?: {
        maintainHistory?: boolean, reversed?: boolean, invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch" }): DisplayMarker;
    /** Create a marker on the default marker layer with the given range in buffer coordinates.
     *  This marker will maintain its logical location as the buffer is changed, so if you mark
     *  a particular word, the marker will remain over that word even if the word's location
     *  in the buffer changes. */
    markBufferRange(range: [[number, number], [number, number]], properties?: {
        maintainHistory?: boolean, reversed?: boolean, invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch" }): DisplayMarker;

    /** Create a marker on the default marker layer with the given range in screen coordinates.
     *  This marker will maintain its logical location as the buffer is changed, so if you mark
     *  a particular word, the marker will remain over that word even if the word's location in
     *  the buffer changes. */
    markScreenRange(range: TextBuffer.IRange, properties?: { maintainHistory?: boolean,
        reversed?: boolean, invalidate?: "never"|"surround"|"overlap"|"inside"|"touch" }):
        DisplayMarker;
    /** Create a marker on the default marker layer with the given range in screen coordinates.
     *  This marker will maintain its logical location as the buffer is changed, so if you mark
     *  a particular word, the marker will remain over that word even if the word's location in
     *  the buffer changes. */
    markScreenRange(range: [TextBuffer.IPoint, TextBuffer.IPoint], properties?: {
        maintainHistory?: boolean, reversed?: boolean, invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch" }): DisplayMarker;
    /** Create a marker on the default marker layer with the given range in screen coordinates.
     *  This marker will maintain its logical location as the buffer is changed, so if you mark
     *  a particular word, the marker will remain over that word even if the word's location in
     *  the buffer changes. */
    markScreenRange(range: [TextBuffer.IPoint, [number, number]], properties?: {
        maintainHistory?: boolean, reversed?: boolean, invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch" }): DisplayMarker;
    /** Create a marker on the default marker layer with the given range in screen coordinates.
     *  This marker will maintain its logical location as the buffer is changed, so if you mark
     *  a particular word, the marker will remain over that word even if the word's location in
     *  the buffer changes. */
    markScreenRange(range: [[number, number], TextBuffer.IPoint], properties?: {
        maintainHistory?: boolean, reversed?: boolean, invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch" }): DisplayMarker;
    /** Create a marker on the default marker layer with the given range in screen coordinates.
     *  This marker will maintain its logical location as the buffer is changed, so if you mark
     *  a particular word, the marker will remain over that word even if the word's location in
     *  the buffer changes. */
    markScreenRange(range: [[number, number], [number, number]], properties?: {
        maintainHistory?: boolean, reversed?: boolean, invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch" }): DisplayMarker;

    /** Create a marker on the default marker layer with the given buffer position and no tail.
     *  To group multiple markers together in their own private layer, see ::addMarkerLayer. */
    markBufferPosition(bufferPosition: TextBuffer.IPoint, options?: { invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch" }): DisplayMarker;
    /** Create a marker on the default marker layer with the given buffer position and no tail.
     *  To group multiple markers together in their own private layer, see ::addMarkerLayer. */
    markBufferPosition(bufferPosition: [number, number], options?: { invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch" }): DisplayMarker;

    /** Create a marker on the default marker layer with the given screen position and no tail.
     *  To group multiple markers together in their own private layer, see ::addMarkerLayer. */
    markScreenPosition(screenPosition: TextBuffer.IPoint, options?: { invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch", clipDirection?:
        "backward"|"forward"|"closest" }): DisplayMarker;
    /** Create a marker on the default marker layer with the given screen position and no tail.
     *  To group multiple markers together in their own private layer, see ::addMarkerLayer. */
    markScreenPosition(screenPosition: [number, number], options?: { invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch", clipDirection?:
        "backward"|"forward"|"closest" }): DisplayMarker;

    /** Find all DisplayMarkers on the default marker layer that match the given properties.
     *
     *  This method finds markers based on the given properties. Markers can be associated
     *  with custom properties that will be compared with basic equality. In addition, there
     *  are several special properties that will be compared with the range of the markers
     *  rather than their properties. */
    findMarkers(properties: Params.MarkerProperties): DisplayMarker[];

    /** Create a marker layer to group related markers. */
    addMarkerLayer(options?: { maintainHistory?: boolean, persistent?: boolean }):
        DisplayMarkerLayer;

    /** Get a DisplayMarkerLayer by id. */
    getMarkerLayer(id: number): DisplayMarkerLayer|undefined;

    /** Get the default DisplayMarkerLayer.
     *  All marker APIs not tied to an explicit layer interact with this default layer. */
    getDefaultMarkerLayer(): DisplayMarkerLayer;

    /** Get the DisplayMarker on the default layer for the given marker id. */
    getMarker(id: number): DisplayMarker;

    /** Get all DisplayMarkers on the default marker layer. Consider using ::findMarkers. */
    getMarkers(): DisplayMarker[];

    /** Get the number of markers in the default marker layer. */
    getMarkerCount(): number;

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
    getCursorAtScreenPosition(position: TextBuffer.IPoint): Cursor|undefined;
    /** Get a Cursor at given screen coordinates Point. */
    getCursorAtScreenPosition(position: [number, number]): Cursor|undefined;

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
    addCursorAtBufferPosition(bufferPosition: TextBuffer.IPoint): Cursor;
    /** Add a cursor at the given position in buffer coordinates. */
    addCursorAtBufferPosition(bufferPosition: [number, number]): Cursor;

    /** Add a cursor at the position in screen coordinates. */
    addCursorAtScreenPosition(screenPosition: TextBuffer.IPoint): Cursor;
    /** Add a cursor at the position in screen coordinates. */
    addCursorAtScreenPosition(screenPosition: [number, number]): Cursor;

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
    getLastCursor(): Cursor;

    /** Returns the word surrounding the most recently added cursor. */
    getWordUnderCursor(options?: { wordRegex?: RegExp,
        includeNonWordCharacters: boolean, allowPrevious: boolean }): string;

    /** Get an Array of all Cursors. */
    getCursors(): Array<Cursor>;

    /** Get all Cursorss, ordered by their position in the buffer instead of the
     *  order in which they were added. */
    getCursorsOrderedByBufferPosition(): Array<Cursor>;

    // Selections =============================================================
    /** Get the selected text of the most recently added selection. */
    getSelectedText(): string;

    /** Get the Range of the most recently added selection in buffer coordinates. */
    getSelectedBufferRange(): TextBuffer.Range;

    /** Get the Ranges of all selections in buffer coordinates.
     *  The ranges are sorted by when the selections were added. Most recent at the end. */
    getSelectedBufferRanges(): TextBuffer.Range[];

    /** Set the selected range in buffer coordinates. If there are multiple selections,
     *  they are reduced to a single selection with the given range. */
    setSelectedBufferRange(bufferRange: TextBuffer.IRange, options?:
        { reversed?: boolean, preserveFolds?: boolean}): void;
    /** Set the selected range in buffer coordinates. If there are multiple selections,
     *  they are reduced to a single selection with the given range. */
    setSelectedBufferRange(bufferRange: [TextBuffer.IPoint, TextBuffer.IPoint],
        options?: { reversed?: boolean, preserveFolds?: boolean}): void;
    /** Set the selected range in buffer coordinates. If there are multiple selections,
     *  they are reduced to a single selection with the given range. */
    setSelectedBufferRange(bufferRange: [TextBuffer.IPoint, [number, number]],
        options?: { reversed?: boolean, preserveFolds?: boolean}): void;
    /** Set the selected range in buffer coordinates. If there are multiple selections,
     *  they are reduced to a single selection with the given range. */
    setSelectedBufferRange(bufferRange: [[number, number], TextBuffer.IPoint],
        options?: { reversed?: boolean, preserveFolds?: boolean}): void;
    /** Set the selected range in buffer coordinates. If there are multiple selections,
     *  they are reduced to a single selection with the given range. */
    setSelectedBufferRange(bufferRange: [[number, number], [number, number]],
        options?: { reversed?: boolean, preserveFolds?: boolean}): void;

    /** Set the selected ranges in buffer coordinates. If there are multiple selections,
     *  they are replaced by new selections with the given ranges. */
    setSelectedBufferRanges(bufferRanges: TextBuffer.IRange[], options?:
        { reversed?: boolean, preserveFolds?: boolean}): void;
    /** Set the selected ranges in buffer coordinates. If there are multiple selections,
     *  they are replaced by new selections with the given ranges. */
    setSelectedBufferRanges(bufferRanges: [TextBuffer.IPoint, TextBuffer.IPoint][],
        options?: { reversed?: boolean, preserveFolds?: boolean}): void;
    /** Set the selected ranges in buffer coordinates. If there are multiple selections,
     *  they are replaced by new selections with the given ranges. */
    setSelectedBufferRanges(bufferRanges: [TextBuffer.IPoint, [number, number]][],
        options?: { reversed?: boolean, preserveFolds?: boolean}): void;
    /** Set the selected ranges in buffer coordinates. If there are multiple selections,
     *  they are replaced by new selections with the given ranges. */
    setSelectedBufferRanges(bufferRanges: [[number, number], TextBuffer.IPoint][],
        options?: { reversed?: boolean, preserveFolds?: boolean}): void;
    /** Set the selected ranges in buffer coordinates. If there are multiple selections,
     *  they are replaced by new selections with the given ranges. */
    setSelectedBufferRanges(bufferRanges: [[number, number], [number, number]][],
        options?: { reversed?: boolean, preserveFolds?: boolean}): void;

    /** Get the Range of the most recently added selection in screen coordinates. */
    getSelectedScreenRange(): TextBuffer.Range;

    /** Get the Ranges of all selections in screen coordinates.
     *  The ranges are sorted by when the selections were added. Most recent at the end. */
    getSelectedScreenRanges(): TextBuffer.Range[];

    /** Set the selected range in screen coordinates. If there are multiple selections,
     *  they are reduced to a single selection with the given range. */
    setSelectedScreenRange(screenRange: TextBuffer.IRange, options?:
        { reversed: boolean }): void;
    /** Set the selected range in screen coordinates. If there are multiple selections,
     *  they are reduced to a single selection with the given range. */
    setSelectedScreenRange(screenRange: [TextBuffer.IPoint, TextBuffer.IPoint],
        options?: { reversed: boolean }): void;
    /** Set the selected range in screen coordinates. If there are multiple selections,
     *  they are reduced to a single selection with the given range. */
    setSelectedScreenRange(screenRange: [TextBuffer.IPoint, [number, number]],
        options?: { reversed: boolean }): void;
    /** Set the selected range in screen coordinates. If there are multiple selections,
     *  they are reduced to a single selection with the given range. */
    setSelectedScreenRange(screenRange: [[number, number], TextBuffer.IPoint],
        options?: { reversed: boolean }): void;
    /** Set the selected range in screen coordinates. If there are multiple selections,
     *  they are reduced to a single selection with the given range. */
    setSelectedScreenRange(screenRange: [[number, number], [number, number]],
        options?: { reversed: boolean }): void;

    /** Set the selected ranges in screen coordinates. If there are multiple selections,
     *  they are replaced by new selections with the given ranges. */
    setSelectedScreenRanges(screenRanges: TextBuffer.IRange[], options?:
        { reversed: boolean }): void;
    /** Set the selected ranges in screen coordinates. If there are multiple selections,
     *  they are replaced by new selections with the given ranges. */
    setSelectedScreenRanges(screenRanges: [TextBuffer.IPoint, TextBuffer.IPoint][],
        options?: { reversed: boolean }): void;
    /** Set the selected ranges in screen coordinates. If there are multiple selections,
     *  they are replaced by new selections with the given ranges. */
    setSelectedScreenRanges(screenRanges: [TextBuffer.IPoint, [number, number]][],
        options?: { reversed: boolean }): void;
    /** Set the selected ranges in screen coordinates. If there are multiple selections,
     *  they are replaced by new selections with the given ranges. */
    setSelectedScreenRanges(screenRanges: [[number, number], TextBuffer.IPoint][],
        options?: { reversed: boolean }): void;
    /** Set the selected ranges in screen coordinates. If there are multiple selections,
     *  they are replaced by new selections with the given ranges. */
    setSelectedScreenRanges(screenRanges: [[number, number], [number, number]][],
        options?: { reversed: boolean }): void;

    /** Add a selection for the given range in buffer coordinates. */
    addSelectionForBufferRange(bufferRange: TextBuffer.IRange, options?:
        { reversed?: boolean, preserveFolds?: boolean }): Selection;
    /** Add a selection for the given range in buffer coordinates. */
    addSelectionForBufferRange(bufferRange: [TextBuffer.IPoint, TextBuffer.IPoint],
        options?: { reversed?: boolean, preserveFolds?: boolean }): Selection;
    /** Add a selection for the given range in buffer coordinates. */
    addSelectionForBufferRange(bufferRange: [TextBuffer.IPoint, [number, number]],
        options?: { reversed?: boolean, preserveFolds?: boolean }): Selection;
    /** Add a selection for the given range in buffer coordinates. */
    addSelectionForBufferRange(bufferRange: [[number, number], TextBuffer.IPoint],
        options?: { reversed?: boolean, preserveFolds?: boolean }): Selection;
    /** Add a selection for the given range in buffer coordinates. */
    addSelectionForBufferRange(bufferRange: [[number, number], [number, number]],
        options?: { reversed?: boolean, preserveFolds?: boolean }): Selection;

    /** Add a selection for the given range in screen coordinates. */
    addSelectionForScreenRange(screenRange: TextBuffer.IRange, options?:
        { reversed?: boolean, preserveFolds?: boolean }): Selection;
    /** Add a selection for the given range in screen coordinates. */
    addSelectionForScreenRange(screenRange: [TextBuffer.IPoint, TextBuffer.IPoint],
        options?: { reversed?: boolean, preserveFolds?: boolean }): Selection;
    /** Add a selection for the given range in screen coordinates. */
    addSelectionForScreenRange(screenRange: [TextBuffer.IPoint, [number, number]],
        options?: { reversed?: boolean, preserveFolds?: boolean }): Selection;
    /** Add a selection for the given range in screen coordinates. */
    addSelectionForScreenRange(screenRange: [[number, number], TextBuffer.IPoint],
        options?: { reversed?: boolean, preserveFolds?: boolean }): Selection;
    /** Add a selection for the given range in screen coordinates. */
    addSelectionForScreenRange(screenRange: [[number, number], [number, number]],
        options?: { reversed?: boolean, preserveFolds?: boolean }): Selection;

    /** Select from the current cursor position to the given position in buffer coordinates.
     *  This method may merge selections that end up intesecting. */
    selectToBufferPosition(position: TextBuffer.IPoint): void;
    /** Select from the current cursor position to the given position in buffer coordinates.
     *  This method may merge selections that end up intesecting. */
    selectToBufferPosition(position: [number, number]): void;

    /** Select from the current cursor position to the given position in screen coordinates.
     *  This method may merge selections that end up intesecting. */
    selectToScreenPosition(position: TextBuffer.IPoint): void;
    /** Select from the current cursor position to the given position in screen coordinates.
     *  This method may merge selections that end up intesecting. */
    selectToScreenPosition(position: [number, number]): void;

    /** Move the cursor of each selection one character upward while preserving the
     *  selection's tail position.
     *  This method may merge selections that end up intesecting. */
    selectUp(rowCount?: number): void;

    /** Move the cursor of each selection one character downward while preserving
     *  the selection's tail position.
     *  This method may merge selections that end up intesecting. */
    selectDown(rowCount?: number): void;

    /** Move the cursor of each selection one character leftward while preserving
     *  the selection's tail position.
     *  This method may merge selections that end up intesecting. */
    selectLeft(columnCount?: number): void;

    /** Move the cursor of each selection one character rightward while preserving
     *  the selection's tail position.
     *  This method may merge selections that end up intesecting. */
    selectRight(columnCount?: number): void;

    /** Select from the top of the buffer to the end of the last selection in the buffer.
     *  This method merges multiple selections into a single selection. */
    selectToTop(): void;

    /** Selects from the top of the first selection in the buffer to the end of the buffer.
     *  This method merges multiple selections into a single selection. */
    selectToBottom(): void;

    /** Select all text in the buffer.
     *  This method merges multiple selections into a single selection. */
    selectAll(): void;

    /** Move the cursor of each selection to the beginning of its line while preserving
     *  the selection's tail position.
     *  This method may merge selections that end up intesecting. */
    selectToBeginningOfLine(): void;

    /** Move the cursor of each selection to the first non-whitespace character of its
     *  line while preserving the selection's tail position. If the cursor is already
     *  on the first character of the line, move it to the beginning of the line.
     *  This method may merge selections that end up intersecting. */
    selectToFirstCharacterOfLine(): void;

    /** Move the cursor of each selection to the end of its line while preserving the
     *  selection's tail position.
     *  This method may merge selections that end up intersecting. */
    selectToEndOfLine(): void;

    /** Expand selections to the beginning of their containing word.
     *  Operates on all selections. Moves the cursor to the beginning of the containing
     *  word while preserving the selection's tail position. */
    selectToBeginningOfWord(): void;

    /** Expand selections to the end of their containing word.
     *  Operates on all selections. Moves the cursor to the end of the containing word
      * while preserving the selection's tail position. */
    selectToEndOfWord(): void;

    /** For each cursor, select the containing line.
     *  This method merges selections on successive lines. */
    selectLinesContainingCursors(): void;

    /** Select the word surrounding each cursor. */
    selectWordsContainingCursors(): void;

    /** For each selection, move its cursor to the preceding subword boundary while
     *  maintaining the selection's tail position.
     *  This method may merge selections that end up intersecting. */
    selectToPreviousSubwordBoundary(): void;

    /** For each selection, move its cursor to the next subword boundary while maintaining
     *  the selection's tail position.
     *  This method may merge selections that end up intersecting. */
    selectToNextSubwordBoundary(): void;

    /** For each selection, move its cursor to the preceding word boundary while
     *  maintaining the selection's tail position.
     *  This method may merge selections that end up intersecting. */
    selectToPreviousWordBoundary(): void;

    /** For each selection, move its cursor to the next word boundary while maintaining
     *  the selection's tail position.
     *  This method may merge selections that end up intersecting. */
    selectToNextWordBoundary(): void;

    /** Expand selections to the beginning of the next word.
     *  Operates on all selections. Moves the cursor to the beginning of the next word
     *  while preserving the selection's tail position. */
    selectToBeginningOfNextWord(): void;

    /** Expand selections to the beginning of the next paragraph.
     *  Operates on all selections. Moves the cursor to the beginning of the next
     *  paragraph while preserving the selection's tail position. */
    selectToBeginningOfNextParagraph(): void;

    /** Expand selections to the beginning of the next paragraph.
     *  Operates on all selections. Moves the cursor to the beginning of the next
     *  paragraph while preserving the selection's tail position. */
    selectToBeginningOfPreviousParagraph(): void;

    /** Select the range of the given marker if it is valid. */
    selectMarker(marker: DisplayMarker): TextBuffer.Range|undefined;

    /** Get the most recently added Selection. */
    getLastSelection(): Selection;

    /** Get current Selections. */
    getSelections(): Selection[];

    /** Get all Selections, ordered by their position in the buffer instead of the
     *  order in which they were added. */
    getSelectionsOrderedByBufferPosition(): Selection[];

    // NOTE(glen): Calls into Selection::intersectsBufferRange, which then calls into
    // Range::intersectsWith. Range::intersectsWith is one of the few functions
    // which does NOT take a range-compatible array.
    /** Determine if a given range in buffer coordinates intersects a selection. */
    selectionIntersectsBufferRange(bufferRange: TextBuffer.IRange): boolean;

    // Searching and Replacing ================================================
    /** Scan regular expression matches in the entire buffer, calling the given
     *  iterator function on each match.
     *
     *  ::scan functions as the replace method as well via the replace */
    scan(regex: RegExp, iterator: (match: Object, matchText: string, range: Range,
        stop: Function, replace: Function) => void): void;

    /** Scan regular expression matches in a given range, calling the given iterator
     *  function on each match. */
    scanInBufferRange(regex: RegExp, range: TextBuffer.IRange, iterator: (match: Object,
        matchText: string, range: Range, stop: Function, replace: Function) =>
        void): void;
    /** Scan regular expression matches in a given range, calling the given iterator
     *  function on each match. */
    scanInBufferRange(regex: RegExp, range: [TextBuffer.IPoint, TextBuffer.IPoint],
        iterator: (match: Object, matchText: string, range: Range, stop: Function,
        replace: Function) => void): void;
    /** Scan regular expression matches in a given range, calling the given iterator
     *  function on each match. */
    scanInBufferRange(regex: RegExp, range: [[number, number], [number, number]],
        iterator: (match: Object, matchText: string, range: Range, stop: Function,
        replace: Function) => void): void;
    /** Scan regular expression matches in a given range, calling the given iterator
     *  function on each match. */
    scanInBufferRange(regex: RegExp, range: [TextBuffer.IPoint, [number, number]],
        iterator: (match: Object, matchText: string, range: Range, stop: Function,
        replace: Function) => void): void;
    /** Scan regular expression matches in a given range, calling the given iterator
     *  function on each match. */
    scanInBufferRange(regex: RegExp, range: [[number, number], TextBuffer.IPoint],
        iterator: (match: Object, matchText: string, range: Range, stop: Function,
        replace: Function) => void): void;

    /** Scan regular expression matches in a given range in reverse order, calling the
     *  given iterator function on each match. */
    backwardsScanInBufferRange(regex: RegExp, range: TextBuffer.IRange, iterator:
        (match: Object, matchText: string, range: Range, stop: Function, replace:
        Function) => void): void;
    /** Scan regular expression matches in a given range in reverse order, calling the
     *  given iterator function on each match. */
    backwardsScanInBufferRange(regex: RegExp, range: [TextBuffer.IPoint, TextBuffer.IPoint],
        iterator: (match: Object, matchText: string, range: Range, stop: Function,
        replace: Function) => void): void;
    /** Scan regular expression matches in a given range in reverse order, calling the
     *  given iterator function on each match. */
    backwardsScanInBufferRange(regex: RegExp, range: [[number, number], [number, number]],
       iterator: (match: Object, matchText: string, range: Range, stop: Function,
       replace: Function) => void): void;
    /** Scan regular expression matches in a given range in reverse order, calling the
     *  given iterator function on each match. */
    backwardsScanInBufferRange(regex: RegExp, range: [TextBuffer.IPoint, [number, number]],
        iterator: (match: Object, matchText: string, range: Range, stop: Function,
        replace: Function) => void): void;
    /** Scan regular expression matches in a given range in reverse order, calling the
     *  given iterator function on each match. */
    backwardsScanInBufferRange(regex: RegExp, range: [[number, number], TextBuffer.IPoint],
        iterator: (match: Object, matchText: string, range: Range, stop: Function,
        replace: Function) => void): void;

    // Tab Behavior ===========================================================
    /** Returns a boolean indicating whether softTabs are enabled for this editor. */
    getSoftTabs(): boolean;

    /** Enable or disable soft tabs for this editor. */
    setSoftTabs(softTabs: boolean): void;

    /** Toggle soft tabs for this editor. */
    toggleSoftTabs(): void;

    /** Get the on-screen length of tab characters. */
    getTabLength(): number;

    /** Set the on-screen length of tab characters. Setting this to a number will
     *  override the editor.tabLength setting. */
    setTabLength(tabLength: number): void;

    /** Determine if the buffer uses hard or soft tabs. */
    usesSoftTabs(): boolean|undefined;

    /** Get the text representing a single level of indent.
     *  If soft tabs are enabled, the text is composed of N spaces, where N is the
     *  tab length. Otherwise the text is a tab character (\t). */
    getTabText(): string;

    // Soft Wrap Behavior =====================================================
    /** Determine whether lines in this editor are soft-wrapped. */
    isSoftWrapped(): boolean;

    /** Enable or disable soft wrapping for this editor. */
    setSoftWrapped(softWrapped: boolean): boolean;

    /** Toggle soft wrapping for this editor. */
    toggleSoftWrapped(): boolean;

    /** Gets the column at which column will soft wrap. */
    getSoftWrapColumn(): number;

    // Indentation ============================================================
    /** Get the indentation level of the given buffer row.
     *  Determines how deeply the given row is indented based on the soft tabs and tab
     *  length settings of this editor. Note that if soft tabs are enabled and the tab
     *  length is 2, a row with 4 leading spaces would have an indentation level of 2. */
    indentationForBufferRow(bufferRow: number): number;

    /** Set the indentation level for the given buffer row.
     *  Inserts or removes hard tabs or spaces based on the soft tabs and tab length settings
     *  of this editor in order to bring it to the given indentation level. Note that if soft
     *  tabs are enabled and the tab length is 2, a row with 4 leading spaces would have an
     *  indentation level of 2. */
    setIndentationForBufferRow(bufferRow: number, newLevel: number, options?:
        { preserveLeadingWhitespace: boolean }): void;

    /** Indent rows intersecting selections by one level. */
    indentSelectedRows(): void;

    /** Outdent rows intersecting selections by one level. */
    outdentSelectedRows(): void;

    /** Get the indentation level of the given line of text.
     *  Determines how deeply the given line is indented based on the soft tabs and tab length
     *  settings of this editor. Note that if soft tabs are enabled and the tab length is 2,
     *  a row with 4 leading spaces would have an indentation level of 2. */
    indentLevelForLine(line: string): number;

    /** Indent rows intersecting selections based on the grammar's suggested indent level. */
    autoIndentSelectedRows(): void;

    // Grammars ===============================================================
    /** Get the current Grammar of this editor. */
    getGrammar(): Grammar;

    /** Set the current Grammar of this editor.
     *  Assigning a grammar will cause the editor to re-tokenize based on the new grammar. */
    setGrammar(grammar: Grammar): void;

    // Managing Syntax Scopes =================================================
    /** Returns a ScopeDescriptor that includes this editor's language.
     *  e.g. [".source.ruby"], or [".source.coffee"]. */
    getRootScopeDescriptor(): ScopeDescriptor;

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
    /** For each selection, copy the selected text. */
    copySelectedText(): void;

    /** For each selection, cut the selected text. */
    cutSelectedText(): void;

    /** For each selection, replace the selected text with the contents of the clipboard.
     *  If the clipboard contains the same number of selections as the current editor,
     *  each selection will be replaced with the content of the corresponding clipboard
     *  selection text. */
    pasteText(options?: Params.TextInsertion): void;

    /** For each selection, if the selection is empty, cut all characters of the
     *  containing screen line following the cursor. Otherwise cut the selected text. */
    cutToEndOfLine(): void;

    /** For each selection, if the selection is empty, cut all characters of the
     *  containing buffer line following the cursor. Otherwise cut the selected text. */
    cutToEndOfBufferLine(): void;

    // Folds ==================================================================
    /** Fold the most recent cursor's row based on its indentation level.
     *  The fold will extend from the nearest preceding line with a lower indentation
     *  level up to the nearest following row with a lower indentation level. */
    foldCurrentRow(): void;

    /** Unfold the most recent cursor's row by one level. */
    unfoldCurrentRow(): void;

    /** Fold the given row in buffer coordinates based on its indentation level.
     *  If the given row is foldable, the fold will begin there. Otherwise, it will
     *  begin at the first foldable row preceding the given row. */
    foldBufferRow(bufferRow: number): void;

    /** Unfold all folds containing the given row in buffer coordinates. */
    unfoldBufferRow(bufferRow: number): void;

    /** For each selection, fold the rows it intersects. */
    foldSelectedLines(): void;

    /** Fold all foldable lines. */
    foldAll(): void;

    /** Unfold all existing folds. */
    unfoldAll(): void;

    /** Fold all foldable lines at the given indent level. */
    foldAllAtIndentLevel(level: number): void;

    /** Determine whether the given row in buffer coordinates is foldable.
     *  A foldable row is a row that starts a row range that can be folded. */
    isFoldableAtBufferRow(bufferRow: number): boolean;

    /** Determine whether the given row in screen coordinates is foldable.
     *  A foldable row is a row that starts a row range that can be folded. */
    isFoldableAtScreenRow(bufferRow: number): boolean;

    /** Fold the given buffer row if it isn't currently folded, and unfold it otherwise. */
    toggleFoldAtBufferRow(bufferRow: number): void;

    /** Determine whether the most recently added cursor's row is folded. */
    isFoldedAtCursorRow(): boolean;

    /** Determine whether the given row in buffer coordinates is folded. */
    isFoldedAtBufferRow(bufferRow: number): boolean;

    /** Determine whether the given row in screen coordinates is folded. */
    isFoldedAtScreenRow(screenRow: number): boolean;

    // Gutters ================================================================
    /** Add a custom Gutter. */
    addGutter(options: { name: string, priority?: number, visible?: boolean }): Gutter;

    /** Get this editor's gutters. */
    getGutters(): Gutter[];

    /** Get the gutter with the given name. */
    gutterWithName(name: string): Gutter|null;

    // Scrolling the TextEditor ===============================================
    /** Scroll the editor to reveal the most recently added cursor if it is off-screen. */
    scrollToCursorPosition(options?: { center: boolean }): void;

    /** Scrolls the editor to the given buffer position. */
    scrollToBufferPosition(bufferPosition: TextBuffer.IPoint, options?:
        { center: boolean }): void;
    /** Scrolls the editor to the given buffer position. */
    scrollToBufferPosition(bufferPosition: [number, number], options?:
        { center: boolean }): void;

    /** Scrolls the editor to the given screen position. */
    scrollToScreenPosition(screenPosition: TextBuffer.IPoint, options?:
        { center: boolean }): void;
    /** Scrolls the editor to the given screen position. */
    scrollToScreenPosition(screenPosition: [number, number], options?:
        { center: boolean }): void;

    // TextEditor Rendering ===================================================
    /** Retrieves the greyed out placeholder of a mini editor. */
    getPlaceholderText(): string;

    /** Set the greyed out placeholder of a mini editor. Placeholder text will be
     *  displayed when the editor has no content. */
    setPlaceholderText(placeholderText: string): void;
  }

  /** The Cursor class represents the little blinking line identifying where text
   *  can be inserted. */
  class Cursor {
    // Event Subscription =====================================================
    /** Calls your callback when the cursor has been moved. */
    onDidChangePosition(callback: (event: Params.CursorChangeEvent) => void):
        AtomEventKit.Disposable;

    /** Calls your callback when the cursor is destroyed. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;

    /** Calls your callback when the cursor's visibility has changed. */
    onDidChangeVisibility(callback: (visibility: boolean) => void):
        AtomEventKit.Disposable;

    // Managing Cursor Position ===============================================
    /** Moves a cursor to a given screen position. */
    setScreenPosition(screenPosition: TextBuffer.IPoint, options?:
        { autoscroll: boolean }): void;
    setScreenPosition(screenPosition: [number, number], options?:
        { autoscroll: boolean }): void;

    /** Returns the screen position of the cursor as a Point. */
    getScreenPosition(): TextBuffer.Point;

    /** Moves a cursor to a given buffer position. */
    setBufferPosition(bufferPosition: TextBuffer.IPoint, options?:
        { autoscroll: boolean }): void;
    /** Moves a cursor to a given buffer position. */
    setBufferPosition(bufferPosition: [number, number], options?:
        { autoscroll: boolean }): void;

    /** Returns the current buffer position as an Array. */
    getBufferPosition(): number[];

    /** Returns the cursor's current screen row. */
    getScreenRow(): number;

    /** Returns the cursor's current screen column. */
    getScreenColumn(): number;

    /** Retrieves the cursor's current buffer row. */
    getBufferRow(): number;

    /** Returns the cursor's current buffer column. */
    getBufferColumn(): number;

    /** Returns the cursor's current buffer row of text excluding its line ending. */
    getCurrentBufferLine(): string;

    /** Returns whether the cursor is at the start of a line. */
    isAtBeginningOfLine(): boolean;

    /** Returns whether the cursor is on the line return character. */
    isAtEndOfLine(): boolean;

    // Cursor Position Details ================================================
    /** Returns the underlying DisplayMarker for the cursor. Useful with overlay
     *  Decorations. */
    getMarker(): DisplayMarker;

    /** Identifies if the cursor is surrounded by whitespace.
     *  "Surrounded" here means that the character directly before and after the cursor
     *  are both whitespace. */
    isSurroundedByWhitespace(): boolean;

    /** This method returns false if the character before or after the cursor is whitespace. */
    isBetweenWordAndNonWord(): boolean;

    /** Returns whether this cursor is between a word's start and end. */
    isInsideWord(options?: { wordRegex: RegExp }): boolean;

    /** Returns the indentation level of the current line. */
    getIndentLevel(): number;

    /** Retrieves the scope descriptor for the cursor's current position. */
    getScopeDescriptor(): ScopeDescriptor;

    /** Returns true if this cursor has no non-whitespace characters before its
     *  current position. */
    hasPrecedingCharactersOnLine(): boolean;

    /** Identifies if this cursor is the last in the TextEditor.
     *  "Last" is defined as the most recently added cursor. */
    isLastCursor(): boolean;

    // Moving the Cursor ======================================================
    /** Moves the cursor up one screen row. */
    moveUp(rowCount?: number): void;
    /** Moves the cursor up one screen row. */
    moveUp(rowCount: number, options?: { moveToEndOfSelection: boolean }): void;

    /** Moves the cursor down one screen row. */
    moveDown(rowCount?: number): void;
    /** Moves the cursor down one screen row. */
    moveDown(rowCount: number, options?: { moveToEndOfSelection: boolean }): void

    /** Moves the cursor left one screen column. */
    moveLeft(columnCount?: number): void;
    /** Moves the cursor left one screen column. */
    moveLeft(columnCount: number, options?: { moveToEndOfSelection: boolean }): void;

    /** Moves the cursor right one screen column. */
    moveRight(columnCount?: number): void;
    /** Moves the cursor right one screen column. */
    moveRight(columnCount: number, options?: { moveToEndOfSelection: boolean }): void;

    /** Moves the cursor to the top of the buffer. */
    moveToTop(): void;

    /** Moves the cursor to the bottom of the buffer. */
    moveToBottom(): void;

    /** Moves the cursor to the beginning of the line. */
    moveToBeginningOfScreenLine(): void;

    /** Moves the cursor to the beginning of the buffer line. */
    moveToBeginningOfLine(): void;

    /** Moves the cursor to the beginning of the first character in the line. */
    moveToFirstCharacterOfLine(): void;

    /** Moves the cursor to the end of the line. */
    moveToEndOfScreenLine(): void;

    /** Moves the cursor to the end of the buffer line. */
    moveToEndOfLine(): void;

    /** Moves the cursor to the beginning of the word. */
    moveToBeginningOfWord(): void;

    /** Moves the cursor to the end of the word. */
    moveToEndOfWord(): void;

    /** Moves the cursor to the beginning of the next word. */
    moveToBeginningOfNextWord(): void;

    /** Moves the cursor to the previous word boundary. */
    moveToPreviousWordBoundary(): void;

    /** Moves the cursor to the next word boundary. */
    moveToNextWordBoundary(): void;

    /** Moves the cursor to the previous subword boundary. */
    moveToPreviousSubwordBoundary(): void;

    /** Moves the cursor to the next subword boundary. */
    moveToNextSubwordBoundary(): void;

    /** Moves the cursor to the beginning of the buffer line, skipping all whitespace. */
    skipLeadingWhitespace(): void;

    /** Moves the cursor to the beginning of the next paragraph. */
    moveToBeginningOfNextParagraph(): void;

    /** Moves the cursor to the beginning of the previous paragraph. */
    moveToBeginningOfPreviousParagraph(): void;

    // Local Positions and Ranges =============================================
    /** Returns buffer position of previous word boundary. It might be on the current
     *  word, or the previous word. */
    getPreviousWordBoundaryBufferPosition(options?: { wordRegex: RegExp }):
        TextBuffer.Point;

    /** Returns buffer position of the next word boundary. It might be on the current
     *  word, or the previous word. */
    getNextWordBoundaryBufferPosition(options?: { wordRegex: RegExp }):
        TextBuffer.Point;

    /** Retrieves the buffer position of where the current word starts. */
    getBeginningOfCurrentWordBufferPosition(options?: { wordRegex?: RegExp,
        includeNonWordCharacters?: boolean, allowPrevious?: boolean }): TextBuffer.Point;

    /** Retrieves the buffer position of where the current word ends. */
    getEndOfCurrentWordBufferPosition(options?: { wordRegex?: RegExp,
        includeNonWordCharacters?: boolean }): TextBuffer.Point;

    /** Retrieves the buffer position of where the next word starts. */
    getBeginningOfNextWordBufferPosition(options?: { wordRegex: RegExp }):
        TextBuffer.Point;

    /** Returns the buffer Range occupied by the word located under the cursor. */
    getCurrentWordBufferRange(options?: { wordRegex: RegExp }): TextBuffer.Range;

    /** Returns the buffer Range for the current line. */
    getCurrentLineBufferRange(options?: { includeNewline: boolean }): TextBuffer.Range;

    /** Retrieves the range for the current paragraph.
        A paragraph is defined as a block of text surrounded by empty lines or comments. */
    getCurrentParagraphBufferRange(): TextBuffer.Range;

    /** Returns the characters preceding the cursor in the current word. */
    getCurrentWordPrefix(): string;

    // Visibility =============================================================
    /** Sets whether the cursor is visible. */
    setVisible(visible: boolean): void;

    /** Returns the visibility of the cursor. */
    isVisible(): boolean;

    // Comparing to another cursor ============================================
    /** Compare this cursor's buffer position to another cursor's buffer position.
     *  See Point::compare for more details. */
    compare(otherCursor: Cursor): number;

    // Utilities ==============================================================
    /** Prevents this cursor from causing scrolling. */
    clearAutoscroll(): void;

    /** Deselects the current selection. */
    clearSelection(): void;

    /** Get the RegExp used by the cursor to determine what a "word" is. */
    wordRegExp(options?: { includeNonWordCharacters: boolean }): RegExp;

    /** Get the RegExp used by the cursor to determine what a "subword" is. */
    subwordRegExp(options?: { backwards: boolean }): RegExp;
  }

  /** Represents a selection in the TextEditor. */
  class Selection {
    // Event Subscription =====================================================
    /** Calls your callback when the selection was moved. */
    onDidChangeRange(callback: (event: Params.SelectionChangeEvent) => void):
        AtomEventKit.Disposable;

    /** Calls your callback when the selection was destroyed. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;

    // Managing the selection range ===========================================
    /** Returns the screen Range for the selection. */
    getScreenRange(): TextBuffer.Range;

    /** Modifies the screen range for the selection. */
    setScreenRange(screenRange: TextBuffer.IRange, options?: { preserveFolds?: boolean,
        autoscroll?: boolean }): void;
    /** Modifies the screen range for the selection. */
    setScreenRange(screenRange: [TextBuffer.IPoint, TextBuffer.IPoint],
        options?: { preserveFolds?: boolean, autoscroll?: boolean }): void;
    /** Modifies the screen range for the selection. */
    setScreenRange(screenRange: [TextBuffer.IPoint, [number, number]],
        options?: { preserveFolds?: boolean, autoscroll?: boolean }): void;
    /** Modifies the screen range for the selection. */
    setScreenRange(screenRange: [[number, number], TextBuffer.IPoint],
        options?: { preserveFolds?: boolean, autoscroll?: boolean }): void;
    /** Modifies the screen range for the selection. */
    setScreenRange(screenRange: [[number, number], [number, number]],
        options?: { preserveFolds?: boolean, autoscroll?: boolean }): void;

    /** Returns the buffer Range for the selection. */
    getBufferRange(): TextBuffer.Range;

    /** Modifies the buffer Range for the selection. */
    setBufferRange(bufferRange: TextBuffer.IRange, options?: { preserveFolds?: boolean,
        autoscroll?: boolean }): void;
    /** Modifies the buffer Range for the selection. */
    setBufferRange(bufferRange: [TextBuffer.IPoint, TextBuffer.IPoint],
        options?: { preserveFolds?: boolean, autoscroll?: boolean }): void;
    /** Modifies the buffer Range for the selection. */
    setBufferRange(bufferRange: [TextBuffer.IPoint, [number, number]],
        options?: { preserveFolds?: boolean, autoscroll?: boolean }): void;
    /** Modifies the buffer Range for the selection. */
    setBufferRange(bufferRange: [[number, number], TextBuffer.IPoint],
        options?: { preserveFolds?: boolean, autoscroll?: boolean }): void;
    /** Modifies the buffer Range for the selection. */
    setBufferRange(bufferRange: [[number, number], [number, number]],
        options?: { preserveFolds?: boolean, autoscroll?: boolean }): void;

    /** Returns the starting and ending buffer rows the selection is highlighting. */
    getBufferRowRange(): [number, number];

    // Info about the selection ===============================================
    /** Determines if the selection contains anything. */
    isEmpty(): boolean;

    /** Determines if the ending position of a marker is greater than the starting position.
     *  This can happen when, for example, you highlight text "up" in a TextBuffer. */
    isReversed(): boolean;

    /** Returns whether the selection is a single line or not. */
    isSingleScreenLine(): boolean;

    /** Returns the text in the selection. */
    getText(): string;

    // NOTE(glen): calls into Range.intersectsWith(), which is one of the few functions
    //             that doesn't take a range-compatible range, despite what the API says.
    /** Identifies if a selection intersects with a given buffer range. */
    intersectsBufferRange(bufferRange: TextBuffer.IRange): boolean;

    /** Identifies if a selection intersects with another selection. */
    intersectsWith(otherSelection: Selection): boolean;

    // Modifying the selected range ===========================================
    /** Clears the selection, moving the marker to the head. */
    clear(options?: { autoscroll: boolean }): void;

    /** Selects the text from the current cursor position to a given screen position. */
    selectToScreenPosition(position: TextBuffer.IPoint): void;
    /** Selects the text from the current cursor position to a given screen position. */
    selectToScreenPosition(position: [number, number]): void;

    /** Selects the text from the current cursor position to a given buffer position. */
    selectToBufferPosition(position: TextBuffer.IPoint): void;
    /** Selects the text from the current cursor position to a given buffer position. */
    selectToBufferPosition(position: [number, number]): void;

    /** Selects the text one position right of the cursor. */
    selectRight(columnCount?: number): void;

    /** Selects the text one position left of the cursor. */
    selectLeft(columnCount?: number): void;

    /** Selects all the text one position above the cursor. */
    selectUp(rowCount?: number): void;

    /** Selects all the text one position below the cursor. */
    selectDown(rowCount?: number): void;

    /** Selects all the text from the current cursor position to the top of the
     *  buffer. */
    selectToTop(): void;

    /** Selects all the text from the current cursor position to the bottom of
     *  the buffer. */
    selectToBottom(): void;

    /** Selects all the text in the buffer. */
    selectAll(): void;

    /** Selects all the text from the current cursor position to the beginning of
     *  the line. */
    selectToBeginningOfLine(): void;

    /** Selects all the text from the current cursor position to the first character
     *  of the line. */
    selectToFirstCharacterOfLine(): void;

    /** Selects all the text from the current cursor position to the end of the
     *  screen line. */
    selectToEndOfLine(): void;

    /** Selects all the text from the current cursor position to the end of the
     *  buffer line. */
    selectToEndOfBufferLine(): void;

    /** Selects all the text from the current cursor position to the beginning
     *  of the word. */
    selectToBeginningOfWord(): void;

    /** Selects all the text from the current cursor position to the end of the word. */
    selectToEndOfWord(): void;

    /** Selects all the text from the current cursor position to the beginning of
     *  the next word. */
    selectToBeginningOfNextWord(): void;

    /** Selects text to the previous word boundary. */
    selectToPreviousWordBoundary(): void;

    /** Selects text to the next word boundary. */
    selectToNextWordBoundary(): void;

    /** Selects text to the previous subword boundary. */
    selectToPreviousSubwordBoundary(): void;

    /** Selects text to the next subword boundary. */
    selectToNextSubwordBoundary(): void;

    /** Selects all the text from the current cursor position to the beginning of
     *  the next paragraph. */
    selectToBeginningOfNextParagraph(): void;

    /** Selects all the text from the current cursor position to the beginning of
     *  the previous paragraph. */
    selectToBeginningOfPreviousParagraph(): void;

    /** Modifies the selection to encompass the current word. */
    selectWord(): void;

    /** Expands the newest selection to include the entire word on which the
     *  cursors rests. */
    expandOverWord(): void;

    /** Selects an entire line in the buffer. */
    selectLine(row: number): void;

    /** Expands the newest selection to include the entire line on which the cursor
     *  currently rests.
     *  It also includes the newline character. */
    expandOverLine(): void;

    // Modifying the selected text ============================================
    /** Replaces text at the current selection. */
    insertText(text: string, options?: Params.TextInsertion): void;

    /** Removes the first character before the selection if the selection is empty
     *  otherwise it deletes the selection. */
    backspace(): void;

    /** Removes the selection or, if nothing is selected, then all characters from
     *  the start of the selection back to the previous word boundary. */
    deleteToPreviousWordBoundary(): void;

    /** Removes the selection or, if nothing is selected, then all characters from
     *  the start of the selection up to the next word boundary. */
    deleteToNextWordBoundary(): void;

    /** Removes from the start of the selection to the beginning of the current
     *  word if the selection is empty otherwise it deletes the selection. */
    deleteToBeginningOfWord(): void;

    /** Removes from the beginning of the line which the selection begins on all
     *  the way through to the end of the selection. */
    deleteToBeginningOfLine(): void;

    /** Removes the selection or the next character after the start of the selection
     *  if the selection is empty. */
    delete(): void;

    /** If the selection is empty, removes all text from the cursor to the end of
     *  the line. If the cursor is already at the end of the line, it removes the following
     *  newline. If the selection isn't empty, only deletes the contents of the selection. */
    deleteToEndOfLine(): void;

    /** Removes the selection or all characters from the start of the selection to
     *  the end of the current word if nothing is selected. */
    deleteToEndOfWord(): void;

    /** Removes the selection or all characters from the start of the selection to
     *  the end of the current word if nothing is selected. */
    deleteToBeginningOfSubword(): void;

    /** Removes the selection or all characters from the start of the selection to
     *  the end of the current word if nothing is selected. */
    deleteToEndOfSubword(): void;

    /** Removes only the selected text. */
    deleteSelectedText(): void;

    /** Removes the line at the beginning of the selection if the selection is empty
     *  unless the selection spans multiple lines in which case all lines are removed. */
    deleteLine(): void;

    /** Joins the current line with the one below it. Lines will be separated by a single space.
     *  If there selection spans more than one line, all the lines are joined together. */
    joinLines(): void;

    /** Removes one level of indent from the currently selected rows. */
    outdentSelectedRows(): void;

    /** Sets the indentation level of all selected rows to values suggested by the
     *  relevant grammars. */
    autoIndentSelectedRows(): void;

    /** Wraps the selected lines in comments if they aren't currently part of a comment.
     *  Removes the comment if they are currently wrapped in a comment. */
    toggleLineComments(): void;

    /** Cuts the selection until the end of the screen line. */
    cutToEndOfLine(): void;

    /** Cuts the selection until the end of the buffer line. */
    cutToEndOfBufferLine(): void;

    /** Copies the selection to the clipboard and then deletes it. */
    cut(maintainClipboard?: boolean): void;
    /** Copies the selection to the clipboard and then deletes it. */
    cut(maintainClipboard: boolean, fullLine?: boolean): void;

    /** Copies the current selection to the clipboard. */
    copy(maintainClipboard?: boolean): void;
    /** Copies the current selection to the clipboard. */
    copy(maintainClipboard: boolean, fullLine?: boolean): void;

    /** Creates a fold containing the current selection. */
    fold(): void;

    /** If the selection spans multiple rows, indent all of them. */
    indentSelectedRows(): void;

    // Managing multiple selections ===========================================
    /** Moves the selection down one row. */
    addSelectionBelow(): void;

    /** Moves the selection up one row. */
    addSelectionAbove(): void;

    /** Combines the given selection into this selection and then destroys the
     *  given selection. */
    merge(otherSelection: Selection, options?: { preserveFolds?: boolean,
        autoscroll?: boolean }): void;

    // Comparing to other selections ==========================================
    /** Compare this selection's buffer range to another selection's buffer range.
     *  See Range::compare for more details. */
    compare(otherSelection: Selection): number;
  }

  /** Represents a buffer annotation that remains logically stationary even as the
   *  buffer changes. This is used to represent cursors, folds, snippet targets,
   *  misspelled words, and anything else that needs to track a logical location
   *  in the buffer over time. */
  class DisplayMarker {
    // Construction and Destruction ===========================================
    /** Destroys the marker, causing it to emit the 'destroyed' event. Once destroyed,
     *  a marker cannot be restored by undo/redo operations. */
    destroy(): void;

    /** Creates and returns a new DisplayMarker with the same properties as this marker. */
    copy(properties?: Object): DisplayMarker;

    // Event Subscription  ====================================================
    /** Invoke the given callback when the state of the marker changes. */
    onDidChange(callback: (event: Params.DisplayMarkerChangeEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when the marker is destroyed. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;

    // TextEditorMarker Details ===============================================
    /** Returns a boolean indicating whether the marker is valid. Markers can be
     *  invalidated when a region surrounding them in the buffer is changed. */
    isValid(): boolean;

    /** Returns a boolean indicating whether the marker has been destroyed. A marker
     *  can be invalid without being destroyed, in which case undoing the invalidating
     *  operation would restore the marker. */
    isDestroyed(): boolean;

    /** Returns a boolean indicating whether the head precedes the tail. */
    isReversed(): boolean;

    /** Returns a boolean indicating whether changes that occur exactly at the marker's
     *  head or tail cause it to move. */
    isExclusive(): boolean;

    /** Get the invalidation strategy for this marker.
     *  Valid values include: never, surround, overlap, inside, and touch. */
    getInvalidationStrategy(): string;

    /** Returns an Object containing any custom properties associated with the marker. */
    getProperties(): Object;

    /** Merges an Object containing new properties into the marker's existing properties. */
    setProperties(properties: Object): void;

    /** Returns whether this marker matches the given parameters. */
    matchesProperties(attributes: Params.MarkerProperties): boolean;

    // Comparing to other markers =============================================
    /** Compares this marker to another based on their ranges. */
    compare(other: DisplayMarker): number;

    /** Returns a boolean indicating whether this marker is equivalent to another
     *  marker, meaning they have the same range and options. */
    isEqual(other: DisplayMarker): boolean;

    // Managing the marker's range ============================================
    /** Gets the buffer range of this marker. */
    getBufferRange(): TextBuffer.Range;

    /** Gets the screen range of this marker. */
    getScreenRange(): TextBuffer.Range;

    /** Modifies the buffer range of this marker. */
    setBufferRange(bufferRange: TextBuffer.IRange, properties?:
        { reversed: boolean }): void;
    /** Modifies the buffer range of this marker. */
    setBufferRange(bufferRange: [TextBuffer.IPoint, TextBuffer.IPoint],
        properties?: { reversed: boolean }): void;
    /** Modifies the buffer range of this marker. */
    setBufferRange(bufferRange: [TextBuffer.IPoint, [number, number]],
        properties?: { reversed: boolean }): void;
    /** Modifies the buffer range of this marker. */
    setBufferRange(bufferRange: [[number, number], TextBuffer.IPoint],
        properties?: { reversed: boolean }): void;
    /** Modifies the buffer range of this marker. */
    setBufferRange(bufferRange: [[number, number], [number, number]],
        properties?: { reversed: boolean }): void;

    /** Modifies the screen range of this marker. */
    setScreenRange(screenRange: TextBuffer.IRange, options?:
        { reversed?: boolean, clipDirection?: "backward"|"forward"|"closest" }): void;
    /** Modifies the screen range of this marker. */
    setScreenRange(screenRange: [TextBuffer.IPoint, TextBuffer.IPoint],
        options?: { reversed?: boolean, clipDirection?: "backward"|"forward"|"closest" }): void;
    /** Modifies the screen range of this marker. */
    setScreenRange(screenRange: [TextBuffer.IPoint, [number, number]],
        options?: { reversed?: boolean, clipDirection?: "backward"|"forward"|"closest" }): void;
    /** Modifies the screen range of this marker. */
    setScreenRange(screenRange: [[number, number], TextBuffer.IPoint],
        options?: { reversed?: boolean, clipDirection?: "backward"|"forward"|"closest" }): void;
    /** Modifies the screen range of this marker. */
    setScreenRange(screenRange: [[number, number], [number, number]],
        options?: { reversed?: boolean, clipDirection?: "backward"|"forward"|"closest" }): void;

    /** Retrieves the screen position of the marker's start. This will always be
     *  less than or equal to the result of DisplayMarker::getEndScreenPosition. */
    getStartScreenPosition(options?: { clipDirection: "backward"|"forward"|"closest" }):
        TextBuffer.Point;

    /** Retrieves the screen position of the marker's end. This will always be
     *  greater than or equal to the result of DisplayMarker::getStartScreenPosition. */
    getEndScreenPosition(options?: { clipDirection: "backward"|"forward"|"closest" }):
        TextBuffer.Point;

    /** Retrieves the buffer position of the marker's head. */
    getHeadBufferPosition(): TextBuffer.Point;

    /** Sets the buffer position of the marker's head. */
    setHeadBufferPosition(bufferPosition: TextBuffer.IPoint): void;
    /** Sets the buffer position of the marker's head. */
    setHeadBufferPosition(bufferPosition: [number, number]): void;

    /** Retrieves the screen position of the marker's head. */
    getHeadScreenPosition(options?: { clipDirection: "backward"|"forward"|"closest" }):
        TextBuffer.Point;

    /** Sets the screen position of the marker's head. */
    setHeadScreenPosition(screenPosition: TextBuffer.IPoint, options?:
        { clipDirection: "backward"|"forward"|"closest" }): void;
    /** Sets the screen position of the marker's head. */
    setHeadScreenPosition(screenPosition: [number, number], options?:
        { clipDirection: "backward"|"forward"|"closest" }): void;

    /** Retrieves the buffer position of the marker's tail. */
    getTailBufferPosition(): TextBuffer.Point;

    /** Sets the buffer position of the marker's tail. */
    setTailBufferPosition(bufferPosition: TextBuffer.IPoint): void;
    /** Sets the buffer position of the marker's tail. */
    setTailBufferPosition(bufferPosition: [number, number]): void;

    /** Retrieves the screen position of the marker's tail. */
    getTailScreenPosition(options?: { clipDirection: "backward"|"forward"|"closest" }):
        TextBuffer.Point;

    /** Sets the screen position of the marker's tail. */
    setTailScreenPosition(screenPosition: TextBuffer.IPoint, options?:
        { clipDirection: "backward"|"forward"|"closest" }): void;
    /** Sets the screen position of the marker's tail. */
    setTailScreenPosition(screenPosition: [number, number], options?:
        { clipDirection: "backward"|"forward"|"closest" }): void;

    /** Retrieves the buffer position of the marker's start. This will always be less
     *  than or equal to the result of DisplayMarker::getEndBufferPosition. */
    getStartBufferPosition(): TextBuffer.Point;

    /** Retrieves the buffer position of the marker's end. This will always be greater
     *  than or equal to the result of DisplayMarker::getStartBufferPosition. */
    getEndBufferPosition(): TextBuffer.Point;

    /** Returns a boolean indicating whether the marker has a tail. */
    hasTail(): boolean;

    /** Plants the marker's tail at the current head position. After calling the
     *  marker's tail position will be its head position at the time of the call,
     *  regardless of where the marker's head is moved. */
    plantTail(): void;

    /** Removes the marker's tail. After calling the marker's head position will be
     *  reported as its current tail position until the tail is planted again. */
    clearTail(): void;
  }

  /** Represents a decoration that follows a DisplayMarker. A decoration is basically
   *  a visual representation of a marker. It allows you to add CSS classes to line
   *  numbers in the gutter, lines, and add selection-line regions around marked ranges
   *  of text. */
  class Decoration {
    id: number;

    // Construction and Destruction ===========================================
    /** Destroy this marker decoration.
     *  You can also destroy the marker if you own it, which will destroy this decoration. */
    destroy(): void;

    // Event Subscription =====================================================
    /** When the Decoration is updated via Decoration::setProperties. */
    onDidChangeProperties(callback: (event: Params.DecorationChangeEvent) => void):
        AtomEventKit.Disposable;
    /** Invoke the given callback when the Decoration is destroyed. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;

    // Decoration Details =====================================================
    /** An id unique across all Decoration objects. */
    getId(): number;

    /** Returns the marker associated with this Decoration. */
    getMarker(): DisplayMarker;

    // Properties =============================================================
    /** Returns the Decoration's properties. */
    getProperties(): Object;

    /** Update the marker with new Properties. Allows you to change the decoration's
     *  class. */
    setProperties(newProperties: Object): void;
  }

  /** Represents a decoration that applies to every marker on a given layer. Created via
   *  TextEditor::decorateMarkerLayer. */
  class LayerDecoration {
    /** Destroys the decoration. */
    destroy(): void;

    /** Determine whether this decoration is destroyed. */
    isDestroyed(): boolean;

    /** Get this decoration's properties. */
    getProperties(): Params.DecorationLayerOptions;

    /** Set this decoration's properties. */
    setProperties(newProperties: Params.DecorationLayerOptions): void;

    /** Override the decoration properties for a specific marker. */
    setPropertiesForMarker(marker: DisplayMarker|TextBuffer.Marker,
        properties: Params.DecorationLayerOptions): void;
  }

  /** Experimental: A container for a related set of markers at the DisplayLayer level.
   *  Wraps an underlying MarkerLayer on the TextBuffer.
   *
   *  This API is experimental and subject to change on any release. */
  class DisplayMarkerLayer {
    // Lifecycle ==============================================================
    /** Destroy this layer. */
    destroy(): void;

    /** Destroy all markers in this layer. */
    clear(): void;

    /** Determine whether this layer has been destroyed. */
    isDestroyed(): boolean;

    // Event Subscription =====================================================
    /** Subscribe to be notified synchronously when this layer is destroyed. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;

    /** Subscribe to be notified asynchronously whenever markers are created, updated,
     *  or destroyed on this layer. Prefer this method for optimal performance when
     *  interacting with layers that could contain large numbers of markers. */
    onDidUpdate(callback: () => void): AtomEventKit.Disposable;

    /** Subscribe to be notified synchronously whenever markers are created on this
     *  layer. Avoid this method for optimal performance when interacting with layers
     *  that could contain large numbers of markers. */
    onDidCreateMarker(callback: (marker: DisplayMarker|TextBuffer.Marker) => void):
        AtomEventKit.Disposable;

    // Marker creation ========================================================
    /** Create a marker with the given screen range. */
    markScreenRange(range: TextBuffer.IRange, options?: { reversed?: boolean,
        invalidate?: "never"|"surround"|"overlap"|"inside"|"touch",
        exclusive?: boolean, clipDirection?: "backward"|"forward"|"closest" }):
        DisplayMarker;
    /** Create a marker with the given screen range. */
    markScreenRange(range: [TextBuffer.IPoint, TextBuffer.IPoint], options?: {
        reversed?: boolean, invalidate?: "never"|"surround"|"overlap"|"inside"|"touch",
        exclusive?: boolean, clipDirection?: "backward"|"forward"|"closest" }):
        DisplayMarker;
    /** Create a marker with the given screen range. */
    markScreenRange(range: [TextBuffer.IPoint, [number, number]], options?: {
        reversed?: boolean, invalidate?: "never"|"surround"|"overlap"|"inside"|"touch",
        exclusive?: boolean, clipDirection?: "backward"|"forward"|"closest" }):
        DisplayMarker;
    /** Create a marker with the given screen range. */
    markScreenRange(range: [[number, number], TextBuffer.IPoint], options?: {
        reversed?: boolean, invalidate?: "never"|"surround"|"overlap"|"inside"|"touch",
        exclusive?: boolean, clipDirection?: "backward"|"forward"|"closest" }):
        DisplayMarker;
    /** Create a marker with the given screen range. */
    markScreenRange(range: [[number, number], [number, number]], options?: {
        reversed?: boolean, invalidate?: "never"|"surround"|"overlap"|"inside"|"touch",
        exclusive?: boolean, clipDirection?: "backward"|"forward"|"closest" }):
        DisplayMarker;

    /** Create a marker on this layer with its head at the given screen position
     *  and no tail. */
    markScreenPosition(screenPosition: TextBuffer.IPoint, options?: {
        invalidate?: "never"|"surround"|"overlap"|"inside"|"touch", exclusive?: boolean,
        clipDirection?: "backward"|"forward"|"closest" }): DisplayMarker;
    /** Create a marker on this layer with its head at the given screen position
     *  and no tail. */
    markScreenPosition(screenPosition: [number, number], options?: {
        invalidate?: "never"|"surround"|"overlap"|"inside"|"touch", exclusive?: boolean,
        clipDirection?: "backward"|"forward"|"closest" }): DisplayMarker;

    /** Create a marker with the given buffer range. */
    markBufferRange(range: TextBuffer.IRange, options?: {
        reversed?: boolean, invalidate?: "never"|"surround"|"overlap"|"inside"|"touch",
        exclusive?: boolean }): DisplayMarker;
    /** Create a marker with the given buffer range. */
    markBufferRange(range: [TextBuffer.IPoint, TextBuffer.IPoint], options?: {
        reversed?: boolean, invalidate?: "never"|"surround"|"overlap"|"inside"|"touch",
        exclusive?: boolean }): DisplayMarker;
    /** Create a marker with the given buffer range. */
    markBufferRange(range: [TextBuffer.IPoint, [number, number]], options?: {
        reversed?: boolean, invalidate?: "never"|"surround"|"overlap"|"inside"|"touch",
        exclusive?: boolean }): DisplayMarker;
    /** Create a marker with the given buffer range. */
    markBufferRange(range: [[number, number], TextBuffer.IPoint], options?: {
        reversed?: boolean, invalidate?: "never"|"surround"|"overlap"|"inside"|"touch",
        exclusive?: boolean }): DisplayMarker;
    /** Create a marker with the given buffer range. */
    markBufferRange(range: [[number, number], [number, number]], options?: {
        reversed?: boolean, invalidate?: "never"|"surround"|"overlap"|"inside"|"touch",
        exclusive?: boolean }): DisplayMarker;

    /** Create a marker on this layer with its head at the given buffer position and no tail. */
    markBufferPosition(bufferPosition: TextBuffer.IPoint, options?: { invalidate?:
        "never"|"surround"|"overlap"|"inside"|"touch", exclusive?: boolean }): DisplayMarker;
    /** Create a marker on this layer with its head at the given buffer position and no tail. */
    markBufferPosition(bufferPosition: [number, number], options?: { invalidate?:
      "never"|"surround"|"overlap"|"inside"|"touch", exclusive?: boolean }): DisplayMarker;

    // Querying ===============================================================
    /** Get an existing marker by its id. */
    getMarker(id: number): DisplayMarker;

    /** Get all markers in the layer. */
    getMarkers(): DisplayMarker[];

    /** Get the number of markers in the marker layer. */
    getMarkerCount(): number;

    /** Find markers in the layer conforming to the given parameters.
     *
     *  This method finds markers based on the given properties. Markers can be associated
     *  with custom properties that will be compared with basic equality. In addition,
     *  there are several special properties that will be compared with the range of the
     *  markers rather than their properties. */
    findMarkers(properties: Params.MarkerProperties): DisplayMarker[];
  }

  /** Represents a gutter within a TextEditor. */
  class Gutter {
    // Gutter Destruction =====================================================
    /** Destroys the gutter. */
    destroy(): void;

    // Event Subscription =====================================================
    /** Calls your callback when the gutter's visibility changes. */
    onDidChangeVisible(callback: (gutter: Gutter) => void): AtomEventKit.Disposable;

    /** Calls your callback when the gutter is destroyed. */
    onDidDestroy(callback: () => void): AtomEventKit.Disposable;

    // Visibility =============================================================
    /** Hide the gutter. */
    hide(): void;

    /** Show the gutter. */
    show(): void;

    /** Determine whether the gutter is visible. */
    isVisible(): boolean;

    /** Add a decoration that tracks a DisplayMarker. When the marker moves, is
     *  invalidated, or is destroyed, the decoration will be updated to reflect
     *  the marker's state. */
    decorateMarker(marker: DisplayMarker, decorationParams:
        { type: "line-number"|"gutter" }): Decoration;
  }

  /** A simple color class returned from Config::get when the value at the key path is
   *  of type 'color'. */
  class Color {
    /** Parse a string or Object into a Color. */
    static parse(value: string|{ red: number, green: number, blue: number, alpha: number }):
        Color;

    /** Returns a string in the form '#abcdef'. */
    toHexString(): string;

    /** Returns a string in the form 'rgba(25, 50, 75, .9)'. */
    toRGBAString(): string;
  }

  /** Run a node script in a separate process. */
  export class Task {
    /** A helper method to easily launch and run a task once. */
    static once(taskPath: string, args: any[]): Task;

    /** Creates a task. You should probably use .once */
    constructor(taskPath: string);

    /** Starts the task.
     *
     *  Throws an error if this task has already been terminated or if sending a
     *  message to the child process fails. */
    start(args: any[], callback: Function): void;

    /** Send message to the task.
     *
     *  Throws an error if this task has already been terminated or if sending a
     *  message to the child process fails. */
    send(message: string): void;

    /** Call a function when an event is emitted by the child process. */
    on(eventName: string, callback: Function): AtomEventKit.Disposable;

    /** Forcefully stop the running task.
     *  No more events are emitted once this method is called. */
    terminate(): void;
  }

  /** A wrapper which provides standard error/output line buffering for
   *  Node's ChildProcess. */
  export class BufferedProcess {
    // Construction ===========================================================
    constructor(options: { command: string, args: any[], options?: Object,
        stdout: (data: string) => void, stderr: (data: string) => void,
        exit: (code: number) => void });

    // Event Subscription =====================================================
    /** Will call your callback when an error will be raised by the process. Usually
     *  this is due to the command not being available or not on the PATH. You can
     *  call handle() on the object passed to your callback to indicate that you
     *  have handled this error. */
    onWillThrowError(callback: (errorObject: { error: Error, handle: Function }) => void):
        AtomEventKit.Disposable;

    // Helper Methods =========================================================
    /** Terminate the process. */
    kill(): void;
  }

  /** Like BufferedProcess, but accepts a Node script as the command to run.
   *
   *  This is necessary on Windows since it doesn't support shebang #! lines. */
  export class BufferedNodeProcess {
    /** Runs the given Node script by spawning a new child process. */
    constructor(options: { command: string, args: any[], options?: Object,
        stdout: Function, stderr: Function, exit: Function });
  }

  class HistoryProject {
    paths: string[];
    lastOpened: Date;
  }

  // Managers and Registries ==================================================
  /** Associates listener functions with commands in a context-sensitive way
   *  using CSS selectors. */
  class CommandRegistry {
    // Register a single command.
    add(target: string|Element, commandName: string, callback: (event: Event) => void):
        AtomEventKit.Disposable

    // Register multiple commands.
    add(target: string|Element, commands: { [key: string]: (event: Event) => void; }):
        AtomEventKit.CompositeDisposable

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
    onDidMatchBinding(callback: (event: Params.KMMatchedBinding) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when one or more keystrokes partially match a binding. */
    onDidPartiallyMatchBindings(callback: (event: Params.KMPartiallyMatchBinds) =>
        void): AtomEventKit.Disposable;

    /** Invoke the given callback when one or more keystrokes fail to match any bindings. */
    onDidFailToMatchBinding(callback: (event: Params.KMFailedMatchBinding) =>
        void): AtomEventKit.Disposable;

    /** Invoke the given callback when a keymap file not able to be loaded. */
    onDidFailToReadFile(callback: (error: Params.KMFileReadFailure) => void):
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

    // TODO(glen): implement the Tooltip object.
    /** Find the tooltips that have been applied to the given element. */
    findTooltips(target: HTMLElement): any[];
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

  /** History manager for remembering which projects have been opened.
   *  An instance of this class is always available as the atom.history global.
   *  The project history is used to enable the 'Reopen Project' menu. */
  class HistoryManager {
    /** Obtain a list of previously opened projects. */
    getProjects(): HistoryProject[];

    /** Clear all projects from the history.
     *  Note: This is not a privacy function - other traces will still exist, e.g.
     *  window state. */
    clearProjects(): void;

    /** Invoke the given callback when the list of projects changes. */
    onDidChangeProjects(callback: (args: { reloaded: boolean }) => void):
        AtomEventKit.Disposable;
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
    observeStyleElements(callback: (styleElement: Params.SMHTMLStyleElement) =>
        void): AtomEventKit.Disposable;

    /** Invoke callback when a style element is added. */
    onDidAddStyleElement(callback: (styleElement: Params.SMHTMLStyleElement) =>
        void): AtomEventKit.Disposable;

    /** Invoke callback when a style element is removed. */
    onDidRemoveStyleElement(callback: (styleElement: HTMLStyleElement) => void):
        AtomEventKit.Disposable;

    /** Invoke callback when an existing style element is updated. */
    onDidUpdateStyleElement(callback: (styleElement: Params.SMHTMLStyleElement) =>
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
    onDidOpen(callback: (event: Params.WSPaneItemOpenEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a pane is added to the workspace. */
    onDidAddPane(callback: (event: Params.WSPaneEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback before a pane is destroyed in the workspace. */
    onWillDestroyPane(callback: (event: Params.WSPaneEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a pane is destroyed in the workspace. */
    onDidDestroyPane(callback: (event: Params.WSPaneEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback with all current and future panes in the workspace. */
    observePanes(callback: (event: Pane) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the active pane changes. */
    onDidChangeActivePane(callback: (event: Pane) => void): AtomEventKit.Disposable;

    /** Invoke the given callback with the current active pane and when the
     *  active pane changes. */
    observeActivePane(callback: (event: Pane) => void): AtomEventKit.Disposable;

    /** Invoke the given callback when a pane item is added to the workspace. */
    onDidAddPaneItem(callback: (event: Params.WSPaneItemEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a pane item is about to be destroyed,
     *  before the user is prompted to save it. */
    onWillDestroyPaneItem(callback: (event: Params.WSPaneItemEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a pane item is destroyed. */
    onDidDestroyPaneItem(callback: (event: Params.WSPaneItemEvent) => void):
        AtomEventKit.Disposable;

    /** Invoke the given callback when a text editor is added to the workspace. */
    onDidAddTextEditor(callback: (event: Params.WSTextEditorEvent) => void):
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

    /** Get the active item if it is an TextEditor. */
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
    /** A HistoryManager instance. */
    history: HistoryManager;
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
    onWillThrowError(callback: (event: Params.AEPreventableThrownError) =>
        void): AtomEventKit.Disposable;

    /** Invoke the given callback whenever there is an unhandled error. */
    onDidThrowError(callback: (event: Params.AEThrownError) => void):
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

  /** This class represents all essential editing state for a single TextBuffer,
   *  including cursor and selection positions, folds, and soft wraps. */
  export class TextEditor extends AtomCore.TextEditor {}

  /** Run a node script in a separate process. */
  export class Task extends AtomCore.Task {}

  /** A wrapper which provides standard error/output line buffering for
   *  Node's ChildProcess. */
  export class BufferedProcess extends AtomCore.BufferedProcess {}

  /** Like BufferedProcess, but accepts a Node script as the command to run.
   *
   *  This is necessary on Windows since it doesn't support shebang #! lines. */
  export class BufferedNodeProcess extends AtomCore.BufferedNodeProcess {}
}
