import React from 'react';
import {
  Orders,
  FetchedOrders,
  isFetchedOrder,
  isOrderItemDetails,
  Order,
  FetchedLineItems,
  OrderItemDetails,
  ValidationErrors,
  validateOrders,
  FetchedOrder,
} from './utils';

async function getExport() {
  const res = await fetch('/api/orders');
  const data = await res.json();

  return JSON.parse(data);
}

async function getOrderLineItems(id: string) {
  const _id = id.substring(id.lastIndexOf('/') + 1);
  const res = await fetch(`/api/order/${_id}/line-items`);
  const data = await res.json();
  return JSON.parse(data);
}

export interface Value {
  orders?: Orders;
  refreshOrders: () => any;
  workingOrders?: Orders;
  setWorkingOrders: (value: Orders) => any;
  loading?: boolean;
  errors?: string[];
  count?: number;
  total?: number;
  validationErrors?: ValidationErrors;
}

const Context = React.createContext<Value>({
  orders: undefined,
  refreshOrders: () => {},
  workingOrders: undefined,
  setWorkingOrders: () => {},
});

export function useOrders() {
  return React.useContext(Context);
}

export function Provider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setErrors] = React.useState<any[]>();
  const [orders, setOrders] = React.useState<Orders>();
  const [total, setTotal] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [workingOrders, setWorkingOrders] = React.useState<Orders>();
  const [
    validationErrors,
    setValidationErrors,
  ] = React.useState<ValidationErrors>();

  const refreshOrders = React.useCallback(async () => {
    setValidationErrors(undefined);
    setLoading(true);
    setErrors(undefined);

    const badOrders: FetchedOrder[] = [];
    try {
      const res = await getExport();

      if (res.data) {
        const orderData = res.data as FetchedOrders;

        const filtered = orderData.orders.edges
          .map(({ node }) => node)
          .filter((order) => {
            if (!isFetchedOrder(order)) {
              badOrders.push(order);
              return false;
            }

            const status = order.displayFulfillmentStatus;

            return (
              status === 'UNFULFILLED' ||
              status === 'PARTIALLY_FULFILLED' ||
              status === 'OPEN'
            );
          });

        setTotal(filtered.length);

        if (badOrders.length) {
          setErrors((state) => {
            const _errors = [...(state || [])];

            _errors.push(
              `There were ${badOrders.length} orders with faulty data.`
            );

            for (const badOrder of badOrders) {
              _errors.push(
                <>
                  <div>
                    <strong>Order with Error: </strong>
                    {badOrder.id}
                  </div>
                  <div>{JSON.stringify(badOrder)}</div>
                </>
              );
            }

            return _errors;
          });
        }

        if (!filtered?.length) return [];

        const combinedOrders: Orders = [];

        for (const order of filtered) {
          setCount((c) => c + 1);

          const res = await getOrderLineItems(order.id);

          const lineItems: FetchedLineItems | undefined =
            res.data?.order?.lineItems.edges;

          if (!lineItems) continue;

          const items: OrderItemDetails[] = [];

          for (const { node } of lineItems) {
            if (!isOrderItemDetails(node)) {
              continue;
            }

            const orderDetails: OrderItemDetails = {
              ...node,
            };

            const orderErrors: string[] = [];

            if (orderDetails.fulfillableQuantity > orderDetails.quantity) {
              orderErrors.push(
                `This order item's fulfillable quantity of ${orderDetails.fulfillableQuantity} is greater than the order's quantity of ${orderDetails.quantity}: ${orderDetails.title}`
              );
            }

            if (orderErrors.length) {
              orderDetails.errors = orderErrors;
            }

            items.push(orderDetails);
          }

          const _order: Order = {
            ...order,
            items,
          };

          combinedOrders.push(_order);
        }

        const { errors } = validateOrders(combinedOrders);
        if (errors?.length) {
          setValidationErrors(errors);
        }

        setOrders(combinedOrders);
        setWorkingOrders([...combinedOrders]);
      } else if (res.errors?.length) {
        throw res.errors;
      }
    } catch (e) {
      console.warn(e);
      setErrors(e);
    } finally {
      setLoading(false);
    }
  }, [
    setTotal,
    setCount,
    setOrders,
    setErrors,
    setLoading,
    setValidationErrors,
  ]);

  return (
    <Context.Provider
      value={{
        orders,
        workingOrders,
        refreshOrders,
        setWorkingOrders,
        loading,
        errors: error,
        total,
        count,
        validationErrors,
      }}
    >
      {children}
    </Context.Provider>
  );
}
