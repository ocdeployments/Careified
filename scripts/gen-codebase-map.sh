#!/bin/bash
# CODEBASE MAP — AUTO-GENERATED. Do not hand-edit. Regenerate via this script.

# Load env
export $(grep DATABASE_URL .env.local | xargs)

cat > docs/CODEBASE_MAP.md << 'H'
# CODEBASE MAP — AUTO-GENERATED. Do not hand-edit. Regenerate via this script.
H
echo "Generated: $(date)" >> docs/CODEBASE_MAP.md

echo -e "\n## FILE TREE (app, lib, components — depth 3, no node_modules)\n\`\`\`" >> docs/CODEBASE_MAP.md
find app lib components -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | sort >> docs/CODEBASE_MAP.md
echo -e "\`\`\`" >> docs/CODEBASE_MAP.md

echo -e "\n## ROUTES (app pages + api)\n\`\`\`" >> docs/CODEBASE_MAP.md
find app -name "page.tsx" -o -name "route.ts" 2>/dev/null | sort >> docs/CODEBASE_MAP.md
echo -e "\`\`\`" >> docs/CODEBASE_MAP.md

echo -e "\n## lib EXPORTS (every exported symbol per file)\n\`\`\`" >> docs/CODEBASE_MAP.md
grep -rn "^export " lib/ --include="*.ts" 2>/dev/null | sed 's/{.*//' >> docs/CODEBASE_MAP.md
echo -e "\`\`\`" >> docs/CODEBASE_MAP.md

echo -e "\n## DB TABLES + COLUMNS (information_schema — ground truth)\n\`\`\`" >> docs/CODEBASE_MAP.md
node -e "
const {Pool}=require('pg');
const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
(async()=>{
  const t=await p.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name\");
  for(const {table_name} of t.rows){
    const c=await p.query(\"SELECT column_name,data_type,is_nullable FROM information_schema.columns WHERE table_name=\$1 ORDER BY ordinal_position\",[table_name]);
    console.log('=== '+table_name+' ===');
    c.rows.forEach(x=>console.log('  '+x.column_name+' : '+x.data_type+(x.is_nullable==='YES'?' ?':'')));
  }
  await p.end();
})();
" >> docs/CODEBASE_MAP.md 2>&1
echo -e "\`\`\`" >> docs/CODEBASE_MAP.md

echo -e "\n## ENV VARS REFERENCED (names only, no values)\n\`\`\`" >> docs/CODEBASE_MAP.md
grep -rho "process\.env\.[A-Z_]*" app lib --include="*.ts" --include="*.tsx" 2>/dev/null | sed 's/.*process\.env\.//' | sort -u >> docs/CODEBASE_MAP.md
echo -e "\`\`\`" >> docs/CODEBASE_MAP.md

echo -e "\n## PACKAGE DEPENDENCIES (top-level, no versions)\n\`\`\`" >> docs/CODEBASE_MAP.md
node -e "const p=require('./package.json');Object.keys(p.dependencies||{}).concat(Object.keys(p.devDependencies||{})).sort().forEach(x=>console.log(x))" >> docs/CODEBASE_MAP.md
echo -e "\`\`\`" >> docs/CODEBASE_MAP.md