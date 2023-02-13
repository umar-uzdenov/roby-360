function instruction(videoMap) {
    queryAll(".language-ru-selector").forEach(button =>
        button.addEventListener("click", () => toggleLanguage("en", "ru")))

    queryAll(".language-en-selector").forEach(button =>
        button.addEventListener("click", () => toggleLanguage("ru", "en")))

    function toggleLanguage(old, current) {
        for (const oldLanguage of queryAll(`.language-${old}-selector`)) {
            oldLanguage.classList.remove("current-language")
            oldLanguage.classList.add("other-language")
        }
        for (const currentLanguage of queryAll(`.language-${current}-selector`)) {
            currentLanguage.classList.remove("other-language")
            currentLanguage.classList.add("current-language")
        }

        for (const oldInstruction of queryAll(`.language-${old}`)) {
            oldInstruction.classList.add("invisible")
        }

        for (const newInstruction of queryAll(`.language-${current}`)) {
            newInstruction.classList.remove("invisible")
        }
    }

    queryAll(".hide-instructions").forEach(button => {
        button.addEventListener("click", async () => {
            try {
                instructionsIsOnDisplay = false

                query("#desktop-instructions").style = 'transition:.3s'
                query("#mobile-instructions").style = 'transition:.3s'
                query("#desktop-instructions").style = 'transition:.3s;opacity:0'
                query("#mobile-instructions").style = 'transition:.3s;opacity:0'

                setTimeout(() => {
                    query("#desktop-instructions").classList.add("invisible")
                    query("#mobile-instructions").classList.add("invisible")
                    query("#desktop-instructions").style = ''
                    query("#mobile-instructions").style = ''


                    query("#map-modal").style = "opacity:0"
                    query("#map-modal").classList.remove("invisible")
                    // setMinimapPosition(videoMap.current.lineSegment, 0)
                    query("#map-dot").style = `
                        top: ${-miniMap.top - 5}px;
                        left: ${-miniMap.left - 5}px;
                    `
                    query("#map-dot").style = ``
                    setTimeout(() => {
                        query("#map-modal").style = ''
                        query("#arrow-wrapper").classList.remove("hidden-arrow-wrapper")
                        if (detectMobile()) {
                            query("#menu-button").classList.remove("hidden-button")
                            query("#arrow-buttons").classList.remove("hidden-button")
                        } else {
                            openMenu()
                        }
                    }, 300)
                }, 300)

            } catch (error) {}
        })
    })
}