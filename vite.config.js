import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Ensures paths work in subfolders like GitHub Pages
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
});
