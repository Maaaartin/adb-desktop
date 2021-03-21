const fs = require('fs');

if(process.env.CI){
fs.copyFileSync('./docs/README.md', './release/README.md');
fs.copyFileSync('./docs/linux/install.sh', './release/linux-unpacked/install.sh');
}
