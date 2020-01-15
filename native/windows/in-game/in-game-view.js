define(["../SampleAppView.js"], function(SampleAppView) {
  class InGameView extends SampleAppView {
    constructor() {
      super();
      console.log('INGAME VIEW LOADED');
      // this._hotkey = document.getElementById("hotkey");

      this.logEvent = this.logEvent.bind(this);
      this.logInfoUpdate = this.logInfoUpdate.bind(this);
      // this.updateHotkey = this.updateHotkey.bind(this);
      var button = document.getElementById('cn-button'),
          wrapper = document.getElementById('cn-wrapper');

      //open and close menu when the button is clicked
      var open = false;

      var deleteLink = document.querySelectorAll('.cn-wrapper li');

      for (var i = 0; i < deleteLink.length; i++) {
        deleteLink[i].addEventListener('click', function(event) {
            console.log('CLICK!');
            console.log(event.target.innerText);
          overwolf.utils.sendKeyStroke('TEST');
        });
      }
      button.addEventListener('click', handler, false);

      function handler(){
        if(!open){
          this.innerHTML = "Close";
          document.querySelectorAll('.cn-wrapper')[0].classList.add('opened-nav');
        }
        else{
          this.innerHTML = "Menu";
          document.querySelectorAll('.cn-wrapper')[0].classList.remove('opened-nav');
        }
        open = !open;
      }
      function closeWrapper(){
        document.querySelectorAll('.cn-wrapper')[0].classList.remove('opened-nav');
      }

    }

    // Add a line to the events log
    logEvent(string, isHighlight) {
      this._logLine(string, isHighlight);
    }

    // Add a line to the info updates log
    logInfoUpdate(string, isHighlight) {
      this._logLine(string, isHighlight);
    }

    // Update hotkey header
    // updateHotkey(hotkey) {
    //   this._hotkey.textContent = hotkey;
    // }

    // Add a line to a log
    _logLine(log, string, isHighlight) {
      console.log('I WILL LOG');
      console.log(log);
    }
  }

  return InGameView;
});
