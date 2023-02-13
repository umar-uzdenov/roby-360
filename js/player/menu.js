function launchMenu() {
    const menuButton = query("#menu-button")

    const menuList = query("#menu-list")
    const speedButton = query("#speed-button")
    const map3dButton = query("#map-3d-button")
    const mapButton = query("#map-button")
    const fullscreenButton = query("#fullscreen-button")

    const speedList = query("#speed-list")
    const speedFastest = query("#speed-fastest")
    const speedFast = query("#speed-fast")
    const speedNormal = query("#speed-normal")
    const speedSlow = query("#speed-slow")
    const speedButtons = [speedFastest, speedFast, speedNormal, speedSlow]

    const map3d = query("#map-3d")
    const map3dCloseButton = query("#map-3d-close-button")

    let menuState = false

    window.hideMenu = function hideMenu() {
        menuButton.classList.remove("open")
        menuList.classList.add("close")
        speedList.classList.add("close")
        menuState = false
    }

    window.openMenu = function openMenu() {
        menuButton.classList.add("open")
        menuList.classList.remove("close")
        menuState = true
    }

    menuButton.addEventListener("click", async () => {
        console.log(menuState)

        if (menuState == false) {
            if (closeFullMap()) await sleep(300)
            return openMenu()
        }
        
        if (menuState == true) {
            return hideMenu()
        }
    })

    speedButton.addEventListener("click", event => {
        menuList.classList.add("close")
        speedList.classList.remove("close")
    })

    speedFastest.addEventListener("click", () => setSpeed(speedFastest, 2))
    speedFast.addEventListener("click", () => setSpeed(speedFast, 1.5))
    speedNormal.addEventListener("click", () => setSpeed(speedNormal, 1))
    speedSlow.addEventListener("click", () => setSpeed(speedSlow, 2))

    function setSpeed(target, speed) {
        speedButtons.forEach(button => button.classList.remove("current"))
        target.classList.add("current")
        setPlaybackRate(speed)
        hideMenu()
        if (!detectMobile()) openMenu()
    }

    map3dButton.addEventListener("click", () => {
        if (detectMobile()) hideMenu()
        open3dMap()
    })

    mapButton.addEventListener("click", () => {
        hideMenu()
        openFullMap()
    })

    fullscreenButton.addEventListener("click", () => {
        if (detectMobile()) hideMenu()
        handleFullScreen()
    })

    map3dCloseButton.addEventListener("click", () => {
        // map3d.removeChild(map3d.query("canvas"))
        map3d.classList.add("invisible")
    })
}