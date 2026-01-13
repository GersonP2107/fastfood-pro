// ============================================================================
// FoodFast Pro - TypeScript Type Definitions
// ============================================================================

// Database Types (matching PostgreSQL schema)

export interface Businessman {
    id: string;
    user_id?: string;
    business_name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    business_type?: string;
    whatsapp_number: string;
    whatsapp_api_token?: string;
    is_active: boolean;
    accept_orders: boolean;
    opening_hours?: string;
    closing_hours?: string;
    operating_schedule?: ScheduleItem[];
    payment_methods?: PaymentMethod[];
    delivery_surge_multiplier?: number;
    delivery_time_estimate?: string;
    created_at: string;
    updated_at: string;
    zones?: RestaurantZone[];
}

export interface RestaurantZone {
    id: string;
    businessman_id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    tables?: RestaurantTable[];
}

export interface RestaurantTable {
    id: string;
    zone_id: string;
    name: string;
    capacity?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ScheduleItem {
    day: string; // 'monday', 'tuesday', etc.
    open: string; // 'HH:mm'
    close: string; // 'HH:mm'
    label: string; // 'Lunes', 'Martes', etc.
    isActive: boolean;
}

export interface PaymentMethod {
    id?: string;
    businessman_id?: string;
    type: 'nequi' | 'daviplata' | 'bancolombia' | 'efectivo' | 'otros' | string;
    name: string;
    account_number?: string; // DB column name
    number?: string; // Legacy support (frontend uses this)
    instructions?: string;
    is_active: boolean;
}

export interface DeliveryZone {
    id: string;
    businessman_id: string;
    zone_name: string;
    delivery_cost: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    businessman_id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    businessman_id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    image_url: string | null;
    price: number;
    discount_price: number | null;
    is_available: boolean;
    limited_stock: boolean;
    stock_quantity: number | null;
    featured: boolean;
    order: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    // Relations
    category?: Pick<Category, 'id' | 'name'> | null;
    product_modifiers?: Array<Pick<ProductModifier, 'id' | 'is_required'> & { modifier: Modifier }>;
}

export interface Modifier {
    id: string;
    businessman_id: string;
    name: string;
    description: string | null;
    additional_price: number;
    type: 'extra' | 'without' | 'option';
    created_at: string;
}

export interface ProductModifier {
    id: string;
    product_id: string;
    modifier_id: string;
    is_required: boolean;
    modifier?: Modifier;
}

export interface Order {
    id: string;
    businessman_id: string;
    order_number: string;
    client_name: string;
    client_phone: string;
    client_email?: string;
    delivery_type: 'delivery' | 'pickup' | 'dine_in';
    delivery_address?: string;
    table_number?: string;
    delivery_notes?: string;
    payment_method: string;
    subtotal: number;
    shipping_cost: number;
    discount: number;
    tip: number;
    total: number;
    status: 'pendiente' | 'confirmado' | 'preparando' | 'en_camino' | 'entregado' | 'cancelado';
    notification_sent: boolean;
    notification_error?: string;
    created_at: string;
    updated_at: string;
    // Relations
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id?: string;
    product_name: string;
    product_description?: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
    created_at: string;
    // Relations
    modifiers?: OrderItemModifier[];
}

export interface OrderItemModifier {
    id: string;
    order_item_id: string;
    modifier_id?: string;
    modifier_name: string;
    additional_price: number;
    created_at: string;
}

// ============================================================================
// Frontend-Specific Types
// ============================================================================

// Cart Item (for shopping cart state)
export interface CartItem {
    product: Product;
    quantity: number;
    modifiers_selected: Modifier[];
    subtotal: number;
}

// Cart Store State
export interface CartStore {
    items: CartItem[];
    addItem: (product: Product, modifiers: Modifier[]) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

// Checkout Form Data
export interface CheckoutFormData {
    client_name: string;
    client_phone: string;
    client_email?: string;
    delivery_type: 'delivery' | 'pickup' | 'dine_in';
    delivery_address?: string;
    table_number?: string;
    delivery_notes?: string;
    payment_method: string;
}

// Order Creation Payload
export interface CreateOrderPayload {
    businessman_id: string;
    client_name: string;
    client_phone: string;
    client_email?: string;
    delivery_type: 'delivery' | 'pickup' | 'dine_in';
    delivery_address?: string;
    table_number?: string;
    delivery_notes?: string;
    payment_method: string;
    subtotal: number;
    shipping_cost: number;
    discount: number;
    tip: number;
    total: number;
    items: {
        product_id: string;
        product_name: string;
        product_description?: string;
        unit_price: number;
        quantity: number;
        subtotal: number;
        modifiers: {
            modifier_id: string;
            modifier_name: string;
            additional_price: number;
        }[];
    }[];
}

// API Response Types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

export interface MenuData {
    businessman: Businessman;
    categories: Category[];
    products: Product[];
}

// Component Props Types
export interface MenuDisplayProps {
    businessmanId: string;
    businessmanSlug: string;
}

export interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product, modifiers: Modifier[]) => void;
}

export interface CategoryFilterProps {
    categories: Category[];
    selectedCategoryId?: string;
    onSelectCategory: (categoryId?: string) => void;
}

export interface CartProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface CheckoutFormProps {
    businessmanId: string;
    onSuccess: (order: Order) => void;
}
