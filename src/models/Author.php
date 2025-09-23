<?php
declare(strict_types=1);

final class Author
{
    public int $author_id;
    public string $name_author;

    public function __construct(int $author_id = 0, string $name_author = '')
    {
        $this->author_id = $author_id;
        $this->name_author = $name_author;
    }

    public static function fromArray(array $data): self
    {
        $id = isset($data['author_id']) ? (int)$data['author_id'] : 0;
        $name = isset($data['name_author']) ? (string)$data['name_author'] : '';
        return new self($id, $name);
    }

    public function toArray(): array
    {
        return [
            'author_id' => $this->author_id,
            'name_author' => $this->name_author,
        ];
    }
}
