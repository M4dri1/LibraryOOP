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
    $book_id = $input['book_id'];
    if (empty($book_id) || !is_numeric($book_id) || $book_id <= 0) {
        ApiResponse::validationError('ID de livro válido é obrigatório', ['book_id' => 'ID do livro deve ser um número positivo']);
        exit;
    }
    $controller = new BookController();
    if ($controller->isRented((int)$book_id)) {
        ApiResponse::validationError('Livro está alugado e não pode ser excluído');
        exit;
    }
    $result = $controller->delete($book_id);
    if ($result) {
        ApiResponse::success(null, 'Livro excluído com sucesso');
    } else {
        ApiResponse::notFound('Livro não encontrado ou falha na exclusão');
    }
} catch (Exception $e) {
    error_log("BookDelete Error: " . $e->getMessage());
    ApiResponse::serverError('Erro do servidor ao excluir livro');
}
