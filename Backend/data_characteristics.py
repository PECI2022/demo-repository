import cv2
import numpy as np
import subprocess
import json

def tomp4(video):
    new_video = video[:-5] + ".mp4"
    subprocess.run(["ffmpeg", "-i", video, "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-c:a", "copy", new_video])
    return new_video
    
def getVideoCharacteristics(video):
    # Load the video
    cap = cv2.VideoCapture(video)

    # Get the number of frames in the video
    num_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    fps = int(cap.get(cv2.CAP_PROP_FPS))

    avg_contrast = 0
    avg_brightness = 0
    # Loop through each frame in the video
    for i in range(num_frames):
        # Read the frame
        ret, frame = cap.read()
        if not ret:
            break
        
        # Calculate the mean brightness of the frame
        brightness = np.mean(frame)
        
        # Calculate the standard deviation of the brightness
        std_dev = np.std(frame)

        contrast = std_dev / brightness
        
        avg_brightness += brightness
        avg_contrast += contrast

    cap.release()
    return json.dumps({"brightness":int(avg_brightness / num_frames),"contrast":int((avg_contrast / num_frames)*100),"duration":round(num_frames / fps,2)})



def main():
    print(getVideoCharacteristics(tomp4("thumbs.webm")))


if __name__ == "__main__":
    main()

