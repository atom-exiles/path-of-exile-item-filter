// These tests are never actually run. Their purpose is to simply check our
// pathwatcher type definitions against the TypeScript compiler.

import { File, Directory } from "atom";

// File =======================================================================
{
  var currentFile = new File("test.file");

  console.log(currentFile.encoding);
  console.log(currentFile.path);
  if(currentFile.symlink) { console.log("symlink"); };

  currentFile.create();

  currentFile.onDidChange((): void => {
    console.log("onDidChange");
  });

  currentFile.onDidRename((): void => {
    console.log("onDidRename");
  });

  currentFile.onDidDelete((): void => {
    console.log("onDidDelete");
  });

  currentFile.onWillThrowWatchError((error): void => {
    throw error.error
  });

  if(currentFile.isFile()) { console.log("isFile"); };
  if(currentFile.isDirectory) { console.log("isDirectory"); };
  if(currentFile.isSymbolicLink) { console.log("isSymbolicLink"); };

  var exists = currentFile.exists();
  exists.then((exists) => {
    if(exists == true) {
      console.log("exists");
    }
  });

  if(currentFile.existsSync()) { console.log("existsSync"); };

  var digest = currentFile.getDigestSync();
  console.log(digest.toLowerCase());

  var digestPromise = currentFile.getDigest();
  digestPromise.then((digest) => {
    console.log(digest.toLowerCase());
  });

  currentFile.setEncoding("utf8");
  var encoding = currentFile.getEncoding();
  console.log(encoding.toLowerCase());

  var path = currentFile.getPath();
  console.log(path.toLowerCase());

  var realPath = currentFile.getRealPathSync();
  console.log(realPath.toLowerCase());

  var realPathPromise = currentFile.getRealPath();
  realPathPromise.then((path): void => {
    console.log(path.toLowerCase());
  });

  var baseName = currentFile.getBaseName();
  console.log(baseName.toLowerCase());

  var parent = currentFile.getParent();
  if(parent.isDirectory() == true) { console.log("parent"); };

  var fileContents = currentFile.read();
  fileContents.then((contents): void => {
    console.log(contents);
  });
  currentFile.read(true);

  var rStream = currentFile.createReadStream();
  rStream.close();

  var writePromise = currentFile.write("test");
  writePromise.then((result): void => {
    return;
  });

  currentFile.writeSync("test");

  var wStream = currentFile.createWriteStream();
  rStream.close();
}

// Directory ==================================================================
{
  var directory = new Directory("dir");
  var d2 = new Directory("dir", true);

  console.log(directory.path.toLowerCase());
  if(directory.symlink) { console.log("symlink"); };

  directory.create();
  var creation = directory.create(true);
  creation.then((success): void => {
    if(success) { console.log("create"); };
  });

  directory.onDidChange(() => { console.log("onDidChange"); });

  if(directory.isFile) { console.log("isFile"); };
  if(directory.isDirectory) { console.log("isDirectory"); };
  if(directory.isSymbolicLink) { console.log("isSymbolicLink"); };

  var exists = directory.exists();
  exists.then((exists): void => {
    if(exists) { console.log("exists"); };
  });

  if(directory.existsSync) { console.log("existsSync"); };
  if(directory.isRoot) { console.log("isRoot"); };

  var path = directory.getPath();
  console.log(path.toLowerCase());

  var realPath = directory.getRealPathSync();
  console.log(realPath.toLowerCase());

  var baseName = directory.getBaseName();
  console.log(baseName.toLowerCase());

  var relPath = directory.relativize("test");
  console.log(relPath.toLowerCase());

  var parent = directory.getParent();
  console.log(parent.path);

  var file = directory.getFile("a");
  console.log(file.path);

  var subDir = directory.getSubdirectory("a");
  console.log(subDir.path);

  var entries = directory.getEntriesSync();
  entries.push(file);
  entries.push(parent);

  directory.getEntries((error, entries): void => {
    if(error) {
      throw error;
    } else {
      entries.push(file);
    }
  });

  if(directory.contains("test") == true) { console.log("contains"); };
}
