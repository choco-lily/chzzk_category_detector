require('dotenv').config();
const axios = require('axios');

// 테스트용 설정: 10명 이상 감지
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const CATEGORY_ID = 'DJMAX_RESPECT_V';
const VIEWER_THRESHOLD = 10; // 테스트를 위해 10명으로 설정

const API_URL = `https://api.chzzk.naver.com/service/v2/categories/GAME/${CATEGORY_ID}/lives`;

async function testDetector() {
    console.log(`----------------------------------------`);
    console.log(`[테스트 실행] 카테고리: ${CATEGORY_ID}`);
    console.log(`[테스트 실행] 임계값: ${VIEWER_THRESHOLD}명`);
    console.log(`----------------------------------------`);

    try {
        const response = await axios.get(API_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (response.data.code !== 200) {
            console.error('API 에러:', response.data.message);
            return;
        }

        const lives = response.data.content.data;
        let found = false;

        for (const live of lives) {
            if (live.concurrentUserCount >= VIEWER_THRESHOLD) {
                found = true;
                console.log(`✅ 감지 성공: ${live.channel.channelName} (현재 ${live.concurrentUserCount}명)`);
                
                // 실제 웹훅 전송
                if (DISCORD_WEBHOOK_URL && !DISCORD_WEBHOOK_URL.includes('your_')) {
                    await sendNotification(live);
                } else {
                    console.log('⚠️ 웹훅 URL이 설정되지 않아 전송을 스킵합니다.');
                }
            }
        }

        if (!found) {
            console.log('❌ 10명 이상인 방송이 현재 없습니다.');
        }

    } catch (error) {
        console.error('오류 발생:', error.message);
    }
}

async function sendNotification(live) {
    const thumbnailUrl = live.liveImageUrl ? live.liveImageUrl.replace('{type}', '1080') : live.defaultThumbnailImageUrl;

    const payload = {
        content: `<@596928010200809493>`, // 특정 유저 멘션 추가
        embeds: [{
            title: `🧪 [테스트] 시청자 ${VIEWER_THRESHOLD}명 감지 테스트`,
            description: `**${live.channel.channelName}** 님의 방송이 기준치를 넘었습니다.`,
            url: `https://chzzk.naver.com/live/${live.channel.channelId}`,
            color: 0xFFAA00,
            fields: [
                { name: "방송 제목", value: live.liveTitle || '제목 없음', inline: false },
                { name: "현재 시청자", value: `👤 ${live.concurrentUserCount}명`, inline: true },
                { name: "카테고리", value: live.liveCategoryValue || CATEGORY_ID, inline: true }
            ],
            image: {
                url: thumbnailUrl
            },
            thumbnail: {
                url: live.channel.channelImageUrl
            },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await axios.post(DISCORD_WEBHOOK_URL, payload);
        console.log(`🚀 디스코드 알림 전송 완료!`);
    } catch (e) {
        console.error('웹훅 전송 실패:', e.message);
    }
}

testDetector();
