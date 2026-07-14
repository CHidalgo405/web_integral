const radians = (degrees) => degrees * Math.PI / 180;

const distanceKm = (aLat, aLng, bLat, bLng) => {
  const dLat = radians(bLat - aLat);
  const dLng = radians(bLng - aLng);
  const value = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(aLat)) * Math.cos(radians(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const selectZone = (zones, distance) => {
  const outer = zones.length ? Math.max(...zones.map(zone => Number(zone.max_km))) : 0;
  return zones.find(zone => distance >= Number(zone.min_km)
    && (distance < Number(zone.max_km) || (distance <= outer && Number(zone.max_km) === outer))) || null;
};

const feeFor = (zone, distance) => Number((Number(zone.base_fee) + Number(zone.fee_per_km) * distance).toFixed(2));

module.exports = { distanceKm, selectZone, feeFor };
