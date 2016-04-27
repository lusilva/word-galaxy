export default graphSpecificInfo;

function graphSpecificInfo(graphName) {
  return new DefaultGraph(graphName);
}

function DefaultGraph(graphName) {
  this.graphName = graphName;
  this.getInDegreeLabel = function getInDegreeLabel(inDegreeValue) {
    return 'in-degree';
  };

  this.getOutDegreeLabel = function getInDegreeLabel(outDegreeValue) {
    return 'out-degree';
  };
}
