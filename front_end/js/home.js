var settingJson = {
    styles: [],
    keep_colors: false,
    max_iterations: "500"
}
let styles = {
    "kand": false,
    "starry": false,
    "ship": false,
    "seated": false,
    "scream": false,
    "woman": false
}
$(function(){
    let ip = "35.190.182.42"
    let url = "http://35.190.182.42/transfer_style/"
    $("#userFile").click(function() {

    })
    $(".styles").click(function() {
        styles[$(this).attr('key')] = !(styles[$(this).attr('key')])
        var isEnabled = styles[$(this).attr('key')]
        if(isEnabled){
            $(this).addClass('borderClass');
        } else {
            $(this).removeClass('borderClass');
        }
        console.log(styles)
    })

    $("#submit").click(function() {
        var myFile = $('#userFile').prop('files')[0];
        getBase64(myFile, function(b64) {
            // Add our selected styles to our post json
            Object.keys(styles).forEach(function(key){
                if(styles[key] == true){
                    settingJson.styles.push(key)
                }
            })
            console.log('Our Settings Json')
            console.log(settingJson)
            $.post(url, {
                contentImage: b64,
                masks: [

                ],
                settings: settingJson
            }).done(function(resp){
                console.log('ID!')
                console.log(resp)
            })
            
        })
        console.log(myFile)
    })

})

function getBase64(file, cb) {
    console.log(file)
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        cb(reader.result)
    }
    reader.onerror = function (error) {
      console.log('Error: ', error);
      alert('Error with input image: ' + error) 
    };
 }
 