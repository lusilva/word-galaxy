$(document).ready(function() {
  var graph = new sigma({
    container: 'sigma-graph'
  });

  sigma.parsers.json(
    'google-10000-data.json',
    graph,
    function() {
      //graph.addRenderer({
      //  container: document.getElementById('sigma-canvas'),
      //  type: 'webgl',
      //  camera: cam,
      //  settings: {
      //    edgeColor: 'default'
      //  }
      //});
      console.log('done!')
    }
  );
});



