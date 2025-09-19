var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#authors tbody");
    const form = document.querySelector("#author-form");
    const paginationDiv = document.getElementById("pagination");
    let currentPage = 0;
    const limit = 5;
    function fetchAuthors() {
        return __awaiter(this, arguments, void 0, function* (page = 0) {
            if (!tableBody || !paginationDiv)
                return;
            const offset = page * limit;
            try {
                const res = yield fetch(`/API/authors/read.php?limit=${limit}&offset=${offset}`);
                const totalRes = yield fetch(`/API/authors/count.php`);
                if (!res.ok || !totalRes.ok)
                    return;
                const authors = yield res.json();
                const { total } = yield totalRes.json();
                if (!Array.isArray(authors) || authors.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="3"></td></tr>`;
                    paginationDiv.innerHTML = "";
                    return;
                }
                tableBody.innerHTML = authors
                    .map((author) => `
          <tr data-author-id="${author.author_id}">
            <td>${author.author_id}</td>
            <td class="name">${author.name_author}</td>
            <td>
              <button onclick="startEdit(${author.author_id})">Edit</button>
              <button onclick="deleteAuthor(${author.author_id})">Delete</button>
            </td>
          </tr>
        `)
                    .join("");
                currentPage = page;
                renderPagination(Math.ceil(total / limit));
            }
            catch (_a) {
                tableBody.innerHTML = `<tr><td colspan="3"></td></tr>`;
                paginationDiv.innerHTML = "";
            }
        });
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
        var _a;
        const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
        if (!row)
            return;
        const nameCell = row.querySelector(".name");
        const actionsCell = row.querySelector("td:last-child");
        const currentName = (_a = nameCell === null || nameCell === void 0 ? void 0 : nameCell.textContent) !== null && _a !== void 0 ? _a : "";
        if (!nameCell || !actionsCell)
            return;
        nameCell.innerHTML = `<input type="text" value="${currentName}" />`;
        actionsCell.innerHTML = `
      <button onclick="saveEdit(${author_id})">Save</button>
      <button onclick="cancelEdit(${author_id}, '${currentName.replace(/'/g, "\\'")}')">Cancel</button>
    `;
    };
    window.saveEdit = function (author_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
            if (!row)
                return;
            const nameInput = row.querySelector(".name input");
            const updatedName = (_a = nameInput === null || nameInput === void 0 ? void 0 : nameInput.value.trim()) !== null && _a !== void 0 ? _a : "";
            if (!updatedName)
                return;
            try {
                const res = yield fetch("/API/authors/update.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ author_id, name_author: updatedName }),
                });
                if (res.ok)
                    fetchAuthors(currentPage);
            }
            catch (_b) { }
        });
    };
    window.cancelEdit = function (author_id, oldName) {
        const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
        if (!row)
            return;
        row.querySelector(".name").textContent = oldName;
        row.querySelector("td:last-child").innerHTML = `
      <button onclick="startEdit(${author_id})">Edit</button>
      <button onclick="deleteAuthor(${author_id})">Delete</button>
    `;
    };
    form === null || form === void 0 ? void 0 : form.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        e.preventDefault();
        if (!form)
            return;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const name_author = (_a = data.name_author) === null || _a === void 0 ? void 0 : _a.trim();
        if (!name_author)
            return;
        try {
            const res = yield fetch("/API/authors/create.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name_author }),
            });
            if (res.ok) {
                form.reset();
                fetchAuthors(currentPage);
            }
        }
        catch (_b) { }
    }));
    window.deleteAuthor = function (author_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!confirm("Are you sure you want to delete?"))
                return;
            try {
                const res = yield fetch("/API/authors/delete.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ author_id }),
                });
                if (res.ok)
                    fetchAuthors(currentPage);
            }
            catch (_a) { }
        });
    };
    fetchAuthors();
});
export {};
