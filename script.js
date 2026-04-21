const contentContainer = document.getElementById('contentContainer');
const homeBtn = document.getElementById('homeBtn');
const popupMenu = document.getElementById('popupMenu');

const pageButtonsContainer = document.createElement('div');
pageButtonsContainer.classList.add('page-buttons');
homeBtn.insertAdjacentElement('afterend', pageButtonsContainer);

let currentIndex = -1;

const pageCache = {};

function preloadPages() {
  for (let i = 0; i <= 7; i++) {
    fetch(`page${i}.html`)
      .then(response => response.text())
      .then(html => {
        pageCache[i] = html;
      });
  }
}

// Create page buttons
function createPageButton(pageNum) {
  const btn = document.createElement('button');
  btn.classList.add('page-btn');
  btn.textContent = pageNum;
  btn.dataset.page = pageNum;
  btn.style.marginRight = '4px';
  btn.addEventListener('click', () => loadPage(pageNum));
  pageButtonsContainer.appendChild(btn);
}

// Load page content
function loadPage(pageNum) {
  window.scrollTo(0, 0);
  if (pageCache[pageNum]) {
    contentContainer.innerHTML = pageCache[pageNum];
    highlightButton(pageNum);
    return Promise.resolve();
  }

  return fetch(`page${pageNum}.html`)
    .then(response => {
      if (!response.ok) throw new Error('Page not found');
      return response.text();
    })
    .then(html => {
      pageCache[pageNum] = html;
      contentContainer.innerHTML = html;
      highlightButton(pageNum);
    })
    .catch(() => {
      contentContainer.innerHTML = `Error loading page ${pageNum}`;
    });
}

// Highlight current page button
function highlightButton(pageNum) {
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.style.backgroundColor = (btn.dataset.page == pageNum) ? 'white' : 'transparent';
    btn.style.color = (btn.dataset.page == pageNum) ? 'black' : 'white';
  });
}

loadPage(0).then(() => {
  preloadPages();
});
createPageButton(0);
createPageButton(1);
createPageButton(2);
createPageButton(3);
createPageButton(4);
createPageButton(5);
createPageButton(6);
createPageButton(7);

// Add mouseover listeners to menu items to sync with keyboard selection
const menuItemsForMouse = Array.from(popupMenu.querySelectorAll('li'));
menuItemsForMouse.forEach((item, index) => {
  item.addEventListener('mouseover', () => {
    if (currentIndex !== index) {
      currentIndex = index;
      updateMenuSelection(menuItemsForMouse);
    }
  });

  // Add click listener to delegate to link
  item.addEventListener('click', (event) => {
    const link = item.querySelector('a');
    if (link && event.target !== link) {
      link.click();
    }
  });
});

// Toggle menu with button
homeBtn.addEventListener('click', () => {
  popupMenu.classList.toggle('hidden');
  if (!popupMenu.classList.contains('hidden')) {
    currentIndex = -1;
    updateMenuSelection();
  } else {
    currentIndex = -1;
    updateMenuSelection();
  }
});

// Toggle menu with `~` key; Escape closes it
document.addEventListener('keydown', (event) => {
  const isTyping = document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');
  if (isTyping) return;

  if (event.key === 'Escape') {
    popupMenu.classList.add('hidden');
    currentIndex = -1;
    updateMenuSelection();
    return;
  }

  if (event.key === '`' || event.key === '~' || event.key === '.') {
    popupMenu.classList.toggle('hidden');
    if (!popupMenu.classList.contains('hidden')) {
      currentIndex = -1;
      updateMenuSelection();
    } else {
      currentIndex = -1;
      updateMenuSelection();
    }
  }
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
  const isClickInsideMenu = popupMenu.contains(event.target);
  const isClickOnButton = homeBtn.contains(event.target);

  if (!isClickInsideMenu && !isClickOnButton) {
    popupMenu.classList.add('hidden');
    currentIndex = -1;
    updateMenuSelection();
  }
});

// Keyboard: number keys to switch pages
document.addEventListener('keydown', (event) => {
  const isTyping = document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');
  if (isTyping) return;
  const key = event.key;
  if (popupMenu.classList.contains('hidden')) {
    if (key === '0' || key === 'w') {
      loadPage(0);
    } else if (/^[1-9]$/.test(key)) {
      const button = document.querySelector(`.page-btn[data-page="${key}"]`);
      if (button) button.click();
    }
  }
});

// Arrow key navigation inside popup menu
document.addEventListener('keydown', (event) => {
  if (popupMenu.classList.contains('hidden')) return;

  const menuItems = Array.from(popupMenu.querySelectorAll('li'));
  if (menuItems.length === 0) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (currentIndex === menuItems.length - 1) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateMenuSelection(menuItems);
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (currentIndex <= 0) {
      currentIndex = menuItems.length - 1;
    } else {
      currentIndex--;
    }
    updateMenuSelection(menuItems);
  }

  if (event.key === 'Enter' && currentIndex >= 0) {
    const link = menuItems[currentIndex].querySelector('a');
    if (link) {
      link.click();
    } else {
      menuItems[currentIndex].click();
    }
  }
});

// Highlight menu item
function updateMenuSelection(menuItems = Array.from(popupMenu.querySelectorAll('li'))) {
  menuItems.forEach((item, index) => {
    item.classList.toggle('selected', index === currentIndex);
  });

  if (menuItems[currentIndex]) {
    menuItems[currentIndex].scrollIntoView({ block: 'nearest' });
  }
}

// --- AI Chat Logic ---
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatModal = document.getElementById('chatModal');
const chatCloseBtn = document.getElementById('chatCloseBtn');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatHistory = document.getElementById('chatHistory');

chatToggleBtn.addEventListener('click', () => {
  chatModal.classList.toggle('hidden');
});

chatCloseBtn.addEventListener('click', () => {
  chatModal.classList.add('hidden');
});

const SYSTEM_PROMPT = `You are an AI assistant. Your goal is to answer questions from recruiters and evaluate if Hien is a good fit for their Job Description (JD). If the user paste a JD, you should evaluate if Hien is a good fit for the JD, and always provide a rating on the scale of 1 to 10.
STRICT LIMITATION: You are forbidden from discussing any topics outside of Hien’s professional background, career, and Job Description evaluations. If a user asks about celebrities, general knowledge, or anything unrelated to Hien's career, you must respond exactly with: 'I am specialized in evaluating Hien's career fit and cannot answer unrelated questions.'
Here is Hien's summary:
- 9+ years of Cloud/DevOps experience. 
- Total experience working with Azure: 3.5 years (with 2 years as a DevOps Engineer at KMS, and 1.5 years as a DevOps Engineer at Aarista).
- Certifications: Microsoft Certified DevOps Engineer Expert, AWS DevOps Engineer Professional, CKA.
- Skills: AWS, Azure, Jenkins, GitHub Actions, Terraform, Kubernetes, ECS, Python, Bash.
- ALWAYS use the pageN.html pages/files as reference to provide details about Hien's experience.
- Be professional, concise, and persuasive. If a JD is provided, map Hien's skills to the JD requirements and ALWAYS provide an overall rating (scale of 1 to 10). ALWAYS state if the role is a reach, stretch, or good fit. 
- Always highlight strong alignments and honestly address minor gaps (e.g., if they ask for 10 years experience, note Hien has 7 in DevOps but makes up for it with Expert certifications and Lead roles).`;

// API KEY only usable in this site.
const GEMINI_API_KEY = "AIzaSyCCy16tCB2mZdC2p-KjrIVoe9qML8KXZAs"; // 

async function sendChatMessage() {
  const userText = chatInput.value.trim();
  if (!userText) return;

  // Append user message
  const userMsgDiv = document.createElement('div');
  userMsgDiv.className = 'chat-message user-message';
  userMsgDiv.textContent = userText;
  chatHistory.appendChild(userMsgDiv);
  chatInput.value = '';
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Append thinking message
  const botMsgDiv = document.createElement('div');
  botMsgDiv.className = 'chat-message bot-message';
  botMsgDiv.textContent = 'Thinking...';
  chatHistory.appendChild(botMsgDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    botMsgDiv.textContent = "Error: Please set your Gemini API key in script.js!";
    return;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: { text: SYSTEM_PROMPT }
        },
        contents: [
          {
            parts: [{ text: userText }]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    botMsgDiv.textContent = reply;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    botMsgDiv.textContent = "Sorry, I couldn't reach the AI at the moment. Please check the API key.";
  }
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

chatSendBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});