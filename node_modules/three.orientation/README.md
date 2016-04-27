# three.orientation

Control three.js camera with device orientation API

# usage

``` js
// create control:
var orientationControl = require('three.orientation')(camera);

// somewhere inside request animation frame:
orientationContorl.update();
```

This module depends on `THREE.js` being in a global scope


# install

With [npm](https://npmjs.org) do:

```
npm install three.orientation
```

# license

MIT
