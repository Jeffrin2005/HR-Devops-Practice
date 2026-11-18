import { useNavigate } from "react-router-dom";                 
export const EmployeeButtons = ({ Id }) => {
    const navigate = useNavigate();
    

    return (
        <div className="flex gap-2">
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={() => navigate(`/admin-dashboard/employee/${Id}`)}
            >
              👁️ View
            </button>
        <button
        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
        onClick={() => navigate(`/admin-dashboard/employees/edit/${Id}`)}
        >
        ✏️ Edit</button>
        <button
        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
        onClick={() => navigate(`/admin-dashboard/employees/salary/${Id}`)}>
        💰 Salary</button>
        <button
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
        onClick={() => navigate(`/admin-dashboard/employees/leaves/${Id}`)}>
        📅 Leave</button>
        </div>
    )
}
