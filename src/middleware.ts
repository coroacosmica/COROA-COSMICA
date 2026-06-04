import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // First run the intl middleware to get the localized response
  const intlResponse = intlMiddleware(request);
  
  // Then pass that response to Supabase to update the session cookies if needed
  return await updateSession(request, intlResponse);
}

export const config = {
  matcher: [
    "/",
    "/(pt|es|fr|de|it|nl|pl|ro|en|en-us|ar|ar-eg|pt-br)/:path*",
    "/((?!api|_next|_vercel|images|favicon.ico|.*\\..*).*)",
  ],
};
