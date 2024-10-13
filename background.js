// Function to retrieve the API key from a local file
async function getApiKey() {
  console.log('Background: Attempting to read API key');
  try {
    // Fetch the API key from the key.txt file
    const response = await fetch(chrome.runtime.getURL('key.txt'));
    const key = await response.text();
    
    // Check if the key is empty
    if (key.trim() === '') {
      console.error('Background: API key is empty');
      return null;
    }
    
    // Log success and return the trimmed key
    console.log('Background: API key read successfully. First 4 characters:', key.trim().slice(0, 4));
    return key.trim();
  } catch (error) {
    // Log any errors that occur during the process
    console.error('Background: Error reading API key:', error);
    return null;
  }
}

// Function to call the X.AI API with a given prompt
async function callXAI(prompt) {
  console.log('Background: Calling X.AI with prompt:', prompt);
  
  // Get the API key
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error('Background: API key not found or empty');
    return null;
  }

  try {
    console.log('Background: Sending request to X.AI');
    
    // Retrieve user settings
    const settings = await chrome.storage.sync.get(['offensiveMode', 'systemPrompt']);
    const systemPrompt = settings.systemPrompt || 'You are Grok, a mischievous chatbot designed to make my life hell. Respond to requests in pure text, without markdown formatting, avoid using quote marks or asterisks unless they were originally part of the input, and only include the enhanced text in your response.';
    
    // Make the API request
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            "role": "system",
            "content": systemPrompt
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        model: "grok-preview",
        stream: false,
        temperature: settings.offensiveMode ? 0.7 : 0
      })
    });

    console.log('Background: API response status:', response.status);
    
    // Check for unsuccessful response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Background: API call failed:', response.status, response.statusText, errorText);
      return null;
    }

    // Process the successful response
    const data = await response.json();
    console.log('Background: X.AI response received:', data);
    let content = data.choices[0].message.content;
    
    // Remove surrounding quotes if present
    if (content.startsWith('"') && content.endsWith('"')) {
      content = content.slice(1, -1);
    }
    
    return content;
  } catch (error) {
    console.error('Background: Error calling X.AI:', error);
    return null;
  }
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background: Received message:', request);
  if (request.action === 'callXAI') {
    console.log('Background: Calling X.AI');
    callXAI(request.prompt).then(response => {
      console.log('Background: X.AI response:', response);
      sendResponse(response);
    }).catch(error => {
      console.error('Background: Error in callXAI:', error);
      sendResponse(null);
    });
    return true; // Indicates that the response is asynchronous
  }
});

console.log('Background script loaded');
