<?php
/**
 * Clase FileHandler
 * Maneja la subida y procesamiento de archivos (imágenes)
 */
class FileHandler {
    
    // Tipos MIME permitidos para imágenes
    private static $allowed_types = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];
    
    // Tamaño máximo: 5MB
    private static $max_size = 5242880;
    
    /**
     * Valida un archivo de imagen
     * 
     * @param array $file Array del archivo $_FILES
     * @return array Resultado de la validación
     */
    public static function validateImage($file) {
        $errors = [];
        
        // Verificar que se subió un archivo
        if (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
            return [
                'valid' => false,
                'message' => 'No se ha subido ningún archivo'
            ];
        }
        
        // Verificar errores de subida
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return [
                'valid' => false,
                'message' => 'Error al subir el archivo: ' . self::getUploadErrorMessage($file['error'])
            ];
        }
        
        // Verificar tamaño
        if ($file['size'] > self::$max_size) {
            $max_mb = self::$max_size / 1048576;
            return [
                'valid' => false,
                'message' => "El archivo es muy grande. Máximo permitido: {$max_mb}MB"
            ];
        }
        
        // Verificar tipo MIME
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mime_type, self::$allowed_types)) {
            return [
                'valid' => false,
                'message' => 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP)'
            ];
        }
        
        // Verificar que es una imagen real
        $image_info = getimagesize($file['tmp_name']);
        if ($image_info === false) {
            return [
                'valid' => false,
                'message' => 'El archivo no es una imagen válida'
            ];
        }
        
        return [
            'valid' => true,
            'message' => 'Imagen válida',
            'mime_type' => $mime_type,
            'width' => $image_info[0],
            'height' => $image_info[1]
        ];
    }
    
    /**
     * Procesa una imagen y la convierte a formato adecuado para BLOB
     * 
     * @param array $file Array del archivo $_FILES
     * @param int $max_width Ancho máximo (default: 800px)
     * @param int $max_height Alto máximo (default: 800px)
     * @return mixed Contenido de la imagen o false si falla
     */
    public static function processImageForBlob($file, $max_width = 800, $max_height = 800) {
        // Validar imagen
        $validation = self::validateImage($file);
        if (!$validation['valid']) {
            return false;
        }
        
        // Cargar imagen según tipo
        $image = null;
        switch ($validation['mime_type']) {
            case 'image/jpeg':
            case 'image/jpg':
                $image = imagecreatefromjpeg($file['tmp_name']);
                break;
            case 'image/png':
                $image = imagecreatefrompng($file['tmp_name']);
                break;
            case 'image/gif':
                $image = imagecreatefromgif($file['tmp_name']);
                break;
            case 'image/webp':
                $image = imagecreatefromwebp($file['tmp_name']);
                break;
            default:
                return false;
        }
        
        if (!$image) {
            return false;
        }
        
        // Obtener dimensiones originales
        $orig_width = imagesx($image);
        $orig_height = imagesy($image);
        
        // Calcular nuevas dimensiones manteniendo proporción
        $ratio = min($max_width / $orig_width, $max_height / $orig_height);
        
        if ($ratio < 1) {
            $new_width = intval($orig_width * $ratio);
            $new_height = intval($orig_height * $ratio);
            
            // Crear nueva imagen redimensionada
            $new_image = imagecreatetruecolor($new_width, $new_height);
            
            // Preservar transparencia para PNG
            if ($validation['mime_type'] == 'image/png') {
                imagealphablending($new_image, false);
                imagesavealpha($new_image, true);
            }
            
            // Redimensionar
            imagecopyresampled($new_image, $image, 0, 0, 0, 0, $new_width, $new_height, $orig_width, $orig_height);
            imagedestroy($image);
            $image = $new_image;
        }
        
        // Convertir a JPEG para almacenar (mejor compresión)
        ob_start();
        imagejpeg($image, null, 85); // 85% de calidad
        $image_data = ob_get_clean();
        imagedestroy($image);
        
        return $image_data;
    }
    
    /**
     * Procesa imagen desde base64
     * 
     * @param string $base64_string Imagen en formato base64
     * @param int $max_width Ancho máximo
     * @param int $max_height Alto máximo
     * @return mixed Contenido de la imagen o false si falla
     */
    public static function processBase64Image($base64_string, $max_width = 800, $max_height = 800) {
        // Remover header de data URL si existe
        if (strpos($base64_string, 'data:image') === 0) {
            $base64_string = preg_replace('/^data:image\/\w+;base64,/', '', $base64_string);
        }
        
        // Decodificar base64
        $image_data = base64_decode($base64_string);
        if ($image_data === false) {
            return false;
        }
        
        // Crear archivo temporal
        $temp_file = tempnam(sys_get_temp_dir(), 'img');
        file_put_contents($temp_file, $image_data);
        
        // Crear array similar a $_FILES
        $file = [
            'tmp_name' => $temp_file,
            'error' => UPLOAD_ERR_OK,
            'size' => filesize($temp_file)
        ];
        
        // Procesar imagen
        $result = self::processImageForBlob($file, $max_width, $max_height);
        
        // Eliminar archivo temporal
        unlink($temp_file);
        
        return $result;
    }
    
    /**
     * Convierte mensaje de error de subida a texto legible
     * 
     * @param int $error_code Código de error de PHP
     * @return string Mensaje de error
     */
    private static function getUploadErrorMessage($error_code) {
        switch ($error_code) {
            case UPLOAD_ERR_INI_SIZE:
                return 'El archivo excede el tamaño máximo permitido por el servidor';
            case UPLOAD_ERR_FORM_SIZE:
                return 'El archivo excede el tamaño máximo permitido';
            case UPLOAD_ERR_PARTIAL:
                return 'El archivo se subió parcialmente';
            case UPLOAD_ERR_NO_FILE:
                return 'No se subió ningún archivo';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Falta carpeta temporal';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Error al escribir el archivo en disco';
            case UPLOAD_ERR_EXTENSION:
                return 'Extensión de PHP detuvo la subida del archivo';
            default:
                return 'Error desconocido al subir archivo';
        }
    }
    
    /**
     * Obtiene el tipo MIME de una imagen desde BLOB
     * 
     * @param mixed $blob_data Datos BLOB
     * @return string Tipo MIME
     */
    public static function getMimeTypeFromBlob($blob_data) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_buffer($finfo, $blob_data);
        finfo_close($finfo);
        return $mime_type;
    }
}
?>