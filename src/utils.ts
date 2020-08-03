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
  name: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  phone: string;
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
}

export function isOrderItemDetails(data: any): data is OrderItemDetails {
  return (
    data &&
    typeof data === 'object' &&
    data.title &&
    data.variantTitle &&
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
}

export function isOrders(data: any): data is Orders {
  return data && Array.isArray(data) && !data.find((item) => !isOrder(item));
}

export function isOrder(data: any): data is Order {
  return (
    data &&
    typeof data === 'object' &&
    data.id &&
    isShippingAddress(data.shippingAddress) &&
    data.tags &&
    data.items
  );
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
    if (!isOrder(order)) {
      isValid = false;

      errors.push({
        order,
        error: 'Invalid order data.',
      });
    } else {
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
