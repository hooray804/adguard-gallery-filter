# Adguard Gallery Filter for Korean

이 필터와 유저스크립트는 기존 Adguard와 uBlock Origin 한국어 필터의 부족한 점을 보완하고, 광고 및 커뮤니티 이용 환경을 개선하기 위해 제작되었습니다.

Adguard, uBlock Origin, Brave Browser의 고급 차단 문법을 모두 지원합니다.

---

## 필터 및 스크립트

### 광고 차단 필터
* **Adguard/uBlock용 필터**

https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/filter.txt

* **DNS 필터**

https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/DNS.txt

### 유저스크립트
* **에펨코리아 익스텐션 (Gallery Extension)**

https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/Gallery%20Extension.user.js

* **디시인사이드 엑스퍼트 익스텐션 (Dcinside Expert Extension)**

https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/dc.user.js

---

### 에펨코리아 갤러리 확장
* **광고 및 제휴 제거**: 파워링크 제거 및 핫딜 제휴 링크를 일반 링크로 복구
* **댓글 이미지 임베딩**: 댓글에 있는 이미지/동영상 링크를 클릭 없이 바로 표시
* **커스텀 차단 시스템**: 유저 차단 및 키워드 차단(게시물/댓글) 기능 제공 (데이터 내보내기/불러오기 지원)
* **UI 최적화**: 공지사항, 검색 어시스턴트, 최근 방문 목록 등 불필요한 요소 제거

https://gall.dcinside.com/mgallery/board/view/?id=adguard&no=7935
https://gall.dcinside.com/mgallery/board/view/?id=adguard&no=2348

### 디시인사이드 엑스퍼트
* **무한 스크롤**: 페이지 번호를 누를 필요 없이 하단 도달 시 자동 로드
* **미리보기 썸네일**: 리스트에서 본문의 첫 번째 이미지를 즉시 확인
* **비추천수 표시**: 게시글 목록에서 추천수와 함께 비추천수 표시
* **이용자 메모**: 모바일 웹에서도 지원
* **주의 사항**: 본 스크립트는 기능 구현을 위해 게시글을 백그라운드에서 접속하므로 셀룰러 데이터 사용량이 증가할 수 있습니다. 모든 메모와 캐시 데이터는 브라우저 내부에만 저장되어 브라우저 데이터 삭제 시 데이터가 복구되지 않음에 유의하시기 바랍니다. 또한 다크 모드는 지원되지 않습니다.

https://gall.dcinside.com/mgallery/board/view/?id=adguard&no=8115

---

## License

This project is a fork of [Zziniswell/Adguard-gallery-filter](https://github.com/Zziniswell/Adguard-gallery-filter).

본 프로젝트는 **Apache License 2.0**을 따릅니다.
* 원본 프로젝트의 저작권은 [Zziniswell](https://github.com/Zziniswell)에게 있습니다.
* 수정 및 추가된 부분에 대한 권리는 해당 기여자에게 있습니다.
* 자세한 내용은 리포지토리 내 `LICENSE` 파일을 확인하세요.

---

## Contribution

이용 중 발생한 버그나 개선 제안은 [GitHub Issues](https://github.com/hooray804/adguard-gallery-filter/issues) 등을 통해 제보해 주시기 바랍니다.
