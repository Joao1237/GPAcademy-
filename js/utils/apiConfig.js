function resolverApiUrl(hostname, metaContent) {
    const isLocal =
        hostname === 'localhost' ||
        hostname === '127.0.0.1';

    if (isLocal) {
        return 'http://localhost:3000';
    }

    if (metaContent) {
        return metaContent.replace(/\/$/, '');
    }

    return '/api';
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        resolverApiUrl
    };
}
