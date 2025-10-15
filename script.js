const contentContainer = document.getElementById('contentContainer');
const homeBtn = document.getElementById('homeBtn');
const popupMenu = document.getElementById('popupMenu');

const pageButtonsContainer = document.createElement('div');
pageButtonsContainer.classList.add('page-buttons');
homeBtn.insertAdjacentElement('afterend', pageButtonsContainer);

let currentIndex = -1;
const MAX_PAGES = 10;
let pagesFound = 0;

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
  fetch(`page${pageNum}.html`)
    .then(response => {
      if (!response.ok) throw new Error('Page not found');
      return response.text();
    })
    .then(html => {
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
    btn.style.backgroundColor = (btn.dataset.page == pageNum) ? 'gold' : 'rgba(0,0,0,0.6)';
  });
}

// Detect how many pages exist
async function detectPages() {
  for (let i = 1; i <= MAX_PAGES; i++) {
    try {
      const response = await fetch(`page${i}.html`);
      if (response.ok) {
        createPageButton(i);
        pagesFound++;
      } else {
        break;
      }
    } catch (err) {
      break;
    }
  }

  if (pagesFound > 0) {
    loadPage(1);
  } else {
    contentContainer.innerHTML = "No pages found.";
  }
}

detectPages();

// Toggle menu with button
homeBtn.addEventListener('click', () => {
  popupMenu.classList.toggle('hidden');
  if (!popupMenu.classList.contains('hidden')) {
    currentIndex = 0;
    updateMenuSelection();
  } else {
    currentIndex = -1;
    updateMenuSelection();
  }
});

// Toggle menu with `~` key
document.addEventListener('keydown', (event) => {
  if (event.key === '`' || event.key === '~') {
    popupMenu.classList.toggle('hidden');
    if (!popupMenu.classList.contains('hidden')) {
      currentIndex = 0;
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
  const key = event.key;
  if (popupMenu.classList.contains('hidden') && /^[1-9]$|^0$/.test(key)) {
    let pageNum = key === '0' ? '10' : key;
    const button = document.querySelector(`.page-btn[data-page="${pageNum}"]`);
    if (button) button.click();
  }
});

// Arrow key navigation inside popup menu
document.addEventListener('keydown', (event) => {
  if (popupMenu.classList.contains('hidden')) return;

  const menuItems = Array.from(popupMenu.querySelectorAll('li'));
  if (menuItems.length === 0) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    currentIndex = (currentIndex + 1) % menuItems.length;
    updateMenuSelection(menuItems);
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    currentIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
    updateMenuSelection(menuItems);
  }

  if (event.key === 'Enter' && currentIndex >= 0) {
    menuItems[currentIndex].click();
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
