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

    if (empty($input['author_id']) || empty($input['name_author'])) {
        ApiResponse::validationError('ID do autor e nome são obrigatórios');
        exit;
    }

    $controller = new AuthorController();
    $result = $controller->update($input['author_id'], $input);

    if ($result) {
        ApiResponse::success($result, 'Autor atualizado com sucesso');
    } else {
        ApiResponse::notFound('Autor não encontrado ou falha na atualização');
    }

} catch (Exception $e) {
    error_log("AuthorUpdate Error: " . $e->getMessage());
    ApiResponse::serverError('Erro do servidor ao atualizar autor');
}