// ==UserScript==
// @name         Gallery Extension for FMKOREA
// @version      3.23
// @description  (모바일) 사이트 좌측 상단에서 메뉴를 열어주세요. PC는 일부 옵션만 자동 적용됩니다.
// @author       cent8649
// @match        https://*.fmkorea.com/*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @icon         https://www.google.com/s2/favicons?domain=fmkorea.com
// @homepage     https://gall.dcinside.com/mgallery/board/view/?id=adguard&no=2348
// @downloadURL  https://github.com/Zziniswell/Adguard-gallery-filter/raw/refs/heads/main/Gallery%20Extension.user.js
// @updateURL    https://github.com/Zziniswell/Adguard-gallery-filter/raw/refs/heads/main/Gallery%20Extension.user.js
// ==/UserScript==

(function() {
    'use strict';

    const uw = unsafeWindow;
    const doc = document;
    const isMobile = location.hostname === 'm.fmkorea.com';
    const defs = {
        removePowerLink: true, preventAffiliate: true, noWatermark: false, imgEmbed: true, blockSearchAssist: true,
        blockUser: false, blockUserList: '[]', blockKeyword: false, blockKeywordList: '[]',
        blockNotice: false, blockNav: false, blockRecent: false, blockFmAlert: false, redTheme: false
    };

    const getVal = (k) => GM_getValue(k, defs[k]);
    const setVal = (k, v) => GM_setValue(k, v);
    const qs = (s, p = doc) => p.querySelector(s);
    const qsa = (s, p = doc) => p.querySelectorAll(s);
    const addCss = (c) => (doc.head || doc.documentElement).appendChild(doc.createElement('style')).textContent = c;
    const escRE = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const getList = (k) => {
        let raw = getVal(k);
        if (!raw) return [];
        if (typeof raw !== 'string') return []; 
        try {
            if (raw.trim().startsWith('[')) return JSON.parse(raw);
        } catch (e) {}
        const arr = raw.split(',').map(s => s.trim()).filter(s => s);
        setVal(k, JSON.stringify(arr));
        return arr;
    };
    
    const setList = (k, arr) => setVal(k, JSON.stringify(arr));

    if (isMobile && getVal('redTheme')) {
        addCss(`#sphinx_search_tabs>.on>[href^="/index.php"],.STAR-BEST_T,.bd>.fmkorea_m_navi [href],.localNavigation>.on>[href^="/index.php"],.on>[class^="dispM"]{background-color:rgba(165,42,42,0.9)!important}.bd>.fmkorea_m_navi{background-color:rgba(255,225,225,0.4)!important}.board_autosearch_wrapper.msearch{background-color:rgba(205,92,92,0.7)!important}.comment-2.comment_best.clear.fdb_itm{background-color:rgba(255,210,210,0.5)!important}.a,.cr [href],.crhome [href]{color:rgba(165,42,42,0.9)!important}.document_writer .xe_content{color:rgba(220,20,30,0.9)!important}.ft,.hd,.pop.list,.meta>.icon-hit{background-color:rgba(165,42,42,0.9)!important}.hotdeal_var8{color:rgba(0,0,0,0.9)!important}.hotdeal_var8N{color:rgba(0,0,0,0.8)!important}.hotdeal_var8Y{color:rgba(0,0,0,0.45)!important}.inputText,.meta>.icon-hit,.socket_button>[href]{border-color:rgba(165,42,42,0.9)!important}.my_notify{background-color:rgba(165,42,42,0.7)!important}.socket_button>[href]{background-color:rgba(195,62,52,0.9)!important}.strong{color:rgba(205,92,92,0.8)!important}.comment_count{color:rgba(155,62,52,0.9)!important}.bc0.fmkorea_navi>.expanded.list{background-color:rgba(200,0,0,0.1)!important}.bc0.fmkorea_navi>.expanded.list>a[href]{background-color:rgba(155,42,62,0.7)!important}.gn>li>a{background-color:rgba(250,100,100,0.1)!important}.h1{opacity:0.1!important}li.fl{border-color:rgba(229,132,153,0.6)!important}html body .lnb>.icon>li.on>a{background-color:rgba(165,42,42,0.9)!important;box-shadow:inset 0 0 0 100vmax rgba(165,42,42,0.9)!important}body>div.bd_mobile.bd>div.bd_lst_wrp>ol>li.pop1.clear.notice{background-color:transparent!important;box-shadow:inset 0 0 0 100vmax rgba(255,210,210,0.5)!important;border-color:rgba(229,132,153,0.5)!important}body>div.bd_mobile.bd>div.bd_lst_wrp>div>ul>li.on>div.li>div.hotdeal_info>span>a.strong{color:rgba(205,0,0,0.8)!important}a.btn_img-on{ border-color:rgba(165,42,42,0.9)!important;color:rgba(165,42,42,0.9)!important;}div.socket_button[data-count]>a[href="javascript:;"]>span{color:rgba(255, 210, 210, 1) !important;}`);
        const meta = doc.createElement('meta');
        meta.name = "theme-color";
        meta.content = "#b13e3e";
        (doc.head || doc.documentElement).appendChild(meta);
    }

    const noop = () => {};
    const freeze = (o, k, v) => Object.defineProperty(o, k, {value: v, writable: false, configurable: false});

    try {
        if (!isMobile || getVal('preventAffiliate')) freeze(uw, 'link_url', '');
        if (!isMobile || getVal('noWatermark')) {
            freeze(uw, 'var7', 0);
            addCss('#bd_capture{background:none!important}');
        }
        if (isMobile && getVal('removePowerLink')) {
            freeze(uw, 'board_block_check', noop);
            freeze(uw, '_make_power_link_identifier', noop);
        }
    } catch(e) {}

    const hider = [];
    if (isMobile) {
        if (getVal('blockNotice')) hider.push('.show_folded_notice.pop0.notice, li.pop0.clear.notice');
        if (getVal('blockSearchAssist')) hider.push('.search_assist_hover,#search_assist_wrapper');
        if (getVal('blockNav')) hider.push('.bc0.fmkorea_navi');
        if (getVal('blockRecent')) hider.push('.main_recent,#fmrecentvisited-recent-visits');
        if (getVal('blockFmAlert')) hider.push('#fm_alert,.fm_alert');
        if (hider.length) addCss(`${hider.join(', ')} { display: none !important; }`);
    }

    const isBad = (el) => {
        const s = window.getComputedStyle(el);
        const h = parseInt(s.height), p = parseFloat(s.padding), mt = parseFloat(s.marginTop), ml = parseFloat(s.marginLeft);
        return (h >= 60 && h <= 200 && p <= 5 && mt <= 5 && ml <= 5);
    };

    let adCheckActive = false;
    let adTimer;

    const killAds = () => {
        if (!isMobile || !getVal('removePowerLink')) return;
        if (!doc.body) return window.addEventListener('DOMContentLoaded', killAds);
        if (!doc.body.classList.contains('mac_os')) return;

        const sweep = () => qsa('script ~ div.bd_mobile.bd, section.fmWidgetStyle2019.bd_mobile.bd').forEach(el => isBad(el) && el.remove());
        sweep();

        adCheckActive = true;
        if (adTimer) clearTimeout(adTimer);
        adTimer = setTimeout(() => { adCheckActive = false; }, 1500);
    };

    const fixLinks = () => {
        if (isMobile && !getVal('preventAffiliate')) return;
        if (!doc.body) return window.addEventListener('DOMContentLoaded', fixLinks);
        if (doc.body.dataset.lfx) return;
        doc.body.dataset.lfx = '1';

        const handler = (e) => {
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
        imgRx: /\.(jpe?g|png|webp|avif|gif)([?&#/].*)?$/i,
        vidRx: /\.(mp4|mkv)([?&#].*)?$/i,
        imgEncRx: /\.(jpe?g|png|webp|avif|gif)%3F/i,
        imgHosts: ['pbs.twimg.com', 'images?q', '/image/', '/img', 'thumb', '/_next/image?url=']
    };
    
    const processed = new Set();
    const cleanSet = () => {
        try {
            const cur = new Set();
            qsa('li[id^="comment"] a[href]').forEach(a => cur.add(a.getAttribute('href')));
            processed.forEach(u => !cur.has(u) && processed.delete(u));
        } catch(e) {}
    };

    const getType = (url) => {
        if (CFG.imgRx.test(url) || CFG.imgEncRx.test(url)) return 'img';
        if (CFG.vidRx.test(url)) return 'video';
        return CFG.imgHosts.some(host => url.includes(host)) ? 'img' : null;
    };

    const mkEl = (type, src, txt) => {
        const el = doc.createElement(type);
        el.src = src.startsWith('//') ? 'https:' + src : src;
        Object.assign(el.style, {maxWidth: '100%', display: 'block', marginTop: '10px', marginBottom: '10px'});
        el.loading = 'lazy';
        if (type === 'img') el.alt = txt;
        else el.controls = true;
        return el;
    };

    const embed = () => {
        try {
            cleanSet();
            qsa('li[id^="comment"]:not([data-done])').forEach(comment => {
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
                        element.onerror = () => {
                            try { element.remove(); link.style.display = ''; processed.delete(url); } catch(e){}
                        };
                        link.parentNode.insertBefore(element, link.nextSibling);
                    } catch(e) {}
                });
            });
        } catch(e) {}
    };

    let bUsers = [], bKeys = [];
    const updLists = () => {
        bUsers = getList('blockUserList');
        bKeys = getList('blockKeywordList');
    };
    if (isMobile) updLists();

    const redTxt = () => {
        qsa('.xe_content > span').forEach(s => s.textContent.includes('제휴 링크') && s.style.setProperty('color', 'rgba(165,42,42,0.9)', 'important'));
        qsa('li span').forEach(s => s.textContent.trim() === '포텐' && s.style.setProperty('background-color', 'rgba(165,42,42,0.9)', 'important'));
    };

    const scan = (li) => {
        let hide = false;
        if (getVal('blockUser') && bUsers.length) {
            const auth = qs('.author', li), lnk = qs('a[onclick]', li);
            const addr = qs('address > strong', li);
            const infos = qsa('.rt_area > .info > span', li);
            
            if (auth && bUsers.some(n => auth.textContent.trim().endsWith('/ ' + n))) hide = true;
            else if (lnk && bUsers.some(n => lnk.textContent.trim() === n)) hide = true;
            
            if (!hide && (addr || infos.length)) {
                hide = bUsers.some(n => {
                    const esc = escRE(n);
                    if (addr && new RegExp(`^${esc}$`).test(addr.textContent.trim())) return true;
                    if (infos.length && Array.from(infos).some(sp => new RegExp(`${esc}$`).test(sp.textContent.trim()))) return true;
                    return false;
                });
            }
        }
        if (!hide && getVal('blockKeyword') && bKeys.length) {
            const txts = qsa('.xe_content, .read_more', li);
            const srchT = qs('dl > dt > a', li), clrT = qs('.rt_area > h3 > a', li);
            
            for (const t of txts) {
                if (bKeys.some(k => t.textContent.includes(k))) { hide = true; break; }
            }
            if (!hide && (srchT || clrT)) {
                if (bKeys.some(k => (srchT && srchT.textContent.includes(k)) || (clrT && clrT.textContent.includes(k)))) hide = true;
            }
        }
        li.style.cssText += hide ? 'display: none !important;' : (li.style.display === 'none' ? 'display: ;' : '');
    };

    const rescan = () => qsa('li').forEach(scan);

    let embedTimer;
    const runEmbed = () => {
        if (embedTimer) clearTimeout(embedTimer);
        embedTimer = setTimeout(() => {
            window.requestIdleCallback ? window.requestIdleCallback(embed) : setTimeout(embed, 0);
        }, 100);
    };

    const mainObserver = new MutationObserver(ms => {
        const doAds = isMobile && getVal('removePowerLink') && adCheckActive;
        const doEmbed = isMobile && getVal('imgEmbed');
        const doFilter = isMobile && (getVal('blockUser') || getVal('blockKeyword') || getVal('redTheme'));
        const doRed = isMobile && getVal('redTheme');

        if (!doAds && !doEmbed && !doFilter) return;

        ms.forEach(m => {
            if (!m.addedNodes.length) return;
            m.addedNodes.forEach(n => {
                if (n.nodeType !== 1) return;

                if (doFilter) {
                    if (n.tagName === 'LI') scan(n);
                    else if (n.querySelectorAll) n.querySelectorAll('li').forEach(scan);
                }

                if (doRed) redTxt();

                if (doAds) {
                    if (n.matches && (n.matches('div.bd_mobile.bd') || n.matches('section.fmWidgetStyle2019'))) {
                        if (isBad(n)) n.remove();
                    } else if (n.querySelectorAll) {
                        n.querySelectorAll('script ~ div.bd_mobile.bd, section.fmWidgetStyle2019.bd_mobile.bd').forEach(el => isBad(el) && el.remove());
                    }
                }

                if (doEmbed) {
                    if ((n.matches && n.matches('li[id^="comment"]')) || (n.querySelector && n.querySelector('li[id^="comment"]'))) {
                        runEmbed();
                    }
                }
            });
        });
    });

    window.addEventListener('pageshow', (e) => (e.persisted || (window.performance && window.performance.navigation.type === 2)) && killAds());

    const loader = () => {
        killAds();
        fixLinks();
        if (isMobile && getVal('imgEmbed')) embed();
        if (isMobile && getVal('redTheme')) redTxt();
        if (isMobile) {
            rescan();
            mainObserver.observe(doc.documentElement || doc.body, {childList: true, subtree: true});
        }
    };
    
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', loader);
    else loader();

    let uiLoaded = false;
    let _refreshTags = null; 

    const getTheme = () => (qs('meta[name="theme-color"]') || {}).content || '#34495e';
    const initUI = () => (doc.readyState === 'loading') ? doc.addEventListener('DOMContentLoaded', addBtn) : addBtn();

    const addBtn = () => {
        const hdr = qs('#header') || qs('header');
        if (!hdr || qs('span[role="gallset"]', hdr)) return;
        const btn = doc.createElement('span');
        btn.setAttribute('role', 'gallset');
        btn.style.cssText = `display:inline;align-items:center;justify-content:center;width:30px;height:30px;margin-left:10px;margin-top:1px;cursor:pointer;z-index:10;position:relative;top:4px;right:10px;color:#ffffff;`;
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>`;
        const load = () => { loadUI(); ['touchstart', 'mousedown', 'mouseover'].forEach(e => btn.removeEventListener(e, load)); };
        ['touchstart', 'mousedown', 'mouseover'].forEach(e => btn.addEventListener(e, load));
        btn.addEventListener('click', (e) => { e.preventDefault(); toggleUI(); });
        hdr.appendChild(btn);
    };

    const loadUI = () => {
        if (uiLoaded) return;
        uiLoaded = true;
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        addCss(`:root{--fmk-theme:${getTheme()}}#fmk-settings-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99998;opacity:0;visibility:hidden;backdrop-filter:blur(2px);transition:opacity 0.25s ease,visibility 0.25s ease}#fmk-settings-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-48%) scale(0.96);width:90%;max-width:350px;max-height:85vh;background:${isDark?'rgba(40,40,40,0.95)':'rgba(255,255,255,0.98)'};color:${isDark?'#eee':'#333'};border:1px solid ${isDark?'#555':'#ddd'};border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.3);z-index:99999;display:flex;flex-direction:column;font-size:14px;user-select:none;opacity:0;visibility:hidden;transition:opacity 0.25s cubic-bezier(0.2,0.8,0.2,1),transform 0.25s cubic-bezier(0.2,0.8,0.2,1),visibility 0.25s}.fmk-open#fmk-settings-overlay{opacity:1;visibility:visible}.fmk-open#fmk-settings-panel{opacity:1;visibility:visible;transform:translate(-50%,-50%) scale(1)}.fmk-panel-header{padding:15px;border-bottom:1px solid ${isDark?'#555':'#eee'};font-weight:bold;font-size:17px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}.fmk-panel-close{cursor:pointer;padding:5px;font-size:20px;line-height:1;color:#888}.fmk-panel-body{padding:15px;overflow-y:auto;flex-grow:1}.fmk-opt-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.fmk-opt-label{font-weight:bold;text-align:left;flex:1;margin-right:15px;font-size:15px}.fmk-opt-info{font-size:11px;color:#999;margin-top:-5px;margin-bottom:15px;text-align:left;line-height:1.4}.fmk-switch{position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0}.fmk-switch input{opacity:0;width:0;height:0}.fmk-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.3s;border-radius:24px}.fmk-slider:before{position:absolute;content:"";height:18px;width:18px;left:3px;bottom:3px;background-color:white;transition:.3s;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.2)}input:checked+.fmk-slider{background-color:var(--fmk-theme)}input:checked+.fmk-slider:before{transform:translateX(20px)}.fmk-input-group{display:none;gap:5px;margin-bottom:8px;width:100%;box-sizing:border-box;align-items:center}.fmk-input-text{flex:1;min-width:0;padding:8px;border-radius:4px;border:1px solid ${isDark?'#666':'#ddd'};background:${isDark?'#333':'#fff'};color:inherit;font-size:13px;height:38px;box-sizing:border-box}.fmk-btn{width:50px;flex-shrink:0;height:38px;border-radius:4px;border:none;cursor:pointer;background:${isDark?'#555':'#eee'};color:inherit;font-weight:bold;font-size:13px;white-space:nowrap;display:flex;align-items:center;justify-content:center;transition:background-color 0.2s,color 0.2s}.fmk-btn:active{opacity:0.8}.fmk-tag-container{display:none;flex-wrap:wrap;gap:5px;padding:8px;border:1px solid ${isDark?'#666':'#ddd'};border-radius:4px;background:${isDark?'#333':'#f9f9f9'};max-height:120px;overflow-y:auto;margin-bottom:8px;min-height:30px}.expanded .fmk-tag-container,.expanded .fmk-input-group{display:flex}.fmk-tag{background:${isDark?'#555':'#e0e0e0'};padding:4px 8px;border-radius:12px;font-size:12px;display:flex;align-items:center;color:inherit;word-break:break-all}.fmk-tag-close{margin-left:6px;cursor:pointer;font-weight:bold;opacity:0.6;font-size:14px;line-height:1}.fmk-tag-close:hover{opacity:1}.fmk-icons-area{display:none;gap:10px;margin-right:10px}.expanded .fmk-icons-area{display:flex;align-items:center}.fmk-icon-btn{cursor:pointer;opacity:0.6;transition:opacity 0.2s;display:flex;align-items:center;justify-content:center;width:24px;height:24px}.fmk-icon-btn:hover{opacity:1}`);

        const overlay = doc.createElement('div'); overlay.id = 'fmk-settings-overlay';
        const panel = doc.createElement('div'); panel.id = 'fmk-settings-panel';
        
        const svgIcon = {
            export: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
            import: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`
        };

        const blkHtml = (id, label) => `
            <div class="fmk-block-section" id="${id}">
                <div class="fmk-opt-row">
                    <div class="fmk-opt-label">${label}</div>
                    <div class="fmk-icons-area">
                         <div class="fmk-icon-btn export-btn" title="내보내기">${svgIcon.export}</div>
                         <div class="fmk-icon-btn import-btn" title="불러오기">${svgIcon.import}</div>
                         <input type="file" accept=".json,.txt" style="display:none" class="import-file">
                    </div>
                    <label class="fmk-switch"><input type="checkbox" id="fmk_opt_${id.replace('section_','')}"><span class="fmk-slider"></span></label>
                </div>
                <div class="fmk-input-group">
                    <input type="text" class="fmk-input-text" placeholder="입력 후 등록">
                    <button class="fmk-btn add-btn">등록</button>
                </div>
                <div class="fmk-tag-container"></div>
            </div>`;

        panel.innerHTML = `<div class="fmk-panel-header"><span>Settings</span><span class="fmk-panel-close">&times;</span></div><div class="fmk-panel-body"><div class="fmk-opt-info" style="text-align:center;margin-bottom:15px">대부분의 설정은 새로고침 후에 적용됩니다. 안 쓰는 옵션은 끄세요.</div><div class="fmk-opt-row"><div class="fmk-opt-label">파워링크 제거</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_powerlink"><span class="fmk-slider"></span></label></div><div class="fmk-opt-info">갤러리 필터 또는 Unicorn Pro 사용시 필요하지 않습니다.</div><div class="fmk-opt-row"><div class="fmk-opt-label">핫딜 제휴링크 변환 방지</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_affiliate"><span class="fmk-slider"></span></label></div><div class="fmk-opt-info">AdGuard 추적보호 필터 또는 갤러리 필터 사용시 필요하지 않습니다.</div><div class="fmk-opt-row"><div class="fmk-opt-label">캡쳐방지 및 워터마크 해제</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_watermark"><span class="fmk-slider"></span></label></div><div class="fmk-opt-info">AdGuard 기타 방해요소 필터 사용시 필요하지 않습니다.</div><div class="fmk-opt-row"><div class="fmk-opt-label">댓글 이미지 임베딩</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_imgembed"><span class="fmk-slider"></span></label></div><hr style="border:0;border-top:1px solid ${isDark?'#444':'#eee'};margin:15px 0;">
        ${blkHtml('section_block_user', '유저 차단')}
        ${blkHtml('section_block_keyword', '게시물/댓글 키워드 차단')}
        <hr style="border:0;border-top:1px solid ${isDark?'#444':'#eee'};margin:15px 0;"><div class="fmk-opt-row"><div class="fmk-opt-label">공지사항 차단</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_block_notice"><span class="fmk-slider"></span></label></div><div class="fmk-opt-row"><div class="fmk-opt-label">검색 어시스턴트 차단</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_block_assist"><span class="fmk-slider"></span></label></div><div class="fmk-opt-row"><div class="fmk-opt-label">포텐 메인 Navi 차단</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_block_nav"><span class="fmk-slider"></span></label></div><div class="fmk-opt-row"><div class="fmk-opt-label">최근방문 게시판 목록 차단</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_block_recent"><span class="fmk-slider"></span></label></div><div class="fmk-opt-row"><div class="fmk-opt-label">새 포텐 알림 차단</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_block_alert"><span class="fmk-slider"></span></label></div><div class="fmk-opt-row" style="margin-top:15px;"><div class="fmk-opt-label">FM Korea RED 테마</div><label class="fmk-switch"><input type="checkbox" id="fmk_opt_red_theme"><span class="fmk-slider"></span></label></div></div>`;
        doc.body.append(overlay, panel);
        overlay.addEventListener('click', toggleUI);
        qs('.fmk-panel-close', panel).addEventListener('click', toggleUI);
        bindUI();
    };

    const bindUI = () => {
        const bind = (id, key, sec) => {
            const el = qs('#' + id);
            if (!el) return;
            el.checked = getVal(key);
            if (sec) {
                const s = qs('#' + sec);
                if (el.checked) s.classList.add('expanded');
            }
            el.addEventListener('change', (e) => {
                setVal(key, e.target.checked);
                if (sec) {
                    const s = qs('#' + sec);
                    e.target.checked ? s.classList.add('expanded') : s.classList.remove('expanded');
                    if (key === 'blockUser' || key === 'blockKeyword') { 
                        updLists(); rescan(); 
                        if(e.target.checked) renderTags(s, key);
                    }
                }
            });
        };

        const renderTags = (sec, key) => {
            const list = getList(key);
            const con = qs('.fmk-tag-container', sec);
            con.innerHTML = '';
            list.forEach((item, idx) => {
                const tag = doc.createElement('div');
                tag.className = 'fmk-tag';
                tag.innerHTML = `${item.replace(/</g,'&lt;')}<span class="fmk-tag-close" data-idx="${idx}">&times;</span>`;
                tag.querySelector('.fmk-tag-close').addEventListener('click', () => {
                    list.splice(idx, 1);
                    setList(key, list);
                    renderTags(sec, key);
                    updLists(); rescan();
                });
                con.appendChild(tag);
            });
        };
        
        _refreshTags = () => {
            ['section_block_user', 'section_block_keyword'].forEach(sid => {
                 const s = qs('#'+sid);
                 const k = sid === 'section_block_user' ? 'blockUserList' : 'blockKeywordList';
                 if(qs('#fmk_opt_'+sid.replace('section_','')).checked) renderTags(s, k);
            });
        };

        const map = [
            ['fmk_opt_powerlink', 'removePowerLink'], ['fmk_opt_affiliate', 'preventAffiliate'], ['fmk_opt_watermark', 'noWatermark'], ['fmk_opt_imgembed', 'imgEmbed'],
            ['fmk_opt_red_theme', 'redTheme'], ['fmk_opt_block_notice', 'blockNotice'], ['fmk_opt_block_assist', 'blockSearchAssist'],
            ['fmk_opt_block_nav', 'blockNav'], ['fmk_opt_block_recent', 'blockRecent'], ['fmk_opt_block_alert', 'blockFmAlert'],
            ['fmk_opt_block_user', 'blockUser', 'section_block_user'], ['fmk_opt_block_keyword', 'blockKeyword', 'section_block_keyword']
        ];
        map.forEach(m => bind(...m));

        ['section_block_user', 'section_block_keyword'].forEach(sid => {
            const s = qs('#' + sid), inp = qs('input.fmk-input-text', s), addBtn = qs('.add-btn', s);
            const expBtn = qs('.export-btn', s), impBtn = qs('.import-btn', s), fileInp = qs('.import-file', s);
            const k = sid === 'section_block_user' ? 'blockUserList' : 'blockKeywordList';

            addBtn.addEventListener('click', () => {
                const v = inp.value.trim();
                if (!v) return;
                const list = getList(k);
                if (!list.includes(v)) {
                    list.push(v);
                    setList(k, list);
                    renderTags(s, k);
                    updLists(); rescan();
                }
                inp.value = '';
            });

            expBtn.addEventListener('click', () => {
                const list = getList(k);
                const blob = new Blob([JSON.stringify(list, null, 2)], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = doc.createElement('a');
                a.href = url;
                a.download = `${sid === 'section_block_user' ? 'fmk_block_users' : 'fmk_block_keywords'}.json`;
                a.click();
                URL.revokeObjectURL(url);
            });

            impBtn.addEventListener('click', () => fileInp.click());
            fileInp.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const parsed = JSON.parse(ev.target.result);
                        if (Array.isArray(parsed)) {
                            if (confirm(`현재 목록을 덮어쓰시겠습니까? (확인: 덮어쓰기 / 취소: 병합)`)) {
                                setList(k, parsed);
                            } else {
                                const current = getList(k);
                                const merged = [...new Set([...current, ...parsed])];
                                setList(k, merged);
                            }
                            renderTags(s, k);
                            updLists(); rescan();
                        } else alert('올바른 JSON 형식이 아닙니다.');
                    } catch(err) { alert('파일을 읽는 중 오류가 발생했습니다.'); }
                    fileInp.value = '';
                };
                reader.readAsText(file);
            });
        });
    };

    const toggleUI = () => {
        if (!uiLoaded) {
            loadUI();
            setTimeout(() => {
                qs('#fmk-settings-overlay').classList.add('fmk-open');
                qs('#fmk-settings-panel').classList.add('fmk-open');
                if(_refreshTags) _refreshTags();
            }, 10);
            return;
        }
        const ov = qs('#fmk-settings-overlay'), pn = qs('#fmk-settings-panel');
        ov.classList.toggle('fmk-open');
        pn.classList.toggle('fmk-open');
        if (pn.classList.contains('fmk-open') && _refreshTags) _refreshTags();
    };

    if (isMobile) initUI();
})();
