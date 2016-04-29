/**
 * Wrapper on top of graph data. Not sure where it will go yet.
 */
import linkFinder from './edgeFinder.js';
import renderer from '../native/renderer';
import Map from 'collections/map';
export default graph;

function graph(rawGraphLoaderData) {
  var {labels, outLinks, inLinks, positions} = rawGraphLoaderData;

  var lemmasMap = new Map();
  labels = labels.map(function(label, index) {
    label.id = label.id.replace(/_/g, " ");
    label.data.lemmas = label.data.lemmas.map(function(lemma) {
      lemma = lemma.replace(/_/g, " ");
      if (lemmasMap.has(lemma)) {
        lemmasMap.set(lemma, lemmasMap.get(lemma).concat([index]));
      } else {
        lemmasMap.set(lemma, [index]);
      }
      return lemma;
    });
    return label;
  });
  var lemmas = lemmasMap.keys();

  var empty = [];

  var api = {
    getNodeInfo: getNodeInfo,
    getConnected: getConnected,
    find: find,
    findLinks: findLinks
  };

  return api;

  function findLinks(from, to) {
    return linkFinder(from, to, outLinks, inLinks, labels);
  }

  function find(query) {
    var result = [];
    if (!labels) return result;

    if (typeof query === 'string') {
      // short circuit if it's blank string - no results
      if (!query) return result;
      query = regexMatcher(query);
    }

    for (var i = 0; i < lemmas.length; ++i) {
      if (query(i, lemmas)) {
        var indices = lemmasMap.values()[i];
        var nodes = [];
        for (var index = 0; index < indices.length; index++) {
          nodes.push(getNodeInfo(indices[index]));
        }
        result.push({lemma: lemmas[i], nodes});
      }
    }
    return result;
  }

  function regexMatcher(str) {
    var regex = compileRegex(str);
    if (!regex) return false;

    return function(i, labels) {
      var label = labels[i];
      if (str.length <= 3) {
        return str === label;
      }
      if (label.length >= str.length) {
        return (label.startsWith(str) || label.endsWith(str));
      }
      return false;
    }
  }

  function compileRegex(pattern) {
    try {
      return new RegExp(pattern, 'ig');
    } catch (e) {
      // this cannot be compiled. Ignore it.
    }
  }

  function getConnected(startId, connectionType) {
    if (connectionType === 'out') {
      return outLinks[startId] || empty;
    } else if (connectionType === 'in') {
      return inLinks[startId] || empty;
    }
    return empty;
  }

  function getNodeInfo(id) {
    if (!labels) return;

    var outLinksCount = 0;
    if (outLinks[id]) {
      outLinksCount = outLinks[id].length;
    }

    var inLinksCount = 0;
    if (inLinks[id]) {
      inLinksCount = inLinks[id].length;
    }

    return {
      id: id,
      definition: labels[id].data.definition,
      lemmas: labels[id].data.lemmas,
      pos: labels[id].data.pos,
      name: labels[id].id,
      out: outLinksCount,
      in: inLinksCount
    };
  }

  function getName(id) {
    if (!labels) return '';
    if (id < 0 || id > labels.length) {
      throw new Error(id + " is outside of labels range");
    }
    return labels[id].id;
  }

  function getPositions() {
    return positions;
  }

  function getLinks() {
    return links;
  }
}
