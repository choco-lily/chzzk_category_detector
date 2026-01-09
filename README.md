# Chzzk Category Detector

치지직(Chzzk)의 특정 카테고리를 모니터링하여, 시청자 수가 설정한 수치를 넘어서는 방송이 발생하면 디스코드 웹훅으로 알림을 보내는 Node.js 프로그램입니다.

## 로컬 실행 방법

1. **Node.js 설치**: 시스템에 Node.js가 설치되어 있어야 합니다.
2. **의존성 설치**:
   ```bash
   npm install
   ```
3. **설정**: `.env` 파일을 생성하고 내용을 설정합니다 (기존 파일 참고).
4. **실행**:
   ```bash
   node index.js
   ```

## GitHub Actions 설정 방법

이 프로그램을 자신의 GitHub 리포지토리에 올린 후, 24시간 자동으로 작동하게 설정할 수 있습니다.

1. **GitHub Secrets 설정**:
   - `Settings` > `Secrets and variables` > `Actions` > `New repository secret` 클릭
   - 이름: `DISCORD_WEBHOOK_URL`
   - 값: 자신의 디스코드 웹훅 URL 입력

2. **GitHub Variables 설정 (선택 사항)**:
   - `Settings` > `Secrets and variables` > `Actions` > `Variables` 탭 선택
   - `CATEGORY_ID`: 감시할 카테고리 (예: `DJMAX_RESPECT_V`)
   - `VIEWER_THRESHOLD`: 기준 시청자 수 (예: `1000`)

3. **작동 확인**:
   - `.github/workflows/monitor.yml` 파일이 포함된 상태로 푸시하면, 설정된 주기(기본 10분)마다 자동으로 실행됩니다.
   - `Actions` 탭에서 수동으로 `Run workflow`를 눌러 즉시 테스트할 수 있습니다.

## 주요 기능

- **중복 알림 방지**: 동일한 방송 세션에 대해 중복으로 알림을 보내지 않습니다. 시청자 수가 떨어졌다가 다시 올라도 동일한 방송이면 재전송하지 않습니다.
- **자동 목록 관리**: 방송이 완전히 종료되면 상태를 초기화하여 다음 방송 시 다시 알림을 보낼 수 있게 관리합니다.
- **풍부한 알림**: 방송 제목, 현재 시청자 수, 카테고리 정보, 유저 멘션, 채널 이미지 및 방송 썸네일을 포함한 임베드 메시지를 전송합니다.

