const shell = require('shelljs');
const path = require('path');
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const askReleaseVersion = (releaseVersion) => {
    return new Promise((resolve, reject) => {
        rl.question(`Release version? [${releaseVersion}]: `, (version) => {
            releaseVersion = (version.length > 0) ? version : releaseVersion;
            resolve(releaseVersion);
        });
    });
}

const askNextVersion = (nextVersion) => {
    return new Promise((resolve, reject) => {
        rl.question(`Next version? [${nextVersion}]: `, (version) => {
            nextVersion = (version.length > 0) ? version : nextVersion;
            resolve(nextVersion);
        });
    });
}

exports.main = async () => {
    if (!shell.which('git')) {
        shell.echo('Sorry, this script requires git');
        shell.exit(1);
    }
    
    shell.exec('git checkout master');
    shell.exec('git pull');
    shell.exec('git checkout develop');
    shell.exec('git pull');

    var pjson = require(path.resolve(process.cwd(), 'package.json'));
    var currentVersion = pjson.version;
    var releaseVersion = currentVersion.replace('-SNAPSHOT', '');

    releaseVersion = await askReleaseVersion(releaseVersion);
    shell.echo(`Release Version will be ${releaseVersion}`);

    var nextVersion = releaseVersion.split('.');
    nextVersion[2] = parseInt(nextVersion[2])+1;
    nextVersion = nextVersion.join('.') + '-SNAPSHOT';

    nextVersion = await askNextVersion(nextVersion);
    shell.echo(`Next Version will be ${nextVersion}`);

    rl.close();

    shell.exec(`git checkout -b release/${releaseVersion}`);

    // shell.exec('npm run test');
    // shell.exec('npm run build');
    
    shell.exec('git checkout master');
    shell.exec(`git merge release/${releaseVersion}`);
    shell.exec(`npm version ${releaseVersion} -m "Set version to ${releaseVersion}"`);
    shell.exec('git checkout develop');
    shell.exec('git merge master');
    shell.exec(`npm --no-git-tag-version version ${nextVersion}`);
    shell.exec(`git add package*.json`);
    shell.exec(`git commit -m "Set version back to SNAPSHOT"`);
    shell.exec(`git branch -d release/${releaseVersion}`);

}