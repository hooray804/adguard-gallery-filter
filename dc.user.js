// ==UserScript==
// @name         Dcinside Expert Extension
// @namespace    https://github.com/hooray804/adguard-gallery-filter
// @version      3.0.1
// @description  [디시인사이드 모바일 전용] 무한 스크롤, 이미지 미리보기, 비추천수 로드, 유저 메모, 본문 미리보기 등의 기능을 추가합니다.
// @author       hooray804 and Gemini
// @match        https://m.dcinside.com/board/*
// @match        https://m.dcinside.com/mini/*
// @match        https://m.dcinside.com/dcscrip*
// @exclude      https://m.dcinside.com/board/dcbest*
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.listValues
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @run-at       document-end
// @license      Apache-2.0
// @homepage     https://github.com/hooray804/adguard-gallery-filter
// @supportURL   https://github.com/hooray804/adguard-gallery-filter/issues
// @downloadURL  https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/dc.user.js
// @updateURL    https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/dc.user.js
// ==/UserScript==

(async function() {
    'use strict';

    let new_available;

    async function initMigration() {
        const isNewApiSupported = typeof GM !== 'undefined' && typeof GM.getValue === 'function';
        if (isNewApiSupported) {
            new_available = 'true';
            let isMigrated = await GM.getValue('dc_expert_migrated', false);
            if (!isMigrated) {
                if (typeof GM_listValues === 'function' && typeof GM_getValue === 'function') {
                    try {
                        const keys = GM_listValues();
                        for (const key of keys) {
                            const val = GM_getValue(key);
                            if (val !== undefined) {
                                await GM.setValue(key, val);
                            }
                        }
                    } catch (e) {
                        console.error('Migration failed:', e);
                    }
                }
                await GM.setValue('dc_expert_migrated', true);
            }
        } else {
            new_available = 'false';
        }
    }

    const GM_API = {
        getValue: async (key, defaultValue) => {
            if (new_available === 'true') {
                return await GM.getValue(key, defaultValue);
            } else {
                return typeof GM_getValue === 'function' ? GM_getValue(key, defaultValue) : defaultValue;
            }
        },
        setValue: async (key, value) => {
            if (new_available === 'true') {
                await GM.setValue(key, value);
            } else {
                if (typeof GM_setValue === 'function') GM_setValue(key, value);
            }
        },
        listValues: async () => {
            if (new_available === 'true') {
                return await GM.listValues();
            } else {
                return typeof GM_listValues === 'function' ? GM_listValues() : [];
            }
        }
    };

    await initMigration();

    const CONFIG_VERSION = 2;
    const DEFAULT_SETTINGS = {
        autoScroll: true,
        showImage: true,
        disableFetch: false,
        postPreview: false,
        cacheDuration: 180000,
        showIdCode: false,
        batchDelay: 100,
        version: CONFIG_VERSION
    };

    let settings = await GM_API.getValue('dc_expert_settings', DEFAULT_SETTINGS);

    if (settings.version !== CONFIG_VERSION) {
        settings = { ...DEFAULT_SETTINGS };
        await GM_API.setValue('dc_expert_settings', settings);
    }

    if (window.location.href.includes('m.dcinside.com/dcscrip')) {
        document.body.innerHTML = '';
        document.body.style.padding = '20px';
        document.body.style.fontFamily = 'sans-serif';
        document.body.style.backgroundColor = '#ffffff';

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.style.backgroundColor = '#121212';
            document.body.style.color = '#ffffff';
        }

        const title = document.createElement('h2');
        title.innerText = 'Dcinside Expert Extension 설정';
        document.body.appendChild(title);

        const createToggle = (labelText, key) => {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.margin = '15px 0';
            label.style.fontSize = '16px';
            label.style.cursor = 'pointer';

            label.addEventListener('click', (e) => e.stopPropagation());
            label.addEventListener('touchstart', (e) => e.stopPropagation());

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.marginRight = '10px';
            checkbox.style.width = '20px';
            checkbox.style.height = '20px';
            checkbox.style.accentColor = '#3b5998';

            const statusText = document.createElement('span');
            statusText.style.fontWeight = 'bold';
            statusText.style.marginLeft = '5px';
            statusText.style.marginRight = '10px';
            statusText.style.minWidth = '45px';

            const isDataSaverActive = settings.disableFetch;
            const isForcedOff = ((key === 'showImage' || key === 'postPreview' || key === 'showIdCode') && isDataSaverActive);

            if (isForcedOff) {
                checkbox.checked = false;
                checkbox.disabled = true;
            } else {
                checkbox.checked = settings[key];
            }

            const updateStatusText = () => {
                if (isForcedOff) {
                    statusText.innerText = '[OFF]';
                    statusText.style.color = '#d9534f';
                } else {
                    if (checkbox.checked) {
                        statusText.innerText = '[ON]';
                        statusText.style.color = '#3b5998';
                    } else {
                        statusText.innerText = '[OFF]';
                        statusText.style.color = '#999';
                    }
                }
            };
            updateStatusText();

            checkbox.onchange = async (e) => {
                settings[key] = e.target.checked;
                await GM_API.setValue('dc_expert_settings', settings);
                updateStatusText();
                if (key === 'disableFetch') location.reload();
            };

            label.appendChild(checkbox);
            label.appendChild(statusText);
            label.appendChild(document.createTextNode(labelText));

            if (isForcedOff) {
                const warnMsg = document.createElement('span');
                warnMsg.innerText = ' (데이터 절약 모드 사용 중)';
                warnMsg.style.fontSize = '13px';
                warnMsg.style.color = '#d9534f';
                warnMsg.style.marginLeft = '5px';
                label.appendChild(warnMsg);
            }

            return label;
        };

        const createNumberInput = () => {
            const container = document.createElement('div');
            container.style.margin = '15px 0';

            const label = document.createElement('label');
            label.innerText = '게시글 캐시 시간 (초, 최대 86400): ';
            label.style.fontSize = '16px';

            const input = document.createElement('input');
            input.type = 'number';
            input.style.marginLeft = '10px';
            input.style.padding = '5px';
            input.style.width = '80px';
            input.min = 1;
            input.max = 86400;

            const currentSec = (settings.cacheDuration || 180000) / 1000;
            input.value = currentSec;

            input.onchange = async (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 86400) val = 86400;

                settings.cacheDuration = val * 1000;
                await GM_API.setValue('dc_expert_settings', settings);
                input.value = val;
            };

            container.appendChild(label);
            container.appendChild(input);
            return container;
        };

        const createDelayInput = () => {
            const container = document.createElement('div');
            container.style.margin = '15px 0';

            const label = document.createElement('label');
            label.innerText = '배치 처리 지연 시간 (ms): ';
            label.style.fontSize = '16px';

            const input = document.createElement('input');
            input.type = 'number';
            input.style.marginLeft = '10px';
            input.style.padding = '5px';
            input.style.width = '80px';
            input.min = 0;

            input.value = settings.batchDelay;

            input.onchange = async (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 0) val = 0;

                settings.batchDelay = val;
                await GM_API.setValue('dc_expert_settings', settings);
                input.value = val;
            };

            container.appendChild(label);
            container.appendChild(input);
            return container;
        };

        const createMemoTools = () => {
            const container = document.createElement('div');
            container.style.margin = '20px 0';
            container.style.borderTop = '1px solid #ddd';
            container.style.paddingTop = '15px';

            const title = document.createElement('h3');
            title.innerText = '유저 메모 백업';
            title.style.fontSize = '16px';
            container.appendChild(title);

            const btnStyle = 'padding: 8px 15px; margin-right: 10px; cursor: pointer; border: 1px solid #ccc; background: #f8f8f8; border-radius: 4px;';

            const exportBtn = document.createElement('button');
            exportBtn.innerText = '메모 내보내기 (JSON)';
            exportBtn.style.cssText = btnStyle;
            exportBtn.onclick = async () => {
                const keys = await GM_API.listValues();
                const data = {};
                for (const key of keys) {
                    if (key.startsWith('dc_user_')) {
                        data[key] = await GM_API.getValue(key);
                    }
                }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dc_memos_${new Date().toISOString().slice(0, 25)}.json`;
                a.click();
                URL.revokeObjectURL(url);
            };

            const importInput = document.createElement('input');
            importInput.type = 'file';
            importInput.accept = '.json';
            importInput.style.display = 'none';
            importInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    try {
                        const imported = JSON.parse(evt.target.result);
                        let count = 0;
                        for (const key in imported) {
                            if (key.startsWith('dc_user_')) {
                                await GM_API.setValue(key, imported[key]);
                                count++;
                            }
                        }
                        alert(`${count}개의 메모를 성공적으로 가져왔습니다.`);
                    } catch (err) {
                        alert('파일 형식이 올바르지 않습니다.');
                    }
                };
                reader.readAsText(file);
            };

            const importBtn = document.createElement('button');
            importBtn.innerText = '메모 가져오기';
            importBtn.style.cssText = btnStyle;
            importBtn.onclick = () => importInput.click();

            container.appendChild(exportBtn);
            container.appendChild(importBtn);
            container.appendChild(importInput);
            return container;
        };

        document.body.appendChild(createToggle('무한 스크롤 사용', 'autoScroll'));
        document.body.appendChild(createToggle('이미지 미리보기 사용', 'showImage'));
        document.body.appendChild(createToggle('본문 미리보기 (3줄 모드)', 'postPreview'));
        document.body.appendChild(createToggle('식별 코드 미리보기 (메모와 함께 표시)', 'showIdCode'));
        document.body.appendChild(createToggle('데이터 절약 (섬네일, 본문, 비추, 메모 표시 안 됨)', 'disableFetch'));
        document.body.appendChild(createNumberInput());
        document.body.appendChild(createDelayInput());
        document.body.appendChild(createMemoTools());

        const info = document.createElement('p');
        info.style.marginTop = '20px';
        info.style.color = '#888';
        info.style.fontSize = '13px';
        info.innerText = '설정 변경 후 페이지를 새로고침하면 적용됩니다. 캐시 시간이 길수록 페이지 로딩이 빨라지나 비추천 수 실시간 반영이 지연됩니다. 배치 처리 지연 시간이 길수록 IP 기반의 Rate Limit 빈도가 줄어 비어있는 미리보기 등의 비율이 감소하지만, 게시글 목록에서 미리보기 등의 로딩 시간이 길어집니다. 모든 메모는 브라우저 내부에만 저장되어 브라우저 데이터 삭제 시 복구되지 않으므로 설정을 통해 정기적으로 백업하시기 바랍니다. 스크립트 개선을 위해 3.0.0 버전에서 설정을 초기화했습니다. 원하시는 맞춤 설정을 다시 적용해주세요. 현재 디시인사이드 측의 Rate Limit 등의 알 수 없는 문제로 기능이 제대로 작동하지 않을 수 있습니다.';
        document.body.appendChild(info);

        return;
    }

    const DB_NAME = 'dc_expert_db';
    const DB_VERSION = 3;
    const STORE_NAME = 'post_cache';
    const CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000;

    let dbInstance = null;

    const getDB = () => {
        return new Promise((resolve, reject) => {
            if (dbInstance) return resolve(dbInstance);
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (db.objectStoreNames.contains(STORE_NAME)) {
                    db.deleteObjectStore(STORE_NAME);
                }
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
                store.createIndex('time', 'time', { unique: false });
            };

            request.onsuccess = (e) => {
                dbInstance = e.target.result;
                if (Math.random() < 0.05) {
                    cleanupOldCache(dbInstance);
                }
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

    const processInBatches = async (items, batchSize = 4) => {
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = Array.from(items).slice(i, i + batchSize);
            await Promise.all(batch.map(item => processListItem(item)));
            if (i + batchSize < items.length && !settings.disableFetch) {
                if (settings.batchDelay > 0) {
                    await new Promise(resolve => setTimeout(resolve, settings.batchDelay));
                }
            }
        }
    };

    const getData = async (id) => await GM_API.getValue('dc_user_' + id, { memo: "" });
    const setData = async (id, data) => await GM_API.setValue('dc_user_' + id, data);

    window.openUserEditor = async function(id, nickname, container, isIp) {
        const data = await getData(id);
        const displayName = isIp ? nickname : `${nickname}(${id})`;
        const newMemo = prompt(`[${displayName}] 메모 입력 (비우면 삭제):`, data.memo);

        if (newMemo !== null) {
            await setData(id, { memo: newMemo });
            if (container) {
                let displayText = "";
                let hasText = false;

                if (newMemo) {
                    if (settings.showIdCode && !isIp) {
                        displayText = `${id}: ${newMemo}`;
                    } else {
                        displayText = newMemo;
                    }
                    hasText = true;
                } else {
                    if (settings.showIdCode && !isIp) {
                        displayText = id;
                        hasText = true;
                    }
                }

                if (hasText) {
                    container.innerHTML = `<b style="color:#007bff; font-size:0.8em;">[${displayText}]</b>`;
                } else {
                    container.innerHTML = `<small style="color:#ccc; font-size:0.7em;">[📝]</small>`;
                }
            }
        }
    };

    async function createUI(id, nickname, isIp) {
        const data = await getData(id);
        const container = document.createElement('span');
        container.className = 'custom-memo-area';
        container.style.marginLeft = "4px";
        container.style.cursor = "pointer";
        container.style.display = "inline-block";
        container.style.verticalAlign = "middle";
        container.style.flexShrink = "0";

        let displayText = "";
        let hasText = false;

        if (data.memo) {
            if (settings.showIdCode && !isIp) {
                displayText = `${id}: ${data.memo}`;
            } else {
                displayText = data.memo;
            }
            hasText = true;
        } else {
            if (settings.showIdCode && !isIp) {
                displayText = id;
                hasText = true;
            }
        }

        if (hasText) {
            container.innerHTML = `<b style="color:#007bff; font-size:0.8em;">[${displayText}]</b>`;
        } else {
            container.innerHTML = `<small style="color:#ccc; font-size:0.7em;">[📝]</small>`;
        }

        container.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await window.openUserEditor(id, nickname, container, isIp);
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
            let isIp = false;

            if (gallogBtn) {
                userId = gallogBtn.getAttribute('href').split('/').pop();
            } else {
                const ipMatch = nickname.match(/\(([^)]+)\)/);
                userId = ipMatch ? ipMatch[1] : nickname;
                isIp = true;
            }
            return { userId, nickname, isIp };
        }
        return null;
    }

    async function processPostView() {
        const authorBox = document.querySelector('.gallview-tit-box');
        if (authorBox && !authorBox.dataset.memoApplied) {
            const userInfo = parseUserFromElement(authorBox);
            if (userInfo) {
                authorBox.dataset.memoApplied = true;
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
                    nickLi.appendChild(await createUI(userInfo.userId, userInfo.nickname, userInfo.isIp));
                } else {
                    nickLi.appendChild(await createUI(userInfo.userId, userInfo.nickname, userInfo.isIp));
                }
            }
        }

        const commentList = document.querySelectorAll('.all-comment-lst li[id^="comment_cnt_"]');
        commentList.forEach(async li => {
            if (li.dataset.memoApplied) return;

            const nickAnchor = li.querySelector('a.nick');
            if (!nickAnchor) return;

            let userId = "";
            let isIp = false;
            const infoSpan = li.querySelector('.blockCommentId');
            const ipSpan = li.querySelector('.ip');

            if (infoSpan && infoSpan.getAttribute('data-info')) {
                userId = infoSpan.getAttribute('data-info');
            } else if (nickAnchor.href && nickAnchor.href.includes('gallog/')) {
                userId = nickAnchor.href.split('/').pop();
            } else if (ipSpan) {
                userId = ipSpan.innerText.trim().replace(/[()]/g, '');
                isIp = true;
            }

            if (userId) {
                li.dataset.memoApplied = true;
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
                    nickAnchor.appendChild(await createUI(userId, nickname, isIp));
                } else {
                    nickAnchor.appendChild(await createUI(userId, nickname, isIp));
                }
            }
        });
    }

    let isFetching = false;
    let nextPage = 2;
    const listContainer = document.querySelector('ul.gall-detail-lst');

    const style = document.createElement('style');
    style.innerHTML = `
        ul.gall-detail-lst > li {
            height: auto !important;
            overflow: visible !important;
        }
        ul.gall-detail-lst .gall-detail-lnktb {
            display: flex !important;
            align-items: center !important;
            padding: 5px 10px !important;
            width: 100% !important;
            height: auto !important;
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
            height: auto !important;
        }
        ul.gall-detail-lst .gall-detail-lnktb .lt .subject-add {
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            font-size: 14px !important;
            line-height: 1.4 !important;
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
        .preview-line {
            display: block;
            margin-top: 2px;
            font-size: 12px;
            color: #666;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 100%;
            line-height: 1.2 !important;
        }
        .preview-recomm {
            color: #888;
            margin-right: 4px;
            font-size: 12px;
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
            .preview-line { color: #aaa; }
            .preview-recomm { color: #888; }
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

        if (settings.disableFetch) return;

        let img = null;
        if (settings.showImage) {
            img = document.createElement('img');
            img.className = 'dc-preview-thumb';
            lnkTable.prepend(img);
        }

        const url = linkElement.href;
        const now = Date.now();
        let cachedData = null;

        try {
            const stored = await dbGet(url);
            if (stored) {
                if (now - stored.time < (settings.cacheDuration || 180000)) {
                    cachedData = stored;
                }
            }
        } catch(e) {}

        const applyDOM = async (imgUrl, dislikeCount, userInfo, content) => {
            if (settings.showImage && img) {
                const isDefaultIcon = imgUrl && (imgUrl.includes('dcinside_icon.png') || imgUrl.includes('no_img'));
                if (imgUrl && !isDefaultIcon && (li.querySelector('.sp-lst-img, .sp-lst-recoimg, .sp-lst-best, .sp-lst-bestlight'))) {
                    img.src = imgUrl;
                    img.style.visibility = 'visible';
                    img.style.backgroundColor = '#f2f2f2';
                } else {
                    img.style.visibility = 'hidden';
                    img.style.backgroundColor = 'transparent';
                }
            }

            if (dislikeCount !== null && !settings.postPreview) {
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
                            infoLi.appendChild(await createUI(userInfo.userId, userInfo.nickname, userInfo.isIp));
                        }
                        break;
                    }
                }
            }

            if (settings.postPreview) {
                const ltDiv = li.querySelector('.gall-detail-lnktb .lt');
                if (ltDiv && !li.querySelector('.preview-line')) {
                    let recText = "";
                    const ginfo = li.querySelector('.ginfo');
                    if (ginfo) {
                        const lis = ginfo.querySelectorAll('li');
                        lis.forEach(l => {
                            if (l.innerText.includes('추천')) {
                                recText = l.innerText.trim();
                                l.style.display = 'none';
                            }
                        });
                    }

                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'preview-line';

                    let innerHtml = "";
                    if (recText) innerHtml += `<span class="preview-recomm">${recText}</span>`;

                    if (dislikeCount !== null) {
                         innerHtml += `<span class="preview-recomm">비추 ${dislikeCount}</span> `;
                    }

                    if (content) {
                        innerHtml += `<span style="margin-left:2px;">${content}</span>`;
                    }

                    previewDiv.innerHTML = innerHtml;
                    ltDiv.appendChild(previewDiv);
                }
            }
        };

        if (cachedData) {
            await applyDOM(cachedData.imgUrl, cachedData.dislikeCount, cachedData.userInfo, cachedData.content);
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

            let content = null;
            const txtBody = doc.querySelector('.thum-txtin') || doc.querySelector('.writing_view_box');

            if (txtBody) {
                txtBody.querySelectorAll('script, style, .adv-groupno, #auto_picture_area').forEach(el => el.remove());
                content = txtBody.textContent.replace(/\s+/g, ' ').trim().substring(0, 25);
            }

            const userInfo = parseUserFromElement(doc.querySelector('.gallview-tit-box'));

            await applyDOM(imgUrl, dislikeCount, userInfo, content);

            const saveData = {
                url: url,
                time: Date.now(),
                imgUrl: imgUrl,
                dislikeCount: dislikeCount,
                userInfo: userInfo,
                content: content
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

    if (!window.location.href.includes('m.dcinside.com/dcscrip')) {
        processPostView();
        const observer = new MutationObserver(processPostView);
        observer.observe(document.body, { childList: true, subtree: true });

        if (listContainer) {
            (async () => {
                const items = listContainer.querySelectorAll('li:not(.notice):not(.click_ad)');
                await processInBatches(items, 5);
            })();

            if (settings.autoScroll) {
                window.addEventListener('scroll', handleScroll);
            }

            const params = new URLSearchParams(window.location.search);
            if (params.has('page')) nextPage = parseInt(params.get('page')) + 1;
        }
    }

})();