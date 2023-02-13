
class VideoCollection {
    constructor(svgElement, countElement, ulElement) {
        this.svgElement = svgElement
        this.countElement = countElement
        this.ulElement = ulElement

        this.videoArrows = []
        this.current = null
    }
    loadFrom(videoMap) {
        this.videoArrows.length = 0

        for (const video of videoMap.videos) {
            const videoArrow = new VideoArrow(video.lineSegment.startX, video.lineSegment.startY)
            videoArrow.setName(video.name)
            videoArrow.setEnd(video.lineSegment.endX, video.lineSegment.endY)
            this.add(videoArrow)
            videoArrow.setPoints(video.points)
        }
    }
    add(videoArrow) {
        this.videoArrows.push(videoArrow)
        this.adjustLastStart()
        this.countElement.textContent = this.videoArrows.length
        videoArrow.setSvgElement(this.svgElement)
        this.svgElement.appendChild(videoArrow.polygon)
        videoArrow.setMenuElement(this.videoArrows, this.ulElement)
    }
    adjustLastStart(last = this.last()) { // todo: rewrite function to find closest
        if (this.videoArrows.length < 2) return
        if (!last) return

        for (const video of this.videoArrows) {
            if (Object.is(video, last)) continue

            if (this.isClose(last.startX, video.startX, last.startY, video.startY)) {
                return last.setStart(video.startX, video.startY)
            }
            if (this.isClose(last.startX, video.endX, last.startY, video.endY)) {
                return last.setStart(video.endX, video.endY)
            }
        }
    }
    adjustLastEnd(last = this.last()) { // todo: rewrite function to find closest
        if (this.videoArrows.length < 2) return
        if (!last) return

        for (const video of this.videoArrows) {
            if (Object.is(video, last)) continue

            if (this.isClose(last.endX, video.startX, last.endY, video.startY)) {
                return last.setEnd(video.startX, video.startY)
            }
            if (this.isClose(last.endX, video.endX, last.endY, video.endY)) {
                return last.setEnd(video.endX, video.endY)
            }
        }
    }
    isClose(lastX, videoX, lastY, videoY) {
        return Math.abs(lastX - videoX) < 30 && Math.abs(lastY - videoY) < 30
    }
    last() {
        return this.videoArrows[this.videoArrows.length - 1]
    }
    select(x, y, shiftDown) {
        // return console.log(x, y)
        for (const videoArrow of this.videoArrows) {
            if (Math.abs(videoArrow.endX - x) < 20 && Math.abs(videoArrow.endY - y) < 20) {
                this.current = videoArrow
                this.movingPoint = "end"
                return this.moveVideos(x, y, shiftDown)
            }
        }
        for (const videoArrow of this.videoArrows) {
            if (Math.abs(videoArrow.startX - x) < 20 && Math.abs(videoArrow.startY - y) < 20) {
                this.current = videoArrow
                this.movingPoint = "start"
                return this.moveVideos(x, y, shiftDown)
            }
        }
    }
    unselect() {
        this.adjustLastStart(this.current)
        this.adjustLastEnd(this.current)
        this.current = null
        this.movingPoint = null
    }
    moveVideos(x, y, shiftDown) {
        if (this.current === null) return

        if (this.movingPoint === "end") {
            const { endX, endY } = this.current

            this.current.setEnd(x, y, shiftDown)

            for (const videoArrow of this.videoArrows) {
                if (Object.is(videoArrow, this.current)) continue

                if (videoArrow.endX === endX && videoArrow.endY === endY) {
                    videoArrow.setEnd(this.current.endX, this.current.endY)
                } else if (videoArrow.startX === endX && videoArrow.startY === endY) {
                    videoArrow.setStart(this.current.endX, this.current.endY)
                }
            }
        } else if (this.movingPoint === "start") {
            const { startX, startY } = this.current

            this.current.setStart(x, y, shiftDown)

            for (const videoArrow of this.videoArrows) {
                if (Object.is(videoArrow, this.current)) continue

                if (videoArrow.startX === startX && videoArrow.startY === startY) {
                    videoArrow.setEnd(this.current.startX, this.current.startY)
                } else if (videoArrow.startX === startX && videoArrow.startY === startY) {
                    videoArrow.setStart(this.current.startX, this.current.startY)
                }
            }
        }
    }
    findClosestVideo(point) {
        let closestVideo = this.videoArrows[0]
        let closestDistance = Infinity
        for (const [index, video] of this.videoArrows.entries()) {
            const { startX, startY, endX, endY } = video
            // Calculate the distance between the point and the line using the distance formula
            const distance = Math.abs((endY - startY) * point.x - (endX - startX) * point.y + endX * startY - endY * startX) / Math.sqrt((endY - startY) ** 2 + (endX - startX) ** 2)
            if (distance < closestDistance) {
                closestVideo = video
                closestDistance = distance
            }
        }
        
        if (closestDistance > 20) return null

        const closestPoint = closestVideo.findClosestPointTo(point)

        return closestVideo.addPoint(closestPoint)
    }
    selectPoint(x, y) {
        let closestDistance = Infinity
        let closestPoint = null
        let closestVideo = null

        for (const video of this.videoArrows) {
            for (const point of video.points) {
                const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2)
                if (distance < closestDistance) {
                    closestDistance = distance
                    closestPoint = point
                    closestVideo = video
                }
            }
        }

        if (closestDistance > 20) return null
        
        this.currentVideo = closestVideo
        this.currentPoint = closestPoint

        return { video: closestVideo, point: closestPoint }
    }
    unselectPoint() {
        this.currentVideo = null
        this.currentPoint = null
    }
    movePoint(x, y) {
        if (this.currentVideo == null || this.currentPoint == null) return

        // console.log("trying to move point")

        const newPosition = this.currentVideo.findClosestPointTo({ x, y })
        this.currentVideo.movePoint(this.currentPoint, newPosition.x, newPosition.y)
    }
    findFirst() {
        for (const [index, video] of this.videoArrows.entries()) video.id = index

        loop: for (const first of this.videoArrows) {
            for (const second of this.videoArrows) {
                if (Object.is(first, second)) continue

                if (first.startX === second.startX && first.startY === second.startY) continue loop
                if (first.startX === second.endX && first.startY === second.endY) continue loop
            }
            return first.id
        }
    }
    export() {
        const result = []

        for (const [index, video] of this.videoArrows.entries()) video.id = index

        for (const video of this.videoArrows) {
            const jsonVideo = {
                id: video.id,
                name: video.getName(),
                blob: null,
                angle: video.angle(),
                points: video.exportPoints(),
                startConnections: this.findStartConnections(video),
                endConnections: this.findEndConnections(video),
                lineSegment: {
                    startX: video.startX, startY: video.startY,
                    endX: video.endX, endY: video.endY,
                }
            }
            result.push(jsonVideo)
        }

        return result
    }
    findStartConnections(video) {
        const result = []

        for (const another of this.videoArrows) {
            if (Object.is(another, video)) continue

            if (video.startX === another.startX && video.startY === another.startY) {
                result.push({
                    videoId: another.id,
                    type: "start",
                    angle: another.angle()
                })
            }
            if (video.startX === another.endX && video.startY === another.endY) {
                result.push({
                    videoId: another.id,
                    type: "end",
                    angle: another.angle() + 180
                })
            }
        }

        this.checkConnections(result, video.connectionAngle())

        return result
    }
    findEndConnections(video) {
        const result = []

        for (const another of this.videoArrows) {
            if (Object.is(another, video)) continue

            if (video.endX === another.startX && video.endY === another.startY) {
                result.push({
                    videoId: another.id,
                    type: "start",
                    angle: another.angle()
                })
            }
            if (video.endX === another.endX && video.endY === another.endY) {
                result.push({
                    videoId: another.id,
                    type: "end",
                    angle: another.angle() + 180
                })
            }
        }

        this.checkConnections(result, video.connectionAngle())

        return result
    }
    checkConnections(connections, maxAngle) {
        for (const connection of connections) {
            connection.angle = connection.angle % 360
            connection.startAngle = (connection.angle + 360) % 360
            connection.endAngle = (connection.angle + 360) % 360
        }
        for (let angle = 0; angle < maxAngle; angle++) {
            for (const connection of connections) {
                connection.startAngle = (connection.startAngle - 0.5 + 360) % 360
                connection.endAngle = (connection.endAngle + 0.5) % 360
            }
            for (const first of connections) {
                for (const second of connections) {
                    if (Object.is(first, second)) continue

                    if (first.startAngle == second.endAngle) {
                        first.startAngle = Math.round(first.startAngle + 0.5) % 360
                        second.endAngle = Math.round(second.endAngle - 0.5 + 360) % 360
                    }
                    if (second.startAngle == first.endAngle) {
                        second.startAngle = Math.round(second.startAngle + 0.5) % 360
                        first.endAngle = Math.round(first.endAngle - 0.5 + 360) % 360 
                    }

                }
            }
        }
        for (const connection of connections) {
            connection.startAngle = Math.round(connection.startAngle)
            connection.endAngle = Math.round(connection.endAngle)
        }
    }
}
