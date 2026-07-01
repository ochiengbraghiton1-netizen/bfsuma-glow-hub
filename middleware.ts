import { next } from "@vercel/functions";

const SEO_RENDER_URL = "https://sboaeutgckyiwunfmxqp.supabase.co/functions/v1/seo-render";

const BOT_USER_AGENT = /(googlebot|bingbot|twitterbot|facebookexternalhit|linkedinbot|slackbot)/i;
const PUBLIC_FILE = /\.[a-z0-9]+$/i;

export const config = {
  runtime: "edge",
  matcher: "/((?!assets/|images/|favicon\\.png|placeholder\\.svg|robots\\.txt|sitemap\\.xml).*)",
};

export default async function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") || "";

  if (!BOT_USER_AGENT.test(userAgent)) {
    return next();
  }

  const url = new URL(request.url);

  if (PUBLIC_FILE.test(url.pathname)) {
    return next();
  }

  const renderUrl = new URL(SEO_RENDER_URL);
  renderUrl.searchParams.set("path", `${url.pathname}${url.search}`);

  const rendered = await fetch(renderUrl.toString(), {
    headers: {
      "user-agent": userAgent,
      accept: "text/html",
      "x-original-host": url.host,
      "x-original-path": `${url.pathname}${url.search}`,
    },
  });

  if (!rendered.ok) {
    return next();
  }

  const headers = new Headers(rendered.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("x-bot-prerender", "vercel-middleware");

  return new Response(rendered.body, {
    status: rendered.status,
    statusText: rendered.statusText,
    headers,
  });
}