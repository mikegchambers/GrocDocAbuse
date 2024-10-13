Here's a decent README for the project:

# GrocDocAbuse - X Hackerthon Plugin

This Chrome extension modifies the content of X.AI documentation pages in a mischievous and unexpected way. It uses the X.AI API to transform text elements on the page, creating a unique and potentially entertaining browsing experience.

## Features

- Transforms headers and paragraphs on X.AI documentation pages
- Customizable system prompt and user prompt template
- Experimental mode toggle (that does nothing)
- Debounced DOM mutation observer for dynamic content

## Installation

1. Clone this repository or download the source code.
2. Obtain an API key from X.AI.
3. Create a file named `key.txt` in the root directory of the project.
4. Paste your X.AI API key into the `key.txt` file.
5. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the project directory

## Configuration

You can customize the extension's behavior through the settings page:

1. Click on the extension icon in Chrome
2. Select "Options" or "Settings"
3. Adjust the following settings:
   - Enable/disable Experimental Mode
   - Modify the System Prompt
   - Customize the User Prompt Template

## How it works

The extension injects a content script into X.AI documentation pages. This script:

1. Identifies unmodified header and paragraph elements
2. Sends the original text to the background script
3. The background script calls the X.AI API with the configured prompts
4. The API response is used to replace the original text on the page

The extension uses a MutationObserver to detect changes in the DOM and reapply modifications as needed.

## Files

- `manifest.json`: Extension configuration
- `content.js`: Content script injected into web pages
- `background.js`: Background script for API communication
- `settings.html` and `settings.js`: Extension settings page
- `key.txt`: File containing your X.AI API key (not included in repository)

## Security Note

Keep your `key.txt` file secure and do not share it publicly. The `.gitignore` file is configured to exclude `key.txt` from version control.

## Permissions

The extension requires the following permissions:

```6:12:manifest.json
  "permissions": [
    "activeTab",  // Permission to access the active tab
    "storage"     // Permission to use Chrome storage
  ],
  "host_permissions": [
    "https://api.x.ai/*"  // Permission to make requests to the X.AI API
  ],
```


## Disclaimer

This extension is for educational and entertainment purposes only. Use responsibly and be aware that it may significantly alter the content of X.AI documentation pages.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)