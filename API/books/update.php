<?php
require_once __DIR__ . '/../controllers/BookController.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['book_id'], $data['author_id'], $data['title'])) {
    http_response_code(400);
    exit;
}

$book_id = (int) $data['book_id'];
$author_id = (int) $data['author_id'];
$title = ucwords(strtolower(trim($data['title'])));

if ($book_id <= 0 || $author_id <= 0 || empty($title)) {
    http_response_code(400);
    exit;
}

try {
    $controller = new BookController();

    $success = $controller->update($book_id, [
        'author_id' => $author_id,
        'title' => $title
    ]);

    if (!$success) {
        http_response_code(500);
        exit;
    }

    http_response_code(200);
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($e->getCode() === 404) {
        http_response_code(404);
        echo json_encode(['error' => $e->getMessage()]);
    } else {
        http_response_code(500);
        exit;
    }
}
