import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
  
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: defaultLocale,
  
  // Redirect to default locale if no locale is found
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next|admin|auth|.*\\..*).*)']
};