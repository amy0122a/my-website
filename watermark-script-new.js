// 鍏ㄥ眬鐘舵€?
let selectedPlatform = null;

// API閰嶇疆
const API_CONFIG = {
    url: 'https://api.wxshares.com/api/qsy/as',
    key: 'puM4bNPd7nBIFcRXBUgvfutGzE'
};

// AI API閰嶇疆
const AI_API_CONFIG = {
    url: 'http://43.139.203.146:8050/v1/chat/completions',
    apiKey: 'sk-xjlzds0424',
    model: 'deepseek-chat'
};

// 閫夋嫨骞冲彴
function selectPlatform(platform) {
    selectedPlatform = platform;
    
    // 绉婚櫎鎵€鏈塧ctive绫?
    document.querySelectorAll('.platform-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 娣诲姞active绫诲埌閫変腑鐨勬寜閽?
    const selectedBtn = document.querySelector(`.platform-btn.${platform}`);
    selectedBtn.classList.add('active');
    
    const platformName = platform === 'douyin' ? '鎶栭煶' : '灏忕孩涔?;
    showNotification(`宸查€夋嫨 ${platformName} 骞冲彴`);
}

// 绮樿创閾炬帴
async function pasteLink() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('videoLink').value = text;
        showNotification('閾炬帴宸茬矘璐?);
    } catch (err) {
        // 濡傛灉娴忚鍣ㄤ笉鏀寔clipboard API锛屾彁绀虹敤鎴锋墜鍔ㄧ矘璐?
        showNotification('璇锋墜鍔ㄧ矘璐撮摼鎺ワ紙Ctrl+V锛?, 'info');
        document.getElementById('videoLink').focus();
    }
}

// 澶勭悊瑙嗛
async function processVideo() {
    let videoLink = document.getElementById('videoLink').value.trim();
    
    // 楠岃瘉蹇呭～椤?
    if (!selectedPlatform) {
        showNotification('鈿狅笍 璇峰厛閫夋嫨骞冲彴', 'warning');
        return;
    }
    
    if (!videoLink) {
        showNotification('鈿狅笍 璇疯緭鍏ヨ棰戦摼鎺?, 'warning');
        return;
    }
    
    // 浠庢枃鏈腑鎻愬彇閾炬帴锛堟敮鎸佸垎浜枃鏈級
    const urlMatch = videoLink.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
        videoLink = urlMatch[0];
        // 鏇存柊杈撳叆妗嗘樉绀烘彁鍙栫殑閾炬帴
        document.getElementById('videoLink').value = videoLink;
    } else {
        showNotification('鈿狅笍 鏈壘鍒版湁鏁堢殑閾炬帴鍦板潃', 'warning');
        return;
    }
    
    const platformName = selectedPlatform === 'douyin' ? '鎶栭煶' : '灏忕孩涔?;
    showNotification('馃攧 姝ｅ湪瑙ｆ瀽瑙嗛...', 'info');
    
    try {
        // 璋冪敤API
        const formData = new URLSearchParams();
        formData.append('key', API_CONFIG.key);
        formData.append('url', videoLink);
        
        const response = await fetch(API_CONFIG.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            showNotification('鉁?瑙嗛瑙ｆ瀽鎴愬姛锛?, 'success');
            
            // 淇濆瓨瑙嗛鏁版嵁
            window.videoData = result.data;
            
            // 鏄剧ず缁撴灉鍖哄煙
            const resultSection = document.getElementById('resultSection');
            resultSection.style.display = 'block';
            
            // 鏇存柊缁撴灉淇℃伅
            document.getElementById('resultPlatform').textContent = platformName;
            document.getElementById('videoTitle').textContent = result.data.title || '鏃犳爣棰?;
            
            // 鏄剧ず灏侀潰鍥?
            if (result.data.photo) {
                document.getElementById('videoCover').src = result.data.photo;
                document.getElementById('videoCover').style.display = 'block';
            }
            
            // 骞虫粦婊氬姩鍒扮粨鏋滃尯鍩?
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
        } else {
            showNotification(`鉂?瑙ｆ瀽澶辫触锛?{result.msg}`, 'warning');
        }
        
    } catch (error) {
        console.error('API璋冪敤閿欒锛?, error);
        showNotification('鉂?缃戠粶閿欒锛岃绋嶅悗閲嶈瘯', 'warning');
    }
}

// 涓嬭浇瑙嗛
function downloadVideo() {
    if (!window.videoData || !window.videoData.url) {
        showNotification('鉂?瑙嗛鍦板潃涓嶅瓨鍦?, 'warning');
        return;
    }
    
    showNotification('猬囷笍 寮€濮嬩笅杞芥棤姘村嵃瑙嗛...', 'info');
    
    // 鍒涘缓涓嬭浇閾炬帴
    const link = document.createElement('a');
    link.href = window.videoData.url;
    link.download = `${window.videoData.title || '瑙嗛'}.mp4`;
    link.target = '_blank';
    
    // 瑙﹀彂涓嬭浇
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('鉁?涓嬭浇宸插紑濮嬶紒', 'success');
}

// 鐢熸垚AI鍐呭
async function generateAIContent(type) {
    // 妫€鏌ユ槸鍚︽湁瑙嗛鏁版嵁
    if (!window.videoData || !window.videoData.title) {
        showNotification('鈿狅笍 璇峰厛瑙ｆ瀽瑙嗛', 'warning');
        return;
    }
    
    const resultText = document.getElementById(`${type}Result`);
    const loading = document.getElementById(`${type}Loading`);
    const actions = document.getElementById(`${type}Actions`);
    
    // 鏄剧ず鍔犺浇鐘舵€?
    loading.style.display = 'flex';
    resultText.value = '';
    actions.style.display = 'none';
    
    try {
        let content = '';
        
        if (type === 'title') {
            content = await generateAITitle();
        } else if (type === 'copywriting') {
            content = await generateAICopywriting();
        }
        
        // 闅愯棌鍔犺浇鐘舵€侊紝鏄剧ず缁撴灉
        loading.style.display = 'none';
        resultText.value = content;
        actions.style.display = 'flex';
        
        showNotification('鉁?鍐呭宸茬敓鎴愶紒', 'success');
    } catch (error) {
        loading.style.display = 'none';
        resultText.value = '鐢熸垚澶辫触锛岃閲嶈瘯';
        actions.style.display = 'flex';
        showNotification('鉂?鐢熸垚澶辫触锛岃閲嶈瘯', 'warning');
    }
}

// 澶嶅埗鍐呭
function copyContent(type) {
    const textarea = document.getElementById(`${type}Result`);
    if (!textarea.value) {
        showNotification('鈿狅笍 娌℃湁鍐呭鍙鍒?, 'warning');
        return;
    }
    
    textarea.select();
    document.execCommand('copy');
    
    const typeName = type === 'title' ? '鏍囬' : '姝ｆ枃';
    showNotification(`鉁?${typeName}宸插鍒跺埌鍓创鏉縛, 'success');
}

// 璋冪敤AI API
async function callAI(prompt) {
    try {
        const response = await fetch(AI_API_CONFIG.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: AI_API_CONFIG.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });
        
        const result = await response.json();
        
        if (result.choices && result.choices[0]) {
            return result.choices[0].message.content;
        } else {
            throw new Error('AI杩斿洖鏍煎紡閿欒');
        }
    } catch (error) {
        console.error('AI API璋冪敤閿欒锛?, error);
        throw error;
    }
}

// 鐢熸垚AI鏂囨
async function generateAICopywriting() {
    const videoTitle = window.videoData.title;
    const platform = selectedPlatform === 'douyin' ? '鎶栭煶' : '灏忕孩涔?;
    
    const prompt = `璇蜂负浠ヤ笅${platform}瑙嗛鐢熸垚涓€娈靛惛寮曚汉鐨勬帹骞挎枃妗堬細

瑙嗛鏍囬锛?{videoTitle}

瑕佹眰锛?
1. 鏂囨瑕佹湁鍚稿紩鍔涳紝鑳藉紩璧风敤鎴峰叴瓒?
2. 鍖呭惈2-3涓浉鍏崇殑琛ㄦ儏绗﹀彿
3. 娣诲姞3-5涓儹闂ㄨ瘽棰樻爣绛撅紙#寮€澶达級
4. 瀛楁暟鎺у埗鍦?00瀛椾互鍐?
5. 璇皵瑕佽交鏉炬椿娉硷紝閫傚悎绀句氦濯掍綋

璇风洿鎺ヨ緭鍑烘枃妗堝唴瀹癸紝涓嶈鏈夊叾浠栬鏄庛€俙;

    return await callAI(prompt);
}

// 鐢熸垚AI鏍囬
async function generateAITitle() {
    const videoTitle = window.videoData.title;
    const platform = selectedPlatform === 'douyin' ? '鎶栭煶' : '灏忕孩涔?;
    
    const prompt = `璇蜂负浠ヤ笅${platform}瑙嗛鏍囬杩涜浼樺寲鏀瑰啓锛?

鍘熸爣棰橈細${videoTitle}

瑕佹眰锛?
1. 鏍囬瑕佹洿鍚稿紩鐪肩悆锛屾彁鍗囩偣鍑荤巼
2. 鍙互娣诲姞1-2涓〃鎯呯鍙?
3. 淇濇寔鍘熸剰锛屼絾琛ㄨ揪鏇寸敓鍔?
4. 瀛楁暟鎺у埗鍦?0瀛椾互鍐?
5. 閫傚悎${platform}骞冲彴鐨勯鏍?

璇风洿鎺ヨ緭鍑?涓笉鍚岄鏍肩殑鏍囬锛屾瘡琛屼竴涓紝涓嶈缂栧彿銆俙;

    return await callAI(prompt);
}

// 鏄剧ず閫氱煡
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    let bgColor;
    switch(type) {
        case 'warning':
            bgColor = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            break;
        case 'info':
            bgColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            break;
        default:
            bgColor = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 鐩戝惉鍥炶溅閿?
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('videoLink').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processVideo();
        }
    });
});

// 娣诲姞鍔ㄧ敾鏍峰紡
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
