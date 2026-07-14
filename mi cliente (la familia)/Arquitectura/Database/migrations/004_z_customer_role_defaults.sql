ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';

UPDATE users u
SET role = 'customer'
FROM employees e
WHERE e.id = u.employee_id
  AND u.role = 'cashier'
  AND u.username LIKE '%@%'
  AND u.must_change_password = FALSE
  AND e.pin IS NULL;

UPDATE employees e
SET role = 'customer'
FROM users u
WHERE u.employee_id = e.id
  AND u.role = 'customer'
  AND e.role = 'cashier'
  AND e.pin IS NULL;
