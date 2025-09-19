<?php
require_once __DIR__ . '/../controllers/BookController.php';

header('Content-Type: application/json');

try {
    $controller = new BookController();
    $total = $controller->count();

    echo json_encode(['total' => $total]);
} catch (Exception) {
    http_response_code(response_code: 500);
    exit;
}
