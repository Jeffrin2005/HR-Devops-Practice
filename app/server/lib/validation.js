import { z } from 'zod';
export const id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid record ID');
export const password = z.string().min(12).max(72).refine(value => Buffer.byteLength(value) <= 72, 'Password exceeds 72 bytes');
export const text = z.string().trim().min(1).max(200);
export const email = z.string().trim().toLowerCase().email().max(254);
export const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, 'Invalid date');
export const money = z.union([z.string(), z.number()]).transform(value => String(value))
  .refine(value => /^\d{1,10}(\.\d{1,2})?$/.test(value), 'Use a nonnegative amount with at most two decimal places');
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ success: false, error: result.error.issues[0].message });
    req.body = result.data;
    next();
  };
}
export function validateId(req, res, next) {
  if (!id.safeParse(req.params.id).success) return res.status(400).json({ success: false, error: 'Invalid record ID' });
  next();
}
export { z };
