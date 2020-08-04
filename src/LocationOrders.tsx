import React from 'react';
import { TotalsList } from './TotalsList';
import { Section, SubSection } from './Section';
import { Orders, getOrdersByLocation } from './utils';

export function LocationOrders({ orders }: { orders: Orders }) {
  const locationOrders = React.useMemo(() => {
    return getOrdersByLocation(orders);
  }, [orders]);

  return (
    <Section className="location-orders" header="Location Orders">
      {Object.keys(locationOrders)
        .sort()
        .map((locationName) => {
          const locationOrder = locationOrders[locationName];

          const isDelivery = locationName.toLowerCase().includes('delivery');

          return (
            <SubSection header={locationName} key={locationName}>
              {Object.keys(locationOrder)
                .sort()
                .map((customerName) => {
                  const customerOrder = locationOrder[customerName];

                  const {
                    address1,
                    address2,
                    city,
                    name,
                    phone,
                    zip,
                  } = customerOrder.shipping;

                  return (
                    <div
                      key={customerName}
                      className="location-orders__customer"
                    >
                      <h3 className="location-orders__customer-name">{name}</h3>
                      {isDelivery ? (
                        <div className="location-orders__address">
                          <div>{address1}</div>
                          <div>{address2}</div>
                          <div>
                            {city} {zip}
                          </div>
                          <div>{phone}</div>
                        </div>
                      ) : null}
                      {customerOrder.note ? (
                        <div className="location-orders__note">
                          Note: {customerOrder.note}
                        </div>
                      ) : null}
                      <TotalsList orderItems={customerOrder.items} />
                    </div>
                  );
                })}
            </SubSection>
          );
        })}
    </Section>
  );
}
