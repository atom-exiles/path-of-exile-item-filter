// Type definitions for pathwatcher v6.8.0
// Project: https://github.com/atom/node-pathwatcher/tree/v6.8.0
// Definitions by: GlenCFL <https://github.com/GlenCFL/>

/// <reference types="node" />
/// <reference path="../event-kit/index.d.ts" />

// API Documentation: https://atom.io/docs/api/v1.15.0/
//
// These definitions are written to ultimately be used within a global "atom"
// module, with each of these submodules being a direct dependency of that
// parent module. As such, this module is not intended to be imported and used
// as a standalone NPM module.
//
// The following classes are importable directly off of the "atom" module:
//  - File
//  - Directory

import { ReadStream, WriteStream } from "fs";

export as namespace PathWatcher;
export = PathWatcher;

declare namespace PathWatcher {
  /** Objects that appear as parameters to callbacks, broken off for easy
   *  callback definition (both here and in user code). */
  namespace Params {
    interface BufferWatchError {
      /** The error object. */
      error: Error,

      /** Call this function to indicate you have handled the error.
       *  The error will not be thrown if this function is called. */
      handle(): void;
    }
  }

  /** Represents an individual file that can be watched, read from, and written to. */
  class File {
    // Properties =============================================================
    encoding: string;
    path: string;
    symlink: boolean;

    // Construction ===========================================================
    /** Configures a new File instance, no files are accessed. */
    constructor(filePath: string, symlink?: boolean);

    /** Creates the file on disk that corresponds to ::getPath() if no such file
     *  already exists. */
    create(): Promise<boolean>;

    // Event Subscription =====================================================
    /** Invoke the given callback when the file's contents change. */
    onDidChange(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the file's path changes. */
    onDidRename(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when the file is deleted. */
    onDidDelete(callback: () => void): AtomEventKit.Disposable;

    /** Invoke the given callback when there is an error with the watch. When
     *  your callback has been invoked, the file will have unsubscribed from the
     *  file watches. */
    onWillThrowWatchError(callback: (errorObject: Params.BufferWatchError) =>
        void): AtomEventKit.Disposable;

    // File Metadata ==========================================================
    /** Returns a boolean, always true. */
    isFile(): boolean;

    /** Returns a boolean, always false. */
    isDirectory(): boolean;

    /** Returns a boolean indicating whether or not this is a symbolic link. */
    isSymbolicLink(): boolean;

    /** Returns a promise that resolves to a boolean, true if the file exists,
     *  false otherwise. */
    exists(): Promise<boolean>;

    /** Returns a boolean, true if the file exists, false otherwise. */
    existsSync(): boolean;

    /** Get the SHA-1 digest of this file. */
    getDigest(): Promise<string>;

    /** Get the SHA-1 digest of this file. */
    getDigestSync(): string;

    /** Sets the file's character set encoding name. */
    setEncoding(encoding: string): void;

    /** Returns the string encoding name for this file (default: "utf8"). */
    getEncoding(): string;

    // Managing Paths =========================================================
    /** Returns the string path for the file. */
    getPath(): string;

    /** Returns this file's completely resolved string path. */
    getRealPathSync(): string;

    /** Returns a promise that resolves to the file's completely resolved
     *  string path. */
    getRealPath(): Promise<string>;

    /** Return the string filename without any directory information. */
    getBaseName(): string;

    // Traversing =============================================================
    /** Return the Directory that contains this file. */
    getParent(): Directory;

    // Reading and Writing ====================================================
    /** Reads the contents of the file. */
    read(flushCache?: boolean): Promise<string>;

    /** Returns a stream to read the content of the file. */
    createReadStream(): ReadStream;

    /** Overwrites the file with the given text. */
    write(text: string): Promise<undefined>;

    /** Returns a stream to write content to the file. */
    createWriteStream(): WriteStream;

    /** Overwrites the file with the given text. */
    writeSync(text: string): undefined;
  }

  /** Represents a directory on disk that can be watched for changes. */
  class Directory {
    // Properties =============================================================
    path: string;
    symlink: boolean;

    // Construction ===========================================================
    /** Configures a new Directory instance, no files are accessed. */
    constructor(directoryPath: string, symlink?: boolean);

    /** Creates the directory on disk that corresponds to ::getPath() if no such
     *  directory already exists. */
    create(mode?: boolean): Promise<boolean>;

    // Event Subscription =====================================================
    /** Invoke the given callback when the directory's contents change. */
    onDidChange(callback: Function): AtomEventKit.Disposable;

    // Directory Metadata =====================================================
    /** Returns a boolean, always false. */
    isFile(): boolean;

    /** Returns a roolean, always true. */
    isDirectory(): boolean;

    /** Returns a boolean indicating whether or not this is a symbolic link. */
    isSymbolicLink(): boolean;

    /** Returns a promise that resolves to a boolean, true if the directory\
     *  exists, false otherwise. */
    exists(): Promise<boolean>;

    /** Returns a boolean, true if the directory exists, false otherwise. */
    existsSync(): boolean;

    /** Return a boolean, true if this Directory is the root directory of the
     *  filesystem, or false if it isn't. */
    isRoot(): boolean;

    // Managing Paths =========================================================
    /** This may include unfollowed symlinks or relative directory entries.
     *  Or it may be fully resolved, it depends on what you give it. */
    getPath(): string;

    /** All relative directory entries are removed and symlinks are resolved to
     *  their final destination. */
    getRealPathSync(): string;

    /** Returns the string basename of the directory. */
    getBaseName(): string;

    /** Returns the relative string path to the given path from this directory. */
    relativize(fullPath: string): string;

    // Traversing =============================================================
    /** Traverse to the parent directory. */
    getParent(): Directory;

    /** Traverse within this Directory to a child File. This method doesn't actually
     *  check to see if the File exists, it just creates the File object. */
    getFile(filename: string): File;

    /** Traverse within this a Directory to a child Directory. This method doesn't actually
     *  check to see if the Directory exists, it just creates the Directory object. */
    getSubdirectory(dirname: string): Directory;

    /** Reads file entries in this directory from disk synchronously. */
    getEntriesSync(): (File|Directory)[];

    /** Reads file entries in this directory from disk asynchronously. */
    getEntries(callback: (error: Error, entries: (File|Directory)[]) => void): void;

    /** Determines if the given path (real or symbolic) is inside this directory. This
     *  method does not actually check if the path exists, it just checks if the path
     *  is under this directory. */
    contains(pathToCheck: string): boolean;
  }
}
