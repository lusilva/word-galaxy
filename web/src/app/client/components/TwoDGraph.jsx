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
      graph.addNode(node.id);
      graph.addLink(selectedNode.word, node.id);

      //largeGraph.forEachLinkedNode(node.id, function(linkedNode, link) {
      //  graph.addNode(linkedNode.id);
      //  graph.addLink(selectedNode.word, linkedNode.id);
      //});
    });

    var fabricGraphics = createFabric(graph, {
      container: document.getElementById('graph-container')
    });

    fabricGraphics.run();
  }

  render() {
    return null;
  }
}