import React from 'react';
import { Orders, getOrdersByLocation, ShippingAddress } from './utils';
import { Section, SubSection } from './Section';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { getPickupAddress } from './locations/index';

const useStyles = makeStyles((theme) =>
  createStyles({
    mb3: {
      marginBottom: theme.spacing(3),
    },
  })
);

export function Deliveries({ orders }: { orders: Orders }) {
  const classes = useStyles();

  const ordersByLocation = React.useMemo(() => {
    return getOrdersByLocation(orders);
  }, [orders]);

  return (
    <Section className="deliveries" header="Deliveries">
      {Object.keys(ordersByLocation)
        .sort()
        .map((locationName) => {
          const locationOrders = ordersByLocation[locationName];

          const isDelivery = locationName.toLowerCase().includes('delivery');
          const pickupAddress = !isDelivery
            ? getPickupAddress(locationName)
            : undefined;

          return (
            <SubSection
              key={locationName}
              header={locationName}
              className={classes.mb3}
            >
              {isDelivery ? (
                Object.keys(locationOrders)
                  .sort()
                  .map((customerName) => {
                    const order = locationOrders[customerName];

                    return (
                      <Address
                        key={customerName}
                        shippingAddress={order.shipping}
                      />
                    );
                  })
              ) : pickupAddress ? (
                <Address shippingAddress={pickupAddress} />
              ) : (
                <div>This location is missing an address.</div>
              )}
            </SubSection>
          );
        })}
    </Section>
  );
}

export function Address({
  shippingAddress,
}: {
  shippingAddress: ShippingAddress;
}) {
  return (
    <div>
      {`${shippingAddress.address1} ${
        shippingAddress.address2 ? shippingAddress.address2 : ''
      } ${shippingAddress.city} ${shippingAddress.zip}`}
    </div>
  );
}

export default Deliveries;
