import React from 'react';
import LoadingIndicator from './loadingIndicator.jsx';
import MessageRibbon from './messageRibbon.jsx';
import Scene from './scene.jsx';
import appEvents from './service/appEvents.js';

module.exports = require('maco')(galaxyPage, React);

function galaxyPage(x) {
  var currentPath;

  x.render = function() {
    loadGraphIfRouteChanged();

    return (
      <div>
        <MessageRibbon />
        <LoadingIndicator />
        <Scene />
      </div>
    );
  };

  function loadGraphIfRouteChanged() {
    appEvents.downloadGraphRequested.fire('synsets');
    appEvents.queryChanged.fire();
  }
}
