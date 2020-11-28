
import numpy as np
from datetime import date
import tensorflow as tf
import math
import sklearn
import os
import cv2
import matplotlib.pyplot as plt
import sklearn.metrics
from tqdm.notebook import tqdm
from tensorflow.keras.preprocessing.image import ImageDataGenerator 
import dlib

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
