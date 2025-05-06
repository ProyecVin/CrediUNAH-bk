-- Crear usuario
CREATE OR REPLACE FUNCTION create_user(
  p_nombre TEXT,
  p_apellido TEXT,
  p_correo TEXT
) RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY
  INSERT INTO users (nombre, apellido, correo)
  VALUES (p_nombre, p_apellido, p_correo)
  RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- Leer usuario por ID
CREATE OR REPLACE FUNCTION read_user(p_id INT)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM users WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Actualizar usuario
CREATE OR REPLACE FUNCTION update_user(
  p_id INT,
  p_nombre TEXT,
  p_apellido TEXT,
  p_correo TEXT
) RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY
  UPDATE users
  SET nombre = p_nombre, apellido = p_apellido, correo = p_correo
  WHERE id = p_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- Eliminar usuario
CREATE OR REPLACE FUNCTION delete_user(p_id INT)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY
  DELETE FROM users
  WHERE id = p_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql;