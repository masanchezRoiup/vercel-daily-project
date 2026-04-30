import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SubscribeButton } from "@/components/subscribe-button";

// Renders teaser paragraph + subscribe CTA only.
// Header and image are already rendered above this boundary in ArticlePage.
export function PaywallGate() {
  return (
    <div className="max-w-3xl">
      <div className="relative mt-2">
        <div
          aria-hidden
          className="h-24 bg-gradient-to-b from-transparent to-background"
        />
        <Card className="border-border/70 bg-foreground text-background shadow-[0_22px_65px_oklch(0.18_0.008_260/0.12)]">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
            <Badge
              variant="secondary"
              className="rounded-full bg-accent-brand text-accent-brand-foreground"
            >
              Subscribers only
            </Badge>
            <h2 className="max-w-lg font-heading text-3xl font-semibold leading-tight">
              Keep reading with Vercel Daily
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-background/70">
              Subscribe to unlock the full article and every premium story on
              the site. Free, no account, persists for this browser session.
            </p>
            <div className="mt-2">
              <SubscribeButton mode="subscribe" size="lg" variant="secondary">
                Subscribe to continue
              </SubscribeButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
