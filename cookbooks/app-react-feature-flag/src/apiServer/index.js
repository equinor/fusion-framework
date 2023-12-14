import express from 'express';

const server = express();
const port = 12321;

server.get('/api/flags', (_req, res) => {
    res.appendHeader('Access-Control-Allow-Origin', '*');
    res.send([
        {
            key: 'portal-api-1',
            title: 'Portal Api 1',
            enabled: false,
            readonly: true,
        },
        {
            key: 'portal-api-2',
            title: 'Portal Api 2',
            enabled: true,
            readonly: true,
        },
    ]);
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

export default server;
