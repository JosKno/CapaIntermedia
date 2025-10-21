-- ============================================
-- Stored Procedures para Gestión de Usuarios
-- Base de Datos: MundialBDM
-- ============================================

USE MundialBDM;

-- Eliminar procedimientos si existen
DROP PROCEDURE IF EXISTS sp_registrar_usuario;
DROP PROCEDURE IF EXISTS sp_editar_usuario;
DROP PROCEDURE IF EXISTS sp_obtener_usuario_por_email;
DROP PROCEDURE IF EXISTS sp_obtener_usuario_por_id;
DROP PROCEDURE IF EXISTS sp_verificar_email_existe;

DELIMITER $$

-- ============================================
-- Procedimiento: sp_registrar_usuario
-- Descripción: Registra un nuevo usuario en el sistema
-- ============================================
CREATE PROCEDURE sp_registrar_usuario(
    IN p_nombre_completo VARCHAR(255),
    IN p_fecha_nacimiento DATE,
    IN p_foto_perfil LONGBLOB,
    IN p_genero VARCHAR(20),
    IN p_pais_nacimiento VARCHAR(100),
    IN p_nacionalidad VARCHAR(100),
    IN p_email VARCHAR(255),
    IN p_contrasena VARCHAR(255),
    IN p_is_admin BOOLEAN,
    OUT p_id_usuario INT,
    OUT p_mensaje VARCHAR(255),
    OUT p_codigo INT
)
BEGIN
    -- Declarar variables
    DECLARE email_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- En caso de error SQL
        ROLLBACK;
        SET p_codigo = 500;
        SET p_mensaje = 'Error al registrar el usuario';
        SET p_id_usuario = NULL;
    END;
    
    -- Iniciar transacción
    START TRANSACTION;
    
    -- Verificar si el email ya existe
    SELECT COUNT(*) INTO email_count
    FROM Usuario
    WHERE email = p_email;
    
    IF email_count > 0 THEN
        -- Email duplicado
        SET p_codigo = 400;
        SET p_mensaje = 'El correo electrónico ya está registrado';
        SET p_id_usuario = NULL;
        ROLLBACK;
    ELSE
        -- Insertar nuevo usuario
        INSERT INTO Usuario (
            nombre_completo,
            fecha_nacimiento,
            foto_perfil,
            genero,
            pais_nacimiento,
            nacionalidad,
            email,
            contrasena,
            is_admin,
            fecha_registro
        ) VALUES (
            p_nombre_completo,
            p_fecha_nacimiento,
            p_foto_perfil,
            p_genero,
            p_pais_nacimiento,
            p_nacionalidad,
            p_email,
            p_contrasena,
            p_is_admin,
            NOW()
        );
        
        -- Obtener el ID del usuario recién insertado
        SET p_id_usuario = LAST_INSERT_ID();
        SET p_codigo = 201;
        SET p_mensaje = 'Usuario registrado exitosamente';
        
        -- Confirmar transacción
        COMMIT;
    END IF;
END$$

-- ============================================
-- Procedimiento: sp_editar_usuario
-- Descripción: Edita los datos de un usuario existente
-- ============================================
CREATE PROCEDURE sp_editar_usuario(
    IN p_id_usuario INT,
    IN p_nombre_completo VARCHAR(255),
    IN p_fecha_nacimiento DATE,
    IN p_foto_perfil LONGBLOB,
    IN p_actualizar_foto BOOLEAN,
    IN p_genero VARCHAR(20),
    IN p_pais_nacimiento VARCHAR(100),
    IN p_nacionalidad VARCHAR(100),
    IN p_email VARCHAR(255),
    IN p_contrasena VARCHAR(255),
    IN p_actualizar_contrasena BOOLEAN,
    OUT p_mensaje VARCHAR(255),
    OUT p_codigo INT
)
BEGIN
    -- Declarar variables
    DECLARE usuario_count INT DEFAULT 0;
    DECLARE email_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- En caso de error SQL
        ROLLBACK;
        SET p_codigo = 500;
        SET p_mensaje = 'Error al actualizar el usuario';
    END;
    
    -- Iniciar transacción
    START TRANSACTION;
    
    -- Verificar que el usuario existe
    SELECT COUNT(*) INTO usuario_count
    FROM Usuario
    WHERE id_usuario = p_id_usuario;
    
    IF usuario_count = 0 THEN
        SET p_codigo = 404;
        SET p_mensaje = 'Usuario no encontrado';
        ROLLBACK;
    ELSE
        -- Verificar si el email ya existe en otro usuario
        SELECT COUNT(*) INTO email_count
        FROM Usuario
        WHERE email = p_email AND id_usuario != p_id_usuario;
        
        IF email_count > 0 THEN
            SET p_codigo = 400;
            SET p_mensaje = 'El correo electrónico ya está registrado por otro usuario';
            ROLLBACK;
        ELSE
            -- Actualizar usuario
            IF p_actualizar_contrasena = TRUE AND p_actualizar_foto = TRUE THEN
                -- Actualizar todo incluyendo contraseña y foto
                UPDATE Usuario SET
                    nombre_completo = p_nombre_completo,
                    fecha_nacimiento = p_fecha_nacimiento,
                    foto_perfil = p_foto_perfil,
                    genero = p_genero,
                    pais_nacimiento = p_pais_nacimiento,
                    nacionalidad = p_nacionalidad,
                    email = p_email,
                    contrasena = p_contrasena
                WHERE id_usuario = p_id_usuario;
                
            ELSEIF p_actualizar_contrasena = TRUE AND p_actualizar_foto = FALSE THEN
                -- Actualizar sin foto pero con contraseña
                UPDATE Usuario SET
                    nombre_completo = p_nombre_completo,
                    fecha_nacimiento = p_fecha_nacimiento,
                    genero = p_genero,
                    pais_nacimiento = p_pais_nacimiento,
                    nacionalidad = p_nacionalidad,
                    email = p_email,
                    contrasena = p_contrasena
                WHERE id_usuario = p_id_usuario;
                
            ELSEIF p_actualizar_contrasena = FALSE AND p_actualizar_foto = TRUE THEN
                -- Actualizar con foto pero sin contraseña
                UPDATE Usuario SET
                    nombre_completo = p_nombre_completo,
                    fecha_nacimiento = p_fecha_nacimiento,
                    foto_perfil = p_foto_perfil,
                    genero = p_genero,
                    pais_nacimiento = p_pais_nacimiento,
                    nacionalidad = p_nacionalidad,
                    email = p_email
                WHERE id_usuario = p_id_usuario;
                
            ELSE
                -- Actualizar sin foto ni contraseña
                UPDATE Usuario SET
                    nombre_completo = p_nombre_completo,
                    fecha_nacimiento = p_fecha_nacimiento,
                    genero = p_genero,
                    pais_nacimiento = p_pais_nacimiento,
                    nacionalidad = p_nacionalidad,
                    email = p_email
                WHERE id_usuario = p_id_usuario;
            END IF;
            
            SET p_codigo = 200;
            SET p_mensaje = 'Usuario actualizado exitosamente';
            
            -- Confirmar transacción
            COMMIT;
        END IF;
    END IF;
END$$

-- ============================================
-- Procedimiento: sp_obtener_usuario_por_email
-- Descripción: Obtiene los datos de un usuario por su email
-- ============================================
CREATE PROCEDURE sp_obtener_usuario_por_email(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT 
        id_usuario,
        nombre_completo,
        fecha_nacimiento,
        LENGTH(foto_perfil) as tiene_foto,
        genero,
        pais_nacimiento,
        nacionalidad,
        email,
        contrasena,
        fecha_registro,
        is_admin
    FROM Usuario
    WHERE email = p_email
    LIMIT 1;
END$$

-- ============================================
-- Procedimiento: sp_obtener_usuario_por_id
-- Descripción: Obtiene los datos de un usuario por su ID
-- ============================================
CREATE PROCEDURE sp_obtener_usuario_por_id(
    IN p_id_usuario INT
)
BEGIN
    SELECT 
        id_usuario,
        nombre_completo,
        fecha_nacimiento,
        LENGTH(foto_perfil) as tiene_foto,
        genero,
        pais_nacimiento,
        nacionalidad,
        email,
        fecha_registro,
        is_admin
    FROM Usuario
    WHERE id_usuario = p_id_usuario
    LIMIT 1;
END$$

-- ============================================
-- Procedimiento: sp_verificar_email_existe
-- Descripción: Verifica si un email ya está registrado
-- ============================================
CREATE PROCEDURE sp_verificar_email_existe(
    IN p_email VARCHAR(255),
    OUT p_existe BOOLEAN
)
BEGIN
    DECLARE email_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO email_count
    FROM Usuario
    WHERE email = p_email;
    
    IF email_count > 0 THEN
        SET p_existe = TRUE;
    ELSE
        SET p_existe = FALSE;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- Verificar que los procedimientos se crearon correctamente
-- ============================================
SHOW PROCEDURE STATUS WHERE Db = 'MundialBDM';

-- ============================================
-- Ejemplos de uso (comentados)
-- ============================================

/*
-- Ejemplo 1: Registrar usuario
CALL sp_registrar_usuario(
    'Juan Pérez García',
    '2005-05-15',
    NULL,
    'masculino',
    'México',
    'Mexicana',
    'juan.perez@example.com',
    '$2y$10$hashedpassword',
    FALSE,
    @id_usuario,
    @mensaje,
    @codigo
);
SELECT @id_usuario, @mensaje, @codigo;

-- Ejemplo 2: Verificar si email existe
CALL sp_verificar_email_existe('juan.perez@example.com', @existe);
SELECT @existe;

-- Ejemplo 3: Obtener usuario por email
CALL sp_obtener_usuario_por_email('juan.perez@example.com');

-- Ejemplo 4: Obtener usuario por ID
CALL sp_obtener_usuario_por_id(1);

-- Ejemplo 5: Editar usuario (sin cambiar contraseña ni foto)
CALL sp_editar_usuario(
    1,
    'Juan Pérez García Actualizado',
    '2005-05-15',
    NULL,
    FALSE,
    'masculino',
    'México',
    'Mexicana',
    'juan.perez@example.com',
    NULL,
    FALSE,
    @mensaje,
    @codigo
);
SELECT @mensaje, @codigo;
*/