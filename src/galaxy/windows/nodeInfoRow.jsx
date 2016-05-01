import React from 'react';
import NODE_COLORS from '../native/nodeColors.js';
import formatNumber from '../utils/formatNumber.js';

module.exports = require('maco').template(windowTitle, React);

function windowTitle(props) {
  var item = props.viewModel;

  function truncateString(string, maxLength) {
    return string.length > maxLength ?
      (string.substring(0, maxLength) + '...') :
      string;
  }


  function resultNode(node, index) {
    return (
      <div key={node.id + '-' + index}>
        <div className='no-oveflow col-md-5 col-xs-5 col-md-offset-1 col-xs-offset-1'>
         <span id={node.id} className='node-focus'
               style={{color: NODE_COLORS.getStringColor(node.pos)}}>
            {truncateString(node.name, 15)}
          </span>
        </div>
        <div id={node.id} className='in-degree col-md-3 col-xs-3'>
          {formatNumber(node.in)}
        </div>
        <div id={node.id} className='out-degree col-md-3 col-xs-3'>
          {formatNumber(node.out)}
        </div>
      </div>
    )
  }

  if (item.lemma) {
    return (
      <div className='row'>
        <div className='no-oveflow col-md-12 col-xs-12'>
          {truncateString(item.lemma, 20)}
        </div>
        {item.nodes.map(resultNode)}
      </div>
    );
  }
  return <div className="row">{resultNode(item, 0)}</div>
}
