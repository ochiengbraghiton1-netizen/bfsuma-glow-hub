import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, LogOut, ShoppingBag, Link2, Heart, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AccountPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Helmet>
        <title>My Account - BF SUMA ROYAL</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="flex-1 pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">My Account</h1>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{fullName}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <Link to="/account/orders" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">My Orders</p>
                    <p className="text-sm text-muted-foreground">Track your purchases</p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <Link to="/distributor/dashboard" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <Link2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Distributor Dashboard</p>
                    <p className="text-sm text-muted-foreground">Track your PV & links</p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <Link to="/#products" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <Heart className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Browse Products</p>
                    <p className="text-sm text-muted-foreground">Explore our catalog</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountPage;
