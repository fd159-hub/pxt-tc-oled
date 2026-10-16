let temperature = 25
tcOLED.start()
tcOLED.showCommonLine(1, TCText.Hello)
tcOLED.showCommonLine(2, TCText.Grade)
tcOLED.showCommonLineNumber(3, TCText.Temperature, temperature)
tcOLED.showCommonLine(4, TCText.Success)
input.onButtonPressed(Button.A, function () {
    if (temperature == 25) temperature = 26
    else temperature = 25
    tcOLED.showCommonLineNumber(3, TCText.Temperature, temperature)
})
input.onButtonPressed(Button.B, function () {
    tcOLED.showCommonLine(1, TCText.Welcome)
    tcOLED.showCommonLine(2, TCText.Challenge)
    tcOLED.showCommonLine(4, TCText.Learning)
})
