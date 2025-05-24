#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('请提供文件名参数');
  process.exit(1);
}
const fileName = args[0];
const filePath = path.join(__dirname, fileName);

const mode = args.length >= 2 ?args[1]:"download"

function isImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
}
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
// 检查文件是否存在
if (!fs.existsSync(filePath)) {
  console.error(`文件 ${fileName} 不存在`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('服务器内部错误');
      return;
    }

    if (mode === 'image') {
      if (!isImage(filePath)) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('不是图片文件');
        return;
      }

      const mimeType = getMimeType(filePath);
      const base64Image = data.toString('base64');

      const html = `
  <html>
    <head>
      <meta charset="UTF-8">
      <title>图片预览</title>
      <style>
        body {
          font-family: sans-serif;
          margin: 20px;
          background-color: #f9f9f9;
        }
        img {
          max-width: 100%;
          height: auto;
          border: 1px solid #ccc;
          box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
        }
        button {
          margin-top: 20px;
          padding: 10px 20px;
          font-size: 16px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>
      <h1>${fileName}</h1>
      <img id="preview" src="data:${mimeType};base64,${base64Image}" alt="${fileName}" />
      <br/>
      <button onclick="downloadImage()">下载图片</button>

      <script>
        function downloadImage() {
          const img = document.getElementById('preview');
          const a = document.createElement('a');
          a.href = img.src;
          a.download = '${fileName}';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      </script>
    </body>
  </html>
`;



      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
    } else if(mode ==="download"){
      // 默认行为：下载文件
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.end(data);
    }
    console.log("connected")
  });
});

const port = 60007;
server.listen(port, () => {
  console.log(`服务器正在端口 ${port} 上运行`);
});

