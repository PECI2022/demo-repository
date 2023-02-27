// collect DOMs
const display = document.querySelector('.display')
const controllerWrapper = document.querySelector('.controllers')

const State = ['Initial', 'Record', 'Download']

let stateIndex = 0
let mediaRecorder, chunks = [], audioURL = ''

// mediaRecorder setup for audio
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
    console.log('mediaDevices supported..')

    // set state to initial and display message
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(stream => {
        mediaRecorder = new MediaRecorder(stream)

        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data)
        }

        // when mediaRecorder stops, set state to download and display message
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'})
            chunks = []
            audioURL = window.URL.createObjectURL(blob)
            document.querySelector('audio').src = audioURL
            addDownloadButton()
        }
    }).catch(error => {
        console.log('Following error has occured : ',error)
    })
}else{
    // if mediaDevices is not supported, set state to empty and display message
    stateIndex = ''
    application(stateIndex)
}


const clearDisplay = () => {
    display.textContent = ''
}

const clearControls = () => {
    controllerWrapper.textContent = ''
}

const record = () => {
    stateIndex = 1
    mediaRecorder.start()
    application(stateIndex)
}

const stopRecording = () => {
    stateIndex = 2
    mediaRecorder.stop()
    application(stateIndex)
}

const downloadAudio = async () => {
    const fileName = prompt("Please enter a file name:", "audio");

    if (fileName === null || fileName.trim() === '') {
        return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = audioURL;
    downloadLink.download = fileName.trim() + '.wav';
    downloadLink.click();
    
}

const addDownloadButton = () => {
    addButton('download', 'downloadAudio()', 'Download Audio')
}

const addButton = (id, funString, text) => {
    const btn = document.createElement('button')
    btn.id = id
    btn.setAttribute('onclick', funString)
    btn.textContent = text
    btn.classList.add('big-button') // add this line to add a CSS class
    controllerWrapper.append(btn)
}


const addMessage = (text) => {
    const msg = document.createElement('p')
    msg.textContent = text
    msg.classList.add('white-text') // add this line to add a CSS class
    display.append(msg)
}


const addAudio = () => {
    const audio = document.createElement('audio')
    audio.controls = true
    audio.src = audioURL
    display.append(audio)
}

const list_audio_fetch = async () => {
    const response = await fetch('http://127.0.0.1:5001/list_videos');
    let list = await response.json()
    if(!list) return
    let list_html = ''
    for(let i = 0; i < list.length; i++){
        list_html += `<a style="cursor:pointer;" onclick="load_audio('${i}')">${i}</a>`;
    }
    document.querySelector('.list').innerHTML = list_html
};list_audio_fetch()

const load_audio = async (name) => {
    console.log(name)
    let response = await fetch('http://127.0.0.1:5001/download_audio', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({name}) 
    });
    let blob = await response.blob()
    let audioURL = window.URL.createObjectURL(blob)
    document.querySelector('audio').src = audioURL

    clearControls()
    clearDisplay()
}




const application = (index) => {
    switch (State[index]) {
        case 'Initial':
            clearDisplay()
            clearControls()

            addButton('record', 'record()', 'Start Recording')
            break;

        case 'Record':
            clearDisplay()
            clearControls()

            addMessage('Recording...') 

            addButton('stop', 'stopRecording()', 'Stop Recording')

            // increase timer by 1 second every second at inicial time 00:00
            let seconds = 0
            let minutes = 0
            let timerInterval = setInterval(() => {
                seconds++
                if (seconds === 60) {
                    seconds = 0
                    minutes++
                }
                let secondsString = seconds < 10 ? '0' + seconds : seconds
                let minutesString = minutes < 10 ? '0' + minutes : minutes
                document.querySelector('.display p').textContent = `${minutesString}:${secondsString}`
            }, 1000)

            display.append(document.createElement('p'))

            // reset timer when stop recording button is clicked
            document.querySelector('#stop').addEventListener('click', () => {
                clearInterval(timerInterval)
            })
            break

        case 'Download':
            clearControls()
            clearDisplay()

            addAudio()
            addButton('record', 'record()', 'Record Again')
            break

        default:
            clearControls()
            clearDisplay()

            addMessage('Your browser does not support mediaDevices')
            break;
    }
}

// initial state
application(stateIndex)