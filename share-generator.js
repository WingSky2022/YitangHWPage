/**
 * ShareGenerator - Handles the generation of the homework share image.
 * Dependencies: html2canvas, qrcodejs
 */
class ShareGenerator {
    constructor(options = {}) {
        this.containerId = options.containerId || 'share-source-container';
        this.modalId = options.modalId || 'shareModal';
        this.imageId = options.imageId || 'share-generated-image'; // ID for the img tag in modal
        this.options = options;
    }

    /**
     * Main entry point to generate and show the image
     */
    async generate() {
        try {
            this.showLoading();

            // 1. Prepare the content
            await this.buildContent();

            // 2. Ensure resources are loaded (QR code)
            await this.wait(500); // Give inner render a moment

            // 3. Capture logic
            const container = document.getElementById(this.containerId);

            // Force visibility for capture without flashing on screen
            // We use standard html2canvas technique: clone or ensure opacity
            // Since we are using a hidden container, we set opacity to 1 but keep it off-screen/behind
            // The container is already absolute positioned.

            const originalOpacity = container.style.opacity;
            const originalZIndex = container.style.zIndex;

            // Temporarily make it "visible" to the renderer
            container.style.opacity = '1';
            container.style.zIndex = '-9999';

            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff', // Ensure white background
                logging: false,
                width: 375, // Explicit width matches CSS
                windowWidth: 375, // Force context width
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
            });

            // Restore
            container.style.opacity = originalOpacity;
            container.style.zIndex = originalZIndex;

            // 4. Display
            const imgData = canvas.toDataURL('image/png');
            this.showInModal(imgData);

            // 5. Cleanup
            this.hideLoading();

        } catch (error) {
            console.error('Share generation failed:', error);
            alert('生成分享图片失败，请重试');
            this.hideLoading();
        }
    }

    /**
     * Build the DOM structure for the share image
     */
    async buildContent() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = ''; // Clear previous

        // --- 1. User Info & Header ---
        const headerHtml = `
            <div class="p-6 bg-white flex flex-col items-center w-full">
                <!-- User Info -->
                <div class="flex items-center gap-3 mb-6 w-full">
                     <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 overflow-hidden">
                        <span class="material-icons-round text-xl">person</span>
                     </div>
                     <div class="flex flex-col">
                        <span class="font-bold text-gray-900 text-base">学员：Me</span>
                        <span class="text-xs text-gray-500">提交于 2026-01-02</span>
                     </div>
                     <img src="https://cdn.yitang.top/yitang-fe-static/assets/img/homework/stamp.png" class="w-20 ml-auto opacity-90 -rotate-12" crossorigin="anonymous">
                </div>

                <!-- Title & Score -->
                <h1 class="text-xl font-bold text-gray-900 mb-2 w-full text-left">《业务公式实操1：建立公式篇》</h1>
                <div class="flex items-baseline gap-1 mb-8 w-full border-b pb-4 border-gray-100">
                    <span class="text-sm text-gray-500">获得学分</span>
                    <span class="text-2xl font-black text-primary">6</span>
                </div>
            </div>
        `;

        // --- 2. Homework Content (Dynamic Cloning) ---
        // We will construct this part to ensure it looks good
        let bodyHtml = `<div class="px-6 pb-6 w-full space-y-6 text-left" id="share-content-body">`;

        // Manual construction for guaranteed style, mimicking the real content
        // In a real generic app, we'd iterate over the inputs.
        bodyHtml += `
            <div class="mb-4">
                 <h3 class="font-bold text-gray-900 mb-2 text-base">1、第一个作业：请根据自己的业务，写出三个公式。</h3>
                 <div class="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed border border-gray-100">
                    <p class="font-bold mb-1">我的回答：</p>
                    <p>1. 营收 = 潜在客户数 × 转化率 × LTV</p>
                    <p>2. 活跃用户 = 新增用户 + 留存用户 - 流失用户</p>
                    <p>3. 内容ROI = (引流价值 + 品牌价值) / 内容制作成本</p>
                 </div>
            </div>
        `;

        bodyHtml += `
            <div class="mb-4">
                 <h3 class="font-bold text-gray-900 mb-2 text-base">2、第二个作业：案例推演题</h3>
                 <div class="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed border border-gray-100">
                    <p class="font-bold mb-1">我的回答：</p>
                    <p>针对“社区团购”业务场景：</p>
                    <p>机会点：通过优化“团长”激励机制提高转化率。</p>
                    <p>假设1：如果提高团长佣金比例5%，GMV能提升10%。</p>
                    <p>假设2：如果不定期举办团长PK赛，活跃团长数能提升20%。</p>
                 </div>
            </div>
        `;

        // Teacher Comment
        bodyHtml += `
             <div class="mt-6 p-4 bg-[#fefae5] rounded-lg text-sm text-gray-700 leading-relaxed border border-yellow-100">
                <span class="font-bold text-gray-900">班主任点评：</span>
                总结得非常到位！尤其是第三个公式关于ROI的拆解，非常有见地。案例推演的方向也找得很准，关于假设1，建议可以先小范围试点，观察佣金提升带来的实际边际收益，防止成本过高。
            </div>
        `;

        bodyHtml += `</div>`; // Close body

        // --- 3. Footer (QR Code) ---
        const footerHtml = `
            <div class="px-6 pb-8 w-full flex flex-col items-center bg-white rounded-b-xl">
                 <div class="w-full border-t border-dashed border-gray-200 mb-6"></div>
                 
                <!-- Scan Text Placeholder (Dynamic visibility) -->
                <div id="share-scan-text" class="hidden mb-6 px-4 py-1.5 bg-white border border-primary text-primary text-xs rounded-full flex items-center gap-1 shadow-sm">
                    <span class="material-icons-round text-sm" style="font-size: 14px;">arrow_downward</span>
                    <span>扫码查看全文</span>
                </div>

                <div class="flex items-center gap-4">
                    <div id="share-qrcode" class="bg-white p-1 rounded-sm"></div>
                    <div class="flex flex-col text-left">
                        <span class="text-sm font-bold text-gray-900">长按识别二维码</span>
                        <span class="text-xs text-gray-400">查看完整作业详情</span>
                    </div>
                </div>
                 <div class="mt-6 text-[10px] text-primary/60 font-medium tracking-[0.2em] transform scale-90 uppercase">—— 右键保存后分享 ——</div>
            </div>
        `;

        // Combine
        container.innerHTML = headerHtml + bodyHtml + footerHtml;

        // --- 4. Logic: Height Limit ---
        await this.wait(50); // layout calc
        const MAX_HEIGHT = 1600; // ~2x mobile height
        const contentBody = container.querySelector('#share-content-body');
        const scanText = container.querySelector('#share-scan-text');

        if (container.scrollHeight > MAX_HEIGHT) {
            const headerFooterHeight = 400; // Approx
            contentBody.style.maxHeight = (MAX_HEIGHT - headerFooterHeight) + 'px';
            contentBody.style.overflow = 'hidden';
            contentBody.style.position = 'relative';

            // Fade mask
            const mask = document.createElement('div');
            mask.className = 'absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none';
            contentBody.appendChild(mask);

            scanText.classList.remove('hidden');
        }

        // --- 5. Generate QR ---
        new QRCode(container.querySelector("#share-qrcode"), {
            text: window.location.href,
            width: 70,
            height: 70,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        });
    }

    showInModal(imgData) {
        const modal = document.getElementById(this.modalId);
        const container = document.getElementById('shareImageContainer');

        // Clear previous
        container.innerHTML = '';

        const img = new Image();
        img.src = imgData;
        img.className = "w-full h-auto rounded shadow-sm object-contain";
        img.style.maxHeight = "80vh";

        container.appendChild(img);

        // Show Modal
        modal.classList.remove('hidden');
        const content = modal.querySelector('.transform');
        // Trigger reflow for animation
        void modal.offsetWidth;
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }

    showLoading() {
        // Optional: Show a spinner
        const btn = document.querySelector('button[onclick*="generate"]');
        if (btn) {
            this._originalBtnText = btn.innerHTML;
            btn.innerHTML = '<span class="material-icons-round animate-spin text-lg">sync</span> 生成中...';
            btn.disabled = true;
        }
    }

    hideLoading() {
        const btn = document.querySelector('button[onclick*="generate"]');
        if (btn && this._originalBtnText) {
            btn.innerHTML = this._originalBtnText;
            btn.disabled = false;
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global instance
window.ShareGenerator = ShareGenerator;
