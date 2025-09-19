import type { Author } from './types';

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector<HTMLTableSectionElement>("#authors tbody");
    const form = document.querySelector<HTMLFormElement>("#author-form");
    const paginationDiv = document.getElementById("pagination") as HTMLDivElement;

    let currentPage = 0;
    const limit = 5;

    async function fetchAuthors(page = 0) {
        if (!tableBody || !paginationDiv) return;
        const offset = page * limit;

        try {
            const res = await fetch(`/API/authors/read.php?limit=${limit}&offset=${offset}`);
            const totalRes = await fetch(`/API/authors/count.php`);

            if (!res.ok || !totalRes.ok) return;

            const authors: Author[] = await res.json();
            const { total } = await totalRes.json();

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
              <button onclick="startEdit(${author.author_id})">Edit</button>
              <button onclick="deleteAuthor(${author.author_id})">Delete</button>
            </td>
          </tr>
        `
                )
                .join("");

            currentPage = page;
            renderPagination(Math.ceil(total / limit));
        } catch {
            tableBody.innerHTML = `<tr><td colspan="3"></td></tr>`;
            paginationDiv.innerHTML = "";
        }
    }

    function renderPagination(totalPages: number) {
        paginationDiv.innerHTML = "";
        for (let i = 0; i < totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = (i + 1).toString();
            btn.className = i === currentPage ? "active" : "";
            btn.onclick = () => fetchAuthors(i);
            paginationDiv.appendChild(btn);
        }
    }

    (window as any).startEdit = function (author_id: number) {
        const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
        if (!row) return;

        const nameCell = row.querySelector(".name");
        const actionsCell = row.querySelector("td:last-child");
        const currentName = nameCell?.textContent ?? "";

        if (!nameCell || !actionsCell) return;

        nameCell.innerHTML = `<input type="text" value="${currentName}" />`;
        actionsCell.innerHTML = `
      <button onclick="saveEdit(${author_id})">Save</button>
      <button onclick="cancelEdit(${author_id}, '${currentName.replace(/'/g, "\\'")}')">Cancel</button>
    `;
    };

    (window as any).saveEdit = async function (author_id: number) {
        const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
        if (!row) return;

        const nameInput = row.querySelector<HTMLInputElement>(".name input");
        const updatedName = nameInput?.value.trim() ?? "";
        if (!updatedName) return;

        try {
            const res = await fetch("/API/authors/update.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author_id, name_author: updatedName }),
            });
            if (res.ok) fetchAuthors(currentPage);
        } catch { }
    };

    (window as any).cancelEdit = function (author_id: number, oldName: string) {
        const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
        if (!row) return;

        row.querySelector(".name")!.textContent = oldName;
        row.querySelector("td:last-child")!.innerHTML = `
      <button onclick="startEdit(${author_id})">Edit</button>
      <button onclick="deleteAuthor(${author_id})">Delete</button>
    `;
    };

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!form) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData as any);
        const name_author = (data.name_author as string)?.trim();

        if (!name_author) return;

        try {
            const res = await fetch("/API/authors/create.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name_author }),
            });
            if (res.ok) {
                form.reset();
                fetchAuthors(currentPage);
            }
        } catch { }
    });

    (window as any).deleteAuthor = async function (author_id: number) {
        if (!confirm("Are you sure you want to delete?")) return;

        try {
            const res = await fetch("/API/authors/delete.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author_id }),
            });
            if (res.ok) fetchAuthors(currentPage);
        } catch { }
    };

    fetchAuthors();
});
