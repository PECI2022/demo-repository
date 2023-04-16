// console.log("acquisition base")

document.querySelector('#divProjectContent').style.height = (window.innerHeight-50) + 'px';

let tableSorting = [1,"name"];
let tableHeadersDic = {
    'Name':'name',
    'Class':'video_class',
    'Duration': 'length',
    'Date': 'update'
}

const editTableSorting = (elem) => {
    let title = elem.id.slice(2);
    
    for( let th of elem.parentNode.childNodes ) {
        if( th.id && th.id.startsWith("Th") )
            th.querySelector("span").innerText = "";
    }

    if( title in tableHeadersDic ) {
        if( tableSorting[1]==tableHeadersDic[title] ) tableSorting[0] = tableSorting[0]*-1;
        tableSorting[1] = tableHeadersDic[title];
        elem.querySelector('span').innerText = tableSorting[0]==1 ? 'north_east' : 'south_east';
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