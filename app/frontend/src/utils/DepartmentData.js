export const columns = [
    {
        name:"S No",
        selector:(row) => row.sno
    },
    {
        name:"Department Name",
        selector:(row) => row.dep_name,
        sortable:true
    },
    {
        name:"Action",
        selector:(row) => row.action
    },
]
