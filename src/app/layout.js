import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toaster from '@/components/ui/Toaster';

export const metadata = {
  title: 'InternCheck – Is This Internship Real? | Verification & Risk Assessment',
  description:
    'Don’t just find internships. Verify them. Automated 10-point rule-based risk assessment, verified senior experiences, and scam reporting for college students.',
  keywords: 'internship verification, scam detector, engineering project, student experiences, college internships',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <Toaster />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
