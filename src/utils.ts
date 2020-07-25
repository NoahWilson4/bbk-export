import {OrderItems,OrderItem,OrderItemVariant} from "./TotalsList";

export function getOrderItems(order: any, mergeData?: OrderItems) {
	const newData: OrderItems = {
		...mergeData
	};

	for (const { node: {title, variantTitle, quantity,fulfillableQuantity,nonFulfillableQuantity} } of order.lineItems.edges) {
		if (!fulfillableQuantity || title === "Tip") continue;

		const item: OrderItem = newData[title as string] || {variants:{},title: title};
		const itemVariant: OrderItemVariant = item.variants[variantTitle as string] || {};
		itemVariant.quantity = (itemVariant.quantity || 0) + fulfillableQuantity;
		itemVariant.variantTitle = itemVariant.variantTitle || variantTitle;

		item.variants[variantTitle] = itemVariant;

		newData[title] = item;
	}

	return newData;
}