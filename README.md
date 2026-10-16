# 中文 OLED：學生詞句選單版

> **新增：學生直接輸入中文**請使用 [UTF-8 修正版教學編輯器](https://fd159-hub.github.io/pxt-tc-oled/?lang=zh-TW)。新建專案即內建中文 OLED 與常用字庫，文字框可以自行填寫中文，不需要產生器。[使用步驟與驗證界線](compiler-fix/README.md)。以下說明仍是官方 MakeCode 適用的 v0.2.0 詞句選單版；官方網站尚未套用編譯修正。

**發布狀態：已公開，官方 MakeCode 網址匯入與 HEX 重新匯入測試通過。** 請在現有專案的「擴展」貼上以下網址，加入擴充即可保留原有積木；本機 `.mkcd` 另作為新專案範例。

```text
https://github.com/fd159-hub/pxt-tc-oled
```

micro:bit **V2**、SSD1306 **128×64** I²C OLED，預設位址 **0x3C**。內建 4,808 個常用國字及英文、數字、標點，共 4,943 字形。採用 Noto Sans TC 16×16 點陣及無損壓縮，支援局部更新，學生不需要字庫產生器。

**本版提供 24 組固定中文詞句選單，尚不支援在文字框自由輸入中文。** 完整字庫不等於學生介面已能自由組字；英數輸入積木只供 ASCII 英文、數字及基本標點使用。

固定版本：`v0.2.0`。若要先看完整的四行中文及 A／B 範例，可使用隨交付資料提供的 `oled-student-example-v0.2.0.mkcd`；它引用相同的 GitHub 版本。一般學生既有專案使用下列擴充網址加入方式。

## 加入現有學生專案

1. 開啟原本的 [MakeCode micro:bit 專案](https://makecode.microbit.org/)。
2. 點選「擴展／擴充功能」，在搜尋框貼上 `https://github.com/fd159-hub/pxt-tc-oled`。
3. 點選 `tc-oled` 卡片，工具箱會新增「中文 OLED」。
4. 在「當啟動時」放入「啟用中文 OLED」，再使用「第 1 行顯示中文 你好世界」。
5. 下載到 micro:bit V2。

這是加入擴充套件，不需要匯入新範例來取代原本專案。請使用原本的 MakeCode 專案操作；不要把原始碼 ZIP 當成可直接加入的擴充套件。

## 學生需要的積木

| 積木 | 用途 |
| --- | --- |
| 啟用中文 OLED | 自動載入常用字庫並初始化螢幕 |
| 第 n 行顯示中文〔詞句〕 | 選擇中文詞句，自動更新該行 |
| 第 n 行顯示中文〔詞句〕數字〔數值〕 | 例如「今天溫度25」，可接溫度或變數積木 |
| 第 n 行顯示英數〔文字〕 | 顯示英文、數字及 ASCII 標點；不能填中文 |
| 清除第 n 行 | 只清除指定行 |
| 清除全部畫面 | 清除所有四行 |

行號為 **1～4**，不需要理解 x、y 或 I²C。每行最多 8 個全形字或 16 個半形字；中文混排數字也計入寬度。更換內容會自動擦除舊尾字，只傳送有改變的畫面資料。

## 中文選單內容

你好世界、六年級、今天溫度、恭喜過關、歡迎光臨、請開始挑戰、學習真有趣、同學你好、準備開始、遊戲開始、遊戲結束、再試一次、你真棒、繼續加油、目前得分、剩餘時間、目前次數、光線強度、目前溫度、答對了、答錯了、請按A鍵、請按B鍵、謝謝大家。

## MakeCode 範例

```blocks
tcOLED.start()
tcOLED.showCommonLine(1, TCText.Hello)
tcOLED.showCommonLine(2, TCText.Grade)
tcOLED.showCommonLineNumber(3, TCText.Temperature, 25)
tcOLED.showCommonLine(4, TCText.Success)
```

## 驗證界線

- 固定診斷 HEX 的四行中文及 A／B 切換，已由使用者回報實機通過，對應檔案雜湊及範圍見 `HARDWARE-ACCEPTANCE.md`。
- 學生介面有 21 項自動化檢查，包含全部 4,943 字形、24 組詞句、數值混排、長度與缺字檢查、局部更新及錯誤處理。
- TypeScript 與積木轉換通過；相依套件方式的 V2 原生編譯通過，學生範例剩餘 Flash 20,796 bytes。官方 MakeCode v9.0.12 已實際載入 GitHub `v0.2.0` 範例、顯示六種學生積木並成功下載 HEX，11 個字庫資料常值均存在於 V2 韌體；也已在具有變數、按鈕事件及無限迴圈的專案中加入 GitHub 擴充，確認程式結構保留，下載的 HEX 重新匯入後亦能恢復。最後驗證狀態見 `tests/` 及 `TEST-REPORT.md`。
- **學生介面與重新編譯的版本尚未取得新的實機回報。** 不把舊診斷 HEX 的通過結論直接當成學生版驗收。
- 官方編譯路徑仍有中文字串截斷問題，因此未完成的自由中文輸入積木已隱藏。這個版本用詞句選單及數值 Unicode 避開該問題。
- 不能保證所有其他擴充套件都能與完整字庫一起放入 Flash；容量不足時需調整專案。詳細數據見測試報告。
- 無 I²C 裝置斷線／ACK 診斷；沒有 OLED 模擬畫面，需下載到實體設備確認。
- 若既有專案已內嵌舊版 `tcOLED` 原始碼，或裝有同名命名空間的擴充，不能直接重複加入；舊版積木自動移轉尚未實作。

## 授權

程式碼採 MIT；Noto Sans TC 及衍生點陣保留 SIL OFL 1.1，見 `LICENSE`、`OFL.txt`。常用字表來源及字型雜湊記錄於 `tests/font-manifest.json`。

```package
tc-oled=github:fd159-hub/pxt-tc-oled
```

## Supported targets

* for PXT/microbit
