const socket = io()

let groceries = []

socket.on('Add', (data) => {
    groceries.push(data)
    groceries.sort((a, b) => a.name > b.name)
    
    noGroceriesMessage(groceries)
    renderView(groceries)
})

socket.on('Remove', (data) => {
    handleRemove(groceries, data)
})

socket.on('Update', (data) => {
    handleUpdate(groceries, data)
})

socket.on('Prepare sync data', (data) => {
    handleSync(data)
})

socket.on('Sync list', (data) => {
    groceries = data
    
    noGroceriesMessage(groceries)
    renderView(groceries)
})

socket.on("List name taken", (data) => {
    // Handle "register" & "sync" message boxes
    if(data[0] ===  "list-name") {
        data[1]
            ? document.querySelector("#list-name-message").style.display = "block"
            : document.querySelector("#list-name-message").style.display = "none"
    } else {
        data[1]
            ? document.querySelector("#target-list-name-message").style.display = "none"
            : document.querySelector("#target-list-name-message").style.display = "block"
    }
})

const handleSync = data => {
    socket.emit("Send sync data", {
        name: data,
        list: groceries
    })
}

const handleAdd = () => {
    let inputName = document.querySelector('#name')
    let inputQuantity = document.querySelector('#quantity')

    var data = {
        name: inputName.value,
        quantity: inputQuantity.value
    };

    if(!validateInput(data)) {
        return
    }

    socket.emit('Add grocery', data);

    inputName.value = ''
    inputQuantity.value = '1'
}

const handleUpdate = (elements, data) => {
    elements.forEach(el => el.name == data.name ? el.quantity = data.quantity : null)
    document.getElementById(`quantity${data.name}`).value = data.quantity
}

const handleRemove = (elements, data) => {
    groceries = elements.filter(el => el.name !== data.name)
    document.getElementById(`name${data.name}`).remove()

    noGroceriesMessage(groceries)
}

const noGroceriesMessage = data => {
    const element = document.querySelector("#grocery-message")

    if(data.length === 0) {
        element.style.display = "block"
    } else {
        element.style.display = "none"
    }
}

const hasGroceryListed = data => {
    // this method performs better since we cannot avoid an iteration
    return groceries.some(el => el.name.toLowerCase() === data.name.toLowerCase())
}

const validateInput = (data) => {
    document.querySelector("#add-grocery-message-invalid").style.display = "none"
    document.querySelector("#add-grocery-message-exists").style.display = "none"

    if(data.name.length < 1){
        document.querySelector("#add-grocery-message-invalid").style.display = "block"
        return false
    }

    if(hasGroceryListed(data)){
        document.querySelector("#add-grocery-message-exists").style.display = "block"
        return false
    }

    return true
}

/***** View *****/

const renderView = data => {
    clearView()
    data.forEach(el => createElement(el))
}

const createElement = element => {
    const container = document.createElement('div')

    const name = document.createElement('div')
    const nameNode = document.createElement('p')

    const quantity = document.createElement('div')
    const quantityNode = document.createElement('input')

    const button = document.createElement('div')
    const buttonNode = document.createElement('button')
    
    container.className = "form-row"
    container.id = "name" + element.name
    
    nameNode.innerHTML = element.name
    nameNode.className = "form-control"

    name.className = "col-sm-8 col-md-8 col-6"
    name.appendChild(nameNode)

    quantityNode.setAttribute('type', 'number')
    quantityNode.value = element.quantity
    quantityNode.className = "form-control"
    quantityNode.id = "quantity" + element.name
    quantityNode.addEventListener("change", (e) => {
        e.preventDefault()

        socket.emit("Update grocery", {
            name: element.name,
            quantity: e.target.value
        })
    })

    quantity.className = "col-sm-2 col-md-2 col-3"
    quantity.appendChild(quantityNode)

    buttonNode.className = "btn btn-danger w-100"
    buttonNode.innerHTML = "<i class=\"fas fa-times\"></i>"

    button.appendChild(buttonNode)
    button.className = "col-sm-2 col-md-2 col-3"
    buttonNode.addEventListener('click', (e) => {
        e.preventDefault()

        socket.emit('Remove grocery', {
            name: element.name,
            quantity: element.quantity
        })
    })

    container.appendChild(name)
    container.appendChild(quantity)
    container.appendChild(button)

    document.querySelector('#list').appendChild(container)
}

const clearView = () => {
    document.querySelector('#list').innerHTML = ''
}

document.querySelector('#addGrocery').addEventListener("click", (e) => {
    e.preventDefault()

    handleAdd()
})

document.querySelector('#name').addEventListener('keypress', (e) => {
    if(e.keyCode === 13) {
        handleAdd()
    }
})

const registerList = (data) => {
    socket.id = data.value
    socket.emit("Register list", data.value)

    data.value = ''
}

const syncList = (element) => {
    const data = {
        name: socket.id,
        nameSync: element.value,
    }

    socket.emit("Sync lists", data)

    element.value = ''
}

document.querySelector("#add-list-name").addEventListener('click', () => {
    let username = document.querySelector("#list-name")

    username.addEventListener('keypress', (e) => {
        if(e.keyCode === 13) {
            registerList(username)
        }
    })
    registerList(username)
})

document.querySelector('#sync-lists').addEventListener('click', () => {
    let syncUsername = document.querySelector("#target-list-name")

    syncUsername.addEventListener('keypress', (e) => {
        if(e.keyCode === 13) {
            syncList(syncUsername)
        }
    })
    syncList(syncUsername)
})