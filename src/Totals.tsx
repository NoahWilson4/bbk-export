import React from 'react';
import {TotalsList,OrderItems} from "./TotalsList"
import {Section, SubSection } from "./Section"
import { getOrderItems } from './utils';

export function Totals({orders}: {orders:any}) {
	const orderItems = React.useMemo(()=> {
		let orderItems: OrderItems = {};

		for (const order of orders) {
				orderItems = getOrderItems(order, orderItems)
		}

		return orderItems;
	},[orders])

	return <Section className="totals" header="Totals">
		
		<SubSection header="Order Totals">
			<div>{orders.length} orders</div>
			<TotalsList orderItems={orderItems} />
		</SubSection>
	</Section>;
}

export default Totals;