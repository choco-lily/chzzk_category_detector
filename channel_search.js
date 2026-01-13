require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const HISTORY_FILE = path.join(__dirname, 'known_channels.json');

const KEYWORDS = ['헤비', 'Hebi'];
const SEARCH_URLS = [
    'https://api.chzzk.naver.com/service/v1/search/channels?keyword=%ED%97%A4%EB%B9%84&offset=0&size=50&withFirstChannelContent=false',
    'https://api.chzzk.naver.com/service/v1/search/channels?keyword=Hebi&offset=0&size=50&withFirstChannelContent=false'
];

// 히스토리 로드
let knownChannels = new Set();
if (fs.existsSync(HISTORY_FILE)) {
    try {
        const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        knownChannels = new Set(data);
    } catch (e) {
        console.error('히스토리 파일을 읽는 중 오류 발생:', e.message);
    }
}

function isMatchingName(channelName) {
    if (!channelName) return false;
    
    // 공백으로 분리
    const parts = channelName.split(' ');
    
    for (const part of parts) {
        // 뒤에 .이 붙어있으면 제거하고 비교
        const normalized = part.endsWith('.') ? part.slice(0, -1) : part;
        
        if (KEYWORDS.includes(normalized)) {
            return true;
        }
    }
    return false;
}

async function searchChannels() {
    console.log(`[${new Date().toLocaleString()}] 채널 검색 중...`);
    const newMatches = [];

    try {
        for (const url of SEARCH_URLS) {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (response.data.code !== 200) continue;

            const data = response.data.content.data;
            if (!data) continue;

            for (const item of data) {
                const channel = item.channel;
                if (!channel) continue;

                const { channelId, channelName } = channel;

                // 이미 알고 있는 채널이면 스킵
                if (knownChannels.has(channelId)) continue;

                // 이름 매칭 확인
                if (isMatchingName(channelName)) {
                    newMatches.push(channel);
                    knownChannels.add(channelId);
                }
            }
        }

        if (newMatches.length > 0) {
            console.log(`새로운 채널 ${newMatches.length}개 발견!`);
            for (const channel of newMatches) {
                await sendDiscordNotification(channel);
            }
            // 히스토리 저장
            saveHistory();
        } else {
            console.log('새로 발견된 매칭 채널이 없습니다.');
        }

    } catch (error) {
        console.error('검색 중 오류 발생:', error.message);
    }
}

function saveHistory() {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(Array.from(knownChannels), null, 2));
}

async function sendDiscordNotification(channel) {
    const payload = {
        content: `<@596928010200809493>`,
        embeds: [{
            title: `🆕 새로운 헤비 채널 발견!`,
            description: `검색어 매칭 채널 **${channel.channelName}**이(가) 발견되었습니다.`,
            url: `https://chzzk.naver.com/live/${channel.channelId}`,
            color: 0x5865F2,
            thumbnail: {
                url: channel.channelImageUrl || "https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray.png"
            },
            fields: [
                {
                    name: "채널명",
                    value: channel.channelName,
                    inline: true
                },
                {
                    name: "팔로워 수",
                    value: (channel.followerCount || 0).toLocaleString() + "명",
                    inline: true
                },
                {
                    name: "채널 설명",
                    value: channel.channelDescription || "설명 없음",
                    inline: false
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "Chzzk Channel Detector"
            }
        }]
    };

    try {
        await axios.post(DISCORD_WEBHOOK_URL, payload);
        console.log(`✅ 알림 전송 완료: ${channel.channelName}`);
    } catch (error) {
        console.error('디스코드 알림 전송 실패:', error.message);
    }
}

// 1회 실행 (GitHub Actions용)
if (require.main === module) {
    searchChannels().then(() => {
        if (process.env.RUN_ONCE === 'true') {
            process.exit(0);
        }
    });
}
