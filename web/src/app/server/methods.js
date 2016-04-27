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

Meteor.methods({
  // calculate the layout of the graph before serving it to the client
  calculateLayout: function() {

    // if the graph hasn't been created
    // load the data set
    if (!graph) {
      HTTP.get(Meteor.absoluteUrl('/generated.json'), function(err, result) {
        // if we don't have an er
        if (!err && result.data) {
          let data = result.data;
          // call the load function w/ graph data in json,
          let graph = load(data,
            // function that returns object w/ id and info_dict[word] from python,
            function(node) {
              return {
                id: node["id"],
                data: {
                  definition: node['definition'],
                  pos: node['pos'],
                  sense_n: node['sense_n']
                }
              };
            },
            // function that links two nodes
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

    // pass the graph that was created in ngraph
    // we don't want to overwrite the previous iterations
    function graphCallback(graph, overwrite) {
      // create instance of ngraph.graph w/ chinese whispers graph clustering algorithm
      //var whisper = createWhisper(graph);
      //var requiredChangeRate = 0; // 0 is complete convergence
      ////
      //while (whisper.getChangeRate() > requiredChangeRate) {
      //  whisper.step();
      //}
      //let coarseGraph = coarsen(graph, whisper);
      //let index = 0;
      //coarseGraph.forEachNode(function(node) {
      //  node.data.forEach(function(id) {
      //    coarseGraph.addNode(id, {hidden: true, data: graph.getNode(id).data});
      //    coarseGraph.addLink(node.id, id);
      //    index++;
      //  });
      //});

      //var clusters = whisper.createClusterMap();
      //// removeLinks for removing links in the graph
      //var removedLinks = [];
      //
      //// use forEach to remove links and cluster
      //clusters.forEach(visitCluster);
      //
      //function visitCluster(clusterNodes, clusterClass) {
      //  var i;
      //  for (i = 0; i < clusterNodes.length; ++i) {
      //    let node = graph.getNode(clusterNodes[i]);
      //    graph.addNode(node.id, {cluster: clusterClass, info: node.data});
      //  }
      //
      //  for (i = 0; i < clusterNodes.length; ++i) {
      //    let node = graph.getNode(clusterNodes[i]);
      //    graph.forEachLinkedNode(node.id,
      //      function(linkedNode, link) {
      //        // if the clusters are not the same
      //        // we remove the link from the graph
      //        if (linkedNode.data.cluster != node.data.cluster) {
      //          graph.removeLink(link);
      //          removedLinks.push(link);
      //        }
      //      },
      //      true
      //    );
      //  }
      //}
      //
      //let removedThisIteration;
      //while (!removedThisIteration || removedThisIteration.length > 0) {
      //  removedThisIteration = [];
      //  graph.forEachLink(function(link) {
      //    if (!link) return;
      //    let from = graph.getNode(link.fromId);
      //    let to = graph.getNode(link.toId);
      //    if (from.data.cluster !== to.data.cluster) {
      //      graph.removeLink(link);
      //      removedThisIteration.push(link);
      //    }
      //  });
      //  for (var i = 0; i < removedThisIteration.length; ++i) {
      //    removedLinks.push(removedThisIteration[i]);
      //  }
      //}
      //// print each connection in the graph w/o being in the same cluster
      //graph.forEachLink(function(link) {
      //  let from = graph.getNode(link.fromId);
      //  let to = graph.getNode(link.toId);
      //  if (from.data.cluster !== to.data.cluster) {
      //    console.log({from: from.data.cluster, to: to.data.cluster});
      //  }
      //});
      //
      //console.log(removedLinks.length);

      //var path = kruskal(graph);
      //let tree = createGraph();
      //graph.forEachNode(function(node) {
      //  tree.addNode(node.id, node.data);
      //});
      //for (var i = 0; i < path.length; ++i) {
      //  let edge = path[i];
      //  tree.addLink(edge.fromId, edge.toId);
      //}

      let layout = createLayout(graph, {
        iterations: 150,
        saveEach: 25
      });
      layout.run(true);
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

// jsonGraph is the file created in python
// nodeTransform is a function that operates
// linkTransform
function load(jsonGraph, nodeTransform, linkTransform) {
  // stored used to store jsonGraph
  var stored;
  nodeTransform = nodeTransform || id;
  linkTransform = linkTransform || id;
  // either parse the json string to a json object
  if (typeof jsonGraph === 'string') {
    stored = JSON.parse(jsonGraph);
  } else {
    stored = jsonGraph;
  }

  // create an empty ngraph.graph
  var graph = createGraph(), i;

  if (stored.links === undefined || stored.nodes === undefined) {
    throw new Error('Cannot load graph without links and nodes');
  }


  for (i = 0; i < stored.nodes.length; ++i) {
    // apply nodeTranform to each node
    // ex: set to {id: node["id"], data: node['data']};
    var parsedNode = nodeTransform(stored.nodes[i]);
    if (!parsedNode.hasOwnProperty('id')) {
      throw new Error('Graph node format is invalid: Node id is missing');
    }
    // add the node w/ id and parsedNode
    graph.addNode(parsedNode.id, parsedNode.data);
  }

  for (i = 0; i < stored.links.length; ++i) {
    // apply linkTransform to each link
    // ex: return fromId, toId for the two nodes
    var link = linkTransform(stored.links[i]);
    if (!link.hasOwnProperty('fromId') || !link.hasOwnProperty('toId')) {
      throw new Error('Graph link format is invalid. Both fromId and toId are required');
    }

    graph.addLink(link.fromId, link.toId, link.data);
  }

  return graph;
}
