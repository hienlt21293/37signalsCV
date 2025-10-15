const contentContainer = document.getElementById('contentContainer');
const topNav = document.querySelector('.top-nav');
const homeBtn = document.getElementById('homeBtn');

const pageButtonsContainer = document.createElement('div');
pageButtonsContainer.classList.add('page-buttons');

// Insert buttons container right after homeBtn
homeBtn.insertAdjacentElement('afterend', pageButtonsContainer);

const popupMenu = document.getElementById('popupMenu');
homeBtn.addEventListener('click', () => {
  popupMenu.classList.toggle('hidden');
});

// Hide popup when clicking outside
document.addEventListener('click', (event) => {
  const isClickInsideMenu = popupMenu.contains(event.target);
  const isClickOnButton = homeBtn.contains(event.target);

  if (!isClickInsideMenu && !isClickOnButton) {
    popupMenu.classList.add('hidden');
  }
});


const MAX_PAGES = 10;
let pagesFound = 0;

function createPageButton(pageNum) {
  const btn = document.createElement('button');
  btn.classList.add('page-btn');
  btn.textContent = pageNum;
  btn.dataset.page = pageNum;
  btn.style.marginRight = '4px';
  btn.addEventListener('click', () => loadPage(pageNum));
  pageButtonsContainer.appendChild(btn);
}

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

function highlightButton(pageNum) {
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.style.backgroundColor = (btn.dataset.page == pageNum) ? 'gold' : 'rgba(0,0,0,0.6)';
  });
}

document.addEventListener('keydown', (event) => {
  const key = event.key;
  if (['1','2','3','4','5','6','7','8','9','0'].includes(key)) {
    let pageNum = key === '0' ? '10' : key;
    const button = document.querySelector(`.page-btn[data-page="${pageNum}"]`);
    if(button) button.click();
  }
});

async function detectPages() {
  for(let i=1; i<=MAX_PAGES; i++) {
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
