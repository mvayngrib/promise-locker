
# promise-locker

your basic lock-on-an-id mechanism with promises

## Usage

```js
const locker = require('promise-locker')
const lock = locker()
const unlockA = lock('a')
// call unlockA() when done
// somewhere else
const unlockA = lock('a')
// will wait for previous unlock call
```
