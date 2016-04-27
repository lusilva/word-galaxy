module.exports = makeIt;
makeIt.template = makeTemplate;

makeIt.bindToReact = function (React) {
  return function (factory) {
    return makeIt(factory, React);
  };
};

function makeIt(factory, React) {
  assertArguments(factory, React);

  inherits(Maker, React.Component);
  Maker.displayName = factory.name;

  return Maker;

  function Maker(props) {
    classCallCheck(this, Maker);
    Maker.prototype.constructor.call(this, props);
    factory.call(this, this);
  }
}

function makeTemplate(factory, React) {
  // templates only care about rendering
  return React.createClass({
    render: function() {
      return factory.bind(this)(this.props);
    }
  });
}

function classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype);
  if (superClass) subClass.__proto__ = superClass;
}

function assertArguments(factory, React) {
  if (typeof factory !== 'function') {
    throw new Error('factory argument is supposed to be a function. See documentation: https://github.com/anvaka/maco');
  }
  if (!React || !React.Component) {
    throw new Error('React is supposed to be passed to maco');
  }
}
