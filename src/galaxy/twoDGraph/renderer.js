import appEvents from '../service/appEvents';
import d3 from "d3";
import scene from '../store/scene.js';
import eventify from 'ngraph.events';
import NODE_COLORS from '../native/nodeColors.js';

export default renderer;

// dom object = container
function renderer(container) {
  var force, root, link, node, svg;
  var connectionType = 'out';

  // upon showing the 2D graph call the render function
  appEvents.show2DGraph.on(render);
  appEvents.focusOnNode.on(onFocus);
  appEvents.showDegree.on(updateConnections);


  var api = {
    destroy: destroy
  };

  eventify(api);

  return api;


  function onFocus(selectedNodeId) {
    if (force)
      render(selectedNodeId);
  }

  function updateConnections(nodeId, _connectionType) {
    connectionType = _connectionType;
    if (force) {
      root.children = undefined;
      expandFromNode(nodeId);
      updateMessage(nodeId);
      update();
    }
  }

  function updateMessage(nodeId) {
    var rootInfo = scene.getNodeInfo(nodeId);
    appEvents.showMessage.fire({
      type: connectionType,
      root: rootInfo
    });
  }

  function resize() {
    var width = window.innerWidth,
      height = window.innerHeight;
    force.size([width, height]);
  }

  function render(selectedNodeId) {
    var width = window.innerWidth,
      height = window.innerHeight;

    if (force)
      destroy();

    d3.select(window).on('resize', resize);

    force = d3.layout.force()
      .linkDistance(150)
      .charge(-500)
      .size([width, height])
      .on("tick", tick);

    svg = d3.select(container).append("svg")
      .attr("id", "twoDGraphSVG")
      .attr("width", width)
      .attr("height", height);

    link = svg.selectAll(".link");
    node = svg.selectAll(".node");

    var rootInfo = scene.getNodeInfo(selectedNodeId);

    root = {
      name: rootInfo.name,
      id: rootInfo.id
    };

    updateMessage(selectedNodeId);

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

  function expandFromNode(selectedNodeId) {
    var node = scene.getNodeInfo(selectedNodeId);
    var nodeChildren = scene.getConnected(selectedNodeId, connectionType);
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
    link = link.data(links, function(d) {
      return d.target.id;
    });

    link.exit().remove();

    link.enter().insert("line", ".node")
      .attr("class", "link " + (connectionType || ''));

    // Update nodes.
    node = node.data(nodes, function(d) {
      return d.id;
    });

    node.exit().remove();

    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .on("click", click)
      .on("mouseover", hover)
      .on("mouseout", hideHover)
      .call(force.drag);

    nodeEnter.append("circle")
      .attr("r", function(d) {
        return 25;
      });

    nodeEnter.append("text")
      .attr("dy", ".35em")
      .text(function(d) {
        return d.name;
      });

    node.select("circle")
      .style("fill", color);
  }

  function tick() {
    link.attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });

    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  function color(d) {
    if (d.name === root.name) return '#984ea3';
    var nodeInfo = scene.getNodeInfo(d.id);
    return NODE_COLORS.getStringColor(nodeInfo.pos);
  }

  // Toggle children on click.
  function click(d) {
    if (d3.event.defaultPrevented) return; // ignore drag
    if (d.name == root.name) {
      connectionType = connectionType == 'out' ? 'in' : 'out';
    }
    hideHover();
    appEvents.focusOnNode.fire(d.id);
  }

  function hover(d) {
    appEvents.nodeHover.fire({
      nodeIndex: d.id,
      mouseInfo: {x: d.x, y: d.y}
    });
  }

  function hideHover() {
    appEvents.nodeHover.fire({
      nodeIndex: undefined,
      mouseInfo: undefined
    })
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

  function destroy() {
    appEvents.showMessage.fire(null);
    d3.select(window).on('resize', null);
    hideHover();
    root = {};
    node.remove();
    link.remove();
    // svg.clear();
    d3.select("#twoDGraphSVG").remove();
    force = null;
  }
}
