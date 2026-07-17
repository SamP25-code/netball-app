'use client';

import { useActionState } from 'react';
import { requestSignup } from '@/lib/actions/auth';

export function SignupForm() {
  const [state, action, pending] = useActionState(requestSignup, undefined);

  if (state?.success) {
    return <p className="text-sm text-gray-700">Check your email for a login link to finish signing up.</p>;
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          First name
          <input
            type="text"
            name="firstName"
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Last name
          <input
            type="text"
            name="lastName"
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          name="email"
          required
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Team reference code
        <input
          type="text"
          name="reference"
          required
          placeholder="e.g. BBR-TUE-T1"
          className="rounded border border-gray-300 px-3 py-2 uppercase"
        />
        <span className="text-xs text-gray-500">
          Ask your captain if you don&apos;t know your team&apos;s reference code.
        </span>
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Sending link…' : 'Sign up'}
      </button>
    </form>
  );
}
