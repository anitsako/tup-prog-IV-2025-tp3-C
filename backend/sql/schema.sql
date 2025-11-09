CREATE DATABASE IF NOT EXISTS tp3_vehiculos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tp3_vehiculos;

-- USUARIOS (para auth)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- VEHICULOS
CREATE TABLE IF NOT EXISTS vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(80) NOT NULL,
  modelo VARCHAR(80) NOT NULL,
  patente VARCHAR(20) NOT NULL UNIQUE,
  año INT,
  capacidad_carga DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY patente (patente)
) ENGINE=InnoDB;

-- CONDUCTORES
CREATE TABLE IF NOT EXISTS conductores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  licencia VARCHAR(40) NOT NULL,
  licencia_vencimiento DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY dni (dni)
) ENGINE=InnoDB;

-- VIAJES
CREATE TABLE IF NOT EXISTS viajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id INT NOT NULL,
  conductor_id INT NOT NULL,
  fecha_salida DATETIME NOT NULL,
  fecha_llegada DATETIME NOT NULL,
  origen VARCHAR(120) NOT NULL,
  destino VARCHAR(120) NOT NULL,
  kilometros DECIMAL(10,2) NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_viaje_vehiculo  FOREIGN KEY (vehiculo_id)  REFERENCES vehiculos(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_viaje_conductor FOREIGN KEY (conductor_id) REFERENCES conductores(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  KEY idx_viajes_vehiculo (vehiculo_id),
  KEY idx_viajes_conductor (conductor_id)
) ENGINE=InnoDB;
