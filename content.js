// Log the start of content script execution
console.log('Content script starting to execute');

// Set initial opacity of the body to 0 (invisible)
document.body.style.opacity = '0';
// Commented out transition effect
// document.body.style.transition = 'opacity 0.3s ease-in';

// Function to read the API key from key.txt file
async function getApiKey() {
  console.log('Attempting to read API key');
  try {
    // Fetch the key.txt file
    const response = await fetch(chrome.runtime.getURL('key.txt'));
    // Read the text content of the file
    const key = await response.text();
    console.log('API key read successfully');
    // Return the trimmed key (remove whitespace)
    return key.trim();
  } catch (error) {
    console.error('Error reading API key:', error);
    return null;
  }
}

// Function to make API calls to X.AI
// Function to make API calls to X.AI
async function callXAI(prompt) {
  console.log('Calling X.AI with prompt:', prompt);
  // Get the API key
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error('API key not found');
    return null;
  }

  try {
    // Make the API request
    const response = await fetch('https://api.x.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }]
      })
    });

    // Check if the response is successful
    if (!response.ok) {
      console.error('API call failed:', response.statusText);
      return null;
    }

    // Parse the response
    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    console.log('X.AI raw response received:', rawContent);

    // Extract content between <output> tags
    const outputRegex = /<output>([\s\S]*?)<\/output>/;
    const match = rawContent.match(outputRegex);
    const extractedContent = match ? match[1].trim() : null;

    if (extractedContent) {
      console.log('Extracted content:', extractedContent);
      return extractedContent;
    } else {
      console.error('No content found between <output> tags');
      return null;
    }
  } catch (error) {
    console.error('Error calling X.AI:', error);
    return null;
  }
}

// Function to modify the page content
// Function to modify the page content
function modifyPage() {
  console.log('modifyPage function called');
  // Select all unenhanced header and paragraph elements
  const elements = document.querySelectorAll('h1:not([data-enhanced]), h2:not([data-enhanced]), h3:not([data-enhanced]), h4:not([data-enhanced]), p:not([data-enhanced])');
  console.log('Found', elements.length, 'unenhanced elements');
  if (elements.length === 0) {
    console.log('No unenhanced elements found on the page');
    document.body.style.opacity = '1';
    return;
  }
  
  let processedCount = 0;
  
  // Process each unenhanced element
  elements.forEach((element, index) => {
    const originalText = element.textContent;
    console.log(`Processing element ${index + 1}:`, originalText);
    // Retrieve user prompt template from storage
    chrome.storage.sync.get('userPromptTemplate', function(items) {
      const userPromptTemplate = items.userPromptTemplate || 'Drive the reader of this website nuts by replacing this {elementType} with something super snarky and offensive, while roughly maintaining its original meaning, and around the same length: "{originalText}"';
      // Replace placeholders in the prompt template
      const prompt = userPromptTemplate
        .replace('{elementType}', element.tagName.toLowerCase())
        .replace('{originalText}', originalText);
      const message = { 
        action: 'callXAI', 
        prompt: prompt
      };
      console.log('Sending message to background script:', message);
      // Send message to background script to call X.AI
      chrome.runtime.sendMessage(
        message,
        (enhancedText) => {
          console.log('Received response from background script:', enhancedText);
          if (chrome.runtime.lastError) {
            console.error('Error in chrome.runtime.sendMessage:', chrome.runtime.lastError);
          }
          if (enhancedText) {
            // Remove any remaining <output> tags
            enhancedText = enhancedText.replace(/<\/?output>/g, '').trim();
            console.log(`Element ${index + 1} enhanced:`, enhancedText);
            // Update the element with enhanced text
            element.textContent = enhancedText;
            element.setAttribute('data-enhanced', 'true');
          } else {
            console.log(`Failed to enhance element ${index + 1}`);
          }
          
          // Check if all elements have been processed
          processedCount++;
          if (processedCount === elements.length) {
            // Make the page visible once all elements are processed
            document.body.style.opacity = '1';
          }
        }
      );
    });
  });
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced version of modifyPage
const debouncedModifyPage = debounce(modifyPage, 1000);

// Run the page modification immediately and when the content is loaded
console.log('Running modifyPage immediately');
modifyPage();

console.log('Adding DOMContentLoaded event listener');
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  modifyPage();
});

// Listen for changes in the DOM and rerun the modification
console.log('Setting up MutationObserver');
const observer = new MutationObserver((mutations) => {
  console.log('DOM mutation detected:', mutations);
  console.log('Mutation details:', mutations.map(m => ({
    type: m.type,
    target: m.target.nodeName,
    addedNodes: m.addedNodes.length,
    removedNodes: m.removedNodes.length
  })));
  debouncedModifyPage();
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

console.log('Content script finished loading');
