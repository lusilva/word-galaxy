/**
 * This component shows basic navigation help. The idea is to show it only
 * first time when user opens. All subsequent page opening should not trigger
 * help screen.
 *
 * The only possible way to show help again is by triggerign "show help"
 * action, which is currently bound to mouse wheel event
 */
import React from 'react';
import appEvents from './service/appEvents.js';
import Key from './utils/key.js';
import $ from 'jquery';

export default require('maco')(help, React);

var helpWasShown = false;

function help(x) {
  var graphDownloaded = false;

  x.render = function() {
    if (window.orientation !== undefined) {
      // no need to show help on orientation enabled devices
      return null;
    }

    if (helpWasShown) {
      // no need to annoy people
      return null;
    }

    if (!graphDownloaded) {
      // Show help only after all is downloaded
      return null;
    }

    return (
        <div className='navigation-help'>
          <h3>Navigation Controls</h3>
            <table><tbody>
      <tr>
        <td colSpan="2"><code className='important-key'>mouse wheel</code></td>
        <td colSpan="2">show this help menu</td>
      </tr>
      <tr>
        <td colSpan="2"><code className='important-key'>click word</code></td>
        <td colSpan="2">focus on it</td>
      </tr>
      <tr>
        <td colSpan="2"><code className='important-key'>double click word</code></td>
        <td colSpan="2">switch to 2-d view</td>
      </tr>
      <tr className='spacer-row'>
        <td colSpan='2'><code className='important-key' >any key</code></td>
        <td colSpan='2'>hide this help menu</td>
      </tr>
      <tr>
      <td><code>W</code></td>
      <td>Move forward</td>
      <td><code>Up</code></td>
      <td>Rotate up</td>
      </tr>
      <tr>
      <td><code>S</code></td>
      <td>Move backward</td>
      <td><code>Down</code></td>
      <td>Rotate down</td>
      </tr>
      <tr>
      <td><code>A</code></td>
      <td>Move left</td>
      <td><code>Left</code></td>
      <td>Rotate left</td>
      </tr>
      <tr>
      <td><code>D</code></td>
      <td>Move right</td>
      <td><code>Right</code></td>
      <td>Rotate right</td>
      </tr>
      <tr>
      <td><code>Q</code></td>
      <td>Roll right</td>
      <td><code>R</code></td>
      <td>Fly up</td>
      </tr>
      <tr>
      <td><code>E</code></td>
      <td>Roll left</td>
      <td><code>F</code></td>
      <td>Fly down</td>
      </tr>
      <tr>
      <td><code>L</code></td>
      <td>Toggle links</td>
      <td><code>spacebar</code></td>
      <td>Toggle Steering</td>
      </tr>
      <tr>
      <td><code>shift</code></td>
      <td>Move faster</td>
      <td><code></code></td>
      <td></td>
      </tr>
      </tbody></table>
        </div>
        );
    };

  x.componentDidMount = function () {
    if (window.orientation !== undefined) return;
    appEvents.graphDownloaded.on(showHelpIfNeeded);
    appEvents.downloadGraphRequested.on(resetHelp);
    appEvents.toggleHelp.on(toggleHelp);
    appEvents.hideHelp.on(hideHelp);

    listenToKeys();
    listenToWheel();
  }

  x.componentWillUnmount = function () {
    if (window.orientation !== undefined) return;
    appEvents.graphDownloaded.off(showHelpIfNeeded);
    appEvents.downloadGraphRequested.off(resetHelp);
    appEvents.toggleHelp.off(toggleHelp);
    appEvents.hideHelp.off(hideHelp);

    releaseKeyListener();
    releaseWheel();
  };

  function showHelpIfNeeded() {
    if (helpWasShown) return;
    graphDownloaded = true;

    x.forceUpdate();
  }

  function toggleHelp() {
    helpWasShown = !helpWasShown;
    x.forceUpdate();
  }

  function hideHelp() {
    helpWasShown = true;
    x.forceUpdate();
  }

  function resetHelp() {
    graphDownloaded = false;
    x.forceUpdate();
  }

  function handlekey(e) {
    if (Key.isModifier(e)) {
      // ignore modifiers
      return;
    }
    var needsUpdate = !helpWasShown;
    helpWasShown = true;

    if (needsUpdate) {
      x.forceUpdate();
    }
  }

  function handlewheel(e) {
    // only show when used on scene
    if (e.target && e.target.nodeName === 'CANVAS') {
      if ($(e.target).parent().hasClass('mini')) return;
      helpWasShown = false;
      x.forceUpdate();
      appEvents.focusScene.fire();
    }
  }

  function listenToKeys() {
    document.body.addEventListener('keydown', handlekey);
  }

  function listenToWheel() {
    document.body.addEventListener('wheel', handlewheel, true);
  }

  function releaseKeyListener() {
    document.body.removeEventListener('keydown', handlekey, true);
  }

  function releaseWheel() {
    document.body.removeEventListener('wheel', handlewheel, true);
  }
}
