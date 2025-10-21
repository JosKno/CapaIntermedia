<?php
/**
 * Clase Database
 * Maneja la conexión a la base de datos MySQL usando PDO
 */
class Database {
    private $host = "localhost";
    private $db_name = "MundialBDM";
    private $username = "root";
    private $password = "";
    private $conn = null;
    
    /**
     * Obtiene la conexión a la base de datos
     * @return PDO|null Retorna la conexión PDO o null si falla
     */
    public function getConnection() {
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            
            // Configurar PDO para lanzar excepciones en caso de error
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Configurar PDO para retornar arrays asociativos
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            return $this->conn;
            
        } catch(PDOException $e) {
            error_log("Error de conexión: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Cierra la conexión a la base de datos
     */
    public function closeConnection() {
        $this->conn = null;
    }
}
?>