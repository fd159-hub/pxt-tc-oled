/** Dropdown labels stay in the editor; firmware uses numeric Unicode. */
enum TCText {
    //% block="你好世界"
    Hello = 0,
    //% block="六年級"
    Grade = 1,
    //% block="今天溫度"
    Temperature = 2,
    //% block="恭喜過關"
    Success = 3,
    //% block="歡迎光臨"
    Welcome = 4,
    //% block="請開始挑戰"
    Challenge = 5,
    //% block="學習真有趣"
    Learning = 6,
    //% block="同學你好"
    HelloClass = 7,
    //% block="準備開始"
    Ready = 8,
    //% block="遊戲開始"
    GameStart = 9,
    //% block="遊戲結束"
    GameOver = 10,
    //% block="再試一次"
    TryAgain = 11,
    //% block="你真棒"
    Great = 12,
    //% block="繼續加油"
    KeepGoing = 13,
    //% block="目前得分"
    Score = 14,
    //% block="剩餘時間"
    TimeLeft = 15,
    //% block="目前次數"
    Count = 16,
    //% block="光線強度"
    Light = 17,
    //% block="目前溫度"
    Temp = 18,
    //% block="答對了"
    Correct = 19,
    //% block="答錯了"
    Incorrect = 20,
    //% block="請按A鍵"
    PressA = 21,
    //% block="請按B鍵"
    PressB = 22,
    //% block="謝謝大家"
    ThankYou = 23,
}
namespace tcOLED {
    function commonPoints(phrase: TCText): number[] {
        if (phrase == TCText.Hello) return [20320, 22909, 19990, 30028]
        if (phrase == TCText.Grade) return [20845, 24180, 32026]
        if (phrase == TCText.Temperature) return [20170, 22825, 28331, 24230]
        if (phrase == TCText.Success) return [24685, 21916, 36942, 38364]
        if (phrase == TCText.Welcome) return [27489, 36814, 20809, 33256]
        if (phrase == TCText.Challenge) return [35531, 38283, 22987, 25361, 25136]
        if (phrase == TCText.Learning) return [23416, 32722, 30495, 26377, 36259]
        if (phrase == TCText.HelloClass) return [21516, 23416, 20320, 22909]
        if (phrase == TCText.Ready) return [28310, 20633, 38283, 22987]
        if (phrase == TCText.GameStart) return [36938, 25138, 38283, 22987]
        if (phrase == TCText.GameOver) return [36938, 25138, 32080, 26463]
        if (phrase == TCText.TryAgain) return [20877, 35430, 19968, 27425]
        if (phrase == TCText.Great) return [20320, 30495, 26834]
        if (phrase == TCText.KeepGoing) return [32380, 32396, 21152, 27833]
        if (phrase == TCText.Score) return [30446, 21069, 24471, 20998]
        if (phrase == TCText.TimeLeft) return [21097, 39192, 26178, 38291]
        if (phrase == TCText.Count) return [30446, 21069, 27425, 25976]
        if (phrase == TCText.Light) return [20809, 32218, 24375, 24230]
        if (phrase == TCText.Temp) return [30446, 21069, 28331, 24230]
        if (phrase == TCText.Correct) return [31572, 23565, 20102]
        if (phrase == TCText.Incorrect) return [31572, 37679, 20102]
        if (phrase == TCText.PressA) return [35531, 25353, 65, 37749]
        if (phrase == TCText.PressB) return [35531, 25353, 66, 37749]
        if (phrase == TCText.ThankYou) return [35613, 35613, 22823, 23478]
        return [-1]
    }
    /** 從選單選中文詞句；自動局部更新。 */
    //% block="第 $line 行顯示中文 $phrase" weight=100
    //% line.defl=1 line.min=1 line.max=4 phrase.defl=TCText.Hello
    export function showCommonLine(line: number, phrase: TCText) {
        tcOLED.showLineCodePoints(line, commonPoints(phrase))
    }
    /** 中文詞句後接數字，例如今天溫度25。 */
    //% block="第 $line 行顯示中文 $phrase 數字 $value" weight=95
    //% line.defl=3 line.min=1 line.max=4 phrase.defl=TCText.Temperature value.defl=25
    export function showCommonLineNumber(line: number, phrase: TCText, value: number) {
        let points = commonPoints(phrase)
        let numberText = "" + value
        for (let i = 0; i < numberText.length; i++) points.push(numberText.charCodeAt(i))
        tcOLED.showLineCodePoints(line, points)
    }
}

