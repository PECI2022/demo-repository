// console.log("acquisition base")

let tableSorting = [1,"name",'none'];
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


const acquisitionTableEdit = () => {
    tableSorting[2] = ''
    let btn = document.querySelector('#acquisitionEdit');

    if( document.querySelector('#acquisitionDelete').innerText.endsWith('?') ) {
        let btn2 = document.querySelector('#acquisitionDelete');
        btn2.innerHTML = btn2.innerHTML.substring(0,btn2.innerHTML.length-' Confirm?'.length)
        btn2.onclick = acquisitionTableDelete;
    }

    document.querySelector('#_ThCheck').style.display = ''
    for( let i of document.querySelectorAll('.TdCheckBox') ) {
        i.style.display = '';
    }
    btn.innerHTML = btn.innerHTML + ' Confirm?'

    btn.onclick = () => {
        tableSorting[2] = 'none'
        document.querySelector('#_ThCheck').style.display = 'none';
        for( let i of document.querySelectorAll('.TdCheckBox') ) {
            i.style.display = 'none';
            i.querySelector('span').innerText = 'check_box_outline_blank'
        }
        btn.innerHTML = btn.innerHTML.substring(0,btn.innerHTML.length-' Confirm?'.length)

        document.querySelector('#acquisitionEdit').onclick = acquisitionTableEdit;
    }
}

const acquisitionTableDelete = () => {
    tableSorting[2] = ''
    let btn = document.querySelector('#acquisitionDelete');

    if( document.querySelector('#acquisitionEdit').innerText.endsWith('?') ) {
        let btn2 = document.querySelector('#acquisitionEdit');
        btn2.innerHTML = btn2.innerHTML.substring(0,btn2.innerHTML.length-' Confirm?'.length)
        btn2.onclick = acquisitionTableEdit;
    }

    document.querySelector('#_ThCheck').style.display = ''
    for( let i of document.querySelectorAll('.TdCheckBox') ) {
        i.style.display = '';
    }
    btn.innerHTML = btn.innerHTML + ' Confirm?'

    btn.onclick = async () => {
        tableSorting[2] = 'none'
        document.querySelector('#_ThCheck').style.display = 'none';

        let toDelete = [];

        for( let i of document.querySelectorAll('.TdCheckBox') ) {
            if( i.querySelector('span').innerText=='check_box' ) toDelete.push(i.parentElement.id.substring('acquisitionTR'.length))
            i.style.display = 'none';
            i.querySelector('span').innerText = 'check_box_outline_blank'
        }
        btn.innerHTML = btn.innerHTML.substring(0,btn.innerHTML.length-' Confirm?'.length)

        document.querySelector('#acquisitionDelete').onclick = acquisitionTableDelete;

        console.log(toDelete)
        for(let i of toDelete) await delete_video(i)
    }
}

const toogleAllAcquisitionChecks = (elem) => {
    let a = elem.querySelector('span').innerText == 'check_box' ? 'check_box_outline_blank' : 'check_box'
    elem.querySelector('span').innerText = a
    for( let i of document.querySelectorAll('.TdCheckBox') ) {
        i.querySelector('span').innerText = a
    }
}