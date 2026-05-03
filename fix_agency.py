import subprocess
r = subprocess.run(['node', '-e', """
const {Pool}=require('pg');
const fs=require('fs');
const env=fs.readFileSync('.env.local','utf8');
const dbUrl=env.match(/DATABASE_URL=['"]?([^'"\\n]+)/)[1];
const pool=new Pool({connectionString:dbUrl,ssl:{rejectUnauthorized:false}});
pool.query("SELECT id,name,status FROM agencies WHERE clerk_user_id=$1",["user_3BmeD8RpX6i341ZBf17iOUsiG63"]).then(r=>{
  console.log(JSON.stringify(r.rows));
  pool.end();
});
"""], capture_output=True, text=True)
print(r.stdout)
print(r.stderr)
