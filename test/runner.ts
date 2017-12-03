import { createRunner } from "atom-mocha-test-runner";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as path from "path";

chai.use(chaiAsPromised);
global.assert = chai.assert;

let enableColor = true;
if (process.platform === "win32" && !process.env["MSYSTEM"]) {
  enableColor = false;
}

module.exports = createRunner({
  htmlTitle: `PoE Item Filter Tests - PID ${process.pid}`,
  reporter: process.env.MOCHA_REPORTER || "spec",
  testSuffixes: ["spec.ts"],
  colors: enableColor,
}, mocha => {
  mocha.timeout(parseInt(process.env.MOCHA_TIMEOUT || "1000", 10));

  if (process.env.TEST_JUNIT_XML_PATH) {
    mocha.reporter(require("mocha-junit-and-console-reporter"), {
      mochaFile: process.env.TEST_JUNIT_XML_PATH,
    });
  } else if (process.env.APPVEYOR_API_URL) {
    // tslint:disable-next-line:no-unsafe-any
    mocha.reporter(require("mocha-appveyor-reporter"));
  } else if (process.env.CIRCLECI === "true") {
    const circleReports = process.env.CIRCLE_TEST_REPORTS;
    if (circleReports) {
      mocha.reporter(require("mocha-junit-and-console-reporter"), {
        mochaFile: path.join(circleReports, "mocha",
          "test-results.xml"),
      });
    }
  }
});
