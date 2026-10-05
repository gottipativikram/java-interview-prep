// Vercel Routing Middleware: every page except the login page and the login API needs a valid session cookie.
export const config = {
  matcher: ['/((?!login\\.html|api/|favicon\\.ico).*)'],
};

export default function middleware(request) {
  const token = process.env.AUTH_TOKEN;
  const cookies = (request.headers.get('cookie') || '').split(/;\s*/);
  if (token && cookies.includes(`jip_auth=${token}`)) return; // signed in: continue to the page

  const url = new URL(request.url);
  const login = new URL('/login.html', url);
  if (url.pathname !== '/') login.searchParams.set('next', url.pathname);
  return Response.redirect(login, 307);
}
