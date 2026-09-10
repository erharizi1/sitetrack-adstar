import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseKey, supabaseUrl } from "./env";

/** Paths anyone can open without being logged in. */
const PUBLIC_PATHS = ["/login", "/auth"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Runs before every request: keeps the login session fresh and sends anyone
 * who isn't logged in to /login. It only checks *that* someone is logged in —
 * which role they have is checked by each page and server action.
 */
export async function updateSession(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // An email link that landed on the wrong path (e.g. the site root, if its
  // redirect URL wasn't on Supabase's allow-list) still carries its token —
  // pass it on to the confirm route instead of losing it.
  if (
    searchParams.has("token_hash") &&
    searchParams.has("type") &&
    pathname !== "/auth/confirm"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/confirm";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabaseKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        // Responses that set auth cookies must never be cached — otherwise one
        // person's session could be served to someone else.
        Object.entries(headers ?? {}).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // Nothing may run between creating the client and getClaims(): this call is
  // what refreshes an expiring session. getClaims() verifies the token itself,
  // unlike getSession(), which must never be trusted on the server.
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
