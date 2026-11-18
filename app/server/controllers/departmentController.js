import Department from '../models/Department.js';
export const getDepartments = async (_req, res) => res.json({ success: true, departments: await Department.find({ archived: { $ne: true } }) });
export const addDepartment = async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, message: 'Department created successfully', department });
};
export const getDepartment = async (req, res) => {
  const department = await Department.findOne({ _id: req.params.id, archived: { $ne: true } });
  if (!department) return res.status(404).json({ success: false, error: 'Department not found' });
  res.json({ success: true, department });
};
export const updateDepartment = async (req, res) => {
  const department = await Department.findOneAndUpdate({ _id: req.params.id, archived: { $ne: true } }, req.body, { new: true, runValidators: true });
  if (!department) return res.status(404).json({ success: false, error: 'Department not found' });
  res.json({ success: true, message: 'Department updated successfully', department });
};
export const deleteDepartment = async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
  if (!department) return res.status(404).json({ success: false, error: 'Department not found' });
  res.json({ success: true, message: 'Department archived; employee history retained' });
};
