export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    delivery_address?: string;
    total_amount: number;
    payment_status: PaymentStatus;
    order_status: OrderStatus;
    mpesa_checkout_id?: string;
    mpesa_receipt?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    menu_item_id: string;
    menu_item_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    created_at: string;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    email?: string;
    delivery_address?: string;
    notes?: string;
}

export interface MpesaSTKPushRequest {
    phone_number: string;
    amount: number;
    order_id: string;
}

export interface MpesaCallback {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: number;
    ResultDesc: string;
    CallbackMetadata?: {
        Item: Array<{
            Name: string;
            Value: string | number;
        }>;
    };
}
