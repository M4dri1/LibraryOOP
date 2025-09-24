<?php
require_once __DIR__ . '/../../../src/controllers/AuthorController.php';
require_once __DIR__ . '/../../../src/utils/ApiResponse.php';
header('Content-Type: application/json');
try {
    $controller = new AuthorController();
    $total = $controller->count();
    ApiResponse::success(['total' => $total], 'Contagem de autores recuperada com sucesso');
} catch (Exception $e) {
    error_log("AuthorCount Error: " . $e->getMessage());
    ApiResponse::serverError('Falha ao contar autores');
}
