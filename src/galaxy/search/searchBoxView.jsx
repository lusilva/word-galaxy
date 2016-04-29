import React from 'react';
import ReactDOM from 'react-dom';
import searchBoxModel from './searchBoxModel.js';
import appEvents from '../service/appEvents.js';

module.exports = require('maco')(searchBar, React);

function searchBar(x) {
  var shouldShow = false;

  x.render = function() {
    if (!shouldShow) return null;

    return (
      <div className='container row'>
        <div className='search col-xs-12 col-sm-6 col-md-4'>
          <form className='search-form' role='search' onSubmit={runSubmit}>
            <div className='input-group'>
              <input type='search'
                     ref='searchText'
                     onChange={debounce(runSearch, 250)}
                     className='form-control no-shadow' placeholder='Search...'/>
            </div>
          </form>
        </div>
      </div>
    );
  };

  x.componentDidMount = function() {
    appEvents.graphDownloaded.on(show);
  };

  x.componentWillUnmount = function() {
    appEvents.graphDownloaded.off(show);
  };

  function show() {
    shouldShow = true;
    x.forceUpdate();
  }

  function runSearch(e) {
    var searchText = ReactDOM.findDOMNode(x.refs.searchText).value;
    searchBoxModel.search(searchText);
  }

  function runSubmit(e) {
    e.preventDefault();
    runSearch(e);
  }

  function debounce(fn, delay) {
    var timer = null;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  }
}
