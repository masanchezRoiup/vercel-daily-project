import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/session-cookie";

export function proxy(req: NextRequest) {
  // This only demonstrates the hard-gate pattern for hypothetical private
  // routes. Article routes stay outside the matcher because they must render
  // the teaser and inline paywall for non-subscribers.
  if (req.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  // const url = req.nextUrl.clone();
  // url.pathname = "/";
  // url.searchParams.set("from", req.nextUrl.pathname);
  // url.searchParams.set("subscribe", "required");
  // return NextResponse.redirect(url);
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/billing/:path*"],
};
