import React from 'react';
import detailModel from './nodeDetailsStore.js';
import specialNodeDetails from './templates/all.js';
import scene from '../store/scene.js';
import appEvents from '../service/appEvents.js';

module.exports = require('maco')(detailedNodeView, React);

function detailedNodeView(x) {
  var hidden = false;

  x.render = function() {
    var selectedNode = !hidden ? detailModel.getSelectedNode() : null;
    if (!selectedNode) return null;
    var NodeDetails = getNodeDetails(selectedNode);

    return (
      <div className='node-details'>
        <NodeDetails model={selectedNode}/>
      </div>
    );
  };

  x.componentDidMount = function() {
    detailModel.on('changed', updateView);
    appEvents.hideAllWindows.on(hide);
  };

  x.componentWillUnmount = function() {
    detailModel.off('changed', updateView);
    appEvents.hideAllWindows.off(hide);
  };

  function hide() {
    hidden = true;
    x.forceUpdate();
  };

  function getNodeDetails(viewModel) {
    var Template = specialNodeDetails[scene.getGraphName()] || specialNodeDetails.default;
    return Template;
  }

  function updateView() {
    hidden = false;
    x.forceUpdate();
  }
}
