import React from 'react';
import appEvents from './service/appEvents.js';

module.exports = require('maco')(loadingIndicator, React);

function loadingIndicator(x) {
  var loadingMessage = '';

  x.render = function() {
    return <div className='label loading'>{loadingMessage}</div>
  };

  x.componentDidMount = function() {
    appEvents.loadProgress.on(updateLoadingIndicator);
  };

  x.componentWillUnmount = function() {
    appEvents.loadProgress.off(updateLoadingIndicator);
  };

  function updateLoadingIndicator(progress) {
    if (progress.message && progress.completed) {
      loadingMessage = `${progress.message} - ${progress.completed}`;
    } else if (progress.message) {
      loadingMessage = `${progress.message}`;
    } else {
      loadingMessage = '';
    }
    x.forceUpdate();
  }
}
