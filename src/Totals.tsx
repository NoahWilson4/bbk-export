import React from 'react';
import { TotalsList } from './TotalsList';
import { Section, SubSection } from './Section';
import { getOrderTotals } from './utils';

export function Totals({ orders }: { orders: any }) {
  const orderItems = React.useMemo(() => getOrderTotals(orders), [orders]);

  return (
    <Section className="totals" header="Totals">
      <SubSection header="Order Totals">
        <div>{orders.length} orders</div>
        <TotalsList orderItems={orderItems} />
      </SubSection>
    </Section>
  );
}

export default Totals;
