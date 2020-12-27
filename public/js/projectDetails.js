let databaseForm = document.querySelector('#databases_form');
let databaseSubmit = document.querySelector('#databases_submit');
let pid = document.querySelector('.project_id')
let configurations = document.querySelector('#configurations')
let addbtn = document.getElementById("add");
let updateModalForm = document.querySelector("#updateModal_form");
let closeModalForm = document.querySelector("#closeModal_form");
let deploybtn = document.querySelector("#deploy")

let hideUpdateModal= document.querySelector(".hideUpdateModal")
let hideDelModal = document.querySelector(".hideDelModal")














/*Ajax for adding the config vars starts*/
databaseSubmit.addEventListener('click', (e) => {
  e.preventDefault();
  let formData = new FormData(databaseForm)
  const projectId = databaseForm.getAttribute("data_project_id");
  let data = {};
  for (let pair of formData.entries()) {
    data[pair[0]] = pair[1];
  }
  console.log(data)
  fetch(`/project/${projectId}/databases/`, {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res=>{
    console.log(res) ;
  }).catch(err=>{

  })
})


/*Ajax for adding the config vars ends*/










/*Ajax for updating the config vars starts*/
let updateConfig = document.querySelector('#updateConfigSave');
updateConfig.addEventListener('click', (e) => {
  e.preventDefault();
  const projectId = pid.getAttribute("data_project_id");
  let data = {
  }
  let key = document.querySelector("#config_update_modal_key").value;
  let value = document.querySelector("#config_update_modal_value").value;
  let formid = document.querySelector("#updateConfigSave").getAttribute("data_form_id")

  data['key'] = key;
  data['value'] = value;;


  console.log(data);
  fetch(`/project/${projectId}/config`, {
    method: "put",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => res.json()
  ).then(data=>{
    console.log(formid)
    document.querySelector('input[data_id=value_' + formid+ ']').value = value ;
    hideUpdateModal.click() ;
  }).catch(err => {
    console.log("err",err.message)
  })
})
/*Ajax for updating the config vars ends*/












/*Ajax for deleting the config var starts */
let delConfig = document.querySelector('#delConfigSave');

delConfig.addEventListener('click', (e) => {
  e.preventDefault();
  const projectId = pid.getAttribute("data_project_id");
  let data = {
  };
  let key = document.querySelector("#config_del_modal_key").value;
  let value = document.querySelector("#config_del_modal_value").value;
  let formid = document.querySelector("#delConfigSave").getAttribute("data_form_id")
  data['key'] = key;
  data['value'] = value;
  console.log(data);
  fetch(`/project/${projectId}/config`, {
    method: "delete",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => res.json()
  ).then(data => {
    if(data.success)document.querySelector("#config-form-"+formid).style.display= "none";
    hideDelModal.click()
  }).catch(err => {
    console.log("err", err.message)
  })
})
/*Ajax for deletin the config var ends */








let addConfig = (key, value) => {

  const projectId = pid.getAttribute("data_project_id");
  let data = {
  }
  data['key'] = key;
  data['value'] = value;
  console.log(data);
  return fetch(`/project/${projectId}/config/`, {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })
}








window.onload = () => {
  let data_id = configurations.children.length;
  addbtn.setAttribute('data_id', data_id);
  let addForm = addbtn.parentElement.parentElement.parentElement;

  addForm.setAttribute('id', `config-form-${data_id}`)
  console.log(addForm)
  let keyInput = addForm.firstElementChild.firstElementChild.lastElementChild
  let valueInput = addForm.firstElementChild.childNodes[3].lastElementChild;
  // $("#config-form-"+data_id+">div:nth-child(2)")
  
  keyInput.setAttribute('data_id', `key_${data_id}`);
  valueInput.setAttribute('data_id', `value_${data_id}`);
}






let configFnadd = function (e) {
  let currid = configurations.children.length;
  let newid = currid + 1;
  let form = document.getElementById(`config-form-${currid}`);
  console.log(form)
  let status = form.checkValidity()
  if (!status) {
    form.reportValidity();
    return;
  }
  e.preventDefault();
  let formData = new FormData(document.querySelector(`#config-form-${currid}`));
  addConfig(formData.get("key"), formData.get("value")).then(res => res.json()
  ).then(data => {
    
  

  let addcontainer = document.getElementById("abbbtn-container");


  let addbtnhtml = (id) => `<div id="addbtn-container" class ="col-lg-2" data_id=${id}>
                                       <button id="add" type="submit" class="btn btn-secondary mb-2">Add</button>
                             </div>`
  let pencilbtnhtml = (id) => `<button type="button"  data_id =pencil_${id} data-bs-toggle="modal" data-bs-target="#updateModal" data-whatever="@mdo" class="btn btn-secondary mb-2 pencil"><i class="fa fa-1x fa-pencil" aria-hidden="true"></i></button>`
  let crossbtnhtml = (id) => `<button type="button"  data_id =cross_${id} data-bs-toggle="modal" data-bs-target="#closeModal" data-whatever="@Hi" class="btn btn-secondary mb-2 cross"><i class="fa fa-times" aria-hidden="true"></i></button>`



  let node1 = document.createElement('div')
  node1.className = "col-lg-1"
  node1.innerHTML = pencilbtnhtml(currid)
  let node2 = document.createElement('div');
  node2.className = "col-lg-1"
  node2.innerHTML = crossbtnhtml(currid)
  form.firstElementChild.removeChild(addbtn.parentElement) ;
  
  form.firstElementChild.appendChild(node1)
  form.firstElementChild.appendChild(node2)
  let newform = (id) => `
    <div class="row form-row align-items-center">
      <div class="col-lg-5">
        <label class="sr-only" for="inlineFormInput">Name</label>
        <input type="text" class="form-control mb-2 text-white" style="background-color:#3d3d48" id="key" name="key" data_id =key_${id}
          placeholder="Key" required />
      </div>
      <div class="col-lg-5">
        <label class="sr-only" for="inlineFormInput">Name</label>
        <input type="text" class="form-control mb-2 text-white" style="background-color:#3d3d48" id="value"  data_id =value_${id}
          name="value" placeholder="value" required />
      </div>
      <div id="addbtn-container" class ="col-lg-2" data_id=${id}>
        <button id="add" type="submit" class="btn btn-secondary mb-2">Add</button>
      </div>
    </div>
  `


  let form1 = document.createElement('form')
  form1.id = `config-form-${newid}`
  form1.style = "margin-bottom: 12px;"
  form1.innerHTML = newform(newid)
  form.parentElement.appendChild(form1);
  addbtn = document.getElementById("add")
  addbtn.addEventListener('click', (e) => configFnadd(e))
  

  /* Passing current values in update modal*/
  document.querySelector('button[data_id="pencil_' + `${currid}` + '"]').addEventListener('click', (e) => {
    console.log(currid)
    updateConfig.setAttribute("data_form_id", currid);
    console.log(updateConfig)
    document.querySelector("#config_update_modal_key").value = document.querySelector('input[data_id=key_' + currid + ']').value;
    document.querySelector("#config_update_modal_value").value = document.querySelector('input[data_id=value_' + currid + ']').value;

  })

  /* Passing current values in delete modal*/
  document.querySelector('button[data_id="cross_' + `${currid}` + '"]').addEventListener('click', (e) => {
    console.log(currid)
    delConfig.setAttribute("data_form_id", currid);

    document.querySelector("#config_del_modal_key").value = document.querySelector('input[data_id=key_' + currid + ']').value;
    document.querySelector("#config_del_modal_value").value = document.querySelector('input[data_id=value_' + currid + ']').value;
  })

  document.querySelector('input[data_id=key_' + currid + ']').disabled = true;
  document.querySelector('input[data_id=value_' + currid + ']').disabled = true;
  }).catch(err => {
    console.log("err", err.message)
  })
}





addbtn.addEventListener('click', (e) => configFnadd(e))






/*Ajax for deploying starts */
deploybtn.addEventListener('click', (e) => {
  e.preventDefault();
  const projectId = databaseForm.getAttribute("data_project_id");
  fetch(`/project/${projectId}/`, {
    method: "post",
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => {
    console.log(res);
  }).catch(err => {

  })
})
/*Ajax for deploying ends */










let pencils = document.querySelectorAll('#pencil');
pencils.forEach((p, id) => {
  p.addEventListener('click', (e) => {
    let currid = id + 1;
    updateConfig.setAttribute("data_form_id", currid);
   
    document.querySelector("#config_update_modal_key").value = document.querySelector('input[data_id=key_' + currid + ']').value;
    document.querySelector("#config_update_modal_value").value = document.querySelector('input[data_id=value_' + currid + ']').value;

  })
})









let crosses = document.querySelectorAll('#cross');
crosses.forEach((p, id) => {

  p.addEventListener('click', (e) => {
    let currid = id + 1;
    delConfig.setAttribute("data_form_id", currid);
    document.querySelector("#config_del_modal_key").value = document.querySelector('input[data_id=key_' + currid + ']').value;
    document.querySelector("#config_del_modal_value").value = document.querySelector('input[data_id=value_' + currid + ']').value;

  })
})




















