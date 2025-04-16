# Random Notifier

Random Notifier is a Chrome extension that sends notifications at random intervals to remind you to stretch and drink water. The extension also uses the Chrome Text-to-Speech (TTS) API to provide audible reminders.

## Features

- Sends notifications to remind you to stretch and drink water.
- Uses the Chrome TTS API to provide audible reminders.
- Configurable notification intervals.
- Built with Plasmo framework for modern extension development.

## Installation

### Development Setup

1. Clone the repository or download the ZIP file.
2. Install dependencies:
   ```
   npm install
   # or
   pnpm install
   ```
3. Run the development server:
   ```
   npm run dev
   # or
   pnpm dev
   ```
4. Load the extension:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" by toggling the switch in the top right corner.
   - Click on "Load unpacked" and select the `.plasmo/chrome-mv3-dev` directory.

### Production Build

1. Build the extension:
   ```
   npm run build
   # or
   pnpm build
   ```
2. Package the extension:
   ```
   npm run package
   # or
   pnpm package
   ```
3. The packaged extension will be available in the `build/` directory:
   - `build/chrome-mv3-prod.zip`: Production build for Chrome
4. To install in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Either drag and drop the ZIP file onto the page or click "Load unpacked" and select the unzipped `build/chrome-mv3-prod/` directory

## Usage

- The extension will automatically start sending notifications after it is installed.
- Configure notification settings in the popup interface.

## Project Structure

- `src/background/`: Contains the background service workers.
- `src/popup/`: Contains the popup UI components and logic.
- `src/lib/`: Utility functions and shared code.
- `src/types/`: TypeScript type definitions.

## Permissions

The extension requires the following permissions:

- `notifications`: To show notifications.
- `alarms`: To schedule notifications.
- `tts`: To use the Text-to-Speech API.
- `ttsEngine`: To use the Text-to-Speech engine.
- `storage`: To store user preferences.

## License

This project is licensed under the GPL License.
