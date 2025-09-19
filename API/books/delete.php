<?php
require_once __DIR__ . '/../controllers/BookController.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$book_id = $data['book_id'] ?? null;

if (!$book_id) {
    http_response_code(400);
    exit;
}

try {
    $controller = new BookController();
    $success = $controller->delete((int) $book_id);

    if (!$success) {
        http_response_code(500);
        exit;
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    exit;
}
