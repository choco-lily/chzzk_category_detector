require('dotenv').config();
const axios = require('axios');

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const CATEGORY_ID = process.env.CATEGORY_ID || 'DJMAX_RESPECT_V';
const VIEWER_THRESHOLD = parseInt(process.env.VIEWER_THRESHOLD || '1000');
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '60000'); // 1분 (60000ms)

const API_URL = `https://api.chzzk.naver.com/service/v2/categories/GAME/${CATEGORY_ID}/lives`;

// 이미 알림을 보낸 방송 ID를 저장하여 중복 알림 방지
// 주의: GitHub Actions 주기적 실행 시 이 메모리는 초기화됩니다.
// 지속적인 방지를 위해서는 외부 저장소나 파일 커밋이 필요할 수 있습니다.
let notifiedStreams = new Set();

async function checkStreams() {
    try {
        console.log(`[${new Date().toLocaleString()}] ${CATEGORY_ID} 카테고리 방송을 확인 중...`);
        
        const response = await axios.get(API_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        if (response.data.code !== 200) {
            console.error('API 에러:', response.data.message);
            return;
        }

        const lives = response.data.content.data;
        const currentLiveIds = new Set();
        let detectedAny = false;

        if (!lives || lives.length === 0) {
            console.log("현재 진행 중인 방송이 없습니다.");
        } else {
            for (const live of lives) {
                currentLiveIds.add(live.liveId);
                
                if (live.concurrentUserCount >= VIEWER_THRESHOLD) {
                    detectedAny = true;
                    if (!notifiedStreams.has(live.liveId)) {
                        console.log(`🚨 감지됨: ${live.channel.channelName} (${live.concurrentUserCount}명)`);
                        await sendDiscordNotification(live);
                        notifiedStreams.add(live.liveId);
                    } else {
                        console.log(`이미 알림을 보낸 방송: ${live.channel.channelName}`);
                    }
                }
            }
        }

        // 종료된 방송 관리
        for (const id of notifiedStreams) {
            if (!currentLiveIds.has(id)) {
                notifiedStreams.delete(id);
            }
        }

        console.log(`체크 완료. (감지된 방송: ${detectedAny ? '있음' : '없음'})`);

        // GitHub Actions 같은 환경에서 1회 실행 후 종료해야 하는 경우
        if (process.env.RUN_ONCE === 'true') {
            process.exit(0);
        }

    } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error.message);
        if (process.env.RUN_ONCE === 'true') {
            process.exit(1);
        }
    }
}

async function sendDiscordNotification(live) {
    const liveUrl = `https://chzzk.naver.com/live/${live.channel.channelId}`;
    const thumbnailUrl = live.liveImageUrl ? live.liveImageUrl.replace('{type}', '1080') : live.defaultThumbnailImageUrl;

    const payload = {
        content: `<@596928010200809493>`, // 특정 유저 멘션 추가
        embeds: [{
            title: `🚀 시청자 ${VIEWER_THRESHOLD}명 돌파 감지!`,
            description: `**${live.channel.channelName}** 님의 방송이 시청자 **${live.concurrentUserCount.toLocaleString()}명**을 기록 중입니다.`,
            url: liveUrl,
            color: 0x00FFA3,
            fields: [
                { name: "방송 제목", value: live.liveTitle || '제목 없음', inline: false },
                { name: "현재 시청자", value: `👤 ${live.concurrentUserCount.toLocaleString()}명`, inline: true },
                { name: "카테고리", value: live.liveCategoryValue || CATEGORY_ID, inline: true }
            ],
            thumbnail: { url: live.channel.channelImageUrl },
            image: { url: thumbnailUrl },
            footer: {
                text: "Chzzk Category Detector",
                icon_url: "https://ssl.pstatic.net/static/nng/glive/icon/favicon.ico"
            },
            timestamp: new Date().toISOString()
        }]
    };

    if (DISCORD_WEBHOOK_URL.includes('your_discord_webhook')) {
        console.log('⚠️ 디스코드 웹훅 URL이 설정되지 않았습니다 (place-holder). 알림 전송을 건너뜁니다.');
        return;
    }

    try {
        await axios.post(DISCORD_WEBHOOK_URL, payload);
        console.log(`✅ ${live.channel.channelName}님에 대한 알림을 디스코드로 전송했습니다.`);
    } catch (error) {
        console.error('디스코드 웹훅 전송 중 오류 발생:', error.message);
    }
}

if (!DISCORD_WEBHOOK_URL) {
    console.error('❌ 에러: DISCORD_WEBHOOK_URL이 정의되지 않았습니다.');
    process.exit(1);
}

console.log(`----------------------------------------`);
console.log(`감시 카테고리: ${CATEGORY_ID}`);
console.log(`알림 임계값: ${VIEWER_THRESHOLD}명`);
if (process.env.RUN_ONCE === 'true') {
    console.log(`실행 모드: GitHub Actions (1회 실행)`);
} else {
    console.log(`체크 주기: ${CHECK_INTERVAL / 1000}초`);
}
console.log(`----------------------------------------`);

checkStreams();
if (process.env.RUN_ONCE !== 'true') {
    setInterval(checkStreams, CHECK_INTERVAL);
}

