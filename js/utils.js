Object.defineProperty(Number.prototype, "int", {
    get() { return +this.toFixed(0)}
}) 

function query(selector) {
    return document.querySelector(selector)
}

function  queryAll(selector) {
    return [...document.querySelectorAll(selector)]
}

Node.prototype.query = function(selector) {
    return this.querySelector(selector)
}

Node.prototype.queryAll = function(selector) {
    return this.querySelectorAll(selector)
}

function iOS() {
    return [
        'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
};

function detectMobile() {
    return [
        /Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i
    ].some(toMatch => navigator.userAgent.match(toMatch))
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

let toastTimeout
function toast(text) {
    try {
        clearTimeout(toastTimeout)
        if (typeof text == "object") text = JSON.stringify(text, 0, 4)
        const parent = query("#toast")
        const child = parent.querySelector("div")
        child.textContent = text
        parent.classList.remove("invisible")
        toastTimeout = setTimeout(() => {
            parent.classList.add("invisible")
        }, 10000)
    } catch (error) {}
}


function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max))
}

let fullscreen = false
async function handleFullScreen() {
    const body = query("body")

    while (true) {
        try {
            if (fullscreen) {   
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                    await document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                    await document.msExitFullscreen();
                }
            } else {
                if (body.requestFullscreen) {
                    await body.requestFullscreen();
                } else if (body.webkitRequestFullscreen) { /* Safari */
                    await body.webkitRequestFullscreen();
                } else if (body.msRequestFullscreen) { /* IE11 */
                    await body.msRequestFullscreen();
                }
            }
            fullscreen = !fullscreen
            console.log(fullscreen)
            break
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 60))
        }
    }
}

function getAreaOf(selector) {
    return function(x, y) {
        // const element = query(selector)

        // const top = element.offsetTop
        // const left = element.offsetLeft
        // const width = element.offsetWidth
        // const height = element.offsetHeight

        // return x >= left && x <= left + width && y >= top && y <= top + height


        // for round buttons
        const element = query(selector)
        const rect = element.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2  // x coordinate of center of circle
        const centerY = rect.top + rect.height / 2 // y coordinate of center of circle
        const radius = rect.width / 2;  // radius of circle is half the width of the element

        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)  // calculate distance between center and click
        return distance <= radius // coordinates are within the area of the circle
    }
}

function radiansTo360(radians) {
    if (radians < 0)
        radians = radians + Math.PI * 2
    return Math.floor(radians / Math.PI * 180)
}

function displayAngle(angle) {
    try {
        query("#angle").textContent = `Angle: ${angle}`
    } catch (error) {}
}

function toggleVideoIsLoading(videoIsLoading) {
    try {
        if (videoIsLoading) {
            query("#video-is-loading").classList.remove("invisible")
        } else {
            query("#video-is-loading").classList.add("invisible")
        }
    } catch (error) {}
}

function writeVideoProgress(progress) {
    const percentage = Math.floor(progress.loaded * 100 / progress.total)
    query(".percentage").textContent = percentage + "%"
    query(".on-load-percentage").textContent = `Loading ${percentage}%`
}

function safeCall(fun, log = false) {
    try { fun() } catch (error) { if (log) console.error(error) }
}

function parseNumber(value) {
    return parseFloat(value.toFixed(2))
}

function html(segments, ...args) {
    const string = segments.reduce((acc, segment, i) =>  acc + segment + (args[i] || ''), '')
    const element = new DOMParser().parseFromString(string, "text/html").querySelector("body").childNodes[0]

    safeCall(() => {
        document.head.appendChild(element) // activate element
        document.head.removeChild(element) // deattach it
    })

    return element
}

function css(segments, ...args) {
    return segments.reduce((acc, segment, i) =>  acc + segment + (args[i] || ''), '')
}

function trim(segments, ...args) {
    const lines = segments
        .reduce((acc, segment, i) =>  acc + segment + (args[i] || ''), '') // get raw string
        .trimEnd().split('\n') // Split the raw string into lines
        .filter(line => line != "") // remove empty lines

    // Find the minimum number of leading spaces across all lines
    const minLeadingSpaces = lines.reduce((acc, line) => {
        // Find the number of leading spaces for this line
        const leadingSpaces = line.match(/^ */)[0].length
        // if it has less leading spaces than the previous minimum, set it as the new minimum
        return leadingSpaces < acc ? leadingSpaces :  acc
    }, Infinity)

    // Trim lines, join them and return the result
    return lines.map(line => line.substring(minLeadingSpaces)).join('\n')
}