import { CONFIG } from "./config.js";

export const SpeedTest = {
    async testPing() {
        const results = [];
        for (let i = 0; i < CONFIG.pingTests; i++) {
            const start = performance.now();
            try {
                await fetch(CONFIG.pingTestUrl + '?t=' + Date.now(), {
                    method: 'HEAD', cache: 'no-cache'
                });
                results.push(performance.now() - start);
            } catch {
                results.push(0);
            }
        }
        const jitter = this.calculateJitter(results);
        return {
            ping: results.reduce((a, b) => a + b, 0) / results.length,
            jitter
        };
    },

    calculateJitter(pings) {
        if (pings.length < 2) return 0;
        let diff = 0;
        for (let i = 1; i < pings.length; i++)
            diff += Math.abs(pings[i] - pings[i - 1]);
        return diff / (pings.length - 1);
    },

    async testDownload() {
        const url = CONFIG.downloadTestUrl + '?t=' + Date.now();
        const start = performance.now();
        try {
            const response = await fetch(url, { cache: 'no-cache' });
            const blob = await response.blob();
            const sec = (performance.now() - start) / 1000;
            return (blob.size * 8 / sec) / (1024 * 1024);
        } catch {
            return 0;
        }
    },

    async testUpload() {
        const uploadSizeBytes = CONFIG.uploadTestSizeKB * 1024;
        const data = this.generateTestData(uploadSizeBytes);

        // Iterate through URLs
        for (const url of CONFIG.uploadTestUrls) {
            console.log(`Trying upload URL: ${url}`);

            // Retry loop for each URL
            for (let attempt = 1; attempt <= CONFIG.maxUploadRetries; attempt++) {
                try {
                    console.log(`Attempt ${attempt} to ${url}`);

                    const speed = await new Promise((resolve, reject) => {
                        const start = performance.now();
                        const xhr = new XMLHttpRequest();

                        xhr.addEventListener('load', () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                const end = performance.now();
                                const durationSeconds = (end - start) / 1000;
                                const bitsUploaded = uploadSizeBytes * 8;
                                const speedMbps =
                                    (bitsUploaded / durationSeconds) / (1024 * 1024);
                                resolve(speedMbps);
                            } else {
                                reject(new Error(`HTTP ${xhr.status}`));
                            }
                        });

                        xhr.addEventListener('error', () => reject(new Error("Network error")));
                        xhr.addEventListener('timeout', () => reject(new Error("Timeout")));

                        xhr.open("POST", url);
                        xhr.timeout = 10000;
                        xhr.send(data);
                    });

                    // SUCCESS → return speed
                    return speed;

                } catch (err) {
                    console.warn(`Upload attempt ${attempt} to ${url} failed: ${err.message}`);

                    // If more retries available → wait and retry
                    if (attempt < CONFIG.maxUploadRetries) {
                        await new Promise(res => setTimeout(res, CONFIG.retryBackoffMs));
                    }
                }
            }

            console.warn(`All retries failed for ${url}, trying next URL...`);
        }

        console.error("All upload URLs failed.");
        return 0; // UI will show N/A
    },


    generatePayload(size) {
        return new Blob([new Uint8Array(size)]);
    }
};
