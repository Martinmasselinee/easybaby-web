# EasyBaby Web Application

A platform connecting hotels with parents who need baby equipment during their stay.

## Project Overview

EasyBaby is a two-sided platform:
- **User Side**: Parents can rent baby equipment from hotels
- **Admin Side**: Platform administrators manage cities, hotels, products, and reservations

The application is built with Next.js 15, TypeScript, Tailwind CSS, and uses PostgreSQL with Prisma ORM.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account for payments
- Resend account for emails

### Installation

1. Clone the repository
```bash
git clone https://github.com/Martinmasselinee/easybaby-web.git
cd easybaby-web
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` with your own values.

4. Set up the database
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server
```bash
npm run dev
```

6. Access the application
- User interface: http://localhost:3000
- Admin interface: http://localhost:3000/admin/login
  - Default credentials: admin@easybaby.io / admin123

## Core Features

### User Side

1. **City Selection**: Browse cities with available baby equipment
2. **Product Selection**: View and select products with hourly/daily pricing
3. **Reservation**: Select rental duration and pickup/return hotels
4. **Checkout**: Complete payment with optional hotel discount code
5. **Confirmation**: Receive reservation details and hotel discount code

### Admin Side

1. **City Management**: Add, edit, and delete cities
2. **Hotel Management**: Manage hotels and their discount codes
3. **Product Management**: Create and manage products with pricing options
4. **Inventory Management**: Assign products to hotels and manage stock
5. **Reservation Management**: View and manage customer reservations
6. **Revenue Tracking**: Monitor revenue sharing between platform and hotels

## Complete User Flow

1. Admin adds cities, hotels, and products
2. Admin assigns products to hotel inventories
3. User selects a city and browses available products
4. User selects product, rental duration, and pickup/return hotels
5. System checks product availability for selected dates
6. User completes checkout with optional hotel discount code
7. User receives confirmation with reservation details
8. Hotel receives notification about new reservation
9. Admin can track and manage the reservation

## Revenue Sharing Model

- Default: 70% EasyBaby / 30% Hotel
- With hotel discount code: 30% EasyBaby / 70% Hotel

## Deployment

The application is deployed on Vercel:
- Production: https://easybaby-web.vercel.app
- Admin login: admin@easybaby.io / admin123

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── (admin)/            # Admin routes
│   ├── (public)/           # User-facing routes
│   ├── api/                # API endpoints
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── admin/              # Admin components
│   ├── layouts/            # Layout components
│   └── ui/                 # UI components
├── lib/                    # Utility functions
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # Authentication
│   └── db.ts               # Database helpers
├── prisma/                 # Prisma schema and migrations
│   └── schema.prisma       # Database schema
└── public/                 # Static assets
```

## Development Guidelines

See [CURSORRULES.md](./CURSORRULES.md) for detailed development guidelines and [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for comprehensive project context.

## License

This project is proprietary and confidential.

## Contact

For any questions or support, please contact the project maintainer.