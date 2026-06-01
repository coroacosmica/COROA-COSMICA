import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(pt|es|fr|de|it|nl|pl|ro|en|en-us|ar|ar-eg|pt-br)/:path*",
    "/((?!api|_next|_vercel|images|favicon.ico|.*\\..*).*)",
  ],
};
