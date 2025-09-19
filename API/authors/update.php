<?php
require_once __DIR__ . '/../controllers/AuthorController.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['author_id'], $data['name_author']) || empty(trim($data['name_author']))) {
    http_response_code(400);
    exit;
}

$author_id = (int) $data['author_id'];
$name_author = ucwords(strtolower(trim($data['name_author'])));
$data['name_author'] = $name_author;

try {
    $controller = new AuthorController();
    $success = $controller->update($author_id, $data);
    echo json_encode(['success' => $success]);
} catch (Exception $e) {
    http_response_code(500);
    exit;
}