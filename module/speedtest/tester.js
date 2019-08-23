const http = require('http');
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+`-=[]{}|;':,./<>?";

class NetworkSpeedCheck {

    checkDownloadSpeed(baseUrl, fileSize) {
        let startTime;
        return new Promise((resolve, _) => {
            return http.get(baseUrl, response => {
                response.once('data', () => {
                    startTime = new Date().getTime();
                });

                response.once('end', () => {
                    const endTime = new Date().getTime();
                    const duration = (endTime - startTime) / 1000;
                    const bitsLoaded = fileSize * 8;
                    const bps = (bitsLoaded / duration).toFixed(2);
                    const kbps = (bps / 1024).toFixed(2);
                    const mbps = (kbps / 1024).toFixed(2);
                    resolve({ bps, kbps, mbps });
                });
            });
        }).catch(error => {
            throw new Error(error);
        });
    }

    checkUploadSpeed(options) {
        let startTime;
        const data = '{"data": "' + this.generateTestData(20) + '"}';
        return new Promise((resolve, _) => {
            var req = http.request(options, res => {
                res.setEncoding('utf8');
                res.on('data', () => {
                    startTime = new Date().getTime();
                });
                res.on('end', () => {
                    const endTime = new Date().getTime();
                    const duration = (endTime - startTime) / 1000;
                    const bitsLoaded = 20 * 8;
                    const bps = (bitsLoaded / duration).toFixed(2);
                    const kbps = (bps / 1024).toFixed(2);
                    const mbps = (kbps / 1024).toFixed(2);
                    resolve({ bps, kbps, mbps });
                });
            });
            req.write(data);
            req.end();
        }).catch(error => {
            throw new Error(error);
        });
    }

    generateTestData(sizeInKmb) {
        const iterations = sizeInKmb * 1024; //get byte count
        let result = '';
        for (var index = 0; index < iterations; index++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

const speedtest = new NetworkSpeedCheck();
module.exports = {
    upload: async () => {
        return await speedtest.checkUploadSpeed({
            hostname: 'google.com',
            port: 80,
            path: '/catchers/544b09b4599c1d0200000289',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    download: async () => {
        return await speedtest.checkDownloadSpeed("http://eu.httpbin.org/stream-bytes/50000000", 500000);
    }
}