# return.macro

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![dependency status](https://david-dm.org/proteriax/return.macro/status.svg)](https://david-dm.org/proteriax/return.macro#info=dependencies)
[![npm version](https://badge.fury.io/js/return.macro.svg)](https://badge.fury.io/js/return.macro)

## Example

```js
import _return from "return.macro"

const value = getValue() ?? _return()
const [left, right] = getValue() ?? _return(false)
const { node } = getValue() ?? _return()
```

desugars to
```js
const value = getValue();
if (value == null) return;

const [left, right] = getValue();
if (left == null || right == null) return false;

const { node} = getValue();
if (node == null) return;
```