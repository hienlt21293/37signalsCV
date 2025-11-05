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

// Toggle menu with `~` key
document.addEventListener('keydown', (event) => {
  if (event.key === '`' || event.key === '~'  || event.key === '.') {
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