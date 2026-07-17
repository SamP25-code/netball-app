import Link from 'next/link';
import { SignupForm } from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-2xl font-semibold">Sign up</h1>
      <SignupForm />
      <p className="mt-6 text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
