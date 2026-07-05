document.addEventListener('DOMContentLoaded', () => {

    // --- SHARED STATE & CONFIG ---
    let currentModernValue = 50; // A value from 0-100 (0=bottom, 100=top).
    const traditionalPixelSize = 12; // Size of pixels for the large symbol
    const animationSpeed = 1;

    const shapes = {
        // O-N-U-R
        'O': [{x:1, y:0}, {x:2, y:0}, {x:0, y:1}, {x:3, y:1}, {x:0, y:2}, {x:3, y:2}, {x:0, y:3}, {x:3, y:3}, {x:1, y:4}, {x:2, y:4}],
        'N': [{x:0, y:0}, {x:0, y:1}, {x:0, y:2}, {x:0, y:3}, {x:0, y:4}, {x:1, y:1}, {x:2, y:2}, {x:3, y:0}, {x:3, y:1}, {x:3, y:2}, {x:3, y:3}, {x:3, y:4}],
        'U': [{x:0, y:0}, {x:0, y:1}, {x:0, y:2}, {x:0, y:3}, {x:1, y:4}, {x:2, y:4}, {x:3, y:0}, {x:3, y:1}, {x:3, y:2}, {x:3, y:3}],
        'R': [{x:0, y:0}, {x:0, y:1}, {x:0, y:2}, {x:0, y:3}, {x:0, y:4}, {x:1, y:0}, {x:2, y:0}, {x:3, y:1}, {x:1, y:2}, {x:2, y:2}, {x:2, y:3}, {x:3, y:4}]
    };

    // --- CANVAS SETUP ---
    const seismoCanvas = document.getElementById('seismograph-canvas');
    const seismoCtx = seismoCanvas ? seismoCanvas.getContext('2d') : null;
    const rugCanvas = document.getElementById('rug-canvas');
    const rugCtx = rugCanvas ? rugCanvas.getContext('2d') : null;

    if (!seismoCtx || !rugCtx) return; // Exit if canvases aren't found

    // --- MODERN SYSTEM (LEFT) VARIABLES ---
    const seismoW = seismoCanvas.width;
    const seismoH = seismoCanvas.height;
    let lineX = 0;
    let lineY = seismoH / 2;
    const linePoints = [];

    // --- TRADITIONAL SYSTEM (RIGHT) VARIABLES ---
    const rugW = rugCanvas.width;
    const rugH = rugCanvas.height;
    const traditionalMotifs = [];
    let motifSpawnCounter = 100; // Start ready to spawn
    const motifSpawnInterval = 100; // Spawn a new motif every X frames

    // --- HELPER FUNCTIONS ---
    function drawPixelMotif(ctx, x, y, type, color, pixelSize) {
        const shapeCoords = shapes[type];
        if (!shapeCoords) return;
        ctx.fillStyle = color;
        for (const coord of shapeCoords) {
            ctx.fillRect(x + coord.x * pixelSize, y + coord.y * pixelSize, pixelSize, pixelSize);
        }
    }

    function drawModernSystemGuides() {
        seismoCtx.strokeStyle = 'rgba(74, 107, 108, 0.2)';
        seismoCtx.fillStyle = 'rgba(74, 107, 108, 0.5)';
        seismoCtx.font = '16px "Plus Jakarta Sans"';
        seismoCtx.lineWidth = 1;
        seismoCtx.textAlign = 'left';

        const linePositions = [seismoH * 0.35, seismoH * 0.5, seismoH * 0.65];
        const labels = [
            { text: 'O', y: (seismoH * 0.2 + seismoH * 0.35) / 2 },
            { text: 'N', y: (seismoH * 0.35 + seismoH * 0.5) / 2 },
            { text: 'U', y: (seismoH * 0.5 + seismoH * 0.65) / 2 },
            { text: 'R', y: (seismoH * 0.65 + seismoH * 0.8) / 2 }
        ];

        seismoCtx.beginPath();
        linePositions.forEach(y => {
            seismoCtx.moveTo(0, y);
            seismoCtx.lineTo(seismoW, y);
        });
        seismoCtx.stroke();

        labels.forEach(label => {
            seismoCtx.fillText(label.text, 10, label.y + 6);
        });
    }

    // --- MAIN ANIMATION LOOP ---
    function animate() {
        // 1. UPDATE AND DRAW MODERN SYSTEM (LEFT)
        const newY = lineY + (Math.random() - 0.5) * 15;
        lineY = Math.max(seismoH * 0.2, Math.min(seismoH * 0.8, newY));
        linePoints.push({ x: lineX, y: lineY });
        
        seismoCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim();
        seismoCtx.fillRect(0, 0, seismoW, seismoH);
        drawModernSystemGuides();

        seismoCtx.strokeStyle = '#b84a39';
        seismoCtx.lineWidth = 2;
        if (linePoints.length > 1) {
            seismoCtx.beginPath();
            seismoCtx.moveTo(linePoints[0].x, linePoints[0].y);
            for (let i = 1; i < linePoints.length; i++) {
                seismoCtx.lineTo(linePoints[i].x, linePoints[i].y);
            }
            seismoCtx.stroke();
        }

        for (let i = 0; i < linePoints.length; i++) {
            linePoints[i].x -= animationSpeed;
        }
        if (linePoints.length > 0 && linePoints[0].x < -10) {
            linePoints.shift();
        }
        if (lineX < seismoW + 10) {
            lineX += animationSpeed;
        }

        // 2. UPDATE AND DRAW TRADITIONAL SYSTEM (RIGHT)
        rugCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        rugCtx.fillRect(0, 0, rugW, rugH);

        motifSpawnCounter++;
        if (motifSpawnCounter >= motifSpawnInterval) {
            motifSpawnCounter = 0;
            currentModernValue = ((seismoH * 0.8 - lineY) / (seismoH * 0.6)) * 100;
            let newSymbolType;
            if (currentModernValue < 25) { newSymbolType = 'R'; }
            else if (currentModernValue < 50) { newSymbolType = 'U'; }
            else if (currentModernValue < 75) { newSymbolType = 'N'; }
            else { newSymbolType = 'O'; }
            traditionalMotifs.push({ x: rugW + 80, type: newSymbolType });
        }

        for (let i = traditionalMotifs.length - 1; i >= 0; i--) {
            const motif = traditionalMotifs[i];
            motif.x -= animationSpeed;

            const shapeWidth = 4 * traditionalPixelSize;
            const shapeHeight = 5 * traditionalPixelSize;
            rugCtx.save();
            rugCtx.translate(motif.x, rugH / 2);
            rugCtx.rotate(Math.PI / 2);
            drawPixelMotif(rugCtx, -shapeWidth / 2, -shapeHeight / 2, motif.type, getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim(), traditionalPixelSize);
            rugCtx.restore();

            if (motif.x < -80) {
                traditionalMotifs.splice(i, 1);
            }
        }

        // 3. REQUEST NEXT FRAME
        requestAnimationFrame(animate);
    }

    // --- INITIALIZATION ---
    animate();
});