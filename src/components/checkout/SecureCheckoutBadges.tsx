import { Shield } from 'lucide-react';

const VisaIcon = () => (
  <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="white" stroke="currentColor" strokeWidth="0.5" className="text-border" />
    <path d="M19.5 21H17L18.8 11H21.3L19.5 21Z" fill="#1A1F71" />
    <path d="M28.5 11.2C28 11 27.2 10.8 26.2 10.8C23.7 10.8 22 12.1 22 13.9C22 15.2 23.2 15.9 24.1 16.4C25 16.8 25.3 17.1 25.3 17.5C25.3 18.1 24.6 18.4 23.9 18.4C22.9 18.4 22.4 18.3 21.6 17.9L21.3 17.8L21 19.5C21.5 19.8 22.5 20 23.6 20C26.3 20 27.9 18.7 27.9 16.8C27.9 15.8 27.3 15 25.9 14.4C25.1 14 24.6 13.7 24.6 13.3C24.6 12.9 25 12.5 25.9 12.5C26.7 12.5 27.3 12.7 27.7 12.9L27.9 13L28.5 11.2Z" fill="#1A1F71" />
    <path d="M31.8 11H29.8C29.2 11 28.8 11.2 28.5 11.8L25 21H27.6L28.1 19.5H31.3L31.6 21H34L31.8 11ZM28.8 17.6L30.1 13.8L30.8 17.6H28.8Z" fill="#1A1F71" />
    <path d="M16.8 11L14.3 17.8L14 16.2C13.5 14.6 12 12.8 10.3 11.9L12.5 21H15.2L19.5 11H16.8Z" fill="#1A1F71" />
    <path d="M12.8 11H8.7L8.7 11.2C11.9 12 14.1 14 14.9 16.3L14 11.8C13.9 11.2 13.4 11 12.8 11Z" fill="#F7A600" />
  </svg>
);

const MasterCardIcon = () => (
  <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="white" stroke="currentColor" strokeWidth="0.5" className="text-border" />
    <circle cx="20" cy="16" r="8" fill="#EB001B" />
    <circle cx="28" cy="16" r="8" fill="#F79E1B" />
    <path d="M24 10.3C25.7 11.7 26.8 13.7 26.8 16C26.8 18.3 25.7 20.3 24 21.7C22.3 20.3 21.2 18.3 21.2 16C21.2 13.7 22.3 11.7 24 10.3Z" fill="#FF5F00" />
  </svg>
);

const PayPalIcon = () => (
  <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="white" stroke="currentColor" strokeWidth="0.5" className="text-border" />
    <path d="M19.5 24.5H17.2L17.4 23.2L15.5 23.2L14.5 24.5H12L16.5 8.5H21C23.5 8.5 25.2 9.8 24.7 12.5C24 16.5 21 17 19 17H17.5L16.8 21.5" fill="#003087" fillOpacity="0.15" />
    <path d="M30 8.5C32.5 8.5 34 9.8 33.5 12.5C32.8 16.5 30 17.5 28 17.5H26.5L25.8 21.5H22.5L26 8.5H30Z" fill="#003087" />
    <path d="M21.5 8.5C24 8.5 25.5 9.8 25 12.5C24.3 16.5 21.5 17.5 19.5 17.5H18L17.3 21.5H14L17.5 8.5H21.5Z" fill="#0070E0" />
  </svg>
);

const SSLIcon = () => (
  <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="white" stroke="currentColor" strokeWidth="0.5" className="text-border" />
    <path d="M24 8C21.2 8 19 10.2 19 13V15H18C17.4 15 17 15.4 17 16V23C17 23.6 17.4 24 18 24H30C30.6 24 31 23.6 31 23V16C31 15.4 30.6 15 30 15H29V13C29 10.2 26.8 8 24 8ZM21 13C21 11.3 22.3 10 24 10C25.7 10 27 11.3 27 13V15H21V13Z" fill="#047857" />
    <circle cx="24" cy="19.5" r="1.5" fill="white" />
    <rect x="23.5" y="19.5" width="1" height="2.5" rx="0.5" fill="white" />
  </svg>
);

const SecureCheckoutBadges = () => {
  return (
    <div className="mt-6 pt-6 border-t border-border">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Secure Checkout</span> — Your payment information is protected with industry-standard encryption.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {[VisaIcon, MasterCardIcon, PayPalIcon, SSLIcon].map((Icon, i) => (
            <div
              key={i}
              className="opacity-80 hover:opacity-100 transition-opacity duration-200 drop-shadow-sm"
            >
              <Icon />
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Payments processed securely via PayPal. Visa and MasterCard accepted.
        </p>
      </div>
    </div>
  );
};

export default SecureCheckoutBadges;
