import type { Book, Author } from './types';

interface IterableFormData extends FormData {
    entries(): IterableIterator<[string, FormDataEntryValue]>;
}

const booksTableBody = document.querySelector<HTMLTableSectionElement>("#books-table tbody");
const bookForm = document.querySelector<HTMLFormElement>("#book-form");
const paginationDiv = document.getElementById("pagination") as HTMLDivElement | null;
const authorSelect = document.querySelector<HTMLSelectElement>("#author-select");
const searchForm = document.getElementById("search-form") as HTMLFormElement | null;
const searchInput = document.getElementById("search-input") as HTMLInputElement | null;
const noResultsMessage = document.getElementById("no-results-message") as HTMLDivElement | null;

let currentPage = 0;
const limit = 5;
let currentSearchQuery = '';
let authorOptions: Author[] = [];

async function fetchBooks(page = 0, searchQuery = '') {
    const offset = page * limit;
    const url = `/API/books/read.php?limit=${limit}&offset=${offset}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
    const totalUrl = `/API/books/count.php${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;

    try {
        const [res, totalRes] = await Promise.all([fetch(url), fetch(totalUrl)]);
        if (!res.ok || !totalRes.ok) return;

        const books: Book[] = await res.json();
        const { total } = await totalRes.json();

        renderBooks(books);
        renderPagination(Math.ceil(total / limit));
        currentPage = page;
    } catch (_) {
        if (booksTableBody) booksTableBody.innerHTML = '';
        if (noResultsMessage) noResultsMessage.style.display = 'none';
    }
}

function renderBooks(books: Book[]) {
    if (!booksTableBody) return;

    if (books.length === 0 && currentSearchQuery) {
        booksTableBody.innerHTML = '';
        if (noResultsMessage) noResultsMessage.style.display = 'block';
        return;
    }

    booksTableBody.innerHTML = books.map(book => `
    <tr data-book-id="${book.book_id}">
      <td>${book.book_id}</td>
      <td class="author_id">${book.author_id}</td>
      <td class="name">${getAuthorName(book.author_id)}</td>
      <td class="title">${book.title}</td>
      <td>
        <button onclick="startEditBook(${book.book_id})">Edit</button>
        <button onclick="deleteBook(${book.book_id})">Delete</button>
      </td>
    </tr>
  `).join('');

    if (noResultsMessage) noResultsMessage.style.display = 'none';
}

function getAuthorName(author_id: number): string {
    const author = authorOptions.find(a => a.author_id === author_id);
    return author ? author.name_author : '';
}

function renderPagination(totalPages: number) {
    if (!paginationDiv) return;

    paginationDiv.style.display = totalPages > 1 ? 'block' : 'none';
    paginationDiv.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = (i + 1).toString();
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => fetchBooks(i, currentSearchQuery);
        paginationDiv.appendChild(btn);
    }
}

(window as any).startEditBook = function (book_id: number) {
    const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
    if (!row) return;

    const authorId = row.querySelector('.author_id')?.textContent?.trim();
    const title = row.querySelector('.title')?.textContent?.trim();
    const nameCell = row.querySelector('.name');

    if (!authorId || !title || !nameCell) return;

    const select = document.createElement('select');
    authorOptions.forEach(author => {
        const option = document.createElement('option');
        option.value = String(author.author_id);
        option.textContent = author.name_author;
        if (author.author_id == Number(authorId)) option.selected = true;
        select.appendChild(option);
    });

    nameCell.innerHTML = '';
    nameCell.appendChild(select);
    (row.querySelector('.title') as HTMLTableCellElement).innerHTML = `<input type="text" value="${title}" />`;

    (row.querySelector('td:last-child') as HTMLTableCellElement).innerHTML = `
    <button onclick="saveEditBook(${book_id})">Save</button>
    <button onclick="cancelEditBook(${book_id}, '${authorId}', '${title.replace(/'/g, "\\'")}')">Cancel</button>
  `;
};

(window as any).saveEditBook = async function (book_id: number) {
    const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
    if (!row) return;

    const authorId = (row.querySelector('.name select') as HTMLSelectElement)?.value.trim();
    const title = (row.querySelector('.title input') as HTMLInputElement)?.value.trim();

    if (!authorId || !title) return;
    if (isNaN(Number(authorId)) || Number(authorId) <= 0) return;

    try {
        const res = await fetch('/API/books/update.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_id, author_id: authorId, title })
        });

        if (res.ok) fetchBooks(currentPage, currentSearchQuery);
    } catch (_) { }
};

(window as any).cancelEditBook = function (book_id: number, oldAuthorId: string, oldTitle: string) {
    const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
    if (!row) return;

    row.querySelector('.author_id')!.textContent = oldAuthorId;
    row.querySelector('.name')!.textContent = getAuthorName(Number(oldAuthorId));
    row.querySelector('.title')!.textContent = oldTitle;

    (row.querySelector('td:last-child') as HTMLTableCellElement).innerHTML = `
    <button onclick="startEditBook(${book_id})">Edit</button>
    <button onclick="deleteBook(${book_id})">Delete</button>
  `;
};

bookForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!bookForm) return;

    const formData = new FormData(bookForm) as IterableFormData;
    const data = Object.fromEntries(formData.entries());

    if (!data.author_id || !(data.title as string).trim()) return;
    if (isNaN(Number(data.author_id)) || Number(data.author_id) <= 0) return;

    try {
        const res = await fetch('/API/books/create.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            bookForm.reset();
            fetchBooks(currentPage, currentSearchQuery);
        }
    } catch (_) { }
});

(window as any).deleteBook = async function (book_id: number) {
    if (!confirm('Are you sure you want to delete?')) return;

    try {
        const res = await fetch('/API/books/delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_id })
        });

        if (res.ok) fetchBooks(currentPage, currentSearchQuery);
    } catch (_) { }
};

async function populateAuthorSelect() {
    if (!authorSelect) return;

    try {
        const res = await fetch('/API/authors/read.php?limit=9999&offset=0');
        if (!res.ok) return;

        let authors: Author[] = await res.json();
        if (!Array.isArray(authors)) authors = Object.values(authors);

        authorOptions = authors;

        authorSelect.innerHTML = '<option value="">Select an Author</option>';
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = String(author.author_id);
            option.textContent = author.name_author;
            authorSelect.appendChild(option);
        });
    } catch (_) { }
}

searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    currentSearchQuery = searchInput?.value.trim() ?? '';
    fetchBooks(0, currentSearchQuery);
});

fetchBooks();
populateAuthorSelect();