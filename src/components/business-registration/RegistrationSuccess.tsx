import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  CreditCard, 
  Clock, 
  Rocket, 
  User, 
  Phone, 
  Users,
  ArrowRight,
  Home,
  RefreshCw
} from 'lucide-react';

interface RegistrationData {
  id?: string;
  full_name: string;
  phone: string;
  email?: string;
  county_city: string;
  has_sponsor: boolean;
  sponsor_name?: string;
  sponsor_phone?: string;
  entry_fee?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'payment_pending' | 'payment_received';
}

interface RegistrationSuccessProps {
  registrationData: RegistrationData;
  onStartNew?: () => void;
}

const RegistrationSuccess = ({ registrationData, onStartNew }: RegistrationSuccessProps) => {
  const navigate = useNavigate();
  
  const status = registrationData.status || 'pending';
  const entryFee = registrationData.entry_fee || 7000;
  const sponsorDisplay = registrationData.has_sponsor && registrationData.sponsor_name 
    ? registrationData.sponsor_name 
    : 'BF SUMA Company Sponsor';

  // Redirect to dashboard if approved
  useEffect(() => {
    if (status === 'approved') {
      const timer = setTimeout(() => {
        navigate('/affiliate');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'payment_received':
        return <Badge className="bg-blue-500 text-white">Payment Received</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending Activation</Badge>;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-300">Your account is now active!</p>
              <p className="text-sm text-green-600 dark:text-green-400">Redirecting to your dashboard...</p>
            </div>
          </div>
        );
      case 'payment_received':
        return (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-700 dark:text-blue-300">Payment received, waiting for confirmation</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Our team is reviewing your registration. You'll be notified soon.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleProceedToPayment = () => {
    // Navigate to checkout with business registration context
    navigate('/checkout', { 
      state: { 
        businessRegistration: true,
        registrationId: registrationData.id,
        amount: entryFee 
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-fade-in">
            Registration Successful 🎉
          </h1>
          <p className="text-lg text-muted-foreground animate-fade-in">
            Welcome to BF SUMA. Your registration has been received.
          </p>
        </div>

        {/* Status Message */}
        {getStatusMessage()}

        {/* Registration Details Card */}
        <Card className="mt-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Your Registration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {/* Full Name */}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-medium">{registrationData.full_name}</span>
              </div>
              
              {/* Phone Number */}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </span>
                <span className="font-medium">{registrationData.phone}</span>
              </div>
              
              {/* Membership Status */}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Membership Status</span>
                {getStatusBadge()}
              </div>
              
              {/* Registration Fee */}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Registration Fee</span>
                <span className="font-bold text-primary text-lg">KES {entryFee.toLocaleString()}</span>
              </div>
              
              {/* Sponsor / Upline */}
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Sponsor / Upline
                </span>
                <span className="font-medium">{sponsorDisplay}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        {status === 'pending' && (
          <Card className="mt-6 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Make Payment */}
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Make Payment</h3>
                  <p className="text-muted-foreground">
                    To activate your account, please pay <strong>KES {entryFee.toLocaleString()}</strong>.
                  </p>
                  <Button 
                    onClick={handleProceedToPayment}
                    size="lg" 
                    className="w-full sm:w-auto group"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Step 2: Wait for Confirmation */}
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Wait for Confirmation</h3>
                  <p className="text-muted-foreground">
                    After payment, your account will be reviewed and confirmed by our team.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Step 3: Get Access */}
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Get Access</h3>
                  <p className="text-muted-foreground">
                    Once approved, you will get access to your dashboard, referral link, and training materials.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
          {onStartNew && (
            <Button 
              variant="ghost" 
              onClick={onStartNew}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Submit Another Application
            </Button>
          )}
        </div>

        {/* Contact Support */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Need help? Contact us at{' '}
          <a href="tel:+254795454053" className="text-primary hover:underline">
            +254 795 454 053
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
