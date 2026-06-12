var API_URL = (function () {
    var hostname = window.location.hostname;
    var isLocal =
        hostname === "localhost" ||
        hostname === "127.0.0.1";

    if (isLocal) {
        return "http://localhost:3000";
    }

    var meta = document.querySelector('meta[name="api-url"]');

    if (meta && meta.content) {
        return meta.content.replace(/\/$/, "");
    }

    return "/api";
})();
