const proxy = require('http-proxy-middleware');
const proxyUrl = 'https://120.26.89.217:19980';
const filter = (pathname, req) => {
    let filter_list = ["/static/media/uuid.png", "/static/media/logo.png", "/static/media/favicon.ico"]
    return filter_list.includes(pathname) && req.method === "GET";
}
module.exports = function (app) {
    app.use(
        proxy('/configserver', {
            target: proxyUrl,
            changeOrigin: true,
            secure: false
        })
    );
}