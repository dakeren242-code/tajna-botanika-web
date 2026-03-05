interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  variant: string;
}

interface OrderEmailData {
  to: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  codFee: number;
  totalAmount: number;
  paymentMethod: string;
  shippingMethod: string;
  bankAccount?: string;
  variableSymbol?: string;
}

interface StatusUpdateEmailData {
  to: string;
  orderNumber: string;
  customerName: string;
  oldStatus: string;
  newStatus: string;
  message?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not configured');
      return false;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        type: 'order_confirmation',
        data: data,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send email:', error);
      return false;
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return result.success === true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendOrderStatusUpdateEmail(data: StatusUpdateEmailData): Promise<boolean> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not configured');
      return false;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        type: 'order_status_update',
        data: data,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send status update email:', error);
      return false;
    }

    const result = await response.json();
    console.log('Status update email sent successfully:', result);
    return result.success === true;
  } catch (error) {
    console.error('Error sending status update email:', error);
    return false;
  }
}
