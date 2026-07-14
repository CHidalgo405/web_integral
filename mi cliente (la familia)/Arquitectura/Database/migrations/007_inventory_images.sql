BEGIN;

-- Soporte de imágenes administradas en Cloudinary para instalaciones existentes.
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(120);

COMMIT;
