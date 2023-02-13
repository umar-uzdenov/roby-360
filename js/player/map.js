function launchMap(videoMap, videoPlayer) {

    const mapModal = query("#map-modal")
    const mapWrapper = query("#map-wrapper")
    const mapTitle = query("#map-title")
    const mapCloseButton = query("#map-close-button")
    const mapPoints = query("#map-points")
    
    let style
    const image = new Image();
    image.src = "map/video-map.png"
    image.onload = async () => {
        style = mapStyle()
        style.setImage(image)

        await new Promise(resolve => setTimeout(() => resolve(), 1000))

        miniMap.width = image.width
        miniMap.height = image.height
        miniMap.resultWidth = style.resultWidth
        miniMap.resultHeight = style.resultHeight

        const svgMap = createSvgMap(videoMap.videos, videoPlayer, image.width, image.height)
        mapWrapper.appendChild(svgMap)
    }

    let mapState = "mini"

    window.closeFullMap = function() {
        if (mapState === "mini-map") return false
        mapState = "mini-map"
        mapModal.classList.remove("full-map")
        mapModal.classList.add("mini-map")
        mapWrapper.classList.remove("full-map")
        mapWrapper.classList.add("full-mini-transition")
        setTimeout(() => {
            if (mapWrapper.classList.contains("full-map")) return

            mapWrapper.classList.remove("full-mini-transition")
            mapWrapper.classList.add("mini-map")
        }, 1100);
        mapWrapper.style = `--map-aspect-ratio:${image.width / image.height}`;
        mapTitle.classList.add("mini-map")
        mapCloseButton.classList.add("mini-map")
        mapPoints.classList.add("mini-map")

        // query("#arrow-wrapper").classList.remove("hidden-arrow-wrapper") // hack
        return true
    }

    query("#map-close-button").addEventListener("click", event => {
        event.stopPropagation()
        closeFullMap()
        if (!detectMobile()) openMenu()
    })

    window.openFullMap = function() {
        if (mapState == "full") return

        mapState = "full"
        hideMenu()
        close3dMap()

        mapModal.classList.remove("mini-map")
        mapModal.classList.add("full-map")
        mapWrapper.classList.remove("full-mini-transition")
        mapWrapper.classList.remove("mini-map")
        mapWrapper.classList.add("full-map")
        mapTitle.classList.remove("mini-map")
        mapCloseButton.classList.remove("mini-map")
        mapPoints.classList.remove("mini-map")
    
    }

    mapModal.addEventListener("click", event => {
        event.stopPropagation()
        openFullMap()
    })
}

function mapStyle() {

    let imageWidth = 0
    let imageHeight = 0

    let vw, vh, vwh, mapAspectRatio, rotation,
        mapMargin, mapPadding, mapPortraitMarginBottom, mapCloseButtonRadius,
        mapLandscapeFlexGap, mapPortraitFlexGap,
        mapTitleLandscapeHeight, mapTitlePortraitHeight,
        mapTitleLandscapeFont, mapTitlePortraitFont,
        mapLandscapeRadius, mapPortraitRadius,
        landscapePointListGap, portraitPointListGap,
        landscapePointFontSize, portraitPointFontSize,
        landscapeDotSize, portraitDotSize,
        mapWrapperLandscapePositionWidth, mapWrapperLandscapePositionHeight,
        mapWrapperPortraitPositionWidth, mapWrapperPortraitPositionHeight,

        nwWidth, nwHeight, nhWidth, nhHeight,
        rwWidth, rwHeight, rhWidth, rhHeight,
        normalWidth, normalHeight,
        rotatedWidth, rotatedHeight,
        resultWidth, resultHeight,

        mapButtonWidth, mapButtonHeight, mapButtonFontSize,
        mapScaleCoefficient

    
    // setSizes()
    let resizeTimeout
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {

            if (resizeTimeout) clearTimeout(resizeTimeout)
            
            setSizes()
            setStyle()
            console.log({vw, vh, mapAspectRatio, rotation,
                mapMargin, mapPadding, mapCloseButtonRadius,
                mapLandscapeFlexGap, mapPortraitFlexGap,
                mapTitleLandscapeHeight, mapTitlePortraitHeight,
                mapTitleLandscapeFont, mapTitlePortraitFont,
                mapLandscapeRadius, mapPortraitRadius,
                landscapePointListGap, portraitPointListGap,
                landscapePointFontSize, portraitPointFontSize,
                landscapeDotSize, portraitDotSize,
                mapWrapperLandscapePositionWidth, mapWrapperLandscapePositionHeight,
                mapWrapperPortraitPositionWidth, mapWrapperPortraitPositionHeight,
    
                nwWidth, nwHeight, nhWidth, nhHeight,
                rwWidth, rwHeight, rhWidth, rhHeight,
                normalWidth, normalHeight,
                rotatedWidth, rotatedHeight,
                resultWidth, resultHeight,
            })

        }, 20)  
    })

    launchStyles()


    return {
        setImage(image) {
            imageWidth = image.width
            imageHeight = image.height
            mapAspectRatio = image.width / image.height
        },
        get resultWidth() { return resultWidth },
        get resultHeight() { return resultHeight },
    }

    function launchStyles() {
        let count = 100
        const interval = setInterval(() => {
            try {
                setSizes()
                setStyle()

                if (count-- == 0) clearInterval(interval)
            } catch (error) {}
        }, 10)

        setInterval(() => {
            try {
                query("#map-wrapper-style").innerHTML = `
                    :root {
                        --mini-map-top: ${miniMap.top / miniMap.height * resultHeight}px;
                        --mini-map-left: ${miniMap.left / miniMap.width * resultWidth}px;
                        --camera-rotation: ${360 - Angle.getAngle()}deg;
                        --map-dot-rotation: ${Angle.getAngle()}deg;
                    }
                `
            } catch (error) {}
        }, 10)
    }

    function setStyle() {
        query("#map-modal-style").innerHTML = `
            :root {
                --full-width: 100vw;
                --full-height: 100vh;
                --map-margin: ${mapMargin}px;
                --map-padding: ${mapPadding}px;
                --button-radius: ${mapCloseButtonRadius}px;

                --map-wrapper-width: ${resultWidth}px;
                --map-wrapper-height: ${resultHeight}px;
                --map-wrapper-rotation: ${rotation}deg;

                --map-button-width: ${mapButtonWidth}px;
                --map-button-height: ${mapButtonHeight}px;
                --map-button-font-size: ${mapButtonFontSize}px;
                --map-scale-coefficient: ${mapScaleCoefficient.toFixed(4)};

                --map-transition: 0.7s;
                --map-transition-coefficient: 8;
            }
            
            @media not screen and (pointer: coarse) {
                :root {
                    --full-map-radius: ${mapLandscapeRadius}px;
                    --map-flex-gap: ${mapLandscapeFlexGap}px;
                    --map-title-height: ${mapTitleLandscapeHeight}px;
                    --map-title-font: ${mapTitleLandscapeFont}px;
                    --point-list-gap: ${landscapePointListGap}px;
                    --point-font-size: ${landscapePointFontSize}px;
                    --map-dot-size: ${landscapeDotSize}px;
                    --mini-size: min(30vw, 30vh);
                }
            }
            
            @media only screen and (pointer: coarse) {
                :root {
                    --map-portrait-margin-bottom: ${mapPortraitMarginBottom}px;
                    --full-map-radius: ${mapPortraitRadius}px;
                    --map-flex-gap: ${mapPortraitFlexGap}px;
                    --map-title-height: ${mapTitlePortraitHeight}px;
                    --map-title-font: ${mapTitlePortraitFont}px;
                    --point-list-gap: ${portraitPointListGap}px;
                    --point-font-size: ${portraitPointFontSize}px;
                    --map-dot-size: ${portraitDotSize}px;
                    --mini-size: min(40vw, 40vh);
                }
            }
        `
    }

    function setSizes() {
        try {
            vw = window.innerWidth / 100
            vh = window.innerHeight / 100
            vwh = Math.min(vw, vh)
            mapMargin = 5 * vwh
            mapPadding = 5 * vwh
            mapPortraitMarginBottom = 24 * vwh;
            mapLandscapeFlexGap = 6 * vwh
            mapPortraitFlexGap = 5 * vwh
            mapTitleLandscapeHeight = 6 * vwh
            mapTitlePortraitHeight = 10 * vwh
            mapTitleLandscapeFont = 5 * vwh
            mapTitlePortraitFont = 5 * vwh
            mapCloseButtonRadius = 1 * vwh
            mapLandscapeRadius = 2.5 * vwh
            mapPortraitRadius = 4 * vwh

            landscapePointListGap = 2.5 * vwh
            portraitPointListGap = 2.5 * vwh
            landscapePointFontSize = 2.5 * vwh
            portraitPointFontSize = 4 * vwh
            landscapeDotSize = 2 * vwh
            portraitDotSize = 3 * vwh


            mapButtonWidth = 10 * vwh
            mapButtonHeight = 3 * vwh
            mapButtonFontSize = 2 * vwh

            mapWrapperLandscapePositionWidth = 100 * vw - 2 * mapMargin - 2 * mapPadding
            mapWrapperLandscapePositionHeight =
                100 * vh - 2 * mapMargin - 2 * mapPadding - 2 * mapTitleLandscapeHeight - 2 * mapLandscapeFlexGap
    
            mapWrapperPortraitPositionWidth = 100 * vw - 2 * mapMargin - 2 * mapPadding
            mapWrapperPortraitPositionHeight =
                100 * vh - 2 * mapMargin - mapPadding - mapPortraitMarginBottom - 2 * mapTitlePortraitHeight - 2 * mapPortraitFlexGap

            if (vw > vh) {
                nwWidth = mapWrapperLandscapePositionWidth
                nhHeight = mapWrapperLandscapePositionHeight
                rwWidth = mapWrapperLandscapePositionHeight
                rhHeight = mapWrapperLandscapePositionWidth
            } else {
                nwWidth = mapWrapperPortraitPositionWidth
                nhHeight = mapWrapperPortraitPositionHeight
                rwWidth = mapWrapperPortraitPositionHeight
                rhHeight = mapWrapperPortraitPositionWidth
            }

            nwHeight = nwWidth / mapAspectRatio
            nhWidth = nhHeight * mapAspectRatio
            rwHeight = rwWidth / mapAspectRatio
            rhWidth = rhHeight * mapAspectRatio

            normalWidth = Math.min(nwWidth, nhWidth)
            normalHeight = Math.min(nwHeight, nhHeight)
            rotatedWidth = Math.min(rwWidth, rhWidth)
            rotatedHeight = Math.min(rwHeight, rhHeight)

            resultWidth = Math.max(normalWidth, rotatedWidth)
            resultHeight = Math.max(normalHeight, rotatedHeight)
            miniMap.resultWidth = resultWidth
            miniMap.resultHeight = resultHeight
            mapScaleCoefficient = resultWidth / miniMap.width

            rotation = resultWidth - rotatedWidth == 0 ? 90 : 0
        } catch (error) {}
    }
}


function setMinimapPosition(lineSegment, durationCoefficient) {
    miniMap.top = 
        (lineSegment.endY - lineSegment.startY) * durationCoefficient + lineSegment.startY
    miniMap.left =
        (lineSegment.endX - lineSegment.startX) * durationCoefficient + lineSegment.startX
}

function createSvgMap(videos, videoPlayer, width, height) {
    const NS = 'http://www.w3.org/2000/svg'
    const mapWrapper = query("#map-wrapper")

    const svg = document.createElementNS(NS, "svg")
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`)
    svg.setAttribute("id", "svg-map")

    for (const videoJson of videos) {
        const line = document.createElementNS(NS, "line")
        line.setAttribute("stroke", "white")
        line.setAttribute("stroke-width", "2")
        line.setAttribute("x1", videoJson.lineSegment.startX)
        line.setAttribute("y1", videoJson.lineSegment.startY)
        line.setAttribute("x2", videoJson.lineSegment.endX)
        line.setAttribute("y2", videoJson.lineSegment.endY)
        svg.appendChild(line)

        let lineAngle = videoJson.angle + 90
        // if (lineAngle > 90) (lineAngle = 360 - lineAngle + 180) % 360

        for (const point of videoJson.points) {
            const button = html`<button>${point.name}</button>`
            button.addEventListener("click", () => {
                videoPlayer.jump(videoJson.id, point.coefficient)
            })
            query("#map-points").appendChild(button)

            const mapButton = document.createElement("button")
            mapButton.innerHTML = `
                <span class="language-ru">${point.name}</span>
                <span class="language-en invisible">${point.nameEnglish}</span>
            `
            const coefficient = miniMap.resultHeight / miniMap.height // cause aspect ratio is const
            setButtonStyle()
            let resizeTimeout
            window.addEventListener("resize", () => {
                clearTimeout(resizeTimeout)
                resizeTimeout = setTimeout(setButtonStyle, 30)
            })
            function setButtonStyle() {
                mapButton.style = `
                    display: block;
                    width: var(--map-button-width);
                    height: var(--map-button-height);
                    line-height: var(--map-button-height);
                    font-size: var(--map-button-font-size);
                    border-radius: calc(var(--map-button-height) / 2);
                    border: 1px solid white;
                    position: absolute;
                    top: calc(${point.y * miniMap.coefficient}px  - var(--map-button-height) / 2);
                    left: calc(${point.x * miniMap.coefficient}px  - var(--map-button-width) / 2);
                    background: white;
                    transform-origin: center center;
                    transform: rotate(${lineAngle}deg) ;
                `
            }
            mapButton.addEventListener("click", () => {
                videoPlayer.jump(videoJson.id, point.coefficient)
                console.log("jump")
            })

            // console.log((point.y - 200 / 2) * coefficient)
            // console.log((point.x - 60 / 2) * coefficient)

            mapWrapper.appendChild(mapButton)

            // svg.appendChild(rect)
            // svg.appendChild(text)

        }
    }

    return svg
}