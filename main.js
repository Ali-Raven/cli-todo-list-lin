const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const os = require('os')
// adding json task file
let homeDir = path.join(os.homedir() , '.todo-cli-lin')
let JSON_file = path.join(homeDir , 'task.json');

// ensuring the function has been made

let ensureTaskDir = () => {
    try {
        if(!fs.existsSync(homeDir)) {
            fs.mkdirSync(homeDir , {recursive : true})
            console.log(`folder ${homeDir} have been made`);
        }
    }
    catch(err) {
        console.log(`error happen to find the folder : ${err}`);
    }
}

// reading the tasks from json file
let loadTasks = () => {
    try {
        ensureTaskDir();
        if(fs.existsSync(JSON_file)) {
            let data = fs.readFileSync(JSON_file , 'utf-8');
            return JSON.parse(data);  
        }
        else {
            let emptyFile = {};
            fs.writeFileSync(JSON_file , JSON.stringify(emptyFile , null) , 'utf-8');
            console.log(`file ${JSON_file} has been created.`);
            return emptyFile
        }   
    }
    catch(err) {
        console.log(`error appeard to load the file , test of error : ${err}`);
    }   
    
}

// saving tasks 

let saveTasks = (inputTasks) => {
    if (JSON_file.length < 500) {
        console.log(`count of all tasks is ${JSON_file.length}`);
        fs.writeFileSync(JSON_file , JSON.stringify(inputTasks , null) , 'utf-8');
    }
    else {
        fs.writeFile(JSON_file , '' , (err) => err ? console.log(err) : console.log('file reset , your file is new'))
        console.log(`file ${JSON_file} has been reset.`);
        fs.writeFileSync(JSON_file , JSON_file.stringify(inputTasks , null) , 'utf-8');
    }
}

// async func that add some tasks
const addTask = async () =>  {
    let answers = await inquirer.createPromptModule()([
        {
            type : 'input',
            name : 'task',
            message : 'please enter your new task here : ...',
            validate : input => input.trim() ? true : 'task can not be empty , please enter something ...'
        },
        {
            type : 'input',
            name : 'date',
            message : 'what date you want this task show to you : ...',
            default : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()
        }
    ])

    let tasks = loadTasks();
    if (!tasks[answers.date]) {
        tasks[answers.date] = [];
    }
    tasks[answers.date].push(answers.task);
    console.log('task added successfully ...');
    saveTasks(tasks);
}
// async function that show the todayTasks
const showTodayTasks = async () => {
    let today = new Date().toLocaleDateString().split('T')[0];
    const tasks = await loadTasks();
    if(tasks[today] && tasks[today].length > 0) {
        console.log(` your tasks in date ${today} is : \n`);
        tasks[today].forEach((item , index) => {
            console.log(`${index + 1} :  ${item}`);
        })
    }
    else 
        console.log('there are no task today for you ..');
}

let showAllTasks = async () => {
    if(fs.existsSync(JSON_file)) {
        let resultData = fs.readFileSync(JSON_file , 'utf-8');
        console.log(`you have ${JSON_file.length} tasks until now !`);
        console.log(resultData);
    }
}
async function mainFunction() {
    let answer = await inquirer.createPromptModule()(
        [
            {
                type : 'list',
                name : 'action',
                message : `hello ${os.hostname} , add your task and enjoy : `,
                choices : ['add new task' , 'show today tasks' , 'show All tasks' , 'exit']
            }
        ]
    )
    if(answer.action === 'add new task') {
        await addTask();
        mainFunction()
    }
    else if(answer.action === 'show today tasks') {
        await showTodayTasks();
        mainFunction();
    }
    else if (answer.action === 'show All tasks') {
        await showAllTasks();
        mainFunction();
    }
    else 
        console.log('exit ...');
}

/// run the program 
if(process.argv[2] === '--show-today') {
    showTodayTasks()
}
else
    mainFunction();
