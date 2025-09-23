<?php
declare(strict_types=1);

require_once __DIR__ . '/../interfaces/BookRepositoryInterface.php';
require_once __DIR__ . '/../config/connection.php';


class BookRepository implements BookRepositoryInterface
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = connect();
    }

    public function create(array $data): bool
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO books (title, author_id) VALUES (:title, :author_id)");
            $stmt->bindValue(':title', $data['title'], PDO::PARAM_STR);
            $stmt->bindValue(':author_id', $data['author_id'], PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("BookRepository::create - " . $e->getMessage());
            return false;
        }
    }

    
    public function findAll(): array
    {
        try {
            $stmt = $this->pdo->prepare("SELECT 
                                            b.book_id, 
                                            b.author_id, 
                                            a.name_author AS author_name, 
                                            b.title,
                                            EXISTS(SELECT 1 FROM loans l WHERE l.book_id = b.book_id) AS rented
                                         FROM books b 
                                         JOIN authors a ON b.author_id = a.author_id 
                                         ORDER BY b.book_id ASC");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("BookRepository::findAll - " . $e->getMessage());
            return [];
        }
    }

    
    public function findWithPagination(int $limit, int $offset, string $search = ''): array
    {
        try {
            if ($search) {
                $stmt = $this->pdo->prepare("SELECT 
                                                b.book_id, 
                                                b.author_id, 
                                                a.name_author AS author_name, 
                                                b.title,
                                                EXISTS(SELECT 1 FROM loans l WHERE l.book_id = b.book_id) AS rented
                                             FROM books b 
                                             JOIN authors a ON b.author_id = a.author_id 
                                             WHERE b.title LIKE :search 
                                             ORDER BY b.book_id ASC 
                                             LIMIT :limit OFFSET :offset");
                $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
            } else {
                $stmt = $this->pdo->prepare("SELECT 
                                                b.book_id, 
                                                b.author_id, 
                                                a.name_author AS author_name, 
                                                b.title,
                                                EXISTS(SELECT 1 FROM loans l WHERE l.book_id = b.book_id) AS rented
                                             FROM books b 
                                             JOIN authors a ON b.author_id = a.author_id 
                                             ORDER BY b.book_id ASC 
                                             LIMIT :limit OFFSET :offset");
            }

            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("BookRepository::findWithPagination - " . $e->getMessage());
            return [];
        }
    }

    
    public function findById(int $id): ?array
    {
        try {
            $stmt = $this->pdo->prepare("SELECT 
                                            b.book_id, 
                                            b.author_id, 
                                            a.name_author AS author_name, 
                                            b.title,
                                            EXISTS(SELECT 1 FROM loans l WHERE l.book_id = b.book_id) AS rented
                                         FROM books b 
                                         JOIN authors a ON b.author_id = a.author_id 
                                         WHERE b.book_id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
        } catch (PDOException $e) {
            error_log("BookRepository::findById - " . $e->getMessage());
            return null;
        }
    }

    public function update(int $id, array $data): bool
    {
        try {
            if (!$this->findById($id)) {
                return false;
            }

            $stmt = $this->pdo->prepare("UPDATE books SET author_id = :author_id, title = :title WHERE book_id = :book_id");
            return $stmt->execute([
                ':author_id' => $data['author_id'],
                ':title' => $data['title'],
                ':book_id' => $id
            ]);
        } catch (PDOException $e) {
            error_log("BookRepository::update - " . $e->getMessage());
            return false;
        }
    }

    
    public function delete(int $id): bool
    {
        try {
            $check = $this->pdo->prepare("SELECT 1 FROM loans WHERE book_id = :id LIMIT 1");
            $check->bindValue(':id', $id, PDO::PARAM_INT);
            $check->execute();
            if ($check->fetchColumn()) {
                return false;
            }
            $stmt = $this->pdo->prepare("DELETE FROM books WHERE book_id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("BookRepository::delete - " . $e->getMessage());
            return false;
        }
    }

    
    public function count(string $search = ''): int
    {
        try {
            if ($search) {
                $stmt = $this->pdo->prepare("SELECT COUNT(*) as total FROM books WHERE title LIKE :search");
                $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
            } else {
                $stmt = $this->pdo->prepare("SELECT COUNT(*) as total FROM books");
            }
            
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int) ($result['total'] ?? 0);
        } catch (PDOException $e) {
            error_log("BookRepository::count - " . $e->getMessage());
            return 0;
        }
    }

    
    public function isRented(int $id): bool
    {
        try {
            $stmt = $this->pdo->prepare("SELECT EXISTS(SELECT 1 FROM loans WHERE book_id = :id) AS rented");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return (bool)($row['rented'] ?? false);
        } catch (PDOException $e) {
            error_log("BookRepository::isRented - " . $e->getMessage());
            return false;
        }
    }

    
    public function setRented(int $id, bool $rented): bool
    {
        try {
            if ($rented) {
                if ($this->isRented($id)) return true;
                $stmt = $this->pdo->prepare("INSERT INTO loans (user_id, book_id, loan_date) VALUES (NULL, :id, NOW())");
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
                return $stmt->execute();
            } else {
                $stmt = $this->pdo->prepare("DELETE FROM loans WHERE book_id = :id");
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
                $stmt->execute();
                return true;
            }
        } catch (PDOException $e) {
            error_log("BookRepository::setRented - " . $e->getMessage());
            return false;
        }
    }
}

