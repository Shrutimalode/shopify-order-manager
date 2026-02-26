import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function action({ request }) {
  // Authenticate the webhook using Shopify's HMAC signature verification
  const { topic, shop, adminGraphqlApiId, body: payload } = await authenticate.webhook(
    request
  );

  try {
    switch (topic) {
      case "ORDERS_CREATE":
        // Extract order details from the payload
        const { id: shopifyOrderId, customer, total_price, presentment_currency_code } = payload;

        // Save the order details to the Prisma database
        await prisma.order.create({
          data: {
            shopifyOrderId: shopifyOrderId.toString(),
            shop,
            customerName: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Unknown Customer',
            totalPrice: `${total_price} ${presentment_currency_code}`,
          },
        });

        console.log(`Order ${shopifyOrderId} created for shop ${shop}`);
        break;

      case "ORDERS_CANCELLED":
        // Extract order ID from the payload
        const cancelledOrderId = payload.id?.toString();

        if (cancelledOrderId) {
          // Delete the record from the Prisma database using the shopifyOrderId
          const deletedOrder = await prisma.order.deleteMany({
            where: {
              shopifyOrderId: cancelledOrderId,
              shop, // Ensure we only delete orders for the correct shop
            },
          });

          console.log(`Order ${cancelledOrderId} cancelled and removed from database for shop ${shop}. Records affected: ${deletedOrder.count}`);
        } else {
          console.warn('Received ORDERS_CANCELLED webhook without a valid order ID');
        }
        break;

      default:
        console.log(`Unhandled webhook topic: ${topic}`);
        break;
    }

    return json({ received: true });
  } catch (error) {
    console.error(`Error processing ${topic} webhook for shop ${shop}:`, error);
    return json({ received: false, error: error.message }, { status: 500 });
  }
}

// Export a loader to handle GET requests (useful for verification)
export async function loader() {
  return json({ message: "Webhook endpoint ready" });
}