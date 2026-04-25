# 🚀 Dynamic Zen Exhibition

This project demonstrates the **Dynamic JavaScript Support** now integrated into our Markdown engine. You can now embed interactive logic directly within your content.

## 🎯 Interactive Counter Example

Below is a live counter built using raw HTML and dynamic JavaScript directly inside this markdown file:

<div class="p-10 bg-indigo-600 rounded-[2rem] text-white text-center shadow-2xl shadow-indigo-500/30 my-12">
  <h3 class="text-3xl font-black mb-4 uppercase tracking-tighter">Dynamic Counter</h3>
  <div id="counter-value" class="text-7xl font-black mb-6">0</div>
  <div class="flex gap-4 justify-center">
    <button id="increment-btn" class="px-8 py-3 bg-white text-indigo-600 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform">
      Increment
    </button>
    <button id="reset-btn" class="px-8 py-3 bg-indigo-500 text-white border-2 border-white/20 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform">
      Reset
    </button>
  </div>
</div>

<script>
  (function() {
    let count = 0;
    const valueDisplay = document.getElementById('counter-value');
    const incBtn = document.getElementById('increment-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (incBtn && valueDisplay) {
      incBtn.onclick = () => {
        count++;
        valueDisplay.textContent = count;
        console.log('Markdown JS: Count is now', count);
      };
    }

    if (resetBtn && valueDisplay) {
      resetBtn.onclick = () => {
        count = 0;
        valueDisplay.textContent = count;
      };
    }
  })();
</script>

---

## 🛠️ Technical Details

The Markdown engine now performs the following steps:
1.  **Parse:** Converts Markdown to HTML using `react-markdown`.
2.  **Render:** Injects raw HTML via `rehype-raw`.
3.  **Execute:** A `useEffect` hook scans the rendered content for `<script>` tags, re-instantiates them, and triggers their execution in the client-side DOM.

\`\`\`javascript
// You can also still have beautiful code blocks
console.log("Ready for action!");
\`\`\`
