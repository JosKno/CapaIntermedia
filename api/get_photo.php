<?php
/**
 * API para obtener foto de perfil de usuario
 * Endpoint: GET /api/get_photo.php?id=1
 */

// Incluir archivos necesarios
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/FileHandler.php';

// Verificar que sea método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Use GET'
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

$user_id = intval($_GET['id']);

// Obtener foto
$user = new User();
$foto = $user->getProfilePhoto($user_id);

if ($foto === null || empty($foto)) {
    // Si no hay foto, devolver imagen por defecto
    http_response_code(404);
    
    // Puedes redirigir a una imagen por defecto o devolver una imagen placeholder
    header('Content-Type: image/png');
    
    // Crear imagen placeholder simple
    $img = imagecreatetruecolor(200, 200);
    $bg_color = imagecolorallocate($img, 200, 200, 200);
    $text_color = imagecolorallocate($img, 100, 100, 100);
    imagefill($img, 0, 0, $bg_color);
    imagestring($img, 5, 60, 95, 'Sin foto', $text_color);
    
    imagepng($img);
    imagedestroy($img);
    exit();
}

// Determinar tipo MIME
$mime_type = FileHandler::getMimeTypeFromBlob($foto);

// Enviar headers apropiados
header('Content-Type: ' . $mime_type);
header('Content-Length: ' . strlen($foto));
header('Cache-Control: max-age=86400'); // Cache por 1 día

// Enviar imagen
echo $foto;
?>