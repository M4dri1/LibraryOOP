<?php
declare(strict_types=1);

require_once __DIR__ . '/../interfaces/AuthorRepositoryInterface.php';
require_once __DIR__ . '/../config/connection.php';


class AuthorRepository implements AuthorRepositoryInterface
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = connect();
    }

    
    public function create(array $data): bool
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO authors (name_author) VALUES (:name_author)");
            $stmt->bindValue(':name_author', $data['name_author'], PDO::PARAM_STR);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("AuthorRepository::create - " . $e->getMessage());
            return false;
        }
    }

    
    public function findAll(): array
    {
        try {
            $stmt = $this->pdo->prepare("SELECT author_id, name_author FROM authors ORDER BY author_id ASC");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("AuthorRepository::findAll - " . $e->getMessage());
            return [];
        }
    }

    
    public function findWithPagination(int $limit, int $offset): array
    {
        try {
            $stmt = $this->pdo->prepare("SELECT author_id, name_author FROM authors ORDER BY author_id ASC LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("AuthorRepository::findWithPagination - " . $e->getMessage());
            return [];
        }
    }

    
    public function findById(int $id): ?array
    {
        try {
            $stmt = $this->pdo->prepare("SELECT author_id, name_author FROM authors WHERE author_id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
        } catch (PDOException $e) {
            error_log("AuthorRepository::findById - " . $e->getMessage());
            return null;
        }
    }

    
    public function update(int $id, array $data): bool
    {
        try {
            if (!$this->findById($id)) {
                return false;
            }

            $stmt = $this->pdo->prepare("UPDATE authors SET name_author = :name_author WHERE author_id = :author_id");
            return $stmt->execute([
                ':name_author' => $data['name_author'],
                ':author_id' => $id
            ]);
        } catch (PDOException $e) {
            error_log("AuthorRepository::update - " . $e->getMessage());
            return false;
        }
    }

    
    public function delete(int $id): bool
    {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM authors WHERE author_id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("AuthorRepository::delete - " . $e->getMessage());
            return false;
        }
    }

    
    public function count(): int
    {
        try {
            $stmt = $this->pdo->prepare("SELECT COUNT(*) as total FROM authors");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int) ($result['total'] ?? 0);
        } catch (PDOException $e) {
            error_log("AuthorRepository::count - " . $e->getMessage());
            return 0;
        }
    }
}

