
class Point {
    constructor(x, y, color, name = "", nameEnglish = "") {
        this.x = x
        this.y = y
        this.name = name
        this.nameEnglish = nameEnglish
        this.coefficient = null

        this.circle = document.createElementNS(NS, "circle")
        this.circle.setAttribute("r", "7")
        this.circle.setAttribute("fill", color.inverse(128).hex('#'))
        this.circle.setAttribute("stroke", color.rgb())
        this.circle.setAttribute("stroke-width", "2")
        this.moveCircle()
    }
    static loadFrom(startX, startY, endX, endY, coefficient, color, name) {
        const x = (endX - startX) * coefficient + startX
        const y = (endY - startY) * coefficient + startY
        return new Point(x, y, color, name)
    }
    set(x, y) {
        this.x = x
        this.y = y
    }
    moveCircle() {
        this.circle.setAttribute("cx", `${this.x}`)
        this.circle.setAttribute("cy", `${this.y}`)
        this.circle.cx.baseVal.value = this.x
        this.circle.cy.baseVal.value = this.y
    }
    setMenuElement(allPoints, list) {
        const menuPoint = html`
            <div class="menu-point-title">
                <input
                    class="language-ru"
                    placeholder= "Точка интереса"
                    value="${this.name}"
                    onclick="this.select()"
                />
                <input
                    class="language-en"
                    placeholder="Point of interest"
                    value="${this.nameEnglish}"
                    onclick="this.select()"
                />
                <button class="remove-button">x</button>
            </div>
        `

        menuPoint.query("input.language-ru").addEventListener("input", event => {
            this.name = event.target.value
            console.log("russian name is ", this.name)
        })

        menuPoint.query("input.language-en").addEventListener("input", event => {
            this.nameEnglish = event.target.value
            console.log("english name is ", this.name)
        })

        menuPoint.query(".remove-button").addEventListener("click", () => {
            const index = allPoints.findIndex(video => Object.is(video, this))
            allPoints.splice(index, 1)[0].remove()
            list.removeChild(menuPoint)
        })

        return list.appendChild(menuPoint)
    }
    remove() {
        this.circle.parentNode.removeChild(this.circle)
    }
}