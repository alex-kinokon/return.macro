# return.macro

## Example

```js
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