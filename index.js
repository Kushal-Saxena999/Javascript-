const express = require("express");
const app = express();
const path = require('path');
const fs = require('fs');

const ROOT_PATH = process.platform === 'win32' ? 'C:\\' : '/';

app.use(express.static('public'));

app.get("/api/files/:dirPath?", function(req, res) {
    const dirPath = req.params.dirPath || ROOT_PATH;
    const absolutePath = path.resolve(dirPath);
    
    fs.readdir(absolutePath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory' });
        }

        const fileList = files.map(file => {
            try {
                const filePath = path.join(absolutePath, file.name);
                let size = null;
                if (!file.isDirectory()) {
                    try {
                        size = fs.statSync(filePath).size;
                    } catch (e) {
                        // Skip size if permission denied
                        size = 'Access Denied';
                    }
                }
                return {
                    name: file.name,
                    isDirectory: file.isDirectory(),
                    path: path.join(dirPath, file.name),
                    size: size
                };
            } catch (e) {
                return {
                    name: file.name,
                    isDirectory: file.isDirectory(),
                    path: path.join(dirPath, file.name),
                    size: 'Access Denied'
                };
            }
        });

        res.json({
            currentPath: dirPath,
            parentDir: path.dirname(dirPath),
            files: fileList
        });
    });
});

app.get("/api/file/:filePath(*)", function(req, res) {
    const filePath = req.params.filePath;
    
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read file' });
        }
        res.json({ data });
    });
});

app.listen(3000);
console.log("App is listening on port 3000");

