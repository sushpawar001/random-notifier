# Random Notifier

Random Notifier is a Chrome extension that sends notifications at random intervals to remind you to stretch and drink water. The extension also uses the Chrome Text-to-Speech (TTS) API to provide audible reminders.

## Features

- Sends notifications to remind you to stretch and drink water.
- Uses the Chrome TTS API to provide audible reminders.
- Configurable notification intervals.

## Installation

1. Clone the repository or download the ZIP file.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory containing the extension files.

## Usage

- The extension will automatically start sending notifications after it is installed.

## Files

- `background.js`: Contains the main logic for the extension.
- `icon.png`: The icon for the extension.
- `manifest.json`: The manifest file that defines the extension's metadata, permissions, and background script.
- `stretching.mp3`: Audio file for the stretching reminder.
- `stretching.png`: Icon for the stretching notification.
- `water.mp3`: Audio file for the water reminder.
- `water.png`: Icon for the water notification.

## Permissions

The extension requires the following permissions:

- `notifications`: To show notifications.
- `alarms`: To schedule notifications.
- `tts`: To use the Text-to-Speech API.
- `ttsEngine`: To use the Text-to-Speech engine.

## License

This project is licensed under the GPL License.