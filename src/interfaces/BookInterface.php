<?php
interface BookInterface
{
    public function create(array $data): bool;
    public function read(): array;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function count(string $search = ''): int;
}
?>