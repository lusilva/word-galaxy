export default graphSpecificInfo;

function graphSpecificInfo(graphName) {
  return new DefaultGraph(graphName);
}

function DefaultGraph(graphName) {
  this.graphName = graphName;
  this.getInDegreeLabel = function getInDegreeLabel(inDegreeValue) {
    return inDegreeValue == 1 ? 'hyponym' : 'hyponyms';
  };

  this.getOutDegreeLabel = function getInDegreeLabel(outDegreeValue) {
    return outDegreeValue == 1 ? 'hypernym' : 'hypernyms';
  };
}
