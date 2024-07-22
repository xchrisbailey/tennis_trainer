import { login_action } from '@/actions/user_actions';
import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }

  return (
    <>
      <h1>Login</h1>
      <form action={login_action}>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" />
        </div>
        <button>Login</button>
      </form>
    </>
  );
}
