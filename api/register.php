<?php
/**
 * API para registro de usuarios con soporte de foto de perfil
 * Endpoint: POST /api/register.php
 * Soporta: multipart/form-data y application/json
 */

// Headers para CORS y tipo de contenido
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../config/Database.php'; 
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../utils/FileHandler.php';

// Verificar que sea método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Use POST'
    ]);
    exit();
}

// Determinar el tipo de contenido
$content_type = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

$data = null;
$foto_perfil = null;

// Procesar según el tipo de contenido
if (strpos($content_type, 'multipart/form-data') !== false) {
    // Datos vienen por form-data (con archivo)
    $data = (object) $_POST;
    
    // Procesar archivo de imagen si existe
    if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] !== UPLOAD_ERR_NO_FILE) {
        $validation = FileHandler::validateImage($_FILES['foto_perfil']);
        if (!$validation['valid']) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Error en la imagen: ' . $validation['message']
            ]);
            exit();
        }
        
        // Procesar y redimensionar imagen
        $foto_perfil = FileHandler::processImageForBlob($_FILES['foto_perfil']);
        if ($foto_perfil === false) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Error al procesar la imagen'
            ]);
            exit();
        }
    }
    
} else {
    // Datos vienen por JSON
    $data = json_decode(file_get_contents("php://input"));
    
    // Si viene foto en base64
    if (isset($data->foto_perfil_base64) && !empty($data->foto_perfil_base64)) {
        $foto_perfil = FileHandler::processBase64Image($data->foto_perfil_base64);
        if ($foto_perfil === false) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Error al procesar la imagen en base64'
            ]);
            exit();
        }
    }
}

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
$required_fields = [
    'nombre_completo',
    'fecha_nacimiento', 
    'genero',
    'pais_nacimiento',
    'nacionalidad',
    'email',
    'contrasena'
];

$missing_fields = [];
foreach ($required_fields as $field) {
    if (!isset($data->$field) || empty(trim($data->$field))) {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Campos requeridos faltantes: ' . implode(', ', $missing_fields)
    ]);
    exit();
}

// Crear instancia de usuario
$user = new User();

// Asignar valores
$user->nombre_completo = trim($data->nombre_completo);
$user->fecha_nacimiento = trim($data->fecha_nacimiento);
$user->genero = trim($data->genero);
$user->pais_nacimiento = trim($data->pais_nacimiento);
$user->nacionalidad = trim($data->nacionalidad);
$user->email = trim($data->email);
$user->contrasena = $data->contrasena;
$user->foto_perfil = $foto_perfil;
$user->is_admin = false;

// Intentar crear el usuario
$result = $user->create();

// Enviar respuesta
if ($result['success']) {
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => $result['message'],
        'user_id' => $result['user_id']
    ]);
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $result['message']
    ]);
}
?>