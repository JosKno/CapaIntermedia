<?php
/**
 * API para cambiar contraseña de usuario
 * Endpoint: POST /api/change_password.php
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/SessionManager.php';
require_once __DIR__ . '/../utils/Validator.php';

SessionManager::startSession();

if (!SessionManager::isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit();
}

$current_user = SessionManager::getCurrentUser();
$data = (object) $_POST;

// Validar campos requeridos
if (!isset($data->id_usuario) || !isset($data->current_password) || !isset($data->new_password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Todos los campos son requeridos'
    ]);
    exit();
}

$user_id = intval($data->id_usuario);

// Verificar que solo pueda cambiar su propia contraseña
if ($user_id !== $current_user['id_usuario'] && !SessionManager::isAdmin()) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'No tienes permiso'
    ]);
    exit();
}

// Validar nueva contraseña
$passwordValidation = Validator::validatePassword($data->new_password);
if (!$passwordValidation['valid']) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $passwordValidation['message']
    ]);
    exit();
}

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Obtener contraseña actual de la BD
    $query = "SELECT contrasena FROM Usuario WHERE id_usuario = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$user_id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no encontrado'
        ]);
        exit();
    }
    
    $user = $stmt->fetch();
    
    // Verificar contraseña actual
    if (!password_verify($data->current_password, $user['contrasena'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'La contraseña actual es incorrecta'
        ]);
        exit();
    }
    
    // Actualizar contraseña
    $new_password_hash = password_hash($data->new_password, PASSWORD_BCRYPT);
    $query = "UPDATE Usuario SET contrasena = ? WHERE id_usuario = ?";
    $stmt = $conn->prepare($query);
    
    if ($stmt->execute([$new_password_hash, $user_id])) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Contraseña actualizada exitosamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar la contraseña'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Error en change_password.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}
?>