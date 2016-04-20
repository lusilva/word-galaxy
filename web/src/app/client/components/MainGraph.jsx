import React from 'react';
import createGraph from 'ngraph.graph';
import renderGraph from 'ngraph.pixel';
import staticLayout from 'pixel.static';
import request from '../helpers/request';

export default class MainGraph extends React.Component {
  state = {
    selectedNode: null
  };

  labels = [];
  graph = null;
  renderer = null;
  shownNodes = [];
  shownLinks = [];
  wordClusterMap = {};

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

  _loadLinks() {
    return request('data/links.bin', {
      responseType: 'arraybuffer'
    }).then(this._setLinks.bind(this));
  };

  _setLabels(data) {
    this.labels = data;
    this._loadPositions();
  };

  _setLinks(buffer) {
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

    this.graph.beginUpdate();
    for (i = 0; i < inLinks.length; ++i) {
      if (!Boolean(inLinks[i]))
        continue;
      for (j = 0; j < inLinks[i].length; ++j) {

        let fromId = this.labels[inLinks[i][j]].id;
        let toId = this.labels[i].id;

        this.graph.addLink(fromId, toId);
      }
    }
    this.graph.endUpdate();

    this._renderGraph();
  };

  _setPositions(buffer) {
    let positions = new Int32Array(buffer);
    this.graph = createGraph();
    let node = 0;
    let scaleFactor = 5;

    for (var i = 0; i < positions.length; i += 3) {
      let x = positions[i] * scaleFactor;
      let y = positions[i + 1] * scaleFactor;
      let z = positions[i + 2] * scaleFactor;

      let label = this.labels[node];
      if (label.data.hidden) {
        this.graph.addNode(label.id, {x, y, z, data: label.data, hidden: true});
      } else {
        let words = this.labels[node].data;
        let id = words[0] + ' (' + words.length + ' clustered)';
        this.labels[node].id = id;
        for (var j = 0; j < words.length; ++j) {
          this.wordClusterMap[words[j]] = id;
        }
        this.graph.addNode(id, {x, y, z, data: this.labels[node].data, hidden: false});
      }
      node += 1;
    }

    this._loadLinks();
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

  _enlargeGraph(showNodeId) {
    $('.main-graph-container').removeClass('mini');
    $('.mini-click-handler').off('click', false);
    this.renderer.focus();

    if (showNodeId && this.renderer.getNode(showNodeId)) {
      this._selectNode(this.renderer.getNode(showNodeId));
      this.renderer.showNode(showNodeId);
    }

    Meteor.setTimeout(function() {
      window.dispatchEvent(new Event('resize'));
    }, 1000);
  };

  _minifyGraph(showNodeId) {
    $('.main-graph-container').addClass('mini');
    $('.mini-click-handler').on('click', this._enlargeGraph.bind(this));

    if (!$(document.activeElement).is($(document.body)))
      document.activeElement.blur();

    if (showNodeId && this.renderer.getNode(showNodeId)) {
      this._selectNode(this.renderer.getNode(showNodeId));
      this.renderer.showNode(showNodeId);
    }

    Meteor.setTimeout(function() {
      window.dispatchEvent(new Event('resize'));
    }.bind(this), 1000);
  };

  _selectNode(node) {
    let ui = this.renderer.getNode(node.id);
    this.shownNodes.push({id: node.id, size: ui.size, color: ui.color});
    ui.size = 100;
    ui.color = 0xFF0000;
    this.graph.forEachLinkedNode(node.id, function(linkedNode, link) {
      let nodeUI = this.renderer.getNode(linkedNode.id);
      if (nodeUI) {
        this.shownNodes.push({id: linkedNode.id, size: nodeUI.size, color: nodeUI.color});
        nodeUI.size = 100;
        nodeUI.color = 0xFF0000;
      }

      let linkUI = this.renderer.getLink(link.id);
      if (linkUI) {
        this.shownLinks.push({id: link.id, fromColor: linkUI.fromColor, toColor: linkUI.toColor});
        linkUI.fromColor = 0xFF0000;
        linkUI.toColor = 0xFF0000;
      }
    }.bind(this));
  };

  _clearSelected() {
    while (this.shownNodes.length > 0) {
      let undoNode = this.shownNodes.pop();
      let ui = this.renderer.getNode(undoNode.id);
      if (ui) {
        ui.size = undoNode.size;
        ui.color = undoNode.color;
      }
    }
    while (this.shownLinks.length > 0) {
      let undoLink = this.shownLinks.pop();
      let ui = this.renderer.getLink(undoLink.id);
      if (ui) {
        ui.fromColor = undoLink.fromColor;
        ui.toColor = undoLink.toColor;
      }
    }
  };

  _renderGraph() {
    this.renderer = renderGraph(this.graph, {
      container: document.getElementById("main-graph"),
      createLayout: staticLayout,
      initPosition: this._getNodePosition.bind(this),
      autoFit: false,
      link: function createLinkUI(link) {
        return {
          fromColor: 0x808080,
          toColor: 0x808080
        }
      },
      node: function createNodeUI(node) {
        if (node.data && node.data.hidden)
          return;

        return {
          color: 0xFF99C2,
          size: 20
        }
      }
    });

    this.renderer.on('nodehover', function(node) {
      if (node) {
        this._selectNode(node);
      } else {
        this._clearSelected();
      }
    }.bind(this));

    this.renderer.on('nodedblclick', function(node) {
      this._showCluster(node);
    }.bind(this));
  };


  _showCluster(node) {
    this._minifyGraph(node.id);
  };

  _handleSearchSubmit(e) {
    e.preventDefault();
    let value = $(this.refs.searchBox).val().trim();
    if (value && value.length > 0) {
      this._handleShowResults(value);
    }
  };

  _handleShowResults(word) {
    Meteor.call('findSynsets', word, function(err, synsets) {
      if (!synsets || synsets.length == 0)
        return;

      synsets = synsets.map(function(synset) {
        synset.name = synset.name.replace('_', ' ');
        return synset;
      });

      let clusterId = this.wordClusterMap[synsets[0].name];

      let nodes = [];
      let hasNodes = {};
      for (var i = 0; i < synsets.length; ++i) {
        let synset = synsets[i];
        let node = this.graph.getNode(synset.name);
        if (!node)
          continue;
        if (!hasNodes.hasOwnProperty(node.id)) {
          hasNodes[node.id] = true;
          nodes.push(node);
        }
      }

      this.setState({
        selectedNode: {
          nodes,
          centralNode: synsets
        }
      });

      while (this.shownNodes.length > 0) {
        let ui = this.renderer.getNode(this.shownNodes.pop().id);
        ui.size = 20;
      }
      this._minifyGraph(clusterId);

    }.bind(this));
  };


  render() {
    return (
      <div className="main-graph-container">
        <form className="search-container" onSubmit={this._handleSearchSubmit.bind(this)}>
          <input id="search-box" type="text" className="search-box" name="q" ref="searchBox"/>
          <label><span className="glyphicon glyphicon-search search-icon"/></label>
          <input type="submit" id="search-submit"/>
        </form>
        {this.state.selectedNode ? 'Render 2D Graph for ' + this.state.selectedNode.id : null}
        <div id="main-graph"></div>
        <div className="mini-click-handler"></div>
        <div className="slider">Hello</div>
      </div>
    )
  }
};
