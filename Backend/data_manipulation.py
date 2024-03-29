import cv2
import numpy as np
import os
import subprocess
import math
from datetime import timedelta




def read_file(video_path):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print("Error: Unable to open video file.")
        return
    
    return cap

def get_contrast(info):
    cap = read_file(info)

    total_contrast = 0
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        contrast = np.std(gray_frame)

        total_contrast += contrast
        frame_count += 1

    cap.release()
    return total_contrast / frame_count

def get_brightness(info):
    cap = read_file(info)

    total_brightness = 0
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        average_brightness = cv2.mean(gray_frame)[0]
        total_brightness += average_brightness
        frame_count += 1
    
    cap.release()
    return total_brightness / frame_count


def compute_sharpness(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    sharpness = np.var(laplacian)
    return sharpness



def get_sharpness(info):
    cap = read_file(info)

    sharpness_scores = []

    while cap.isOpened():
        success, frame = cap.read()
        if success:
            sharpness_score = compute_sharpness(frame)
            sharpness_scores.append(sharpness_score)
        else:
            break

    cap.release()

    return np.mean(sharpness_scores)


def get_saturation(info):
    cap = read_file(info)

    total_saturation = 0
    frame_counter = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        
        if not ret:
            break
        
        hsv_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Calculate the average saturation of the frame
        avg_saturation = np.mean(hsv_frame[:, :, 1])
        
        # Accumulate the saturation value
        total_saturation += avg_saturation
        
        frame_counter += 1
    
    cap.release()
    
    return total_saturation / frame_counter


def get_hue(info):
    cap = read_file(info)
    total_hue = 0
    frame_counter = 0

    while cap.isOpened():
        ret, frame = cap.read()

        if not ret:
            break

        # Convert the frame from BGR to HSV color space
        hsv_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # Calculate the average hue of the frame
        average_hue = np.mean(hsv_frame[:, :, 0])

        total_hue += average_hue
        frame_counter += 1

    return total_hue / frame_counter

def average_characteristics_project(content):
    if len(content) == 0:
        return { "contrast": 0, "brightness": 0, "sharpness": 0, "saturation": 0, "hue": 0 }

    contrast = 0
    brightness = 0
    sharpness = 0
    saturation = 0
    hue = 0

    num_content = len(content)

    for c in content:
        contrast += c["Characteristics"]["contrast"]
        brightness += c["Characteristics"]["brightness"]
        sharpness += c["Characteristics"]["sharpness"]
        saturation += c["Characteristics"]["saturation"]
        hue += c["Characteristics"]["hue"]

    return { "contrast": int(contrast / num_content), "brightness": int(brightness / num_content), "sharpness": int(sharpness / num_content), "saturation": int(saturation / num_content), "hue": int(hue / num_content) }


def format_time(seconds):
    time = timedelta(seconds=seconds)
    return str(time)



def trimVideo(video_path, start_time, duration):
    start_time = format_time(start_time)
    duration = format_time(math.ceil(duration))

    input_file = video_path
    fixed_file = "fixed_file.webm"
    convert_file = "converted_file.webm"
    output_file = video_path

    subprocess.run(["ffmpeg","-y", "-i", input_file, "-c:v", "libvpx", "-c:a", "libvorbis", fixed_file],stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    subprocess.run(["ffmpeg","-y","-i", fixed_file,"-c:v", "libvpx-vp9",convert_file], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    subprocess.run(["ffmpeg","-y","-i", convert_file,"-c:v", "libvpx-vp9","-ss", start_time,"-t", duration,output_file], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    os.remove(fixed_file)
    os.remove(convert_file)

    print("TRIMMED")



# def getResolution(video):
#     command = ['ffprobe', '-v', 'error', '-select_streams', 'v:0',
#                '-show_entries', 'stream=width,height', '-of', 'csv=p=0', video]
#     output = subprocess.check_output(command).decode('utf-8').strip()
#     width, height = map(int, output.split(','))
#     return width, height


# def getDuration(video):
#     return float(subprocess.run(["ffprobe", "-i", video, "-show_entries", "format=duration", "-v", "quiet", "-of", "csv=p=0"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT).stdout)



# def separeteAudio(video):
#     subprocess.run(['ffmpeg', '-i', video, '-vn',
#                    '-acodec', 'mp3', video[:-4] + ".mp3"])