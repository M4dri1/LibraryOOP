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
    if (!isset($input['book_id']) || !is_numeric($input['book_id']) || $input['book_id'] <= 0) {
        ApiResponse::validationError('ID de livro válido é obrigatório', ['book_id' => 'ID do livro deve ser um número positivo']);
        exit;
    }
    $book_id = $input['book_id'];
    $title = $input['title'] ?? '';
    $author_id = $input['author_id'] ?? '';
    if (empty($book_id) || empty($title) || empty($author_id)) {
        ApiResponse::validationError('ID do livro, título e ID do autor são obrigatórios');
        exit;
    }
    if (!is_numeric($author_id) || $author_id <= 0) {
        ApiResponse::validationError('ID de autor válido é obrigatório', ['author_id' => 'ID do autor deve ser um número positivo']);
        exit;
    }
    $controller = new BookController();
    $result = $controller->update($input['book_id'], $input);
    if ($result) {
        ApiResponse::success($result, 'Livro atualizado com sucesso');
    } else {
        ApiResponse::notFound('Livro não encontrado ou falha na atualização');
    }
} catch (Exception $e) {
    error_log("BookUpdate Error: " . $e->getMessage());
    ApiResponse::serverError('Erro do servidor ao atualizar livro');
}
