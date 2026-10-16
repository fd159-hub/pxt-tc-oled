(function() {
    if (window.ksRunnerInit) return;

    // This line gets patched up by the cloud
    var pxtConfig = {
    "relprefix": "/pxt-tc-oled/",
    "verprefix": "",
    "workerjs": "/pxt-tc-oled/worker.js",
    "monacoworkerjs": "/pxt-tc-oled/monacoworker.js",
    "gifworkerjs": "/pxt-tc-oled/gifjs/gif.worker.js",
    "serviceworkerjs": "/pxt-tc-oled/serviceworker.js",
    "typeScriptWorkerJs": "/pxt-tc-oled/tsworker.js",
    "pxtVersion": "13.0.1",
    "pxtRelId": "localDirRelId",
    "pxtCdnUrl": "/pxt-tc-oled/",
    "commitCdnUrl": "/pxt-tc-oled/",
    "blobCdnUrl": "/pxt-tc-oled/",
    "cdnUrl": "/pxt-tc-oled/",
    "targetVersion": "0.0.0",
    "targetRelId": "",
    "targetUrl": "",
    "targetId": "microbit",
    "simUrl": "/pxt-tc-oled/simulator.html",
    "simserviceworkerUrl": "/pxt-tc-oled/simulatorserviceworker.js",
    "simworkerconfigUrl": "/pxt-tc-oled/workerConfig.js",
    "partsUrl": "/pxt-tc-oled/siminstructions.html",
    "runUrl": "/pxt-tc-oled/run.html",
    "docsUrl": "/pxt-tc-oled/docs.html",
    "multiUrl": "/pxt-tc-oled/multi.html",
    "asseteditorUrl": "/pxt-tc-oled/asseteditor.html",
    "isStatic": true,
    "kioskUrl": "/pxt-tc-oled/kiosk.html",
    "teachertoolUrl": "/pxt-tc-oled/teachertool.html",
    "tutorialtoolUrl": "/pxt-tc-oled/tutorialtool.html",
    "skillmapUrl": "/pxt-tc-oled/skillmap.html",
    "multiplayerUrl": "/pxt-tc-oled/multiplayer.html",
    "authcodeUrl": "/pxt-tc-oled/authcode.html"
};

    var scripts = [
        "/pxt-tc-oled/highlight.js/highlight.pack.js",
        "/pxt-tc-oled/marked/marked.min.js",
    ]

    if (typeof jQuery == "undefined")
        scripts.unshift("/pxt-tc-oled/jquery.js")
    if (typeof jQuery == "undefined" || !jQuery.prototype.sidebar)
        scripts.push("/pxt-tc-oled/semantic.js")
    if (!window.pxtTargetBundle)
        scripts.push("/pxt-tc-oled/target.js");
    scripts.push("/pxt-tc-oled/pxtembed.js");

    var pxtCallbacks = []

    window.ksRunnerReady = function(f) {
        if (pxtCallbacks == null) f()
        else pxtCallbacks.push(f)
    }

    window.ksRunnerWhenLoaded = function() {
        pxt.docs.requireHighlightJs = function() { return hljs; }
        pxt.setupWebConfig(pxtConfig || window.pxtWebConfig)
        pxt.runner.setInitCallbacks(pxtCallbacks)
        pxtCallbacks.push(function() {
            pxtCallbacks = null
        })
        pxt.runner.init();
    }

    scripts.forEach(function(src) {
        var script = document.createElement('script');
        script.src = src;
        script.async = false;
        document.head.appendChild(script);
    })

} ())
