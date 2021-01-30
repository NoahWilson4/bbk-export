export interface LocationAddress {
  name: string;
  city: string;
}

export function isLocationAddress(data: any): data is LocationAddress {
  return data && data.name && data.city;
}

export interface PickupAddress extends LocationAddress {
  type: 'pickup';
  address1: string;
  address2?: string;
  zip: string;
}

export function isPickupAddress(data: any): data is PickupAddress {
  return (
    data &&
    data.type === 'pickup' &&
    data.address1 &&
    data.zip &&
    isLocationAddress(data)
  );
}

export interface DeliveryAddress extends LocationAddress {
  type: 'delivery';
}

export function isDeliveryAddress(data: any): data is DeliveryAddress {
  return data && data.type === 'delivery' && isLocationAddress(data);
}

export const deliveryLocations: DeliveryAddress[] = [
  { name: 'Louisville Home Delivery', city: 'Louisville', type: 'delivery' },
  { name: 'Boulder Home Delivery', city: 'Boulder', type: 'delivery' },
  { name: 'Lafayette Home Delivery', city: 'Lafayette', type: 'delivery' },
  { name: 'Longmont Home Delivery', city: 'Longmont', type: 'delivery' },
  { name: 'Broomfield Home Delivery', city: 'Broomfield', type: 'delivery' },
];

export const pickupLocations: PickupAddress[] = [
  {
    type: 'pickup',
    name: 'Broomfield Curbside',
    address1: '1480 W Midway Blvd',
    address2: '',
    city: 'Broomfield',
    zip: '80020',
  },
  {
    type: 'pickup',
    name: 'Broomfield Store Pick Up',
    address1: '1480 W Midway Blvd',
    address2: '',
    city: 'Broomfield',
    zip: '80020',
  },
  {
    type: 'pickup',
    name: 'Louisville Family Center',
    address1: '924 Main Street',
    address2: '',
    city: 'Louisville',
    zip: '80027',
  },
  {
    type: 'pickup',
    name: 'Boulder Fermentation pick up',
    address1: '2510 47th St',
    address2: '',
    city: 'Boulder',
    zip: '80301',
  },
  {
    type: 'pickup',
    name: 'Boulder Savory Spice',
    address1: '2041 Broadway #1',
    address2: '',
    city: 'Boulder',
    zip: '80302',
  },
];

export function getPickupAddress(name: string) {
  return pickupLocations.find((location) => location.name === name);
}

export function getDeliveryAddressByName(name: string) {
  return deliveryLocations.find((location) => location.name === name);
}

export function getLocationByName(name: string) {
  return getPickupAddress(name) || getDeliveryAddressByName(name);
}

export function getLocationFromTags(tags: string[]) {
  for (const tag of tags) {
    const address = getLocationByName(tag);
    if (address) return address;
  }
}
