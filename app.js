const STORAGE_KEY = 'dear-diary-entries';

const form = document.getElementById('entry-form');
const titleInput = document.getElementById('entry-title');
const dateInput = document.getElementById('entry-date');
const moodInput = document.getElementById('entry-mood');
const contentInput = document.getElementById('entry-content');
const entryIdInput = document.getElementById('entry-id');
const entriesList = document.getElementById('entries-list');
const searchInput = document.getElementById('search-input');
const totalCount = document.getElementById('total-count');
const monthCount = document.getElementById('month-count');
const latestMood = document.getElementById('latest-mood');
const cancelEditBtn = document.getElementById('cancel-edit');
const newEntryBtn = document.getElementById('new-entry-btn');

let entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatMonth(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getCurrentMonthEntries() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return entries.filter((entry) => {
    const entryDate = new Date(entry.date + 'T00:00:00');
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });
}

function updateStats() {
  totalCount.textContent = entries.length;
  monthCount.textContent = getCurrentMonthEntries().length;

  latestMood.textContent = entries.length ? entries[0].mood : '-';
}

function renderEntries(query = '') {
  const filteredEntries = [...entries]
    .filter((entry) => {
      const search = query.trim().toLowerCase();
      if (!search) return true;

      return (
        entry.title.toLowerCase().includes(search) ||
        entry.content.toLowerCase().includes(search) ||
        entry.mood.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!filteredEntries.length) {
    entriesList.innerHTML = `
      <div class="empty-state">
        <h3>No entries yet</h3>
        <p>Start writing your first memory and it will appear here.</p>
      </div>
    `;
    return;
  }

  entriesList.innerHTML = filteredEntries
    .map(
      (entry) => `
        <article class="entry-card" data-id="${entry.id}">
          <div class="entry-top">
            <div>
              <h3>${entry.title}</h3>
            </div>
            <span class="mood-tag">${entry.mood}</span>
          </div>

          <div class="entry-meta">
            <span>${formatDate(entry.date)}</span>
            <span>•</span>
            <span>${formatMonth(entry.date)}</span>
          </div>

          <p>${entry.content}</p>

          <div class="card-actions">
            <button class="icon-btn edit-btn" data-id="${entry.id}">Edit</button>
            <button class="icon-btn danger-btn delete-btn" data-id="${entry.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join('');
}

function resetForm() {
  form.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
  moodInput.value = 'Happy';
  entryIdInput.value = '';
  cancelEditBtn.classList.add('hidden');
}

function populateForm(entry) {
  entryIdInput.value = entry.id;
  titleInput.value = entry.title;
  dateInput.value = entry.date;
  moodInput.value = entry.mood;
  contentInput.value = entry.content;
  cancelEditBtn.classList.remove('hidden');
  titleInput.focus();
}

function handleSubmit(event) {
  event.preventDefault();

  const entryData = {
    id: entryIdInput.value || generateId(),
    title: titleInput.value.trim(),
    date: dateInput.value,
    mood: moodInput.value,
    content: contentInput.value.trim(),
  };

  if (!entryData.title || !entryData.date || !entryData.content) {
    return;
  }

  const existingIndex = entries.findIndex((entry) => entry.id === entryData.id);

  if (existingIndex >= 0) {
    entries[existingIndex] = entryData;
  } else {
    entries.unshift(entryData);
  }

  saveEntries();
  renderEntries(searchInput.value);
  updateStats();
  resetForm();
}

function handleDelete(id) {
  entries = entries.filter((entry) => entry.id !== id);
  saveEntries();
  renderEntries(searchInput.value);
  updateStats();

  if (entryIdInput.value === id) {
    resetForm();
  }
}

function handleEdit(id) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;
  populateForm(entry);
}

searchInput.addEventListener('input', (event) => {
  renderEntries(event.target.value);
});

newEntryBtn.addEventListener('click', () => {
  resetForm();
  titleInput.focus();
});

cancelEditBtn.addEventListener('click', () => {
  resetForm();
});

form.addEventListener('submit', handleSubmit);

entriesList.addEventListener('click', (event) => {
  const target = event.target;
  const id = target.dataset.id;

  if (!id) return;

  if (target.classList.contains('delete-btn')) {
    handleDelete(id);
  }

  if (target.classList.contains('edit-btn')) {
    handleEdit(id);
  }
});

function initialize() {
  if (!dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  if (!entries.length) {
    entriesList.innerHTML = `
      <div class="empty-state">
        <h3>No entries yet</h3>
        <p>Start writing your first memory and it will appear here.</p>
      </div>
    `;
  }

  renderEntries();
  updateStats();
}

initialize();

