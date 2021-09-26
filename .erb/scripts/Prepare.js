const { exec } = require('child_process');
const isCI = process.env.NODE_ENV === 'CI';

if (!isCI) {
  if (process.platform === 'win32') {
    console.info('Skipping hook installation');
    process.exit(0);
  } else {
    exec('chmod ug+x .husky/* && chmod ug+x .git/hooks/*', (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      } else {
        console.info('Hooks installed');
        process.exit(0);
      }
    });
  }
} else {
  console.info('Is CI, skipping hook installation');
  process.exit(0);
}
