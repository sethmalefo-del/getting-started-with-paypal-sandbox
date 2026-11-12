import {
  OrdersController,
  CheckoutPaymentIntent,
} from "@paypal/paypal-server-sdk";
import { paypalClient } from "./client";

const ordersController = new OrdersController(paypalClient);

export async function createPayPalOrder(amount: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal sandbox credentials are not configured");
  }

  const { result } = await ordersController.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          description: "Developer Hoodie",
          amount: {
            currencyCode: "USD",
            value: amount,
            breakdown: {
              itemTotal: {
                currencyCode: "USD",
                value: amount,
              },
            },
          },
          items: [
            {
              name: "Developer Hoodie",
              description: "The only hoodie with a PayPal logo on the back.",
              quantity: "1",
              unitAmount: {
                currencyCode: "USD",
                value: amount,
              },
            },
          ],
        },
      ],
    },
  });

  if (!result.id) {
    throw new Error("PayPal order creation failed: missing order ID");
  }

  return result.id;
}

export async function capturePayPalOrder(orderId: string): Promise<unknown> {
  if (!orderId) {
    throw new Error("PayPal order ID is required");
  }

  const { result } = await ordersController.captureOrder({ id: orderId });
  return result;
}
