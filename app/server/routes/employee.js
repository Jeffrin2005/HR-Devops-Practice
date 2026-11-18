import express from 'express';
import auth from '../middleware/authMiddleware.js';
import roles from '../middleware/roleMiddleware.js';
import access from '../middleware/employeeAccess.js';
import { z, text, id, date, money, email, password, validate, validateId } from '../lib/validation.js';
import { addEmployee, upload, getEmployees, getEmployee, updateEmployee, fetchEmployeesByDepId } from '../controllers/employeeController.js';
const router = express.Router();
const fields = { maritalStatus: text.optional(), designation: text.optional(), department: id, salary: money };
router.use(auth);
router.get('/', roles(['admin']), getEmployees);
router.post('/add', roles(['admin']), upload.single('image'), validate(z.object({
  ...fields, name: text, email, password, role: z.enum(['admin', 'employee']).default('employee'),
  employeeID: text, dob: date.optional(), gender: text.optional(),
})), addEmployee);
router.get('/department/:id', roles(['admin']), validateId, fetchEmployeesByDepId);
router.get('/:id', validateId, access, getEmployee);
router.put('/:id', roles(['admin']), validateId, validate(z.object({ ...fields, name: text.optional() }).partial()), updateEmployee);
export default router;
