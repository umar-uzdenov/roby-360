
const NS = 'http://www.w3.org/2000/svg'

const modes = {
    addVideo: "add-video",
    moveVideo: "move-video",
    addPoint: "add-point",
    movePoint: "move-point",
}

let mode = modes.addVideo
let mouseDown = false
let shiftDown = 0

const svg = document.querySelector("svg")

// set mode change listeners
Object.entries(modes).forEach(([_, value]) => {
    query(`#${value}`).addEventListener("click", () => {
        Object.entries(modes).forEach(([_, value]) => {
            query(`#${value}`).classList.remove("current-video")
        })
        query(`#${value}`).classList.add("current-video")
        mode = value
    })
})

const videoCollection = new VideoCollection(svg, query("#count"), query("ul"))

svg.parentNode.addEventListener("mousedown", event => {
    const x = event.pageX - event.currentTarget.offsetLeft; 
    const y = event.pageY - event.currentTarget.offsetTop;
    // return console.log({x, y})
    mouseDown = true

    if (mode === modes.addVideo) {
        let videoArrow = new VideoArrow(x, y)
        videoCollection.add(videoArrow)
    
        // svg.appendChild(videoArrow.polyline)
    } else if (mode === modes.moveVideo) {
        videoCollection.select(x, y, shiftDown)
    } else if (mode === modes.addPoint) {
        const point = videoCollection.findClosestVideo({ x, y })
        if (point) {
            svg.appendChild(point.circle)
        }
    } else if (mode === modes.movePoint) {
        const point = videoCollection.selectPoint(x, y)
        if (point) {
            console.log(point)
        }
    }
})

window.addEventListener("mouseup", () => {
    mouseDown = false
    if (mode === modes.addVideo) {
        videoCollection.adjustLastEnd()
    } else if (mode === modes.moveVideo) {
        videoCollection.unselect()
    } else if (mode === modes.movePoint) {
        videoCollection.unselectPoint()
    }
})

svg.parentNode.addEventListener("mousemove", event => {
    if (!mouseDown) return
    const x = event.pageX - event.currentTarget.offsetLeft; 
    const y = event.pageY - event.currentTarget.offsetTop;

    if (mode === modes.addVideo) {
        videoCollection.last().setEnd(x, y, shiftDown)
    } else if (mode === modes.moveVideo) {
        videoCollection.moveVideos(x, y, shiftDown)
    } else if (mode === modes.movePoint) {
        videoCollection.movePoint(x, y)
    }
})

window.addEventListener("keydown", event => {
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        if (shiftDown < 2) shiftDown += 1
    }
})

window.addEventListener("keyup", event => {
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        if (shiftDown > 0) shiftDown -= 1
    }
})


query("#save-map").addEventListener("click", () => {
    console.log("saving map")
    const map = {
        currentId: videoCollection.findFirst(), // Первое видео
        folder: "../video-mobile/", // Откуда брать видео, можно с CDN, mobile first
        folderDesktop: "../video-desktop/", // тяжёлые видео
        folderMobile: "../video-mobile/", // c;fnst dblt
        desktopSensitivity: 100, // Чувствительность мыши для компьютер
        mobileSensitivity: 100, // Чувствительность для мобильных
        current: null, // 
        videos: videoCollection.export()
    }

    const jsonString = JSON.stringify(map, null, 4)
    const jsonBlob = new Blob([jsonString], { type: "application/json" })
  
    html`
        <a href="${URL.createObjectURL(jsonBlob)}" download="video-map.json"></a>
    `.click()
})

query("#load-background").addEventListener("change", async event => {
    const imageUrl = URL.createObjectURL(event.target.files[0])
    const  { width, height } = await loadImage(imageUrl)

    query("main").style = `
        display: block;
        background: url(${imageUrl}) no-repeat center;
        background-size: contain;
        width: ${width}px;
        height: ${height}px;
    `

    query("main svg").setAttribute("viewBox", `0 0 ${width} ${height}`)
})

function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.src = url
    })
}

query("#load-map").addEventListener("change", event => {
    const url = URL.createObjectURL(event.target.files[0])

    removeAllChild("ul")
    removeAllChild(svg)

    fetch(url).then(response => response.json().then(videoMap => {
        videoCollection.loadFrom(videoMap)
    }))
})

function removeAllChild(element) {
    if (typeof element == "string") { element = query(element) }
    [...element.childNodes].forEach(child => parent.removeChild(child))
}