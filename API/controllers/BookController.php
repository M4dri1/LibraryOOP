<?php

require_once __DIR__ . '/../DB/connection.php';
require_once __DIR__ . '/../interfaces/BookInterface.php';

class BookController implements book
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = connect();
    }

    public function create(array $data): bool
    {
        $stmt = $this->pdo->prepare("INSERT INTO books (title, author_id) VALUES (:title, :author_id)");
        $stmt->bindValue(':title', $data['title']);
        $stmt->bindValue(':author_id', $data['author_id']);
        return $stmt->execute();
    }

    public function read(int $limit = 5, int $offset = 0, string $search = ''): array
    {
        if ($search) {
            $stmt = $this->pdo->prepare("SELECT b.book_id, b.author_id, a.name_author AS author_name, b.title 
                                         FROM books b 
                                         JOIN authors a ON b.author_id = a.author_id 
                                         WHERE b.title LIKE :search 
                                         ORDER BY b.book_id ASC 
                                         LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
        } else {
            $stmt = $this->pdo->prepare("SELECT b.book_id, b.author_id, a.name_author AS author_name, b.title 
                                         FROM books b 
                                         JOIN authors a ON b.author_id = a.author_id 
                                         ORDER BY b.book_id ASC 
                                         LIMIT :limit OFFSET :offset");
        }

        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update(int $book_id, array $data): bool
    {
        $check = $this->pdo->prepare("SELECT COUNT(*) FROM books WHERE book_id = ?");
        $check->execute([$book_id]);

        if ($check->fetchColumn() == 0) {
            return false;
        }

        $stmt = $this->pdo->prepare("UPDATE books SET author_id = :author_id, title = :title WHERE book_id = :book_id");
        return $stmt->execute([
            ':author_id' => $data['author_id'],
            ':title' => $data['title'],
            ':book_id' => $book_id
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM books WHERE book_id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function count(): int
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) as total FROM books");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) ($result['total'] ?? 0);
    }
}