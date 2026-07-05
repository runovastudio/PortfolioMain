document.addEventListener('DOMContentLoaded', () => {

    // --- d20 Roll Logic ---
    const rollBtn = document.getElementById('roll-d20');
    const resultDisplay = document.getElementById('d20-result');

    if (rollBtn && resultDisplay) {
        rollBtn.addEventListener('click', () => {
            const result = Math.floor(Math.random() * 20) + 1;
            resultDisplay.textContent = result;
        });
    }

    // --- Perlin Noise Logic ---
    const perlinCanvas = document.getElementById('perlin-canvas');
    const seedInput = document.getElementById('perlin-seed');
    const generateBtn = document.getElementById('generate-perlin');

    if (perlinCanvas && seedInput && generateBtn) {
        let p = []; // Permutation table

        function generatePermutationTable(seed) {
            // Simple seeded random number generator (LCG)
            let seedValue = 0;
            for (let i = 0; i < seed.length; i++) {
                seedValue = (seedValue + seed.charCodeAt(i)) % 256;
            }
            const random = () => {
                seedValue = (seedValue * 9301 + 49297) % 233280;
                return seedValue / 233280;
            };

            let permutation = Array.from({ length: 256 }, (_, i) => i);
            for (let i = permutation.length - 1; i > 0; i--) {
                const j = Math.floor(random() * (i + 1));
                [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
            }
            p = [...permutation, ...permutation]; // Double the table to avoid overflow
        }

        function fade(t) {
            return t * t * t * (t * (t * 6 - 15) + 10);
        }

        function lerp(t, a, b) {
            return a + t * (b - a);
        }

        function grad(hash, x, y) {
            const h = hash & 7; // Take the first 3 bits
            const u = h < 4 ? x : y;
            const v = h < 4 ? y : x;
            return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
        }

        function noise(x, y) {
            const X = Math.floor(x) & 255;
            const Y = Math.floor(y) & 255;
            x -= Math.floor(x);
            y -= Math.floor(y);

            const u = fade(x);
            const v = fade(y);

            const aa = p[p[X] + Y];
            const ab = p[p[X] + Y + 1];
            const ba = p[p[X + 1] + Y];
            const bb = p[p[X + 1] + Y + 1];

            return lerp(v,
                lerp(u, grad(aa, x, y), grad(ba, x - 1, y)),
                lerp(u, grad(ab, x, y - 1), grad(bb, x - 1, y - 1))
            );
        }

        function drawNoise() {
            generatePermutationTable(seedInput.value);
            const ctx = perlinCanvas.getContext('2d');
            const width = perlinCanvas.width;
            const height = perlinCanvas.height;
            const imageData = ctx.createImageData(width, height);
            const scale = 32; // How "zoomed in" the noise is

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const value = noise(x / scale, y / scale);
                    // Map noise value from [-1, 1] to [0, 255]
                    const color = (value + 1) * 127.5;
                    const index = (y * width + x) * 4;
                    imageData.data[index] = color;
                    imageData.data[index + 1] = color;
                    imageData.data[index + 2] = color;
                    imageData.data[index + 3] = 255; // Alpha
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }

        generateBtn.addEventListener('click', drawNoise);
        
        // Draw initial noise on page load
        drawNoise();
    }
});