<?php
declare(strict_types=1);
require_once __DIR__ . '/../../../src/controllers/AuthorController.php';
require_once __DIR__ . '/../../../src/utils/ApiResponse.php';
header('Content-Type: application/json');
try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        ApiResponse::validationError('Formato JSON inválido');
        exit;
    }
    $author_id = $input['author_id'];
    if (empty($author_id) || !is_numeric($author_id) || $author_id <= 0) {
        ApiResponse::validationError('ID de autor válido é obrigatório', ['author_id' => 'ID do autor deve ser um número positivo']);
        exit;
    }
    $controller = new AuthorController();
    $result = $controller->delete($author_id);
    if ($result) {
        ApiResponse::success(null, 'Autor excluído com sucesso');
    } else {
        ApiResponse::notFound('Autor não encontrado ou falha na exclusão');
    }
} catch (Exception $e) {
    error_log("AuthorDelete Error: " . $e->getMessage());
    ApiResponse::serverError('Erro do servidor ao excluir autor');
}
