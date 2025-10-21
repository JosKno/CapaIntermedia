CREATE DATABASE MundialBDM;
USE MundialBDM;

CREATE TABLE Usuario (
    id_usuario INT auto_increment PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE,
    foto_perfil VARCHAR(255) COMMENT 'Ruta o URL de la imagen de perfil',
    genero VARCHAR(20) COMMENT 'Género del usuario',
    pais_nacimiento VARCHAR(100),
    nacionalidad VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Correo electrónico (debe ser único)',
    contrasena VARCHAR(255) NOT NULL COMMENT 'Contraseña',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de creación de la cuenta',
    is_admin BOOLEAN DEFAULT FALSE COMMENT 'Indica si el usuario tiene permisos de administrador (TRUE/FALSE)'
);

CREATE TABLE Mundial (
    id_mundial INT auto_increment PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL COMMENT 'Nombre oficial del evento',
    año INT NOT NULL,
    sede VARCHAR(100) COMMENT 'País(es) anfitrión(es) del mundial',
    descripcion TEXT,
    logotipo VARCHAR(255) COMMENT 'Ruta o URL del logotipo del mundial',
    mascota VARCHAR(100),
    banner VARCHAR(255) COMMENT 'Ruta o URL de la imagen de banner'
);

CREATE TABLE Categoria (
    id_categoria INT auto_increment PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre de la categoría',
    descripcion TEXT
);

CREATE TABLE Publicacion (
    id_publicacion INT auto_increment PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    vistas INT DEFAULT 0 COMMENT 'Contador de visualizaciones de la publicación',
    multimedia_tipo VARCHAR(50) COMMENT 'Tipo de contenido multimedia (ej: imagen, video, gif)',
    multimedia_archivo VARCHAR(255) COMMENT 'Ruta o URL del archivo multimedia',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion DATETIME COMMENT 'Fecha y hora en que la publicación fue aprobada por un administrador',
    estado VARCHAR(50) NOT NULL COMMENT 'Estado de la publicación',
    seleccion VARCHAR(100) COMMENT 'Selección nacional a la que se refiere la publicación (opcional)',
    id_categoria INT NOT NULL,
    id_mundial INT,
    id_usuario INT NOT NULL,
    
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria),
    FOREIGN KEY (id_mundial) REFERENCES Mundial(id_mundial),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Comentario (
    id_comentario INT auto_increment PRIMARY KEY,
    texto_comentario TEXT NOT NULL COMMENT 'Contenido del comentario',
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	estado VARCHAR(50) NOT NULL COMMENT 'Estado del comentario',
    id_publicacion INT NOT NULL,
    id_usuario INT NOT NULL,
    
    FOREIGN KEY (id_publicacion) REFERENCES Publicacion(id_publicacion),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Likes (
    id_publicacion INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_like TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se dio el Like',
    
    PRIMARY KEY (id_publicacion, id_usuario) COMMENT 'Clave compuesta que asegura un solo like por usuario por publicación',
    FOREIGN KEY (id_publicacion) REFERENCES Publicacion(id_publicacion),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

Show full columns from Usuario;
Show full columns from Mundial;
Show full columns from Publicacion;
Show full columns from Categoria;
Show full columns from Comentario;
Show full columns from Likes;