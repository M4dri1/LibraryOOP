<?php
declare(strict_types=1);
require_once __DIR__ . '/../../../src/controllers/BookController.php';
require_once __DIR__ . '/../../../src/utils/ApiResponse.php';
header('Content-Type: application/json');

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        ApiResponse::validationError('Formato JSON inválido');
        exit;
    }

    $title = $input['title'] ?? null;
    $author_id = $input['author_id'] ?? null;

    if (empty($title) || empty($author_id)) {
        ApiResponse::validationError('Título e ID do autor são obrigatórios');
        exit;
    }

    $controller = new BookController();
    $result = $controller->create($input);

    if ($result) {
        ApiResponse::success($result, 'Livro criado com sucesso');
    } else {
        ApiResponse::error('Falha ao criar livro');
    }

} catch (Exception $e) {
    error_log("BookCreate Error: " . $e->getMessage());
    ApiResponse::serverError('Erro inesperado do servidor');
}
