import WheelMenu from './wheel-menu.js';
import { overwolfHelper } from './overwolf-helper.js';
import { wc3Helper } from './wc3-helper.js';

class OverwolfApp {
  constructor() {
    this.menu = {};
    this.microsoftKeyEnumMap = {
      ' ': 'Space',
      '!': 'LeftShift+D1',
      "'": 'OemQuotes',
    };
  }

  init() {
    this.menu = this.createWheelMenu();
    overwolfHelper.registerGameEvents();
  }

  menuSelectionListener(selectedText) {
    this.sendStroke(selectedText);
  }

  sendStroke(command) {
    let toggleChatCommand = wc3Helper.getCommandSendMethod(command);
    command = command.replace(wc3Helper.allStringPattern,'');
    let commandList = this.spreadCommandToMicrosoftKeyEnum(command);
    commandList.unshift(toggleChatCommand);
    commandList.push(toggleChatCommand);
    return overwolfHelper.sendKeyStrokes(commandList);
  }

  spreadCommandToMicrosoftKeyEnum(command) {
    let commandList = [];
    for (var i = 0; i < command.length; i++) {
      let commandChar = command.charAt(i);
      if (this.microsoftKeyEnumMap.hasOwnProperty(commandChar)) {
        commandList.push(this.microsoftKeyEnumMap[commandChar]);
      } else {
        commandList.push(commandChar);
      }
    }
    return commandList;
  }

  createWheelMenu() {
    this.wheelMenu = new WheelMenu('html', {
      size: 170,
      classes: '-dota-',
      pointerOffset: 8,
      borderWidth: 11,
      pointerSize: 80,
      items: [
        'Attack!',
        `${wc3Helper.allStringPattern} Well played`,
        `${wc3Helper.allStringPattern} glhf`,
        `${wc3Helper.allStringPattern} GGWP`,
        'Care',
        'Get Back',
        'Help!',
        'Game is hard',
        'Dont give up',
        'Current Time'
      ],
      onChange: this.menuSelectionListener.bind(this)
    });
  }
}

let app = (new OverwolfApp()).init();
