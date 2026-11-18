// Convert through decimal strings, never through binary floating point arithmetic.
export function toMinorUnits(value) {
  const raw = String(value);
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(raw)) throw Object.assign(new Error('Invalid monetary amount'), { status: 400 });
  const [whole, fraction = ''] = raw.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
export function calculateSalary(basic, allowances = 0, deductions = 0) {
  const amount = toMinorUnits(basic) + toMinorUnits(allowances) - toMinorUnits(deductions);
  if (amount < 0) throw Object.assign(new Error('Deductions exceed earnings'), { status: 400 });
  return amount / 100;
}
