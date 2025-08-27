# EasyBaby Project Context

## Project Overview
EasyBaby is a platform that connects hotels with parents who need baby equipment during their stay. The platform has two main sides:
1. **Admin Side**: For platform administrators to manage cities, hotels, products, and monitor reservations
2. **User Side**: For end users (parents) to browse available products, make reservations, and complete payments

## Project Structure
- Originally started as a monorepo (`EasyBaby`) with multiple apps
- Extracted to a standalone Next.js app (`EasyBabyWeb`) for Vercel deployment
- Uses Next.js 15 App Router with TypeScript
- PostgreSQL database with Prisma ORM
- Stripe for payment processing
- Resend for email communications

## Complete User Flow

### Admin Side (Starting with No Data)

1. **City Management**
   - Admin adds a new city
   - Result: City appears on user side with "0 products, 0 hotels"
   - Admin can edit or delete cities

2. **Hotel Management**
   - Admin adds a new hotel to a city with all relevant information
   - Result: User side shows city with "1 hotel, 0 products"
   - Admin can set hotel discount code (affects revenue sharing)
   - Admin can edit or delete hotels

3. **Product Management**
   - Admin adds new products with hourly and daily pricing
   - No immediate effect on user side until added to hotel inventory
   - Admin can edit or delete products

4. **Inventory Management**
   - Admin adds products to a specific hotel's inventory
   - Result: City now shows "1 product, 1 hotel" on user side
   - Admin can remove products from inventory

5. **Discount Code Management**
   - Admin sets discount code for hotel (e.g., "EASYBABY10")
   - When used, changes revenue sharing from 70% EasyBaby/30% Hotel to 30% EasyBaby/70% Hotel

6. **Reservation Management**
   - Admin can view, update status, and manage all reservations
   - Can resend confirmation emails

### User Side

1. **City Selection**
   - User selects a city from available cities
   - Cities display count of available hotels and products

2. **Product Selection**
   - User browses products available in selected city
   - Products show hourly and daily pricing

3. **Reservation Details**
   - User selects rental duration (hours or days)
   - User selects pickup and return hotels (only hotels with available inventory are shown)
   - System checks product availability for selected timeframe
   - If product unavailable, system shows message with available dates

4. **Checkout Process**
   - User enters personal details
   - Optional: User enters hotel discount code
   - Pricing adjusts based on rental duration (hourly vs daily)
   - If discount code used, revenue sharing adjusts (70% hotel/30% EasyBaby)

5. **Confirmation**
   - User redirected to confirmation page
   - Reservation code displayed and copied to clipboard
   - Hotel discount code displayed for future hotel booking

6. **Email Notifications**
   - User receives confirmation email with reservation details and ICS calendar file
   - Hotel receives notification about new reservation

## Current Implementation Status

### Completed Features
- Basic admin interface with black and white design
- User-facing product pages with hourly/daily pricing
- Checkout flow with Stripe integration
- Hotel discount code section on confirmation page
- Basic city, hotel, and product management
- Responsive design for mobile and desktop

### Pending Features
1. **Revenue Sharing System**
   - Implement logic to adjust revenue split based on discount code usage
   - Create admin dashboard for revenue tracking

2. **Dynamic Data Display**
   - Show accurate hotel and product counts on city pages
   - Filter hotels by product availability

3. **Availability Checking**
   - Implement date-based availability checking
   - Restrict hotel selection based on product availability

4. **Discount Code Implementation**
   - Apply hotel discount codes to final price
   - Adjust revenue sharing based on discount code

5. **Email Communication**
   - Implement confirmation emails to users
   - Implement notification emails to hotels

6. **Data Synchronization**
   - Ensure real-time updates between admin changes and user-facing site

## Technical Details

### Database Schema
The database includes models for:
- City (name, slug)
- Hotel (name, address, city relationship)
- Product (name, description, pricePerHour, pricePerDay)
- Inventory (product-hotel relationship, quantity)
- Reservation (customer details, product, hotels, dates, pricing)
- User (admin authentication)

### API Routes
API endpoints exist for all CRUD operations on:
- Cities
- Hotels
- Products
- Inventory
- Reservations

### Authentication
- Admin authentication using a simplified email/password system
- Protected admin routes

### Deployment
- Deployed on Vercel at https://easybaby-web.vercel.app
- Admin login: admin@easybaby.io / admin123
- Connected to PostgreSQL database
- Stripe webhook for payment processing

## Next Steps
Continue implementation of pending features according to the todo list, focusing first on the revenue sharing system, then dynamic city display, hotel product filtering, and availability checking.
