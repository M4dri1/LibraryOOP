<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once __DIR__ . '/../controllers/AuthorController.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name_author']) || empty(trim($data['name_author']))) {
    http_response_code(400);
    exit;
}

$data['name_author'] = ucwords(strtolower(trim($data['name_author'])));

try {
    $controller = new AuthorController();
    $success = $controller->create($data);

    if (!$success) {
        http_response_code(500);
        exit;
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    error_log('Erro interno: ' . $e->getMessage());
    http_response_code(500);
    exit;
}
