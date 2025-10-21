<?php
/**
 * Clase User
 * Maneja las operaciones relacionadas con usuarios
 */
class User {
    private $conn;
    private $table_name = "Usuario";
    
    // Propiedades del usuario
    public $id_usuario;
    public $nombre_completo;
    public $fecha_nacimiento;
    public $foto_perfil;
    public $genero;
    public $pais_nacimiento;
    public $nacionalidad;
    public $email;
    public $contrasena;
    public $fecha_registro;
    public $is_admin;
    
    /**
     * Constructor
     */
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    /**
     * Crea un nuevo usuario usando stored procedure
     * 
     * @return array Retorna un array con el resultado de la operación
     */
    public function create() {
        // Validar datos antes de insertar
        $validation = $this->validateUserData();
        if (!$validation['valid']) {
            return [
                'success' => false,
                'message' => $validation['message']
            ];
        }
        
        try {
            // Sanitizar datos
            $this->nombre_completo = htmlspecialchars(strip_tags($this->nombre_completo));
            $this->email = htmlspecialchars(strip_tags($this->email));
            $this->genero = htmlspecialchars(strip_tags($this->genero));
            $this->pais_nacimiento = htmlspecialchars(strip_tags($this->pais_nacimiento));
            $this->nacionalidad = htmlspecialchars(strip_tags($this->nacionalidad));
            
            // Hash de la contraseña
            $hashed_password = password_hash($this->contrasena, PASSWORD_BCRYPT);
            
            // Llamar al stored procedure
            $query = "CALL sp_registrar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, @id_usuario, @mensaje, @codigo)";
            $stmt = $this->conn->prepare($query);
            
            // Bind de parámetros
            $stmt->bindParam(1, $this->nombre_completo);
            $stmt->bindParam(2, $this->fecha_nacimiento);
            $stmt->bindParam(3, $this->foto_perfil, PDO::PARAM_LOB);
            $stmt->bindParam(4, $this->genero);
            $stmt->bindParam(5, $this->pais_nacimiento);
            $stmt->bindParam(6, $this->nacionalidad);
            $stmt->bindParam(7, $this->email);
            $stmt->bindParam(8, $hashed_password);
            $stmt->bindParam(9, $this->is_admin);
            
            // Ejecutar
            $stmt->execute();
            $stmt->closeCursor();
            
            // Obtener valores de salida
            $result = $this->conn->query("SELECT @id_usuario as id, @mensaje as mensaje, @codigo as codigo")->fetch();
            
            if ($result['codigo'] == 201) {
                return [
                    'success' => true,
                    'message' => $result['mensaje'],
                    'user_id' => $result['id']
                ];
            } else {
                return [
                    'success' => false,
                    'message' => $result['mensaje']
                ];
            }
            
        } catch (PDOException $e) {
            error_log("Error al crear usuario: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error en el servidor al registrar usuario: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Valida todos los datos del usuario
     * 
     * @return array Resultado de la validación
     */
    private function validateUserData() {
        $errors = [];
        
        // Validar nombre completo
        $nameValidation = Validator::validateTextField($this->nombre_completo, "nombre completo", 3);
        if (!$nameValidation['valid']) {
            $errors[] = $nameValidation['message'];
        }
        
        // Validar email
        $emailValidation = Validator::validateEmail($this->email);
        if (!$emailValidation['valid']) {
            $errors[] = $emailValidation['message'];
        }
        
        // Validar contraseña
        $passwordValidation = Validator::validatePassword($this->contrasena);
        if (!$passwordValidation['valid']) {
            $errors[] = $passwordValidation['message'];
        }
        
        // Validar fecha de nacimiento
        $ageValidation = Validator::validateAge($this->fecha_nacimiento);
        if (!$ageValidation['valid']) {
            $errors[] = $ageValidation['message'];
        }
        
        // Validar género
        $allowedGenders = ['masculino', 'femenino', 'otro'];
        $genderValidation = Validator::validateEnum($this->genero, $allowedGenders, "género");
        if (!$genderValidation['valid']) {
            $errors[] = $genderValidation['message'];
        }
        
        // Validar país de nacimiento
        $countryValidation = Validator::validateTextField($this->pais_nacimiento, "país de nacimiento", 2);
        if (!$countryValidation['valid']) {
            $errors[] = $countryValidation['message'];
        }
        
        // Validar nacionalidad
        $nationalityValidation = Validator::validateTextField($this->nacionalidad, "nacionalidad", 2);
        if (!$nationalityValidation['valid']) {
            $errors[] = $nationalityValidation['message'];
        }
        
        if (empty($errors)) {
            return [
                'valid' => true,
                'message' => 'Datos válidos'
            ];
        } else {
            return [
                'valid' => false,
                'message' => implode('. ', $errors)
            ];
        }
    }
    
    /**
     * Verifica si un email ya existe en la base de datos
     * 
     * @return bool True si existe, False si no existe
     */
    public function emailExists() {
        $query = "SELECT id_usuario FROM " . $this->table_name . " 
                  WHERE email = :email LIMIT 1";
        
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $this->email);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                return true;
            }
            return false;
            
        } catch (PDOException $e) {
            error_log("Error al verificar email: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtiene un usuario por su email usando stored procedure
     * 
     * @param string $email Email del usuario
     * @return array|null Datos del usuario o null si no existe
     */
    public function getUserByEmail($email) {
        try {
            $query = "CALL sp_obtener_usuario_por_email(?)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $email);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                return $stmt->fetch();
            }
            return null;
            
        } catch (PDOException $e) {
            error_log("Error al obtener usuario: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Obtiene la foto de perfil de un usuario
     * 
     * @param int $userId ID del usuario
     * @return mixed Imagen en formato BLOB o null
     */
    public function getProfilePhoto($userId) {
        try {
            $query = "SELECT foto_perfil FROM " . $this->table_name . " 
                      WHERE id_usuario = ? LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $userId);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch();
                return $row['foto_perfil'];
            }
            return null;
            
        } catch (PDOException $e) {
            error_log("Error al obtener foto: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Verifica las credenciales de login
     * Permite login con email o primer nombre
     * 
     * @param string $identifier Email o primer nombre del usuario
     * @param string $password Contraseña sin hashear
     * @return array Resultado de la verificación
     */
    public function login($identifier, $password) {
        $identifier = trim($identifier);
        
        try {
            // Primero intentar buscar por email
            $query = "SELECT * FROM " . $this->table_name . " WHERE email = ? LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $identifier);
            $stmt->execute();
            
            $user = null;
            
            // Si no se encuentra por email, buscar por primer nombre
            if ($stmt->rowCount() === 0) {
                // Buscar usuarios cuyo primer nombre coincida (case insensitive)
                $query = "SELECT * FROM " . $this->table_name . " 
                          WHERE LOWER(SUBSTRING_INDEX(nombre_completo, ' ', 1)) = LOWER(?)";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(1, $identifier);
                $stmt->execute();
                
                // Si no se encuentra ninguno
                if ($stmt->rowCount() === 0) {
                    return [
                        'success' => false,
                        'message' => 'Credenciales incorrectas'
                    ];
                }
                
                // Si hay múltiples usuarios con el mismo primer nombre
                if ($stmt->rowCount() > 1) {
                    return [
                        'success' => false,
                        'message' => 'Múltiples usuarios con ese nombre. Por favor, use su correo electrónico.'
                    ];
                }
                
                $user = $stmt->fetch();
            } else {
                $user = $stmt->fetch();
            }
            
            if ($user === null) {
                return [
                    'success' => false,
                    'message' => 'Credenciales incorrectas'
                ];
            }
            
            // Verificar contraseña
            if (password_verify($password, $user['contrasena'])) {
                // No incluir la contraseña en la respuesta
                unset($user['contrasena']);
                
                return [
                    'success' => true,
                    'message' => 'Login exitoso',
                    'user' => $user
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Credenciales incorrectas'
                ];
            }
            
        } catch (PDOException $e) {
            error_log("Error en login: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error en el servidor'
            ];
        }
    }
}
?>