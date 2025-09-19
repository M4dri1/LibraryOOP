<?php
require_once __DIR__ . '/../controllers/AuthorController.php';
header('Content-Type: application/json');

try {
    $controller = new AuthorController();
    $total = $controller->count();
    echo json_encode(['total' => $total]);
} catch (Exception $e) {
    http_response_code(500);
    exit;
}
