import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="max-w-md text-center">
          <h1 className="text-8xl font-display font-bold text-gradient-brand">404</h1>
          <h2 className="mt-4 text-2xl font-display font-semibold">Page not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you're looking for doesn't exist. Let us guide you back home.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-full gradient-brand px-6 py-3 text-sm font-medium text-white shadow-elegant hover:opacity-90"
          >
            Return home
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-display font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please try refreshing the page or return home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full gradient-brand px-6 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border px-6 py-2 text-sm font-medium">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PraisePalace Church — It Shall End In Praise | RCCG UK" },
      { name: "description", content: "PraisePalace Church, a Redeemed Christian Church of God parish in Newport Pagnell, UK. Join us for Sunday worship, bible study, ministries and community." },
      { name: "author", content: "PraisePalace Church" },
      { property: "og:title", content: "PraisePalace Church — It Shall End In Praise | RCCG UK" },
      { property: "og:description", content: "PraisePalace Church, a Redeemed Christian Church of God parish in Newport Pagnell, UK. Join us for Sunday worship, bible study, ministries and community." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PraisePalace Church" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "PraisePalace Church — It Shall End In Praise | RCCG UK" },
      { name: "twitter:description", content: "PraisePalace Church, a Redeemed Christian Church of God parish in Newport Pagnell, UK. Join us for Sunday worship, bible study, ministries and community." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/52109521-a1a0-4f8c-a46a-79d1e26ac335/id-preview-478fb525--87301749-41d3-4482-b765-6fcd208e0c3f.lovable.app-1783438795687.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/52109521-a1a0-4f8c-a46a-79d1e26ac335/id-preview-478fb525--87301749-41d3-4482-b765-6fcd208e0c3f.lovable.app-1783438795687.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
