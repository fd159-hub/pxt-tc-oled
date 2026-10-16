/** MIT. V2 only. Built-in Traditional Chinese font. */
//% color=#006D77 icon="\uf108" block="中文 OLED"
namespace tcOLED {
    let frame = pins.createBuffer(1024)
    let previous = pins.createBuffer(1024)
    let codeTable = pins.createBuffer(0)
    let offsets = pins.createBuffer(0)
    let tree = pins.createBuffer(0)
    let banks: Buffer[] = []
    let count = 0
    let ready = false
    let valid = false
    let address = 60
    let error = ""
    let missing = ""
    let sent = 0
    const BANK_GLYPHS = 640

    function command(values: number[]) {
        let data = pins.createBuffer(values.length + 1)
        for (let i = 0; i < values.length; i++) data[i + 1] = values[i]
        pins.i2cWriteBuffer(address, data, false)
    }
    function codeAt(index: number): number {
        return codeTable[index * 2] | (codeTable[index * 2 + 1] << 8)
    }
    /** Internal: font buffers are read-only static literals, never copied to RAM. */
    export function loadCommonFont(table: Buffer, positions: Buffer, nodes: Buffer, data: Buffer[]): boolean {
        let n = table.length >> 1
        if (table.length % 2 != 0 || n < 1 || n > 6000 || data.length != Math.ceil(n / BANK_GLYPHS)) {
            error = "FONT_SIZE"; return false
        }
        if (positions.length != table.length || nodes.length % 4 != 0 || nodes.length < 4 || nodes.length > 1020) { error = "FONT_SIZE"; return false }
        for (let i = 0; i < nodes.length; i += 2) {
            let child = nodes[i] | (nodes[i + 1] << 8)
            if ((child >= 32768 && child > 33023) || (child < 32768 && (child <= (i >> 2) || child >= nodes.length / 4))) { error = "FONT_FORMAT"; return false }
        }
        for (let i = 0; i < n; i++) {
            let c = table[i * 2] | (table[i * 2 + 1] << 8)
            let prior = i ? table[(i - 1) * 2] | (table[(i - 1) * 2 + 1] << 8) : 0
            if (c < 32 || (c >= 0xd800 && c <= 0xdfff) || (i > 0 && c <= prior)) { error = "FONT_FORMAT"; return false }
            let bank = Math.floor(i / BANK_GLYPHS)
            let pos = positions[i * 2] | (positions[i * 2 + 1] << 8)
            let prev = i ? positions[(i - 1) * 2] | (positions[(i - 1) * 2 + 1] << 8) : 0
            if (pos >= data[bank].length || (i % BANK_GLYPHS == 0 ? pos != 0 : pos <= prev)) { error = "FONT_FORMAT"; return false }
        }
        codeTable = table; offsets = positions; tree = nodes; banks = data; count = n; error = ""
        return true
    }
    function unpack(index: number): Buffer {
        let bankNumber = Math.floor(index / BANK_GLYPHS)
        let bank = banks[bankNumber]
        let start = offsets[index * 2] | (offsets[index * 2 + 1] << 8)
        let end = index + 1 < count && (index + 1) % BANK_GLYPHS != 0 ? offsets[(index + 1) * 2] | (offsets[(index + 1) * 2 + 1] << 8) : bank.length
        let bit = start * 8
        let glyph = pins.createBuffer(32)
        for (let i = 0; i < 32; i++) {
            let node = 0
            while (node < 32768) {
                if (bit >= end * 8) { error = "FONT_FORMAT"; return pins.createBuffer(0) }
                let side = (bank[bit >> 3] >> (7 - (bit & 7))) & 1
                bit++
                let at = node * 4 + side * 2
                node = tree[at] | (tree[at + 1] << 8)
            }
            glyph[i] = node & 255
        }
        return glyph
    }
    function find(code: number): number {
        let lo = 0
        let hi = count - 1
        while (lo <= hi) {
            let mid = (lo + hi) >> 1
            let c = codeAt(mid)
            if (c == code) return mid
            if (c < code) lo = mid + 1
            else hi = mid - 1
        }
        return -1
    }
    //% block="啟用中文 OLED" weight=110
    export function start() { startAt(60) }
    //% block="啟用中文 OLED 位址 $addr" addr.defl=60 advanced=true
    export function startAt(addr: number) {
        if (addr != 60 && addr != 61) { error = "ADDRESS"; return }
        if (!tcFont.install()) return
        address = addr
        command([0xae,0xd5,0x80,0xa8,0x3f,0xd3,0,0x40,0x8d,0x14,0x20,0,0xa1,0xc8,0xda,0x12,0x81,0xcf,0xd9,0xf1,0xdb,0x40,0xa4,0xa6,0xaf])
        ready = true; valid = false
        clearScreen()
    }
    function pixel(x: number, y: number) {
        if (x >= 0 && x < 128 && y >= 0 && y < 64) frame[(y >> 3) * 128 + x] |= 1 << (y & 7)
    }
    function draw(x: number, y: number, text: string, points: number[] = null) {
        let length = points ? points.length : text.length
        for (let i = 0; i < length; i++) {
            let c = points ? points[i] : text.charCodeAt(i)
            let index = find(c)
            let width = c < 127 ? 8 : 16
            if (index < 0) {
                error = "MISSING_GLYPH"
                let ch = points ? String.fromCharCode(c) : text.charAt(i)
                if (missing.indexOf(ch) < 0) missing = missing + ch
                for (let a = 0; a < width - 1; a++) { pixel(x + a, y); pixel(x + a, y + 14) }
                for (let b = 0; b < 15; b++) { pixel(x, y + b); pixel(x + width - 2, y + b) }
            } else {
                let glyph = unpack(index)
                if (glyph.length != 32) return
                for (let col = 0; col < width; col++) for (let row = 0; row < 16; row++) {
                    if (glyph[(row >> 3) * width + col] & (1 << (row & 7))) pixel(x + col, y + row)
                }
            }
            x += width
        }
    }
    function lineOK(line: number, text: string): boolean {
        if (!ready) { error = "NOT_INITIALIZED"; return false }
        if (line != Math.floor(line) || line < 1 || line > 4) { error = "LINE_RANGE"; return false }
        let width = 0
        for (let i = 0; i < text.length; i++) {
            let c = text.charCodeAt(i)
            if (c < 32) { error = "TEXT_CONTROL"; return false }
            width += c < 127 ? 8 : 16
        }
        if (width > 128) { error = "LINE_OVERFLOW"; return false }
        error = ""; missing = ""
        let offset = (line - 1) * 256
        for (let i = 0; i < 256; i++) frame[offset + i] = 0
        return true
    }
    /** 直接輸入中文、英文或數字。中文限內建常用字庫，每行最多8個全形字。 */
    //% blockHidden=true
    //% line.defl=1 line.min=1 line.max=4 text.defl="你好世界"
    export function showLine(line: number, text: string) {
        if (!lineOK(line, text)) return
        draw(0, (line - 1) * 16, text)
        show()
    }
    /** Developer diagnostic: numeric Unicode bypasses native string literals.
     * No student block is exposed; free Chinese input remains unverified.
     */
    export function showLineCodePoints(line: number, points: number[]) {
        let width = 0
        for (let i = 0; i < points.length; i++) {
            let c = points[i]
            if (c != Math.floor(c) || c < 32 || c > 65535 || (c >= 55296 && c <= 57343)) { error = "CODE_RANGE"; return }
            width += c < 127 ? 8 : 16
        }
        if (width > 128) { error = "LINE_OVERFLOW"; return }
        if (!lineOK(line, "")) return
        draw(0, (line - 1) * 16, "", points)
        show()
    }
    //% blockHidden=true
    //% line.defl=3 line.min=1 line.max=4 text.defl="今天溫度" value.defl=25
    export function showLineNumber(line: number, text: string, value: number) { showLine(line, text + value) }
    /** English, numbers and ASCII punctuation only. */
    //% block="第 $line 行顯示英數 $text" weight=85
    //% line.defl=1 line.min=1 line.max=4 text.defl="Hello 123"
    export function showAsciiLine(line: number, text: string) {
        for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) < 32 || text.charCodeAt(i) > 126) { error = "ASCII_ONLY"; return }
        showLine(line, text)
    }
    //% block="清除第 $line 行" weight=80
    //% line.defl=1 line.min=1 line.max=4
    export function clearLine(line: number) { showLine(line, "") }
    //% block="清除全部畫面" weight=70
    export function clearScreen() {
        if (!ready) { error = "NOT_INITIALIZED"; return }
        frame.fill(0); error = ""; missing = ""; show()
    }
    function show() {
        sent = 0
        for (let page = 0; page < 8; page++) {
            let col = 0
            let offset = page * 128
            while (col < 128) {
                if (valid && frame[offset + col] == previous[offset + col]) { col++; continue }
                let begin = col
                while (col < 128 && (!valid || frame[offset + col] != previous[offset + col])) col++
                command([0x21,begin,col-1,0x22,page,page])
                for (let at = begin; at < col; at += 16) {
                    let n = Math.min(16, col - at)
                    let b = pins.createBuffer(n + 1); b[0] = 0x40
                    for (let j = 0; j < n; j++) b[j + 1] = frame[offset + at + j]
                    pins.i2cWriteBuffer(address, b, false); sent += n
                }
            }
        }
        for (let i = 0; i < 1024; i++) previous[i] = frame[i]
        valid = true
    }
    //% block="OLED 錯誤代碼" advanced=true
    export function lastError(): string { return error }
    //% block="OLED 缺少的字" advanced=true
    export function missingCharacters(): string { return missing }
    //% block="上次更新資料位元組數" advanced=true
    export function bytesSent(): number { return sent }
}
