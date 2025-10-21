<?php
// ============================================
// TEMPORAL: DIRECTIVAS DE DEPURACIÓN
// ¡ELIMINAR ESTO UNA VEZ RESUELTO EL ERROR!
// ============================================
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// ============================================

/**
 * API para inicio de sesión de usuarios
 * Permite login con email o primer nombre
 * Endpoint: POST /api/login.php
 */

// Incluir archivos necesarios
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/SessionManager.php';

// Iniciar sesión de forma segura USANDO SessionManager ANTES DE LOS HEADERS
SessionManager::startSession();

// Headers para CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Verificar que sea método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Use POST'
    ]);
    exit();
}

// Obtener datos del POST
$data = json_decode(file_get_contents("php://input"));

// Validar que se recibieron datos
if (empty($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'No se recibieron datos'
    ]);
    exit();
}

// Validar campos requeridos
if (empty($data->identifier) || empty($data->password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email/nombre y contraseña son requeridos'
    ]);
    exit();
}

// Crear instancia de usuario
$user = new User();

// Intentar iniciar sesión (con email o primer nombre)
$result = $user->login(trim($data->identifier), $data->password);

// Enviar respuesta
if ($result['success']) {
    // Guardar información en la sesión usando SessionManager
    SessionManager::login($result['user']);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => $result['message'],
        'user' => [
            'id_usuario' => $result['user']['id_usuario'],
            'nombre_completo' => $result['user']['nombre_completo'],
            'email' => $result['user']['email'],
            'is_admin' => (bool)$result['user']['is_admin']
        ]
    ]);
} else {
    http_response_code(401); // Unauthorized
    echo json_encode([
        'success' => false,
        'message' => $result['message']
    ]);
}
?>