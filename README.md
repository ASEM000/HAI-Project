# EMOTI

### PROTOTYPE VIDEO
[![IMAGE ALT TEXT HERE](http://img.youtube.com/vi/FbK_AANGz44/0.jpg)](http://www.youtube.com/watch?v=FbK_AANGz44)

------
<img src="https://i.imgur.com/aAyA0UC.png" width=50% >


## Instructions for downloading the trained machine learning models
#### Download the model from https://drive.google.com/file/d/1GPCzXgoVhs3Rl10_X8TtdgPkwznHg298/view?usp=sharing and move it to `backend` folder
#### Download the dlib model from https://drive.google.com/file/d/1Hj1NK954woxx8IEhvrZjTKDwX9F0kpim/view?usp=sharing and move it to `backend` folder


### Instruction for compiling dlib for linux
`https://www.learnopencv.com/install-dlib-on-ubuntu/`


### Instruction for compiling dlib for mac
`https://www.learnopencv.com/install-dlib-on-macos/`

### Instruction for compiling dlib for windows
`https://www.learnopencv.com/install-dlib-on-windows/`

### Setting up
To begin with, clone the repo: `git clone https://github.com/ASEM000/HAI-Project.git`
After cloning, change the directory to the backend folder:`cd HAI-Project/backend`
Create a python environment `python3 -m venv <name of environment>`
Activate the environment:
- On Windows(cmd): `<name of environment>\Scripts\activate.bat`
- On MacOS/Unix: `source <name of environment>/bin/activate`

Install all the libraries: `pip install -r requirements.txt`
Set flask application to run.py:
- On Windows(cmd): `set FLASK_APP=run.py`
- On MacOS/Unix: `export FLASK_APP=run.py`

### Running
Start the application: `flask run`

Once the application starts, it will be accessible through the default ip(unless reconfigured): `http://127.0.0.1:5000`. However it should be opened from `http://localhost:5000` (CORS). If you want the application to work on a different address hoever, apart from modyfing flask configuration, you need to replace `http://localhost:5000/process` with `http://<desired address>/process` in main.js in static folder (`cd app/static`)


