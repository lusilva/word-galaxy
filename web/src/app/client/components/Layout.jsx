import React from 'react';
import MainGraph from './MainGraph';

// define and export our Layout component
export default class extends React.Component {

  componentWillMount() {
    require('app/client/css/main.import.css');
  }

  render() {
    return (
      <div>
        <MainGraph/>
      </div>
    )
  }
}

