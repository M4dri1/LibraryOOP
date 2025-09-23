<?php
declare(strict_types=1);


class ApiResponse {
    
    public static function success(mixed $data = null, string $message = 'Operação realizada com sucesso'): void {
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    
    public static function error(string $message = 'Ocorreu um erro', int $code = 400): void {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'data' => null
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    
    public static function notFound(string $message = 'Recurso não encontrado'): void {
        self::error($message, 404);
    }

    
    public static function validationError(string $message = 'Falha na validação'): void {
        self::error($message, 422);
    }

    
    public static function serverError(string $message = 'Erro interno do servidor'): void {
        self::error($message, 500);
    }
}

