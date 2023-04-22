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

    // document.querySelector('#_ThCheck').style.display = ''
    for( let i of video_table.childNodes ) {
        if( !i.id.startsWith('acquisition') ) continue
        // i.querySelector('.TdCheckBox').style.display = ''
        i.querySelector('.acquisitionTableName').innerHTML = `
            <input type="text" class="input" value=${i.querySelector('.acquisitionTableName').innerText}></input>
        `;
        i.querySelector('.acquisitionTableClass').innerHTML = `
            <div class="btn-group w-100" >
                <button class="btn btn-light dropdown-toggle py-1" type="button" data-bs-toggle="dropdown"
                data-bs-auto-close="true" aria-expanded="false" style="font-size:0.8rem;">Thumbsup</button>
                <ul id="acquisitionClassesDropdown" class="dropdown-menu w-100">
                    ${ classes.map(classe => 
                        `<li><button class="dropdown-item block"
                        onclick="this.parentElement.parentElement.parentElement.querySelector('.dropdown-toggle').innerText='${classe}'">${classe}</button></li>`
                    ).join('\n') }
                </ul>
            </div>
        `;
    }
    btn.innerHTML = btn.innerHTML + ' Confirm?'

    btn.onclick = () => {
        tableSorting[2] = 'none'
        // document.querySelector('#_ThCheck').style.display = 'none';
        for( let i of video_table.childNodes ) {
            if( !i.id.startsWith('acquisition') ) continue
            // i.querySelector('.TdCheckBox').style.display = 'none';
            // i.querySelector('.TdCheckBox').innerText = 'check_box_outline_blank';
            i.querySelector('.acquisitionTableName').innerHTML = i.querySelector('input').value;
            i.querySelector('.acquisitionTableClass').innerHTML = i.querySelector('.dropdown-toggle').innerText;
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

        if(toDelete.length>0) delete_video(toDelete)
    }
}

const toogleAllAcquisitionChecks = (elem) => {
    let a = elem.querySelector('span').innerText == 'check_box' ? 'check_box_outline_blank' : 'check_box'
    elem.querySelector('span').innerText = a
    for( let i of document.querySelectorAll('.TdCheckBox') ) {
        i.querySelector('span').innerText = a
    }
}