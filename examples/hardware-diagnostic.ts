// Hardware diagnostic only: preselected text uses numeric Unicode, so no
// Chinese string literal is passed through the known truncating compiler path.
// Uses the entire built-in 4808-character font, not the old small phrase font.
let temperature = 25
let alternate = false

function status() {
    if (tcOLED.lastError() != "") basic.showString("E")
    else led.plot(2, 2)
}

function showTemperature() {
    // 今天溫度 + 25/26 + ℃
    tcOLED.showLineCodePoints(3, [20170, 22825, 28331, 24230, 50, 48 + temperature % 10, 8451])
    status()
}

function showWords() {
    if (alternate) {
        // 歡迎光臨 / 請開始挑戰 / 學習真有趣
        tcOLED.showLineCodePoints(1, [27489, 36814, 20809, 33256])
        tcOLED.showLineCodePoints(2, [35531, 38283, 22987, 25361, 25136])
        tcOLED.showLineCodePoints(4, [23416, 32722, 30495, 26377, 36259])
    } else {
        // 你好世界 / 六年級 / 恭喜過關
        tcOLED.showLineCodePoints(1, [20320, 22909, 19990, 30028])
        tcOLED.showLineCodePoints(2, [20845, 24180, 32026])
        tcOLED.showLineCodePoints(4, [24685, 21916, 36942, 38364])
    }
    status()
}

tcOLED.start()
showWords()
showTemperature()

input.onButtonPressed(Button.A, function () {
    temperature = temperature == 25 ? 26 : 25
    showTemperature()
})
input.onButtonPressed(Button.B, function () {
    alternate = !alternate
    showWords()
})
