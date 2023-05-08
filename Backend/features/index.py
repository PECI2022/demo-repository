import cv2
import mediapipe as mp

def merge_options(arr1, arr2):
    for opts in arr2:
        if opts in arr1:
            arr1[opts] = arr2[opts]

def mediapipe_hand(videoPath, **user_options):
    options = {'static_image_mode':True,'max_num_hands':2,'min_detection_confidence':0.5}
    options = merge_options(options, user_options)

    mp_hands = mp.solutions.hands

    results = [] # vertices and edges

    with mp_hands.Hands(options) as hands:
        cap = cv2.VideoCapture(videoPath)

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            result = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            landmarks = result.multi_hand_landmarks[0].landmark
            results.append({
                'vertices': [{'x':i.x, 'y': i.y, 'z': i.z} for i in landmarks],
                'edges': [[0,1],[1,2],[2,3],[3,4],[0,5],[0,17],[5,6],[5,9],[6,7],[7,8],[9,10],[9,13],[10,11],[11,12],[13,14],[13,17],[14,15],[15,16],[17,18],[18,19],[19,20]]
            })
    
    return results

def mediapipe_facedetection(videoPath, **user_options):
    options = {'model_selection':1, 'min_detection_confidence':0.5}
    merge_options(options, user_options)

    mp_face_detection = mp.solutions.face_detection

    results = [] # vertices and edges

    with mp_face_detection.FaceDetection(**options) as face_detection:
        cap = cv2.VideoCapture(videoPath)

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            result = face_detection.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            vertices = []
            edges = []
            for face in result.detections:
                i = len(vertices)
                box = face.location_data.relative_bounding_box
                vertices.append({'x': box.xmin, 'y': box.ymin})
                vertices.append({'x': box.xmin+box.width, 'y': box.ymin})
                vertices.append({'x': box.xmin, 'y': box.ymin+box.height})
                vertices.append({'x': box.xmin+box.width, 'y': box.ymin+box.height})
                edges += [[i,i+1],[i,i+2],[i+1,i+3],[i+2,i+3]]
                vertices += [{'x':j.x, 'y':j.y} for j in face.location_data.relative_keypoints]

            # location_data = result.detections[0].location_data
            # box_vertices = []
            # print(location_data)
            results.append({
                'vertices': vertices,
                'edges': edges
            })
    
    return results



def mediapipe_facemesh(videoPath, **user_options):
    options = {'static_image_mode':True,'max_num_faces':1,'refine_landmarks':True,'min_detection_confidence':0.5}
    merge_options(options, user_options)

    mp_facemesh = mp.solutions.face_mesh

    results = [] # vertices and edges

    with mp_facemesh.FaceMesh(**options) as face_mesh:
        cap = cv2.VideoCapture(videoPath)

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            result = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

            vertices = []
            for face in result.multi_face_landmarks:
                # print(len(list(face.landmark)))
                vertices += [{'x': i.x, 'y': i.y, 'z': i.z} for i in face.landmark]

            results.append({
                'vertices': vertices,
                'edges': []
            })
    
    return results


if __name__ == '__main__':
    # hand = mediapipe_hand(videoPath="./yeye.webm")

    # facedetection = mediapipe_facedetection(videoPath="./yeye.webm")

    facemesh = mediapipe_facemesh(videoPath='./yeye.webm')

    print(facemesh)