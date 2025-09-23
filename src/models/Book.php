<?php
declare(strict_types=1);

final class Book
{
    public int $book_id;
    public int $author_id;
    public string $title;

    public function __construct(int $book_id = 0, int $author_id = 0, string $title = '')
    {
        $this->book_id = $book_id;
        $this->author_id = $author_id;
        $this->title = $title;
    }

    public static function fromArray(array $data): self
    {
        $id = isset($data['book_id']) ? (int)$data['book_id'] : 0;
        $author = isset($data['author_id']) ? (int)$data['author_id'] : 0;
        $title = isset($data['title']) ? (string)$data['title'] : '';
        return new self($id, $author, $title);
    }

    public function toArray(): array
    {
        return [
            'book_id' => $this->book_id,
            'author_id' => $this->author_id,
            'title' => $this->title,
        ];
    }
}
