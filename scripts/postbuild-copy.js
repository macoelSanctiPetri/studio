const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, '.next', 'standalone');

const copies = [
  {
    from: path.join(projectRoot, 'public'),
    to: path.join(standaloneRoot, 'public'),
  },
  {
    from: path.join(projectRoot, '.next', 'static'),
    to: path.join(standaloneRoot, '.next', 'static'),
  },
];

for (const { from, to } of copies) {
  if (!fs.existsSync(from)) continue;
  fs.mkdirSync(to, { recursive: true });
  fs.cpSync(from, to, { recursive: true, force: true });
  console.log(`Copied ${from} -> ${to}`);
}

