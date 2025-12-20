document.addEventListener('DOMContentLoaded', () => {
    // Character Count Logic
    const editors = document.querySelectorAll('.ql-editor');
    editors.forEach(editor => {
        // Find the counter element. 
        // Based on HTML structure: editor is in a relative div, counter is the next sibling or last child of that relative div.
        // Structure:
        // <div class="relative">
        //    <div class="... ql-editor" ...></div>
        //    <div class="absolute ...">5/20000</div>
        // </div>
        const wrapper = editor.parentElement;
        if (wrapper) {
            const counter = wrapper.querySelector('.absolute.bottom-2.right-4');
            
            if (counter) {
                const updateCount = () => {
                    const text = editor.innerText || editor.textContent || '';
                    // Use text length, treating newlines as 1 char usually, but innerText might be better for visual count
                    const len = text.replace(/\n$/, '').length; 
                    counter.textContent = `${len}/20000`;
                };
                
                editor.addEventListener('input', updateCount);
                // Initialize
                updateCount();
            }
        }
    });

    // Dark Mode Toggle Logic (if not inline)
    // The button has onclick="document.documentElement.classList.toggle('dark')" in HTML, so no JS needed here.
    
    // Auto-save simulation (optional, based on footer text "Content saved at...")
    const saveStatus = document.querySelector('.material-icons-round.text-sm + span'); // "Content saved..." text
    if (saveStatus) {
        setInterval(() => {
            const now = new Date();
            const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            saveStatus.textContent = `内容已于 ${time} 分自动保存`;
        }, 60000); // Update every minute
    }
});
