import React from 'react';
import {
  Orders,
  FetchedOrders,
  isFetchedOrder,
  isOrderItemDetails,
  Order,
  FetchedLineItems,
  OrderItemDetails,
} from './utils';

async function getExport() {
  const res = await fetch('/export');
  const data = await res.json();

  return JSON.parse(data);
}

async function getOrderLineItems(id: string) {
  const _id = id.substring(id.lastIndexOf('/') + 1);
  const res = await fetch(`/export/order/${_id}/line-items`);
  const data = await res.json();
  return JSON.parse(data);
}

export interface Value {
  orders?: Orders;
  refreshOrders: () => any;
  workingOrders?: Orders;
  setWorkingOrders: (value: Orders) => any;
  loading?: boolean;
  error?: any;
  count?: number;
  total?: number;
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
  const [error, setError] = React.useState<any>();
  const [orders, setOrders] = React.useState<Orders>();
  const [total, setTotal] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [workingOrders, setWorkingOrders] = React.useState<Orders>();

  const refreshOrders = React.useCallback(() => {
    setLoading(true);

    const badOrders = [];

    getExport()
      .then((res) => {
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
            setError(`There were ${badOrders.length} orders with faulty data.`);
          }

          return filtered;
        } else if (res.errors?.length) {
          throw res.errors;
        }
      })
      .then(async (orders) => {
        if (!orders?.length) return [];

        const combinedOrders: Orders = [];

        for (const order of orders) {
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

            items.push(node);
          }

          const _order: Order = {
            ...order,
            items,
          };

          combinedOrders.push(_order);
        }

        setOrders(combinedOrders);
        setWorkingOrders([...combinedOrders]);
      })
      .catch((e) => {
        console.warn(e);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setTotal, setCount, setOrders, setError, setLoading]);

  return (
    <Context.Provider
      value={{
        orders,
        workingOrders,
        refreshOrders,
        setWorkingOrders,
        loading,
        error,
        total,
        count,
      }}
    >
      {children}
    </Context.Provider>
  );
}
