const test = require('node:test');
const assert = require('node:assert/strict');
const { distanceKm, selectZone, feeFor } = require('../src/utils/delivery');

const zones = [
  { id:'near', min_km:0, max_km:3, base_fee:15, fee_per_km:2 },
  { id:'far', min_km:3, max_km:6, base_fee:25, fee_per_km:3 },
];

test('distance is zero for the store coordinate', () => assert.equal(distanceKm(19.4,-99.1,19.4,-99.1),0));
test('zone boundaries choose the next ring and include the outer edge', () => {
  assert.equal(selectZone(zones,2.999).id,'near');
  assert.equal(selectZone(zones,3).id,'far');
  assert.equal(selectZone(zones,6).id,'far');
  assert.equal(selectZone(zones,6.001),null);
});
test('fee combines base and distance with currency rounding', () => assert.equal(feeFor(zones[0],2.345),19.69));
