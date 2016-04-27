# maco [![Build Status](https://travis-ci.org/anvaka/maco.svg)](https://travis-ci.org/anvaka/maco)

This script allows you to avoid using javascript "classes" when dealing
with React. This enables true encapsulation via closures.

# Example

Let's take a look at simple `Counter` component:

``` js
// counter.js file
var React = require('react');
module.exports = require('maco')(counter, React);

function counter(x) {
  // we will increase counter `i` every second:
  var i = 0;
  setInterval(updateMessage, 1000);

  function updateMessage() {
    i++; // `i` is truly encapsulated. Nobody but this counter can modify it.

    x.forceUpdate(); // tell React to enqueue the update.
  }

  // tell React how to render this component
  x.render = function () {
    // notice regular props, as well as internal `i`:
    return <h2>{x.props.name}: {i}</h2>;
  }
}
```

Now that we have a Counter, no extra logic is required to use it from
react application:

``` js
// app.js file
var ReactDOM = require('react-dom');
var Counter = require('./counter.js');

ReactDOM.render(
  <Counter name="my counter" />,
  document.getElementById('root')
);
```

## defaultProps and propTypes

When authoring react components it's often desirable to set `defaultProps` and
`propTypes`. [Facebook recommends](https://facebook.github.io/react/docs/reusable-components.html#es6-classes)
to use constructor function, so let's do it:

``` js
// counter.js file
var React = require('react');
var Counter = require('maco')(counter, React);

Counter.propTypes = { name: React.PropTypes.string };
Counter.defaultProps = { name: 'My counter' };

module.exports Counter;
```

This will result in standard behavior for `propTypes` validation and initial
value assignment.

## demo
The demo source code is [available here](https://github.com/anvaka/maco/tree/master/demo).
Running example is [here](//anvaka.github.io/maco/demo/).

## single React instance

React instance is required to avoid multiple versions of React in the same
bundle. For your convenience you can bind `maco` to your own React instance
like so:

``` js
// in your local project, let's say lib/maco.js is the name of this file
var React = require('react');
module.exports = require('maco').bindToReact(React);

// now any other file (let's say counter.js) in your project can do
module.exports = require('./lib/maco.js')(counter);

function counter(x) {
  var i = 42;
  x.render = function () { return <h2>Hello {i}</h2> }
}
```

# Why?

This approach has couple benefits:

* Unlike prototype-based classes, maco allows you to truly encapsulate data:
It's just a regular javascript closure.
* No need to remember what is `this` anymore. The component instance is
passed as an argument to the function. In the example above it's called `x`.
* Dead simple.

# How?

`maco` is very simple wrapper on top of `React.Component`. Actually, it's only
several lines long:

``` js
function maco(factory, React) {
  inherits(Maker, React.Component);

  return Maker;

  function Maker(props) {
    Maker.prototype.constructor.call(this, props);
    factory.call(this, this);
  }
}
```

We create a new child of `React.Component` and from the constructor invoke
the "factory" callback. Factory callback is bound to the current component.
In other words `this` will be the same as what you'd normally expect from
React.

I'm passing current component instance (`this`) as an argument to the `factory
function`. It is just for your convenience, so you don't have to do silly
`that = this` dance.

# install

```
npm install maco
```

# license

MIT
