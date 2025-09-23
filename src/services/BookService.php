<?php
declare(strict_types=1);

require_once __DIR__ . '/../repositories/BookRepository.php';
require_once __DIR__ . '/../models/Book.php';


final class BookService
{
    
    public function __construct(private BookRepository $repository = new BookRepository()) {}

    
    public function create(array $data): bool
    {
        if (isset($data['title'])) {
            $data['title'] = $this->normalizeTitle((string)$data['title']);
        }
        if (isset($data['author_id'])) {
            $data['author_id'] = (int)$data['author_id'];
        }
        return $this->repository->create($data);
    }

    
    public function read(): array
    {
        return $this->repository->findAll();
    }

    
    public function readWithPagination(int $limit = 5, int $offset = 0, string $search = ''): array
    {
        $limit = max(1, $limit);
        $offset = max(0, $offset);
        $search = trim($search);
        return $this->repository->findWithPagination($limit, $offset, $search);
    }

    
    public function update(int $book_id, array $data): bool
    {
        if (isset($data['title'])) {
            $data['title'] = $this->normalizeTitle((string)$data['title']);
        }
        if (isset($data['author_id'])) {
            $data['author_id'] = (int)$data['author_id'];
        }
        return $this->repository->update($book_id, $data);
    }

    
    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    
    public function count(string $search = ''): int
    {
        $search = trim($search);
        return $this->repository->count($search);
    }

    
    private function normalizeTitle(string $title): string
    {
        return ucwords(strtolower(trim($title)));
    }

    
    public function isRented(int $book_id): bool
    {
        return $this->repository->isRented($book_id);
    }

    
    public function setRented(int $book_id, bool $rented): bool
    {
        return $this->repository->setRented($book_id, $rented);
    }
}
