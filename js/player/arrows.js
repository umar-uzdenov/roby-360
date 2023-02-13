function launchArrows(videoMap, videoPlayer) {
    videoMap.videos.forEach(video => {
        const x = (video.lineSegment.startX + video.lineSegment.endX) / 2
        const y = (video.lineSegment.startY + video.lineSegment.endY) / 2
        video.lineSegment.middlePoint = { x, y }
    })

    const arrorCompass = query("#arrows").query("#arrow-compass")

    let currentVideo = videoMap.current
    let startConnectionMiddlePoints = []
    let endConnectionMiddlePoints = []
    let startArrows = []
    let endArrows = []

    findConnectionPoints()
    updateArrows()

    setInterval(() => {
        if (currentVideo === undefined || currentVideo === null) return

        if (videoMap?.current?.id != currentVideo.id) {
            currentVideo = videoMap.current
            findConnectionPoints()
            updateArrows()
        }
        
        arrorCompass.style = `rotate: ${360 - Angle.getAngle()}deg`

        const timeCoefficient = videoPlayer.getTimeCoefficient()

        // console.log(startArrows)
        // console.log(startConnectionMiddlePoints)

        startArrows.forEach(({ point, arrow }) => {
            const angle =  Math.atan2(
                point.y - miniMap.top, point.x - miniMap.left
            ) * 180 / Math.PI + 90
            arrow.style.rotate = `${angle}deg`
            if (timeCoefficient < 0.2) {
                arrow.style.opacity = `1`
            } else if (timeCoefficient > 0.2 && timeCoefficient <= 0.3) {
                arrow.style.opacity = `${3 - 10 * timeCoefficient}`
            } else {
                arrow.style.opacity = `0`
            }
        })

        endArrows.forEach(({ point, arrow }) => {
            const angle =  Math.atan2(
                point.y - miniMap.top, point.x - miniMap.left
            ) * 180 / Math.PI + 90
            arrow.style.rotate = `${angle}deg`
            if (timeCoefficient > 0.8) {
                arrow.style.opacity = `1`
            } else if (timeCoefficient < 0.8 && timeCoefficient >= 0.7) {
                arrow.style.opacity = `${10 * timeCoefficient - 7}`
            } else {
                arrow.style.opacity = `0`
            }
        })

        const forwardArrow = query("#compass-forward")
        const backwardArrow = query("#compass-backward")
        if (timeCoefficient >=0 && timeCoefficient < 0.2) {
            forwardArrow.style.opacity = `1`
            backwardArrow.style.opacity = `0`
        } else if (timeCoefficient >= 0.15 && timeCoefficient < 0.25) {
            forwardArrow.style.opacity = `1`
            backwardArrow.style.opacity = `${10 * timeCoefficient - 1.5}`
        } else if (timeCoefficient > 0.75 && timeCoefficient <= 0.85) {
            forwardArrow.style.opacity = `${8.5 - 10 * timeCoefficient}`
            backwardArrow.style.opacity = `1`
        } else if (timeCoefficient > 0.8 && timeCoefficient <= 1) {
            forwardArrow.style.opacity = `0`
            backwardArrow.style.opacity = `1`
        } else {
            forwardArrow.style.opacity = `1`
            backwardArrow.style.opacity = `1`
        }

        const verticalAngle = Angle.getVerticalAngle()
        // console.log(verticalAngle)
        if (verticalAngle > -30 && verticalAngle < 15) {
            arrorCompass.style.opacity = `1`
        } else if (verticalAngle >= 15 && verticalAngle < 25) {
            arrorCompass.style.opacity = `${2.5 - verticalAngle / 10}`
        } else if (verticalAngle > -40 && verticalAngle < -30) {
            arrorCompass.style.opacity = `${4 + verticalAngle / 10}`
        } else {
            arrorCompass.style.opacity = `0`
        }

        // console.log(currentVideo.endConnections
        //     .map(connection => connection.videoId)
        // )


        // console.log(currentVideo)
        // console.log(startConnectionMiddlePoints)
        // console.log(endConnectionMiddlePoints)
    }, 10)

    function findConnectionPoints() {
        if (currentVideo === undefined || currentVideo === null) return

        const startConnectionIds = currentVideo.startConnections
            .map(connection => connection.videoId)
        startConnectionMiddlePoints = videoMap.videos
            .filter(video => startConnectionIds.includes(video.id))
            .map(video => video.lineSegment.middlePoint)

        const endConnectionIds = currentVideo.endConnections
            .map(connection => connection.videoId)
        endConnectionMiddlePoints = videoMap.videos
            .filter(video => endConnectionIds.includes(video.id))
            .map(video => video.lineSegment.middlePoint)

    }

    function updateArrows() {
        // [...arrorCompass.children].forEach(child => {
        //     if (child.getAttribute("id").endsWith("forward")) return
        //     if (child.getAttribute("id").endsWith("backward")) return
        //     arrorCompass.removeChild(child)
        // })

        ;

        [...arrorCompass.children].forEach(child => arrorCompass.removeChild(child))

        arrorCompass.appendChild(
            html`<div id="compass-forward" style="rotate: ${currentVideo.angle}deg"></div>`
        )

        arrorCompass.appendChild(
            html`<div id="compass-backward" style="rotate: ${currentVideo.angle + 180}deg"></div>`
        )

        startArrows = []
        endArrows = []

        startConnectionMiddlePoints.forEach(point => {
            const arrow =  html`<div></div>`
            startArrows.push({point, arrow})
            arrorCompass.appendChild(arrow)
        })

        endConnectionMiddlePoints.forEach(point => {
            const arrow =  html`<div></div>`
            endArrows.push({point, arrow})
            arrorCompass.appendChild(arrow)
        })

        // arrorCompass.appendChild(
        //     html`<div id="compass-forward" style="rotate: ${currentVideo.angle}deg"></div>`
        // )
        // arrorCompass.appendChild(
        //     html`<div id="compass-backward" style="rotate: ${(currentVideo.angle + 180) % 360}deg"></div>`
        // )

    }


    console.log("launch arrows")
    console.log(videoMap.videos.map(video => video.lineSegment.middlePoint))
}