import React from 'react';
import createGraph from 'ngraph.graph';
import renderGraph from 'ngraph.pixel';
import staticLayout from 'pixel.static';
import createLayout from 'ngraph.forcelayout3d';
import request from '../helpers/request';


const LOADING_MESSAGES = {
  LABELS: 'Loading Labels...',
  POSITIONS: 'Loading Positions...',
  LINKS: 'Loading Edges...'
};

export default class MainGraph extends React.Component {
  state = {
    message: LOADING_MESSAGES.LABELS,
    labels: [],
    selectedNode: null
  };

  renderer = null;

  componentDidMount() {
    this._loadLabels();
  };

  _loadPositions() {
    return request('data/positions.bin', {
      responseType: 'arraybuffer'
    }).then(this._setPositions.bind(this));
  }

  _loadLabels() {
    return request('data/labels.json', {
      responseType: 'json'
    }).then(this._setLabels.bind(this));
  };

  _loadLinks(graph) {
    return request('data/links.bin', {
      responseType: 'arraybuffer'
    }).then(this._setLinks.bind(this, graph));
  };

  _setLabels(data) {
    this.setState({labels: data});

    this.setState({message: LOADING_MESSAGES.POSITIONS});
    this._loadPositions();
  };

  _setLinks(graph, buffer) {
    var links = new Int32Array(buffer);
    var lastArray = [];
    var outLinks = [];
    var inLinks = [];
    outLinks[0] = lastArray;
    var i, j, srcIndex;

    for (i = 0; i < links.length; ++i) {
      let link = links[i];

      if (link < 0) {
        srcIndex = -link - 1;
        lastArray = outLinks[srcIndex] = [];
      } else {
        var toNode = link - 1;
        lastArray.push(toNode);
        if (inLinks[toNode] === undefined) {
          inLinks[toNode] = [srcIndex];
        } else {
          inLinks[toNode].push(srcIndex);
        }
      }
    }

    for (i = 0; i < inLinks.length; ++i) {
      if (!Boolean(inLinks[i]))
        continue;
      for (j = 0; j < inLinks[i].length; ++j) {
        graph.addLink(this.state.labels[inLinks[i][j]], this.state.labels[i], {hidden: true});
      }
    }

    this.setState({message: null});
    this._renderGraph(graph);
  };

  _setPositions(buffer) {
    let positions = new Int32Array(buffer);
    let graph = createGraph();
    let node = 0;
    let scaleFactor = 2;

    for (var i = 0; i < positions.length; i += 3) {
      let x = positions[i] * scaleFactor;
      let y = positions[i + 1] * scaleFactor;
      let z = positions[i + 2] * scaleFactor;

      graph.addNode(this.state.labels[node], {x, y, z});
      node += 1;
    }

    this.setState({message: LOADING_MESSAGES.LINKS});
    this._loadLinks(graph);
  };

  _getNodePosition(node) {
    // node is a regular ngraph.graph node
    // we can have access to its `data` or `id`, so if position is known:
    return {
      x: node.data.x,
      y: node.data.y,
      z: node.data.z
    };
  };

  _enlargeGraph(graph) {
    this.setState({selectedNode: null});
    $('.main-graph-container').removeClass('mini');
    $('.mini-click-handler').off('click', false);
    this.renderer.focus();
  };

  _renderGraph(graph) {
    this.renderer = renderGraph(graph, {
      container: document.getElementById("main-graph"),
      createLayout: staticLayout,
      initPosition: this._getNodePosition.bind(this),
      autoFit: false,
      link: function createLinkUI(link) {
        if (link.data && link.data.hidden)
          return {
            fromColor: 0x000000,
            toColor: 0x000000
          }; // don't need to render!
        // otherwise return default link:
        return {
          fromColor: 0xFF00FF,
          toColor: 0x00FFFF
        };
      }
    });

    let shownLinks = [];

    this.renderer.on('nodehover', function(node) {
      if (node) {
        graph.forEachLinkedNode(node.id, function(linkedNode, link) {
          shownLinks.push(link);
          let ui = this.renderer.getLink(link.id);
          ui.fromColor = 0xFF00FF;
          ui.toColor = 0x00FFFF;
        }.bind(this));
      } else {
        while (shownLinks.length > 0) {
          let link = shownLinks.pop();
          let ui = this.renderer.getLink(link.id);
          ui.fromColor = 0x000000;
          ui.toColor = 0x000000;
        }
      }
    }.bind(this));

    this.renderer.on('nodedblclick', function(node) {
      $('.main-graph-container').addClass('mini');
      $('.mini-click-handler').on('click', this._enlargeGraph.bind(this, graph));
      this.setState({selectedNode: node});
      Meteor.setTimeout(function() {
        this.renderer.showNode(node.id);
      }.bind(this), 1000);
    }.bind(this));
  };


  render() {
    return (
      <div className="main-graph-container">
        <form className="search-container">
          <input id="search-box" type="text" className="search-box" name="q"/>
          <label><span className="glyphicon glyphicon-search search-icon"/></label>
          <input type="submit" id="search-submit"/>
        </form>
        {this.state ? this.state.message : null}
        {this.state.selectedNode ? 'Render 2D Graph for ' + this.state.selectedNode.id : null}
        <div id="main-graph"></div>
        <div className="mini-click-handler"></div>
      </div>
    )
  }
};
