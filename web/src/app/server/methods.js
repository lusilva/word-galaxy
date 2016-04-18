import { Meteor } from 'meteor/meteor';
import createLayout from './forceAtlas/layout';
import forceLayout3D from 'ngraph.forcelayout3d';
import createGraph from 'ngraph.graph';

Meteor.methods({
  calculateLayout: function() {

    HTTP.get(Meteor.absoluteUrl('/generated-all-synsets.json'), function(err, result) {
      if (!err && result.data) {

        let data = result.data;

        let graph = load(data,
          function(node) {
            return {id: node["id"]};
          },
          function(link) {
            return {
              fromId: data.nodes[link.source].id,
              toId: data.nodes[link.target].id
            };
          });

        let layout = createLayout(graph, {
          iterations: 200,
          saveEach: 25,
          layout: forceLayout3D.bind(this, graph, {
            gravity: -1.2
          })
        });
        layout.run(true);
      }
    });
  }
});


function load(jsonGraph, nodeTransform, linkTransform) {
  var stored;
  nodeTransform = nodeTransform || id;
  linkTransform = linkTransform || id;
  if (typeof jsonGraph === 'string') {
    stored = JSON.parse(jsonGraph);
  } else {
    stored = jsonGraph;
  }

  var graph = createGraph(),
    i;

  if (stored.links === undefined || stored.nodes === undefined) {
    throw new Error('Cannot load graph without links and nodes');
  }

  for (i = 0; i < stored.nodes.length; ++i) {
    var parsedNode = nodeTransform(stored.nodes[i]);
    if (!parsedNode.hasOwnProperty('id')) {
      throw new Error('Graph node format is invalid: Node id is missing');
    }

    graph.addNode(parsedNode.id, parsedNode.data);
  }

  for (i = 0; i < stored.links.length; ++i) {
    var link = linkTransform(stored.links[i]);
    if (!link.hasOwnProperty('fromId') || !link.hasOwnProperty('toId')) {
      throw new Error('Graph link format is invalid. Both fromId and toId are required');
    }

    graph.addLink(link.fromId, link.toId, link.data);
  }

  return graph;
}