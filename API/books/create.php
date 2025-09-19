<?php
require_once __DIR__ . '/../controllers/BookController.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$author_id = $data['author_id'] ?? null;
$title = $data['title'] ?? null;

if (!$author_id || !$title) {
    http_response_code(400);
    exit;
}

$data['title'] = ucwords(strtolower(trim($title)));

try {
    $controller = new BookController();
    $success = $controller->create($data);

    if (!$success) {
        http_response_code(500);
        exit;
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    exit;
}
