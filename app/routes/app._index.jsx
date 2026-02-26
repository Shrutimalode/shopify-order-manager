import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  Page,
  Layout,
  IndexTable,
  Card,
  EmptyState,
  TextContainer,
} from "@shopify/polaris";

// Loader function to authenticate admin session and query orders from Prisma
export async function loader({ request }) {
  // Authenticate the admin session
  const { session } = await authenticate.admin(request);
  
  // Get the shop domain from the session
  const shop = session.shop;

  // Query the Prisma database for all orders belonging to this shop
  const orders = await prisma.order.findMany({
    where: {
      shop: shop,
    },
    orderBy: {
      createdAt: 'desc', // Show newest orders first
    },
  });

  return json({ orders, shop });
}

// Main component that renders the order list using Polaris components
export default function AppIndex() {
  const { orders, shop } = useLoaderData();

  // Define the column headers for the IndexTable
  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };

  const rowMarkup = orders.map((order, index) => (
    <IndexTable.Row key={order.id} id={order.id.toString()}>
      <IndexTable.Cell>{order.shopifyOrderId}</IndexTable.Cell>
      <IndexTable.Cell>{order.customerName}</IndexTable.Cell>
      <IndexTable.Cell>{order.totalPrice}</IndexTable.Cell>
      <IndexTable.Cell>{order.createdAt.toLocaleDateString()}</IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Synced Orders"
      subtitle={`Showing orders for ${shop}`}
    >
      <Layout>
        <Layout.Section>
          <Card>
            {orders.length > 0 ? (
              <IndexTable
                resourceName={resourceName}
                itemCount={orders.length}
                headings={[
                  { title: 'Shopify Order ID' },
                  { title: 'Customer Name' },
                  { title: 'Total Price' },
                  { title: 'Date Created' },
                ]}
              >
                {rowMarkup}
              </IndexTable>
            ) : (
              <EmptyState
                heading="No orders yet"
                action={{
                  content: 'Learn more',
                  onAction: () => {
                    // Could link to documentation about webhooks
                    window.open('https://shopify.dev/apps/webhooks', '_blank');
                  },
                }}
                image="/empty-state.svg" // You can customize this image
              >
                <TextContainer>
                  <p>Once customers start placing orders in your store, they'll appear here.</p>
                  <p>Make sure your webhooks are properly configured to receive order updates.</p>
                </TextContainer>
              </EmptyState>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
