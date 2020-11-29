from app import app
from flask import render_template, request, Response, Flask, flash, redirect, url_for, jsonify, send_from_directory
import json
from random import randrange 
import requests
import os
from werkzeug.utils import secure_filename
import base64
from io import BytesIO
from PIL import Image

import numpy as np
from datetime import date
import tensorflow as tf
import math
import sklearn
import os
import cv2
import sklearn.metrics
import dlib
import tensorflow
from flask_cors import cross_origin

import numpy as np

ALLOWED_EXTENSIONS = {'jpg', 'jpeg'}
APP_ROOT = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def mainPage():
    return render_template("index.html")

@app.route("/process", methods=['POST']) 
def process():
    data_url = request.values['imageBase64']
    # Decoding base64 string to bytes object
    img_bytes = base64.b64decode(data_url)
    img = Image.open(BytesIO(img_bytes))
    img  = np.array(img)
    result = pipeline(img)
    # Encoding image 
    concat = decodeForReturn(result[1])
    emotion = result[2]
    euclid = decodeForReturn(result[0])
    return jsonify(image = concat, emotion = emotion, euclid = euclid)

# def image_to_face_landmarks(image):
#     cv2.imwrite('test.jpg', image)
#     return

def decodeForReturn(arr):
    im = Image.fromarray(arr.astype("uint8"))
    #im.show()  uncomment to look at the image
    rawBytes = BytesIO()
    im.save(rawBytes, "JPEG")
    #  os.remove()
    rawBytes.seek(0)  # return to the start of the file
    return base64.b64encode(rawBytes.read()).decode("utf-8")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def rect_to_bb(rect):
    x=rect.left()
    y=rect.top()
    w=rect.right()  -x 
    h=rect.bottom() -y
    return (x,y,w,h)

def shape_to_numpy(shape,dtype='int'):
    coords = np.zeros((68,2) , dtype=dtype) 
    for i in range(0,68):
        coords[i] = (shape.part(i).x,shape.part(i).y)
        
    return coords

def align_face(image,dim,features):
    '''
    Align face image given features array in shape of 68,2
    '''
    top_nose  = features[28,:]
    left_eye  = features[37:41,:]
    right_eye = features[43:46,:]
    dx,dy     =  np.mean(right_eye,axis=0).astype('int') - np.mean(left_eye,axis=0).astype('int')
    angle     = np.degrees(np.arctan2(dy, dx))
    M         = cv2.getRotationMatrix2D((top_nose[0],top_nose[1]), angle, 1)
    return  cv2.warpAffine(image, M, dim,flags=cv2.INTER_CUBIC)

def image_to_crop_feature(image,dim=(28,28),detector=None,predictor=None):
    '''
    Input:  image
    Output: 
        1- cropped video numpy array (row,col,channel) , 
        2- facial features array (68,2,1)
    '''
    try:
        rects = detector(image)
    
        (x0,y0,w,h)= rect_to_bb(list(rects)[0])
    except :
        x0,y0,w,h=0,0,image.shape[1],image.shape[0]
    print('\n\n\n\n\n', image, '\n\n\n')

    crop  = cv2.resize(image[y0:y0+h,x0:x0+h], dim, interpolation = cv2.INTER_AREA)
    shape = predictor(crop,dlib.rectangle(left=0, top=0, right=dim[0], bottom=dim[1]))
    shape = shape_to_numpy(shape)
    crop  = align_face(crop,dim,shape)
    shape = predictor(crop,dlib.rectangle(left=0, top=0, right=dim[0], bottom=dim[1]))
    shape = shape_to_numpy(shape)    
    return  crop,shape.reshape(1,68,2,1)


def transform_emotion_to_integer(emotion):
    emotions ={'ang': 0, 'dis': 1, 'fea': 2, 'hap': 3, 'neu': 4, 'sad': 5, 'sur': 6}
#     emotions = ['hap','sur','fea','neu','sad','dis','ang']
    return emotions(emotion)

def transform_integer_to_emotion(integer):
    emotions = {0: 'ang', 1: 'dis', 2: 'fea', 3: 'hap', 4: 'neu', 5: 'sad', 6: 'sur'}
    return emotions[integer]


def create_euclid_matrix(array):
    '''
    Input : (frames,68,2,1) landmark tensor
    output : (frames,68,68,1) tensor of pairwise distance
    '''
    temp =np.zeros((1,array.shape[0],68,68,1))
    for fi in range(array.shape[0]):
        temp[0,fi,:,:,0] = sklearn.metrics.pairwise_distances(array[fi,:,:,0])
    return temp


def features_to_image(image,features):
    for (x,y) in features[0,:,:,0]:image = cv2.circle(image,(x,y),1,(255,255,255))
    return image


detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')
model =  tensorflow.keras.models.load_model("euc-model-29-11.h5",custom_objects={"LeakyReLU": tensorflow.keras.layers.LeakyReLU()})

def pipeline(image,detector=detector,predictor=predictor,model=model):
    '''
    input : image 
    output : emotion
    '''
    
    crop , features = image_to_crop_feature(image,dim=(68,68),detector=detector,predictor=predictor)
    


    
    euclid = create_euclid_matrix(features)
    # postToFirebase(euclid)

    
    predictions = model.predict(euclid[0]/255.0)
    emotion = transform_integer_to_emotion(np.argmax(predictions))
    return [cv2.hconcat([cv2.cvtColor(euclid[0,0,:,:,0:1].astype('uint8'), cv2.COLOR_GRAY2RGB)]), cv2.hconcat([cv2.cvtColor(euclid[0,0,:,:,0:1].astype('uint8'), cv2.COLOR_GRAY2RGB),features_to_image(crop, features)]), emotion]
