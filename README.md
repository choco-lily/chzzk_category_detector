# Chzzk Category Detector

치지직(Chzzk)의 특정 게임 카테고리를 실시간으로 모니터링하여, 설정한 시청자 수 임계값을 넘는 방송이 발생할 경우 디스코드 웹훅을 통해 알림을 전송하는 Node.js 기반 자동화 도구입니다.

> **면책 조항 (Disclaimer)**
> - 이 프로그램은 네이버(NAVER) 및 치지직(CHZZK)과 어떠한 공식적인 관계도 없는 개인 프로젝트입니다.
> - 본 프로그램은 치지직의 비공식 API를 사용하며, API 사양 변경에 따라 기능이 중단되거나 비정상적으로 작동할 수 있습니다.
> - 이 프로그램을 사용함으로써 발생하는 계정 제한, IP 차단 등 모든 어떠한 형태의 불이익도 개발자는 책임지지 않으며, 모든 책임은 사용자에게 있습니다.

---

## 🚀 주요 기능

- **실시간 모니터링**: 
  - 치지직 API를 통해 특정 게임 카테고리의 라이브 방송 목록을 확인합니다.
  - **채널 검색**: "헤비" 또는 "Hebi"를 키워드로 하는 새로운 채널이 등록되면 감지하여 알림을 보냅니다. (채널명 split 시 정확히 일치하거나 마침표가 붙은 경우 포함)
- **스마트 알림 시스템**: 
  - 방송 시청자 수가 기준치(예: 1,000명)를 초과할 때만 알림을 보냅니다.
  - **중복 방지**: 한 번 알림을 보낸 방송은 재알림을 보내지 않으며, 새로 검색된 채널은 히스토리에 기록하여 중복 알림을 차단합니다.

- **풍부한 알림 메시지**: 
  - 방송 제목, 현재 시청자 수, 상세 카테고리 정보 표시.
  - 실시간 방송 썸네일(1080p) 및 채널 프로필 이미지 포함.
  - 방송 바로가기 링크 제공.
  - **유저 멘션**: 알림 시 특정 디스코드 유저를 태그하여 즉각적인 확인이 가능합니다.
- **멀티 플랫폼 지원**: 로컬 PC 및 GitHub Actions(서버리스) 환경 모두에서 작동하도록 설계되었습니다.

---

## 💻 로컬 실행 방법

### 1. 사전 준비
- [Node.js](https://nodejs.org/) (v16 이상 권장)가 설치되어 있어야 합니다.

### 2. 설치 및 설정
```bash
# 리포지토리 클론 후 이동 (또는 폴더 생성)
cd chzzk_category_detector

# 의존성 패키지 설치
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 아래 내용을 입력합니다:
```env
# 디스코드 웹훅 URL (필수)
DISCORD_WEBHOOK_URL=your_discord_webhook_url

# 감시할 카테고리 ID (기본값: DJMAX_RESPECT_V)
# 치지직 카테고리 URL에서 확인 가능 (예: League_of_Legends, TEKKEN_8 등)
CATEGORY_ID=DJMAX_RESPECT_V

# 알림 기준 시청자 수
VIEWER_THRESHOLD=1000

# 체크 주기 (밀리초 단위, 로컬 실행 시에만 적용)
CHECK_INTERVAL=60000
```

### 4. 실행
```bash
node index.js
```

---

## 🤖 GitHub Actions 설정 방법 (24시간 자동화)

GitHub Actions를 통해 서버 없이 무료로 24시간 모니터링 시스템을 구축할 수 있습니다.

1. **리포지토리 푸시**: 소스 코드를 본인의 GitHub 개인 리포지토리에 업로드합니다.
2. **Secrets 등록**:
   - `Settings` > `Secrets and variables` > `Actions` > `New repository secret`
   - 이름: `DISCORD_WEBHOOK_URL` / 값: 자신의 웹훅 URL
3. **Variables 등록 (선택 사항)**:
   - `Variables` 탭에서 `CATEGORY_ID`, `VIEWER_THRESHOLD` 등을 추가하여 코드 수정 없이 설정을 제어할 수 있습니다.
   - **`DISABLE_MONITOR`**: 값을 `true`로 설정하면 GitHub Actions 작동을 일시 중지할 수 있습니다. (서버 전용으로 사용할 때 유용)
4. **워크플로우 확인**:
   - `.github/workflows/monitor.yml` 설정에 따라 기본 5분마다 자동으로 실행됩니다.
   - `Actions` 탭에서 `Run workflow`를 눌러 수동으로 즉시 실행 테스트가 가능합니다.

---

## 🛠 기술 스택
- **Runtime**: Node.js
- **Network**: Axios (API 요청)
- **Config**: dotenv (환경 변수 관리)
- **Automation**: GitHub Actions (스케줄러)

---

## ⚖️ 라이선스 및 주의사항
본 프로그램의 코드는 자유롭게 수정 및 배포가 가능하나, 치지직 서비스 운영 정책을 준수하며 사용하시기 바랍니다. 과도한 API 요청은 서비스 이용에 제한을 줄 수 있습니다.
