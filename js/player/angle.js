const Angle = (function() {
    const private = {}
    const public = {}

    private.camera = null // late init
    private.videoMap = null // late init
    private.previousAngle = 0 // late init
    
    private.angleValue = 0
    private.angleZero = 0
    private.angleVideo = 0

    function updateAngle() {
        private.angleValue = +(
            (private.camera.rotation.y + private.angleVideo - private.angleZero)
            / Math.PI * 180 + 3600
        ).toFixed(0) % 360
        miniMap.angle = private.angleValue
        displayAngle(private.angleValue)
    }


    public.setCamera = camera => {
        if (private.camera === null) {
            private.camera = camera
            private.camera.rotation.order = "YXZ"
        } else throw "Camera already defined"
    }

    public.setVideoMap = videoMap => {
        if (private.videoMap === null) {
            private.videoMap = videoMap
            private.videoMap.angle = 270 
            private.angleZero = private.videoMap.angle / 180 * Math.PI
            private.angleVideo = private.videoMap.current.angle / 180 * Math.PI
            public.rotateDegrees(private.videoMap.angle)
            // console.log(private.angleValue)
        } else throw "Video map already defined"
    }

    public.rotateDegrees = (degrees, update = true) => {
        private.camera.rotateOnWorldAxis(
            new THREE.Vector3(0.0, 1.0, 0.0),
            (degrees + 3600) % 360 / 180 * Math.PI
        )
        if (update) updateAngle()
    }

    public.rotateRadians = radians => {
        private.camera.rotateOnWorldAxis(new THREE.Vector3(0.0, 1.0, 0.0), radians)
        updateAngle()
    }

    public.getAngle = () => private.angleValue
    public.getVerticalAngle = () => private.camera.rotation.x * 180 / Math.PI

    public.isLookingFront = () => {
        const relativeAngle = (private.angleValue - private.videoMap.current.angle + 3600) % 360
        return relativeAngle <= 90 || relativeAngle >= 270
    }

    public.fixAngle = () => {
        private.previousAngle = private.videoMap.current.angle
    }

    public.rotateToNew = () => {
        private.angleVideo = private.videoMap.current.angle / 180 * Math.PI
        public.rotateDegrees(private.previousAngle)
        public.rotateDegrees(-private.videoMap.current.angle)
    }

    return public
})();