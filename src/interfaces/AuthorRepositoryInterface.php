<?php
declare(strict_types=1);
interface AuthorRepositoryInterface
{
    public function create(array $data): bool;
    public function findAll(): array;
    public function findWithPagination(int $limit, int $offset): array;
    public function findById(int $id): ?array;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function count(): int;
}
