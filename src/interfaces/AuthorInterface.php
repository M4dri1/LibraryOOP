<?php
declare(strict_types=1);
interface AuthorInterface
{
    public function create(array $data): bool;
    public function read(): array;
    public function readWithPagination(int $limit = 5, int $offset = 0): array;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function count(): int;
}
?>