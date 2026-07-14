const fs = require('fs');
const path = require('path');
const db = require('../src/db');

const IMAGE_PREFIX = '/assets/images/productos/catalogo';
const IMAGE_ROOT = path.resolve(__dirname, '../../FrontEnd/public');

const categories = [
  { slug: 'beverages', name: 'Bebidas' },
  { slug: 'groceries', name: 'Abarrotes' },
  { slug: 'fruits', name: 'Frutas y verduras' },
  { slug: 'bakery', name: 'Panadería' },
  { slug: 'dairy', name: 'Lácteos y huevos' },
  { slug: 'canned-goods', name: 'Enlatados' },
  { slug: 'snacks', name: 'Botanas y dulces' },
  { slug: 'cleaning', name: 'Limpieza y hogar' },
];

const products = [
  {
    sku: 'BEB-COCA-600', name: 'Coca-Cola Original 600 ml', category: 'beverages', unit: 'u',
    price: 18, cost: 13.5, stock: 48, minStock: 12, expires: true,
    image: 'coca-cola-600ml.webp',
    description: 'Refresco de cola Coca-Cola Original en botella individual de 600 ml, ideal para acompañar tus alimentos.',
  },
  {
    sku: 'BEB-AGUA-600', name: 'Agua purificada 600 ml', category: 'beverages', unit: 'u',
    price: 10, cost: 5.5, stock: 72, minStock: 18, expires: true,
    image: 'agua-purificada-600ml.webp',
    description: 'Agua purificada sin gas en botella de 600 ml, práctica para llevar y mantenerse hidratado.',
  },
  {
    sku: 'ABA-ARROZ-1K', name: 'Arroz blanco 1 kg', category: 'groceries', unit: 'u',
    price: 34, cost: 26, stock: 36, minStock: 8, expires: false,
    image: 'arroz-blanco-1kg.webp',
    description: 'Arroz blanco de grano largo en presentación de 1 kg, rendidor y fácil de preparar para comidas familiares.',
  },
  {
    sku: 'FYV-LECHUGA-PZ', name: 'Lechuga iceberg por pieza', category: 'fruits', unit: 'u',
    price: 24, cost: 15, stock: 24, minStock: 6, expires: true,
    image: 'lechuga-iceberg-pieza.webp',
    description: 'Lechuga iceberg fresca y crujiente, seleccionada por pieza para ensaladas, tortas y guarniciones.',
  },
  {
    sku: 'PAN-BLANCO-680', name: 'Pan blanco 680 g', category: 'bakery', unit: 'u',
    price: 48, cost: 37, stock: 20, minStock: 5, expires: true,
    image: 'pan-blanco-680g.webp',
    description: 'Pan blanco rebanado de textura suave en bolsa de 680 g, perfecto para sándwiches y desayunos.',
  },
  {
    sku: 'ABA-ACEITE-1L', name: 'Aceite vegetal 1 L', category: 'groceries', unit: 'u',
    price: 45, cost: 35, stock: 30, minStock: 8, expires: false,
    image: 'aceite-vegetal-1l.webp',
    description: 'Aceite vegetal comestible de 1 litro para cocinar, freír y preparar aderezos de uso diario.',
  },
  {
    sku: 'LAC-LECHE-1L', name: 'Leche entera 1 L', category: 'dairy', unit: 'u',
    price: 31, cost: 24, stock: 36, minStock: 10, expires: true,
    image: 'leche-entera-1l.webp',
    description: 'Leche entera pasteurizada en envase de 1 litro, fuente de calcio para toda la familia.',
  },
  {
    sku: 'LAC-HUEVO-12', name: 'Huevo blanco 12 piezas', category: 'dairy', unit: 'doz',
    price: 52, cost: 41, stock: 24, minStock: 6, expires: true,
    image: 'huevo-blanco-12pzas.webp',
    description: 'Docena de huevo blanco fresco, seleccionado y empacado para desayunos y recetas caseras.',
  },
  {
    sku: 'FYV-PLATANO-1K', name: 'Plátano 1 kg', category: 'fruits', unit: 'kg',
    price: 28, cost: 20, stock: 35, minStock: 8, expires: true,
    image: 'platano-1kg.webp',
    description: 'Plátano fresco vendido por kilogramo, naturalmente dulce y listo para consumir o preparar licuados.',
  },
  {
    sku: 'ENL-ATUN-140', name: 'Atún en agua 140 g', category: 'canned-goods', unit: 'u',
    price: 24, cost: 18, stock: 42, minStock: 10, expires: false,
    image: 'atun-en-agua-140g.webp',
    description: 'Atún en agua en lata de 140 g, práctico para ensaladas, tostadas y comidas rápidas.',
  },
  {
    sku: 'FYV-JITOMATE-1K', name: 'Jitomate saladet 1 kg', category: 'fruits', unit: 'kg',
    price: 34, cost: 24, stock: 32, minStock: 8, expires: true,
    image: 'jitomate-saladet-1kg.webp',
    description: 'Jitomate saladet fresco vendido por kilogramo, ideal para salsas, ensaladas y guisados.',
  },
  {
    sku: 'FYV-CEBOLLA-1K', name: 'Cebolla blanca 1 kg', category: 'fruits', unit: 'kg',
    price: 29, cost: 20, stock: 30, minStock: 7, expires: true,
    image: 'cebolla-blanca-1kg.webp',
    description: 'Cebolla blanca fresca por kilogramo, básica para sazonar y complementar platillos mexicanos.',
  },
  {
    sku: 'FYV-PAPA-1K', name: 'Papa blanca 1 kg', category: 'fruits', unit: 'kg',
    price: 33, cost: 24, stock: 40, minStock: 10, expires: true,
    image: 'papa-blanca-1kg.webp',
    description: 'Papa blanca seleccionada por kilogramo, versátil para freír, cocer, hornear o preparar puré.',
  },
  {
    sku: 'ABA-AZUCAR-1K', name: 'Azúcar estándar 1 kg', category: 'groceries', unit: 'u',
    price: 31, cost: 24.5, stock: 34, minStock: 8, expires: false,
    image: 'azucar-estandar-1kg.webp',
    description: 'Azúcar estándar de caña en bolsa de 1 kg para bebidas, postres y preparación de alimentos.',
  },
  {
    sku: 'ABA-SPAGHETTI-200', name: 'Spaghetti 200 g', category: 'groceries', unit: 'u',
    price: 14, cost: 9.5, stock: 45, minStock: 10, expires: false,
    image: 'spaghetti-200g.webp',
    description: 'Pasta tipo spaghetti de trigo en paquete de 200 g, de cocción uniforme para comidas completas.',
  },
  {
    sku: 'ABA-CAFE-200', name: 'Café soluble clásico 200 g', category: 'groceries', unit: 'u',
    price: 89, cost: 70, stock: 18, minStock: 5, expires: false,
    image: 'cafe-soluble-200g.webp',
    description: 'Café soluble clásico en frasco de 200 g, aroma intenso y preparación rápida para cualquier momento.',
  },
  {
    sku: 'ABA-CATSUP-397', name: 'Salsa cátsup 397 g', category: 'groceries', unit: 'u',
    price: 28, cost: 21, stock: 25, minStock: 6, expires: false,
    image: 'salsa-catsup-397g.webp',
    description: 'Salsa cátsup de tomate en botella de 397 g, complemento clásico para botanas y comidas.',
  },
  {
    sku: 'BOT-GALLETAS-300', name: 'Galletas con crema de chocolate 300 g', category: 'snacks', unit: 'u',
    price: 32, cost: 24, stock: 28, minStock: 7, expires: false,
    image: 'galletas-chocolate-300g.webp',
    description: 'Galletas de chocolate con relleno cremoso en paquete de 300 g para compartir en familia.',
  },
  {
    sku: 'ENL-FRIJOL-430', name: 'Frijoles refritos 430 g', category: 'canned-goods', unit: 'u',
    price: 24, cost: 17, stock: 32, minStock: 8, expires: false,
    image: 'frijoles-refritos-430g.webp',
    description: 'Frijoles refritos listos para calentar en lata de 430 g, ideales como guarnición o para antojitos.',
  },
  {
    sku: 'LIM-LAVATRASTES-750', name: 'Lavatrastes líquido 750 ml', category: 'cleaning', unit: 'u',
    price: 31, cost: 23, stock: 24, minStock: 6, expires: false,
    image: 'lavatrastes-liquido-750ml.webp',
    description: 'Lavatrastes líquido con aroma cítrico en botella de 750 ml, efectivo contra grasa y residuos.',
  },
  {
    sku: 'FYV-MANZANA-1K', name: 'Manzana roja 1 kg', category: 'fruits', unit: 'kg',
    price: 49, cost: 36, stock: 28, minStock: 7, expires: true,
    image: 'manzana-roja-1kg.webp',
    description: 'Manzana roja fresca por kilogramo, crujiente y dulce para colaciones, postres o desayunos.',
  },
  {
    sku: 'FYV-NARANJA-1K', name: 'Naranja 1 kg', category: 'fruits', unit: 'kg',
    price: 32, cost: 22, stock: 35, minStock: 8, expires: true,
    image: 'naranja-1kg.webp',
    description: 'Naranja fresca y jugosa por kilogramo, ideal para consumir al natural o preparar jugo.',
  },
  {
    sku: 'FYV-AGUACATE-1K', name: 'Aguacate Hass 1 kg', category: 'fruits', unit: 'kg',
    price: 89, cost: 68, stock: 22, minStock: 6, expires: true,
    image: 'aguacate-hass-1kg.webp',
    description: 'Aguacate Hass seleccionado por kilogramo, de textura cremosa para guacamole y acompañamientos.',
  },
  {
    sku: 'FYV-ZANAHORIA-1K', name: 'Zanahoria 1 kg', category: 'fruits', unit: 'kg',
    price: 25, cost: 17, stock: 30, minStock: 7, expires: true,
    image: 'zanahoria-1kg.webp',
    description: 'Zanahoria fresca por kilogramo, firme y versátil para sopas, ensaladas, guisos y jugos.',
  },
  {
    sku: 'ABA-CEREAL-500', name: 'Cereal con miel 500 g', category: 'groceries', unit: 'u',
    price: 62, cost: 47, stock: 20, minStock: 5, expires: false,
    image: 'cereal-con-miel-500g.webp',
    description: 'Cereal crujiente con miel en caja de 500 g, opción práctica para desayunos con leche o yogurt.',
  },
  {
    sku: 'LAC-YOGURT-1K', name: 'Yogurt de fresa 1 kg', category: 'dairy', unit: 'u',
    price: 58, cost: 44, stock: 18, minStock: 5, expires: true,
    image: 'yogurt-fresa-1kg.webp',
    description: 'Yogurt cremoso sabor fresa en presentación familiar de 1 kg, ideal para desayunos y colaciones.',
  },
  {
    sku: 'BOT-TOTOPOS-300', name: 'Totopos de maíz 300 g', category: 'snacks', unit: 'u',
    price: 37, cost: 28, stock: 24, minStock: 6, expires: false,
    image: 'totopos-300g.webp',
    description: 'Totopos de maíz crujientes en bolsa de 300 g, perfectos para acompañar salsas, frijoles o guacamole.',
  },
  {
    sku: 'ENL-ELOTE-410', name: 'Elote dorado 410 g', category: 'canned-goods', unit: 'u',
    price: 24, cost: 18, stock: 30, minStock: 7, expires: false,
    image: 'elote-dorado-410g.webp',
    description: 'Granos de elote dorado en lata de 410 g, listos para ensaladas, sopas, guarniciones y antojitos.',
  },
  {
    sku: 'LIM-JABON-6P', name: 'Jabón en barra 6 piezas', category: 'cleaning', unit: 'pack',
    price: 52, cost: 39, stock: 22, minStock: 6, expires: false,
    image: 'jabon-barra-6pzas.webp',
    description: 'Paquete con 6 barras de jabón para limpieza cotidiana, con espuma abundante y aroma fresco.',
  },
  {
    sku: 'LIM-PAPEL-12R', name: 'Papel higiénico 12 rollos', category: 'cleaning', unit: 'pack',
    price: 89, cost: 67, stock: 20, minStock: 5, expires: false,
    image: 'papel-higienico-12-rollos.webp',
    description: 'Paquete familiar de papel higiénico de doble hoja con 12 rollos, suave y resistente.',
  },
];

function ean13(sequence) {
  const base = `20${String(sequence).padStart(10, '0')}`;
  const sum = [...base].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0);
  return `${base}${(10 - (sum % 10)) % 10}`;
}

function validateImages() {
  const missing = products
    .map((product) => product.image)
    .filter((image) => !fs.existsSync(path.join(IMAGE_ROOT, IMAGE_PREFIX, image)));

  if (missing.length) throw new Error(`Faltan imágenes del catálogo: ${missing.join(', ')}`);
}

async function run() {
  validateImages();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const categoryIds = new Map();
    for (const category of categories) {
      const { rows: [row] } = await client.query(
        `INSERT INTO categories (name, slug)
         VALUES ($1, $2)
         ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name
         RETURNING id`,
        [category.name, category.slug],
      );
      categoryIds.set(category.slug, row.id);
    }

    const { rows: units } = await client.query('SELECT id, abbreviation FROM units_of_measure');
    const unitIds = new Map(units.map((unit) => [unit.abbreviation, unit.id]));
    const requiredUnits = new Set(products.map((product) => product.unit));
    const missingUnits = [...requiredUnits].filter((unit) => !unitIds.has(unit));
    if (missingUnits.length) throw new Error(`Faltan unidades de medida: ${missingUnits.join(', ')}`);

    const skus = products.map((product) => product.sku);
    const { rows: deactivated } = await client.query(
      `UPDATE inventory
       SET active=FALSE, updated_at=NOW()
       WHERE active=TRUE AND (sku IS NULL OR NOT (sku=ANY($1::varchar[])))
       RETURNING id, name`,
      [skus],
    );

    let inserted = 0;
    let updated = 0;
    for (const [index, product] of products.entries()) {
      const imageUrl = `${IMAGE_PREFIX}/${product.image}`;
      const { rows: [row] } = await client.query(
        `INSERT INTO inventory
          (name, sku, description, category_id, uom_id, price, cost, stock, min_stock,
           has_expiration, active, image_url, image_public_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE,$11,NULL)
         ON CONFLICT (sku) DO UPDATE SET
           name=EXCLUDED.name,
           description=EXCLUDED.description,
           category_id=EXCLUDED.category_id,
           uom_id=EXCLUDED.uom_id,
           price=EXCLUDED.price,
           cost=EXCLUDED.cost,
           stock=EXCLUDED.stock,
           min_stock=EXCLUDED.min_stock,
           has_expiration=EXCLUDED.has_expiration,
           active=TRUE,
           image_url=EXCLUDED.image_url,
           image_public_id=NULL,
           updated_at=NOW()
         RETURNING id, (xmax=0) AS inserted`,
        [
          product.name, product.sku, product.description, categoryIds.get(product.category),
          unitIds.get(product.unit), product.price, product.cost, product.stock, product.minStock,
          product.expires, imageUrl,
        ],
      );

      if (row.inserted) {
        inserted += 1;
        await client.query(
          `INSERT INTO inventory_movements
            (inventory_id, movement_type, quantity_delta, previous_stock, new_stock, reason, notes)
           VALUES ($1, 'entry', $2, 0, $2, 'Carga inicial de catálogo', 'Catálogo 1:1 de 30 productos')`,
          [row.id, product.stock],
        );
      } else {
        updated += 1;
      }

      const barcode = ean13(index + 1);
      await client.query('DELETE FROM product_barcodes WHERE inventory_id=$1 AND barcode<>$2', [row.id, barcode]);
      await client.query(
        `INSERT INTO product_barcodes (barcode, inventory_id, description)
         VALUES ($1,$2,$3)
         ON CONFLICT (barcode) DO UPDATE SET inventory_id=EXCLUDED.inventory_id, description=EXCLUDED.description`,
        [barcode, row.id, `Código interno de ${product.name}`],
      );
    }

    const categorySlugs = categories.map((category) => category.slug);
    const { rows: removedCategories } = await client.query(
      `DELETE FROM categories c
       WHERE NOT (c.slug=ANY($1::varchar[]))
         AND NOT EXISTS (SELECT 1 FROM inventory i WHERE i.category_id=c.id)
         AND NOT EXISTS (SELECT 1 FROM categories child WHERE child.parent_id=c.id)
       RETURNING c.id, c.name`,
      [categorySlugs],
    );

    const { rows: [summary] } = await client.query(
      `SELECT COUNT(*)::int AS active_products,
              COUNT(*) FILTER (WHERE image_url LIKE $1)::int AS catalog_images,
              COUNT(*) FILTER (WHERE category_id IS NULL OR uom_id IS NULL)::int AS incomplete_products
       FROM inventory WHERE active=TRUE`,
      [`${IMAGE_PREFIX}/%`],
    );

    if (summary.active_products !== products.length || summary.catalog_images !== products.length || summary.incomplete_products !== 0) {
      throw new Error(`Validación final fallida: ${JSON.stringify(summary)}`);
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({
      deactivated: deactivated.length,
      inserted,
      updated,
      removed_categories: removedCategories.length,
      ...summary,
    }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await db.end();
  }
}

run().catch((error) => {
  console.error('No se pudo cargar el catálogo:', error.message);
  process.exitCode = 1;
});
