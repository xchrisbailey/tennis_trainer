import { lucia, validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
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

const login_form_schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function login_action(form_data: FormData) {
  "use server";

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
      error: "Invalid email or password",
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
      error: "Invalid email or password",
    };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}
