document.addEventListener('DOMContentLoaded', function () {
  const functionalitySelect = document.getElementById('functionalitySelect');

  function replaceText(inputText) {
    return inputText.replace(/:/g, '::').replace(/\[([^\]]+)\]/g, '{{$1}}');
  }

  function replaceBrackets(inputText) {
    return inputText.replace(/\[/g, '{{').replace(/\]/g, '}}');
  }

  function formatLinks(inputText) {
    const lines = inputText.split('\n').filter(line => line.trim() !== '');
    return lines
      .map(line => {
        const match = line.match(/templatePath=([^&]+)/);
        if (match) {
          const pathParts = decodeURIComponent(match[1]).split('/');
          const templateName = pathParts[pathParts.length - 1];
          return `[${templateName}](${line.trim()})`;
        }
        return line;
      })
      .join('\n');
  }

  function formatRequestMessage(inputText) {
    let counter = 0;
    const placeholders = {};

    const formattedText = inputText.replace(/\[([^\]]+)\]/g, (match, p1) => {
      placeholders[`{${counter}}`] = p1;
      return `{${counter++}}`;
    });

    const comments = Object.entries(placeholders)
      .map(([key, value]) => `${key}-${value}`)
      .join(',');

    return {
      formattedText,
      comments
    };
  }

  function updateUI() {
    const selectedFunctionality = functionalitySelect.value;

    chrome.storage.local.set({ selectedFunctionality });

    const functionalities = document.querySelectorAll('.functionality');
    functionalities.forEach(func => func.style.display = 'none');

    document.getElementById(selectedFunctionality).style.display = 'block';
  }

  // Event listener for Replace Text functionality
  document.getElementById('replaceButton').addEventListener('click', function () {
    const inputText = document.getElementById('inputText').value;
    if (!inputText.trim()) {
      return;
    }
    document.getElementById('outputText').value = replaceText(inputText);
  });

  // Event listener for Replace Brackets functionality
  document.getElementById('replaceBracketsButton').addEventListener('click', function () {
    const inputText = document.getElementById('inputBracketsText').value;
    if (!inputText.trim()) {
      return;
    }
    document.getElementById('outputBracketsText').value = replaceBrackets(inputText);
  });

  // Event listener for Link Formatter functionality
  document.getElementById('formatLinksButton').addEventListener('click', function () {
    const inputLinks = document.getElementById('inputLinks').value;
    if (!inputLinks.trim()) {
      return;
    }
    document.getElementById('outputFormattedLinks').value = formatLinks(inputLinks);
  });

  // Event listener for Format Request Message functionality
  document.getElementById('formatRequestButton').addEventListener('click', function () {
    const inputRequestMessage = document.getElementById('inputRequestMessage').value;
    if (!inputRequestMessage.trim()) {
      return;
    }

    const { formattedText, comments } = formatRequestMessage(inputRequestMessage);

    document.getElementById('outputRequestMessage').value = formattedText;
    document.getElementById('outputRequestComments').value = comments;
  });

  // Copy Formatted Text to Clipboard
  document.getElementById('copyReplaceText').addEventListener('click', function () {
    const outputText = document.getElementById('outputText').value;
    if (outputText.trim()) {
      navigator.clipboard.writeText(outputText);
    }
  });

  // Copy Brackets Output to Clipboard
  document.getElementById('copyReplaceBrackets').addEventListener('click', function () {
    const outputBracketsText = document.getElementById('outputBracketsText').value;
    if (outputBracketsText.trim()) {
      navigator.clipboard.writeText(outputBracketsText);
    }
  });

  // Copy Formatted Links to Clipboard
  document.getElementById('copyFormatLinks').addEventListener('click', function () {
    const outputFormattedLinks = document.getElementById('outputFormattedLinks').value;
    if (outputFormattedLinks.trim()) {
      navigator.clipboard.writeText(outputFormattedLinks);
    }
  });

  // Copy Formatted Request Message to Clipboard
  document.getElementById('copyFormattedText').addEventListener('click', function () {
    const outputRequestMessage = document.getElementById('outputRequestMessage').value;
    if (outputRequestMessage.trim()) {
      navigator.clipboard.writeText(outputRequestMessage);
    }
  });

  // Copy Comments to Clipboard
  document.getElementById('copyComments').addEventListener('click', function () {
    const outputRequestComments = document.getElementById('outputRequestComments').value;
    if (outputRequestComments.trim()) {
      navigator.clipboard.writeText(outputRequestComments);
    }
  });

  // Initialize UI
  chrome.storage.local.get('selectedFunctionality', (data) => {
    if (data.selectedFunctionality) {
      functionalitySelect.value = data.selectedFunctionality;
    }
    updateUI();
  });

  // Update UI on dropdown change
  functionalitySelect.addEventListener('change', updateUI);

  updateUI();
});
