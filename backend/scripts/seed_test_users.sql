-- =====================================================================
-- ASHAKids - Seed de Usuarios de Prueba (Entorno de Desarrollo)
-- Hashes generados con algoritmo Argon2id (app.core.security.hash_password)
-- Contrasena inicial de desarrollo: 12345
-- =====================================================================

BEGIN;

-- Insercion de usuarios en tabla 'usuarios'
INSERT INTO usuarios (email, password_hash, activo, creado_en) VALUES ('padre@ashakids.test', '$argon2id$v=19$m=65536,t=3,p=4$P/TJtC/T8lYNZJlVm36n9g$GXIJxNt4OXKufVfhdntELuvieKuG84Jjn32QWNdUoWM', true, NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$P/TJtC/T8lYNZJlVm36n9g$GXIJxNt4OXKufVfhdntELuvieKuG84Jjn32QWNdUoWM';
INSERT INTO usuarios (email, password_hash, activo, creado_en) VALUES ('terapeuta@ashakids.test', '$argon2id$v=19$m=65536,t=3,p=4$p2TuAVJCzf8nnNFsvi52yQ$9NuywFvR29TQrydDshsSJF3ma0nqVtlc9HglTOYyZy0', true, NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$p2TuAVJCzf8nnNFsvi52yQ$9NuywFvR29TQrydDshsSJF3ma0nqVtlc9HglTOYyZy0';
INSERT INTO usuarios (email, password_hash, activo, creado_en) VALUES ('admin@ashakids.test', '$argon2id$v=19$m=65536,t=3,p=4$1g+bYnGFzLIGA6BHJ97bJg$Dwd6bTIoeVR9qhtbFGkbfqc/Skojf+NzhFIVGCM4pbU', true, NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$1g+bYnGFzLIGA6BHJ97bJg$Dwd6bTIoeVR9qhtbFGkbfqc/Skojf+NzhFIVGCM4pbU';

-- Asignacion de roles en 'usuario_roles' (relacion usuarios - roles)
-- Nota: Requiere que los roles correspondientes existan en la tabla 'roles'
INSERT INTO usuario_roles (usuario_id, rol_id) 
SELECT u.id, r.id FROM usuarios u CROSS JOIN roles r 
WHERE u.email = 'admin@ashakids.test' AND r.nombre IN ('admin', 'administrador') 
ON CONFLICT DO NOTHING;

INSERT INTO usuario_roles (usuario_id, rol_id) 
SELECT u.id, r.id FROM usuarios u CROSS JOIN roles r 
WHERE u.email = 'terapeuta@ashakids.test' AND r.nombre IN ('terapeuta') 
ON CONFLICT DO NOTHING;

INSERT INTO usuario_roles (usuario_id, rol_id) 
SELECT u.id, r.id FROM usuarios u CROSS JOIN roles r 
WHERE u.email = 'padre@ashakids.test' AND r.nombre IN ('padre', 'tutor') 
ON CONFLICT DO NOTHING;

COMMIT;
