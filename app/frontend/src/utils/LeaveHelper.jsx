import { useNavigate } from "react-router-dom";

export const LeaveButtons = ({Id}) =>{
    const navigate = useNavigate();
    const handleView =(id) =>{
        navigate(`/admin-dashboard/leaves/${id}`)
    }
    return(
        <div>
            <button onClick={()=>handleView(Id)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded shadow whitespace-nowrap"
            >View
            </button>
        </div>
    )
}