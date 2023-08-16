const path = require('path');
const fs = require('fs');

/** @param file string */
const processLogFile = ({ logPath, projectPath }) => {
    const fileContent = fs.readFileSync(logPath, 'utf-8');
    if (!fileContent.includes('> tsc -b')) {
        return;
    }
    return fileContent.replace(/(.*)([(]\d+,\d+[)])/g, (_, localPath, carrot) => {
        return `${path.join(projectPath, localPath)}${carrot}`;
    });
}

function findLogFiles(startPath, filter) {
    if (!fs.existsSync(startPath)) {
        return [];
    }

    return fs.readdirSync(startPath).reduce((found, file) => {
        const logPath = path.join(startPath, file);
        const stat = fs.lstatSync(logPath);
        if (stat.isDirectory()) {
            return found.concat(findLogFiles(logPath, filter));
        }
        if (logPath.endsWith(filter)) {
            const projectPath = logPath.replace(filter, '');
            return found.concat({ logPath, projectPath });
        }
        return found;
    }, []);
};

findLogFiles('./', '.turbo/turbo-build.log').forEach((entry) => {
    console.log(processLogFile(entry));
});