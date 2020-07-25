import React from 'react';
import {TotalsList,OrderItems} from "./TotalsList";
import {Section, SubSection} from "./Section"
import {getOrderItems} from "./utils"

interface LocationItems {
	[key: string]: OrderItems;
}
  
export function LocationTotals({orders}: {orders:any}) {
	const locationItems = React.useMemo(()=> {
	  const _locationItems: LocationItems = {};
  
	  for (const order of orders) {
			const locationName = order.tags[0];
			if (!locationName) continue;
		
			_locationItems[locationName] = getOrderItems(order,_locationItems[locationName]);
	  }
  
  
	  return _locationItems;
	},[orders])
  
	return <Section className="locations" header="Location Totals">
	  {Object.keys(locationItems).sort().map((locationName)=> <SubSection header={`${locationName} (Totals)`} key={locationName}>
			<TotalsList orderItems={locationItems[locationName]} />
	  </SubSection>)}
	</Section>
}