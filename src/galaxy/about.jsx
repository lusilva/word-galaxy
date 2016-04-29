import React from 'react';
import Modal from 'react-modal';
import ls from 'local-storage';
export default require('maco')(about, React);

function about(x) {
  var isOpen = ls.get('aboutShown') ? false : true;

  x.render = function() {
    //TODO: finish about section
    return (
      <div className='label about' onClick={toggleOpen}>
        <span className='reset-color'>About...</span>
        <Modal
          isOpen={isOpen}
          onRequestClose={toggleOpen}
          closeTimeoutMS={50}
          style={{zIndex: 1000, position: 'absolute'}}
        >
          <h1 style={{color: 'black'}}>Welcome to Word Galaxy!</h1>
          <div className="row">
            <div className="col-md-6 co-xs-12">
              <h3>Explanation</h3>
              <h4>What do nodes mean?</h4>
              <p>
                Nodes represent things called synsets. A synset is essentially a single concept that is represented by a
                number of terms or synonyms. Each synset has a definition associated with it. There are roughly 117,000
                synsets
                shown in this visualization, which are all the synsets stored in WordNet.
              </p>
              <h4>What does hypernym/hoponym mean?</h4>
              <p>
                Take "wheat" and "grain", for example. You can see a link going from "wheat" pointing towards "grain"
                which
                means that wheat "is a kind of" grain. Here, "wheat" is a hyponym and "grain" is a hypernym. In the case
                of
                verbs this same link can be understood better by "is one way to". So, for example, to trot "is one way
                to"
                walk.
              </p>
              <h4>How does search work?</h4>
              <p>
                When a search is made, a synset's synonyms are searched to match the query. This was done so that search
                may
                be more intuitive and by word, rather than by synset. For each result, the word is displayed, followed
                by the synsets that have that word as a synonym.
              </p>
            </div>
            <div className="col-md-6 co-xs-12">
              <h3>Goal</h3>
              <p>
                The goal of the project is to visually show the relationship between words, allowing you to naviate the
                word
                universe and explore connections. This is made possible by <a target="__blank"
                                                                              href="https://wordnet.princeton.edu/">
                Princeton's WordNet project. </a>
              </p>
              <h3>Origin</h3>
              <p>
                This project was inspired by Andrei Kashcha's <a target="__blank" href="https://github.com/anvaka/pm">pm
                project.</a> It builds on top of his project, and uses much of his code and associated
                libraries. Thank you Andrei for creating an awesome project and open sourcing it!
              </p>
              <h3>Contact</h3>
              <p>
                <h4>Issues</h4>
                Found an issue or bug? Please report it on our <a target="__blank"
                                                                  href="https://github.com/lusilva/word-galaxy">github</a>
              </p>
            </div>
            <div className="col-xs-12">
              <button type="button" className="btn btn-primary btn-lg btn-block" onClick={toggleOpen}>
                Explore The Galaxy!
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  function toggleOpen() {
    if (!ls.get('aboutShown'))
      ls.set('aboutShown', true);
    isOpen = !isOpen;
    x.forceUpdate();
  }
}
