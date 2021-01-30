import React from 'react';
import { TotalsList } from './TotalsList';
import { OrderMenuItems, Orders, getOrderItems } from './utils';
import { Section, SubSection } from './Section';
import { getLocationFromTags } from './locations';
import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';

interface LocationItems {
  [key: string]: OrderMenuItems;
}

export function LocationTotals({ orders }: { orders: Orders }) {
  const [errors, setErrors] = React.useState<string[]>();

  const locationItems = React.useMemo(() => {
    const _locationItems: LocationItems = {};
    const _errors: string[] = [];

    for (const order of orders) {
      const locationName = getLocationFromTags(order.tags)?.name;

      if (!locationName) {
        _errors.push(`Order is missing a location: ${order.id}`);
        continue;
      }

      _locationItems[locationName] = getOrderItems(
        order,
        _locationItems[locationName]
      );
    }

    if (_errors.length) setErrors(_errors);

    return _locationItems;
  }, [orders, setErrors]);

  return (
    <Section className="locations" header="Location Totals">
      {errors?.length ? (
        <Box mb={3}>
          {errors.map((e, i) => (
            <Alert key={i} severity="error" variant="filled" elevation={4}>
              {e}
            </Alert>
          ))}
        </Box>
      ) : null}
      {Object.keys(locationItems)
        .sort(new Intl.Collator().compare)
        .map((locationName) => (
          <SubSection header={`${locationName} (Totals)`} key={locationName}>
            <TotalsList orderItems={locationItems[locationName]} />
          </SubSection>
        ))}
    </Section>
  );
}
