import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useSelector } from 'react-redux';

import CheckoutForm from "./CheckoutForm";
import "../Stripe.css";
import { selectCurrentOrder } from "../features/order/orderSlice";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe("pk_test_51PtOtfB64ckrUDy7bi64QwwIskDNXBe8YGGUkzqhz9zFBY99zzEwtzAwwGqBphaMYCbbvGbemOZDaYrdAmrGQgav00tWYO1FY1");

export default function StripeCheckout() {
  const [clientSecret, setClientSecret] = useState("");
  const currentOrder = useSelector(selectCurrentOrder)

  // useEffect(() => {
  //   // Create PaymentIntent as soon as the page loads
  //   fetch("http://localhost:8080/create-payment-intent", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ totalAmount: currentOrder.totalAmount, orderId:currentOrder.id }),
    
  //   })
  //     .then((res) => res.json())
  //     .then((data) => setClientSecret(data.clientSecret));
  // }, []);



  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    if (!currentOrder) {
      setError("Order data not found. Please try again.");
      setLoading(false);
      return;
    }
  
    if (!currentOrder.totalAmount || !currentOrder.id) {
      setError("Invalid order data.");
      setLoading(false);
      return;
    }
  
    fetch(`${process.env.REACT_APP_BACKEND_URL}/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalAmount: currentOrder.totalAmount, orderId: currentOrder.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to create payment intent.");
        setLoading(false);
      });
  }, [currentOrder]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
 
  

  

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="Stripe">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}