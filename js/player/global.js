const miniMap = {
    top: 0,
    left: 0,
    angle: 0,
    width: 1,
    height: 1,
    resultWidth: 1,
    resultHeight: 1,
    status: false,
    get coefficient() { return this.resultWidth / this.width }
}

let instructionsIsOnDisplay = true