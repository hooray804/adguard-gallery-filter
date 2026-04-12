// ==UserScript==
// @name         Dcinside Expert Extension
// @namespace    https://github.com/hooray804/adguard-gallery-filter
// @version      7.1.1
// @description  [디시인사이드 모바일 전용] 무한 스크롤, 이미지 미리보기, 비추천수 로드, 유저 메모, 본문 미리보기, 이미지 블러, 너무 많은 요청 우회 기능을 추가합니다.
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
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @license      Apache-2.0
// @homepage     https://github.com/hooray804/adguard-gallery-filter
// @supportURL   https://github.com/hooray804/adguard-gallery-filter/issues
// @downloadURL  https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/dc.user.js
// @updateURL    https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/dc.user.js
// ==/UserScript==

(async function() {
    'use strict';

    let a;

    const b = (c) => String(c).replace(/[&<>"']/g, (d) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[d]));

    async function e() {
        const f = typeof GM !== 'undefined' && typeof GM.getValue === 'function';
        if (f) {
            a = 'true';
            let g = await GM.getValue('dc_expert_migrated', false);
            if (!g) {
                if (typeof GM_listValues === 'function' && typeof GM_getValue === 'function') {
                    try {
                        const h = GM_listValues();
                        for (const i of h) {
                            const j = GM_getValue(i);
                            if (j !== undefined) {
                                await GM.setValue(i, j);
                            }
                        }
                    } catch (k) {}
                }
                await GM.setValue('dc_expert_migrated', true);
            }
        } else {
            a = 'false';
        }
    }

    const l = {
        getValue: async (m, n) => {
            if (a === 'true') {
                return await GM.getValue(m, n);
            } else {
                return typeof GM_getValue === 'function' ? GM_getValue(m, n) : n;
            }
        },
        setValue: async (m, n) => {
            if (a === 'true') {
                await GM.setValue(m, n);
            } else {
                if (typeof GM_setValue === 'function') GM_setValue(m, n);
            }
        },
        listValues: async () => {
            if (a === 'true') {
                return await GM.listValues();
            } else {
                return typeof GM_listValues === 'function' ? GM_listValues() : [];
            }
        }
    };

    await e();

    const o = 6;
    const p = {
        aSc: true,
        sIm: true,
        dFe: false,
        pPr: true,
        cDu: 21600000,
        sIP: true,
        sIL: true,
        bDe: 150,
        sRL: false,
        bIm: false,
        rBP: true,
        version: o
    };

    let q = await l.getValue('dc_expert_settings', p);

    if (q.version !== o) {
        q = { ...p, ...q, version: o };
        if (typeof q.bIm === 'undefined') q.bIm = false;
        if (typeof q.rBP === 'undefined') q.rBP = true;
        await l.setValue('dc_expert_settings', q);
    }

    if (typeof q.showIdCode !== 'undefined') {
        if (typeof q.sIP === 'undefined') q.sIP = q.showIdCode;
        if (typeof q.sIL === 'undefined') q.sIL = q.showIdCode;
        delete q.showIdCode;
        await l.setValue('dc_expert_settings', q);
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

        const r = document.createElement('h2');
        r.innerText = 'Dcinside Expert Extension 설정';
        document.body.appendChild(r);

        const s = (t, u) => {
            const v = document.createElement('label');
            v.style.display = 'flex';
            v.style.alignItems = 'center';
            v.style.margin = '15px 0';
            v.style.fontSize = '16px';
            v.style.cursor = 'pointer';

            v.addEventListener('click', (w) => w.stopPropagation());
            v.addEventListener('touchstart', (w) => w.stopPropagation());

            const x = document.createElement('input');
            x.type = 'checkbox';
            x.style.marginRight = '10px';
            x.style.width = '20px';
            x.style.height = '20px';
            x.style.accentColor = '#3b5998';

            const y = document.createElement('span');
            y.style.fontWeight = 'bold';
            y.style.marginLeft = '5px';
            y.style.marginRight = '10px';
            y.style.minWidth = '45px';

            const z = q.dFe;
            const A = ((u === 'sIm' || u === 'pPr' || u === 'sIL' || u === 'sRL') && z);

            if (A) {
                x.checked = false;
                x.disabled = true;
            } else {
                x.checked = q[u];
            }

            const B = () => {
                if (A) {
                    y.innerText = '[OFF]';
                    y.style.color = '#d9534f';
                } else {
                    if (x.checked) {
                        y.innerText = '[ON]';
                        y.style.color = '#3b5998';
                    } else {
                        y.innerText = '[OFF]';
                        y.style.color = '#999';
                    }
                }
            }
            B();

            x.onchange = async (C) => {
                q[u] = C.target.checked;
                await l.setValue('dc_expert_settings', q);
                B();
                if (u === 'dFe') location.reload();
            };

            v.appendChild(x);
            v.appendChild(y);
            v.appendChild(document.createTextNode(t));

            if (A) {
                const D = document.createElement('span');
                D.innerText = ' (데이터 절약 모드 사용 중)';
                D.style.fontSize = '13px';
                D.style.color = '#d9534f';
                D.style.marginLeft = '5px';
                v.appendChild(D);
            }

            return v;
        };

        const E = () => {
            const F = document.createElement('div');
            F.style.margin = '15px 0';

            const G = document.createElement('label');
            G.innerText = '게시글 캐시 시간 (초, 최대 86400): ';
            G.style.fontSize = '16px';

            const H = document.createElement('input');
            H.type = 'number';
            H.style.marginLeft = '10px';
            H.style.padding = '5px';
            H.style.width = '80px';
            H.min = 1;
            H.max = 86400;

            const I = (q.cDu || 21600000) / 1000;
            H.value = I;

            H.onchange = async (J) => {
                let K = parseInt(J.target.value);
                if (isNaN(K) || K < 1) K = 1;
                if (K > 86400) K = 86400;

                q.cDu = K * 1000;
                await l.setValue('dc_expert_settings', q);
                H.value = K;
            };

            F.appendChild(G);
            F.appendChild(H);
            return F;
        };

        const L = () => {
            const M = document.createElement('div');
            M.style.margin = '15px 0';

            const N = document.createElement('label');
            N.innerText = '배치 처리 지연 시간 (ms): ';
            N.style.fontSize = '16px';

            const O = document.createElement('input');
            O.type = 'number';
            O.style.marginLeft = '10px';
            O.style.padding = '5px';
            O.style.width = '80px';
            O.min = 0;

            O.value = q.bDe;

            O.onchange = async (P) => {
                let Q = parseInt(P.target.value);
                if (isNaN(Q) || Q < 0) Q = 0;

                q.bDe = Q;
                await l.setValue('dc_expert_settings', q);
                O.value = Q;
            };

            M.appendChild(N);
            M.appendChild(O);
            return M;
        };

        const R = () => {
            const S = document.createElement('div');
            S.style.margin = '20px 0';
            S.style.borderTop = '1px solid #ddd';
            S.style.paddingTop = '15px';

            const T = document.createElement('h3');
            T.innerText = '유저 메모 백업';
            T.style.fontSize = '16px';
            S.appendChild(T);

            const U = 'padding: 8px 15px; margin-right: 10px; cursor: pointer; border: 1px solid #ccc; background: #f8f8f8; border-radius: 4px;';

            const V = document.createElement('button');
            V.innerText = '메모 내보내기 (JSON)';
            V.style.cssText = U;
            V.onclick = async () => {
                const W = await l.listValues();
                const X = {};
                for (const Y of W) {
                    if (Y.startsWith('dc_user_')) {
                        X[Y] = await l.getValue(Y);
                    }
                }
                const Z = new Blob([JSON.stringify(X, null, 2)], { type: 'application/json' });
                const aa = URL.createObjectURL(Z);
                const ab = document.createElement('a');
                ab.href = aa;
                ab.download = `dc_memos_${new Date().toISOString().slice(0, 25)}.json`;
                ab.click();
                URL.revokeObjectURL(aa);
            };

            const ac = document.createElement('input');
            ac.type = 'file';
            ac.accept = '.json';
            ac.style.display = 'none';
            ac.onchange = (ad) => {
                const ae = ad.target.files[0];
                if (!ae) return;
                const af = new FileReader();
                af.onload = async (ag) => {
                    try {
                        const ah = JSON.parse(ag.target.result);
                        let ai = 0;
                        for (const aj in ah) {
                            if (aj.startsWith('dc_user_')) {
                                await l.setValue(aj, ah[aj]);
                                ai++;
                            }
                        }
                        alert(`${ai}개의 메모를 성공적으로 가져왔습니다.`);
                    } catch (ak) {
                        alert('파일 형식이 올바르지 않습니다.');
                    }
                };
                af.readAsText(ae);
            };

            const al = document.createElement('button');
            al.innerText = '메모 가져오기';
            al.style.cssText = U;
            al.onclick = () => ac.click();

            const amBtn = document.createElement('button');
            amBtn.innerText = '공식으로 마이그레이션';
            amBtn.style.cssText = U;
            amBtn.onclick = async () => {
                const amW = await l.listValues();
                const amV = [];
                const amM = [];
                const amC = [];
                for (const amY of amW) {
                    if (amY.startsWith('dc_user_')) {
                        const amId = amY.substring(8);
                        const amDat = await l.getValue(amY);
                        if (amDat && amDat.memo) {
                            amV.push(amId);
                            amM.push(amDat.memo);
                            amC.push("");
                        }
                    }
                }
                const amExp = {
                    userMemoList: [{ galleryId: "", memo: amM, value: amV, color: amC }],
                    appSettingList: [{ key: "settings", value: [] }],
                    unique: "dcinside",
                    version: 4
                };
                const amJ = JSON.stringify(amExp);
                const amB64 = btoa(unescape(encodeURIComponent(amJ)));
                const amBlb = new Blob([amB64], { type: 'text/plain' });
                const amUrl = URL.createObjectURL(amBlb);
                const amA = document.createElement('a');
                amA.href = amUrl;
                const amD = new Date();
                const amP = n => n.toString().padStart(2, '0');
                amA.download = `dcbackup_M_${amD.getFullYear()}${amP(amD.getMonth()+1)}${amP(amD.getDate())}_${amP(amD.getHours())}${amP(amD.getMinutes())}${amP(amD.getSeconds())}.txt`;
                amA.click();
                URL.revokeObjectURL(amUrl);
            };

            const amDesc = document.createElement('div');
            amDesc.style.marginTop = '15px';
            amDesc.style.fontSize = '13px';
            amDesc.style.color = '#888';
            amDesc.style.lineHeight = '1.5';
            amDesc.innerHTML = '참고: <a href="https://m.dcinside.com/board/know/428" target="_blank" style="color:#3b5998; text-decoration:underline;">https://m.dcinside.com/board/know/428</a><br><a href="https://m.dcinside.com/userMemo/board/adguard" target="_blank" style="color:#3b5998; text-decoration:underline;">https://m.dcinside.com/userMemo/board/adguard</a><br>위 링크에서 이용자 메모 백업 / 복원 "바로가기" 클릭 후 다운로드 한 파일을 복원하면 됩니다.';

            S.appendChild(V);
            S.appendChild(al);
            S.appendChild(amBtn);
            S.appendChild(ac);
            S.appendChild(amDesc);
            return S;
        };

        document.body.appendChild(s('무한 스크롤 사용', 'aSc'));
        document.body.appendChild(s('이미지 미리보기 사용', 'sIm'));
        document.body.appendChild(s('본문 미리보기 (3줄 모드)', 'pPr'));
        document.body.appendChild(s('게시글 내 식별 코드 미리보기', 'sIP'));
        document.body.appendChild(s('리스트 식별 코드 미리보기 (데이터 절약 시 불가)', 'sIL'));
        document.body.appendChild(s('Rate Limit 표시 (왼쪽 하단)', 'sRL'));
        document.body.appendChild(s('게시글 내 이미지 블러 (클릭 시 해제)', 'bIm'));
        document.body.appendChild(s('데이터 절약 (섬네일, 본문, 비추, 메모 표시 안 됨)', 'dFe'));
        document.body.appendChild(s('게시글 차단 시 PC 우회 복원 (열람 전용)', 'rBP'));
        document.body.appendChild(E());
        document.body.appendChild(L());
        document.body.appendChild(R());

        const stDesc = document.createElement('p');
        stDesc.style.marginTop = '20px';
        stDesc.style.color = '#888';
        stDesc.style.fontSize = '13px';
        stDesc.innerText = '설정 변경 후 페이지를 새로고침하면 적용됩니다. 캐시 시간이 길수록 페이지 로딩이 빨라지나 비추천 수 실시간 반영이 지연됩니다. 배치 처리 지연 시간이 길수록 IP 기반의 Rate Limit 빈도가 줄어 비어있는 미리보기와 "너무 많은 요청" 표시의 비율이 감소하지만, 게시글 목록에서 미리보기 로딩 시간이 길어집니다. 모든 메모는 브라우저 내부에만 저장되어 브라우징 데이터 삭제 시 복구되지 않으므로 설정을 통해 정기적으로 백업하시기 바랍니다. 스크립트 개선을 위해 7.0.0 버전에서 설정을 초기화했습니다. 원하시는 맞춤 설정을 다시 적용해주세요. 현재 디시인사이드 측의 Rate Limit 변경으로 인해 기능이 제대로 작동하지 않을 수 있습니다. 데이터 절약 모드 활성화 후 사용을 권장합니다.';
        document.body.appendChild(stDesc);

        return;
    }

    const an = 'dc_expert_db';
    const ao = 3;
    const ap = 'post_cache';
    const aq = 24 * 60 * 60 * 1000;

    let ar = null;

    const as = () => {
        return new Promise((at, au) => {
            if (ar) return at(ar);
            const av = indexedDB.open(an, ao);

            av.onupgradeneeded = (aw) => {
                const ax = aw.target.result;
                if (ax.objectStoreNames.contains(ap)) {
                    ax.deleteObjectStore(ap);
                }
                const ay = ax.createObjectStore(ap, { keyPath: 'url' });
                ay.createIndex('time', 'time', { unique: false });
            };

            av.onsuccess = (aw) => {
                ar = aw.target.result;
                if (Math.random() < 0.05) {
                    az(ar);
                }
                at(ar);
            };
            av.onerror = (aw) => au(aw);
        });
    };

    const az = (aA) => {
        const aB = aA.transaction([ap], 'readwrite');
        const aC = aB.objectStore(ap);
        const aD = aC.index('time');

        const aE = Date.now() - aq;
        const aF = IDBKeyRange.upperBound(aE);

        aD.openCursor(aF).onsuccess = (aG) => {
            const aH = aG.target.result;
            if (aH) {
                aC.delete(aH.primaryKey);
                aH.continue();
            }
        };
    };

    const aI = async (aJ) => {
        const aK = await as();
        return new Promise((aL, aM) => {
            const aN = aK.transaction([ap], 'readonly');
            const aO = aN.objectStore(ap).get(aJ);
            aO.onsuccess = () => aL(aO.result);
            aO.onerror = () => aM(aO.error);
        });
    };

    const aP = async (aQ) => {
        const aR = await as();
        return new Promise((aS, aT) => {
            const aU = aR.transaction([ap], 'readwrite');
            const aV = aU.objectStore(ap).put(aQ);
            aV.onsuccess = () => aS(aV.result);
            aV.onerror = () => aT(aV.error);
        });
    };

    let rlDiv = null;
    const uRL = (limit, remaining) => {
        if (!q.sRL || q.dFe) return;
        if (!rlDiv) {
            rlDiv = document.createElement('div');
            rlDiv.style.cssText = 'position: fixed; bottom: 10px; left: 10px; background: rgba(0, 0, 0, 0.6); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; z-index: 99999; pointer-events: none; box-shadow: 0 1px 3px rgba(0,0,0,0.3);';
            document.body.appendChild(rlDiv);
        }
        rlDiv.innerText = `Rate Limit: ${remaining} / ${limit}`;
    };

    let aW = null;

    const aX = async (aY) => {
        if (aW) await aW;

        const aZ = await fetch(aY);
        
        if (q.sRL) {
            const rlLimit = aZ.headers.get('x-rate-limit-limit') || aZ.headers.get('x-ratelimit-limit');
            const rlRem = aZ.headers.get('x-rate-limit-remaining') || aZ.headers.get('x-ratelimit-remaining');
            if (rlLimit && rlRem) uRL(rlLimit, rlRem);
        }

        const ba = await aZ.text();

        if (ba.includes('너무 많은 요청으로') && ba.includes('penalty-box')) {
            if (!aW) {
                aW = new Promise(bb => setTimeout(bb, 5000)).then(() => {
                    aW = null;
                });
            }
            await aW;
            throw new Error('Rate limit exceeded');
        }
        
        return ba;
    };

    const fPP = async (mobileUrl) => {
        const match = mobileUrl.match(/(board|mini)\/([^\/?]+)\/([0-9]+)/);
        if (!match) return await aX(mobileUrl);

        const prefix = match[1] === 'mini' ? 'mini/' : '';
        const pcUrl = `https://gall.dcinside.com/${prefix}board/view/?id=${match[2]}&no=${match[3]}`;

        if (aW) await aW;

        return new Promise((resolve, reject) => {
            let gmXhr = null;
            if (typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function') {
                gmXhr = GM.xmlHttpRequest.bind(GM);
            } else if (typeof GM_xmlhttpRequest === 'function') {
                gmXhr = GM_xmlhttpRequest;
            }

            if (!gmXhr) {
                return resolve(aX(pcUrl));
            }

            gmXhr({
                method: "GET",
                url: pcUrl,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                    "Referer": "https://gall.dcinside.com/"
                },
                onload: function(response) {
                    const ba = response.responseText;

                    if (q.sRL) {
                        try {
                            const headersObj = {};
                            if (response.responseHeaders) {
                                const headerLines = response.responseHeaders.trim().split(/[\r\n]+/);
                                headerLines.forEach(line => {
                                    const parts = line.split(': ');
                                    const key = parts.shift().toLowerCase();
                                    if (key) {
                                        headersObj[key] = parts.join(': ');
                                    }
                                });
                            }
                            const rlLimit = headersObj['x-rate-limit-limit'] || headersObj['x-ratelimit-limit'];
                            const rlRem = headersObj['x-rate-limit-remaining'] || headersObj['x-ratelimit-remaining'];
                            if (rlLimit && rlRem) uRL(rlLimit, rlRem);
                        } catch(e) {}
                    }

                    if (ba.includes('너무 많은 요청으로') && ba.includes('penalty-box')) {
                        if (!aW) {
                            aW = new Promise(bb => setTimeout(bb, 5000)).then(() => {
                                aW = null;
                            });
                        }
                        aW.then(() => reject(new Error('Rate limit exceeded')));
                        return;
                    }
                    resolve(ba);
                },
                onerror: function(err) {
                    reject(err);
                }
            });
        });
    };

    async function rRLP() {
        if (!q.rBP) return;

        const mt = window.location.href.match(/(board|mini)\/([^\/?]+)\/([0-9]+)/);
        const pB = document.querySelector('.penalty-box-inner');

        if (mt && pB && document.body.innerText.includes('너무 많은 요청으로')) {
            const iM = mt[1] === 'mini';
            const bI = mt[2];
            const pN = mt[3];

            pB.innerHTML = `<div style="text-align:center; padding: 20px; font-size: 13px; color: #666;">우회 복구 중...</div>`;

            try {
                let gx = (typeof GM !== 'undefined' && GM.xmlHttpRequest) ? GM.xmlHttpRequest.bind(GM) : (typeof GM_xmlhttpRequest === 'function' ? GM_xmlhttpRequest : null);
                if (!gx) throw new Error("GM_xmlHttpRequest is not supported in this environment");

                const fPU = async (u, m = "GET", b = null, h = {}) => {
                    return new Promise((rs, rj) => {
                        let rH = {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                            "Referer": "https://gall.dcinside.com/"
                        };
                        for (let k in h) rH[k] = h[k];
                        let rO = {
                            method: m,
                            url: u,
                            headers: rH,
                            onload: r => rs(r.responseText),
                            onerror: e => rj(e)
                        };
                        if (b) rO.data = b;
                        gx(rO);
                    });
                };

                let pf = iM ? 'mini/' : '';
                let pU = `https://gall.dcinside.com/${pf}board/view/?id=${bI}&no=${pN}`;
                
                let rT = await fPU(pU);
                let ps = new DOMParser();
                let dc = ps.parseFromString(rT, "text/html");

                if (!dc.querySelector('.title_subject') && !iM) {
                    pU = `https://gall.dcinside.com/mgallery/board/view/?id=${bI}&no=${pN}`;
                    rT = await fPU(pU);
                    dc = ps.parseFromString(rT, "text/html");
                }

                const tO = dc.querySelector('.title_subject');
                if (!tO) throw new Error("게시글 제목을 찾을 수 없습니다. PC 환경도 차단되었거나 삭제된 게시글일 수 있습니다.");

                const tt = tO.innerText;
                const wN = dc.querySelector('.gall_writer');
                const au = wN ? wN.getAttribute('data-nick') : "ㅇㅇ";
                const ui = wN ? wN.getAttribute('data-uid') : "";
                const ip = wN && !ui ? wN.getAttribute('data-ip') : "";
                const dt = dc.querySelector('.gall_date')?.innerText || "";
                
                let cHTML = "<p>본문을 파싱하지 못했습니다.</p>";
                const wD = dc.querySelector('.write_div');
                if (wD) {
                    wD.querySelectorAll('*').forEach(n => {
                        const ats = n.attributes;
                        for (let i = ats.length - 1; i >= 0; i--) {
                            if (ats[i].name.toLowerCase().startsWith('on')) n.removeAttribute(ats[i].name);
                        }
                        if (n.tagName === 'A' && n.getAttribute('href')?.toLowerCase().startsWith('javascript:')) n.setAttribute('href', '#');
                    });
                    cHTML = wD.innerHTML;
                }

                let cH = '<div class="all-comment" id="comment_box" style="margin: 0px; padding: 0px; background-color: rgb(235, 236, 241); border-top: 4px solid rgb(235, 236, 241);"><div style="margin: 0px; padding: 0px 12px; background-color: rgb(255, 255, 255); display: flex;"><div style="margin: 0px; padding: 0px; color: rgb(0, 0, 0); font-size: 15px; line-height: 1.5;"><a style="color: rgb(0, 0, 0); text-decoration: none; font-weight: bold;">댓글<span style="font-weight: normal; color: rgb(210, 34, 39); margin-left: 4px; vertical-align: top; display: inline-block;"></span><span style=" display: inline-block; width: 20px; height: 20px; font-size: 0px; line-height: 0; vertical-align: top; margin-left: 2px;">새로고침</span></a></div></div><ul class="all-comment-lst" style="margin: 0px; padding: 0px; list-style: none; border-top: 4px solid rgb(235, 236, 241);">';
                
                let cD = [];
                try {
                    let cbU = `https://gall.dcinside.com/${pf}board/comment/`;
                    let esN = dc.getElementById('e_s_n_o') ? dc.getElementById('e_s_n_o').value : "";
                    let gT = dc.getElementById('_GALLTYPE_') ? dc.getElementById('_GALLTYPE_').value : "";
                    if (!gT) {
                        if (iM) gT = "MI";
                        else if (pU.includes('mgallery')) gT = "M";
                        else gT = "G";
                    }
                    let fD = `id=${bI}&no=${pN}&cmt_id=${bI}&cmt_no=${pN}&e_s_n_o=${esN}&_GALLTYPE_=${gT}&comment_page=1`;
                    let cR = await fPU(cbU, "POST", fD, {
                        "X-Requested-With": "XMLHttpRequest",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    });
                    let pd = JSON.parse(cR);
                    if (pd && pd.comments) {
                        cD = pd.comments;
                    }
                } catch(e) {}

                if (cD.length === 0) {
                    cH += '<li class="comment"><p class="txt" style="color:#999; text-align:center; padding:20px;">댓글이 없거나 우회 로드 중 불러오지 못했습니다.</p></li>';
                } else {
                    cD.forEach(c => {
                        if (!c || c.name === undefined || c.name === '댓글돌이') return;
                        const iR = c.depth > 0;
                        const cNk = c.name;
                        const cUd = c.user_id || '';
                        const cIp = c.ip || '';
                        let cCt = c.memo || '';

                        if (c.vr_player && !cCt.includes('<iframe')) {
                            cCt += `<div class="voice_wrap" style="margin-top:4px;">${c.vr_player}</div>`;
                        }

                        if (cCt.includes('written_dccon')) {
                            let sM = cCt.match(/src=(["'])(.*?)\1/);
                            let aM = cCt.match(/alt=(["'])(.*?)\1/);
                            if (sM) {
                                let sr = sM[2];
                                let al = aM ? aM[2] : "디시콘";
                                cCt = `<div class="dccon-view-box" style="margin-top:4px;"><div class="imgwrap"><img src="${sr}" class="written_dccon lazy" alt="${al}" title="${al}" style="width:100px;"></div></div>`;
                            }
                        }

                        const cDt = c.reg_date || '';

                        let nH = `<button type="button" class="nick">${b(cNk)}</button>`;
                        if (cUd) {
                            nH += `<a href="/gallog/${cUd}"><span class="sp-nick m-gonick"></span><span class="blockCommentId" style="display:none;" data-info="${cUd}"></span></a>`;
                        }
                        let iH = cIp ? `<span class="ip blockCommentIp">(${cIp})</span>` : '';

                        cH += `
                        <li class="${iR ? 'comment-add' : 'comment'}" style="${iR ? 'margin: 0px; padding: 5px 12px 5px 38px; list-style: none; border-top: 1px solid rgb(223, 225, 238); background-color: rgb(249, 250, 252);' : 'margin: 0px; padding: 5px 12px; list-style: none; border-top: 1px solid rgb(223, 225, 238); background-color: rgb(255, 255, 255);'}">
                            <div class="ginfo-area" style="margin: 0px -4px 0px 0px; padding: 0px; display: inline-flex;">${nH}${iH}</div>
                            <p class="txt" style="margin: 2px 0px 0px; padding: 0px; font-size: 13px; line-height: 1.5; color: rgb(0, 0, 0); word-break: break-all;">${cCt}</p>
                            <span class="date" style="display: block; font-size: 12px; line-height: 1.5; color: rgb(153, 153, 153);">${cDt}</span>
                        </li>`;
                    });
                }
                cH += '</ul></div>';

                let aH = `<button type="button" class="nick">${b(au)}</button>`;
                if (ui) aH += `<a href="/gallog/${ui}"><span class="sp-nick m-gonick"></span><span class="blockCommentId" style="display:none;" data-info="${ui}"></span></a>`;
                else if (ip) aH += `<span class="ip">(${ip})</span>`;

                const nwH = `
                    <section class="grid" style="margin-top: 50px;">
                        <div style="padding: 10px 12px; background-color: rgb(255, 255, 255); border-bottom: 1px solid rgb(223, 225, 238);">
                            <button type="button" onclick="history.back()" style="padding: 6px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; color: #333;">&larr; 뒤로 가기</button>
                        </div>
                        <div style="font-style: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; word-spacing: 0px; text-decoration-line: none; text-decoration-style: solid; margin: 0px; padding: 10px 12px; border-bottom: 1px solid rgb(223, 225, 238); color: rgb(0, 0, 0); font-family: AppleSDGothicNeo-Regular, HelveticaNeue, 나눔고딕, NanumGothic, 돋움, Dotum, sans-serif; font-size: 14px; background-color: rgb(255, 255, 255);">
                            <span style="font-size: 15px; line-height: 1.4; font-weight: bold; word-break: break-all;"><span style="color:#d9534f; margin-right:4px;">[PC 복원]</span>${tt}</span>
                            <div class="gallview-tit-box" style="margin: 0px; padding: 0px; height: 20px;">
                                <ul class="ginfo2" style="margin: 0px; padding: 3px 0px 0px; list-style: none; font-size: 0px; line-height: 0;">
                                    <li style="margin: 0px; padding: 0px; list-style: none; float: left; font-size: 12px; line-height: 1.5; color: rgb(85, 85, 85);">
                                        <div class="ginfo-area" style="margin: 0px -4px 0px 0px; padding: 0px; display: inline-flex;">
                                            ${aH}
                                        </div>&nbsp;
                                    </li>
                                    <li style="margin: 0px; padding: 0px; list-style: none; float: left; font-size: 12px; line-height: 1.5; color: rgb(85, 85, 85);">${dt}</li>
                                </ul>
                            </div>
                        </div>
                        <div style="font-style: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; text-align: start; text-indent: 0px; text-transform: none; word-spacing: 0px; text-decoration-line: none; text-decoration-style: solid; margin: 0px; padding: 0px; color: rgb(0, 0, 0); font-family: AppleSDGothicNeo-Regular, HelveticaNeue, 나눔고딕, NanumGothic, 돋움, Dotum, sans-serif; font-size: 14px; background-color: rgb(255, 255, 255);">
                            <div style="margin: 0px; padding: 0px;">
                                <ul style="margin: 2px 0px 0px; padding: 10px 12px 5px; list-style: none; font-size: 0px; line-height: 0;">
                                    <li style="margin: 0px; padding: 0px; list-style: none; float: left; font-size: 12px; line-height: 1.5; color: rgb(85, 85, 85);"><a style="color: rgb(85, 85, 85); text-decoration: none; display: inline-block; background: rgb(240, 240, 240); height: 18px; padding: 0px 8px; box-sizing: border-box; border-radius: 12px; border: 1px solid rgb(223, 225, 238); vertical-align: top; line-height: 17px;">댓글&nbsp;<span style="color: rgb(210, 34, 39) !important;">${cD.length}</span></a></li>
                                </ul>
                                <div style="margin: 0px; padding: 0px;">
                                    <div class="thum-txtin" style="margin: 0px; padding: 0px 12px; font-size: 14px; color: rgb(0, 0, 0); word-break: break-all; line-height: 1.5;">
                                        ${cHTML}
                                    </div>
                                </div>
                                ${cH}
                                <div style="text-align:center; font-size:11px; color:#999; padding:15px 0;">우회 복원된 페이지로 댓글 등의 기능이 정상적으로 작동하지 않습니다. 보안에 취약할 수 있으며, 계정에 로그인했거나 특히 매니저 권한을 가지고 있다면 설정 비활성화를 강력히 권장합니다.</div>
                            </div>
                        </div>
                    </section>
                `;

                const tC = document.querySelector('#container') || document.body;
                tC.innerHTML = nwH;

                document.querySelectorAll('.thum-txtin img').forEach(img => {
                    const originalSrc = img.getAttribute('data-original') || img.getAttribute('src');
                    if (originalSrc) {
                        img.src = originalSrc;
                    }
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    img.style.display = "block";
                    img.style.margin = "10px 0";
                });

                document.querySelectorAll('.thum-txtin video').forEach(vid => {
                    vid.style.maxWidth = "100%";
                    vid.style.height = "auto";
                    vid.setAttribute('controls', 'true');
                });

                setTimeout(() => { bS(); }, 300);

            } catch (err) {
                pB.innerHTML = `
                    <div style="text-align:center; padding: 30px; color:#d9534f;">
                        <strong>PC 우회 로드에 실패했습니다.</strong><br>
                        <small>${err.message}</small>
                    </div>
                `;
            }
        }
    }

    let bc = false;
    let bd = [];

    const be = (bf) => {
        bd.push(...Array.from(bf));
        if (!bc) {
            bc = true;
            bg().catch(()=>{}).finally(() => {
                bc = false;
            });
        }
    };

    const bg = async () => {
        while (bd.length > 0) {
            const bh = bd.splice(0, 3);
            const bi = await Promise.all(bh.map(bj => bk(bj)));
            const bl = bi.includes(true);

            if (!q.dFe && bl && q.bDe > 0) {
                await new Promise(bm => setTimeout(bm, q.bDe));
            }
        }
    };

    const bn = async (bo) => await l.getValue('dc_user_' + bo, { memo: "" });
    const bp = async (bq, br) => await l.setValue('dc_user_' + bq, br);

    window.oUE = async function(bs, bt, bu, bv, isList = false) {
        const bw = await bn(bs);
        const bx = bv ? bt : `${bt}(${bs})`;
        const by = prompt(`[${bx}] 메모 입력 (비우면 삭제):`, bw.memo);

        if (by !== null) {
            await bp(bs, { memo: by });
            if (bu) {
                let bz = "";
                let bA = false;
                const targetShowIdCode = isList ? q.sIL : q.sIP;

                if (by) {
                    if (targetShowIdCode && !bv) {
                        bz = `${bs}: ${by}`;
                    } else {
                        bz = by;
                    }
                    bA = true;
                } else {
                    if (targetShowIdCode && !bv) {
                        bz = bs;
                        bA = true;
                    }
                }

                if (bA) {
                    bu.innerHTML = `<b style="color:#007bff; font-size:0.8em;">[${b(bz)}]</b>`;
                } else {
                    bu.innerHTML = `<small style="color:#ccc; font-size:0.7em;">[📝]</small>`;
                }
            }
        }
    };

    async function bB(bC, bD, bE, isList = false) {
        const bF = await bn(bC);
        const bG = document.createElement('span');
        bG.className = 'custom-memo-area';
        bG.style.marginLeft = "4px";
        bG.style.cursor = "pointer";
        bG.style.display = "inline-block";
        bG.style.verticalAlign = "middle";
        bG.style.flexShrink = "0";

        let bH = "";
        let bI = false;
        const targetShowIdCode = isList ? q.sIL : q.sIP;

        if (bF.memo) {
            if (targetShowIdCode && !bE) {
                bH = `${bC}: ${bF.memo}`;
            } else {
                bH = bF.memo;
            }
            bI = true;
        } else {
            if (targetShowIdCode && !bE) {
                bH = bC;
                bI = true;
            }
        }

        if (bI) {
            bG.innerHTML = `<b style="color:#007bff; font-size:0.8em;">[${b(bH)}]</b>`;
        } else {
            bG.innerHTML = `<small style="color:#ccc; font-size:0.7em;">[📝]</small>`;
        }

        bG.onclick = async (bJ) => {
            bJ.preventDefault();
            bJ.stopPropagation();
            await window.oUE(bC, bD, bG, bE, isList);
        };
        return bG;
    }

    function bK(bL) {
        if (!bL) return null;
        const bM = bL.querySelector('.ginfo2 li:first-child');
        const bN = bL.querySelector('.rt a.btn-line-gray');

        if (bM) {
            let bO = "";
            let bP = bM.innerText.trim();
            let bQ = false;

            if (bN) {
                bO = bN.getAttribute('href').split('/').pop();
            } else {
                const bR = bP.match(/\(([^)]+)\)/);
                bO = bR ? bR[1] : bP;
                bQ = true;
            }
            return { userId: bO, nickname: bP, isIp: bQ };
        }
        return null;
    }

    async function bS() {
        if (q.bIm) {
            const blurImgs = document.querySelectorAll('.thum-txtin img, .writing_view_box img');
            blurImgs.forEach(img => {
                if (!img.dataset.blurApplied) {
                    img.dataset.blurApplied = "true";
                    img.style.filter = "blur(15px)";
                    img.style.transition = "filter 0.3s ease";
                    img.style.cursor = "pointer";
                    img.addEventListener('click', function(e) {
                        if (this.style.filter !== "none") {
                            e.preventDefault();
                            e.stopPropagation();
                            this.style.filter = "none";
                        }
                    }, true);
                }
            });
        }
        const bT = document.querySelector('.gallview-tit-box');
        if (bT && !bT.dataset.memoApplied) {
            const bU = bK(bT);
            if (bU) {
                bT.dataset.memoApplied = true;
                const bV = bT.querySelector('.ginfo2 li:first-child');

                if (bV && bV.childNodes.length > 0 && bV.childNodes[0].nodeType === 3) {
                    const bW = bV.childNodes[0];
                    const bX = document.createElement('span');
                    bX.textContent = bW.textContent;
                    bX.style.cssText = "overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 0 1 auto;";

                    bV.style.display = "inline-flex";
                    bV.style.alignItems = "center";
                    bV.style.maxWidth = "100%";

                    bV.replaceChild(bX, bW);
                    bV.appendChild(await bB(bU.userId, bU.nickname, bU.isIp, false));
                } else if (bV) {
                    bV.appendChild(await bB(bU.userId, bU.nickname, bU.isIp, false));
                }
            }
        }

        const bY = document.querySelectorAll('.all-comment-lst li.comment, .all-comment-lst li.comment-add');
        bY.forEach(async bZ => {
            if (bZ.dataset.memoApplied) return;

            const ca = bZ.querySelector('button.nick') || bZ.querySelector('a.nick');
            if (!ca) return;

            let cb = "";
            let cc = false;
            const cd = bZ.querySelector('.blockCommentId');
            const ce = bZ.querySelector('.blockCommentIp') || bZ.querySelector('.ip');

            if (cd && cd.getAttribute('data-info')) {
                cb = cd.getAttribute('data-info');
            } else if (ca.href && ca.href.includes('gallog/')) {
                cb = ca.href.split('/').pop();
            } else if (ce) {
                cb = ce.innerText.trim().replace(/[()]/g, '');
                cc = true;
            }

            if (cb) {
                bZ.dataset.memoApplied = true;
                const cf = ca.innerText.trim();

                const memoBtn = await bB(cb, cf, cc, false);
                if (ca.parentElement) {
                    ca.parentElement.style.display = "inline-flex";
                    ca.parentElement.style.alignItems = "center";
                    ca.parentElement.appendChild(memoBtn);
                }
            }
        });
    }

    let ci = false;
    let cj = 2;
    const ck = document.querySelector('ul.gall-detail-lst');

    const cl = document.createElement('style');
    cl.innerHTML = `
        ul.gall-detail-lst > li { height: auto !important; overflow: visible !important; }
        ul.gall-detail-lst .gall-detail-lnktb { display: flex !important; align-items: center !important; padding: 5px 10px !important; width: 100% !important; height: auto !important; box-sizing: border-box !important; background: #fff !important; }
        ul.gall-detail-lst .gall-detail-lnktb .lt { flex: 1 1 auto !important; min-width: 0 !important; display: flex !important; flex-direction: column !important; margin: 0 !important; padding: 0 !important; height: auto !important; }
        ul.gall-detail-lst .gall-detail-lnktb .lt .subject-add { display: flex !important; align-items: center !important; width: 100% !important; font-size: 14px !important; line-height: 1.4 !important; }
        ul.gall-detail-lst .gall-detail-lnktb .lt .subject-add .subjectin { white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; flex: 0 1 auto !important; }
        .custom-comment-count { color: #222222 !important; font-weight: bold !important; font-size: 13px !important; margin-left: 4px !important; flex: 0 0 auto !important; margin-top: 0px !important; }
        ul.gall-detail-lst .gall-detail-lnktb .lt .ginfo { display: flex !important; margin-top: 2px !important; padding: 0 !important; flex-wrap: nowrap !important; }
        ul.gall-detail-lst .gall-detail-lnktb .lt .ginfo li { font-size: 12px !important; margin-right: 2px !important; color: #888 !important; white-space: nowrap !important; }
        .dc-preview-thumb { flex: 0 0 45px !important; width: 45px !important; height: 45px !important; border-radius: 4px !important; object-fit: cover !important; margin-left: 4px !important; margin-right: 8px !important; background-color: transparent !important; visibility: hidden; }
        ul.gall-detail-lst .gall-detail-lnktb .rt { display: none !important; }
        .dislike-cnt { color: #888 !important; font-size: 12px !important; margin-left: 3px !important; }
        .preview-line { display: block; margin-top: 2px; font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; line-height: 1.2 !important; }
        .preview-recomm { color: #888; margin-right: 4px; font-size: 12px; }
        .page-divider { display: flex; align-items: center; margin: 15px 0; color: #ccc; font-size: 11px; font-weight: normal; }
        .page-divider::before, .page-divider::after { content: ""; flex: 1; height: 1px; background: #eee; margin: 0 10px; }
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
    document.head.appendChild(cl);

    const cm = (cn) => {
        cn.forEach(co => {
            if (co.classList.contains('adv-inner') || co.classList.contains('click_ad')) return;

            const cp = co.querySelector('a.rt');
            const cq = co.querySelector('.subject-add');
            
            if (cp && cq) {
                const cr = cp.querySelector('.ct');
                if (cr && cr.innerText.trim() !== '') {
                    const cs = document.createElement('span');
                    cs.className = 'custom-comment-count';
                    cs.innerText = `[${cr.innerText.trim()}]`;
                    cq.appendChild(cs);
                }
                cp.remove();
            }

            if (!q.sIm) return;

            const ct = co.querySelector('.gall-detail-lnktb');
            if (ct && !ct.querySelector('.dc-preview-thumb')) {
                const cu = document.createElement('img');
                cu.className = 'dc-preview-thumb';
                ct.prepend(cu);
            }
        });
    };

    const bk = async (cv) => {
        if (cv.dataset.processed) return false;
        cv.dataset.processed = "true";

        if (cv.classList.contains('adv-inner') || cv.classList.contains('click_ad')) return false;

        const cw = cv.querySelector('a.lt');
        const cx = cv.querySelector('.gall-detail-lnktb');

        if (!cw || !cx) return false;

        if (q.dFe) return false;

        let cy = cx.querySelector('.dc-preview-thumb');
        const cz = cw.href;
        const cA = Date.now();
        let cB = null;

        try {
            const cC = await aI(cz);
            if (cC) {
                if (cA - cC.time < (q.cDu || 21600000)) {
                    cB = cC;
                }
            }
        } catch(cD) {}

        const cE = async (cF, cG, cH, cI) => {
            if (q.sIm && cy) {
                const cJ = cF && (cF.includes('dcinside_icon.png') || cF.includes('no_img'));
                if (cF && !cJ && (cv.querySelector('.sp-lst-img, .sp-lst-recoimg, .sp-lst-best, .sp-lst-bestlight'))) {
                    cy.src = cF;
                    cy.style.visibility = 'visible';
                    cy.style.backgroundColor = '#f2f2f2';
                } else {
                    cy.style.visibility = 'hidden';
                    cy.style.backgroundColor = 'transparent';
                }
            }

            if (cG !== null && !q.pPr) {
                const cK = cv.querySelectorAll('.ginfo li');
                cK.forEach(cL => {
                    if (cL.textContent.includes('추천') && !cL.querySelector('.dislike-cnt')) {
                        const cM = document.createElement('span');
                        cM.className = 'dislike-cnt';
                        cM.innerText = `비추 ${cG}`;
                        cL.appendChild(cM);
                    }
                });
            }

            if (cH && cH.userId) {
                const cN = cv.querySelectorAll('.ginfo li');
                for (let cO of cN) {
                    const cP = cO.innerText.trim();
                    if (cP === cH.nickname || cP.startsWith(cH.nickname.split('(')[0])) {
                        if (!cO.querySelector('.custom-memo-area')) {
                            cO.appendChild(await bB(cH.userId, cH.nickname, cH.isIp, true));
                        }
                        break;
                    }
                }
            }

            if (q.pPr) {
                const cQ = cv.querySelector('.gall-detail-lnktb .lt');
                if (cQ && !cv.querySelector('.preview-line')) {
                    let cR = "";
                    const cS = cv.querySelector('.ginfo');
                    if (cS) {
                        const cT = cS.querySelectorAll('li');
                        cT.forEach(cU => {
                            if (cU.innerText.includes('추천')) {
                                cR = cU.innerText.trim();
                                cU.style.display = 'none';
                            }
                        });
                    }

                    const cV = document.createElement('div');
                    cV.className = 'preview-line';

                    let cW = "";
                    if (cR) cW += `<span class="preview-recomm">${cR}</span>`;

                    if (cG !== null) {
                         cW += `<span class="preview-recomm">비추 ${cG}</span> `;
                    }

                    if (cI) {
                        cW += `<span style="margin-left:2px;">${b(cI)}</span>`;
                    }

                    cV.innerHTML = cW;
                    cQ.appendChild(cV);
                }
            }
        };

        if (cB) {
            await cE(cB.imgUrl, cB.dislikeCount, cB.userInfo, cB.content);
            return false;
        }

        try {
            const cX = await fPP(cz);

            const cY = new DOMParser();
            const cZ = cY.parseFromString(cX, "text/html");

            let da = null;
            const db = cZ.querySelector('meta[property="og:image"]');
            if (db) da = db.getAttribute('content');
            if (!da || da.includes('dcinside_icon.png') || da.includes('no_img')) {
                const dc = cZ.querySelector('.writing_view_box img'); 
                if (dc) da = dc.getAttribute('data-original') || dc.getAttribute('src');
            }

            let dd = null;
            const de = cZ.querySelector('.down_num');
            if (de) {
                dd = (de.textContent || "").replace(/[^0-9]/g, '');
            }

            let df = null;
            const dg = cZ.querySelector('.write_div'); 
            if (dg) {
                dg.querySelectorAll('script, style, .adv-groupno, #auto_picture_area').forEach(dh => dh.remove());
                df = (dg.textContent || "").replace(/\s+/g, ' ').trim().substring(0, 25);
            }

            let di = null;
            const gallWriter = cZ.querySelector('.gall_writer');
            if (gallWriter) {
                let uId = gallWriter.getAttribute('data-uid');
                let uNick = gallWriter.getAttribute('data-nick');
                let isIp = false;

                if (!uId) {
                    uId = gallWriter.getAttribute('data-ip');
                    isIp = true;
                    if (uId) uNick = uNick + '(' + uId + ')';
                }
                di = { userId: uId, nickname: uNick, isIp: isIp };
            }

            await cE(da, dd, di, df);

            const dj = {
                url: cz,
                time: Date.now(),
                imgUrl: da,
                dislikeCount: dd,
                userInfo: di,
                content: df
            };

            await aP(dj).catch(() => {});
            return true;
        } catch (dk) {
            return false;
        }
    };

    const dl = async () => {
        if (ci) return;
        ci = true;

        const dm = document.createElement('li');
        dm.style.cssText = "text-align:center; padding:10px; color:#ccc; font-size:12px;";
        dm.innerText = "Loading...";
        ck.appendChild(dm);

        try {
            const dn = new URL(window.location.href);
            dn.searchParams.set('page', cj);

            const dp = await aX(dn.href);

            const dq = new DOMParser();
            const dr = dq.parseFromString(dp, 'text/html');

            const ds = dr.querySelectorAll('ul.gall-detail-lst > li:not(.notice):not(.click_ad)');
            dm.remove();

            if (ds.length > 0) {
                const dt = document.createElement('li');
                dt.className = 'page-divider';
                dt.innerText = `PAGE ${cj}`;
                ck.appendChild(dt);

                ds.forEach(du => ck.appendChild(du));
                cj++;
                
                cm(ds);
                be(ds);
            }
        } catch (dv) {
            dm.remove();
            await new Promise(dw => setTimeout(dw, 5000));
        } finally {
            ci = false;
        }
    };

    const dx = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 700) {
            dl();
        }
    };

    if (!window.location.href.includes('m.dcinside.com/dcscrip')) {
        
        rRLP();

        bS();
        const dy = new MutationObserver(bS);
        dy.observe(document.body, { childList: true, subtree: true });

        if (q.sRL && !q.dFe) {
            fetch(window.location.href, { method: 'HEAD' }).then(res => {
                const lmt = res.headers.get('x-rate-limit-limit') || res.headers.get('x-ratelimit-limit');
                const rem = res.headers.get('x-rate-limit-remaining') || res.headers.get('x-ratelimit-remaining');
                if (lmt && rem) uRL(lmt, rem);
            }).catch(()=>{});
        }

        if (ck) {
            const dz = ck.querySelectorAll('li:not(.notice):not(.click_ad)');
            cm(dz);
            be(dz);

            if (q.aSc) {
                window.addEventListener('scroll', dx);
            }

            const dA = new URLSearchParams(window.location.search);
            if (dA.has('page')) cj = parseInt(dA.get('page')) + 1;
        }
    }

})();
