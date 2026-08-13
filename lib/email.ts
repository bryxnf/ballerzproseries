import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

type SendOrderConfirmationArgs = {
  customerEmail: string;
  customerName?: string | null;
  orderNumber: string;
  total: number;
};

export async function sendOrderConfirmation({
  customerEmail,
  customerName,
  orderNumber,
  total,
}: SendOrderConfirmationArgs) {
  const formattedTotal =
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(total);

  const { data, error } = await resend.emails.send({
    from: "Ballerz Pro Series <onboarding@resend.dev>",   // change to domain once its purchased and verified
    to: customerEmail,
    subject: `Ballerz Pro Series Order ${orderNumber}`,

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 32px;
          background: #111111;
          color: #ffffff;
        "
      >
        <h1 style="margin-bottom: 24px;">
          Order Received
        </h1>

        <p>
          ${customerName ? `Hi ${customerName},` : "Thank you,"}
        </p>

        <p>
          We received your Ballerz Pro Series order.
        </p>

        <div
          style="
            margin: 30px 0;
            padding: 24px;
            border: 1px solid #333333;
            border-radius: 16px;
          "
        >
          <p style="margin: 0 0 10px;">
            <strong>Order Number</strong>
          </p>

          <p style="font-size: 20px; margin: 0 0 24px;">
            ${orderNumber}
          </p>

          <p style="margin: 0 0 10px;">
            <strong>Order Total</strong>
          </p>

          <p style="font-size: 24px; margin: 0;">
            ${formattedTotal}
          </p>
        </div>

        <p>
          Keep your order number so you can track your order status.
        </p>

        <p>
          Ballerz Pro Series
        </p>
      </div>
    `,
  });

  if (error) {
    throw error;
  }

  return data;
}