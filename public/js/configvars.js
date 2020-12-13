let addbtn = document.getElementById("add")
addbtn.addEventListener('click',()=>{  
    let form = document.getElementById("config-form-1")
    let currid = form.parentElement.childElementCount;
    let newid = currid + 1;
    let addcontainer = document.getElementById("abbbtn-container")

    let addbtnhtml = (id) => `<div id="addbtn-container" class ="col-lg-2" data_id=${id}>
                                       <button id="add" type="submit" class="btn btn-secondary mb-2">Add</button>
                             </div>`
    let pencilbtnhtml = (id) => `<button type="submit" data_id =${id} class="btn btn-secondary mb-2"><i class="fa fa-1x fa-pencil" aria-hidden="true"></i></button></div>`
    let crossbtnhtml = (id) => `<button type="submit" data_id =${id} class="btn btn-secondary mb-2"><i class="fa fa-times" aria-hidden="true"></i></button></div>`
    
    let node1 = document.createElement('div')
    node1.className = "col-lg-1"
    node1.innerHTML = pencilbtnhtml(currid)
    let node2 = document.createElement('div');
    node2.className = "col-lg-1"
    node2.innerHTML = crossbtnhtml(currid)
    form.removeChild("addbtn-container")
    form.appendChild(node1)
    form.appendChild(node2)
    let newform = form
    newform.id = `config-form-${newid}`
    newform.innerHTML+=addbtnhtml(newid)
})




















