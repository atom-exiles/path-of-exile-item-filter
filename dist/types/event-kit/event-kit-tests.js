"use strict";
var atom_1 = require("atom");
var disposable = new atom_1.Disposable(function () { });
if (disposable.disposalAction) {
    console.log(disposable.disposalAction);
}
if (!disposable.disposed) {
    disposable.dispose();
}
var user = new User();
var subscription = user.onDidChangeName(function (name) {
    console.log("User name change to: " + name);
});
if (atom_1.Disposable.isDisposable(subscription)) {
    subscription.dispose();
}
var subscriptions = new atom_1.CompositeDisposable();
subscriptions.add(user.onDidChangeName(function (name) {
    console.log("subscriber #1");
}), user.onDidChangeName(function (name) {
    console.log("subscriber #2");
}));
var namedSubscriber = new atom_1.Disposable(function () { });
subscriptions.add(namedSubscriber);
subscriptions.remove(namedSubscriber);
console.log(subscriptions.disposables.size);
if (!subscriptions.disposed) {
    subscriptions.clear();
    subscriptions.dispose();
}
var User = (function () {
    function User() {
        this.emitter = new atom_1.Emitter();
    }
    User.prototype.onDidChangeName = function (callback) {
        return this.emitter.on("did-change-name", callback);
    };
    User.prototype.setName = function (name) {
        if (this.name != name) {
            this.name = name;
            this.emitter.emit("did-change-name", name);
        }
    };
    User.prototype.destroy = function () {
        this.emitter.clear();
        if (!this.emitter.disposed) {
            this.emitter.dispose();
        }
    };
    return User;
}());
