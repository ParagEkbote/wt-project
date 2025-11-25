// ---------------------------------------------------------
// CONFIG.JS — Global configuration for speedtest.js
// ---------------------------------------------------------
// This file MUST export a CONFIG object because speedtest.js
// imports it like:  import { CONFIG } from "./config.js"
// ---------------------------------------------------------

export const CONFIG = {
    // -------------------------
    // PING SETTINGS
    // -------------------------

    // Number of ping tests to run
    pingTests: 5,

    // HEAD request target URL for ping measurement
    // This should be a very fast endpoint. Cloudflare works well.
    pingTestUrl: "https://cloudflare.com/cdn-cgi/trace",


    // -------------------------
    // DOWNLOAD SETTINGS
    // -------------------------

    // The URL of a test file used for download speed.
    // Place `testfile.bin` in your repo root or replace with a CDN file.
    downloadTestUrl: "https://speed.cloudflare.com/__down?bytes=20000000",


    // -------------------------
    // UPLOAD SETTINGS
    // -------------------------

    // Size of upload test payload
    uploadTestSizeKB: 1024,   // 1 MB

    // Endpoint(s) that accept POST uploads.
    // First working URL is used; others are fallback.
    //
    // If you don’t have your own server yet, httpbin works:
    uploadTestUrls: [
        "https://holy-truth-870a.paragekbote23.workers.dev/"
    ],

    // Max retries before switching to next upload URL
    maxUploadRetries: 3,

    // Delay between retries (ms)
    retryBackoffMs: 500
};
