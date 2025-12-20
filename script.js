document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab Switching Logic
    const tabs = document.querySelectorAll('.info-tab');
    const contentArea = document.getElementById('info-content');

    // Initialize styling for the default active tab
    const initialActiveTab = document.querySelector('.info-tab.active');
    if (initialActiveTab && contentArea) {
        const target = initialActiveTab.getAttribute('data-tab');
        contentArea.classList.add(`style-${target}`);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            // Toggle active state on tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Toggle active state on content panes
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            const pane = document.getElementById(`pane-${target}`);
            if (pane) pane.classList.add('active');

            // Update content area border/bg style
            if (contentArea) {
                // Remove all style-* classes
                contentArea.classList.forEach(cls => {
                    if (cls.startsWith('style-')) contentArea.classList.remove(cls);
                });
                contentArea.classList.add(`style-${target}`);
            }
        });
    });

    // 2. NPS Star Rating
    const stars = document.querySelectorAll('.star-rating .iconfont');
    const ratingLabel = document.querySelector('.rating-label');
    
    stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.getAttribute('data-val'));
            highlightStars(val);
        });
        
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-val'));
            highlightStars(val);
            if(ratingLabel) ratingLabel.textContent = `已打分：${val} 分`;
            // Save selection (mock)
            star.parentElement.setAttribute('data-selected', val);
        });
    });

    document.querySelector('.star-rating').addEventListener('mouseleave', () => {
        const parent = document.querySelector('.star-rating');
        const selected = parent.getAttribute('data-selected');
        if (selected) {
            highlightStars(parseInt(selected));
        } else {
            highlightStars(0);
        }
    });

    function highlightStars(count) {
        stars.forEach(s => {
            const v = parseInt(s.getAttribute('data-val'));
            if (v <= count) s.classList.add('active');
            else s.classList.remove('active');
        });
    }

    // 3. Simple Markdown Input
    // Logic moved to markdown-renderer.js


    // 4. Reveal App
    setTimeout(() => {
        const app = document.getElementById('app');
        if (app) app.classList.add('loaded');
    }, 100);
});