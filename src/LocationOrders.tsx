import React from 'react';
import {TotalsList,OrderItems} from "./TotalsList";
import {Section ,SubSection} from "./Section"
import {getOrderItems} from "./utils"

interface Shipping {
	address1: string;
	address2: string;
	city: string;
	company: string;
	name: string;
	phone: string;
	provinceCode: string;
	zip: string;
}

interface CustomerOrder {
	items: OrderItems
	shipping: Shipping;
	note?: string;
}

interface LocationOrder {
	[key: string]: CustomerOrder;
}

interface LocationOrders {
	[key: string]: LocationOrder;
}
  
export function LocationOrders({orders}: {orders:any}) {
	const locationOrders = React.useMemo(()=> {
	  const _locationOrders: LocationOrders = {};
  
	  for (const order of orders) {
			const locationName = order.tags[0];
			if (!locationName) continue;

			const name = order.shippingAddress.name as string;
		
			const locationData = _locationOrders[locationName] || {};
			const customerData: CustomerOrder = locationData[name] || {
				shipping: order.shippingAddress,
				items: {},
				note: order.note
			};

			customerData.items = getOrderItems(order, customerData.items)
			customerData.shipping = order.shippingAddress;
		
			locationData[name] = customerData;
			_locationOrders[locationName] = locationData;
	  }
  
  
	  return _locationOrders;
	},[orders])
  
	return <Section className="location-orders" header="Location Orders">
	  {Object.keys(locationOrders).sort().map((locationName)=> {
			const locationOrder = locationOrders[locationName];

			const isDelivery = locationName.toLowerCase().includes("delivery");

			return <SubSection header={locationName} key={locationName}>
				{Object.keys(locationOrder).sort().map((customerName)=> {
					const customerOrder = locationOrder[customerName];

					const {address1, address2, city, name, phone, zip} = customerOrder.shipping;

					return <div key={customerName} className="location-orders__customer">
						<h3 className="location-orders__customer-name">{name}</h3>
						{isDelivery?
							<div className="location-orders__address">
								<div>{address1}</div>
								<div>{address2}</div>
								<div>{city} {zip}</div>
								<div>{phone}</div>
							</div>
						:null}
						{customerOrder.note?<div className="location-orders__note">Note: {customerOrder.note}</div> : null}
						<TotalsList orderItems={customerOrder.items} />
					</div>
				})}
			</SubSection>;
		})}
	</Section>
}