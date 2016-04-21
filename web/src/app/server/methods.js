import { Meteor } from 'meteor/meteor';
import createLayout from './forceAtlas/layout';
import WordNet from './wordnet/wordnet';
import forceLayout3D from 'ngraph.forcelayout3d';
import createGraph from 'ngraph.graph';
import createWhisper from 'ngraph.cw';
import coarsen from 'ngraph.coarsen';
import kruskal from 'ngraph.kruskal';
import centrality from 'ngraph.centrality';

const wordnet = new WordNet(process.cwd() + '/../web.browser/app/dict');

let graph = null;
let iterations = 100;

Meteor.methods({
  calculateLayout: function() {

    iterations += 100;

    if (!graph) {
      HTTP.get(Meteor.absoluteUrl('/generated-all-synsets.json'), function(err, result) {
        if (!err && result.data) {

          let data = result.data;

          let graph = load(data,
            function(node) {
              return {id: node["id"], data: node['data']};
            },
            function(link) {
              return {
                fromId: data.nodes[link.source].id,
                toId: data.nodes[link.target].id
              };
            });

          graphCallback(graph, true);
        }
      });
    } else {
      graphCallback(graph, false);
    }


    function graphCallback(graph, overwrite) {
      var whisper = createWhisper(graph);
      var requiredChangeRate = 0; // 0 is complete convergence
      while (whisper.getChangeRate() > requiredChangeRate) {
        whisper.step();
      }
      //let coarseGraph = coarsen(graph, whisper);
      //let index = 0;
      //coarseGraph.forEachNode(function(node) {
      //  node.data.forEach(function(id) {
      //    coarseGraph.addNode(id, {hidden: true, data: graph.getNode(id).data});
      //    coarseGraph.addLink(node.id, id);
      //    index++;
      //  });
      //});

      var clusters = whisper.createClusterMap();
      var removedLinks = [];

      clusters.forEach(visitCluster);


      function visitCluster(clusterNodes, clusterClass) {
        var i;
        for (i = 0; i < clusterNodes.length; ++i) {
          let node = graph.getNode(clusterNodes[i]);
          graph.addNode(node.id, {cluster: clusterClass, info: node.data});
        }

        for (i = 0; i < clusterNodes.length; ++i) {
          let node = graph.getNode(clusterNodes[i]);
          graph.forEachLinkedNode(node.id,
            function(linkedNode, link) {
              if (linkedNode.data.cluster != node.data.cluster) {
                graph.removeLink(link);
                removedLinks.push(link);
              }
            },
            true
          );
        }
      }

      let removedThisIteration;
      while (!removedThisIteration || removedThisIteration.length > 0) {
        removedThisIteration = [];
        graph.forEachLink(function(link) {
          if (!link) return;
          let from = graph.getNode(link.fromId);
          let to = graph.getNode(link.toId);
          if (from.data.cluster !== to.data.cluster) {
            graph.removeLink(link);
            removedThisIteration.push(link);
          }
        });
        for (var i = 0; i < removedThisIteration.length; ++i) {
          removedLinks.push(removedThisIteration[i]);
        }
      }

      graph.forEachLink(function(link) {
        let from = graph.getNode(link.fromId);
        let to = graph.getNode(link.toId);
        if (from.data.cluster !== to.data.cluster) {
          console.log({from: from.data.cluster, to: to.data.cluster});
        }
      });


      console.log(removedLinks.length);

      // var path = kruskal(coarseGraph);
      //let tree = createGraph();
      //coarseGraph.forEachNode(function(node) {
      //  tree.addNode(node.id, node.data);
      //});
      //for (var i = 0; i < path.length; ++i) {
      //  let edge = path[i];
      //  tree.addLink(edge.fromId, edge.toId);
      //}

      let layout = createLayout(graph, {
        iterations: iterations,
        saveEach: 25,
        physicsSettings: {
          springLength: 100,
          springCoeff: 0.0008,
          gravity: -500,
          theta: 0.8,
          dragCoeff: 0.0000000001
        }
      });
      layout.run(overwrite);
    }
  },
  findSynsets: function(word) {
    var response = Async.runSync(function(done) {
      wordnet.lookup(word, function(results) {
        // if there are no results
        if (results.length === 0) {
          // render message saying no words were found for 'word'
          done(null, null);
        }
        // console.log(JSON.stringify(results, null, '\t'));
        let synsets = [];
        for (var i = 0; i < results.length; i++) {
          var synset = results[i];
          // console.log(synset.lemma, synset.pos);
          synsets.push({
            name: synset.lemma,
            definition: synset.def,
            synonyms: synset.synonyms,
            pos: synset.pos
          });
        }
        done(null, synsets);
      });

    });
    return response.result;
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
