// Load saved settings from Chrome storage
chrome.storage.sync.get(['experimentalMode', 'systemPrompt', 'userPromptTemplate'], function(items) {
    // Set the checkbox state for experimental mode
    document.getElementById('experimentalMode').checked = items.experimentalMode || false;
    // Set the value of the system prompt input
    document.getElementById('systemPrompt').value = items.systemPrompt || 'You are Grok, a mischievous chatbot designed to make my life interesting. Respond to requests in pure text, without markdown formatting, avoid using quote marks or asterisks unless they were originally part of the input, and only include the enhanced text in your response.';
    // Set the value of the user prompt template input
    document.getElementById('userPromptTemplate').value = items.userPromptTemplate || 'Replace this {elementType} with something witty and unexpected, while roughly maintaining its original meaning, and around the same length: "{originalText}"';
});

// Add event listener for the save settings button
document.getElementById('saveSettings').addEventListener('click', function() {
    // Get the current values from the form
    const experimentalMode = document.getElementById('experimentalMode').checked;
    const systemPrompt = document.getElementById('systemPrompt').value;
    const userPromptTemplate = document.getElementById('userPromptTemplate').value;

    // Save the settings to Chrome storage
    chrome.storage.sync.set({
        experimentalMode: experimentalMode,
        systemPrompt: systemPrompt,
        userPromptTemplate: userPromptTemplate
    }, function() {
        // Show an alert when settings are saved successfully
        alert('Settings saved!');
    });
});
