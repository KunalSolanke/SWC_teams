const path = require('path')
const config_files = {
    "node" :path.join(__dirname,'nginx_config/node.conf') 
}
const pass = process.env.SERVER_PASSWORD



const commands ={
    "cpDefault":(appType,deployname,domain="voldemort.wtf",port=3000)=>{
        return `cp ${config_files[appType]} /etc/nginx/sites-available/${deployname}.${domain}.conf`
    },
    "enablefile": (filename) => `echo ${pass} | sudo ln -s /etc/nginx/sites-available/${filename}.conf /etc/nginx/sites-enabled/`,
    "restart":`echo ${pass} | sudo systemctl restart nginx`,
    "enable": `echo ${pass} | sudo systemctl restart nginx`,
    "add host":(domain)=>`echo '${doamin}' >> /etc/hosts`,
    "check" : "ngnix -t"
}

