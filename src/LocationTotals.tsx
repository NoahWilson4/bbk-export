import React from 'react';
import { TotalsList } from './TotalsList';
import { OrderMenuItems, Orders, getOrderItems } from './utils';
import { Section, SubSection } from './Section';

interface LocationItems {
  [key: string]: OrderMenuItems;
}

export function LocationTotals({ orders }: { orders: Orders }) {
  const locationItems = React.useMemo(() => {
    const _locationItems: LocationItems = {};

    for (const order of orders) {
      const locationName = order.tags[0];
      if (!locationName) continue;

      _locationItems[locationName] = getOrderItems(
        order,
        _locationItems[locationName]
      );
    }

    return _locationItems;
  }, [orders]);

  return (
    <Section className="locations" header="Location Totals">
      {Object.keys(locationItems)
        .sort()
        .map((locationName) => (
          <SubSection header={`${locationName} (Totals)`} key={locationName}>
            <TotalsList orderItems={locationItems[locationName]} />
          </SubSection>
        ))}
    </Section>
  );
}
