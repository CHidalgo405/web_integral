const error = (message, status) => Object.assign(new Error(message), { status });

const assertContiguous = (zones) => {
  const sorted = zones
    .filter((zone) => zone.active !== false)
    .sort((a, b) => Number(a.min_km) - Number(b.min_km));

  if (!sorted.length) return;
  if (Math.abs(Number(sorted[0].min_km)) > 0.001) {
    throw error('La primera zona debe comenzar en 0 km', 400);
  }

  for (let index = 0; index < sorted.length; index += 1) {
    const zone = sorted[index];
    if (Number(zone.max_km) <= Number(zone.min_km)) {
      throw error('Cada radio máximo debe superar al mínimo', 400);
    }
    if (index && Math.abs(Number(zone.min_km) - Number(sorted[index - 1].max_km)) > 0.001) {
      throw error('Las zonas deben ser contiguas, sin huecos ni traslapes', 409);
    }
  }
};

const prepareZoneUpdate = (zones, id, changes) => {
  const sorted = [...zones].sort((a, b) => Number(a.min_km) - Number(b.min_km));
  const index = sorted.findIndex((zone) => zone.id === id);
  if (index === -1) throw error('Zona de entrega no encontrada', 404);

  const original = sorted[index];
  const target = { ...original, ...changes };
  const minChanged = Math.abs(Number(target.min_km) - Number(original.min_km)) > 0.001;
  const maxChanged = Math.abs(Number(target.max_km) - Number(original.max_km)) > 0.001;
  const previous = minChanged && index > 0
    ? { ...sorted[index - 1], max_km: target.min_km }
    : null;
  const next = maxChanged && index < sorted.length - 1
    ? { ...sorted[index + 1], min_km: target.max_km }
    : null;

  const proposed = sorted.map((zone) => {
    if (zone.id === target.id) return target;
    if (previous && zone.id === previous.id) return previous;
    if (next && zone.id === next.id) return next;
    return zone;
  });
  assertContiguous(proposed);

  return { target, previous, next };
};

module.exports = { assertContiguous, prepareZoneUpdate };
