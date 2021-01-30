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
    <>
      <Section className="deliveries" header="Deliveries">
        {Object.keys(ordersByLocation)
          .sort(new Intl.Collator().compare)
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
                    .sort(new Intl.Collator().compare)
                    .map((customerName, i) => {
                      const order = locationOrders[customerName];

                      return (
                        <>
                          <Address
                            key={`${customerName}--${i}`}
                            shippingAddress={order.shipping}
                            name
                            phone
                          />
                        </>
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
      <Section header="Delivery Spreadsheet">
        <div>
          dest_first_name,dest_last_name,dest_phone_number,dest_email,dest_address_line_1,dest_address_line_2,dest_city,dest_state,dest_zip,,,,,,,dest_remarks
        </div>
        {Object.keys(ordersByLocation)
          .filter((locationName) =>
            locationName.toLowerCase().includes('delivery')
          )
          .sort(new Intl.Collator().compare)
          .map((locationName) => {
            const locationOrders = ordersByLocation[locationName];

            return Object.keys(locationOrders)
              .sort(new Intl.Collator().compare)
              .map((customerName, i) => {
                const order = locationOrders[customerName];

                return (
                  <div key={`${customerName}--${i}`}>
                    {order.shipping.firstName},{order.shipping.lastName},
                    {order.shipping.phone},{order.email},
                    {order.shipping.address1},{order.shipping.address2},
                    {order.shipping.city},CO,{order.shipping.zip},,,,,,,
                    {order.note}
                  </div>
                );
              });
          })}
      </Section>
    </>
  );
}

const useAddresStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    addresses: {
      width: '50%',
    },
    names: {
      marginLeft: theme.spacing(1),
      flexGrow: 1,
    },
    phones: {
      marginLeft: theme.spacing(1),
      width: '10rem',
    },
  })
);

export function Address({
  shippingAddress,
  name,
  phone,
}: {
  shippingAddress: Partial<ShippingAddress>;
  name?: boolean;
  phone?: boolean;
}) {
  const classes = useAddresStyles();

  return (
    <div className={classes.root}>
      <span className={classes.addresses}>
        {`${shippingAddress.address1} ${
          shippingAddress.address2 ? shippingAddress.address2 : ''
        } ${shippingAddress.city} ${shippingAddress.zip}`}
      </span>
      {name ? (
        <span
          className={classes.names}
        >{`  ${shippingAddress.lastName}, ${shippingAddress.firstName}`}</span>
      ) : null}
      {phone ? (
        <span className={classes.phones}>{` ${shippingAddress.phone}`}</span>
      ) : null}
    </div>
  );
}

export default Deliveries;
