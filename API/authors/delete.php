<?php
require_once __DIR__ . '/../controllers/AuthorController.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['author_id'])) {
    http_response_code(400);
    exit;
}

try {
    $controller = new AuthorController();
    $success = $controller->delete((int) $data['author_id']);
    echo json_encode(['success' => $success]);
} catch (Exception $e) {
    http_response_code(500);
    exit;
}
