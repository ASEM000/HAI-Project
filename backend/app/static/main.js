import db from "/static/imageDb.js"
const { el, setChildren, mount } = redom

const firebaseConfig = {
    apiKey: "AIzaSyC2LL2r1LxcbhWVGis47j_k0JlxFFuVILM",
    authDomain: "human-ai-bbbe4.firebaseapp.com",
    databaseURL: "https://human-ai-bbbe4.firebaseio.com",
    projectId: "human-ai-bbbe4",
    storageBucket: "human-ai-bbbe4.appspot.com",
    messagingSenderId: "1011248673596",
    appId: "1:1011248673596:web:5bec24c395f1c86fcee439"
};

firebase.initializeApp(firebaseConfig);
const fireDatabase = firebase.firestore();

window.firebase = firebase

function createId(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
  
const uploadImage = response => {
    const dataId = createId(8)
    const link = response.emotion + '/' + dataId
    var ref = firebase.storage().ref(link)
    var message = `data:image/png;base64,${response.euclid}`;
    ref.putString(message, 'data_url').then(function(snapshot) {
        console.log('Uploaded a data_url string!');
    });
    return dataId
}

var current = 0;
var finalScore = 0;
var gameEntries = [];
const EMOTION_REFERENCE = {fear: "fea", happy: "hap", sad: "sad", disgusted: "dis", neutral: "neu", surprised: "sur", angry: "ang"}
const EMOTION_REFERENCE_REVERSE = {fea: "fear", hap: "happy", sad: "sad", dis: "disgusted", neu: "neutral", sur: "surprised", ang: "angry"}

function getRndInteger(max) {
    return Math.floor(Math.random() * (max))
}

const startButton = () => {
    const button = el("a.button", {innerText: "Start game!", onclick: () => gameInit()})
    setChildren(document.getElementById("root"), button)
}

function getScreenshot(videoEl, emotion, scale) {
    document.getElementById("again").textContent = "Take again"
    document.getElementById("submitBtn").disabled = false
    scale = scale || 1;

    const canvas = document.createElement("canvas");
    canvas.width = videoEl.clientWidth * scale;
    canvas.height = videoEl.clientHeight * scale;
    canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const image = new Image()
    const dataURL = canvas.toDataURL('image/jpeg', 1.0).replace('data:image/jpeg;base64,' ,'');
    localStorage.setItem(current, dataURL)
    image.src = canvas.toDataURL();
    return image;
}

const initTimer = () => {
    // Set the date we're counting down to
    var timer = el(".timer")
    setChildren(document.getElementById("timer"), timer)
    var countDownDate = new Date().getTime() + 92000;

    // Update the count down every 1 second
    var x = setInterval(function() {

    // Get today's date and time
    var now = new Date().getTime();
    // Find the distance between now and the count down date
    var distance = countDownDate - now;
        
    // Time calculations for days, hours, minutes and seconds
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    if (minutes < 10){
        minutes = "0" + minutes
    }
    if (seconds < 10) {
        seconds = "0" + seconds
    }
    // Output the result in an element with id="demo"
    timer.innerHTML = minutes + ":" + seconds + " remaining";
        
    // If the count down is over, write some text 
    if (distance < 0 || current == 7) {
        clearInterval(x);
        timer.innerHTML = `Game over</br>Final score: ${finalScore}`;
        gameOver()
    }
    }, 1000);
}
const gameInit = () => {
    document.getElementById("restart").hidden = false
    current = 0;
    finalScore = 0;
    gameEntries = [];
    const main = el (".gameBody mx-auto");
    const score = el(".btn-group mx-auto", { role: "group", ariaLabel: "Score" })
    const reference = ["fear", "happy", "angry", "surprised", "neutral", "disgusted", "sad"]

    // Score
    var randomIdx = getRndInteger(7)
    mount(score, el("button.btn btn-light", { type: "button", "data-toggle": "modal", "data-target": "#basicExampleModal1", id: reference[randomIdx], innerText: "?", style: { fontWeight: 700, fontSize: "2rem" } }))
    gameEntries.push(reference[randomIdx])
    reference.splice(randomIdx, 1)

    var i = 6
    while (reference.length != 0) {
        randomIdx = getRndInteger(i)
        mount(score, el("button.btn btn-light disabled", { type: "button", "data-toggle": "modal", "data-target": "#basicExampleModal1", id: reference[randomIdx], innerText: "?", style: { fontWeight: 700, fontSize: "2rem" } }))
        gameEntries.push(reference[randomIdx])
        reference.splice(randomIdx, 1)
        i -= 1
    }   



    // Camera stream
    const videoStream = el("video.mx-auto row", {id: "videoElement", autoplay: "true"})
    const feed = el(".col-6", videoStream, 
    el(".row",el("button.btn btn-primary mx-auto", { style: {color: "white"}, innerText: "Capture", type: "button", "data-toggle": "modal", "data-target": "#basicExampleModal", id: "capture",
    onclick: () => {
        let picture = getScreenshot(videoStream, gameEntries[current])
        picture.classList = "w100"
        setChildren(document.getElementById("popupImage"), picture)
    } })
    ))
    const cameraFeed = el(".row", el(".col-6", {id: "trigger"}), feed)
    setChildren(document.getElementById("root"), cameraFeed)    
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(function (stream) {
            videoStream.srcObject = stream;
          })
          .catch(function (error) {
            console.log("Something went wrong!");
        });
    }

    mount(main, cameraFeed)
    mount(main, el(".btn-toolbar mb-4", {role: "toolbar"}, score))




    setChildren(document.getElementById("root"), main)
    initImage()
    initTimer()

}

window.gameInit = gameInit

const initImage = () => {  
    console.log(db, gameEntries, current, db[gameEntries[current]])
    setChildren(document.getElementById("trigger"), el("", {style: {backgroundImage: `url("${db[gameEntries[current]][0]}")`, width: '100%', height: "100%", backgroundSize: "cover"}}))
}

const submit = async () => {
    const dataURL = localStorage.getItem(current)
    const emotion =  await $.ajax({
        type: "POST",
        url: "http://emoti-hai.herokuapp.com/process",
        data: { 
            imageBase64: dataURL
        }
      })
    console.log(emotion)

    let picture = el(".row mt-4", el(".col-6", {innerHTML: "Image Stored"}),el(".col-6 taright", {innerHTML: "Landmarks Extracted"}), el("img.w100 mt-1", { src: `data:image/png;base64,${emotion.image}` }))
    
    mount(document.getElementById("popupImage"), picture)
    document.getElementById("again").textContent = "Next"
    document.getElementById("submitBtn").disabled = true

    changeScore(emotion)
    return emotion
}

const gameOver = () => {
    document.getElementById("capture").disabled = true
    console.log("game over")
}

const changeScore = emotion => {
    const cur = document.getElementById(gameEntries[current])
    if (emotion.emotion == EMOTION_REFERENCE[gameEntries[current]]) {
        console.log(EMOTION_REFERENCE[gameEntries[current]], emotion.emotion )
        cur.innerHTML = `<i class="fas fa-check"></i>`
        cur.classList = "btn btn-success"
        finalScore +=1 
    }
    else{
        cur.innerHTML = `<i class="fas fa-times"></i>`
        cur.classList = "btn btn-danger"}

    const firebaseUrl = uploadImage(emotion)
    let expected = el(".row mt-4", el("img.w100 mt-1", { src: `data:image/png;base64,${localStorage.getItem(current)}` }))
    console.log(EMOTION_REFERENCE_REVERSE[emotion.emotion])
    cur.onclick = () =>{
        setChildren(document.getElementById("detailImage"), expected, el(".row mt-4", {innerHTML: `Are you expressing ${EMOTION_REFERENCE_REVERSE[emotion.emotion]} emotion in this photo? If not, then which one is it (type in the box below)?`}))
    }
    document.getElementById("report").onclick = () => {
        const formValue = document.getElementById("reportForm").value
        if (!formValue) return alert("Please enter the emotion you are expressing!")
        var oldref = firebase.storage().ref(emotion.emotion + '/' + firebaseUrl)
        oldref.delete().then(function() {
            console.log("Deleted old record")
          }).catch(function(error) {
            console.log(error)
          });
        var newRef = firebase.storage().ref(EMOTION_REFERENCE[formValue].substr(0,3) + '/' + createId(8))
        var message = `data:image/png;base64,${emotion.euclid}`;
        newRef.putString(message, 'data_url').then(function(snapshot) {
            console.log('Uploaded a data_url string!');
        });
        alert("Reported!")
    }
    if (current == 6){
        current += 1
        return gameOver()
    }
    current +=1;
    initImage()
}


startButton()
document.getElementById("submitBtn").onclick = () => submit()
document.getElementById("restart").onclick = () => gameInit()