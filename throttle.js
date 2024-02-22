const stream = require('stream');
const fs = require('fs')
class ThrottleTransform extends stream.Transform {
    constructor(options) {
        super(options);
        this.rateLimit = options.rateLimit || 1024*1024; // 默认速率限制为1MB/s
        //this.startTime = Date.now();
        this.lastTime = Date.now();

        //this.transferredBytes = 0;
        this.deltaBytes = 0;
    }
    _transform_v1(chunck,encoding,callback){
        // 计算已传输的字节数
        //this.transferredBytes += chunk.length;
        this.deltaBytes = chunk.length;
        // 计算传输速率
        const currentTime = Date.now();
        //const elapsedMilliseconds = currentTime - this.startTime;
        const deltaTime =  currentTime - this.lastTime; // ms

        this.lastTime =currentTime;
        //const currentRate = this.transferredBytes / (elapsedMilliseconds / 1000);
        const currentRate = (this.deltaBytes / deltaTime ) * 1000; // per second
        console.log({currentRate})

        // 如果速率超过限制，进行延迟
        if (currentRate > this.rateLimit) {
            //const delay = Math.ceil(this.transferredBytes / this.rateLimit) - elapsedMilliseconds;
            const delay = Math.ceil( this.deltaBytes  / (this.rateLimit / 1000)) - deltaTime;//ms

            console.log({delay})
            setTimeout(() => {
                this.push(chunk);
                callback();
            }, delay);
        } else {
            this.push(chunk);
            callback();
        }
    }
    _transform_v2(chunk, encoding, callback){
        let delay = chunk.length/(this.rateLimit/1000)
        console.log({delay})
        setTimeout(() => {
            this.push(chunk);
            callback();
        }, delay);
    }
    _transform(chunk, encoding, callback)
    {
        //this._transform_v1(chunk, encoding, callback)
        this._transform_v2(chunk, encoding, callback)
    }
}
let throttle = new ThrottleTransform({rateLimit:32*1024})//1KB/s
const readStream = fs.createReadStream('files/file');
readStream.pipe(throttle).pipe(process.stdout)
