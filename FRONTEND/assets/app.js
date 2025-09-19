var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const booksTableBody = document.querySelector("#books-table tbody");
const bookForm = document.querySelector("#book-form");
const paginationDiv = document.getElementById("pagination");
const authorSelect = document.querySelector("#author-select");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const noResultsMessage = document.getElementById("no-results-message");
let currentPage = 0;
const limit = 5;
let currentSearchQuery = '';
let authorOptions = [];
function fetchBooks() {
    return __awaiter(this, arguments, void 0, function* (page = 0, searchQuery = '') {
        const offset = page * limit;
        const url = `/API/books/read.php?limit=${limit}&offset=${offset}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
        const totalUrl = `/API/books/count.php${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
        try {
            const [res, totalRes] = yield Promise.all([fetch(url), fetch(totalUrl)]);
            if (!res.ok || !totalRes.ok)
                return;
            const books = yield res.json();
            const { total } = yield totalRes.json();
            renderBooks(books);
            renderPagination(Math.ceil(total / limit));
            currentPage = page;
        }
        catch (_) {
            if (booksTableBody)
                booksTableBody.innerHTML = '';
            if (noResultsMessage)
                noResultsMessage.style.display = 'none';
        }
    });
}
function renderBooks(books) {
    if (!booksTableBody)
        return;
    if (books.length === 0 && currentSearchQuery) {
        booksTableBody.innerHTML = '';
        if (noResultsMessage)
            noResultsMessage.style.display = 'block';
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
    if (noResultsMessage)
        noResultsMessage.style.display = 'none';
}
function getAuthorName(author_id) {
    const author = authorOptions.find(a => a.author_id === author_id);
    return author ? author.name_author : '';
}
function renderPagination(totalPages) {
    if (!paginationDiv)
        return;
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
window.startEditBook = function (book_id) {
    var _a, _b, _c, _d;
    const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
    if (!row)
        return;
    const authorId = (_b = (_a = row.querySelector('.author_id')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
    const title = (_d = (_c = row.querySelector('.title')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim();
    const nameCell = row.querySelector('.name');
    if (!authorId || !title || !nameCell)
        return;
    const select = document.createElement('select');
    authorOptions.forEach(author => {
        const option = document.createElement('option');
        option.value = String(author.author_id);
        option.textContent = author.name_author;
        if (author.author_id == Number(authorId))
            option.selected = true;
        select.appendChild(option);
    });
    nameCell.innerHTML = '';
    nameCell.appendChild(select);
    row.querySelector('.title').innerHTML = `<input type="text" value="${title}" />`;
    row.querySelector('td:last-child').innerHTML = `
    <button onclick="saveEditBook(${book_id})">Save</button>
    <button onclick="cancelEditBook(${book_id}, '${authorId}', '${title.replace(/'/g, "\\'")}')">Cancel</button>
  `;
};
window.saveEditBook = function (book_id) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
        if (!row)
            return;
        const authorId = (_a = row.querySelector('.name select')) === null || _a === void 0 ? void 0 : _a.value.trim();
        const title = (_b = row.querySelector('.title input')) === null || _b === void 0 ? void 0 : _b.value.trim();
        if (!authorId || !title)
            return;
        if (isNaN(Number(authorId)) || Number(authorId) <= 0)
            return;
        try {
            const res = yield fetch('/API/books/update.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ book_id, author_id: authorId, title })
            });
            if (res.ok)
                fetchBooks(currentPage, currentSearchQuery);
        }
        catch (_) { }
    });
};
window.cancelEditBook = function (book_id, oldAuthorId, oldTitle) {
    const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
    if (!row)
        return;
    row.querySelector('.author_id').textContent = oldAuthorId;
    row.querySelector('.name').textContent = getAuthorName(Number(oldAuthorId));
    row.querySelector('.title').textContent = oldTitle;
    row.querySelector('td:last-child').innerHTML = `
    <button onclick="startEditBook(${book_id})">Edit</button>
    <button onclick="deleteBook(${book_id})">Delete</button>
  `;
};
bookForm === null || bookForm === void 0 ? void 0 : bookForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    if (!bookForm)
        return;
    const formData = new FormData(bookForm);
    const data = Object.fromEntries(formData.entries());
    if (!data.author_id || !data.title.trim())
        return;
    if (isNaN(Number(data.author_id)) || Number(data.author_id) <= 0)
        return;
    try {
        const res = yield fetch('/API/books/create.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            bookForm.reset();
            fetchBooks(currentPage, currentSearchQuery);
        }
    }
    catch (_) { }
}));
window.deleteBook = function (book_id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm('Are you sure you want to delete?'))
            return;
        try {
            const res = yield fetch('/API/books/delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ book_id })
            });
            if (res.ok)
                fetchBooks(currentPage, currentSearchQuery);
        }
        catch (_) { }
    });
};
function populateAuthorSelect() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!authorSelect)
            return;
        try {
            const res = yield fetch('/API/authors/read.php?limit=9999&offset=0');
            if (!res.ok)
                return;
            let authors = yield res.json();
            if (!Array.isArray(authors))
                authors = Object.values(authors);
            authorOptions = authors;
            authorSelect.innerHTML = '<option value="">Select an Author</option>';
            authors.forEach(author => {
                const option = document.createElement('option');
                option.value = String(author.author_id);
                option.textContent = author.name_author;
                authorSelect.appendChild(option);
            });
        }
        catch (_) { }
    });
}
searchForm === null || searchForm === void 0 ? void 0 : searchForm.addEventListener('submit', (e) => {
    var _a;
    e.preventDefault();
    currentSearchQuery = (_a = searchInput === null || searchInput === void 0 ? void 0 : searchInput.value.trim()) !== null && _a !== void 0 ? _a : '';
    fetchBooks(0, currentSearchQuery);
});
fetchBooks();
populateAuthorSelect();
export {};
