const booksTableBody = document.querySelector("#books-table tbody");
const bookForm = document.querySelector("#book-form");
const paginationDiv = document.getElementById("pagination");
const authorSelect = document.querySelector("#author-select");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const noResultsMessage = document.getElementById("no-results-message");
const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.apiBase) || '/api';

let currentPage = 0;
const limit = 5;
let currentSearchQuery = '';
let authorOptions = [];

async function fetchBooks(page = 0, searchQuery = '') {
    const offset = page * limit;
    const url = `${API_BASE}/books/read.php?limit=${limit}&offset=${offset}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
    const totalUrl = `${API_BASE}/books/count.php${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;

    try {
        const [res, totalRes] = await Promise.all([fetch(url), fetch(totalUrl)]);
        if (!res.ok || !totalRes.ok) throw new Error('Falha ao buscar livros');

        const booksResponse = await res.json();
        const totalResponse = await totalRes.json();

        const books = booksResponse.success ? booksResponse.data : booksResponse;
        const total = totalResponse.success ? totalResponse.data.total : totalResponse.total;

        renderBooks(books);
        renderPagination(Math.ceil(total / limit));
        currentPage = page;
    } catch (err) {
        if (booksTableBody) booksTableBody.innerHTML = '';
        if (noResultsMessage) noResultsMessage.style.display = 'none';
        console.error(err);
    }
}

function renderBooks(books) {
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
      <td class="rented">${book.rented ? 'Sim' : 'Não'}</td>
      <td>
        <span class="actions">
          <button class="icon-btn rent" aria-label="${book.rented ? 'Devolver' : 'Alugar'}" title="${book.rented ? 'Devolver' : 'Alugar'}" onclick="toggleRent(${book.book_id}, ${book.rented ? 'true' : 'false'})">${book.rented ? '🔄' : '📚'}</button>
          <button class="icon-btn edit" aria-label="Editar" title="Editar" onclick="startEditBook(${book.book_id})">✏️</button>
          <button class="icon-btn delete" aria-label="Excluir" title="${book.rented ? 'Não é possível excluir: livro alugado' : 'Excluir'}" onclick="deleteBook(${book.book_id})" ${book.rented ? 'disabled' : ''}>🗑️</button>
        </span>
      </td>
    </tr>
  `).join('');

    if (noResultsMessage) noResultsMessage.style.display = 'none';
}

function getAuthorName(author_id) {
    const author = authorOptions.find(a => a.author_id === author_id);
    return author ? author.name_author : '';
}

function renderPagination(totalPages) {
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

window.startEditBook = function (book_id) {
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
    row.querySelector('.title').innerHTML = `<input type="text" value="${title}" />`;

    row.querySelector('td:last-child').innerHTML = `
    <button class="icon-btn save" aria-label="Salvar" title="Salvar" onclick="saveEditBook(${book_id})">💾</button>
    <button class="icon-btn cancel" aria-label="Cancelar" title="Cancelar" onclick="cancelEditBook(${book_id}, '${authorId}', '${title.replace(/'/g, "\\'")}')">↩️</button>
  `;
};

window.saveEditBook = async function (book_id) {
    const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
    if (!row) return;

    const authorId = row.querySelector('.name select')?.value.trim();
    const title = row.querySelector('.title input')?.value.trim();

    if (!authorId || !title) return;
    if (isNaN(Number(authorId)) || Number(authorId) <= 0) return;

    try {
        const res = await fetch(`${API_BASE}/books/update.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_id, author_id: authorId, title })
        });

        if (!res.ok) throw new Error('Falha ao atualizar livro');
        UI.showToast('success', 'Livro atualizado com sucesso.');
        fetchBooks(currentPage, currentSearchQuery);
    } catch (err) { console.error(err); UI.showToast('error', 'Erro ao atualizar livro.'); }
};

window.cancelEditBook = function (book_id, oldAuthorId, oldTitle) {
    const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
    if (!row) return;

    row.querySelector('.author_id').textContent = oldAuthorId;
    row.querySelector('.name').textContent = getAuthorName(Number(oldAuthorId));
    row.querySelector('.title').textContent = oldTitle;

    fetchBooks(currentPage, currentSearchQuery);
};

bookForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!bookForm) return;

    const formData = new FormData(bookForm);
    const data = Object.fromEntries(formData.entries());

    if (!data.author_id || !data.title.trim()) return;
    if (isNaN(Number(data.author_id)) || Number(data.author_id) <= 0) return;

    try {
        const res = await fetch(`${API_BASE}/books/create.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error('Falha ao criar livro');
        UI.showToast('success', 'Livro adicionado com sucesso.');
        bookForm.reset();
        fetchBooks(currentPage, currentSearchQuery);
        
    } catch (err) { console.error(err); UI.showToast('error', 'Erro ao adicionar livro.'); }
});

window.deleteBook = async function (book_id) {
    const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
    const rentedCell = row?.querySelector('.rented');
    const isRented = rentedCell ? rentedCell.textContent.trim().toLowerCase() === 'sim' : false;
    if (isRented) {
        UI.showToast('error', 'Livro está alugado e não pode ser excluído.');
        return;
    }
    const ok = await UI.confirmModal('Tem certeza que deseja excluir este livro?');
    if (!ok) return;
    try {
        const res = await fetch(`${API_BASE}/books/delete.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_id })
        });

        if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            const msg = payload?.message || 'Falha ao excluir livro';
            throw new Error(msg);
        }
        UI.showToast('success', 'Livro excluído com sucesso.');
        fetchBooks(currentPage, currentSearchQuery);
    } catch (err) { console.error(err); UI.showToast('error', (err && err.message) || 'Erro ao excluir livro.'); }
};

window.toggleRent = async function (book_id, currentlyRented) {
    try {
        const desired = !currentlyRented;
        const res = await fetch(`${API_BASE}/books/toggle_rent.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_id, rented: desired })
        });
        if (!res.ok) throw new Error('Falha ao atualizar aluguel');
        UI.showToast('success', desired ? 'Livro alugado com sucesso.' : 'Livro devolvido com sucesso.');
        fetchBooks(currentPage, currentSearchQuery);
    } catch (err) {
        console.error(err);
        UI.showToast('error', 'Erro ao atualizar estado de aluguel.');
    }
};

async function populateAuthorSelect() {
    if (!authorSelect) return;

    try {
        const res = await fetch(`${API_BASE}/authors/read.php?limit=9999&offset=0`);
        if (!res.ok) throw new Error('Falha ao carregar autores');

        const authorsResponse = await res.json();
        
        let authors = authorsResponse.success ? authorsResponse.data : authorsResponse;
        if (!Array.isArray(authors)) authors = Object.values(authors);

        authorOptions = authors;

        authorSelect.innerHTML = '<option value="">Selecione um Autor</option>';
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = String(author.author_id);
            option.textContent = author.name_author;
            authorSelect.appendChild(option);
        });
    } catch (err) { console.error(err); }
}

searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    currentSearchQuery = searchInput?.value.trim() ?? '';
    fetchBooks(0, currentSearchQuery);
});

async function initializeApp() {
    await populateAuthorSelect();
    fetchBooks();
}

initializeApp();
