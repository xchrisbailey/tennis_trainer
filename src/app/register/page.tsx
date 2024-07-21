import { lucia, validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hash } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
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

const register_form_schema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

async function register_action(formData: FormData) {
  "use server";

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
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  } catch (error) {
    return {
      error: "An unknown error occurred: " + error,
    };
  }
}
