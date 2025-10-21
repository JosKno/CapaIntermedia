<?php
/**
 * API para obtener datos completos de un usuario
 * Endpoint: GET /api/get_user.php?id=1
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/SessionManager.php';

// Verificar que el usuario esté logueado
SessionManager::startSession();

if (!SessionManager::isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit();
}

// Verificar que se envió el ID
if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'ID de usuario requerido'
    ]);
    exit();
}

$requested_id = intval($_GET['id']);
$current_user_id = SessionManager::getCurrentUser()['id_usuario'];

// Verificar que el usuario solo pueda ver su propio perfil (o ser admin)
if ($requested_id !== $current_user_id && !SessionManager::isAdmin()) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'No tienes permiso para ver este perfil'
    ]);
    exit();
}

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Obtener datos del usuario (sin la contraseña)
    $query = "SELECT 
                id_usuario,
                nombre_completo,
                fecha_nacimiento,
                genero,
                pais_nacimiento,
                nacionalidad,
                email,
                fecha_registro,
                is_admin
              FROM Usuario 
              WHERE id_usuario = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(1, $requested_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch();
        
        // Agregar URL de la foto con timestamp para evitar caché
        $timestamp = time();
        $user['foto_perfil_url'] = "./api/get_photo.php?id=" . $user['id_usuario'] . "&t=" . $timestamp;
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no encontrado'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Error en get_user.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}
?>