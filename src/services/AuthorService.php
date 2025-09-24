<?php
declare(strict_types=1);
require_once __DIR__ . '/../repositories/AuthorRepository.php';
require_once __DIR__ . '/../models/Author.php';
final class AuthorService
{
    public function __construct(private AuthorRepository $repository = new AuthorRepository()) {}
    public function create(array $data): bool
    {
        if (isset($data['name_author'])) {
            $data['name_author'] = $this->normalizeName((string)$data['name_author']);
        }
        return $this->repository->create($data);
    }
    public function read(): array
    {
        return $this->repository->findAll();
    }
    public function readWithPagination(int $limit = 5, int $offset = 0): array
    {
        return $this->repository->findWithPagination($limit, $offset);
    }
    public function update(int $author_id, array $data): bool
    {
        if (isset($data['name_author'])) {
            $data['name_author'] = $this->normalizeName((string)$data['name_author']);
        }
        return $this->repository->update($author_id, $data);
    }
    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
    public function count(): int
    {
        return $this->repository->count();
    }
    private function normalizeName(string $name): string
    {
        return ucwords(strtolower(trim($name)));
    }
}
