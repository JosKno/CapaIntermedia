<?php
/**
 * Clase Validator
 * Contiene métodos para validar datos de entrada del usuario
 */
class Validator {
    
    /**
     * Valida que la contraseña cumpla con los requisitos mínimos
     * Requisitos: mínimo 8 caracteres, al menos una mayúscula, una minúscula, 
     * un número y un carácter especial (!@#$%^&*)
     * 
     * @param string $password Contraseña a validar
     * @return array Retorna un array con 'valid' (bool) y 'message' (string)
     */
    public static function validatePassword($password) {
        $errors = [];
        
        // Validar longitud mínima
        if (strlen($password) < 8) {
            $errors[] = "La contraseña debe tener al menos 8 caracteres";
        }
        
        // Validar al menos una letra mayúscula
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = "Debe contener al menos una letra mayúscula";
        }
        
        // Validar al menos una letra minúscula
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = "Debe contener al menos una letra minúscula";
        }
        
        // Validar al menos un número
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = "Debe contener al menos un número";
        }
        
        // Validar al menos un carácter especial
        if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};:\'",.<>?\/\\|`~]/', $password)) {
            $errors[] = "Debe contener al menos un carácter especial (!@#$%^&* etc.)";
        }
        
        if (empty($errors)) {
            return [
                'valid' => true,
                'message' => 'Contraseña válida'
            ];
        } else {
            return [
                'valid' => false,
                'message' => implode('. ', $errors)
            ];
        }
    }
    
    /**
     * Valida que el correo electrónico tenga un formato válido
     * 
     * @param string $email Correo electrónico a validar
     * @return array Retorna un array con 'valid' (bool) y 'message' (string)
     */
    public static function validateEmail($email) {
        // Eliminar espacios en blanco
        $email = trim($email);
        
        // Validar que no esté vacío
        if (empty($email)) {
            return [
                'valid' => false,
                'message' => 'El correo electrónico no puede estar vacío'
            ];
        }
        
        // Validar que no tenga múltiples @
        if (substr_count($email, '@') !== 1) {
            return [
                'valid' => false,
                'message' => 'El correo debe contener exactamente un símbolo @'
            ];
        }
        
        // Validar formato usando filter_var
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'valid' => false,
                'message' => 'El formato del correo electrónico no es válido'
            ];
        }
        
        // Validar estructura adicional (evitar puntos consecutivos, etc.)
        if (preg_match('/\.{2,}/', $email)) {
            return [
                'valid' => false,
                'message' => 'El correo no puede contener puntos consecutivos'
            ];
        }
        
        // Validar que tenga un dominio válido
        $parts = explode('@', $email);
        if (count($parts) !== 2 || empty($parts[0]) || empty($parts[1])) {
            return [
                'valid' => false,
                'message' => 'El correo debe tener un formato válido (usuario@dominio.com)'
            ];
        }
        
        // Validar que el dominio tenga al menos un punto
        if (strpos($parts[1], '.') === false) {
            return [
                'valid' => false,
                'message' => 'El dominio del correo debe ser válido'
            ];
        }
        
        return [
            'valid' => true,
            'message' => 'Correo electrónico válido'
        ];
    }
    
    /**
     * Valida que la fecha de nacimiento corresponda a alguien mayor de 12 años
     * 
     * @param string $birthDate Fecha de nacimiento en formato YYYY-MM-DD
     * @return array Retorna un array con 'valid' (bool) y 'message' (string)
     */
    public static function validateAge($birthDate) {
        // Validar que no esté vacío
        if (empty($birthDate)) {
            return [
                'valid' => false,
                'message' => 'La fecha de nacimiento es requerida'
            ];
        }
        
        try {
            // Crear objeto DateTime con la fecha de nacimiento
            $dob = new DateTime($birthDate);
            $today = new DateTime();
            
            // Calcular la diferencia
            $age = $today->diff($dob)->y;
            
            // Validar que sea mayor de 12 años
            if ($age < 12) {
                return [
                    'valid' => false,
                    'message' => 'Debes ser mayor de 12 años para registrarte'
                ];
            }
            
            // Validar que la fecha no sea futura
            if ($dob > $today) {
                return [
                    'valid' => false,
                    'message' => 'La fecha de nacimiento no puede ser futura'
                ];
            }
            
            // Validar edad máxima razonable (150 años)
            if ($age > 150) {
                return [
                    'valid' => false,
                    'message' => 'La fecha de nacimiento no es válida'
                ];
            }
            
            return [
                'valid' => true,
                'message' => 'Edad válida',
                'age' => $age
            ];
            
        } catch (Exception $e) {
            return [
                'valid' => false,
                'message' => 'Formato de fecha inválido. Use YYYY-MM-DD'
            ];
        }
    }
    
    /**
     * Valida que un campo de texto no esté vacío y cumpla con longitud mínima
     * 
     * @param string $value Valor a validar
     * @param string $fieldName Nombre del campo (para mensajes de error)
     * @param int $minLength Longitud mínima requerida
     * @return array Retorna un array con 'valid' (bool) y 'message' (string)
     */
    public static function validateTextField($value, $fieldName, $minLength = 1) {
        $value = trim($value);
        
        if (empty($value)) {
            return [
                'valid' => false,
                'message' => "El campo {$fieldName} es requerido"
            ];
        }
        
        if (strlen($value) < $minLength) {
            return [
                'valid' => false,
                'message' => "El campo {$fieldName} debe tener al menos {$minLength} caracteres"
            ];
        }
        
        return [
            'valid' => true,
            'message' => 'Campo válido'
        ];
    }
    
    /**
     * Valida que un valor esté en una lista de opciones permitidas
     * 
     * @param string $value Valor a validar
     * @param array $allowedValues Lista de valores permitidos
     * @param string $fieldName Nombre del campo
     * @return array Retorna un array con 'valid' (bool) y 'message' (string)
     */
    public static function validateEnum($value, $allowedValues, $fieldName) {
        if (!in_array($value, $allowedValues)) {
            return [
                'valid' => false,
                'message' => "El valor de {$fieldName} no es válido"
            ];
        }
        
        return [
            'valid' => true,
            'message' => 'Valor válido'
        ];
    }
}
?>