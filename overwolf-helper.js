export default class OverwolfHelper {
  constructor(props) {
    this.gameInfo = {};
    this.windowName = 'chat_wheel';
  }

  sendKeyStrokes(commands) {
    commands.forEach((command) => {
      window.setTimeout(function() {
        overwolf.utils.sendKeyStroke(command);
      }, 100);
      this.log(command);
    });
    return commands;
  }

  log (message) {
    console.info(message);
  }

  async onGameInfoUpdatedListener(gameInfo) {
    this.gameInfo = this.getGameInfo(gameInfo);
    if (this.gameInfo.isRunning && this.gameInfo.isInFocus) {
        await this.restore(this.windowName);
      // overwolf.games.inputTracking.getMousePosition((response)=> {
      //   console.log('MOUSE POSITION RECEIVED');
      //   console.log(response);
      // });
    } else {
      await this.minimize(this.windowName);
    }
    this.log("checkGameStatus: " + JSON.stringify(gameInfo));
  }

  minimize(name) {
    return new Promise(async (resolve, reject) => {
      try {
        overwolf.windows.minimize(name, (result) => {
          if (result.status === 'success') {
            resolve();
          } else {
            reject(result);
          }
        });
      } catch (e) {
        reject(e)
      }
    });
  }

  restore(name) {
    return new Promise(async (resolve, reject) => {
      try {
        overwolf.windows.restore(name, (result) => {
          if (result.status === 'success') {
            resolve();
          } else {
            reject(result);
          }
        });
      } catch (e) {
        reject(e)
      }
    });
  }

  changePosition(name, left, top) {
    return new Promise(async (resolve, reject) => {
      try {
        overwolf.windows.changePosition(name, left, top, (result) => {
          if (result.status === 'success') {
            resolve();
          } else {
            reject(result);
          }
        })
      } catch (e){
        reject(e);
      }
    });
  }

  getGameInfo(res) {
    let gameInfo = res;
    if (res.hasOwnProperty('gameInfo')) {
      gameInfo = res.gameInfo;
    }
    return gameInfo;
  }

  registerGameEvents() {
    overwolf.games.onGameInfoUpdated.addListener(this.onGameInfoUpdatedListener.bind(this));
  }
}

export const overwolfHelper = new OverwolfHelper();

// overwolf.extensions.current.getManifest(manifest => {
//   this.version = manifest.meta.version;
// });