A cheat sheet providing information on the syntax of an item filter.

## Blocks
Keyword | Trailing Comment
--- | ---
Show | Yes
Hide | Yes

## Filter Rules
Keyword | Operator | Values | Case Sensitive
--- | --- | --- | ---
ItemLevel | All | 0-100 | No
DropLevel | All | 0-100 | No
Quality | All | 0-20 | No
Rarity | All | One of the following strings: Normal, Magic, Rare, Unique | Yes
Class | Equality | String from the list of Classes | Yes
BaseType | Equality | String from the list of Bases | Yes
Sockets | All | 0-6 | No
LinkedSockets | All | 0, 2-6 | No
SocketGroup | Equality | String consisting of *r, g, b, w* | No
Height | All | 1-4 | No
Width | All | 1-2 | No
Identified | Equality | True, False | No
Corrupted | Equality | True, False | No
ShapedMap | Equality | True, False | No
ElderMap | Equality | True, False | No

## Action Rules
Keyword | Operator | Values | Trailing Comment | Theme Element | Case Sensitive
--- | --- | --- | --- | --- | --- |
SetBorderColor | Equality | 0-255 (3-4 Values) | Yes | Yes | N/A
SetTextColor | Equality | 0-255 (3-4 Values) | Yes | Yes | N/A
SetBackgroundColor | Equality | 0-255 (3-4 Values) | Yes | Yes | N/A
PlayAlertSound | Equality | 1-16 [0-300] | Yes | Yes | N/A
PlayAlertSound | Equality | Word from the list of valid sounds | [0-300] | Yes | Yes | Yes
SetFontSize | Equality | 18-45 | No | No | N/A
