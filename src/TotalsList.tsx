import React from 'react';
import { OrderMenuItems, OrderMenuItem } from './utils';

export function TotalsList({ orderItems }: { orderItems: OrderMenuItems }) {
  const total = React.useMemo(() => {
    let _total = 0;

    for (const title of Object.keys(orderItems)) {
      const orderItem = orderItems[title];

      for (const variantTitle of Object.keys(orderItem.variants)) {
        _total += orderItem.variants[variantTitle].quantity;
      }
    }

    return _total;
  }, [orderItems]);

  return (
    <div className="totals-list">
      {Object.keys(orderItems)
        .sort()
        .map((orderItemTitle: string) => {
          const orderItem = orderItems[orderItemTitle];

          return <TotalsListItem key={orderItem.title} orderItem={orderItem} />;
        })}
      <div className="totals-list__total">Total items: {total}</div>
    </div>
  );
}

export function TotalsListItem({ orderItem }: { orderItem: OrderMenuItem }) {
  return (
    <div key={orderItem.title} className="totals-list__item">
      <div className="totals-list__item-title">{orderItem.title}</div>
      <ul>
        {Object.keys(orderItem.variants)
          .sort()
          .map((variantTitle: string) => {
            const variant = orderItem.variants[variantTitle];
            return (
              <li key={variantTitle}>
                <div className="totals-list__item-quantity">
                  {variant.quantity}
                </div>
                <div>{variantTitle}</div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
