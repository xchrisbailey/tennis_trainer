import { register_action } from '@/actions/user_actions';
import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }

  return (
    <>
      <h1>Register</h1>
      <form action={register_action}>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" placeholder="email address" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" />
        </div>

        <button>Register</button>
      </form>
    </>
  );
}
