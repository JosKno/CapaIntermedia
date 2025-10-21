<?php
/**
 * Clase SessionManager
 * Maneja todas las operaciones relacionadas con sesiones de usuario
 */
class SessionManager {
    
    /**
     * Inicia la sesión si no está iniciada
     */
    public static function startSession() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    /**
     * Inicia sesión de usuario
     * 
     * @param array $userData Datos del usuario
     */
    public static function login($userData) {
        self::startSession();
        
        $_SESSION['logged_in'] = true;
        $_SESSION['user_id'] = $userData['id_usuario'];
        $_SESSION['user_name'] = $userData['nombre_completo'];
        $_SESSION['user_email'] = $userData['email'];
        $_SESSION['is_admin'] = (bool)$userData['is_admin'];
        $_SESSION['login_time'] = time();
        
        // Regenerar ID de sesión por seguridad
        session_regenerate_id(true);
    }
    
    /**
     * Cierra sesión de usuario
     */
    public static function logout() {
        self::startSession();
        
        // Limpiar todas las variables de sesión
        $_SESSION = array();
        
        // Destruir la cookie de sesión
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 3600, '/');
        }
        
        // Destruir la sesión
        session_destroy();
    }
    
    /**
     * Verifica si hay un usuario logueado
     * 
     * @return bool
     */
    public static function isLoggedIn() {
        self::startSession();
        return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    }
    
    /**
     * Verifica si el usuario es administrador
     * 
     * @return bool
     */
    public static function isAdmin() {
        self::startSession();
        return self::isLoggedIn() && isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
    }
    
    /**
     * Obtiene información del usuario actual
     * 
     * @return array|null
     */
    public static function getCurrentUser() {
        if (!self::isLoggedIn()) {
            return null;
        }
        
        return [
            'id_usuario' => $_SESSION['user_id'] ?? null,
            'nombre_completo' => $_SESSION['user_name'] ?? null,
            'email' => $_SESSION['user_email'] ?? null,
            'is_admin' => $_SESSION['is_admin'] ?? false
        ];
    }
    
    /**
     * Requiere que el usuario esté logueado
     * Redirige a login si no lo está
     */
    public static function requireLogin() {
        if (!self::isLoggedIn()) {
            header('Location: login.html');
            exit();
        }
    }
    
    /**
     * Requiere que el usuario sea administrador
     * Redirige a index si no lo es
     */
    public static function requireAdmin() {
        self::requireLogin();
        
        if (!self::isAdmin()) {
            header('Location: index.html');
            exit();
        }
    }
    
    /**
     * Obtiene el primer nombre del usuario
     * 
     * @return string
     */
    public static function getFirstName() {
        if (!self::isLoggedIn()) {
            return '';
        }
        
        $fullName = $_SESSION['user_name'] ?? '';
        $parts = explode(' ', $fullName);
        return $parts[0] ?? '';
    }
}
?>