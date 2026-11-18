import axios from "axios";
export const columns = [
    {
        name:"S No",
        selector:(row) => row.sno,
        width:"70px"
    },
    {
        name:"Name",
        selector:(row) => row.name,
        sortable:true,
        width:"130px"
    },
    {
        name:"Image",
        selector:(row) => row.profileImage,
        width:"90px"
    },
    {
        name:"Department",
        selector:(row) => row.dep_name,
        width:"120px"
    },
    {
        name:"DOB",
        selector:(row) => row.dob,
        sortable:true,
        width:"130px"
    },
    {
        name:"Action",
        selector:(row) => row.action,
    },
]

export const fetchDepartments = async () => {
    let departments ;
    try {
        const response = await axios.get('/api/department',{
            headers:{

            }
        })
        if(response.data.success){
            departments = response.data.departments
        }
    } catch (error) {
       if(error.response && !error.response.data.success){
        alert(error.response.data.error)
       }
    }
    return departments || []
};
// employee for salary form

export const getEmployees = async (id) => {
    let employees ;
    try {
        const response = await axios.
        get(`/api/employee/department/${id}`,{
            headers:{

            }
        })
        if(response.data.success){
            employees = response.data.employees
        }
    } catch (error) {
       if(error.response && !error.response.data.success){
        alert(error.response.data.error)
       }
    }
    return employees || []
};
