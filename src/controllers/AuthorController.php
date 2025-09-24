<?php
declare(strict_types=1);
require_once __DIR__ . '/../services/AuthorService.php';
require_once __DIR__ . '/../interfaces/AuthorInterface.php';
class AuthorController implements AuthorInterface
{
    private AuthorService $service;
    public function __construct()
    {
        $this->service = new AuthorService();
    }
    public function create(array $data): bool
    {
        return $this->service->create($data);
    }
    public function read(): array
    {
        return $this->service->read();
    }
    public function readWithPagination(int $limit = 5, int $offset = 0): array
    {
        return $this->service->readWithPagination($limit, $offset);
    }
    public function update(int $author_id, array $data): bool
    {
        return $this->service->update($author_id, $data);
    }
    public function delete(int $id): bool
    {
        return $this->service->delete($id);
    }
    public function count(): int
    {
        return $this->service->count();
    }
}