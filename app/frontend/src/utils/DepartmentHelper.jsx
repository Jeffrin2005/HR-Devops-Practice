import { useNavigate } from "react-router-dom"
import axios from "axios"
export const DepartmentButtons = ({ Id , onDepartmentDelete }) => {
    const navigate = useNavigate();
    const handleDelete  = async () => {
        const confirm = window.confirm("Archive this department? Employee and payroll history will be retained.")
        if(!confirm){
            return
        } 
        try {
            const response = await axios.delete(
                `/api/department/${Id}`,
                {
                    headers:{

                    }
                });
            if(response.data.success){
               onDepartmentDelete()
            }
        } catch (error) {
            if(error.response && !error.response.data.success){
                alert(error.response.data.error)
            }
        }
    }

    return (
        <div className="flex gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => navigate(`/admin-dashboard/department/${Id}`)}
            >
              Edit
            </button>
        <button
        className="px-3 py-1 bg-red-600 text-white"
        onClick={handleDelete}>
        Archive</button>
        </div>
    )
}
