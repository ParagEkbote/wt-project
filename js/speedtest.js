import { CONFIG } from "./config.js";

export const SpeedTest = {

    /* --------------------------------------------------------
     * PING TEST
     * -------------------------------------------------------- */
    async testPing() {
        const results = [];

        for (let i = 0; i < CONFIG.pingTests; i++) {
            const start = performance.now();
            try {
                await fetch(CONFIG.pingTestUrl + "?t=" + Date.now(), {
                    method: "HEAD",
                    cache: "no-cache"
                });
                results.push(performance.now() - start);
            } catch (err) {
                console.warn("Ping failed:", err);
                results.push(0);
            }
        }

        const ping = results.reduce((a, b) => a + b, 0) / results.length;
        const jitter = this.calculateJitter(results);

        return { ping, jitter };
    },

    calculateJitter(pings) {
        if (pings.length < 2) return 0;

        let diff = 0;
        for (let i = 1; i < pings.length; i++) {
            diff += Math.abs(pings[i] - pings[i - 1]);
        }

        return diff / (pings.length - 1);
    },


    /* --------------------------------------------------------
     * DOWNLOAD TEST
     * -------------------------------------------------------- */
    async testDownload() {
        const url = CONFIG.downloadTestUrl + "?t=" + Date.now();
        const start = performance.now();

        try {
            const response = await fetch(url, { cache: "no-cache" });
            const blob = await response.blob();

            const seconds = (performance.now() - start) / 1000;
            const bits = blob.size * 8;
            const mbps = bits / seconds / (1024 * 1024);

            return mbps;
        } catch (err) {
            console.error("Download test failed:", err);
            return 0;
        }
    },


    /* --------------------------------------------------------
     * UPLOAD TEST
     * -------------------------------------------------------- */
    async testUpload() {
        const uploadSizeBytes = CONFIG.uploadTestSizeKB * 1024;
        const data = this.generatePayload(uploadSizeBytes);

        for (const url of CONFIG.uploadTestUrls) {
            console.log(`Trying upload URL: ${url}`);

            for (let attempt = 1; attempt <= CONFIG.maxUploadRetries; attempt++) {
                console.log(`Upload attempt ${attempt}/${CONFIG.maxUploadRetries} → ${url}`);

                try {
                    const speed = await this.performUpload(url, data, uploadSizeBytes);

                    // SUCCESS → return measured speed
                    return speed;

                } catch (err) {
                    console.warn(`Upload attempt ${attempt} failed:`, err.message);

                    if (attempt < CONFIG.maxUploadRetries) {
                        await new Promise(res => setTimeout(res, CONFIG.retryBackoffMs));
                    }
                }
            }

            console.warn(`All retries failed for: ${url}, trying next URL...`);
        }

        console.error("All upload URLs failed.");
        return 0;
    },


    /* Helper: performs one upload attempt */
    performUpload(url, data, uploadSizeBytes) {
        return new Promise((resolve, reject) => {
            const start = performance.now();
            const xhr = new XMLHttpRequest();

            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const end = performance.now();
                    const sec = (end - start) / 1000;
                    const bits = uploadSizeBytes * 8;
                    const mbps = bits / sec / (1024 * 1024);
                    resolve(mbps);
                } else {
                    reject(new Error(`HTTP ${xhr.status}`));
                }
            });

            xhr.addEventListener("error", () => reject(new Error("Network error")));
            xhr.addEventListener("timeout", () => reject(new Error("Request timed out")));

            xhr.open("POST", url);
            xhr.timeout = 10000;
            xhr.send(data);
        });
    },


    /* --------------------------------------------------------
     * PAYLOAD GENERATOR
     * -------------------------------------------------------- */
    generatePayload(size) {
        // Generate binary data (same as speedtest.net style)
        return new Blob([new Uint8Array(size)]);
    }
};
