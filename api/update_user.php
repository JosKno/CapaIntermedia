<?php
/**
 * API para actualizar datos de usuario
 * Endpoint: POST /api/update_user.php
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/SessionManager.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../utils/FileHandler.php';

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

// Verificar método POST
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

// Verificar que solo pueda editar su propio perfil (o ser admin)
if (!isset($data->id_usuario) || 
    (intval($data->id_usuario) !== $current_user['id_usuario'] && !SessionManager::isAdmin())) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'No tienes permiso para editar este perfil'
    ]);
    exit();
}

$user_id = intval($data->id_usuario);

// Validar campos requeridos
$required_fields = ['nombre_completo', 'fecha_nacimiento', 'genero', 'pais_nacimiento', 'nacionalidad', 'email'];
foreach ($required_fields as $field) {
    if (!isset($data->$field) || empty(trim($data->$field))) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "Campo requerido: $field"
        ]);
        exit();
    }
}

// Validar email
$emailValidation = Validator::validateEmail($data->email);
if (!$emailValidation['valid']) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $emailValidation['message']
    ]);
    exit();
}

// Validar fecha de nacimiento
$ageValidation = Validator::validateAge($data->fecha_nacimiento);
if (!$ageValidation['valid']) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $ageValidation['message']
    ]);
    exit();
}

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Verificar si el email ya existe (para otro usuario)
    $query = "SELECT id_usuario FROM Usuario WHERE email = ? AND id_usuario != ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->email, $user_id]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El email ya está en uso por otro usuario'
        ]);
        exit();
    }
    
    // Construir query de actualización
    $updateFields = [
        'nombre_completo = ?',
        'fecha_nacimiento = ?',
        'genero = ?',
        'pais_nacimiento = ?',
        'nacionalidad = ?',
        'email = ?'
    ];
    
    $params = [
        trim($data->nombre_completo),
        $data->fecha_nacimiento,
        $data->genero,
        trim($data->pais_nacimiento),
        trim($data->nacionalidad),
        trim($data->email)
    ];
    
    // Si se envió nueva contraseña
    if (isset($data->nueva_contrasena) && !empty($data->nueva_contrasena)) {
        $passwordValidation = Validator::validatePassword($data->nueva_contrasena);
        if (!$passwordValidation['valid']) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $passwordValidation['message']
            ]);
            exit();
        }
        
        $updateFields[] = 'contrasena = ?';
        $params[] = password_hash($data->nueva_contrasena, PASSWORD_BCRYPT);
    }
    
    // Si se envió nueva foto
    if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] !== UPLOAD_ERR_NO_FILE) {
        $validation = FileHandler::validateImage($_FILES['foto_perfil']);
        if (!$validation['valid']) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Error en imagen: ' . $validation['message']
            ]);
            exit();
        }
        
        $foto_perfil = FileHandler::processImageForBlob($_FILES['foto_perfil']);
        if ($foto_perfil !== false) {
            $updateFields[] = 'foto_perfil = ?';
            $params[] = $foto_perfil;
        }
    }
    
    // Agregar ID al final
    $params[] = $user_id;
    
    // Ejecutar actualización
    $query = "UPDATE Usuario SET " . implode(', ', $updateFields) . " WHERE id_usuario = ?";
    $stmt = $conn->prepare($query);
    
    if ($stmt->execute($params)) {
        // Actualizar sesión si cambió el email o nombre
        if ($user_id === $current_user['id_usuario']) {
            $_SESSION['user_name'] = $params[0]; // nombre_completo
            $_SESSION['user_email'] = $params[5]; // email
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Perfil actualizado exitosamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar el perfil'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Error en update_user.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>