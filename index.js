const express = require('express')
const app = express()
const path = require('path');

var bodyParser = require('body-parser')
var mkpath = require('mkpath');
var fs = require('mz/fs')
var exec = require('child_process').exec

var jsonfile = require('jsonfile')
app.use(express.static('front_end'))
app.use('/styles', express.static('styles'))
app.use('/run', express.static('inputs'))




let queue = []
// INCOMPLETE!!!!
let styles = {
    "kand": "kandinsky.jpg",
    "starry": "starry-night.jpg",
    "ship": "shipwreck.jpg",
    "seated": "seated-nude.jpg",
    "scream": "the_scream.jpg",
    "woman": "woman-with-hat-matisse.jpg"
}

// Shitty security
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


let state = {}
// Set up JSON
// parse various different custom JSON types as JSON
app.use(express.json({limit: '50mb'}));
// We have SHIT security so watch this ROFL
app.use(express.urlencoded({limit: '50mb'}));

app.get('/', (req, res) =>  {
    res.sendFile(path.join(__dirname + '/front_end/home.html'));

})

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
    createInput(id, json).then((results) => {
        console.log("Input created")
        res.json({id: id})
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
    var styleImage;
    // Save content Image
    let contentImageSave = saveImage(json.contentImage, "./inputs/" + id + "/content.jpg")
    if(json.styleImage){
        json.settings.customStyle = true
        styleImage = saveImage(json.styleImage, "./inputs/" + id + "/style.jpg")
    }
    // Save settings
    let jsonSave = writeJSON("./inputs/" + id + "/settings.json", json.settings)

    // Create our html file 
    let indexCreate = copyFile("./front_end/view.html", "./inputs/" + id + "/index.html")
    // This might be uneccsary
    if(styleImage){
        return Promise.all([contentImageSave, jsonSave, styleImage, indexCreate])
    } else {
        return Promise.all([contentImageSave, jsonSave, indexCreate])
    }
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
        "style_imgs": "",
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
    console.log(json.styles)

    // Build our style images
    if(json.customStyle == true){
        settings["style_imgs_dir"] = "./inputs/" + id
        settings["style_imgs"] = "style.jpg"
    } else {
        json.styles.forEach((style, i) => {
            // If we have a valid style
            // This is like this because of old, im too proud to rewrite it right now
            if(styles[style] && i != json.styles.length - 1){
                settings["style_imgs"] += styles[style] + " "
            } else if (styles[style] && i == json.styles.length - 1){
                settings["style_imgs"] += styles[style]
            }
        })
    }

    // Build our setting strings
    for(var i in settings){
        settingString += "--" + i + " " + settings[i] + " ";
    }

    // TODO: Handle Style input

    // Apply specific flaggs
    console.log(json["original_colors"])
    if(json["original_colors"] == true || json["original_colors"] == "true") {
        settingString += "--original_colors"
    }

    return settingString
}

function copyFile(source, target) {
    var rd = fs.createReadStream(source);
    var wr = fs.createWriteStream(target);
    return new Promise(function(resolve, reject) {
      rd.on('error', reject);
      wr.on('error', reject);
      wr.on('finish', resolve);
      rd.pipe(wr);
    }).catch(function(error) {
      rd.destroy();
      wr.end();
      throw error;
    });
  }