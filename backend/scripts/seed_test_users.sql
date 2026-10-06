-- =====================================================================
-- ASHAKids - Seed de Usuarios de Prueba (Entorno de Desarrollo)
-- Adaptado al esquema oficial de base de datos de ASHAKids
-- Hashes generados con algoritmo Argon2id (app.core.security.hash_password)
-- Contrasena inicial de desarrollo: 12345
-- =====================================================================

BEGIN;

-- 1. Asegurar roles base en tabla 'roles'
INSERT INTO roles (nombre_rol, descripcion, fecha_creacion)
VALUES 
    ('ADMIN', 'Administrador del sistema con control total', NOW()),
    ('TERAPEUTA', 'Profesional especialista clinico', NOW()),
    ('PADRE', 'Tutor o padre de familia a cargo del nino', NOW())
ON CONFLICT (nombre_rol) DO UPDATE SET descripcion = EXCLUDED.descripcion;

-- 2. Insercion de usuarios en tabla 'usuarios' (columnas exactas del esquema)
INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo, fecha_creacion) VALUES ('Administrador', 'Sistema', 'a00001', 'admin@ashakids.test', '$argon2id$v=19$m=65536,t=3,p=4$Pw3fw/c/HJgASf1M4Qlvkw$J9BCUTWcQbcwLn9H7s3UXy0qh2imlFiQYbUP27olfPA', true, NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$Pw3fw/c/HJgASf1M4Qlvkw$J9BCUTWcQbcwLn9H7s3UXy0qh2imlFiQYbUP27olfPA', activo = true;
INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo, fecha_creacion) VALUES ('Terapeuta', 'Especialista', 't00001', 'terapeuta@ashakids.test', '$argon2id$v=19$m=65536,t=3,p=4$lc7SwIPDB1/Ll04LtfTZsg$3DW0xZ43l0/PNjl+9EV0Dh4nALqMpGxfrm+Edq0dmiA', true, NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$lc7SwIPDB1/Ll04LtfTZsg$3DW0xZ43l0/PNjl+9EV0Dh4nALqMpGxfrm+Edq0dmiA', activo = true;
INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo, fecha_creacion) VALUES ('Padre', 'Familia', 'p00001', 'padre@ashakids.test', '$argon2id$v=19$m=65536,t=3,p=4$mzEy306KyTa6scGWo6wYvQ$8dl9ZCyZuOqPdqe+ErHIgoQ2qW5UF33Yc7uXjKngtyY', true, NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$mzEy306KyTa6scGWo6wYvQ$8dl9ZCyZuOqPdqe+ErHIgoQ2qW5UF33Yc7uXjKngtyY', activo = true;

-- 3. Registro en 'administradores' para admin@ashakids.test
INSERT INTO administradores (id_usuario, fecha_creacion)
SELECT u.id_usuario, NOW()
FROM usuarios u
WHERE u.email = 'admin@ashakids.test'
  AND NOT EXISTS (
    SELECT 1 FROM administradores a WHERE a.id_usuario = u.id_usuario
  );

-- 4. Asignacion de roles en 'usuario_roles'
-- Nota: asignado_por es FK -> administradores.id_administrador

-- Rol ADMIN para admin@ashakids.test (auto-asignado por el id_administrador creado)
INSERT INTO usuario_roles (id_usuario, id_rol, asignado_por, fecha_asignacion, activo)
SELECT 
    u.id_usuario,
    r.id_rol,
    a.id_administrador,
    NOW(),
    true
FROM usuarios u
CROSS JOIN roles r
CROSS JOIN administradores a
JOIN usuarios u_admin ON a.id_usuario = u_admin.id_usuario
WHERE u.email = 'admin@ashakids.test'
  AND r.nombre_rol = 'ADMIN'
  AND u_admin.email = 'admin@ashakids.test'
ON CONFLICT DO NOTHING;

-- Rol TERAPEUTA para terapeuta@ashakids.test (asignado por administrador)
INSERT INTO usuario_roles (id_usuario, id_rol, asignado_por, fecha_asignacion, activo)
SELECT 
    u.id_usuario,
    r.id_rol,
    a.id_administrador,
    NOW(),
    true
FROM usuarios u
CROSS JOIN roles r
CROSS JOIN administradores a
JOIN usuarios u_admin ON a.id_usuario = u_admin.id_usuario
WHERE u.email = 'terapeuta@ashakids.test'
  AND r.nombre_rol = 'TERAPEUTA'
  AND u_admin.email = 'admin@ashakids.test'
ON CONFLICT DO NOTHING;

-- Rol PADRE para padre@ashakids.test (asignado por administrador)
INSERT INTO usuario_roles (id_usuario, id_rol, asignado_por, fecha_asignacion, activo)
SELECT 
    u.id_usuario,
    r.id_rol,
    a.id_administrador,
    NOW(),
    true
FROM usuarios u
CROSS JOIN roles r
CROSS JOIN administradores a
JOIN usuarios u_admin ON a.id_usuario = u_admin.id_usuario
WHERE u.email = 'padre@ashakids.test'
  AND r.nombre_rol = 'PADRE'
  AND u_admin.email = 'admin@ashakids.test'
ON CONFLICT DO NOTHING;

COMMIT;
