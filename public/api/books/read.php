<?php
declare(strict_types=1);
require_once __DIR__ . '/../../../src/controllers/BookController.php';
require_once __DIR__ . '/../../../src/utils/ApiResponse.php';
header('Content-Type: application/json');

try {
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 5;
    $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
    $search = $_GET['search'] ?? '';

    if ($limit <= 0 || $limit > 100) {
        ApiResponse::validationError('Limite deve estar entre 1 e 100');
        exit;
    }

    if ($offset < 0) {
        ApiResponse::validationError('Offset deve ser não negativo');
        exit;
    }

    $controller = new BookController();
    $result = $controller->readWithPagination($limit, $offset, $search);

    ApiResponse::success($result, 'Livros recuperados com sucesso');

} catch (Exception $e) {
    error_log("BookRead Error: " . $e->getMessage());
    ApiResponse::serverError('Erro do servidor ao recuperar livros');
}
