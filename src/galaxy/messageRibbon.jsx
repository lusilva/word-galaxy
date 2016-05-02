import React from 'react';
import appEvents from './service/appEvents.js';

module.exports = require('maco')(messageRibbon, React);

function messageRibbon(x) {
  var message;

  x.render = function() {
    if (message) {
      return (
        <div className='label message'>
          <div>
            displaying {getConnectionType(message.type)[0]} for {message.root.name}
          </div>
          click the node to display {getConnectionType(message.type)[1]} instead
        </div>
      )
    }
    return null;
  };

  x.componentDidMount = function() {
    appEvents.showMessage.on(updateMessageRibbon);
  };

  x.componentWillUnmount = function() {
    appEvents.showMessage.off(updateMessageRibbon);
  };

  function getConnectionType(connectionType) {
    var hyponym = <span style={{color: 'red'}}>hyponyms</span>;
    var hypernym = <span style={{color: 'green'}}>hypernyms</span>;
    if (connectionType == 'out') {
      return [hyponym, hypernym];
    }
    return [hypernym, hyponym];
  }

  function updateMessageRibbon(_message) {
    message = _message;
    x.forceUpdate();
  }
}
