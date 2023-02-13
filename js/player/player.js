function player3D(videoMap) {
    videoMap.current = videoMap.videos.find(video => video.id == videoMap.currentId)
    let dragging = false

    if (detectMobile()) {
        // toast("is mobile")
        videoMap.folder = videoMap.folderMobile
    } else {
        // toast("is desktop")
        videoMap.folder = videoMap.folderDesktop
    }

    const mobileSensitivity = 700 / 100 * videoMap.mobileSensitivity
    const desktopSensitivity = 314 / 100 * videoMap.desktopSensitivity

    let upKeyDown = false
    let downKeyDown = false
    let upKeyProcess = false
    let downKeyProcess = false

    const upButtonCheck = getAreaOf("#arrow-button-up")
    const downButtonCheck = getAreaOf("#arrow-button-down")
    // const fullscreenButtonCheck = getAreaOf("#fullscreen")

    if (iOS()) {
        query(".ios").classList.remove("invisible")
        // query("#fullscreen").classList.add("invisible")
    } else {
        query(".non-ios").classList.remove("invisible")
    }

    let resizeTimeout
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(onResize, 60);
    })

    const width = window.innerWidth
    const height = window.innerHeight

    // create a perspective camera
    // https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 100);
    Angle.setCamera(camera)
    Angle.setVideoMap(videoMap)

    const video = createVideo(videoMap, camera, totalVideoPause)

    // create a video element and set attributes

    renderer = createRenderer(camera, video.videoElement, width, height)

    query("#transparent").addEventListener('mousedown', event => {
        if (instructionsIsOnDisplay) return
        if (event.button === 0) dragging = true;
    });

    query("#transparent").addEventListener('click', ({ pageX, pageY }) => {
        if (instructionsIsOnDisplay) return
        // if (fullscreenButtonCheck(pageX, pageY)) handleFullScreen()
    });

    window.addEventListener('mouseup', ({ button }) => {
        if (instructionsIsOnDisplay) return
        if (button === 0) dragging = false;
    });

    window.addEventListener("keydown", async (event) => {
        if (instructionsIsOnDisplay) return
        keyDown(event.code)
        // setTimeout(() => keyDown(event.code), 0)
    })

    function keyDown(code) {
        // console.log(code)
        if (code == "ArrowUp" || code == "KeyW") {
            upKeyDown = true
            if (Angle.isLookingFront()) {
                video.playForward()
            } else {
                video.playBackwards()
            }
        } else if (code == "ArrowDown" || code == "KeyS") {
            downKeyDown = true
            if (Angle.isLookingFront()) {
                video.playBackwards()
            } else {
                video.playForward()
            }
        } else if (code == "KeyF") {
            handleFullScreen()
        } else if (code == "KeyQ") {
            console.log({
                x: +camera.rotation.x.toFixed(7),
                y: +camera.rotation.y.toFixed(7),
                // z: +camera.rotation.z.toFixed(7),
            })
        }
    }

    window.addEventListener("keyup", async (event) => {
        if (instructionsIsOnDisplay) return
        if (["ArrowUp", "KeyW", "ArrowDown", "KeyS"].indexOf(event.code) != -1) {
            totalVideoPause()
        }
    })

    const state = {
        coordinates: [],
        buttons: [],
    }

    query("#transparent").addEventListener("touchmove", event => {
        if (instructionsIsOnDisplay) return
        event.preventDefault()

        if (event.touches.length > 3) {
            totalVideoPause()
            return toast("Please don't touch more than 3 fingers")
        }

        const previousState = structuredClone(state)
        getTouchpositions(event.touches)

        if (state.buttons.length > 1) {
            totalVideoPause()
            return toast("Please press one button at a time")
        }
        if (state.buttons.length == 0) {
            totalVideoPause()
        }

        if (state.coordinates.length == 1 && previousState.coordinates.length == 1) {
            const moveX = previousState.coordinates[0].pageX - state.coordinates[0].pageX
            const moveY = previousState.coordinates[0].pageY - state.coordinates[0].pageY

            Angle.rotateRadians(moveX / mobileSensitivity)

            if (canRotateX(moveY))
                camera.rotateX(-moveY / mobileSensitivity)
        }

        if (state.coordinates.length == 2 && previousState.coordinates.length == 2) {
            const distance = Math.hypot(
                state.coordinates[0].pageX - state.coordinates[1].pageX,
                state.coordinates[0].pageY - state.coordinates[1].pageY)
            
            const previosDistance = Math.hypot(
                previousState.coordinates[0].pageX - previousState.coordinates[1].pageX,
                previousState.coordinates[0].pageY - previousState.coordinates[1].pageY)

            camera.fov = clamp(camera.fov + (previosDistance - distance) / 10, 10, 120);
            // need to call this function after changing most of properties in PerspectiveCamera
            camera.updateProjectionMatrix();
        }

        function canRotateX(moveY) {
            if (moveY < 0 && camera.rotation.x + 0.01 - moveY / mobileSensitivity > Math.PI / 2)
                return false
            if (moveY > 0 && camera.rotation.x - 0.01 - moveY / mobileSensitivity < -Math.PI / 2)
                return false
            return true
        }
    })

    query("#transparent").addEventListener("touchstart", async (event) => {
        if (instructionsIsOnDisplay) return
        event.preventDefault()
        
        if (event.touches.length > 3) {
            totalVideoPause()
            return toast("Please don't touch more than 3 fingers")
        }

        getTouchpositions(event.touches)

        if (state.buttons.length > 1) {
            totalVideoPause()
            return toast("Please press one button at a time")
        }

        if (state.buttons.length == 1) {
            fireButtonEvent(state.buttons[0].button)
        }
    })

    query("#transparent").addEventListener("touchend", event => {
        if (instructionsIsOnDisplay) return
        event.preventDefault()

        getTouchpositions(event.touches)

        if (state.buttons.length == 0) {
            totalVideoPause()
        }

        if (event.touches.length > 2) return 
    })



    function getTouchpositions(touches = []) {
        state.coordinates = []
        state.buttons = []
        
        for (const [index, touch] of [...touches].entries()) {
            if (upButtonCheck(touch.pageX, touch.pageY)) {
                state.buttons.push({ index, button: "up" })
            } else if (downButtonCheck(touch.pageX, touch.pageY)) {
                state.buttons.push({ index, button: "down" })
            // } else if (fullscreenButtonCheck(touch.pageX, touch.pageY)) {
            //     state.buttons.push({ index, button: "fullscreen" })
            } else {
                state.coordinates.push({ index, pageX: touch.pageX, pageY: touch.pageY })
            }
        }
    }

    function fireButtonEvent(button) {
        if (button == "up") {
            query("#arrow-button-up").classList.add("arrow-up-pressed")
            upKeyPress()
        } else if (button == "down") {
            query("#arrow-button-down").classList.add("arrow-down-pressed")
            downKeyPress()
        } else if (button == "fullscreen") {
            handleFullScreen()
        }
    }

    async function upKeyPress() {
        if (upKeyProcess) return

        upKeyProcess = true
        upKeyDown = true
        while (upKeyDown) {
            keyDown("ArrowUp")
            await sleep(60)
        }
    }

    async function downKeyPress() {
        if (downKeyProcess) return

        downKeyProcess = true
        downKeyDown = true
        while (downKeyDown) {
            keyDown("ArrowDown")
            await sleep(60)
        }
    }

    // setInterval(() => { // proper pause watcher
    //     if (detectMobile()) {
    //         if (!upKeyDown && !upKeyProcess && !downKeyDown && !downKeyProcess) {
    //             // console.log("pause")
    //             totalVideoPause()
    //         }
    //     } else {
    //         if (!upKeyDown && !downKeyDown) {
    //             // console.log("pause")
    //             totalVideoPause()
    //         }
    //     }
    // }, 100)

    function totalVideoPause() {
        // let counter = 3
        // const interval =setInterval(() => {
        // setTimeout(() => {
            upKeyDown = false
            upKeyProcess = false
            downKeyDown = false
            downKeyProcess = false
            query("#arrow-button-up").classList.remove("arrow-up-pressed")
            query("#arrow-button-down").classList.remove("arrow-down-pressed")
            video.pause()
            // if (--counter == 0) clearInterval(interval)
        // }, 0)
    }

    window.addEventListener('mousemove', ({ movementX, movementY }) => {
        if (instructionsIsOnDisplay) return
        if (!dragging) return;
        
        Angle.rotateRadians(-movementX / desktopSensitivity)

        if (canRotateX())
            camera.rotateX(movementY / desktopSensitivity)

        function canRotateX() {
            if (movementY > 0 && camera.rotation.x + 0.01 + movementY / desktopSensitivity > Math.PI / 2)
                return false
            if (movementY < 0 && camera.rotation.x - 0.01 + movementY / desktopSensitivity < -Math.PI / 2)
                return false
            return true
        }
    });

    function onResize() {
        const width = window.innerWidth
        const height = window.innerHeight

        renderer.setSize(width, height);
        camera.aspect = width / height
        camera.fov = camera.fov + 1
        camera.fov = camera.fov - 1
        camera.updateProjectionMatrix();
    }

    function createScene(videoElement) {
        // https://threejs.org/docs/#api/en/geometries/SphereGeometry
        const geometry = new THREE.SphereGeometry(15, 256, 128) // create a sphere geometry
       
        const texture = new THREE.VideoTexture(videoElement
            , undefined, undefined, undefined, undefined, undefined
            , THREE.RGBAFormat // Firefox patch
        ) // create a VideoTexture
        
        // create a material from the texture
        const material = new THREE.MeshBasicMaterial({ map: texture })
       
        material.side = THREE.BackSide // need to use back side - surface of the sphere is facing outside but we put the camera inside of the sphere
        const mesh = new THREE.Mesh(geometry, material) // create a mesh
        
        const scene = new THREE.Scene() // create a scene
        scene.add(mesh) // add mesh to the scene

        return scene
    }

    function createRenderer(camera, videoElement, width, height) {
        const scene = createScene(videoElement) // create a scene
        // https://threejs.org/docs/#api/en/renderers/WebGLRenderer
        const renderer = new THREE.WebGLRenderer(); // create a renderer
        renderer.setSize(width, height);
        
        renderer.setAnimationLoop(() => renderer.render(scene, camera));
        document.body.appendChild(renderer.domElement) // display the renderer
        
        query("#transparent").addEventListener('wheel', event => { // zoom in / out
            camera.fov = clamp(camera.fov + event.deltaY / 10, 10, 120);
            // need to call this function after changing most of properties in PerspectiveCamera
            camera.updateProjectionMatrix();
        });

        return renderer
    }

    window.addEventListener("unhandledrejection", promiseRejectionEvent => { 
        console.log(promiseRejectionEvent) // handle error here, for example log 
    })


    load3dMap()
    launchMenu()
    instruction(videoMap)
    launchMap(videoMap, video)
    launchArrows(videoMap, video)

    console.log("started")

}