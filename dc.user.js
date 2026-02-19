// ==UserScript==
// @name         Dcinside Expert Extension
// @namespace    https://github.com/hooray804/adguard-gallery-filter
// @version      1.1.5
// @description  [디시인사이드 모바일 전용] 무한 스크롤, 이미지 미리보기, 비추천수 로드, 유저 메모 등의 기능을 추가합니다.
// @author       hooray804 and Gemini
// @match        https://m.dcinside.com/board/*
// @match        https://m.dcinside.com/mini/*
// @exclude      https://m.dcinside.com/board/dcbest*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// @license      Apache-2.0
// @supportURL   https://github.com/hooray804/adguard-gallery-filter/issues
// @downloadURL  https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/dc.user.js
// @updateURL    https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/dc.user.js
// ==/UserScript==

(function() {
    'use strict';

    const DB_NAME = 'dc_expert_db';
    const DB_VERSION = 1;
    const STORE_NAME = 'post_cache';
    const CACHE_EXPIRE_TIME = 60 * 60 * 1000;

    let dbInstance = null;

    const getDB = () => {
        return new Promise((resolve, reject) => {
            if (dbInstance) return resolve(dbInstance);
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
                    store.createIndex('time', 'time', { unique: false });
                }
            };

            request.onsuccess = (e) => {
                dbInstance = e.target.result;
                cleanupOldCache(dbInstance);
                resolve(dbInstance);
            };
            request.onerror = (e) => reject(e);
        });
    };

    const cleanupOldCache = (db) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('time');
        
        const cutOffDate = Date.now() - CACHE_EXPIRE_TIME;
        const range = IDBKeyRange.upperBound(cutOffDate);

        index.openCursor(range).onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                store.delete(cursor.primaryKey);
                cursor.continue();
            }
        };
    };

    const dbGet = async (url) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const request = transaction.objectStore(STORE_NAME).get(url);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

    const dbPut = async (data) => {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const request = transaction.objectStore(STORE_NAME).put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

            const processInBatches = async (items, batchSize = 3) => {
               for (let i = 0; i < items.length; i += batchSize) {
                   const batch = Array.from(items).slice(i, i + batchSize);
                   await Promise.all(batch.map(item => processListItem(item)));
                    if (i + batchSize < items.length) {
                        await new Promise(resolve => setTimeout(resolve, 500));
               }
           };

    const getData = (id) => GM_getValue('dc_user_' + id, { memo: "" });
    const setData = (id, data) => GM_setValue('dc_user_' + id, data);

    window.openUserEditor = function(id, nickname) {
        const data = getData(id);
        const newMemo = prompt(`[${nickname}] 메모 입력 (비우면 삭제):`, data.memo);

        if (newMemo !== null) {
            setData(id, { memo: newMemo });
            location.reload();
        }
    };

    function createUI(id, nickname) {
        const data = getData(id);
        const container = document.createElement('span');
        container.className = 'custom-memo-area';
        container.style.marginLeft = "4px";
        container.style.cursor = "pointer";
        container.style.display = "inline-block";
        container.style.verticalAlign = "middle";
        container.style.flexShrink = "0";

        if (data.memo) {
            container.innerHTML = `<b style="color:#007bff; font-size:0.8em;">[${data.memo}]</b>`;
        } else {
            container.innerHTML = `<small style="color:#ccc; font-size:0.7em;">[📝]</small>`;
        }

        container.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.openUserEditor(id, nickname);
        };
        return container;
    }

    function parseUserFromElement(authorBox) {
        if (!authorBox) return null;
        const nickLi = authorBox.querySelector('.ginfo2 li:first-child');
        const gallogBtn = authorBox.querySelector('.rt a.btn-line-gray');

        if (nickLi) {
            let userId = "";
            let nickname = nickLi.innerText.trim();

            if (gallogBtn) {
                userId = gallogBtn.getAttribute('href').split('/').pop();
            } else {
                const ipMatch = nickname.match(/\(([^)]+)\)/);
                userId = ipMatch ? ipMatch[1] : nickname;
            }
            return { userId, nickname };
        }
        return null;
    }

    function processPostView() {
        const authorBox = document.querySelector('.gallview-tit-box');
        if (authorBox && !authorBox.dataset.memoApplied) {
            const userInfo = parseUserFromElement(authorBox);
            if (userInfo) {
                const nickLi = authorBox.querySelector('.ginfo2 li:first-child');
                
                if (nickLi.childNodes.length > 0 && nickLi.childNodes[0].nodeType === 3) {
                    const textNode = nickLi.childNodes[0];
                    const textSpan = document.createElement('span');
                    textSpan.textContent = textNode.textContent;
                    textSpan.style.cssText = "overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 0 1 auto;";
                    
                    nickLi.style.display = "inline-flex";
                    nickLi.style.alignItems = "center";
                    nickLi.style.maxWidth = "100%";
                    
                    nickLi.replaceChild(textSpan, textNode);
                    nickLi.appendChild(createUI(userInfo.userId, userInfo.nickname));
                } else {
                    nickLi.appendChild(createUI(userInfo.userId, userInfo.nickname));
                }
                authorBox.dataset.memoApplied = true;
            }
        }

        const commentList = document.querySelectorAll('.all-comment-lst li[id^="comment_cnt_"]');
        commentList.forEach(li => {
            if (li.dataset.memoApplied) return;

            const nickAnchor = li.querySelector('a.nick');
            if (!nickAnchor) return;

            let userId = "";
            const infoSpan = li.querySelector('.blockCommentId');
            const ipSpan = li.querySelector('.ip');

            if (infoSpan && infoSpan.getAttribute('data-info')) {
                userId = infoSpan.getAttribute('data-info');
            } else if (nickAnchor.href && nickAnchor.href.includes('gallog/')) {
                userId = nickAnchor.href.split('/').pop();
            } else if (ipSpan) {
                userId = ipSpan.innerText.trim().replace(/[()]/g, '');
            }

            if (userId) {
                const nickname = nickAnchor.childNodes[0].textContent.trim();
                
                if (nickAnchor.childNodes.length > 0 && nickAnchor.childNodes[0].nodeType === 3) {
                    const textNode = nickAnchor.childNodes[0];
                    const textSpan = document.createElement('span');
                    textSpan.textContent = textNode.textContent;
                    textSpan.style.cssText = "overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 0 1 auto; pointer-events: none;";
                    
                    nickAnchor.style.display = "inline-flex";
                    nickAnchor.style.alignItems = "center";
                    nickAnchor.style.maxWidth = "100%";
                    nickAnchor.style.verticalAlign = "bottom";
                    
                    nickAnchor.replaceChild(textSpan, textNode);
                    nickAnchor.appendChild(createUI(userId, nickname));
                } else {
                    nickAnchor.appendChild(createUI(userId, nickname));
                }
                
                li.dataset.memoApplied = true;
            }
        });
    }

    let isFetching = false;
    let nextPage = 2;
    const listContainer = document.querySelector('ul.gall-detail-lst');

    const style = document.createElement('style');
    style.innerHTML = `
        ul.gall-detail-lst .gall-detail-lnktb {
            display: flex !important;
            align-items: center !important;
            padding: 5px 10px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            background: #fff !important;
        }
        ul.gall-detail-lst .gall-detail-lnktb .lt {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        ul.gall-detail-lst .gall-detail-lnktb .lt .subject-add {
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            font-size: 14px !important;
        }
        ul.gall-detail-lst .gall-detail-lnktb .lt .subject-add .subjectin {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            flex: 0 1 auto !important;
        }
        .custom-comment-count {
            color: #222222 !important;
            font-weight: bold !important;
            font-size: 13px !important;
            margin-left: 4px !important;
            flex: 0 0 auto !important;
            margin-top: 0px !important;
        }
        ul.gall-detail-lst .gall-detail-lnktb .lt .ginfo {
            display: flex !important;
            margin-top: 2px !important;
            padding: 0 !important;
            flex-wrap: nowrap !important;
        }
        ul.gall-detail-lst .gall-detail-lnktb .lt .ginfo li {
            font-size: 12px !important;
            margin-right: 2px !important;
            color: #888 !important;
            white-space: nowrap !important;
        }
        .dc-preview-thumb {
            flex: 0 0 45px !important;
            width: 45px !important;
            height: 45px !important;
            border-radius: 4px !important;
            object-fit: cover !important;
            margin-left: 4px !important;
            margin-right: 8px !important;
            background-color: transparent !important;
            visibility: hidden;
        }
        ul.gall-detail-lst .gall-detail-lnktb .rt { display: none !important; }
        .dislike-cnt {
            color: #888 !important;
            font-size: 12px !important;
            margin-left: 3px !important;
        }
        .page-divider {
            display: flex;
            align-items: center;
            margin: 15px 0;
            color: #ccc;
            font-size: 11px;
            font-weight: normal;
        }
        .page-divider::before, .page-divider::after {
            content: "";
            flex: 1;
            height: 1px;
            background: #eee;
            margin: 0 10px;
        }
        @media (prefers-color-scheme: dark) {
            ul.gall-detail-lst .gall-detail-lnktb { background: #121212 !important; }
            ul.gall-detail-lst .gall-detail-lnktb .lt .subject-add { color: #e1e1e1 !important; }
            .custom-comment-count { color: #bbbbbb !important; }
            ul.gall-detail-lst .gall-detail-lnktb .lt .ginfo li { color: #888 !important; }
            .dc-preview-thumb { background-color: #121212 !important; }
            .dislike-cnt { color: #888 !important; }
            .page-divider { color: #444; }
            .page-divider::before, .page-divider::after { background: #2a2a2a; }
            .custom-memo-area b { color: #66b0ff !important; }
        }
    `;
    document.head.appendChild(style);

    const processListItem = async (li) => {
        if (li.dataset.processed) return;
        li.dataset.processed = "true";

        if (li.classList.contains('adv-inner') || li.classList.contains('click_ad')) return;

        const linkElement = li.querySelector('a.lt');
        const rtElement = li.querySelector('a.rt');
        const lnkTable = li.querySelector('.gall-detail-lnktb');
        const subjectAdd = li.querySelector('.subject-add');

        if (!linkElement || !lnkTable) return;

        if (rtElement && subjectAdd) {
            const ctSpan = rtElement.querySelector('.ct');
            if (ctSpan && ctSpan.innerText.trim() !== '') {
                const commentCount = document.createElement('span');
                commentCount.className = 'custom-comment-count';
                commentCount.innerText = `[${ctSpan.innerText.trim()}]`;
                subjectAdd.appendChild(commentCount);
            }
            rtElement.remove();
        }

        const img = document.createElement('img');
        img.className = 'dc-preview-thumb';
        lnkTable.prepend(img);

        const url = linkElement.href;
        const now = Date.now();
        let cachedData = null;

        try {
            const stored = await dbGet(url);
            if (stored) {
                if (now - stored.time < 90000) {
                    cachedData = stored;
                }
            }
        } catch(e) {}

        const applyDOM = (imgUrl, dislikeCount, userInfo) => {
            const isDefaultIcon = imgUrl && (imgUrl.includes('dcinside_icon.png') || imgUrl.includes('no_img'));
            if (imgUrl && !isDefaultIcon && (li.querySelector('.sp-lst-img, .sp-lst-recoimg'))) {
                img.src = imgUrl;
                img.style.visibility = 'visible';
                img.style.backgroundColor = '#f2f2f2';
            } else {
                img.style.visibility = 'hidden';
                img.style.backgroundColor = 'transparent';
            }

            if (dislikeCount !== null) {
                const ginfoLis = li.querySelectorAll('.ginfo li');
                ginfoLis.forEach(infoLi => {
                    if (infoLi.textContent.includes('추천') && !infoLi.querySelector('.dislike-cnt')) {
                        const dislikeSpan = document.createElement('span');
                        dislikeSpan.className = 'dislike-cnt';
                        dislikeSpan.innerText = `비추 ${dislikeCount}`;
                        infoLi.appendChild(dislikeSpan);
                    }
                });
            }

            if (userInfo && userInfo.userId) {
                const ginfoLis = li.querySelectorAll('.ginfo li');
                for (let infoLi of ginfoLis) {
                    const text = infoLi.innerText.trim();
                    if (text === userInfo.nickname || text.startsWith(userInfo.nickname.split('(')[0])) {
                        if (!infoLi.querySelector('.custom-memo-area')) {
                            infoLi.appendChild(createUI(userInfo.userId, userInfo.nickname));
                        }
                        break;
                    }
                }
            }
        };

        if (cachedData) {
            applyDOM(cachedData.imgUrl, cachedData.dislikeCount, cachedData.userInfo);
            return;
        }

        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            let imgUrl = null;
            const metaImg = doc.querySelector('meta[property="og:image"]');
            if (metaImg) imgUrl = metaImg.content;
            if (!imgUrl || imgUrl.includes('dcinside_icon.png')) {
                const bodyImg = doc.querySelector('.writing_view_box img, .thum-txtin img');
                if (bodyImg) imgUrl = bodyImg.getAttribute('data-original') || bodyImg.src;
            }

            let dislikeCount = null;
            const nonRecoEl = doc.querySelector('#nonrecomm_btn');
            if (nonRecoEl) {
                dislikeCount = nonRecoEl.innerText.replace(/[^0-9]/g, '');
            }

            const userInfo = parseUserFromElement(doc.querySelector('.gallview-tit-box'));

            applyDOM(imgUrl, dislikeCount, userInfo);

            const saveData = {
                url: url,
                time: Date.now(),
                imgUrl: imgUrl,
                dislikeCount: dislikeCount,
                userInfo: userInfo
            };

            await dbPut(saveData).catch(() => {});
        } catch (e) {
            if (img) img.remove();
        }
    };

    const loadMore = async () => {
        if (isFetching) return;
        isFetching = true;

        const loadingBar = document.createElement('li');
        loadingBar.style.cssText = "text-align:center; padding:10px; color:#ccc; font-size:12px;";
        loadingBar.innerText = "Loading...";
        listContainer.appendChild(loadingBar);

        try {
            const url = new URL(window.location.href);
            url.searchParams.set('page', nextPage);

            const response = await fetch(url.href);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const newPosts = doc.querySelectorAll('ul.gall-detail-lst > li:not(.notice):not(.click_ad)');
            loadingBar.remove();

            if (newPosts.length > 0) {
                const divider = document.createElement('li');
                divider.className = 'page-divider';
                divider.innerText = `PAGE ${nextPage}`;
                listContainer.appendChild(divider);

                newPosts.forEach(post => listContainer.appendChild(post));
                nextPage++;
                await processInBatches(newPosts, 5); 
            }
        } catch (e) {
            loadingBar.remove();
        } finally {
            isFetching = false;
        }
    };

    const handleScroll = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 700) {
            loadMore();
        }
    };

    processPostView();
    const observer = new MutationObserver(processPostView);
    observer.observe(document.body, { childList: true, subtree: true });

    if (listContainer) {
        (async () => {
            const items = listContainer.querySelectorAll('li:not(.notice):not(.click_ad)');
            await processInBatches(items, 5);
        })();

        window.addEventListener('scroll', handleScroll);
        
        const params = new URLSearchParams(window.location.search);
        if (params.has('page')) nextPage = parseInt(params.get('page')) + 1;
    }

})();