<?php
declare(strict_types=1);
header('Content-Type: application/json');

require_once __DIR__ . '/../../../src/controllers/AuthorController.php';
require_once __DIR__ . '/../../../src/utils/ApiResponse.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        ApiResponse::validationError('Formato JSON inválido');
        exit;
    }

    if (empty($input['name_author'])) {
        ApiResponse::validationError('Nome do autor é obrigatório', ['name_author' => 'Nome do autor não pode estar vazio']);
        exit;
    }

    $input['name_author'] = ucwords(strtolower(trim($input['name_author'])));

    $controller = new AuthorController();
    $result = $controller->create($input);

    if ($result) {
        ApiResponse::success($result, 'Autor criado com sucesso');
    } else {
        ApiResponse::error('Falha ao criar autor');
    }

} catch (Exception $e) {
    error_log("AuthorCreate Error: " . $e->getMessage());
    ApiResponse::serverError('Erro inesperado do servidor');
}
