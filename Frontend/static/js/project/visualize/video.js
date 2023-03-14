let camera_button_back = document.querySelector("#startDisplayButtonBack");
let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let video_snapshot = document.querySelector("#video_snapshot");
let canvas_handpoints = document.querySelector("#draw_hand")

camera_button.addEventListener('click', async () => {
    camera_stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

    camera_button_back.style.display = 'none';
    camera_button.style.display = 'none';

    video.srcObject = camera_stream;
    video.style.display = 'block';

    canvas_handpoints.style.display = 'block'
    
    let ctx = video_snapshot.getContext('2d');
    let ctx_handpoints = canvas_handpoints.getContext('2d');
    ctx_handpoints.clearRect(0,0,640,480);
    let interval = setInterval(()=>{
        console.log()
        ctx.drawImage(video, 0, 0, video_snapshot.width,video_snapshot.height);
        
        ctx_handpoints.fillStyle = "red";
        // ctx_handpoints.fillRect(50, 50, 10, 10);
        video_snapshot.toBlob(blob=>{
            let formData = new FormData();
            formData.append('blob', blob)
            fetch('http://127.0.0.1:5002/uploadFrame', {method:'POST',body:formData})
                .then(resp=>resp.json())
                .then(data=>{
                    if(data['status']==201) {
                        document.querySelector("#gessedClass").innerHTML = data['class']
                        document.querySelector("#gessedAccuracy").innerHTML = data['accuracy']
                        let points = data['points'][0]
                        ctx_handpoints.clearRect(0,0,640,480);
                        if(document.querySelector('#mediapipeCheck').checked) {
                            for(let i=0; i<points.length; i++) {
                                ctx.fillStyle = "blue";
                                console.log(points[i][0], points[i][1])
                                ctx_handpoints.fillRect(640-points[i][0]/480*640, points[i][1]/640*480, 10, 10);
                            }
                        }
                    } else {
                        document.querySelector("#gessedClass").innerHTML = ''
                        document.querySelector("#gessedAccuracy").innerHTML = ''
                    }
                    console.log(data)

                })
        })

    }, 1000/12);

    // let media_recorder = new MediaRecorder(camera_stream, {mimeType: 'video/webm'});
    // let blobs = [];

    // media_recorder.addEventListener('dataavailable', (e) => {
    //     blobs.push(e.data)
    //     console.log(e.data)
    // })

    // media_recorder.start(1000)

})