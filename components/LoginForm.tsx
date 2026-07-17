'use client';

import { useActionState } from 'react';
import { requestLogin } from '@/lib/actions/auth';

export function LoginForm() {
  const [state, action, pending] = useActionState(requestLogin, undefined);

  if (state?.success) {
    return <p className="text-sm text-gray-700 dark:text-gray-300">Check your email for a login link.</p>;
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          name="email"
          required
          className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
      </label>
      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? 'Sending link…' : 'Send login link'}
      </button>
    </form>
  );
}
