export const UI = {
    el: {
        speed: document.getElementById("speedValue"),
        download: document.getElementById("downloadSpeed"),
        upload: document.getElementById("uploadSpeed"),
        ping: document.getElementById("pingValue"),
        jitter: document.getElementById("jitterValue"),
        status: document.getElementById("status"),
        progress: document.getElementById("progressBar"),
        button: document.getElementById("startBtn"),
    },

    setSpeed(v) { this.el.speed.textContent = v.toFixed(2); },
    setMetric(id, v) { this.el[id].textContent = v; },
    setStatus(msg) { this.el.status.textContent = msg; },
    setProgress(p) { this.el.progress.style.width = p + "%"; },

    setButton(disabled) {
        this.el.button.disabled = disabled;
        this.el.button.textContent = disabled ? "Testing..." : "Start Test";
    },

    reset() {
        this.setSpeed(0);
        this.setMetric("download", "-");
        this.setMetric("upload", "-");
        this.setMetric("ping", "-");
        this.setMetric("jitter", "-");
        this.setProgress(0);
    }
};
