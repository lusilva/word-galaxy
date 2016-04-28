import React from 'react';
import {findDOMNode} from 'react-dom';
import HoverInfo from './hoverInfo.jsx';
import NodeDetails from './nodeDetails/nodeDetailsView.jsx';
import $ from 'jquery';

import SteeringIndicator from './steeringIndicator.jsx';
import SearchBox from './search/searchBoxView.jsx';
import NoWebGL from './noWebgl.jsx';
import Help from './help.jsx';
import About from './about.jsx';
import Legend from './legend.jsx';

import WindowCollection from './windows/windowCollectionView.jsx';
import createNativeRenderer from './native/renderer.js';
import createKeyboardBindings from './native/sceneKeyboardBinding.js';

import appEvents from './service/appEvents.js';
var webglEnabled = require('webgl-enabled')();
module.exports = require('maco')(scene, React);

function scene(x) {
  var nativeRenderer, keyboard;
  var hoverModel, delegateClickHandler;

  x.render = function() {
    if (!webglEnabled) {
      return <NoWebGL />;
    }

    return (
      <div>
        <div ref='graphContainer' className='graph-full-size'></div>
        <div ref='secondaryGraphContainer' className='graph-2D'></div>
        <HoverInfo />
        <NodeDetails />
        <SteeringIndicator />
        <SearchBox />
        <WindowCollection />
        <Help />
        <About />
        <Legend />
      </div>
    );
  };

  x.componentDidMount = function() {
    if (!webglEnabled) return;
    var container = findDOMNode(x.refs.graphContainer);
    nativeRenderer = createNativeRenderer(container);
    keyboard = createKeyboardBindings(container);
    delegateClickHandler = container.parentNode;
    delegateClickHandler.addEventListener('click', handleDelegateClick);
    appEvents.show2DGraph.on(show2DGraph);
  };

  x.componentWillUnmount = function() {
    if (nativeRenderer) nativeRenderer.destroy();
    if (keyboard) keyboard.destroy();
    if (delegateClickHandler) delegateClickHandler.removeEventListener('click', handleDelegateClick);
  };


  function show2DGraph(nodeId, focusNodeCallback) {
    


    let fullGraph = $('.graph-full-size');
    fullGraph.removeAttr("tabindex");
    fullGraph.addClass('mini');

    var x = 0;
    var that = this;
    var intervalID = setInterval(function() {
      window.dispatchEvent(new Event('resize'));
      focusNodeCallback(nodeId);
      if (++x === 5) {
        fullGraph.on('click.graph', hide2DGraph.bind(that, nodeId, focusNodeCallback));
        window.clearInterval(intervalID);
      }
    }, 100);
  }

  function hide2DGraph(nodeId, focusNodeCallback) {
    let fullGraph = $('.graph-full-size');
    fullGraph.attr("tabindex", -1);
    fullGraph.removeClass('mini');
    fullGraph.off('click.graph');

    var x = 0;
    var intervalID = setInterval(function() {
      window.dispatchEvent(new Event('resize'));
      focusNodeCallback(nodeId);
      if (++x === 5) {
        appEvents.focusScene.fire();
        window.clearInterval(intervalID);
      }
    }, 100);
  }

  function handleDelegateClick(e) {
    var clickedEl = e.target;

    // since we are handling all clicks, we should avoid excessive work and
    // talk with DOM only when absolutely necessary:
    var classList = clickedEl.classList;
    var isInDegree = classList.contains('in-degree');
    var isOutDegree = !isInDegree && classList.contains('out-degree');
    var nodeId;
    if (isInDegree || isOutDegree) {
      nodeId = parseInt(clickedEl.id, 10);
      var connectionType = isInDegree ? 'in' : 'out';

      appEvents.showDegree.fire(nodeId, connectionType);
    }
    if (classList.contains('node-focus')) {
      nodeId = parseInt(clickedEl.id, 10);
      appEvents.focusOnNode.fire(nodeId);
    }
  }
}
