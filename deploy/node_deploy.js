const utils = require('../utilities.js')
const {spawn} = require('child_process')
const pass = process.env.SERVER_PASSWORD


const npmInstallAll = async (cb) => {
    let child = spawn('npm install',{
        shell:true,
        
    })
    try{
       let data  =await utils.logger(child,"npmInstall")
       cb(null,data)
       
    }catch(error){
        console.log(error)
        return cb(error) ;
    }
    
}



const npmInstallPackage = async (name,cb) => {
    let child = spawn(`npm install ${name}`, {
        shell: true,
        
    })
    try {
        let data = await utils.logger(child, "npmInstall")
        cb(null, data)

    } catch (error) {
        console.log(error)
        return cb(error);
    }


}

const runserver =async (cb)=>{
    let child = spawn(`npm run start`, {
        shell: true,
        
    })

    try {
        let data = await utils.logger(child, "npmInstall")
        cb(null, data)

    } catch (error) {
        console.log(error)
        return cb(error);
    }

}



const deploy = async (options)=>{
    const {name,link} =options ;
   await  utils.clone(link, name,utils.cb)
   await  utils.cd(`/home/kunal/projects/${name}`,utils.cb)
    await utils.pwd(utils.cb)
}



module.exports = {
    deploy,npmInstallPackage,npmInstallAll,runserver
}