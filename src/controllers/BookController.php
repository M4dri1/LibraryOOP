<?php
declare(strict_types=1);

require_once __DIR__ . '/../services/BookService.php';
require_once __DIR__ . '/../interfaces/BookInterface.php';

class BookController implements BookInterface
{
    private BookService $service;

    public function __construct()
    {
        $this->service = new BookService();
    }

    public function create(array $data): bool
    {
        return $this->service->create($data);
    }

    public function read(): array
    {
        return $this->service->read();
    }

    public function readWithPagination(int $limit = 5, int $offset = 0, string $search = ''): array
    {
        return $this->service->readWithPagination($limit, $offset, $search);
    }

    public function update(int $book_id, array $data): bool
    {
        return $this->service->update($book_id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->service->delete($id);
    }

    public function count(string $search = ''): int
    {
        return $this->service->count($search);
    }

    public function isRented(int $book_id): bool
    {
        return $this->service->isRented($book_id);
    }

    public function setRented(int $book_id, bool $rented): bool
    {
        return $this->service->setRented($book_id, $rented);
    }
}