<?php
/**
 * API para cambiar foto de perfil
 * Endpoint: POST /api/change_photo.php
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/SessionManager.php';
require_once __DIR__ . '/../utils/FileHandler.php';

SessionManager::startSession();

// Debug: verificar sesión
if (!SessionManager::isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado - Sesión no válida',
        'debug' => [
            'session_status' => session_status(),
            'session_id' => session_id(),
            'session_data' => isset($_SESSION) ? array_keys($_SESSION) : []
        ]
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

// Obtener user_id de POST o usar el de la sesión
$user_id = null;
if (isset($_POST['id_usuario']) && !empty($_POST['id_usuario'])) {
    $user_id = intval($_POST['id_usuario']);
} else {
    // Si no viene en POST, usar el de la sesión
    $user_id = $current_user['id_usuario'];
}

if (!$user_id) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'ID de usuario no válido',
        'debug' => [
            'post_data' => $_POST,
            'files' => array_keys($_FILES),
            'session_user' => $current_user
        ]
    ]);
    exit();
}

// Verificar que solo pueda cambiar su propia foto
if ($user_id !== $current_user['id_usuario'] && !SessionManager::isAdmin()) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'No tienes permiso'
    ]);
    exit();
}

// Verificar que se subió una foto
if (!isset($_FILES['foto_perfil']) || $_FILES['foto_perfil']['error'] === UPLOAD_ERR_NO_FILE) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'No se ha seleccionado ninguna imagen'
    ]);
    exit();
}

// Validar imagen
$validation = FileHandler::validateImage($_FILES['foto_perfil']);
if (!$validation['valid']) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Error en imagen: ' . $validation['message']
    ]);
    exit();
}

// Procesar imagen
$foto_perfil = FileHandler::processImageForBlob($_FILES['foto_perfil']);
if ($foto_perfil === false) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Error al procesar la imagen'
    ]);
    exit();
}

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Actualizar foto
    $query = "UPDATE Usuario SET foto_perfil = ? WHERE id_usuario = ?";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(1, $foto_perfil, PDO::PARAM_LOB);
    $stmt->bindParam(2, $user_id);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Foto actualizada exitosamente',
            'photo_url' => "./api/get_photo.php?id={$user_id}&t=" . time()
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar la foto'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Error en change_photo.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor'
    ]);
}
?>