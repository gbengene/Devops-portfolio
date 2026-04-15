import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Your Name — DevOps Engineer',
  description: 'DevOps portfolio showcasing CI/CD, Kubernetes, Terraform, and cloud infrastructure projects.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
