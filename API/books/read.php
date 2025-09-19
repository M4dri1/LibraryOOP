<?php
require_once __DIR__ . '/../controllers/BookController.php';
header('Content-Type: application/json');

$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 5;
$offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
$search = $_GET['search'] ?? '';

try {
    $controller = new BookController();
    $books = $controller->read($limit, $offset, $search);

    echo json_encode($books);
} catch (Exception $e) {
    http_response_code(500);
    exit;
}
