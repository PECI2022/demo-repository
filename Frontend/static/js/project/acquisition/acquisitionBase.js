// console.log("acquisition base")

let tableSorting = [1,"name"];
let tableHeadersDic = {
    'Name':'name',
    'Class':'video_class',
    'Duration': 'length',
    'Date': 'update'
}

const editTableSorting = (elem) => {
    let title = elem.innerText;
    console.log(title)

    if( title in tableHeadersDic ) {
        if( tableSorting[1]==tableHeadersDic[title] ) tableSorting[0] = tableSorting[0]*-1;
        tableSorting[1] = tableHeadersDic[title];
    }
    list_videos_fetch()
}

// $('#recordsTable').DataTable();
// $('#recordsTable').bootstrapTable({
//     toggle: 
//     search: true,
//     columns: [{
//         field: 'name',
//         title: 'Name'
//     }, {
//         field: 'class',
//         title: 'Class'
//     }, {
//         field: 'duration',
//         title: 'Duration'
//     }, {
//         field: 'date',
//         title: 'Date'
//     }],
//   })