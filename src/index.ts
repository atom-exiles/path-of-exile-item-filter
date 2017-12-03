import { AtomPackage } from "./package";

let pack: AtomPackage|undefined;
const entry = {
  initialize() {
    pack = new AtomPackage();
  },
};

export = new Proxy(entry, {
  get(target, name) {
    if (pack && Reflect.has(pack, name)) {
      // tslint:disable-next-line:no-any
      let item = (<any> pack)[name];
      if (typeof item === "function") {
        // tslint:disable-next-line:no-unsafe-any
        item = item.bind(pack);
      }
      return item;
    } else {
      // tslint:disable-next-line:no-any
      return (<any> target)[name];
    }
  },
});
