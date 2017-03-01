// Type definitions for event-kit v2.2.0
// Project: https://github.com/atom/event-kit/tree/v2.2.0
// Definitions by: GlenCFL <https://github.com/GlenCFL/>

// API Documentation: https://atom.io/docs/api/v1.14.3/
//
// These definitions are written to ultimately be used within a global "atom"
// module, with each of these submodules being a direct dependency of that
// parent module. As such, this module is not intended to be imported and used
// as a standalone NPM module.
//
// The following classes are importable directly off of the "atom" module:
//  - Disposable
//  - CompositeDisposable
//  - Emitter

export as namespace AtomEventKit;
export = AtomEventKit;

declare namespace AtomEventKit {
  interface IDisposable {
    dispose(): void;
  }

  /** A handle to a resource that can be disposed. */
  class Disposable implements IDisposable {
    /** Whether or not this object has been disposed of. */
    disposed: boolean;

    /** A callback which will be called within dispose(). */
    disposalAction?: () => void;

    // Methods ================================================================
    /** Ensure that Object correctly implements the Disposable contract. */
    static isDisposable(object: Object): boolean;

    // Construction and Destruction ===========================================
    /** Construct a Disposable. */
    constructor(disposableAction?: Function);

    /** Perform the disposal action, indicating that the resource associated
     *  with this disposable is no longer needed. */
    dispose(): void;
  }

  /** An object that aggregates multiple Disposable instances together into a
   *  single disposable, so they can all be disposed as a group. */
  class CompositeDisposable implements IDisposable {
    // Properties =============================================================
    /** Whether or not this object has been disposed of. */
    disposed: boolean;

    /** The Disposables for which this instance is responsible. */
    disposables: Set<Disposable>;

    // Construction and Destruction ===========================================
    /** Construct an instance, optionally with one or more disposables. */
    constructor(...disposables: IDisposable[]);

    /** Dispose all disposables added to this composite disposable.
     *  If this object has already been disposed, this method has no effect. */
    dispose(): void;

    // Managing Disposables ===================================================
    /** Add disposables to be disposed when the composite is disposed.
     *  If this object has already been disposed, this method has no effect. */
    add(...disposables: IDisposable[]): void;

    /** Remove a previously added disposable. */
    remove(disposable: IDisposable): void;

    /** Clear all disposables. They will not be disposed by the next call to
     *  dispose. */
    clear(): void;
  }

  /** Utility class to be used when implementing event-based APIs that allows
   *  for handlers registered via ::on to be invoked with calls to ::emit. */
  class Emitter implements IDisposable {
    // Properties =============================================================
    /** Whether or not this object has been disposed of. */
    disposed: boolean;

    // Construction and Destruction ===========================================
    /** Construct an emitter. */
    constructor();

    /** Clear out any existing subscribers. */
    clear(): void;

    /** Unsubscribe all handlers. */
    dispose(): boolean;

    // Event Subscription =====================================================
    /** Registers a handler to be invoked whenever the given event is emitted. */
    on(eventName: string, handler: (value: any) => void): Disposable;

    /** Register the given handler function to be invoked before all other
     *  handlers existing at the time of subscription whenever events by the
     *  given name are emitted via ::emit. */
    preempt(eventName: string, handler: (value: any) => void): Disposable;

    // Event Emission =========================================================
    /** Invoke handlers registered via ::on for the given event name. */
    emit(eventName: string): void;
    /** Invoke handlers registered via ::on for the given event name. */
    emit<T>(eventName: string, value: T): void;
  }
}
