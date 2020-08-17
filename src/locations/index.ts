import { ShippingAddress } from '../utils';

export const pickupLocations: ShippingAddress[] = [
  {
    name: 'Broomfield Store Pick Up',
    address1: '1480 W Midway Blvd',
    address2: '',
    city: 'Broomfield',
    zip: '80020',
  },
  {
    name: 'Louisville Family Center',
    address1: '924 Main Street',
    address2: '',
    city: 'Louisville',
    zip: '80027',
  },
  {
    name: 'Boulder Fermentation pick up',
    address1: '2510 47th St',
    address2: '',
    city: 'Boulder',
    zip: '80301',
  },
];

export function getPickupAddress(name: string) {
  return pickupLocations.find((location) => location.name === name);
}
