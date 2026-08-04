import { next } from "@vercel/functions";

const SEO_RENDER_URL = "https://sboaeutgckyiwunfmxqp.supabase.co/functions/v1/seo-render";

// Include Google's URL Inspection / testing crawlers as well as normal search bots.
// Without Google-InspectionTool here, the live test receives the SPA shell, executes
// React, and can observe route-level fallback metadata instead of the prerender.
const BOT_USER_AGENT = /(googlebot|google-inspectiontool|googleother|bingbot|twitterbot|facebookexternalhit|linkedinbot|slackbot)/i;
const PUBLIC_FILE = /\.[a-z0-9]+$/i;

const applySecurityHeaders = (headers: Headers) => {
  headers.set("strict-transport-security", "max-age=63072000; includeSubDomains; preload");
  headers.set("x-frame-options", "DENY");
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  headers.set("x-xss-protection", "0");
  headers.set("cross-origin-opener-policy", "same-origin-allow-popups");
};

export const config = {
  runtime: "edge",
  matcher: "/((?!assets/|images/|favicon\\.png|placeholder\\.svg|robots\\.txt|sitemap\\.xml).*)",
};

export default async function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") || "";

  if (!BOT_USER_AGENT.test(userAgent)) {
    const response = next();
    applySecurityHeaders(response.headers);
    return response;
  }

  const url = new URL(request.url);

  if (PUBLIC_FILE.test(url.pathname)) {
    const response = next();
    applySecurityHeaders(response.headers);
    return response;
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
    const response = next();
    applySecurityHeaders(response.headers);
    return response;
  }

  const headers = new Headers(rendered.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("x-bot-prerender", "vercel-middleware");
  applySecurityHeaders(headers);

  return new Response(rendered.body, {
    status: rendered.status,
    statusText: rendered.statusText,
    headers,
  });
}