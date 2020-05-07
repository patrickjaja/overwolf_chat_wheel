let version = '0.0';
function registerEvents() {
  overwolf.games.events.onError.addListener(function(info) {
    console.log("Error: " + JSON.stringify(info));
  });

  overwolf.games.events.onInfoUpdates2.addListener(function(info) {
    console.log("Info UPDATE: " + JSON.stringify(info));
  });

  overwolf.games.events.onNewEvents.addListener(function(info) {
    console.log("EVENT FIRED: " + JSON.stringify(info));
  });
}

overwolf.games.onGameInfoUpdated.addListener(checkGameStatus);
overwolf.games.getRunningGameInfo(checkGameStatus);

//ToDo: Add desktop window and only show ingame if game is active
function checkGameStatus(res) {
  let gameInfo = res;
  if (res.hasOwnProperty('gameInfo')) {
    gameInfo = res.gameInfo;
  }
  if (gameInfo.isRunning && gameInfo.isInFocus) {
    registerEvents();
  }
  console.log("checkGameStatus: " + JSON.stringify(res));
}

overwolf.extensions.current.getManifest(manifest => {
  version = manifest.meta.version;
});