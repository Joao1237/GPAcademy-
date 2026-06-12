jest.mock('./backend/config/db', () => {
    const poolMock = {
        query: jest.fn(),
        getConnection: jest.fn(callback => {
            if (callback) {
                callback(null, { release: jest.fn() });
            }
        })
    };

    return poolMock;
});
