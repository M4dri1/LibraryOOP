<?php
declare(strict_types=1);

interface BookRepositoryInterface
{
    public function create(array $data): bool;
    public function findAll(): array;
    public function findWithPagination(int $limit, int $offset, string $search = ''): array;
    public function findById(int $id): ?array;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function count(string $search = ''): int;
    public function isRented(int $id): bool;
    public function setRented(int $id, bool $rented): bool;
}
