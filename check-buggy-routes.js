const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matchBadRoute = content.match(/router\.(get|post|put|delete)\(\s*['"`][^'"`]*:[^/'"`]*:[^/'"`]*/);
      const matchDoubleSlash = content.match(/router\.(get|post|put|delete)\(\s*['"`]\/\/+/);
      const matchEmptyParam = content.match(/router\.(get|post|put|delete)\(\s*['"`]\/:(['"`])?/);
      const matchUnnamed = content.match(/router\.(get|post|put|delete)\(\s*['"`]\/:[^\/'":\)\s]*$/);

      if (matchBadRoute || matchDoubleSlash || matchEmptyParam || matchUnnamed) {
        console.log(`🚨 Possível erro em: ${fullPath}`);
        if (matchBadRoute) console.log(`  → Dois ":" seguidos: ${matchBadRoute[0]}`);
        if (matchDoubleSlash) console.log(`  → Rota com "//": ${matchDoubleSlash[0]}`);
        if (matchEmptyParam) console.log(`  → Parâmetro sem nome após "/:": ${matchEmptyParam[0]}`);
        if (matchUnnamed) console.log(`  → Parâmetro sem nome ou mal formatado: ${matchUnnamed[0]}`);
        console.log('---');
      }
    }
  }
}

console.log('🔍 Procurando rotas com erro de sintaxe...\n');
scanDir('./');
