# Administración y gerencia — Tiendita Maday

## Modelo unificado

La tienda utiliza un solo espacio de gestión en `/admin` para los roles `admin`
y `manager`. Se conservan ambos valores para identificar responsabilidades en
auditorías y en la interfaz, pero sus permisos operativos son equivalentes.

No se requiere migrar ni convertir cuentas existentes. Un gerente solo necesita
cerrar sesión y volver a entrar después del despliegue para recibir un JWT nuevo.

## Capacidades compartidas

- Consultar el resumen, métricas y actividad del negocio.
- Administrar productos, categorías, precios y existencias.
- Consultar y actualizar pedidos.
- Administrar usuarios y asignar roles.
- Consultar proveedores, compras, gastos, caja y reportes internos.
- Abrir el módulo de inventario.
- Abrir el punto de venta cuando sea necesario.

## Comportamiento de acceso

- Al iniciar sesión, `admin` y `manager` son enviados a `/admin`.
- El backend interpreta `manager` como heredero de cualquier permiso que requiera
  `admin`, sin cambiar el rol guardado en PostgreSQL.
- El panel identifica al gerente con la leyenda **Gerencia de Tienda**.
- Clientes, cajeros y encargados de almacén no heredan permisos administrativos.

## Consideración de seguridad

Asignar el rol **Gerente (acceso administrativo)** concede control completo del
negocio, incluida la administración de usuarios. Debe entregarse únicamente a
personal de confianza. El administrador y el gerente no pueden desactivar su
propia cuenta ni retirarse a sí mismos los permisos administrativos desde el panel.

## Pruebas

Las pruebas de autorización se ejecutan dentro de `Arquitectura/Backend`:

```bash
npm test
```

La suite comprueba que `manager` alcanza validaciones de usuarios, caja, inventario
y punto de venta, mientras los roles operativos permanecen restringidos.
