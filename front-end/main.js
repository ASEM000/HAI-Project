import db from "./imageDb.js"
const { el, setChildren, mount } = redom

var current = 0;
var gameEntries = [];
function getRndInteger(max) {
    return Math.floor(Math.random() * (max))
}

const startButton = () => {
    const button = el("a.button", {innerText: "Start game!", onclick: () => gameInit()})
    setChildren(document.getElementById("root"), button)
}

function getScreenshot(videoEl, emotion, scale) {
    scale = scale || 1;

    const canvas = document.createElement("canvas");
    canvas.width = videoEl.clientWidth * scale;
    canvas.height = videoEl.clientHeight * scale;
    canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    window.localStorage.setItem(emotion, canvas.toDataURL())
    const image = new Image()
    image.src = canvas.toDataURL();
    return image;
}
  

const gameInit = () => {
    const main = el (".gameBody mx-auto");
    const score = el(".btn-group mx-auto", { role: "group", ariaLabel: "Score" })
    const reference = ["fear", "happy", "angry", "surprised", "neutral", "disappointed", "sad"]

    // Score
    var randomIdx = getRndInteger(7)
    mount(score, el("button.btn btn-light", { id: reference[randomIdx], innerText: "?", style: { fontWeight: 700, fontSize: "2rem" } }))
    gameEntries.push(reference[randomIdx])
    reference.splice(randomIdx, 1)

    var i = 6
    while (reference.length != 0) {
        randomIdx = getRndInteger(i)
        console.log(randomIdx, reference)
        mount(score, el("button.btn btn-light disabled", { id: reference[randomIdx], innerText: "?", style: { fontWeight: 700, fontSize: "2rem" } }))
        gameEntries.push(reference[randomIdx])
        reference.splice(randomIdx, 1)
        i -= 1
    }   



    // Camera stream
    const feed = el("video.mx-auto", {id: "videoElement", autoplay: "true"})
    const cameraFeed = el(".row", feed)
    setChildren(document.getElementById("root"), cameraFeed)    
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(function (stream) {
            feed.srcObject = stream;
          })
          .catch(function (error) {
            console.log("Something went wrong!");
        });
    }

    mount(main, cameraFeed)
    mount(main, el("button.btn btn-primary", { innerText: "Capture", type: "button", "data-toggle": "modal", "data-target": "#basicExampleModal",
    onclick: () => {
        let picture = getScreenshot(feed, gameEntries[current])
        picture.classList = "w100"
        console.log(gameEntries, current)
        setChildren(document.getElementById("popupImage"), picture)
    } }))
    mount(main, el(".btn-toolbar mb-4", {role: "toolbar"}, score))




    setChildren(document.getElementById("root"), main)
    
}




startButton()