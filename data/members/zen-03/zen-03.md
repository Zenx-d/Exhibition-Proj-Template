# 🔥 THE OMNIPOTENT ENGINE – ULTIMATE SHOWCASE

Welcome to the **Zen Engine Absolute**. This renderer handles everything: raw HTML, inline JavaScript, and localized "Zen Widgets".

---

## 🕹️ SECTION 1: RAW HTML & INLINE JS (YOUR EXAMPLE)

### Interactive Button
<button onclick="alert('IT WORKS! 🎉')" style="background: #4f46e5; color: white; padding: 15px 30px; border-radius: 50px; border: none; cursor: pointer; font-weight: bold; box-shadow: 0 10px 20px rgba(79,70,229,0.3);">
  CLICK ME – I WORK!
</button>

### Working Counter
<div style="text-align: center; background: #1e293b; padding: 30px; border-radius: 24px; margin: 20px 0;">
  <div id="counter" style="font-size: 80px; font-weight: 900; color: #4f46e5; font-family: monospace;">0</div>
  <button onclick="window.c = (window.c || 0) + 1; document.getElementById('counter').innerText = window.c;" style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 12px; border: none; font-weight: bold; margin: 5px; cursor: pointer;">+1 Increase</button>
  <button onclick="window.c = 0; document.getElementById('counter').innerText = '0';" style="background: #ef4444; color: white; padding: 12px 24px; border-radius: 12px; border: none; font-weight: bold; margin: 5px; cursor: pointer;">Reset</button>
</div>

### Simplified Snake (Inline)
<canvas id="simpleSnake" width="400" height="400" style="border: 4px solid #4f46e5; border-radius: 20px; background: #0f172a; display: block; margin: 20px auto;"></canvas>
<script>
  (function() {
    let snake = [{x: 200, y: 200}, {x: 190, y: 200}, {x: 180, y: 200}];
    let dir = 'RIGHT';
    let food = {x: 300, y: 200};
    let score = 0;
    const canvas = document.getElementById('simpleSnake');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && dir !== 'DOWN') dir = 'UP';
        else if (e.key === 'ArrowDown' && dir !== 'UP') dir = 'DOWN';
        else if (e.key === 'ArrowLeft' && dir !== 'RIGHT') dir = 'LEFT';
        else if (e.key === 'ArrowRight' && dir !== 'LEFT') dir = 'RIGHT';
      });
      setInterval(() => {
        let head = {...snake[0]};
        if (dir === 'RIGHT') head.x += 10;
        if (dir === 'LEFT') head.x -= 10;
        if (dir === 'UP') head.y -= 10;
        if (dir === 'DOWN') head.y += 10;
        if (head.x === food.x && head.y === food.y) {
          score++;
          food = {x: Math.floor(Math.random() * 40) * 10, y: Math.floor(Math.random() * 40) * 10};
        } else {
          snake.pop();
        }
        snake.unshift(head);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#4f46e5';
        snake.forEach(s => ctx.fillRect(s.x, s.y, 10, 10));
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(food.x, food.y, 10, 10);
        ctx.fillStyle = 'white';
        ctx.font = '20px monospace';
        ctx.fillText(`Score: ${score}`, 10, 30);
      }, 100);
    }
  })();
</script>

---

## 🧩 SECTION 2: ZEN WIDGETS (LOCALIZED POWER)

### High-End Snake (Widget)
<div data-zen-widget="games/snake" data-height="450"></div>

### 3D Visualization (Widget)
<div data-zen-widget="3d/cube" data-height="500"></div>

---

**🚀 EVERYTHING IS WORKING. THE ENGINE IS UNSTOPPABLE. 🚀**
