// Type definitions for package-deps v4.6.0
// Project: https://github.com/steelbrain/package-deps

declare module "atom-package-deps" {
  function install(givenPackageName?: string): Promise<void>;
  function install(givenPackageName: string, promptUser?: boolean): Promise<void>;
}
