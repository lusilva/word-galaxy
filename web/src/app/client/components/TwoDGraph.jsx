import React from 'react';
import createLayout from 'ngraph.forceatlas2';
import createGraph from 'ngraph.graph';
import createFabric from 'ngraph.pixi';

export default class TwoDGraph extends React.Component {
  static propTypes = {
    largeGraph: React.PropTypes.object.isRequired,
    selectedNode: React.PropTypes.object.isRequired
  };

  componentDidMount() {


    let graph = createGraph();

    let g = {
      nodes: [],
      edges: []
    };

    // graph traversal w/ ngraph
    //var traverseLinks = links;

    let largeGraph = this.props.largeGraph;
    let selectedNode = this.props.selectedNode;

    //g.nodes.push({
    //  id: 'n' + this.props.selectedNode.id,
    //  label: 'Node' + this.props.selectedNode.id
    //});

    //console.log(traverseLinks);


    // initially add the word
    graph.addNode(selectedNode.word);

    // use selectedNode to start traversing the graph
    selectedNode.nodes.forEach(function(node) {
      console.log(node.id);
      graph.addNode(node.id);
      console.log(selectedNode.word + '---->' + node.id);
      graph.addLink(selectedNode.word, node.id);

      largeGraph.forEachLinkedNode(node.id, function(linkedNode, link) {
        graph.addNode(linkedNode.id);
        console.log(linkedNode.id);
        console.log(link.fromId + '---->' + link.toId);
        graph.addLink(link.fromId, link.toId);
      }, true);
    });

    var fabricGraphics = createFabric(graph, {
      container: document.getElementById('TwoDGraphContainer')
    });

    fabricGraphics.run();
  }

  render() {
    return (<div id="TwoDGraphContainer"></div>);
  }
}