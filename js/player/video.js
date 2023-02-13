

function createVideo(videoMap, camera, totalVideoPause) {
    // create a video element and set attributes
    const videoElement = document.createElement('video');
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.crossOrigin = "crossOrigin"

    videoElement.playbackRate = 1

    window.setPlaybackRate = function(speed) {
        videoElement.playbackRate = speed
    }

    let nextVideoStarted = false
    let isForward = true
    let midpoint = 0

    setTimeout(async () => {

        toggleVideoIsLoading(true)

        toggleVideoIsLoading(true)
        const videoBlob = await preloadVideo(videoMap.current)
        videoMap.current.blob = videoBlob
        videoElement.src = videoBlob
        toggleVideoIsLoading(false)

        // await videoElement.play()
        await setMidpoint("start")
        videoElement.pause()
        videoElement.currentTime = 0
        
        // return
        
        query("#on-download").classList.add("invisible")
        query("#video-is-loading").classList.remove("on-load-screens")
        
        if (detectMobile()) {
            query("#mobile-instructions").classList.remove("invisible")
        } else {
            query("#desktop-instructions").classList.remove("invisible")
        }
        // toast("before")
        try {
            // toast("after")
        } catch (error) {
            // toast(error)
        }

        // toast(midpoint)

        preloadConnections()
    }, 0)

    async function preloadConnections() {
        const currentId = videoMap.current.id
        const connections = videoMap.current.startConnections
            .concat(videoMap.current.endConnections)
            .map(({ videoId }) => videoMap.videos.find(video => video.id == videoId))
        
        for (const connection of connections) {
            if (currentId != videoMap.current.id) return
            if (connection.blob != null && connection.blob != "loading") return

            connection.blob = "loading"

            connection.blob = await preloadVideo(connection)
            // console.log(videoMap)
        }
    }

    function preloadVideo(connection) {
        return new Promise(resolve => {
            const currentId = videoMap.currentId
            const connectionId = connection.id
            var request = new XMLHttpRequest();
            request.onload = function() {
                resolve(URL.createObjectURL(request.response))
            }

            request.onprogress = progress => {
                if (!nextVideoStarted) {
                    writeVideoProgress(progress)
                } else if (videoMap.currentId != currentId || videoMap.currentId != connectionId) {
                    request.abort()
                    return resolve(null)
                }
            }

            request.open("GET", videoMap.folder + connection.name)
            request.responseType = "blob"
            request.send()
        })
    }

    function setMidpoint(state) {
        return new Promise(resolve => {
            const midpointInterval = setInterval(async () => {
                if (!isNaN(videoElement.duration)) {
                    midpoint = videoElement.duration / 2

                    if (state == "start") {
                        videoElement.currentTime = 0
                    } else if (state == "end") {
                        videoElement.currentTime = midpoint
                    }
                    
                    clearInterval(midpointInterval)
                    resolve()
                }
            }, 10)
        })
    }

    function findNextVideo(state) {
        let angle = Angle.getAngle()
        if (isForward ^ Angle.isLookingFront()) { // angle correction when intercepting backwards
            angle = (angle + 180) % 360
        }

        try {
            const connections = getConnections(state)
            if (connections.length == 0) return null

            for (let connection of connections) {
                const { startAngle, endAngle, videoId, type } = connection
                if (canPlayNextVideo(angle, startAngle, endAngle)) {
                    return setNextVideo(videoId, type)
                }
            }
        } catch (error) {}

        return null
    }

    function getConnections(state) {
        if (state == "start") return videoMap.current.startConnections
        if (state == "end") return videoMap.current.endConnections
        throw "State must be start or end"
    }

    function canPlayNextVideo(angle, startAngle, endAngle) {
        if (endAngle < startAngle) {
            return angle >= 0 && angle <= endAngle || angle >= startAngle && angle <= 359
        } else {
            return angle >= startAngle && angle <= endAngle
        }
    }

    function setNextVideo(videoId, type) {
        videoMap.currentId = videoId
        videoMap.type = type
        videoMap.current = videoMap.videos.find(video => video.id == videoId)
        return videoMap.folder + videoMap.current.name
    }

    async function nextVideoStart(state) {
        totalVideoPause()

        Angle.fixAngle() // must into inner logic
        
        const nextVideo = findNextVideo(state)

        if (nextVideo === null) return false

        if (videoMap.current.blob == null) {
            toggleVideoIsLoading(true)
            videoMap.current.blob = await preloadVideo(videoMap.current)
            toggleVideoIsLoading(false)
        } else if (videoMap.current.blob == "loading") {
            toggleVideoIsLoading(true)
            while (videoMap.current.blob == "loading") {
                await new Promise(resolve => setTimeout(resolve, 60))
            }
            toggleVideoIsLoading(false)
        }

        videoElement.src = videoMap.current.blob
        
        await setMidpoint(videoMap.type)
        preloadConnections()
        nextVideoStarted = true
        Angle.rotateToNew()
        
        return true
    }

    setInterval(() => {
        let coefficient = 0

        if (isForward) {
            coefficient = videoElement.currentTime
        } else {
            coefficient = videoElement.duration - videoElement.currentTime
        }
        coefficient = coefficient / videoElement.duration * 2
        if (coefficient > 1.2) {
            // coefficient = (2 - coefficient) / 2 // mock to not jump
        }
        // console.log(videoElement.currentTime, videoElement.duration / 2)
        
        // console.log({coefficient, currentTime: videoElement.currentTime, currentVideo: videoMap.currentId })
        
        
        try { setMinimapPosition(videoMap.current.lineSegment, coefficient) } catch (error) {}

        if (isForward && videoElement.currentTime + 0.1 > midpoint) {
            videoElement.pause()
        } else if (videoElement.currentTime + 0.1 > videoElement.duration) {
            videoElement.pause()
        }
    }, 33) // 60 fps

    // videoElement.addEventListener('timeupdate', event => {
        // was slowing down entire program
        // let coefficient = 0

        // if (isForward) {
        //     coefficient = videoElement.currentTime
        // } else {
        //     coefficient = videoElement.duration - videoElement.currentTime
        // }
        // coefficient = coefficient / videoElement.duration * 2
        // if (coefficient > 1.2) {
        //     coefficient = (2 - coefficient) / 2 // mock to not jump
        // }

        // // console.log({coefficient, currentTime: videoElement.currentTime, currentVideo: videoMap.currentId })
        
        
        // setMinimapPosition(videoMap.current.lineSegment, coefficient)
        
        // if (isForward && videoElement.currentTime + 0.1 > midpoint) {
        //     videoElement.pause()
        // } else if (videoElement.currentTime + 0.1 > videoElement.duration) {
        //     videoElement.pause()
        // }
    // });

    async function play() {
        try {
            await videoElement.play()
        } catch (error) {
            console.log(error)
        }
    }

    return {
        videoElement,
        async playForward() {
            // if (isForward && !videoElement.paused) return
            // console.log("forward")
            if (videoMap.current.blob == null || videoMap.current.blob == "loading") return

            isForward = true

            if (videoElement.currentTime > midpoint) {
                videoElement.currentTime = videoElement.duration - videoElement.currentTime - 0.1 // hack
            }

            if (videoElement.currentTime + 0.2 > midpoint) {
                if (!await nextVideoStart("end")) return
            }

            // if (isForward && !videoElement.paused) return

            play()
        },
        async playBackwards() {
            // if(!isForward && !videoElement.paused) return
            if (videoMap.current.blob == null || videoMap.current.blob == "loading") return

            isForward = false

            // console.log("1")
            if (videoElement.currentTime < midpoint) {
                // console.log("2")
                // safeCall(() => {
                    try {
                        videoElement.currentTime = videoElement.duration - videoElement.currentTime + 0.1 // hack
                    } catch (error) {
                        console.log(error)
                    }
                    return console.log("trying reverse")
                // })
            }
            // console.log("3")

            if (videoElement.currentTime + 0.2 > videoElement.duration) {
                if (!await nextVideoStart("start")) return
            }
            // console.log("4")

            // if(!isForward && !videoElement.paused) return

            console.log("5")
            play()
        },
        pause() {
            safeCall(() => videoElement.pause())
        },
        async jump(videoId, coefficient) {
            videoElement.pause()

            videoMap.currentId = videoId
            videoMap.type = "start"
            videoMap.current = videoMap.videos.find(video => video.id == videoId)
            const nextVideo = videoMap.folder + videoMap.current.name

            if (videoMap.current.blob == null) {
                toggleVideoIsLoading(true)
                videoMap.current.blob = await preloadVideo(videoMap.current)
            } else if (videoMap.current.blob == "loading") {
                toggleVideoIsLoading(true)
                while (videoMap.current.blob == "loading") {
                    await new Promise(resolve => setTimeout(resolve, 60))
                }
            }
    
            videoElement.src = videoMap.current.blob
            toggleVideoIsLoading(false)
            
            totalVideoPause()
            await setMidpoint(videoMap.type)
            await new Promise(resolve => {
                videoElement.currentTime = videoElement.duration * coefficient / 2
                setTimeout(() => resolve(), 50)
            })
            preloadConnections()
            nextVideoStarted = true
    
            return true
        },
        getTimeCoefficient() {
            let coefficient = 0

            if (isForward) {
                coefficient = videoElement.currentTime
            } else {
                coefficient = videoElement.duration - videoElement.currentTime
            }
            coefficient = coefficient / videoElement.duration * 2
            if (coefficient > 1.2) {
                coefficient = (2 - coefficient) / 2 // mock to not jump
            }
            return coefficient
        },
    }
}