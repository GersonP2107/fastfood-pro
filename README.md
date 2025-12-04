# FoodFast Pro - Digital Menu & Online Ordering SaaS

A modern, scalable SaaS platform for restaurants and food businesses to manage digital menus and accept online orders with WhatsApp notifications.

## 🚀 Features

- **Digital Menu Display**: Beautiful, responsive menu with categories and products
- **Shopping Cart**: Real-time cart with modifier support
- **Online Ordering**: Complete checkout flow with customer information
- **WhatsApp Notifications**: Automatic order notifications to merchants
- **Multi-Tenant**: Support for multiple restaurants on a single platform
- **Admin Dashboard**: Manage products, categories, and orders (coming soon)
- **Mobile-First Design**: Optimized for mobile devices
- **Premium UI/UX**: Modern design with glassmorphism and micro-animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Deployment**: VPS (Frontend) + Supabase Cloud (Backend)

## 📋 Prerequisites

- Node.js 20.x or later
- npm or yarn
- Supabase account
- WhatsApp Business API credentials (optional)

## 🔧 Installation

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd digital-menu
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. **Set up Supabase**:
- Follow the instructions in `supabase-setup.md` (in artifacts)
- Run the database schema from `database-schema.sql`
- Apply RLS policies from `rls-policies.sql`
- Deploy the Edge Function from `edge-function-order-notification.ts`

5. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
digital-menu/
├── app/                          # Next.js app directory
│   ├── [merchantSlug]/          # Dynamic merchant menu pages
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/
│   └── menu/                    # Menu components
│       ├── MenuDisplay.tsx      # Main menu display
│       ├── ProductCard.tsx      # Product card
│       ├── CategoryFilter.tsx   # Category filter
│       ├── ModifierModal.tsx    # Modifier selection modal
│       └── Cart.tsx             # Shopping cart
├── lib/
│   ├── supabase/                # Supabase clients
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── database.types.ts    # Database types
│   ├── types.ts                 # TypeScript types
│   ├── cart-store.ts            # Cart state management
│   └── utils.ts                 # Utility functions
└── public/                      # Static assets
```

## 🗄️ Database Schema

The database includes the following tables:
- `comerciantes` - Merchant information
- `categorias` - Product categories
- `productos` - Menu items
- `modificadores` - Product modifiers (extras)
- `producto_modificadores` - Product-modifier relationships
- `ordenes` - Customer orders
- `orden_items` - Order line items
- `orden_item_modificadores` - Selected modifiers per order item

See `database-schema.sql` for the complete schema.

## 🔐 Security

- Row Level Security (RLS) policies ensure data isolation between merchants
- Public read access for active products and categories
- Authenticated access for merchant admin operations
- Service role key never exposed to frontend

## 📱 Usage

### For Merchants

1. Create a Supabase account and set up your project
2. Insert your business data into the `comerciantes` table
3. Add categories and products via Supabase dashboard or admin panel
4. Share your menu URL: `yoursite.com/[your-slug]`

### For Customers

1. Visit the merchant's menu URL
2. Browse products by category
3. Add items to cart with optional modifiers
4. Proceed to checkout
5. Fill in delivery information
6. Submit order
7. Merchant receives WhatsApp notification

## 🚀 Deployment

See `DEPLOYMENT.md` (in artifacts) for detailed deployment instructions covering:
- VPS setup
- Nginx configuration
- SSL certificates
- PM2 process management
- Supabase production setup

## 📚 Documentation

All documentation is available in the artifacts directory:
- `implementation_plan.md` - Complete implementation plan
- `architecture-diagram.md` - System architecture
- `database-schema.sql` - Database schema
- `rls-policies.sql` - Security policies
- `api-endpoints.md` - API documentation
- `supabase-setup.md` - Supabase setup guide
- `DEPLOYMENT.md` - Deployment guide

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Supabase](https://supabase.com)
- Icons by [Lucide](https://lucide.dev)

