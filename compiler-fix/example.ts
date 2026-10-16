input.onButtonPressed(Button.A, function () {
    tcOLED.showLineNumber(3, "今天溫度", 26)
})
input.onButtonPressed(Button.B, function () {
    tcOLED.showLine(1, "歡迎來到學校")
})
tcOLED.start()
tcOLED.showLine(1, "你好世界")
tcOLED.showLine(2, "六年級")
tcOLED.showLineNumber(3, "今天溫度", 25)
tcOLED.showLine(4, "恭喜過關")
