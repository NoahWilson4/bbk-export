import React from 'react';
import { TotalsList } from './TotalsList';
import { Section, SubSection } from './Section';
import { getOrderTotals } from './utils';
import { Typography } from '@material-ui/core';

export function Totals({ orders }: { orders: any }) {
  const orderItems = React.useMemo(() => getOrderTotals(orders), [orders]);

  const jars = React.useMemo(() => {
    let pints = 0;
    let quarts = 0;
    let halfPints = 0;

    for (const item of Object.keys(orderItems)) {
      const order = orderItems[item];
      for (const variantTitle of Object.keys(order.variants)) {
        const variant = order.variants[variantTitle];
        const lowerCased = variantTitle.toLowerCase();
        if (!lowerCased.includes('frozen')) {
          if (lowerCased.includes('half pint')) {
            halfPints += variant.quantity;
          } else if (lowerCased.includes('pint')) {
            pints += variant.quantity;
          } else if (lowerCased.includes('quart')) {
            quarts += variant.quantity;
          }
        }
      }
    }

    return {
      pints,
      quarts,
      halfPints,
    };
  }, [orders]);

  return (
    <Section className="totals" header="Totals">
      <SubSection header={`Order Totals - ${orders.length} Orders`}>
        <Typography variant="h6">
          Jars Needed <small>(Doesn't include frozen items)</small>
        </Typography>
        <div>{jars.halfPints} Half Pints</div>
        <div>{jars.pints} Pints</div>
        <div>{jars.quarts} Quarts</div>
        <br />

        <TotalsList orderItems={orderItems} />
      </SubSection>
    </Section>
  );
}

export default Totals;
