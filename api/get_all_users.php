<?php
/**
 * API para obtener todos los usuarios (solo para admins)
 * Endpoint: GET /api/get_all_users.php
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/SessionManager.php';

// Verificar sesión
SessionManager::startSession();

if (!SessionManager::isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit();
}

// Verificar que sea administrador
if (!SessionManager::isAdmin()) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Acceso denegado. Solo administradores pueden ver esta información.'
    ]);
    exit();
}

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Obtener todos los usuarios (sin contraseña y sin foto en la lista)
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
              ORDER BY fecha_registro DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $users = $stmt->fetchAll();
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'users' => $users,
        'total' => count($users)
    ]);
    
} catch (PDOException $e) {
    error_log("Error en get_all_users.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>