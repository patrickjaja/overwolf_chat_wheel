# Warcraft 3 - Reforged - Chat Wheel


![POC Chat wheel](poc_wc3_chat_wheel.gif)

WC3 - Chat Wheel integration based on Overwolf abstraction layer.
Can be used to send messages to ally or enemy chat.

Issues:
 - keys not getting sent in correct order
 - Only Open Wheel on hotkey usage (currently its attached to gameinfo event)
 - Cant use special chars like "!"
 - Overwolf window to current mousePosition
 - activate chatwheel on overwolf hotkeypress (maybe open/close on longpress)
 - overwolfs sendKeyStroke doesnt allow emojis 😃 but wc3 allows (https://unicode.org/emoji/charts/full-emoji-list.html)
 
Credits:
 - https://github.com/t1m0n/wheel-menu (base functionality)
 - https://docs.microsoft.com/de-de/dotnet/api/system.windows.forms.keys?view=netcore-3.1 (Info about allowed keys)