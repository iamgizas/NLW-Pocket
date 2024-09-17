const { select, input, checkbox } = require('@inquirer/prompts');
const fs = require("fs").promises

let mensagem = "Welcome to the goals app";

let goals

const loadGoals = async () => {
    try {
        const data = await fs.readFile("goals.json", "utf-8")
        goals = JSON.parse(data)
    }
    catch(erro) {
        goals = []
    }
}

const saveGoals = async () => {
    await fs.writeFile("goals.json", JSON.stringify(goals, null, 2))
}

const registerGoal = async () => {
    const goal = await input({ message: "Enter your goal: "})

    if(goal.length == 0) {
        mensagem = 'The goal cannot be empty.'
        return 
    }

    goals.push({
        value: goal, checked: false
    })

    mensagem = "Goal registered successfully!"
}

const listGoals = async () => {
    if(goals.length == 0) {
        mensagem = "There are no goals to list"
        return
    }
    const results = await checkbox({
        message: "Use arrow keys to change goals, space to select or deselect and enter to finish this step",
        choices: [...goals],
        instructions: false
    })
    
    goals.forEach((g) => {
        g.checked = false
    })
    
    if (results.length == 0) {
        mensagem = "No goals selected!"
        return
    }
    
    

    results.forEach((result) => {
        const goal = goals.find((g) => {
            return g.value == result
        })

        goal.checked = true
    })

    mensagem = 'Goals marked as completed'

}

const goalsMet = async () => {
    const performed = goals.filter((goal) => {
        return goal.checked
    })

    if(performed.length == 0) {
        mensagem = 'There are no goals achieved'
        return
    }

    await select({
        message: "Goals met: " + performed.length,
        choices: [...performed]
    })
}

const openGoals = async () => {
    const open = goals.filter((goal) => {
        return goal.checked != true
    })

    if(open.length == 0) {
        mensagem = "There are no open goals :)"
        return
    }

    await select({
        message: "Open goals: " + open.length,
        choices: [...open]
    })
}

const removeGoals = async () => {
    const uncheckedGoals = goals.map((goal) => {
        return { value: goal.value, checked: false }
    })

    const deleteItem = await checkbox({
        message: "Select an item to delete",
        choices: [...uncheckedGoals],
        instructions: false
    })

    if(deleteItem.length == 0) {
        mensagem = "No items to be deleted!"
        return
    }

    deleteItem.forEach((item) => {
        goals = goals.filter((goal) => {
            return goal.value != item
        })
    })

    mensagem = "Successfully deleted goals!!"
}

const showMessage = () => {
    console.clear();

    if(mensagem != "") {
        console.log(mensagem)
        console.log("")
        mensagem = ""
    }
}

const start = async () => {
    await loadGoals()

    while(true) {
        showMessage()
        await saveGoals()

        const option = await select({
            message: "Menu >",
            choices: [
                {
                    name: "Register Goal",
                    value: "register"
                },
                {
                    name: "List goals",
                    value: "list"
                },
                {
                    name: "Goals met",
                    value: "performed"
                },
                {
                    name: "Open goals",
                    value: "open"
                },
                {
                    name: "Delete goals",
                    value: "remove"
                },
                {
                    name: "Leave",
                    value: "leave"
                }
            ]
        })


        switch(option) {
            case "register":
                await registerGoal()
                break
            case "list":
                await listGoals()
                break
            case "performed":
                await goalsMet()
                break
            case "open":
                await openGoals()
                break
            case "remove":
                await removeGoals()
                break
            case "leave":
                console.log("Until next time :)")
                return
        }
    }
}

start()