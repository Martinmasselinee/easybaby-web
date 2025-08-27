# Cursor Rules for EasyBaby Project

## Project Structure Guidelines

1. **File Organization**
   - Follow Next.js 15 App Router conventions
   - Keep server components and client components clearly separated
   - Use `"use client"` directive appropriately
   - Keep API routes in `/app/api/` directory

2. **Component Architecture**
   - Admin components in `/components/admin/`
   - User-facing components in `/components/user/`
   - Shared components in `/components/ui/` or `/components/shared/`
   - Use shadcn/ui components when possible

3. **Styling Guidelines**
   - Use Tailwind CSS for styling
   - Follow responsive design patterns: `px-4 md:px-8 lg:px-16`
   - Admin UI uses black and white design
   - User UI uses branded colors

## Development Rules

1. **State Management**
   - Use React hooks for local state
   - Use React Context for shared state when necessary
   - Avoid prop drilling by using context or composition

2. **Data Fetching**
   - Use React Server Components for initial data fetching when possible
   - Use SWR or React Query for client-side data fetching
   - Implement proper loading states and error handling

3. **Form Handling**
   - Use React Hook Form for complex forms
   - Implement proper validation
   - Show clear error messages to users

4. **Authentication**
   - Keep admin authentication simple but secure
   - Protect all admin routes and API endpoints

5. **Database Operations**
   - Use Prisma for all database interactions
   - Follow the singleton pattern for Prisma client
   - Implement proper error handling for database operations

## Feature Implementation Guidelines

1. **Revenue Sharing System**
   - Track revenue split between EasyBaby and hotels
   - Adjust split based on discount code usage (70/30 or 30/70)
   - Provide clear reporting in admin dashboard

2. **Availability System**
   - Check product availability based on date ranges
   - Consider inventory quantity when checking availability
   - Show clear messages when products are unavailable

3. **Discount Code System**
   - Validate hotel-specific discount codes
   - Apply discount to final price
   - Adjust revenue sharing when discount code is used

4. **Email Notifications**
   - Use Resend for all email communications
   - Include all relevant reservation details
   - Generate and attach ICS calendar files

5. **User Experience**
   - Implement clear navigation paths
   - Show loading states during async operations
   - Provide clear error messages
   - Ensure mobile responsiveness

## Deployment Guidelines

1. **Vercel Deployment**
   - Test locally before pushing to GitHub
   - Ensure all environment variables are set in Vercel
   - Configure Stripe webhook endpoint correctly

2. **Database Management**
   - Run `prisma generate` after schema changes
   - Use migrations for production database changes
   - Back up database regularly

3. **Monitoring**
   - Set up error logging
   - Monitor API endpoint performance
   - Track user flows and conversion rates

## Always Remember

- The complete user flow from city selection to reservation confirmation
- The admin flow for managing cities, hotels, products, and inventory
- The revenue sharing model and how discount codes affect it
- The importance of checking product availability based on dates
- The need for clear communication via email to both users and hotels
