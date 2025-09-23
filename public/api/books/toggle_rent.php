<?php
declare(strict_types=1);
require_once __DIR__ . '/../../../src/controllers/BookController.php';
require_once __DIR__ . '/../../../src/utils/ApiResponse.php';
header('Content-Type: application/json');

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        ApiResponse::validationError('Formato JSON inválido');
    }

    $book_id = $input['book_id'] ?? null;
    $rented = $input['rented'] ?? null;

    if (empty($book_id) || !is_numeric($book_id) || $book_id <= 0) {
        ApiResponse::validationError('ID de livro válido é obrigatório');
    }
    if (!is_bool($rented)) {
        ApiResponse::validationError('Campo "rented" deve ser booleano');
    }

    $controller = new BookController();

    $ok = $controller->setRented((int)$book_id, (bool)$rented);
    if (!$ok) {
        ApiResponse::error('Não foi possível atualizar estado de aluguel do livro');
    }

    ApiResponse::success(['book_id' => (int)$book_id, 'rented' => (bool)$rented], (bool)$rented ? 'Livro alugado' : 'Livro devolvido');

} catch (Exception $e) {
    error_log("BookToggleRent Error: " . $e->getMessage());
    ApiResponse::serverError('Erro do servidor ao alternar aluguel');
}
