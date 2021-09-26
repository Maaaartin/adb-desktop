const {
    exec
} = require('child_process');
const {
    isCI
} = require('ci-info');
if (isCI) {
    console.info('CI - skipping hooks installation');
    process.exit(0);
} else {
    exec('npx husky install', (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        } else if (process.platform === 'win32') {
            console.info('win32 - skipping hooks installation');
            process.exit(0);
        } else {
            exec('chmod ug+x .husky/* && chmod ug+x .git/hooks/*', (err) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    console.info('Git hooks installed')
                    process.exit(0);
                }
            })
        }
    })

}