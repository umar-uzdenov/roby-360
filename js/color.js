class Color {
    constructor(red, green, blue) {
        if (red < 0) red = 0
        if (red > 255) red = 255
        if (green < 0) green = 0
        if (green > 255) green = 255
        if (blue < 0) blue = 0
        if (blue > 255) blue = 255

        this.red = red
        this.green = green
        this.blue = blue
    }
    static random(min = 0, max = 255) {
        // ololo
        if (min < 0) min = 0
        if (max > 255) max = 255
        min = min.int
        max = max.int

        let red = random(min, max)
        let green = random(min, max)
        let blue = random(min, max)

        const randomSubColor = random(0, 2)
        
        if (random(0, 2) == 1) red = 0
        if (random(0, 2) == 1) green = 0
        if (random(0, 2) == 1) blue = 0

        return new Color(red, green, blue)

        function random(min, max) {
            return +(Math.random() * (max - min)).int % max + min + 1
        }
    }
    rgb() {
        return `rgb(${this.red}, ${this.green}, ${this.blue})`
    }
    hex(prefix = '') {
        return `${prefix}${hex(this.red)}${hex(this.green)}${hex(this.blue)}`
        function hex(number) {
            return number.toString(16).padStart(2, '0')
        }
    }
    inverse(brightness = 0) {
        return new Color(
            255 - this.red + brightness,
            255 - this.green + brightness,
            255 - this.blue + brightness
        )
    }
}