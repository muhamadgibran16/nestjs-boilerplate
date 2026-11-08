import { TransformFnParams } from 'class-transformer';

/** Untuk `@Transform(trim)`: hapus spasi di awal/akhir string. */
export const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

/** Untuk `@Transform(normalizeEmail)`: trim + lowercase. */
export const normalizeEmail = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;
