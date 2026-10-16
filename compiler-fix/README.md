# 中文 OLED 自由輸入：UTF-8 編譯修正

學生入口：https://fd159-hub.github.io/pxt-tc-oled/?lang=zh-TW

這是基於 PXT 的非官方教學編輯器，內建常用中文字庫及自由輸入積木。**原本的官方 MakeCode 網站尚未套用這個修正**；根目錄的 v0.2.0 擴充仍保留詞句選單介面。

## 學生操作

1. 使用上方修正版網址，按「新建專案」。
2. 預設已有「啟用中文 OLED」及「第 1 行顯示文字」。
3. 點文字框，改成自己的中文，例如「歡迎來到學校」。
4. 按「下載」，將 HEX 複製到 micro:bit V2。
5. 下次直接開啟同一專案修改文字；不用更新字庫、不用重做積木。需要備份時可下載 HEX，於同一修正版編輯器匯入恢復。

常用國字 4,808 字，加上英數與符號共 4,943 字形。自由輸入仍受內建字庫範圍限制，罕用字以方框顯示，可用進階錯誤積木查詢缺字。每行最多 8 個全形字或 16 個半形字，共四行。數字混排可使用「第 n 行顯示文字…數字…」，修改內容仍採差異更新。

直接測試：[四行加 A/B 的 HEX](oled-free-input-test-v2.hex)，或在修正版匯入 [積木範例 MKCD](oled-free-input-example.mkcd)。A 將 25 改為 26，B 將第一行改為「歡迎來到學校」。

不同網站的瀏覽器專案儲存空間分開，原官方網站的專案不會自動出現在此處。先在原網站備份，再匯入修正版；已有的 v0.2.0 詞句積木仍可使用。**舊 GitHub 相依套件自動替換成內建自由輸入版尚未實作**，請勿刪掉原專案。新建專案會直接使用內建版。

## 問題與修正

PXT `getCompileOptionsAsync` 切換 micro:bit 編譯變體時，直接使用 `pxt.appTarget.compile`，覆蓋 `getTargetOptions()` 已計入的套件 `utf8: true`。結果原生 runtime 與組合語言字串編碼不一致，中文字串被截斷。

修正是切換變體之後重新呼叫 `this.getTargetOptions()`。這保留當前變體設定，同時重新套用套件選項；沒有全域強制所有專案使用 UTF-8。概念來源差異見 `utf8-variant.patch`。實際 npm 發行包沒有原始 TypeScript，因此建置程式會對已編譯 CLI 及四個網頁 bundle 套用等價替換，找不到預期模式就停止。

`utf8-variant.patch` 已對 [PXT v13.0.1 官方原始碼](https://github.com/microsoft/pxt/blob/v13.0.1/pxtlib/package.ts#L1189) 通過 `git apply --check`；這是本地驗證的修正檔，尚未提交或合併至上游。

網站新增的變動：內建 `tc-oled` 自由輸入介面、預設積木、繁體中文介面、非官方標示。無 OLED 模擬畫面。編譯可能需要網路與上游 MakeCode 編譯服務；下載到 micro:bit 後的 OLED 顯示不依賴伺服器。

## 重建（維護者，Windows PowerShell）

安裝 Node.js LTS。於 repository 根目錄執行：

```powershell
$env:OLED_BUILD_ROOT = Join-Path $PWD 'compiler-fix/.editor-work'
$env:OLED_OUTPUT_ROOT = Join-Path $PWD 'compiler-fix/.editor-output'
npm install --prefix "$env:OLED_BUILD_ROOT/pxt" --save-exact pxt-microbit@9.1.1 pxt-core@13.0.1 pxt-common-packages@14.0.2
node compiler-fix/build.cjs
node compiler-fix/fetch-translations.cjs
```

固定直接相依套件版本；`package-lock.reference.json` 記錄本次驗證環境的遞迴相依解析，首次重新安裝的間接相依仍可能不同。產物為 `.editor-output/pxt-tc-oled/`。將該資料夾內容發布至本 repository 的 `gh-pages` 根目錄，Pages 選擇該分支及 `/`。路徑前綴固定為 `/pxt-tc-oled/`，更換 repository 名稱需同步修改建置參數。

建置使用 npm 套件內既有模擬器及編譯快取，跳過不完整的 npm 文件渲染，不是重新編譯模擬器。所有程式碼來源及 SIL OFL 授權複製到網站 `licenses/`。繁體中文翻譯需另外由官方公開翻譯 API 下載，見 `fetch-translations.cjs`。先本機測試，再發布。

靜態主機沒有 `/api`，所以透過 PXT 的 `target.cloud.apiRoot` 設定 `https://www.makecode.com/api/` 作為上游原生編譯服務，與本機 PXT 的預設服務相同。網頁以內容雜湊標記編譯器及 target 資產，避免更新後瀏覽器仍使用舊設定。這是部署設定，與一行 UTF-8 編譯修正分開。

驗證下載檔（檢查 V2 實際執行區的完整 UTF-8 及 11 個字庫常值）：

```powershell
node compiler-fix/verify-hex.cjs '測試檔.hex' 'compiler-fix/.editor-output/evidence'
```

此驗證器對應本次含「歡迎來到學校」的固定測試案例，不是任意學生專案檢查器。

## 驗證界線

詳細結果見 `TEST-REPORT.md`。本次自由輸入路徑已做自動化及瀏覽器編譯測試；**新的自由輸入 HEX 尚待使用者實機驗收**。先前使用者回報通過的是固定 Unicode 數值診斷版，不合併計算。
