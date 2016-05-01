import appEvents from '../service/appEvents';
import d3 from "d3";
import scene from '../store/scene.js';
import eventify from 'ngraph.events';

export default renderer;

// dom object = container
function renderer(container){
  var force, root, link, node, svg;

  // upon showing the 2D graph call the render function
  appEvents.show2DGraph.on(render);

  var api = {
    destroy: destroy
  }

  eventify(api);

  return api;

  function render(selectedNodeId){
    console.log('render');
    var width = window.innerWidth,
    height = window.innerHeight;

    force = d3.layout.force()
    .linkDistance(150)
    .charge(-120)
    .gravity(.05)
    .size([width, height])
    .on("tick", tick);

    //
    svg = d3.select(container).append("svg")
    .attr("id", "twoDGraphSVG")
    .attr("width", width)
    .attr("height", height);

    link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

    var rootInfo = scene.getNodeInfo(selectedNodeId);

    root = {
      name: rootInfo.name
    }

    // root structure
    expandFromNode(selectedNodeId);

    update();
  }

  function addChildrenToNode(nodeName, childrenToAdd, root) {
    if (root.name == nodeName) {
      root.children = childrenToAdd;
    }
    if (!root.children)
      return;
    for (var i = 0; i < root.children.length; ++i) {
      addChildrenToNode(nodeName,
        childrenToAdd, root.children[i])
    }
  }

  function expandFromNode(selectedNodeId){
    var node = scene.getNodeInfo(selectedNodeId);
    var nodeChildren = scene.getConnected(selectedNodeId, 'out')
    addChildrenToNode(node.name, nodeChildren, root);
  }

  function update() {
    var nodes = flatten(root),
    links = d3.layout.tree().links(nodes);

    // Restart the force layout.
    force
    .nodes(nodes)
    .links(links)
    .start();

    // Update links.
    link = link.data(links, function(d) { return d.target.id; });

    link.exit().remove();

    link.enter().insert("line", ".node")
    .attr("class", "link");

    // Update nodes.
    node = node.data(nodes, function(d) { return d.id; });

    node.exit().remove();

    var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .on("click", click)
    .call(force.drag);

    nodeEnter.append("circle")
    .attr("r", function(d) { return 30; });

    nodeEnter.append("text")
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });

    node.select("circle")
    .style("fill", "black")
    // .style("fill", "hidden");
  }

  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  }

  function color(d) {
    return d._children ? "#3182bd" // collapsed package
    : d.children ? "#c6dbef" // expanded package
    : "#fd8d3c"; // leaf node
  }

  // Toggle children on click.
  function click(d) {
    if (d3.event.defaultPrevented) return; // ignore drag
    if (d.name == root.name) return;
    if (d.children) {
      d.children = null;
    } else {
      var nodeChildren = scene.getConnected(d.id, 'out');
      d.children = nodeChildren;
    }
    update();
  }

  // Returns a list of all nodes under the root.
  function flatten(root) {
    var nodes = [], i = 0;

    function recurse(node) {
      if (node.children) node.children.forEach(recurse);
      if (!node.id) node.id = ++i;
      nodes.push(node);
    }

    recurse(root);
    return nodes;
  }

  function destroy(){
    console.log('destroyed');
    root = {};
    node.remove();
    link.remove();
    // svg.clear();
    d3.select("#twoDGraphSVG").remove();
    force = null;
  }
}
