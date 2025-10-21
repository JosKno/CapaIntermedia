<?php
/**
 * API para verificar el estado de la sesión actual
 * Endpoint: GET /api/check_session.php
 */

require_once __DIR__ . '/../utils/SessionManager.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

SessionManager::startSession();

if (SessionManager::isLoggedIn()) {
    $user = SessionManager::getCurrentUser();
    
    echo json_encode([
        'logged_in' => true,
        'user' => [
            'id_usuario' => $user['id_usuario'],
            'nombre_completo' => $user['nombre_completo'],
            'primer_nombre' => SessionManager::getFirstName(),
            'email' => $user['email'],
            'is_admin' => $user['is_admin']
        ]
    ]);
} else {
    echo json_encode([
        'logged_in' => false
    ]);
}
?>