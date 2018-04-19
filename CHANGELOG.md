## Version 1.4.1
* Added Necromancy Net
* Added the item filter option ElderMap

## Version 1.4.0
* Implemented changes from Bestiary League.
* New skill gems Spectral shield throw, Tectonic slam, and Summon phantasm on kill Support.
* New divination cards The shaper's key, The world eater, The puzzle, The obscured, The iron bard, The insatiable, The dreamer, The deceiver, The breach, Forbidden power, and Blessing of god.
* Bestiary orbs and nets.

## Version 1.2.0
* Began transpiling the package source code on first run, rather than packaging the compiled source.
* Use an activation trigger for package activation, instead of always activating.
* Support both AtomIDE and Linter.
* Only prompt users to install AtomIDE if neither AtomIDE or Linter are installed.
* Started using TSLint on the project.
* Changes to the whitelist configuration variables will trigger a reparse on item filters once again.
* Fixed several rare cases where exceptions would be thrown, with one being caused by repeated deactivation.

## Version 1.1.5-1.1.8
* Full support for the additional sounds in Fall of Oriath.
* Mark "PlayAlertSound Orb" as invalid syntax.
* Improved package activation time.
* Moved the Git repository over to an organization.
* Removed the chunkSize configuration variable, as it is no longer used.
* Allow the UTF8 BOM to appear on the same line as Show and Hide blocks in the grammar.
* Stopped offloading work onto a separate Node process.
  * The 'text-buffer' optimizations in Atom 1.19 have made filter processing drastically faster on the main process, so this is no longer necessary.

The PlayAlertSound parser within Path of Exile now allows many different values to appear as the identifier, with some resulting in crashes whenever the sound is triggered. Our parser is strict and will mark these as errors.

## Versions 1.1.3-1.1.4
* Added full support for Fall of Oriath and the Harbinger league.
* Added support for the new PlayAlertSoundPositional rule.
* Added the new sounds for the PlayAlertSound rule.
* The PlayAlertSound rule can now have "Orb" as its first value.
* Removal of datasets as a feature with the end of the beta.

## Versions 1.1.0-1.1.2
* Added a new dataset for the Fall of Oriath beta.
* Fixed the gutter background on lines with a cursor.
* Stop displaying both the invalid format and invalid value messages for Class and BaseType rules.
* Require Linter 2.2 in order to avoid issues caused by 2.0.

## Version 1.1.0
* Added support for datasets, which will allow you to write filters for future versions of the game. There is currently only one dataset.
* Added our own gutter to the editor, which is used to hold our decorations. This gutter will only be added to editors containing item filters.
* Reworked package initialization. The majority of features will now be available even if the user declines the installation of additional dependencies.
* Significant changes to the JSON data, including file merges and the addition and removal of some data.
* Started using a background process to do the initial parse of a filter. Loading large item filters will no longer freeze the editor for several seconds on file open.
* The following configuration variables have been added:
  * General -> Chunk Size: allows you to control the maximum number of lines processed at any given time.
  * General -> Enable Editor Gutter: sets the visibility of our gutter in the editor.
  * Data -> Dataset: allows the selection of a dataset.
  * Linter -> Enable Warnings: toggles the display of Linter warning messages.
  * Linter -> Enable Information: toggles the display of Linter information messages.
* The following configuration variables have been removed:
  * Data -> Enable League Data
  * Data -> Enable Legacy Data
  * Data -> Enable Recipe Data
  * Autocomplete -> Enable Icons
  * Gutter -> Enable Color Decorations
  * Gutter -> Enable Sound Decorations

Automatic conversion of hexadecimal values to the format used by Path of Exile has been temporarily removed. This feature will return, with the goal being to support all formats outputted by the Atom [color-picker](https://github.com/thomaslindstrom/color-picker) package.

## Versions 1.0.1-1.0.9
* Added linter errors for trailing comments on rules where it's an error in-game.
* Extension renames for opened files are now properly handled.
* A linter error will no longer flash when converting hexadecimal text.
* Fixed an exception error thrown when editing an unnamed item filter.
* Added a Linter error for SetFontSize when it appears with an operator.
* Eternal Orb and Item Quantity Support moved to league data list.
* Fixed an issue which occurred when RGBA rules contained a 0.
* Better support for filter files not yet on disk.
* Fixed filter decorations vanishing on other tabs whenever a filter is closed.
* Partial support for the new version of our Linter dependency.
* Gutter decorations and Linter messages should now behave properly when editing multiple lines.
* Linter improvements, including descriptions and solutions where appropriate.
* Added extra suggestions for each endgame set.
* The option to enable and disable the linter works properly once again.
* Tabs containing a filter will no longer be processed twice whenever the editor is launched.

## Version 1.0.0
* Support for 2.6 and Legacy league.
* Added a linter, which provides error checking outside of the game.
* Decorations for previewing sound alerts and colors for each appropriate line.
* Added configuration settings, including class and base whitelists.
* Autocompletion improvements and bug fixes.
* Added completion decorations, which can be turned off in settings.
* Improvements to the grammar.
* Began using JSON files for our data.
* Hide blocks can now have action rules, such as SetFontSize.
* Most action rules can now have a trailing comment.
* Added completions for Map tiers, each of which inserts a new Show block.
* Automatic conversion of hex values for the rules taking an RGBA color value.
* Stopped using snippets for filter keywords.

## Version 0.1.8
* Added the 15 new divination cards from 2.5.1.
* Allow empty lines in Show and Hide blocks.
* Fix for the Corrupted rule, as it is case sensitive after all.
* Added fishing rods.
* Fixed a typo in Alder Spiked Shield.

## Version 0.1.7
* Added 'toggle-line-comments' support.
* Revamp of the grammar to work well with syntax themes.
* Added the new 2.4.2 active gems.
* Support for 2.5 and Breach league.
* Added support for Corrupted filter.

## Version 0.1.5
* Fixed several typos in map names.

## Version 0.1.4
* Added divination cards to the item lists.
* Improved suggestion filtering.
* Added a color differential between filter and action rules.

## Version 0.1.3
* Support for Atlas of Worlds.
* Added quivers to the item list.
* Fixed spelling mistakes in value names.

## Version 0.1.2
* Support for the Identified rule.

## Version 0.1.1
* Support for Prophecy.
* Support for Talisman.
* Support for Perandus.

## Version 0.1.0
* Grammar for Path of Exile item filters added.
