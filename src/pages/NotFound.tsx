import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Helmet>
        <title>Page Not Found | BF SUMA Royal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! This page doesn't exist.</p>
        <Button asChild variant="default" size="lg">
          <Link to="/" className="inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
