const express = require('express')
const app = express()
var bodyParser = require('body-parser')
var mkpath = require('mkpath');
var fs = require('mz/fs')
var exec = require('child_process').exec

var jsonfile = require('jsonfile')

let queue = []
// INCOMPLETE!!!!
let styles = {
    "kand": "kandinsky.jpg",
    "starry": "starry-night.jpg",
    "ship": "shipwreck.jpg"
}


let state = {}
// Set up JSON
// parse various different custom JSON types as JSON
app.use(express.json())

app.get('/', (req, res) => res.send('Hello World!'))

/*
    JSON Structure:
    {
        contentImage: base64 encoded image
        masks: [
            <ArrayOfBase64Images>
        ]
        customStyles: [
            <ArayOfBase64Images>
        ]
        //TODO!!!
        //???
        settings: {
            nIterations: 100,
            styles: [ <ARRAY OF STYLE NAMES]
        }
    }
*/
// TODO: Post Method to 
app.post('/transfer_style/', (req, res) => {
    let json = req.body
    // MAYBE VERIFY THAT ITS VALID
    let id = createId()
    // Tell the user where they can wait
    res.json({id: id})
    createInput(id, json).then((results) => {
        console.log("Input created")
        // Parse Command line arguments
        let args = parseArguments(json.settings, id)
        console.log(args)
        // Run Python Command
        let command = exec('python ./test.py ' + args)

        // We Finished!
        command.on('exit', () => {
            console.log('Python Ran!')
        })

        // Error thing

        // Email(??) Notify Is Done

        
    })
    // Add Shit to Queue

})

app.listen(80, () => console.log('Worhwhile Neural Style Up and Running'))

let saveImage = (base64string, path) => {
    let data = base64string.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    console.log("Saving Image to " + path)
    return fs.writeFile(path, buf)
}

let createInput = (id, json) => {
    // Save content image
    mkpath.sync("./inputs/" + id)

    // Save content Image
    let contentImageSave = saveImage(json.contentImage, "./inputs/" + id + "/content.jpg")
    // Save settings
    let jsonSave = writeJSON("./inputs/" + id + "/settings.json", json.settings)

    return Promise.all([contentImageSave, jsonSave])
}

let createId = () => {
    return Math.ceil(Math.random() * 999999999)
}

let writeJSON = (path, json) => {
    return new Promise((resolve, reject) => {
        jsonfile.writeFile(path, json, (err) => {
            if(err){
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

let parseArguments = (json, id) => {
    //TODO: Handle Custom Styles
    let settings = {
        "img_output_dir" : "./inputs/" + id,
        "content_img_dir": "./inputs/" + id,
        "style_imgs": "starry-night.jpg",
        "max_size": "100",
        "content_img": "content.jpg",
        "max_iterations": "100",
    }
    let settingString = ""

    // Replace our defaults
    for(var i in json){
        if(settings[i]) {
            settings[i] = json[i]
        }
    }

    // Build our setting strings
    for(var i in settings){
        settingString += "--" + i + " " + settings[i] + " ";
    }

    // TODO: Handle Style input

    // Apply specific flaggs
    if(json["original_colors"] == true) {
        settingString += "--original_colors"
    }

    return settingString
}