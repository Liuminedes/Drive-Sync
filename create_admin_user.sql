-- Primero, nos aseguramos de que la extensión pgcrypto esté activa (Supabase la trae por defecto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insertar un nuevo usuario Administrador Maestro
-- O si ya existe el correo, actualizar su contraseña
INSERT INTO usuarios (tenant_id, nombre_completo, email, rol, password_hash)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'Administrador Principal', 
  'admin@drivesync.com', 
  'ADMIN', 
  crypt('admin123456', gen_salt('bf', 10)) -- Contraseña por defecto: admin123456
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = crypt('admin123456', gen_salt('bf', 10)),
  rol = 'ADMIN';

-- ¡IMPORTANTE! 
-- Tu correo de acceso será: admin@drivesync.com
-- Tu contraseña de acceso será: admin123456
-- (Te recomiendo cambiar el correo o contraseña desde la app una vez ingreses)
