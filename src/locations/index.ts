import { ShippingAddress } from '../utils';

export interface LocationAddress {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export const pickupLocations: LocationAddress[] = [
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
  {
    name: 'Boulder Savory Spice Shop',
    address1: '2041 Broadway #1',
    address2: '',
    city: 'Boulder',
    zip: '80302',
  },
];

export function getPickupAddress(name: string) {
  return pickupLocations.find((location) => location.name === name);
}
