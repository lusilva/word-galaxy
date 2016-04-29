import appEvents from '../service/appEvents.js';
import scene from '../store/scene.js'
import clientRuntime from '../runtime/clientRuntime.js';

import SearchResultWindowViewModel from './SearchResultWindowViewModel.js';

export default searchBoxModel();

const searchResultsWindowId = 'search-results';

function searchBoxModel() {
  let api = {
    search: search,
    submit: submit
  };

  return api;

  function search(newText) {
    appEvents.hideNodeListWindow.fire(searchResultsWindowId);
    if (newText && newText[0] === ':') return; // processed in submit
    if (!newText || newText.length == 0) return;

    var searchResults = scene.find(newText);
    var searchResultWindowViewModel = new SearchResultWindowViewModel(searchResults);
    appEvents.showNodeListWindow.fire(searchResultWindowViewModel, searchResultsWindowId);
  }

  function submit(command) {
    if (!command || command[0] !== ':') return; // We can handle only commands here

    // Yes, this is not secure, I know
    command = 'with (ctx) { ' + command.substr(1) + ' }';
    var dynamicFunction = new Function('ctx', command);
    dynamicFunction(clientRuntime);
  }
}
