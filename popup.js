document.addEventListener('DOMContentLoaded', function () {
  const functionalitySelect = document.getElementById('functionalitySelect');

  // Functionality-specific functions
  function replaceText(inputText) {
    return inputText.replace(/:/g, '::').replace(/\[([^\]]+)\]/g, '{{$1}}');
  }

  function replaceBrackets(inputText) {
    return inputText.replace(/\[/g, '{{').replace(/\]/g, '}}');
  }


  function formatLinks(inputText) {
    // Split the input into lines
    const lines = inputText.split('\n').filter(line => line.trim() !== '');

    // Generate Markdown format
    return lines
      .map(line => {
        const match = line.match(/templatePath=([^&]+)/);
        if (match) {
          // Decode the templatePath and split by '/'
          const pathParts = decodeURIComponent(match[1]).split('/');
          // Get the last part of the path
          const templateName = pathParts[pathParts.length - 1];
          return `[${templateName}](${line.trim()})`;
        }
        return line; // Return line as-is if no match
      })
      .join('\n');
}



  // Update UI to show selected functionality
  function updateUI() {
    const selectedFunctionality = functionalitySelect.value;

    // Save selected functionality
    chrome.storage.local.set({ selectedFunctionality });

    // Hide all functionality divs
    const functionalities = document.querySelectorAll('.functionality');
    functionalities.forEach((func) => (func.style.display = 'none'));

    // Show the selected one
    document.getElementById(selectedFunctionality).style.display = 'block';
  }

  // Event listeners for functionality
  document.getElementById('replaceButton').addEventListener('click', function () {
    const inputText = document.getElementById('inputText').value;
    if (!inputText.trim()) {
      alert("Please enter some text.");
      return;
    }
    document.getElementById('outputText').value = replaceText(inputText);
  });

  document.getElementById('replaceBracketsButton').addEventListener('click', function () {
    const inputText = document.getElementById('inputBracketsText').value;
    if (!inputText.trim()) {
      alert("Please enter some text.");
      return;
    }
    document.getElementById('outputBracketsText').value = replaceBrackets(inputText);
  });

  document.getElementById('formatLinksButton').addEventListener('click', function () {
    const inputLinks = document.getElementById('inputLinks').value;
    if (!inputLinks.trim()) {
      alert("Please paste some links.");
      return;
    }
    document.getElementById('outputFormattedLinks').value = formatLinks(inputLinks);

  });

  // Restore last selected functionality
  chrome.storage.local.get('selectedFunctionality', (data) => {
    if (data.selectedFunctionality) {
      functionalitySelect.value = data.selectedFunctionality;
    }
    updateUI();
  });

  // Update UI on dropdown change
  functionalitySelect.addEventListener('change', updateUI);

  // Initialize UI
  updateUI();
});
