// ==UserScript==
// @name         Gallery Extension for FMKOREA
// @version      4.04
// @description  (모바일) 사이트 좌측 상단에서 메뉴를 열어주세요. PC는 일부 옵션만 자동 적용됩니다.
// @author       cent8649
// @match        https://*.fmkorea.com/*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @icon         https://www.google.com/s2/favicons?domain=fmkorea.com
// @homepage     https://m.dcinside.com/gallog/cent8649
// @downloadURL  https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/Gallery%20Extension.user.js
// @updateURL    https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/Gallery%20Extension.user.js
// ==/UserScript==

(function() {
    'use strict';

    const uw = unsafeWindow;
    const doc = document;
    const isMobile = location.hostname === 'm.fmkorea.com';
    const defs = {
        removePowerLink: false, preventAffiliate: false, noWatermark: false, imgEmbed: true, blockSearchAssist: true,
        skipAd: true, blockUser: false, blockUserList: '[]', blockKeyword: false, blockKeywordList: '[]',
        useMemo: true, userMemoDict: '{}', blockNotice: false, blockNav: false, blockRecent: false, blockFmAlert: false,
        autoDelComment: false, updateNoticeClosed: false
    };

    const getVal = k => typeof GM_getValue === 'function' ? GM_getValue(k, defs[k]) : defs[k];
    const setVal = (k, v) => typeof GM_setValue === 'function' && GM_setValue(k, v);

    const qs = (s, p = doc) => p.querySelector(s);
    const qsa = (s, p = doc) => p.querySelectorAll(s);
    const addCss = c => (doc.head || doc.documentElement).appendChild(doc.createElement('style')).textContent = c;
    const escRE = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

    const getList = k => {
        let raw = getVal(k);
        if (!raw || typeof raw !== 'string') return [];
        try { if (raw.trim().startsWith('[')) return JSON.parse(raw); } catch (e) {}
        const arr = raw.split(',').map(s => s.trim()).filter(s => s);
        setVal(k, JSON.stringify(arr));
        return arr;
    };
    const setList = (k, arr) => setVal(k, JSON.stringify(arr));

    const getDict = k => {
        let raw = getVal(k);
        if (!raw || typeof raw !== 'string') return {};
        try { return JSON.parse(raw); } catch (e) { return {}; }
    };
    const setDict = (k, obj) => setVal(k, JSON.stringify(obj));

    const noop = () => {};
    const freeze = (o, k, v) => Object.defineProperty(o, k, {value: v, writable: false, configurable: false});

    try { if (!isMobile || getVal('preventAffiliate')) freeze(uw, 'link_url', ''); } catch(e) {}
    try { if (!isMobile || getVal('noWatermark')) { freeze(uw, 'var7', 0); addCss('#bd_capture{background:none!important}'); } } catch(e) {}
    try { if (isMobile && getVal('removePowerLink')) { freeze(uw, 'board_block_check', noop); freeze(uw, '_make_power_link_identifier', noop); } } catch(e) {}

    if (!isMobile || getVal('skipAd')) {
        try {
            const s = doc.createElement('script');
            s.textContent = `document.addEventListener('click',e=>{const b=e.target.closest('#watchAdButton');if(!b)return;e.preventDefault();e.stopImmediatePropagation();jQuery.exec_json('communication.procCommunicationRewardAdPoint',{amount:1,type:"point",tts:b.getAttribute("data-tts"),tta:b.getAttribute("data-tta")},p=>{if(p.error===0&&p.message==='success'&&typeof showPopup!=="undefined")showPopup(p.rewardMsg||b.getAttribute("data-recv-msg"),b.getAttribute("data-recv-icon"));});},true);`;
            (doc.head || doc.documentElement).appendChild(s);
            s.remove();
        } catch(e) {}
    }

    const hider = [];
    if (isMobile) {
        if (getVal('blockNotice')) hider.push('.show_folded_notice.pop0.notice, li.pop0.clear.notice');
        if (getVal('blockSearchAssist')) hider.push('.search_assist_hover,#search_assist_wrapper');
        if (getVal('blockNav')) hider.push('.bc0.fmkorea_navi');
        if (getVal('blockRecent')) hider.push('.main_recent,#fmrecentvisited-recent-visits');
        if (getVal('blockFmAlert')) hider.push('#fm_alert,.fm_alert');
        if (hider.length) addCss(`${hider.join(', ')} { display: none !important; }`);
    }

    const isBad = el => {
        const s = window.getComputedStyle(el);
        const h = parseInt(s.height), p = parseFloat(s.padding), mt = parseFloat(s.marginTop), ml = parseFloat(s.marginLeft);
        return (h >= 60 && h <= 200 && p <= 5 && mt <= 5 && ml <= 5);
    };

    let adCheckActive = false, adTimer;
    const killAds = () => {
        if (!isMobile || !getVal('removePowerLink')) return;
        if (!doc.body) return window.addEventListener('DOMContentLoaded', killAds);
        if (!doc.body.classList.contains('mac_os')) return;
        qsa('script ~ div.bd_mobile.bd, section.fmWidgetStyle2019.bd_mobile.bd').forEach(el => isBad(el) && el.remove());
        adCheckActive = true;
        if (adTimer) clearTimeout(adTimer);
        adTimer = setTimeout(() => { adCheckActive = false; }, 1500);
    };

    const fixLinks = () => {
        if (isMobile && !getVal('preventAffiliate')) return;
        if (!doc.body) return window.addEventListener('DOMContentLoaded', fixLinks);
        if (doc.body.dataset.lfx) return;
        doc.body.dataset.lfx = '1';
        const handler = e => {
            if (e.target.matches && e.target.matches('a[href*="link.fmkorea.org"]')) {
                const a = e.target;
                a.href = a.textContent.trim();
                a.removeAttribute('data-document_srl');
                a.className = '';
            }
        };
        ['mousedown', 'touchstart', 'pointerdown'].forEach(ev => doc.body.addEventListener(ev, handler, true));
    };

    const CFG = {
        imgRx: /\.(jpe?g|png|webp|avif|gif)([?&#/].*)?$/i, vidRx: /\.(mp4|mkv)([?&#].*)?$/i,
        imgEncRx: /\.(jpe?g|png|webp|avif|gif)%3F/i, imgHosts: ['pbs.twimg.com', 'images?q', '/image/', '/img', 'thumb', '/_next/image?url=']
    };

    const processed = new Set();
    const cleanSet = () => {
        try {
            const cur = new Set();
            qsa('li[id^="comment"] a[href]').forEach(a => cur.add(a.getAttribute('href')));
            processed.forEach(u => !cur.has(u) && processed.delete(u));
        } catch(e) {}
    };

    const getType = url => {
        if (CFG.imgRx.test(url) || CFG.imgEncRx.test(url)) return 'img';
        if (CFG.vidRx.test(url)) return 'video';
        return CFG.imgHosts.some(h => url.includes(h)) ? 'img' : null;
    };

    const mkEl = (type, src, txt) => {
        const el = doc.createElement(type);
        el.src = src.startsWith('//') ? 'https:' + src : src;
        Object.assign(el.style, {maxWidth: '100%', display: 'block', marginTop: '10px', marginBottom: '10px'});
        el.loading = 'lazy';
        if (type === 'img') el.alt = txt; else el.controls = true;
        return el;
    };

    const embedNode = comment => {
        if(comment.getAttribute('data-done')) return;
        comment.setAttribute('data-done', 'true');
        comment.querySelectorAll('a[href]:not([data-done])').forEach(link => {
            try {
                const url = link.getAttribute('href');
                if ((!url.startsWith('http') && !url.startsWith('//')) || url.includes('wikipedia.org')) return;
                const type = getType(url);
                if (!type) return;
                link.setAttribute('data-done', 'true');
                processed.add(url);
                link.style.display = 'none';
                const element = mkEl(type, url, link.textContent);
                element.onerror = () => { try { element.remove(); link.style.display = ''; processed.delete(url); } catch(e){} };
                link.parentNode.insertBefore(element, link.nextSibling);
            } catch(e) {}
        });
    };

    const embed = () => { try { cleanSet(); qsa('li[id^="comment"]:not([data-done])').forEach(embedNode); } catch(e) {} };

    let bUsers = [], bKeys = [];
    const updLists = () => { bUsers = getList('blockUserList'); bKeys = getList('blockKeywordList'); };
    if (isMobile) updLists();

    const scan = li => {
        let hide = false;
        if (getVal('blockUser') && bUsers.length) {
            const auth = qs('.author', li), lnk = qs('a[onclick]', li), addr = qs('address > strong', li), infos = qsa('.rt_area > .info > span', li);
            if (auth && bUsers.some(n => auth.textContent.trim().endsWith('/ ' + n))) hide = true;
            else if (lnk && bUsers.some(n => lnk.textContent.trim() === n)) hide = true;
            if (!hide && (addr || infos.length)) {
                hide = bUsers.some(n => {
                    if (addr && addr.textContent.trim() === n) return true;
                    if (infos.length && Array.from(infos).some(sp => sp.textContent.trim().endsWith(n))) return true;
                    return false;
                });
            }
        }
        if (!hide && getVal('blockKeyword') && bKeys.length) {
            const txts = qsa('.xe_content, .read_more', li), srchT = qs('dl > dt > a', li), clrT = qs('.rt_area > h3 > a', li);
            for (const t of txts) if (bKeys.some(k => t.textContent.includes(k))) { hide = true; break; }
            if (!hide && (srchT || clrT)) if (bKeys.some(k => (srchT && srchT.textContent.includes(k)) || (clrT && clrT.textContent.includes(k)))) hide = true;
        }
        if (hide) li.style.setProperty('display', 'none', 'important');
        else li.style.removeProperty('display');
    };

    const rescan = () => qsa('li').forEach(scan);

    const applyMemoNode = el => {
        const memos = getDict('userMemoDict');
        if (!el.dataset.origNick) {
            let nickNode;
            for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) { nickNode = n; break; }
            if (nickNode) { el.dataset.origNick = nickNode.nodeValue.trim(); el.dataset.nickNodeIdx = Array.from(el.childNodes).indexOf(nickNode); }
            else el.dataset.origNick = el.textContent.trim();
        }
        const orig = el.dataset.origNick;
        if (orig) {
            const memo = memos[orig], targetStr = memo ? `${orig}:${memo}` : orig;
            if (el.dataset.nickNodeIdx !== undefined) {
                const targetNode = el.childNodes[el.dataset.nickNodeIdx];
                if (targetNode && targetNode.nodeValue !== targetStr) targetNode.nodeValue = targetStr;
            } else { if (el.textContent !== targetStr) el.textContent = targetStr; }
        }
    };

    const applyMemoComment = li => {
        const memos = getDict('userMemoDict'), nickEl = qs('.meta > a[href^="#"]', li);
        if (!nickEl) return;
        const nick = nickEl.textContent.trim(), xeContent = qs('.comment-content > .xe_content', li);
        if (!xeContent) return;
        const existing = qs('.fmk-memo-span', xeContent);
        if (existing) { const next = existing.nextSibling; if (next && next.tagName === 'BR') next.remove(); existing.remove(); }
        const memo = memos[nick];
        if (!memo) return;
        const span = doc.createElement('span');
        span.className = 'fmk-memo-span'; span.textContent = `(메모내용: ${memo})`; span.style.color = 'gray';
        const br = doc.createElement('br'), findParent = qs('a.findParent', xeContent);
        if (findParent) { const br2 = doc.createElement('br'); findParent.after(br2); br2.after(span); span.after(br); }
        else { xeContent.insertBefore(br, xeContent.firstChild); xeContent.insertBefore(span, br); }
    };

    const applyMemo = () => {
        if (!getVal('useMemo')) return;
        const plate = qs('.side > .member_plate') || qs('.btm_area > .side > .member_plate');
        if (plate) applyMemoNode(plate);
        qsa("li[id^='comment']").forEach(applyMemoComment);
    };

    const applyListMemo = () => {
        if (!getVal('useMemo')) return;
        const m = getDict('userMemoDict');
        qsa('ul>li>.li>div:last-child').forEach(c => {
            const a = qs('span.author', c); if (!a) return;
            const n = a.textContent.split('/').pop().trim(), s = qs('.fmk-lst-mm', c) || c.appendChild(Object.assign(doc.createElement('span'), {className: 'fmk-lst-mm', style: 'color:#888'}));
            if (m[n]) { s.textContent = ` / 메모: ${m[n]}`; s.style.display = ''; } else s.style.display = 'none';
        });
        qsa('li.clear>.rt_area>.info').forEach(c => {
            let a; try { a = qs('span:has(>i.fa-user)', c); } catch (e) { a = Array.from(qsa('span', c)).find(x => qs('i.fa-user', x)); }
            if (!a) return;
            const n = a.textContent.trim(), s = qs('.fmk-lst-mm', c) || c.appendChild(Object.assign(doc.createElement('span'), {className: 'fmk-lst-mm', style: 'color:#888'}));
            if (m[n]) { s.textContent = ` 메모: ${m[n]}`; s.style.display = ''; } else s.style.display = 'none';
        });
    };
    const runListMemo = () => window.requestIdleCallback ? requestIdleCallback(applyListMemo) : setTimeout(applyListMemo, 300);

    const injectMemoBtnNode = li => {
        const pencilIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
        const voteContainer = qs('.fdb_nav > .vote', li);
        if (voteContainer && !qs('.fmk-memo-btn', voteContainer)) {
            const btn = doc.createElement('a');
            btn.className = 'fmk-memo-btn'; btn.href = '#'; btn.innerHTML = pencilIcon;
            btn.style.cssText = 'cursor:pointer; display:inline-flex; align-items:center; justify-content:center; padding:0 4px; color:#888; transition:color 0.2s;';
            const a = qs('.meta > a[href^="#"]', li), nick = a ? a.textContent.trim() : '';
            btn.addEventListener('click', e => { e.preventDefault(); if (nick) showMemoPopup(nick, e.pageX, e.pageY); });
            voteContainer.insertBefore(btn, voteContainer.firstChild);
        }
    };

    const injectMemoBtn = () => {
        if (!getVal('useMemo')) return;
        qsa("li[id^='comment']").forEach(injectMemoBtnNode);
        const btmArea = qs('.btm_area');
        if (btmArea) {
            const sideFr = qs('.side.fr', btmArea), plate = qs('.side > .member_plate', btmArea);
            if (sideFr && plate && !qs('.fmk-memo-btn', sideFr)) {
                const btn = doc.createElement('span');
                btn.className = 'fmk-memo-btn'; btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
                btn.style.cssText = 'cursor:pointer; display:inline-flex; align-items:center; justify-content:center; padding:0 4px; color:#888; transition:color 0.2s; margin-left: 5px; vertical-align: middle; position: relative; top: -2.4px; left: -5px;';
                const nick = plate.dataset.origNick || plate.textContent.trim().split(':')[0];
                btn.addEventListener('click', e => { e.preventDefault(); if (nick) showMemoPopup(nick, e.pageX, e.pageY); });
                sideFr.appendChild(btn);
            }
        }
    };

    const showMemoPopup = (nick, x, y) => {
        let popup = doc.getElementById('fmk-memo-popup');
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (!popup) {
            popup = doc.createElement('div'); popup.id = 'fmk-memo-popup';
            popup.style.cssText = `position:absolute;z-index:99999;background:${isDark?'rgba(40,40,40,0.95)':'rgba(255,255,255,0.95)'};color:${isDark?'#eee':'#333'};border:1px solid ${isDark?'#555':'#ddd'};border-radius:10px;padding:15px;max-width:280px;width:80%;box-shadow:0 5px 25px rgba(0,0,0,0.2);font-size:14px;line-height:1.6;display:none;backdrop-filter:blur(8px);word-break:keep-all;user-select:none;`;
            doc.body.appendChild(popup);
            doc.addEventListener('mousedown', e => { if (!popup.contains(e.target) && !e.target.closest('.fmk-memo-btn')) popup.style.display = 'none'; });
            doc.addEventListener('touchstart', e => { if (!popup.contains(e.target) && !e.target.closest('.fmk-memo-btn')) popup.style.display = 'none'; });
        }
        const currentMemo = getDict('userMemoDict')[nick] || '';
        popup.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;font-weight:bold;"><div>${esc(nick)} 메모</div></div>
            <div style="margin-top:10px;padding-top:10px;border-top:1px dashed ${isDark?'#555':'#ccc'}">
                <div style="display:flex;align-items:center;gap:5px;">
                    <textarea id="fmk-memo-textarea" style="flex-grow:1;width:0;height:34px;line-height:1.5;background:${isDark?'#333':'#f5f5f5'};color:${isDark?'#fff':'#000'};border:1px solid ${isDark?'#555':'#ccc'};border-radius:5px;padding:5px 8px;font-size:14px;resize:none;box-sizing:border-box;margin:0;">${esc(currentMemo)}</textarea>
                    <div style="display:flex;gap:4px;flex-shrink:0;">
                        <button id="fmk-memo-save" style="width:40px;height:34px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:6px;font-size:12px;font-weight:bold;cursor:pointer;border:none;color:${isDark?'#ccc':'#555'};background-color:${isDark?'#4a4a4a':'#e2e2e2'};">저장</button>
                        <button id="fmk-memo-del" style="width:40px;height:34px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:6px;font-size:12px;font-weight:bold;cursor:pointer;border:none;color:${isDark?'#ccc':'#555'};background-color:${isDark?'#4a4a4a':'#e2e2e2'};">삭제</button>
                    </div>
                </div>
            </div>
            <div style="margin-top:15px;padding-top:10px;border-top:1px solid ${isDark?'#444':'#eee'};display:flex;justify-content:flex-end;">
                <div id="fmk-memo-close" style="cursor:pointer;padding:4px;font-size:12px;color:#888;display:flex;align-items:center;"><span style="margin-right:4px;">Close</span><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div>
            </div>`;
        popup.querySelector('#fmk-memo-save').addEventListener('click', () => {
            const val = popup.querySelector('#fmk-memo-textarea').value.trim(), d = getDict('userMemoDict');
            if (val) d[nick] = val; else delete d[nick];
            setDict('userMemoDict', d); popup.style.display = 'none'; applyMemo(); applyListMemo();
            const _ms = qs('#section_user_memo'); if (_ms) renderTags(_ms, 'userMemoDict');
            if (_refreshTags) _refreshTags();
        });
        popup.querySelector('#fmk-memo-del').addEventListener('click', () => {
            const d = getDict('userMemoDict'); delete d[nick]; setDict('userMemoDict', d); popup.style.display = 'none'; applyMemo(); applyListMemo();
            const _ms2 = qs('#section_user_memo'); if (_ms2) renderTags(_ms2, 'userMemoDict');
            if (_refreshTags) _refreshTags();
        });
        popup.querySelector('#fmk-memo-close').addEventListener('click', () => popup.style.display = 'none');
        popup.style.display = 'block';
        const rect = popup.getBoundingClientRect();
        let pX = x, pY = y + 15;
        const vRight = window.scrollX + window.innerWidth, vBottom = window.scrollY + window.innerHeight;
        if (pX + rect.width > vRight) pX = vRight - rect.width - 10;
        if (pY + rect.height > vBottom) pY = vBottom - rect.height - 10;
        popup.style.left = `${pX}px`; popup.style.top = `${pY}px`;
    };

    const flags = { removePowerLink: getVal('removePowerLink'), imgEmbed: getVal('imgEmbed'), blockUser: getVal('blockUser'), blockKeyword: getVal('blockKeyword'), useMemo: getVal('useMemo') };

    let obsQueue = [], obsTicking = false;
    const processQueue = () => {
        if (obsQueue.length > 0) {
            const chunk = obsQueue.splice(0, 5);
            chunk.forEach(n => {
                if (isMobile && (flags.blockUser || flags.blockKeyword)) { if (n.tagName === 'LI') scan(n); else if (n.querySelectorAll) n.querySelectorAll('li').forEach(scan); }
                if (isMobile && flags.removePowerLink && adCheckActive) {
                    if (n.matches && (n.matches('div.bd_mobile.bd') || n.matches('section.fmWidgetStyle2019'))) { if (isBad(n)) n.remove(); }
                    else if (n.querySelectorAll) n.querySelectorAll('script ~ div.bd_mobile.bd, section.fmWidgetStyle2019.bd_mobile.bd').forEach(el => isBad(el) && el.remove());
                }
                if ((!isMobile || flags.imgEmbed) && ((n.matches && n.matches('li[id^="comment"]')) || (n.querySelector && n.querySelector('li[id^="comment"]')))) {
                    if(n.matches && n.matches('li[id^="comment"]')) embedNode(n); else n.querySelectorAll('li[id^="comment"]').forEach(embedNode);
                }
                if (isMobile && flags.useMemo && ((n.matches && n.matches('li[id^="comment"]')) || (n.querySelector && n.querySelector('li[id^="comment"]')))) {
                    if(n.matches && n.matches('li[id^="comment"]')) { applyMemoComment(n); injectMemoBtnNode(n); } else n.querySelectorAll('li[id^="comment"]').forEach(c => { applyMemoComment(c); injectMemoBtnNode(c); });
                }
            });
            if (obsQueue.length > 0) requestAnimationFrame(processQueue); else obsTicking = false;
        } else obsTicking = false;
    };

    const mainObserver = new MutationObserver(ms => {
        let nodesAdded = false;
        ms.forEach(m => {
            if (!m.addedNodes.length) return;
            m.addedNodes.forEach(n => { if (n.nodeType === 1) { obsQueue.push(n); nodesAdded = true; } });
        });
        if (nodesAdded && !obsTicking) { obsTicking = true; requestAnimationFrame(processQueue); }
    });

    window.addEventListener('pageshow', e => (e.persisted || (window.performance && window.performance.navigation.type === 2)) && killAds());

    const runAutoDel = async () => {
        if (!isMobile || !getVal('autoDelComment') || !window.location.href.includes('act=dispMy_commentViewMyComment')) return;
        try{const jq=typeof uw!=='undefined'?uw.jQuery:window.jQuery;if(!jq)return;doc.head.appendChild(Object.assign(doc.createElement('style'),{textContent:`#fm-del-ui{position:fixed;bottom:30px;left:50%;transform:translate(-50%,100px);z-index:10000;padding:12px 24px;background:rgba(255,255,255,0.95);color:#333;border:1px solid rgba(0,0,0,0.1);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.15);backdrop-filter:blur(10px);font-size:14px;font-weight:700;cursor:pointer;transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);text-align:center;user-select:none;width:max-content;max-width:90vw;white-space:nowrap}#fm-del-ui.show{transform:translate(-50%,0)}#fm-del-ui:hover{box-shadow:0 12px 40px rgba(0,0,0,0.2);transform:translate(-50%,-5px)}`}));const u=doc.body.appendChild(Object.assign(doc.createElement('div'),{id:'fm-del-ui',textContent:'댓글삭제 시작'}));setTimeout(()=>u.classList.add('show'),100);const st=GM_getValue('autoDelRunning',false);if(st){u.textContent='초기화 중...'}u.onclick=()=>(GM_setValue('autoDelRunning',!st),location.reload());if(st){const l=Array.from(doc.querySelectorAll('.word_style > a[href*="s_comment_srl="]')).filter(a=>!a.parentElement.textContent.includes('삭제된 댓글'));if(!l.length){const n=Array.from(doc.querySelectorAll('.bd_pg a')).find(a=>a.innerText.includes('다음')||a.innerHTML.includes('fa-angle-right'));if(n){u.textContent='다음 페이지 이동...';setTimeout(()=>n.click(),1000)}else{GM_setValue('autoDelRunning',false);u.textContent='전부 삭제완료!';setTimeout(()=>u.classList.remove('show'),3000)}return}let p=0;for(const a of l){if(!GM_getValue('autoDelRunning'))break;p++;const url=new URL(a.href,window.location.origin),d=url.searchParams.get('document_srl'),c=url.searchParams.get('s_comment_srl');u.textContent=`[${p}/${l.length}] 삭제중... (누르면 멈춤)`;try{let e=0;await new Promise(res=>jq.exec_json('board.procBoardDeleteComment',{document_srl:d,comment_srl:c},r=>{if(r&&(r.error!==0||r.message==='need_captcha'))e=1;res()}));if(e){GM_setValue('autoDelRunning',false);u.textContent='으악 캡챠다!';alert('캡챠가 감지되었습니다. 수동으로 풀고 오세요.');break}}catch(err){}await new Promise(res=>setTimeout(res,1500+Math.random()*2000))}if(GM_getValue('autoDelRunning')){u.textContent='댓글 삭제완료. 새로고침합니다.';setTimeout(()=>location.reload(),1000)}}}catch(e){}
    };

    const loader = () => {
        killAds(); fixLinks();
        if (!isMobile || getVal('imgEmbed')) embed();
        if (isMobile && getVal('useMemo')) { applyMemo(); injectMemoBtn(); runListMemo(); }
        if (isMobile) rescan();
        runAutoDel();
        mainObserver.observe(doc.documentElement || doc.body, {childList: true, subtree: true});
    };

    const showUpdateToast = () => {
        if (getVal('updateNoticeClosed') || !isMobile) return;
        const btn = qs('span[role="gallset"]');
        if (!btn) { setTimeout(showUpdateToast, 500); return; }
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const toast = doc.createElement('div');
        toast.style.cssText = `position:absolute;z-index:99999;background:${isDark?'rgba(40,40,40,0.95)':'rgba(255,255,255,0.95)'};color:${isDark?'#eee':'#333'};border:1px solid ${isDark?'#555':'#ddd'};border-radius:8px;padding:8px 12px;width:max-content;box-shadow:0 5px 20px rgba(0,0,0,0.15);backdrop-filter:blur(8px);user-select:none;transition:opacity 0.3s;`;
        toast.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
                <span style="font-weight:bold;font-size:13px;color:${isDark?'#fff':'#000'};"> ▶ Updated</span>
                <button id="fmk-toast-close" style="background:${isDark?'#4a4a4a':'#e2e2e2'};border:none;color:${isDark?'#ccc':'#555'};font-weight:bold;cursor:pointer;padding:5px 10px;border-radius:5px;font-size:11px;">X</button>
            </div>
        `;
        doc.body.appendChild(toast);
        const rect = btn.getBoundingClientRect();
        toast.style.top = (rect.bottom + window.scrollY + 8) + 'px';
        let pX = rect.left;
        if (pX + 150 > window.innerWidth) pX = window.innerWidth - 160;
        toast.style.left = Math.max(10, pX) + 'px';

        qs('#fmk-toast-close', toast).addEventListener('click', () => {
            setVal('updateNoticeClosed', true);
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        });
    };

    const getTheme = () => (qs('meta[name="theme-color"]') || {}).content || '#34495e';
    const initUI = () => {
        if (doc.readyState === 'loading') {
            doc.addEventListener('DOMContentLoaded', () => {
                addBtn();
                if(window.requestIdleCallback) window.requestIdleCallback(showUpdateToast); else setTimeout(showUpdateToast, 1000);
            });
        } else {
            addBtn();
            if(window.requestIdleCallback) window.requestIdleCallback(showUpdateToast); else setTimeout(showUpdateToast, 1000);
        }
    };

    let uiLoaded = false, _refreshTags = null;

    const addBtn = () => {
        const hdr = qs('#header') || qs('header');
        if (!hdr || qs('span[role="gallset"]', hdr)) return;
        const btn = doc.createElement('span');
        btn.setAttribute('role', 'gallset');
        btn.style.cssText = `display:inline;align-items:center;justify-content:center;width:30px;height:30px;margin-left:10px;margin-top:1px;cursor:pointer;z-index:10;position:relative;top:4px;right:10px;color:#ffffff;`;
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>`;
        const load = () => { loadUI(); ['touchstart', 'mousedown', 'mouseover'].forEach(e => btn.removeEventListener(e, load)); };
        ['touchstart', 'mousedown', 'mouseover'].forEach(e => btn.addEventListener(e, load));
        btn.addEventListener('click', e => { e.preventDefault(); toggleUI(); });
        hdr.appendChild(btn);
    };

    const renderTags = (sec, key) => {
        const con = qs('.fmk-tag-container', sec);
        if (!con) return;
        con.innerHTML = '';
        if (key === 'userMemoDict') {
            const dict = getDict(key);
            Object.keys(dict).forEach(nick => {
                const tag = doc.createElement('div'); tag.className = 'fmk-tag';
                tag.innerHTML = `${esc(nick)}: ${esc(dict[nick])}<span class="fmk-tag-close" data-nick="${esc(nick)}">&times;</span>`;
                tag.querySelector('.fmk-tag-close').addEventListener('click', () => {
                    const d = getDict(key); delete d[nick]; setDict(key, d); renderTags(sec, key); applyMemo(); applyListMemo();
                });
                con.appendChild(tag);
            });
        } else {
            const list = getList(key);
            list.forEach((item, idx) => {
                const tag = doc.createElement('div'); tag.className = 'fmk-tag';
                tag.innerHTML = `${esc(item)}<span class="fmk-tag-close" data-idx="${idx}">&times;</span>`;
                tag.querySelector('.fmk-tag-close').addEventListener('click', () => {
                    list.splice(idx, 1); setList(key, list); renderTags(sec, key); updLists(); rescan();
                });
                con.appendChild(tag);
            });
        }
    };

    const loadUI = () => {
        if (uiLoaded) return;
        uiLoaded = true;
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        addCss(`:root{--fmk-theme:${getTheme()}}#fmk-settings-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99998;opacity:0;visibility:hidden;backdrop-filter:blur(2px);transition:opacity 0.25s ease,visibility 0.25s ease}#fmk-settings-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-48%) scale(0.96);width:90%;max-width:350px;max-height:85vh;background:${isDark?'rgba(40,40,40,0.95)':'rgba(255,255,255,0.98)'};color:${isDark?'#eee':'#333'};border:1px solid ${isDark?'#555':'#ddd'};border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.3);z-index:99999;display:flex;flex-direction:column;font-size:14px;user-select:none;opacity:0;visibility:hidden;transition:opacity 0.25s cubic-bezier(0.2,0.8,0.2,1),transform 0.25s cubic-bezier(0.2,0.8,0.2,1),visibility 0.25s}.fmk-open#fmk-settings-overlay{opacity:1;visibility:visible}.fmk-open#fmk-settings-panel{opacity:1;visibility:visible;transform:translate(-50%,-50%) scale(1)}.fmk-panel-header{padding:15px;border-bottom:1px solid ${isDark?'#555':'#eee'};font-weight:bold;font-size:17px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}.fmk-panel-close{cursor:pointer;padding:5px;font-size:20px;line-height:1;color:#888}.fmk-panel-body{padding:15px;overflow-y:auto;flex-grow:1}.fmk-opt-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.fmk-opt-label{font-weight:bold;text-align:left;flex:1;margin-right:15px;font-size:15px}.fmk-opt-info{font-size:11px;color:#999;margin-top:-5px;margin-bottom:15px;text-align:left;line-height:1.4}.fmk-switch{position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0}.fmk-switch input{opacity:0;width:0;height:0}.fmk-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.3s;border-radius:24px}.fmk-slider:before{position:absolute;content:"";height:18px;width:18px;left:3px;bottom:3px;background-color:white;transition:.3s;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.2)}input:checked+.fmk-slider{background-color:var(--fmk-theme)}input:checked+.fmk-slider:before{transform:translateX(20px)}.fmk-input-group{display:none;gap:5px;margin-bottom:8px;width:100%;box-sizing:border-box;align-items:center}.fmk-input-text{flex:1;min-width:0;padding:8px;border-radius:4px;border:1px solid ${isDark?'#666':'#ddd'};background:${isDark?'#333':'#fff'};color:inherit;font-size:13px;height:38px;box-sizing:border-box}.fmk-btn{width:50px;flex-shrink:0;height:38px;border-radius:4px;border:none;cursor:pointer;background:${isDark?'#555':'#eee'};color:inherit;font-weight:bold;font-size:13px;white-space:nowrap;display:flex;align-items:center;justify-content:center;transition:background-color 0.2s,color 0.2s}.fmk-btn:active{opacity:0.8}.fmk-tag-container{display:none;flex-wrap:wrap;gap:5px;padding:8px;border:1px solid ${isDark?'#666':'#ddd'};border-radius:4px;background:${isDark?'#333':'#f9f9f9'};max-height:120px;overflow-y:auto;margin-bottom:8px;min-height:30px}.expanded .fmk-tag-container,.expanded .fmk-input-group{display:flex}.fmk-tag{background:${isDark?'#555':'#e0e0e0'};padding:4px 8px;border-radius:12px;font-size:12px;display:flex;align-items:center;color:inherit;word-break:break-all}.fmk-tag-close{margin-left:6px;cursor:pointer;font-weight:bold;opacity:0.6;font-size:14px;line-height:1}.fmk-tag-close:hover{opacity:1}.fmk-icon-btn{cursor:pointer;opacity:0.6;transition:opacity 0.2s;display:flex;align-items:center;justify-content:center;width:24px;height:24px}.fmk-icon-btn:hover{opacity:1}`);

        const overlay = doc.createElement('div'); overlay.id = 'fmk-settings-overlay';
        const panel = doc.createElement('div'); panel.id = 'fmk-settings-panel';

        const blkHtml = (id, label) => `
            <div class="fmk-block-section" id="${id}">
                <div class="fmk-opt-row"><div class="fmk-opt-label">${label}</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_${id.replace('section_','')}"><span class="fmk-slider"></span></label></div>
                <div class="fmk-input-group"><input type="text" class="fmk-input-text" placeholder="입력 후 등록"><button class="fmk-btn add-btn">등록</button></div>
                <div class="fmk-tag-container"></div>
            </div>`;

        const memoBlkHtml = `
            <div class="fmk-block-section" id="section_user_memo">
                <div class="fmk-opt-row"><div class="fmk-opt-label">유저 메모</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_use_memo"><span class="fmk-slider"></span></label></div>
                <div class="fmk-input-group" style="gap:5px;"><input type="text" class="fmk-input-text memo-nick" placeholder="닉네임" style="flex:4;"><input type="text" class="fmk-input-text memo-val" placeholder="메모" style="flex:6;"><button class="fmk-btn memo-add-btn">등록</button></div>
                <div class="fmk-tag-container"></div>
            </div>`;

        panel.innerHTML = `<div class="fmk-panel-header"><span>Settings</span><span class="fmk-panel-close">&times;</span></div><div class="fmk-panel-body"><div class="fmk-opt-info" style="text-align:center;margin-bottom:15px">대부분의 설정은 새로고침 후에 적용됩니다. 필요없는 옵션은 끄세요.</div><div class="fmk-opt-row"><div class="fmk-opt-label">파워링크 제거</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_powerlink"><span class="fmk-slider"></span></label></div><div class="fmk-opt-info">갤필터 사용시 끄세요.</div><div class="fmk-opt-row"><div class="fmk-opt-label">핫딜 제휴링크 변환 방지</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_affiliate"><span class="fmk-slider"></span></label></div><div class="fmk-opt-info">AdGuard 추적보호필터, 갤필터 사용시 필요하지 않습니다.</div><div class="fmk-opt-row"><div class="fmk-opt-label">캡쳐방지 및 워터마크 해제</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_watermark"><span class="fmk-slider"></span></label></div><div class="fmk-opt-info">AdGuard 기타방해요소필터 사용시 필요하지 않습니다.</div><div class="fmk-opt-row"><div class="fmk-opt-label">광고 없이 잉포 리워드 수령</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_skipad"><span class="fmk-slider"></span></label></div><div class="fmk-opt-info">광고차단기가 켜져있어도 리워드를 받을 수 있습니다.</div><div class="fmk-opt-row"><div class="fmk-opt-label">댓글 이미지 임베딩</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_imgembed"><span class="fmk-slider"></span></label></div><hr style="border:0;border-top:1px solid ${isDark?'#444':'#eee'};margin:15px 0;">
        ${blkHtml('section_block_user', '유저 차단')} ${memoBlkHtml} ${blkHtml('section_block_keyword', '게시물/댓글 키워드 차단')}
        <hr style="border:0;border-top:1px solid ${isDark?'#444':'#eee'};margin:15px 0;"><div class="fmk-opt-row"><div class="fmk-opt-label">공지사항 차단</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_block_notice"><span class="fmk-slider"></span></label></div><div class="fmk-opt-row"><div class="fmk-opt-label">검색 어시스턴트 차단</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_block_assist"><span class="fmk-slider"></span></label></div><div class="fmk-opt-row"><div class="fmk-opt-label">포텐 메인 Navi 차단</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_block_nav"><span class="fmk-slider"></span></label></div><div class="fmk-opt-row"><div class="fmk-opt-label">최근방문 게시판 목록 차단</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_block_recent"><span class="fmk-slider"></span></label></div><div class="fmk-opt-row"><div class="fmk-opt-label">새 포텐 알림 차단</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_block_alert"><span class="fmk-slider"></span></label></div><hr style="border:0;border-top:1px solid ${isDark?'#444':'#eee'};margin:15px 0;"><div class="fmk-opt-row"><div class="fmk-opt-label">댓글 자동삭제(Abandoned)</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_autodel_comment"><span class="fmk-slider"></span></label></div><div class="fmk-opt-info">댓글 작성목록에서 사용. 캡챠 자동해제는 지원하지 않습니다.</div><div class="fmk-opt-row"><div class="fmk-opt-label">전체 설정 백업</div><div style="display:flex;gap:5px;"><div class="fmk-icon-btn" id="fmk-export-all" title="내보내기"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></div><div class="fmk-icon-btn" id="fmk-import-all" title="불러오기"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg></div><input type="file" accept=".json,.txt" style="display:none" id="fmk-import-file-all"></div></div></div>`;
        doc.body.append(overlay, panel);
        doc.addEventListener('click', e => {
            if (e.target.matches('#fmk-settings-overlay') || e.target.closest('.fmk-panel-close')) toggleUI();
        });
        bindUI();
    };

    const bindUI = () => {
        const bind = (id, key, sec) => {
            const el = qs('#' + id); if (!el) return;
            el.checked = getVal(key);
            if (sec) { const s = qs('#' + sec); if (el.checked) s.classList.add('expanded'); }
            el.addEventListener('change', e => {
                setVal(key, e.target.checked); if (key in flags) flags[key] = e.target.checked;
                if (sec) {
                    const s = qs('#' + sec); e.target.checked ? s.classList.add('expanded') : s.classList.remove('expanded');
                    if (key === 'blockUser' || key === 'blockKeyword') { updLists(); rescan(); if(e.target.checked) renderTags(s, key + 'List'); }
                    if (key === 'useMemo') { if(e.target.checked) renderTags(s, 'userMemoDict'); }
                }
            });
        };

        _refreshTags = () => {
            ['section_block_user', 'section_block_keyword', 'section_user_memo'].forEach(sid => {
                const s = qs('#'+sid); if (!s) return;
                const ck = qs('input[type="checkbox"]', s); if (!ck || !ck.checked) return;
                renderTags(s, sid === 'section_block_user' ? 'blockUserList' : sid === 'section_block_keyword' ? 'blockKeywordList' : 'userMemoDict');
            });
        };

        const map = [
            ['fmk_opt_powerlink', 'removePowerLink'], ['fmk_opt_affiliate', 'preventAffiliate'], ['fmk_opt_watermark', 'noWatermark'], ['fmk_opt_skipad', 'skipAd'], ['fmk_opt_imgembed', 'imgEmbed'],
            ['fmk_opt_block_notice', 'blockNotice'], ['fmk_opt_block_assist', 'blockSearchAssist'],
            ['fmk_opt_block_nav', 'blockNav'], ['fmk_opt_block_recent', 'blockRecent'], ['fmk_opt_block_alert', 'blockFmAlert'],
            ['fmk_opt_block_user', 'blockUser', 'section_block_user'], ['fmk_opt_block_keyword', 'blockKeyword', 'section_block_keyword'],
            ['fmk_opt_use_memo', 'useMemo', 'section_user_memo'], ['fmk_opt_autodel_comment', 'autoDelComment']
        ];
        map.forEach(m => bind(...m));

        const memoSec = qs('#section_user_memo');
        if (memoSec) {
            const nickInp = qs('.memo-nick', memoSec), valInp = qs('.memo-val', memoSec), mAddBtn = qs('.memo-add-btn', memoSec);
            mAddBtn.addEventListener('click', () => {
                const n = nickInp.value.trim(), v = valInp.value.trim(); if (!n || !v) return;
                const dict = getDict('userMemoDict'); dict[n] = v; setDict('userMemoDict', dict);
                renderTags(memoSec, 'userMemoDict'); applyMemo(); applyListMemo(); nickInp.value = ''; valInp.value = '';
            });
        }

        ['section_block_user', 'section_block_keyword'].forEach(sid => {
            const s = qs('#' + sid), inp = qs('input.fmk-input-text', s), addBtn = qs('.add-btn', s), k = sid === 'section_block_user' ? 'blockUserList' : 'blockKeywordList';
            addBtn.addEventListener('click', () => {
                const v = inp.value.trim(); if (!v) return;
                const list = getList(k);
                if (!list.includes(v)) { list.push(v); setList(k, list); renderTags(s, k); updLists(); rescan(); }
                inp.value = '';
            });
        });

        const exportAllBtn = qs('#fmk-export-all'), importAllBtn = qs('#fmk-import-all'), importFileAll = qs('#fmk-import-file-all');
        if (exportAllBtn) exportAllBtn.addEventListener('click', () => {
            const data = {}; Object.keys(defs).forEach(k => { data[k] = getVal(k); });
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}), url = URL.createObjectURL(blob), a = doc.createElement('a');
            a.href = url; a.download = 'fmk_settings.txt'; a.click(); URL.revokeObjectURL(url);
        });

        if (importAllBtn && importFileAll) {
            importAllBtn.addEventListener('click', () => importFileAll.click());
            importFileAll.addEventListener('change', e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    try {
                        const parsed = JSON.parse(ev.target.result);
                        Object.keys(defs).forEach(k => { if (parsed[k] !== undefined) setVal(k, parsed[k]); });
                        const checkMap = [
                            ['fmk_opt_powerlink', 'removePowerLink'], ['fmk_opt_affiliate', 'preventAffiliate'], ['fmk_opt_watermark', 'noWatermark'], ['fmk_opt_skipad', 'skipAd'], ['fmk_opt_imgembed', 'imgEmbed'],
                            ['fmk_opt_block_notice', 'blockNotice'], ['fmk_opt_block_assist', 'blockSearchAssist'], ['fmk_opt_block_nav', 'blockNav'],
                            ['fmk_opt_block_recent', 'blockRecent'], ['fmk_opt_block_alert', 'blockFmAlert'], ['fmk_opt_block_user', 'blockUser'], ['fmk_opt_block_keyword', 'blockKeyword'],
                            ['fmk_opt_use_memo', 'useMemo'], ['fmk_opt_autodel_comment', 'autoDelComment']
                        ];
                        checkMap.forEach(([id, key]) => { const el = qs('#' + id); if (el) el.checked = getVal(key); });
                        updLists(); if (_refreshTags) _refreshTags(); alert('설정을 불러왔습니다. 새로고침 후 적용됩니다.');
                    } catch(err) { alert('파일을 읽는 중 오류가 발생했습니다.'); }
                    importFileAll.value = '';
                };
                reader.readAsText(file);
            });
        }
    };

    const toggleUI = () => {
        if (!uiLoaded) {
            loadUI(); setTimeout(() => { qs('#fmk-settings-overlay').classList.add('fmk-open'); qs('#fmk-settings-panel').classList.add('fmk-open'); if(_refreshTags) _refreshTags(); }, 10);
            return;
        }
        const ov = qs('#fmk-settings-overlay'), pn = qs('#fmk-settings-panel');
        ov.classList.toggle('fmk-open'); pn.classList.toggle('fmk-open');
        if (pn.classList.contains('fmk-open') && _refreshTags) _refreshTags();
    };

    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', loader); else loader();

    if (isMobile) initUI();
})();
