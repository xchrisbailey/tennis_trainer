import { lucia, validateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hash, verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export async function logout_action() {
  'use server';
  const { session } = await validateRequest();
  if (!session) return redirect('/');

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return redirect('/login');
}

const login_form_schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login_action(form_data: FormData) {
  'use server';

  const {
    success: form_parse_success,
    data,
    error: form_error,
  } = login_form_schema.safeParse(Object.fromEntries(form_data.entries()));

  if (!form_parse_success) {
    return {
      error: form_error,
    };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (!user) {
    return {
      error: 'Invalid email or password',
    };
  }

  const valid_password = await verify(user.password, data.password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  if (!valid_password) {
    return {
      error: 'Invalid email or password',
    };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return redirect('/');
}

const register_form_schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export async function register_action(formData: FormData) {
  'use server';

  const {
    success: form_parse_success,
    data,
    error: form_error,
  } = register_form_schema.safeParse(Object.fromEntries(formData));

  if (!form_parse_success) {
    return {
      error: form_error,
    };
  }

  const password_hash = await hash(data.password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  try {
    const user = await db
      .insert(users)
      .values({
        email: data.email,
        password: password_hash,
      })
      .returning();

    const session = await lucia.createSession(user[0].id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  } catch (error) {
    return {
      error: 'An unknown error occurred: ' + error,
    };
  }
}
