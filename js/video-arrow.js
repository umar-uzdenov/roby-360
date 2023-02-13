class VideoArrow {
    constructor(x, y) {
        this.points = []
        
        this.startX = this.endX = x
        this.startY = this.endY = y

        // this.polyline = document.createElementNS(NS, 'polyline')
        // this.polyline.setAttribute("points", this.linePoints())

        this.polygon = document.createElementNS(NS, "polygon")
        this.polygon.setAttribute("points", this.polygonPoints())
        this.color = Color.random(159, 223)
        this.polygon.style.fill = this.color.hex('#')
    }
    setSvgElement(svgElement) {
        this.svgElement = svgElement
    }
    setName(name) {
        this.name = name
    }
    setPoints(points) {
        // console.log("setting points", points)
        for (const pointJson of points) {
            const point = new Point(pointJson.x, pointJson.y, this.color, pointJson.name, pointJson.nameEnglish)
            this.addPoint(point)
            this.svgElement.appendChild(point.circle)
        }
    }
    resetShapes() {
        safeCall(() => this.polyline.setAttribute("points", this.linePoints()))
        safeCall(() => this.polygon.setAttribute("points", this.polygonPoints()))
        safeCall(() => this.points.forEach(point => point.moveCircle()))
        // safeCall(() => console.log(this.angle()))
    }
    setStart(x, y) {
        this.startX = x.int
        this.startY = y.int

        if (shiftDown) {
            let lengthX = Math.abs(this.endX - this.startX)
            let lengthY = Math.abs(this.endY - this.startY)

            if (lengthX > lengthY) this.startY = this.endY
            if (lengthY > lengthX) this.startX = this.endX
        }

        this.movePoints()
        this.resetShapes()
    }
    setEnd(x, y, shiftDown) {
        this.endX = x.int
        this.endY = y.int


        if (shiftDown) {
            let lengthX = Math.abs(this.endX - this.startX)
            let lengthY = Math.abs(this.endY - this.startY)

            if (lengthX > lengthY) this.endY = this.startY
            if (lengthY > lengthX) this.endX = this.startX
        }

        this.movePoints()
        this.resetShapes()
    }
    linePoints() {
        return `${this.startX},${this.startY} ${this.endX},${this.endY}`
    }
    remove() {
        // this.polyline.parentNode.removeChild(this.polyline)
        this.polygon.parentNode.removeChild(this.polygon)
    }
    polygonPoints() {
        let x = this.endX - this.startX
        let y = this.endY - this.startY

        const size = 2
        const arrowWidthFactor = 3
        const arrowLengthFactor = 7
        const length = Math.sqrt(x ** 2 + y ** 2) || 0.001
        const factor = size / length

        const arrowTip = `${this.endX},${this.endY}`
        
        if (length < size * arrowLengthFactor) {
            const arrowLeft = `${y * factor * arrowWidthFactor + this.startX},${-x * factor * arrowWidthFactor + this.startY}`
            const arrowRight = `${-y * factor * arrowWidthFactor + this.startX},${x * factor * arrowWidthFactor + this.startY}`

            return `${arrowLeft} ${arrowTip} ${arrowRight}`
        } else {
            const arrowX = x * size * arrowLengthFactor / length
            const arrowY = y * size * arrowLengthFactor / length
            const arrowStartX = this.endX - arrowX
            const arrowStartY = this.endY - arrowY
            const arrowFactor = arrowWidthFactor / arrowLengthFactor

            const arrowLeft =
                `${arrowY * arrowFactor + arrowStartX},${-arrowX * arrowFactor + arrowStartY}`
            const arrowRight =
                `${-arrowY * arrowFactor + arrowStartX},${arrowX * arrowFactor + arrowStartY}`

            const startLeft = `${y * factor + this.startX},${-x * factor + this.startY}`
            const startRight = `${-y * factor + this.startX},${x * factor + this.startY}`
            const endLeft = `${y * factor + arrowStartX},${-x * factor + arrowStartY}`
            const endRight = `${-y * factor + arrowStartX},${x * factor + arrowStartY}`

            return `${startLeft} ${endLeft} ${arrowLeft} ${arrowTip} ${arrowRight} ${endRight} ${startRight}`
        }
    }
    movePoints() {
        this.points.forEach(point => {
            point.x = (this.endX - this.startX) * point.coefficient + this.startX
            point.y = (this.endY - this.startY) * point.coefficient + this.startY
        })
    }
    findClosestPointTo(point) {
        // Define the function g(t) = ||f(t)||^2, which is the squared length of
        // the vector between pointP and a point on the line segment pointApointB at a distance t from pointA
        const squaredDistanceBetweenPoints = (t) => {
            const x = (1 - t) * this.startX + t * this.endX - point.x
            const y = (1 - t) * this.startY + t * this.endY - point.y
            return x ** 2 + y ** 2
        }
    
        // Find the value of t that minimizes g(t). To do this, compute g'(t)
        // and set it equal to zero to find the critical points of g. The minimum
        // will either occur at one of these critical points or at the endpoints
        // of the line segment (t = 0 or t = 1).
        let segmentVector = { x: this.endX - this.startX, y: this.endY - this.startY };
        let pointAVector = { x: this.startX - point.x, y: this.startY - point.y };
        let t = -(segmentVector.x * pointAVector.x + segmentVector.y * pointAVector.y) / (segmentVector.x * segmentVector.x + segmentVector.y * segmentVector.y);
    
        // If the minimum occurs at a critical point t in the unit interval (0 < t < 1),
        // then the point on the line segment that is closest to pointP is (1 - t) * pointA + t * pointB.
        // If the minimum occurs at an endpoint, then the closest point is the endpoint itself.
        if (t >= 0 && t <= 1) {
            return new Point(
                (1 - t) * this.startX + t * this.endX, (1 - t) * this.startY + t * this.endY,
                this.color)
        } else {
            let squaredDistanceAtT0 = squaredDistanceBetweenPoints(0)
            let squaredDistanceAtT1 = squaredDistanceBetweenPoints(1)
            if (squaredDistanceAtT0 < squaredDistanceAtT1) {
                return new Point(this.startX, this.startY, this.color)
            } else {
                return new Point(this.endX, this.endY, this.color)
            }
        }
    }
    addPoint(point) {
        if (point.x === this.startX && point.y === this.startY) {
            point.coefficient = 0
        } else if (point.x === this.endX && point.y === this.endY) {
            point.coefficient = 1
        } else {
            const videoLength = length(this.startX, this.startY, this.endX, this.endY)
            const lengthToPoint = length(this.startX, this.startY, point.x, point.y)
            point.coefficient = lengthToPoint / videoLength
        }
        this.points.push(point)
        point.setMenuElement(this.points, this.pointList)

        return point

        function length(ax, ay, bx, by) {
            return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
        }
    }
    setMenuElement(allVideos, ul) {
        this.menuElement = html`
            <li style="border: ${this.color.hex('#')} 3px solid">
                <div class="menu-video-title">
                    <input class="menu-video-name-input" placeholder="Название видео" value="${
                        this.name || `video-${allVideos.length}.mp4`
                    }" onclick="this.select()" />
                    <button class="remove-button">x</button>
                </div>
                <div class="video-angle">
                    <div class="angle-description">Стартовый угол</div>
                    <input id="start-angle" class="angle-input" type="number" min="0" max="359" value="0" />
                </div>
                <div class="video-angle">
                    <div class="angle-description">Угол соединения</div>
                    <input id="connection-angle" class="angle-input" type="number" min="15" max="180" value="90" />
                </div>
                <div class="point-list"></div>
            </li>
        `

        this.menuElement.query(".remove-button").addEventListener("click", () => {
            const index = allVideos.findIndex(video => Object.is(video, this))
            allVideos.splice(index, 1)[0].remove()
            ul.removeChild(this.menuElement)
            query("#count").textContent = allVideos.length
            this.points.forEach(point => point.remove())
        })


        this.pointList = this.menuElement.query(".point-list")

        return ul.appendChild(this.menuElement)
    }
    getName() {
        return this.menuElement.query(".menu-video-name-input").getAttribute("value")
    }
    startAngle() {
        return +this.menuElement.query("#start-angle").getAttribute("value")
    }
    connectionAngle() {
        return (+this.menuElement.query("#connection-angle").getAttribute("value"))
    }
    angle() {
        const angle =
            Math.atan2(this.endY - this.startY, this.endX - this.startX) * 180 / Math.PI + 90
        return (angle.int + 360) % 360
    }
    movePoint(point, x, y) {
        point.set(x, y)
        point.moveCircle()
        if (point.x === this.startX && point.y === this.startY) {
            point.coefficient = 0
        } else if (point.x === this.endX && point.y === this.endY) {
            point.coefficient = 1
        } else {
            const videoLength = length(this.startX, this.startY, this.endX, this.endY)
            const lengthToPoint = length(this.startX, this.startY, point.x, point.y)
            point.coefficient = lengthToPoint / videoLength
        }

        function length(ax, ay, bx, by) {
            return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
        }
    }
    exportPoints() {
        return this.points.map(({ x, y, name, nameEnglish, coefficient }) => ({ x, y, name, nameEnglish, coefficient }))
    }
}