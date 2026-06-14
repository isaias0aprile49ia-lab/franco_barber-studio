import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Account from './components/Account';
import Shop from './components/Shop';
import Booking from './components/Booking';

export const metadata = {
  metadataBase: new URL('https://francobarberstudio.it'),
  title: {
    default: 'Franco Barber Studio | Barberia Premium a Milano',
    template: '%s | Franco Barber Studio',
  },
  description: 'Barberia premium a Milano. Tagli classici, rasatura con rasoio e trattamenti per capelli. Prenota online.',
  keywords: ['barberia milano', 'taglio capelli milano', 'barber studio', 'rasatura rasoio', 'barbiere premium'],
  authors: [{ name: 'Franco Barber Studio' }],
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: 'Franco Barber Studio',
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#d3d1cc',
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="it" data-theme="light">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="sr-only">Salta al contenuto</a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <ScrollToTop />
        <Account />
        <Shop />
        <Booking />
      </body>
    </html>
  );
}
