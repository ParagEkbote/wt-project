import { SpeedTest } from "./speedtest.js";
import { UI } from "./ui.js";

export const Runner = {
    async run() {
        UI.setButton(true);
        UI.reset();

        try {
            UI.setStatus("Testing latency...");
            UI.setProgress(10);
            const { ping, jitter } = await SpeedTest.testPing();
            UI.setMetric("ping", ping.toFixed(0) + " ms");
            UI.setMetric("jitter", jitter.toFixed(1) + " ms");

            UI.setStatus("Testing download speed...");
            UI.setProgress(40);
            const down = await SpeedTest.testDownload();
            UI.setMetric("download", down.toFixed(2) + " Mbps");
            UI.setSpeed(down);

            UI.setStatus("Testing upload speed...");
            UI.setProgress(70);
            const up = await SpeedTest.testUpload();
            UI.setMetric("upload", up > 0 ? `${up.toFixed(2)} Mbps` : "N/A");

            UI.setStatus("Test complete!");
            UI.setProgress(100);
        } catch (e) {
            UI.setStatus("Test failed. Try again.");
            console.error(e);
        }

        UI.setButton(false);
    }
};
