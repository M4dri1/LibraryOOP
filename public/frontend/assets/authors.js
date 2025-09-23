document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#authors tbody");
    const form = document.querySelector("#author-form");
    const paginationDiv = document.getElementById("pagination");
    const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.apiBase) || '/api';

    let currentPage = 0;
    const limit = 5;

    async function fetchAuthors(page = 0) {
        if (!tableBody || !paginationDiv) return;
        const offset = page * limit;

        try {
            const res = await fetch(`${API_BASE}/authors/read.php?limit=${limit}&offset=${offset}`);
            const totalRes = await fetch(`${API_BASE}/authors/count.php`);

            if (!res.ok || !totalRes.ok) throw new Error('Falha ao buscar autores');

            const authorsResponse = await res.json();
            const totalResponse = await totalRes.json();

            const authors = authorsResponse.success ? authorsResponse.data : authorsResponse;
            const total = totalResponse.success ? totalResponse.data.total : totalResponse.total;

            if (!Array.isArray(authors) || authors.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3"></td></tr>`;
                paginationDiv.innerHTML = "";
                return;
            }

            tableBody.innerHTML = authors
                .map(
                    (author) => `
          <tr data-author-id="${author.author_id}">
            <td>${author.author_id}</td>
            <td class="name">${author.name_author}</td>
            <td>
              <button class="icon-btn edit" aria-label="Editar" title="Editar" onclick="startEdit(${author.author_id})">✏️</button>
              <button class="icon-btn delete" aria-label="Excluir" title="Excluir" onclick="deleteAuthor(${author.author_id})">🗑️</button>
            </td>
          </tr>
        `
                )
                .join("");

            currentPage = page;
            renderPagination(Math.ceil(total / limit));
        } catch (err) {
            tableBody.innerHTML = `<tr><td colspan="3"></td></tr>`;
            paginationDiv.innerHTML = "";
            console.error(err);
        }
    }

    function renderPagination(totalPages) {
        paginationDiv.innerHTML = "";
        for (let i = 0; i < totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = (i + 1).toString();
            btn.className = i === currentPage ? "active" : "";
            btn.onclick = () => fetchAuthors(i);
            paginationDiv.appendChild(btn);
        }
    }

    window.startEdit = function (author_id) {
        const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
        if (!row) return;

        const nameCell = row.querySelector(".name");
        const actionsCell = row.querySelector("td:last-child");
        const currentName = nameCell?.textContent ?? "";

        if (!nameCell || !actionsCell) return;

        nameCell.innerHTML = `<input type="text" value="${currentName}" />`;
        actionsCell.innerHTML = `
      <button class="icon-btn save" aria-label="Salvar" title="Salvar" onclick="saveEdit(${author_id})">💾</button>
      <button class="icon-btn cancel" aria-label="Cancelar" title="Cancelar" onclick="cancelEdit(${author_id}, '${currentName.replace(/'/g, "\\'")}')">↩️</button>
    `;
    };

    window.saveEdit = async function (author_id) {
        const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
        if (!row) return;

        const nameInput = row.querySelector(".name input");
        const updatedName = nameInput?.value.trim() ?? "";
        if (!updatedName) return;

        try {
            const res = await fetch(`${API_BASE}/authors/update.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author_id, name_author: updatedName }),
            });
            if (!res.ok) throw new Error('Falha ao atualizar autor');
            UI.showToast('success', 'Autor atualizado com sucesso.');
            fetchAuthors(currentPage);
        } catch (err) { console.error(err); UI.showToast('error', 'Erro ao atualizar autor.'); }
    };

    window.cancelEdit = function (author_id, oldName) {
        const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
        if (!row) return;

        row.querySelector(".name").textContent = oldName;
        row.querySelector("td:last-child").innerHTML = `
      <button class="icon-btn edit" aria-label="Editar" title="Editar" onclick="startEdit(${author_id})">✏️</button>
      <button class="icon-btn delete" aria-label="Excluir" title="Excluir" onclick="deleteAuthor(${author_id})">🗑️</button>
    `;
    };

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!form) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const name_author = data.name_author?.trim();

        if (!name_author) return;

        try {
            const res = await fetch(`${API_BASE}/authors/create.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name_author }),
            });
            if (!res.ok) throw new Error('Falha ao criar autor');
            UI.showToast('success', 'Autor adicionado com sucesso.');
            form.reset();
            fetchAuthors(currentPage);
            
        } catch (err) { console.error(err); UI.showToast('error', 'Erro ao adicionar autor.'); }
    });

    window.deleteAuthor = async function (author_id) {
        const ok = await UI.confirmModal('Tem certeza que deseja excluir este autor?');
        if (!ok) return;

        try {
            const res = await fetch(`${API_BASE}/authors/delete.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author_id }),
            });
            if (!res.ok) throw new Error('Falha ao excluir autor');
            UI.showToast('success', 'Autor excluído com sucesso.');
            fetchAuthors(currentPage);
        } catch (err) { console.error(err); UI.showToast('error', 'Erro ao excluir autor.'); }
    };

    fetchAuthors();
});
