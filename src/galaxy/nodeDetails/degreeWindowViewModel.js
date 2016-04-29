import scene from '../store/scene.js';
import formatNumber from '../utils/formatNumber.js';

export default DegreeWindowViewModel;

function DegreeWindowViewModel(name, list, connectionType, id) {
  this.id = id;
  this.className = 'degree-results-window';
  this.list = list;
  this.nodeName = name;
  this.degreeNumber = formatNumber(list.length);
  this.connectionType = connectionType;
  this.degreeKindName = getDegreeName(connectionType, list.length);
}

DegreeWindowViewModel.prototype.__name = 'DegreeWindowViewModel';

// TODO: This is a dupe.
function getDegreeName(connectionType, count) {
  return connectionType === 'in' ?
    (count == 1 ? 'hypernym' : 'hypernyms') :
    (count == 1 ? 'hyponym' : 'hyponyms');
}
