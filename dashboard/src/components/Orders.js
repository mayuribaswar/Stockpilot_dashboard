import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import "./Orders.css";

const Orders = () => {
  const { orders: contextOrders } = useContext(GeneralContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (Array.isArray(contextOrders)) {
      setOrders(contextOrders);
    }
  }, [contextOrders]);

  useEffect(() => {
    axios
      .get("/allOrders")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setOrders(res.data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="order-table">
      <table>
        <thead>
          <tr>
            <th>Stock</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Type</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order, index) => (
            <tr key={order._id || index}>
              <td>{order.name}</td>
              <td>{order.qty}</td>
              <td>{order.price}</td>
              <td className={order.mode === "BUY" ? "profit" : "loss"}>
                {order.mode}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
