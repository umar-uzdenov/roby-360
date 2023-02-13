

function minimap(videoMap, video) {
    if (true === true) return false
    // location map

    const svgMap = createSvgMap(videoMap.videos, video)

    const locationMap = query("#location-map")
    const miniMapWrapper = query("#minimap-wrapper")
    const innerMap = query("#inner-map")
    const mapTitle = query("#map-title")
    const closeButton = query("button#close-map")
    const mapDot = query("#map-dot")

    innerMap.appendChild(svgMap)

    // innerMap.style.backgroundImage = `url("data:image/svg+xml;utf8,${
    //     new XMLSerializer().serializeToString(svgMap)
    // }")`;

    // console.log(new XMLSerializer().serializeToString(svgMap))

    // innerMap.style = `background: url("#svg-map");`;
    
    setMinimapPosition(videoMap.current.lineSegment, 1)
    innerMap.style = ''

    locationMap.addEventListener("click", event => {
        event.stopPropagation();
        event.preventDefault()


        if (!miniMap.status) {
            const height = detectMobile() ? 60 : 10

            locationMap.style = `
                width: calc(100vw - min(10vw, 10vh));
                height: calc(100vh - min(${height}vw, ${height}vh));
                border-radius: min(5vw, 5vh);
                padding: min(5vw, 5vh);
                background: rgba(255, 255, 255, 0.9);
                cursor: default;
            `
            miniMapWrapper.style = `
                position: relative;
                min-width: min(80vw, 80vh);
                min-height: min(48vw, 48vh);
                transform: none;
            `
            innerMap.style = `
                z-index: 93;
                cursor: pointer;
                transform: none;
            `
            mapTitle.style = `
                opacity: 1;
            `
            mapDot.style = `
                position: absolute;
                top: ${-miniMap.top}px;
                left: ${-miniMap.left}px;
            `
            // console.log(miniMap)
            miniMap.status = true
        }
    })

    closeButton.addEventListener("click", event => {
        event.stopPropagation();
        event.preventDefault()

        if (miniMap.status) {
            locationMap.style = ""
            // innerMap.style = ''
            mapTitle.style = ""
            miniMap.status = false
            miniMapWrapper.style = ""
            query("#map-dot").style = ""
        }
    })
}
