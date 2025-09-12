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

  function addCheckbox(text) {
  // Add "- [x] " in front of each line if not already present
  return text
    .split("\n")
    .map(line => {
      let trimmed = line.trim();
      return trimmed.startsWith("- [x] ") ? trimmed : `- [x] ${trimmed}`;
    })
    .join("\n");
}

function removeCheckbox(text) {
  // Remove "- [x] " prefix if present
  return text
    .split("\n")
    .map(line => {
      let trimmed = line.trim();
      return trimmed.startsWith("- [x] ") ? trimmed.slice(6) : line;
    })
    .join("\n");
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

   /**
     * Recursively process a node and return cleaned HTML.
     * @param {Node} node - The DOM node to process.
     * @param {boolean} parentIsAnchor - True if an ancestor is already wrapped in an anchor.
     */
   function cleanNode(node, parentIsAnchor = false) {
    // For text nodes, return its text.
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      let inner = "";
      // Determine if current node is an anchor.
      const isCurrentAnchor = (tag === "a");
      
      // Process children, passing down whether we're inside an anchor.
      node.childNodes.forEach(child => {
        inner += cleanNode(child, parentIsAnchor || isCurrentAnchor);
      });
      
      // If the current node is an anchor, reassemble it (unless already inside an anchor)
      if (tag === "a") {
        if (parentIsAnchor) {
          // If already inside an anchor, just return its content.
          return inner;
        } else {
          // Recreate the anchor with a clean, empty href.
          return `<a href="">${inner}</a>`;
        }
      }
      
      // Determine formatting flags.
      let isBold = false;
      let isUnderline = false;
      
      // Check tag names.
      if (tag === "strong" || tag === "b") {
        isBold = true;
      }
      if (tag === "u") {
        isUnderline = true;
      }
      
      // Check inline style.
      if (node.style) {
        if (node.style.fontWeight) {
          const fw = node.style.fontWeight.toLowerCase();
          if (fw === "bold" || (!isNaN(parseInt(fw)) && parseInt(fw) >= 700)) {
            isBold = true;
          }
        }
        if (node.style.textDecoration) {
          if (node.style.textDecoration.includes("underline")) {
            isUnderline = true;
          }
        }
      }
      
      // Check for class names that imply underlining.
      if (node.classList && node.classList.contains("Underlined")) {
        isUnderline = true;
      }
      
      // Wrap content based on formatting flags.
      // If both bold and underlined and not already inside an anchor.
      if (isBold && isUnderline && !parentIsAnchor) {
        return `<a href=""><strong>${inner}</strong></a>`;
      } else if (isBold) {
        return `<strong>${inner}</strong>`;
      } else if (isUnderline && !parentIsAnchor) {
        return `<a href="">${inner}</a>`;
      } else {
        return inner;
      }
    }
    return "";
  }
  
  // Process the entire HTML string.
  function cleanHTML(html) {
    const container = document.createElement("div");
    container.innerHTML = html;
    let result = "";
    container.childNodes.forEach(child => {
      result += cleanNode(child, false);
    });
    return result;
  }

  // Event listener for Format Request Message functionality
  document.getElementById('formatRequestButton').addEventListener('click', function () {
    // const inputRequestMessage = document.getElementById('inputRequestMessage').innerText;
    const htmlContent = document.getElementById('inputRequestMessage').innerHTML;
    const cleaned = cleanHTML(htmlContent);
    const inputRequestMessage = cleaned.trim();;
    if (!inputRequestMessage.trim()) {
      return;
    }

    const { formattedText, comments } = formatRequestMessage(inputRequestMessage);

    document.getElementById('outputRequestMessage').value = formattedText;
    document.getElementById('outputRequestComments').value = comments;
  });

// Event listener for Add Checkbox functionality
  document.getElementById('addCheckboxButton').addEventListener('click', function () {
    const inputText = document.getElementById('inputCheckboxText').value;
    if (!inputText.trim()) {
      return;
    }
    document.getElementById('outputCheckboxText').value = addCheckbox(inputText);
  });

  // Event listener for Remove Checkbox functionality
  document.getElementById('removeCheckboxButton').addEventListener('click', function () {
    const inputText = document.getElementById('inputCheckboxText').value;
    if (!inputText.trim()) {
      return;
    }
    document.getElementById('outputCheckboxText').value = removeCheckbox(inputText);
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

    // Copy CheckBox Output to Clipboard
  document.getElementById('copyCheckboxOutput').addEventListener('click', function () {
    const outputCheckboxText = document.getElementById('outputCheckboxText').value;
    if (outputCheckboxText.trim()) {
      navigator.clipboard.writeText(outputCheckboxText);
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
