<?php

require_once __DIR__ . '/../DB/connection.php';
require_once __DIR__ . '/../interfaces/AuthorInterface.php';

class AuthorController implements author
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = connect();
    }

    public function create(array $data): bool
    {
        $stmt = $this->pdo->prepare("INSERT INTO authors (name_author) VALUES (:name_author)");
        $stmt->bindValue(':name_author', $data['name_author']);
        return $stmt->execute();
    }

    public function read(int $limit = 5, int $offset = 0, string $search = ''): array
    {
        if ($search) {
            $stmt = $this->pdo->prepare("SELECT author_id, name_author FROM authors WHERE name_author LIKE :search LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
        } else {
            $stmt = $this->pdo->prepare("SELECT author_id, name_author FROM authors LIMIT :limit OFFSET :offset");
        }

        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update(int $author_id, array $data): bool
    {
        $check = $this->pdo->prepare("SELECT COUNT(*) FROM authors WHERE author_id = ?");
        $check->execute([$author_id]);

        if ($check->fetchColumn() == 0) {
            return false;
        }

        $stmt = $this->pdo->prepare("UPDATE authors SET name_author = :name_author WHERE author_id = :author_id");
        return $stmt->execute([
            ':name_author' => $data['name_author'],
            ':author_id' => $author_id
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM authors WHERE author_id = :author_id");
        $stmt->bindValue(':author_id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function count(): int
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) AS total FROM authors");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) ($row['total'] ?? 0);
    }
}