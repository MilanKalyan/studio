
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kinect - Privacy Policy',
  description: 'Privacy Policy for the Kinect application.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-primary/20 animate-fade-in opacity-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary text-center">
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/90">
          <p>
            This app collects user-submitted messages, file uploads (if implemented), and call metadata (if implemented) for the purpose of communication between users within the Kinect platform.
          </p>
          <p>
            Data is stored securely using Google Firebase services (Firestore for messages, potentially Firebase Storage for files). We implement standard security practices, but no system is impenetrable. We are not responsible for unauthorized access beyond our reasonable control.
          </p>
          <p>
            Your data, including messages, profiles, and friend lists, is primarily used to provide the core functionality of the Kinect app and is not shared with unrelated third parties for marketing purposes. Anonymized usage data may be collected to improve the service.
          </p>
          <p>
            Users may request the review or removal of their personal data associated with their account at any time by contacting the application support (contact information to be provided). Please note that deleting your account will remove your profile information and messages you sent from active view, but some data may be retained in backups for a limited period or as required by law.
          </p>
          <p className="text-sm text-muted-foreground mt-6">
            This policy may be updated periodically. Continued use of the app signifies acceptance of the updated policy. Last updated: [Insert Date].
          </p>
          <div className="mt-6 flex justify-center">
             <Button variant="outline" asChild>
                 <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to App
                 </Link>
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
