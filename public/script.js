function renderFiles(data) {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'file-item header-row';
    headerRow.innerHTML = `
        <div>Name</div>
        <div style="text-align: right">Size</div>
        <div style="text-align: right">Type</div>
        <div style="text-align: right">Actions</div>
    `;
    fileList.appendChild(headerRow);

    // File rows
    data.files.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-item';
        
        const fileType = file.isDirectory ? 'Folder' : getFileExtension(file.name);
        const fileSize = file.isDirectory ? '--' : formatFileSize(file.size);
        
        fileDiv.innerHTML = `
            <div class="file-name" onclick="navigateToPath('${file.path}')">
                <img src="${getFileIcon(file)}" width="16" height="16">
                ${file.name}
            </div>
            <div class="file-size">${fileSize}</div>
            <div class="file-type">${fileType}</div>
            <div class="action-buttons">
                <button onclick="downloadFile('${file.path}')" class="download-btn">
                    Download
                </button>
            </div>
        `;
        
        fileList.appendChild(fileDiv);
    });
}

function downloadFile(filePath) {
    const encodedPath = encodeURIComponent(filePath);
    fetch(`/api/download/${encodedPath}`)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filePath.split('/').pop();
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        });
}

// Helper functions
function getFileExtension(filename) {
    return filename.split('.').pop().toUpperCase() || 'File';
}

function formatFileSize(size) {
    if (!size || size === 'Access Denied') return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
        size /= 1024;
        index++;
    }
    return `${size.toFixed(1)} ${units[index]}`;
}

function getFileIcon(file) {
    return file.isDirectory ? 'folder-icon.png' : 'file-icon.png';
}