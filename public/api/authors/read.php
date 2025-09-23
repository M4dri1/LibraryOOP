<?php
declare(strict_types=1);
require_once __DIR__ . '/../../../src/controllers/AuthorController.php';
require_once __DIR__ . '/../../../src/utils/ApiResponse.php';

header('Content-Type: application/json');

try {
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 5;
    $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;

    if ($limit <= 0 || $limit > 10000) {
        ApiResponse::validationError('Limite deve estar entre 1 e 10000');
        exit;
    }

    if ($offset < 0) {
        ApiResponse::validationError('Offset deve ser não negativo');
        exit;
    }

    $controller = new AuthorController();
    $result = $controller->readWithPagination($limit, $offset);

    ApiResponse::success($result, 'Autores recuperados com sucesso');

} catch (Exception $e) {
    error_log("AuthorRead Error: " . $e->getMessage());
    ApiResponse::serverError('Erro do servidor ao recuperar autores');
}
