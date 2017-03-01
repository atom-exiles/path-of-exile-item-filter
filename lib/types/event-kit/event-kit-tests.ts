// These tests are never actually run. Their purpose is to simply check our
// event-kit type definitions against the TypeScript compiler.

import { Disposable, CompositeDisposable, Emitter } from "atom";

// Disposable
var disposable = new Disposable(() => {});

if(disposable.disposalAction) {
  console.log(disposable.disposalAction);
}

if(!disposable.disposed){
  disposable.dispose();
}

var user = new User();
var subscription = user.onDidChangeName((name: string) => {
  console.log("User name change to: " + name);
});

if(Disposable.isDisposable(subscription)) {
  subscription.dispose();
}

// CompositeDisposable
var subscriptions = new CompositeDisposable();

subscriptions.add(
  user.onDidChangeName((name: string) => {
    console.log("subscriber #1");
  }),
  user.onDidChangeName((name: string) => {
    console.log("subscriber #2");
  })
);

var namedSubscriber = new Disposable(() => {});
subscriptions.add(namedSubscriber);
subscriptions.remove(namedSubscriber);

console.log(subscriptions.disposables.size)

if(!subscriptions.disposed) {
  subscriptions.clear();
  subscriptions.dispose();
}

// Emitter
class User {
  private emitter: Emitter;
  name: string;

  constructor() {
    this.emitter = new Emitter();
  }

  onDidChangeName(callback: (name: string) => void): Disposable {
    return this.emitter.on("did-change-name", callback);
  }

  setName(name: string): void {
    if (this.name != name) {
      this.name = name;
      this.emitter.emit("did-change-name", name);
    }
  }

  destroy(): void {
    this.emitter.clear();
    if(!this.emitter.disposed) {
      this.emitter.dispose();
    }
  }
}
