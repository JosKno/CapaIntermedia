<?php
/**
 * API para cerrar sesión
 * Endpoint: POST /api/logout.php
 */

// Incluir SessionManager
require_once __DIR__ . '/../utils/SessionManager.php';

// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");

// Cerrar sesión
SessionManager::logout();

// Respuesta
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Sesión cerrada exitosamente'
]);
?>