import { overwolfHelper } from './overwolf-helper.js';

export default class Wc3Helper {
  constructor() {
    this.allStringPattern = '[ALL]';
    this.allChatToggle = 'LShiftKey+Enter';
    this.allyChatToggle = 'Enter';
  }
  getCommandSendMethod(command) {
    var method=this.allyChatToggle;
    if (command.includes(this.allStringPattern)) {
      method=this.allChatToggle;
    }
    return method;
  }
}

export const wc3Helper = new Wc3Helper();


