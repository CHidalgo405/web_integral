const test = require('node:test');
const assert = require('node:assert/strict');
const { prepareZoneUpdate } = require('../src/utils/deliveryZones');

const zones = [
  { id: 'near', min_km: 0, max_km: 3, active: true },
  { id: 'middle', min_km: 3, max_km: 6, active: true },
  { id: 'far', min_km: 6, max_km: 10, active: true },
];

test('moving a zone start moves the previous zone end', () => {
  const result = prepareZoneUpdate(zones, 'middle', { min_km: 4 });
  assert.equal(result.target.min_km, 4);
  assert.equal(result.previous.max_km, 4);
  assert.equal(result.next, null);
});

test('moving a zone end moves the next zone start', () => {
  const result = prepareZoneUpdate(zones, 'middle', { max_km: 8 });
  assert.equal(result.target.max_km, 8);
  assert.equal(result.next.min_km, 8);
  assert.equal(result.previous, null);
});

test('rejects a boundary that would consume an adjacent zone', () => {
  assert.throws(
    () => prepareZoneUpdate(zones, 'middle', { max_km: 11 }),
    /Cada radio máximo debe superar al mínimo/
  );
});

test('the first zone must still start at zero', () => {
  assert.throws(
    () => prepareZoneUpdate(zones, 'near', { min_km: 1 }),
    /La primera zona debe comenzar en 0 km/
  );
});
