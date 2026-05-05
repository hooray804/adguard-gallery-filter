# AdGuard 갤러리 필터 설치 가이드

## 목차

1. [광고 차단 및 관련 기술의 이해](#광고-차단-및-관련-기술의-이해)
2. [**설치 방법**](#설치-방법)

## 광고 차단 및 관련 기술의 이해

광고 차단을 적용하기 위한 규칙 모음인 필터(Filter list)는 대체로 .txt의 확장자를 가집니다.

### 네트워크(DNS) 필터링

브라우저가 서버에 자원(이미지, 스크립트, 광고 데이터 등)을 요청하기 전에 개입하여 해당 요청을 차단합니다.
*   **원리**: HTTP/HTTPS 요청 주소를 필터 리스트와 대조하여 일치하면 전송을 중단합니다.
*   **특징**: 광고 데이터를 아예 다운로드하지 않으므로 데이터 절약과 속도 향상에 가장 효과적입니다. 하지만 후술할 한계점인 도메인 주소가 주요 콘텐츠와 동일하거나 유동적으로 바꾸는 광고에는 작동하지 않습니다.

### 코스메틱(요소 숨김) 필터링

데이터 요청은 막지 못했거나 이미 로드된 페이지 내에서 광고가 차지하는 공간을 강제로 숨기는 방식입니다.
*   **원리**: CSS 선택자를 사용하여 광고 요소의 속성을 보이지 않도록 변경합니다.
*   **필요성**: 광고 서버가 웹사이트 본체와 같은 도메인을 사용하거나, 광고가 삭제된 자리에 남는 공백을 제거하기 위해 사용합니다. 일부 광고 차단기는 동적으로 생성되는 광고 요소를 실시간 감시하여 삭제하기도 합니다.

### 스크립트릿 및 인젝션

단순한 차단이나 숨기기로 해결되지 않는 복잡한 광고나 광고 차단 방지(Anti-Adblock) 스크립트를 무력화하기 위해 사용합니다.
*   **원리**: 웹사이트 내에 특정 자바스크립트 조각을 강제로 주입하여 광고 관련 함수를 빈 함수로 교체하거나, 차단기 감지 로직이 가짜 정보를 읽도록 속입니다.

### 유저스크립트(사용자 스크립트, Userscript)의 이해

유저스크립트는 웹사이트의 동작 방식을 직접 수정하거나 새로운 기능을 추가하는 독립적인 자바스크립트 파일입니다. 확장자 .user.js를 일반적으로 가지고 있습니다.

#### 스크립트 매니저가 필요한 이유

브라우저는 보안상 외부 스크립트가 웹사이트의 내부 데이터에 무분별하게 접근하는 것을 차단합니다. 따라서 유저스크립트를 안전하게 실행하고 관리하기 위해 '매니저(Tampermonkey 등)'라는 중간 매개체가 필요합니다.
*   **샌드박스**: 스크립트가 페이지의 원래 코드와 충돌하지 않도록 격리된 환경에서 실행됩니다.
*   **권한 관리**: `@grant` 구문을 통해 스크립트가 브라우저의 특정 API(저장소 접근, 크로스 도메인 요청 등)를 사용할 수 있도록 허용합니다.

#### 메타데이터와 실행 시점

유저스크립트 상단에는 `// ==UserScript==`로 시작하는 설정 값이 포함됩니다.
*   **@match / @include**: 스크립트가 작동할 사이트 주소를 지정합니다.
*   **@run-at**: 페이지 로딩 중 어느 시점에 코드를 실행할지 결정합니다. (예: DOM 생성 직후, 전체 로딩 완료 후 등)

## 설치 방법

사용하는 OS와 프로그램에 맞춰 적절히 설치하세요. 한 기기에서 여러 광고 차단기를 동시에 사용하는 것은 오작동 가능성이 높으니 지양을 권고합니다.
광고 차단 필터의 설치 방법만 제공하며, 유저스크립트는 적절한 매니저를 설치하여 관리하실 수 있습니다.

### Windows

<details>
<summary><b>AdGuard</b></summary>

아래의 방법으로 AdGuard/uBlock용 필터를 추가합니다.
1. 상단 바에서 `설정` 탭 열기
2. `광고와 팝업 차단` 메뉴 선택
3. `필터 추가` 버튼 클릭
4. `URL로 필터 추가` 버튼 클릭
5. 텍스트 필드에 `https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/filter.txt` 입력
6. `신뢰할 수 있는 필터임` 체크 후 하단 `추가` 버튼 클릭

아래의 방법으로 DNS 필터를 추가합니다.
1. 상단 바에서 `설정` 탭 열기
2. `DNS 보호` 메뉴 선택
3. 하단에 위치한 `DNS 필터 편집기 열기` 클릭
4. 하단 `+` 버튼 선택
5. `URL로 필터 추가` 버튼 클릭
6. 텍스트 필드에 `https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/DNS.txt` 입력
7. `추가`, `추가` 버튼 차례로 클릭

</details>

<details>
<summary><b>uBlock Origin</b></summary>

> uBlock Origin Lite가 아님에 유의하세요. 자세한 내용은 [나무위키](https://namu.wiki/w/uBlock%20Origin#s-5.2)를 참고하세요.

1. `대시보드` 열기
2. `필터 목록` 탭 선택
3. 하단 스크롤 및 `불러오기` 펼치기
4. 텍스트 필드에 `https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/filter.txt` 입력
5. 상단 `변경사항 적용` 버튼 클릭

</details>

### macOS

<details>
<summary><b>AdGuard</b></summary>

> AdGuard Mini가 아님에 유의하세요.

아래의 방법으로 AdGuard/uBlock용 필터를 추가합니다.
1. 상단 바에서 `⚙️` 버튼 클릭
2. `필터 구독` 메뉴 선택
3. 목록 왼쪽 하단의 `+` 버튼 클릭
4. `https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/filter.txt` 필터 추가하기
5. `✏️` 버튼 클릭 후 `신뢰할 수 있는 필터임` 체크

아래의 방법으로 DNS 필터를 추가합니다.
1. 상단 바에서 `설정` 탭 열기
2. `DNS` 메뉴 선택
3. `필터` 클릭
4. 하단 `+` 버튼 선택
5. `https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/DNS.txt` 필터 추가하기

</details>

### Android

<details>
<summary><b>AdGuard</b></summary>

> AdGuard 콘텐츠 차단기가 아님에 유의하세요.

아래의 방법으로 AdGuard/uBlock용 필터를 추가합니다.
1. 하단 바에서 다섯번째 `설정` 탭 열기
2. `필터링` 메뉴 선택
3. `필터` 메뉴 선택
4. `사용자 정의 필터` 버튼 클릭
5. `필터 추가` 버튼 클릭
6. 텍스트 필드에 `https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/filter.txt` 입력
7. 하단 `추가` 버튼 클릭

아래의 방법으로 DNS 필터를 추가합니다.
1. 하단 바에서 두번째 `보호` 탭 열기
2. `DNS 보호` 메뉴 선택
3. `DNS 필터` 클릭
4. 상단 `DNS 필터 추가` 버튼 선택
5. `URL로 필터 추가` 버튼 클릭
6. `https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/DNS.txt` 입력
7. `추가` 버튼 클릭

</details>

### iOS / iPadOS

<details>
<summary><b>AdGuard</b></summary>

> 다른 OS용 버전과 달리 AdGuard에 내장 유저스크립트 관리자 기능이 없음에 유의하세요.

아래의 방법으로 AdGuard/uBlock용 필터를 추가합니다.
1. 하단 탭 바에서 두번째 아이콘 `보호` 탭 열기
2. `Safari 보호` 메뉴 선택
3. 첫번째 위치한 `필터` 열기
4. `Custom` 메뉴 선택
5. 상단 `필터 추가` 버튼 클릭
6. 텍스트 필드에 `https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/filter.txt` 입력
7. `다음`, `추가` 버튼 차례로 클릭

아래의 방법으로 DNS 필터를 추가합니다.
1. 하단 탭 바에서 두번째 아이콘 `보호` 탭 열기
2. `DNS 보호` 메뉴 선택
3. 네번째 위치한 `DNS 필터링` 열기
4. `Custom` 메뉴 선택
5. 상단 `DNS 필터` 버튼 클릭
6. 상단 `필터 추가` 버튼 클릭
7. 텍스트 필드에 `https://raw.githubusercontent.com/hooray804/adguard-gallery-filter/refs/heads/main/DNS.txt` 입력
8. `다음`, `추가` 버튼 차례로 클릭

</details>
