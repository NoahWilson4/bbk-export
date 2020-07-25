import React from 'react';
import './App.css';
import { LocationTotals } from "./LocationTotals";
import { Totals } from './Totals';
import { LocationOrders } from './LocationOrders';

async function getExport() {
  const res = await fetch("/export");
  const data = await res.json();
  return JSON.parse(data);
}

async function getOrderLineItems(id: string) {
  const _id = id.substring(id.lastIndexOf('/') + 1)
  const res = await fetch(`/export/order/${_id}/line-items`);
  const data = await res.json();
  return JSON.parse(data);
}


function App() {
  const [orders, setOrders] = React.useState<any>();
  const [error, setError] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(()=>{
    getExport().then((res) => {
      if (res.data) {
        const filtered = res.data.orders.edges.map(({node}: any)=> node).filter((order: any)=> {
          const status = order.displayFulfillmentStatus;
          return status === "UNFULFILLED" || status === "PARTIALLY_FULFILLED" || status === "OPEN";
        });

        setTotal(filtered.length)
    
        return filtered;
      } else if (res.errors?.length) {
        throw res.errors;
      }
    }).then(async (orders: any)=> {
      const combinedOrders = [];

      for (const order of orders) {
        setCount((c) => c + 1)
        const _order = {...order};

        const res = await getOrderLineItems(order.id);

        const o = res.data.order;
        if (!o) continue
        
        _order.lineItems = o.lineItems;
        combinedOrders.push(_order)
      }

      setOrders(combinedOrders);
    }).catch((e)=>{
      console.warn(e)
      setError(true)
    })
  }, []);

  return (
    <div className="order-export">
     {orders?<>
      <Totals orders={orders} />
      <LocationTotals orders={orders} />
      <LocationOrders orders={orders} />
     </>:error?<div>There was an error fetching orders.</div> :<div>
        {!count?<div>Fetching Orders...</div>:<div>
          Getting order details... {count} / {total}
        </div>}
      </div>}
    </div>
  );
}


export default App;
