<?php
require_once __DIR__ . '/../../../src/controllers/BookController.php';
require_once __DIR__ . '/../../../src/utils/ApiResponse.php';
header('Content-Type: application/json');
try {
    $search = $_GET['search'] ?? '';
    $controller = new BookController();
    $total = $controller->count($search);
    ApiResponse::success(['total' => $total], 'Contagem de livros recuperada com sucesso');
} catch (Exception $e) {
    error_log("BookCount Error: " . $e->getMessage());
    ApiResponse::serverError('Falha ao contar livros');
}
