import { getLocationFromTags } from './locations';

export interface FetchedOrders {
  orders: {
    edges: Array<{ node: FetchedOrder }>;
  };
}

export interface FetchedOrder {
  id: string;
  displayFulfillmentStatus: string;
  note: string;
  shippingAddress: ShippingAddress;
  tags: string[];
  email: string;
}

export function isFetchedOrder(data: any): data is FetchedOrder {
  return (
    data &&
    typeof data === 'object' &&
    data.id &&
    isShippingAddress(data.shippingAddress)
  );
}

export type FetchedLineItems = FetchedLineItem[];

export interface FetchedLineItem {
  node: OrderItemDetails;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
  phone?: string;
}

export function isShippingAddress(data: any): data is ShippingAddress {
  return data && typeof data === 'object' && data.name;
}

export interface OrderItemDetails {
  quantity: number;
  title: string;
  variantTitle: string;
  fulfillableQuantity: number;
  nonFulfillableQuantity: number;
  errors?: string[];
  originalUnitPriceSet: { shopMoney: { amount: string } };
}

export function isOrderItemDetails(data: any): data is OrderItemDetails {
  return (
    data &&
    typeof data === 'object' &&
    data.title &&
    typeof data.variantTitle === 'string' &&
    typeof data.quantity === 'number' &&
    typeof data.fulfillableQuantity === 'number' &&
    typeof data.nonFulfillableQuantity === 'number'
  );
}

export type Orders = Order[];
export interface Order {
  id: string;
  shippingAddress: ShippingAddress;
  tags: string[];
  items: OrderItemDetails[];
  note: string;
  email: string;
}

export function isOrders(data: any): data is Orders {
  return data && Array.isArray(data) && !data.find((item) => !isOrder(item));
}

export function isOrder(data: any): data is Order {
  if (!data || typeof data !== 'object') {
    console.warn('Expecting an object of order data.', data);
    throw 'Expecting an object of order data.';
  }

  if (!data.id) {
    console.warn('Order is missing an ID.', data);
    throw 'Order is missing an ID.';
  }

  if (!isShippingAddress(data.shippingAddress)) {
    console.warn("The order's shipping data is not correct.", data);
    throw "The order's shipping data is not correct.";
  }

  if (!data.tags?.length) {
    console.warn('No location tags were provided.', data);
    throw 'No location tags were provided.';
  }

  if (!getLocationFromTags(data.tags)) {
    console.warn('No matching tag for delivery/pickup location found.', data);
    throw 'No matching tag for delivery/pickup location found.';
  }

  if (!data.items) {
    console.warn('This order has no items.', data);
    throw 'This order has no items.';
  }

  return true;
}

export type ValidationErrors = Array<{ order: any; item?: any; error: string }>;

export function validateOrders(
  data: any
): { isValid: boolean; errors: ValidationErrors } {
  let isValid = true;
  const errors: ValidationErrors = [];

  if (!data || !Array.isArray(data)) {
    return {
      isValid: false,
      errors: [{ order: undefined, error: 'Expecting an array of orders.' }],
    };
  }

  for (const order of data) {
    let isValidOrder = false;

    try {
      isValidOrder = isOrder(order);
    } catch (e) {
      isValid = false;

      errors.push({
        order,
        error: e || 'Invalid order data.',
      });
    }

    if (isValidOrder) {
      for (const item of order.items) {
        if (!isOrderItemDetails(item)) {
          isValid = false;
          errors.push({ order, item, error: 'Invalid order item.' });
        } else {
          if (item.fulfillableQuantity > item.quantity) {
            isValid = false;

            errors.push({
              order,
              item,
              error: `The fulfillable quantity of ${item.fulfillableQuantity} is greater than the actual quantity of ${item.quantity}.`,
            });
          }
        }
      }
    }
  }

  return {
    isValid,
    errors,
  };
}

export interface OrderMenuItemVariant {
  variantTitle: string;
  quantity: number;
}

export interface OrderMenuItem {
  title: string;
  variants: { [key: string]: OrderMenuItemVariant };
}

export interface OrderMenuItems {
  [key: string]: OrderMenuItem;
}

export function getOrderItems(order: Order, mergeData?: OrderMenuItems) {
  const newData: OrderMenuItems = {
    ...mergeData,
  };

  for (const { title, variantTitle, fulfillableQuantity } of order.items) {
    if (!fulfillableQuantity || title === 'Tip') continue;

    const item: OrderMenuItem = newData[title as string] || {
      variants: {},
      title: title,
    };
    const itemVariant: OrderMenuItemVariant =
      item.variants[variantTitle as string] || {};
    itemVariant.quantity = (itemVariant.quantity || 0) + fulfillableQuantity;
    itemVariant.variantTitle = itemVariant.variantTitle || variantTitle;

    item.variants[variantTitle] = itemVariant;

    newData[title] = item;
  }

  return newData;
}

export function getOrderTotals(orders: Orders) {
  let orderItems: OrderMenuItems = {};

  for (const order of orders) {
    orderItems = getOrderItems(order, orderItems);
  }

  return orderItems;
}

export interface CustomerOrder {
  items: OrderMenuItems;
  shipping: ShippingAddress;
  email: string;
  note?: string;
}

export interface LocationOrder {
  [key: string]: CustomerOrder;
}

export interface LocationOrders {
  [key: string]: LocationOrder;
}

export function getOrdersByLocation(orders: Orders) {
  const _locationOrders: LocationOrders = {};

  for (const order of orders) {
    const locationName = getLocationFromTags(order.tags)?.name;
    if (!locationName) continue;

    const name = getCustomerName(order);

    const locationData = _locationOrders[locationName] || {};
    const customerData: CustomerOrder = locationData[name] || {
      shipping: order.shippingAddress,
      items: {},
      note: order.note,
      email: order.email
    };

    customerData.items = getOrderItems(order, customerData.items);
    customerData.shipping = order.shippingAddress;

    locationData[name] = customerData;
    _locationOrders[locationName] = locationData;
  }

  return _locationOrders;
}

export function getOrdersByCustomerName(orders: Orders, customerName: string) {
  const customerOrders: Order[] = [];

  for (const order of orders) {
    const name = order.shippingAddress.name;

    if (name.toLowerCase().trim() === customerName.toLowerCase().trim()) {
      customerOrders.push(order);
    }
  }

  return customerOrders;
}

export function getCustomerName({
  shippingAddress: { firstName, lastName },
}: Order) {
  return `${lastName}, ${firstName}`;
}
