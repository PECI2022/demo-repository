import cv2
import numpy as np
import subprocess
import json
import os
import math


def getFileExtension(filname):
    return os.path.splitext(filname)[1]


def tomp4(video):
    video_formats = [".mpeg", ".mpg", ".mpe", ".avi",
                     ".wmv", ".flv", ".mov", ".webm", ".mkv"]
    if getFileExtension(video) in video_formats:
        print("Converting to mp4...")
        new_video = video[:-len(getFileExtension(video))] + ".mp4"
        subprocess.run(["ffmpeg", "-i", video, "-c:v", "libx264",
                       "-preset", "slow", "-crf", "22", "-c:a", "copy", new_video])
        return new_video


def getContrast(video):
    cap = cv2.VideoCapture(video)
    rms_contrast = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert the frame to grayscale
        frame_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Calculate the RMS contrast of the frame
        rms_contrast.append(frame_gray.std())

    cap.release()
    return np.mean(rms_contrast)

# Na dúvida


def getBrightness(video):
    cap = cv2.VideoCapture(video)
    avg_brightness = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Calculate the mean brightness of the frame
        brightness = cv2.mean(frame)[0]
        avg_brightness.append(brightness)

    cap.release()
    return sum(avg_brightness) / len(avg_brightness)


def getResolution(video):
    command = ['ffprobe', '-v', 'error', '-select_streams', 'v:0',
               '-show_entries', 'stream=width,height', '-of', 'csv=p=0', video]
    output = subprocess.check_output(command).decode('utf-8').strip()
    width, height = map(int, output.split(','))
    return width, height


def getDuration(video):
    return float(subprocess.run(["ffprobe", "-i", video, "-show_entries", "format=duration", "-v", "quiet", "-of", "csv=p=0"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT).stdout)


def getImageSharpness(img):
    d_im = cv2.UMat(img)
    d_lap = cv2.Laplacian(d_im, cv2.CV_32F)
    h_lap = d_lap.get()
    var = h_lap.var()
    return var


def getSharpness(video_path):
    cap = cv2.VideoCapture(video_path)
    sharpness = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        sharpness.append(getImageSharpness(gray))
    cap.release()
    return np.mean(sharpness)


def getSaturation(video):
    cap = cv2.VideoCapture(video)
    avg_saturation = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert the frame to HSV color space
        frame_hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # Extract the saturation channel from the HSV image
        s_channel = cv2.split(frame_hsv)[1]

        # Calculate the average saturation of the frame
        avg_saturation.append(np.mean(s_channel))

    cap.release()
    return np.mean(avg_saturation)


def getHue(video):
    cap = cv2.VideoCapture(video)
    hue_values = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert the frame to HSV
        frame_hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # Extract the hue channel
        hue = frame_hsv[:, :, 0]

        # Compute the average hue of the frame
        hue_values.append(np.mean(hue))

    cap.release()
    return np.mean(hue_values)


def separeteAudio(video):
    subprocess.run(['ffmpeg', '-i', video, '-vn',
                   '-acodec', 'mp3', video[:-4] + ".mp3"])


def getVideoCharacteristics(video):
    # if getFileExtension(video) != ".mp4":
    #     return getVideoCharacteristics(tomp4(video))       # send to mp4 to be uniform
    # else:
    contrast = float(getContrast(video))
    brightness = float(getBrightness(video))
    sharpness = float(getSharpness(video))
    saturation = float(getSaturation(video))
    hue = float(getHue(video))
    resolution = list(getResolution(video))
    duration = float(getDuration(video))

    video_chars = {
        "contrast": contrast,
        "brightness": brightness,
        "sharpness": sharpness,
        "saturation": saturation,
        "hue": hue,
        "resolution": resolution,
        "duration": duration
    }
    return json.dumps(video_chars)


def main():
    file = "./asdf.webm"
    # print(getFileExtension(file))
    # print(tomp4(file))
    # print("Contrast", getContrast(tomp4(file)))
    # print("Brightness", getBrightness(tomp4(file)))
    # print(getVideoCharacteristics(tomp4(file)))
    # print(getResolution(tomp4(file)))
    # print(getDuration(tomp4(file)))
    # print(getSharpness(tomp4(file)))
    # print(getSaturation(tomp4(file)))
    # print(getHue(tomp4(file)))
    print(getVideoCharacteristics(file))


if __name__ == "__main__":
    main()
