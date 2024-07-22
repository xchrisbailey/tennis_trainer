import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from 'lucia';

export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId(15)),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  role: text('role').default('user'),
});

export type User = typeof users.$inferSelect;

export const sessions = sqliteTable('session', {
  id: text('id', { length: 255 }).primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  expiresAt: integer('expires_at').notNull(),
});

export type Session = typeof sessions.$inferSelect;

export const drills = sqliteTable('drill', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId(15)),
  date: text('date').notNull(),
  price: integer('price').notNull(),
  player_capacity: integer('player_capacity').notNull(),
  location: text('location').notNull(),
});
