// ==UserScript==
// @name BULL TRADER LLC BOT - LICENSED
// @namespace bull-trader-llc
// @version 3.0.0
// @description BULL TRADER LLC - RANDOM UP/DOWN 3SEC - LICENSE PROTECTED
// @match https://market-qx.trade/*
// @match https://*.market-qx.trade/*
// @run-at document-idle
// @grant none
// ==/UserScript==

(function () {
    'use strict';
    if (window.__BULL_TRADER_LLC_BOT__) return;
    window.__BULL_TRADER_LLC_BOT__ = true;

    // --- LICENSE CONFIG ---
    const LICENSE_KEY_HARDCODED = "bulltraderllc098";
    const BOT_LOGO_URL = "https://i.ibb.co/7JxG3yJp/qxt-gold.png"; // apne GitHub ka raw logo link yahan dal dena
    let isLicensed = false;

    const WAIT_MS = 3000;
    let running = false;
    let timer = null;
    let panel = null;

    function findButtons() {
        const els = document.querySelectorAll('button,[role="button"],a,div');
        let upBtn = null, downBtn = null;
        for (const el of els) {
            const text = (el.getAttribute('aria-label') || el.textContent || '').trim().toLowerCase();
            const r = el.getBoundingClientRect();
            if (r.width < 40 || r.height < 25 || r.bottom < 0 || r.top > innerHeight) continue;
            if (text === 'up' || text === 'higher' || text === 'buy') upBtn = el.closest('button,[role="button"]') || el;
            if (text === 'down' || text === 'lower' || text === 'sell') downBtn = el.closest('button,[role="button"]') || el;
        }
        if (!upBtn ||!downBtn) {
            for (const el of els) {
                const r = el.getBoundingClientRect();
                if (r.width < 60 || r.height < 35 || r.width > 500 || r.height > 250 || r.bottom < 0 || r.top > innerHeight) continue;
                let bg; try { bg = getComputedStyle(el).backgroundColor; } catch (_) { continue; }
                const m = bg.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/); if (!m) continue;
                const R = +m[1], G = +m[2], B = +m[3];
                if (!downBtn && R > 140 && R > G * 1.25 && R > B * 1.15) downBtn = el;
                if (!upBtn && G > 100 && G > R * 1.1) upBtn = el;
            }
        }
        return { upBtn, downBtn };
    }

    function update(status, color = null) {
        if (!panel) return;
        const el = panel.querySelector('#bull-status');
        el.textContent = status;
        el.style.color = color || (running? '#22c55e' : '#9ca3af');
    }

    function checkLicense(inputKey) {
        if (inputKey === LICENSE_KEY_HARDCODED) {
            isLicensed = true;
            localStorage.setItem('BULL_LLC_LICENSE', inputKey);
            return true;
        }
        return false;
    }

    function start() {
        if (!isLicensed) {
            update('ENTER VALID LICENSE!', '#ef4444');
            return;
        }
        if (running) return;
        running = true;
        update('WAITING 3s...');
        timer = setTimeout(() => {
            if (!running) return;
            const { upBtn, downBtn } = findButtons();
            if (!upBtn &&!downBtn) { running = false; update('BUTTONS NOT FOUND', '#ef4444'); return; }
            const isUp = Math.random() < 0.5;
            const targetBtn = isUp? upBtn : downBtn;
            const tradeType = isUp? 'UP' : 'DOWN';
            if (!targetBtn) { running = false; update(`${tradeType} NOT FOUND`, '#ef4444'); return; }
            try {
                targetBtn.click();
                update(`${tradeType} CLICKED`, isUp? '#22c55e' : '#ef4444');
            } catch (_) { update('CLICK ERROR', '#ef4444'); }
            running = false;
        }, WAIT_MS);
    }

    function stop() {
        running = false;
        if (timer) { clearTimeout(timer); timer = null; }
        update('STOPPED');
    }

    function createUI() {
        panel = document.createElement('div');
        panel.style.cssText = `position:fixed;top:70px;left:10px;width:250px;z-index:2147483647;background:#111827;color:white;border:1px solid #D4AF37;border-radius:12px;box-shadow:0 8px 25px rgba(0,0,0,.5);font-family:Arial,sans-serif;overflow:hidden;`;
        panel.innerHTML = `
            <div style="padding:12px;background:linear-gradient(90deg,#111827,#1f2937);font-weight:bold;text-align:center;font-size:14px;border-bottom:1px solid #D4AF37;">
                <img src="${BOT_LOGO_URL}" onerror="this.style.display='none'" style="width:45px;height:45px;border-radius:8px;margin-bottom:5px;display:block;margin-left:auto;margin-right:auto;"/>
                🐂 BULL TRADER LLC<br>
                <span style="font-size:9px; color:#facc15; font-weight:normal;">LICENSED BOT v3.0</span>
            </div>
            <div style="padding:12px;text-align:center;">
                <input id="license-input" type="password" placeholder="Enter License Key" style="width:100%;padding:8px;border-radius:6px;border:1px solid #374151;background:#1f2937;color:white;margin-bottom:8px;text-align:center;"/>
                <button id="license-verify" style="width:100%;padding:8px;border:0;border-radius:6px;background:#D4AF37;color:black;font-weight:bold;margin-bottom:10px;">VERIFY LICENSE</button>
                <div id="bull-status" style="font-weight:bold;margin-bottom:10px;color:#9ca3af;font-size:12px;">LICENSE REQUIRED</div>
                <button id="bull-start" style="width:100%;padding:10px;border:0;border-radius:7px;background:#16a34a;color:white;font-weight:bold;opacity:0.5;" disabled>START</button>
                <button id="bull-stop" style="width:100%;margin-top:7px;padding:10px;border:0;border-radius:7px;background:#dc2626;color:white;font-weight:bold;">STOP</button>
            </div>
        `;
        document.body.appendChild(panel);

        const licenseInput = panel.querySelector('#license-input');
        const verifyBtn = panel.querySelector('#license-verify');
        const startBtn = panel.querySelector('#bull-start');

        // Auto check if already licensed
        const saved = localStorage.getItem('BULL_LLC_LICENSE');
        if (saved && checkLicense(saved)) {
            update('LICENSE VERIFIED', '#22c55e');
            startBtn.disabled = false;
            startBtn.style.opacity = "1";
            licenseInput.value = "bulltraderllc098";
            licenseInput.disabled = true;
            verifyBtn.textContent = "VERIFIED ✓";
            verifyBtn.style.background = "#22c55e";
        }

        verifyBtn.onclick = () => {
            if (checkLicense(licenseInput.value.trim())) {
                update('LICENSE VERIFIED', '#22c55e');
                startBtn.disabled = false;
                startBtn.style.opacity = "1";
                verifyBtn.textContent = "VERIFIED ✓";
                verifyBtn.style.background = "#22c55e";
            } else {
                update('INVALID LICENSE!', '#ef4444');
            }
        };

        panel.querySelector('#bull-start').onclick = start;
        panel.querySelector('#bull-stop').onclick = stop;
    }

    function boot() { if (!document.body) { setTimeout(boot, 100); return; } createUI(); }
    boot();
})();
