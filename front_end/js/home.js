var settingJson = {
    styles: [],
    original_colors: false,
    max_iterations: "200",
    max_size: "500"
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
    var ip = "35.190.182.42"
    var url = "http://35.190.182.42/transfer_style/"
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
        var hasCustomStyle = $('#styleImage').prop('files').length != 0

        getBase64(myFile, function(b64) {
            if(hasCustomStyle){
                var styleImage = $('#styleImage').prop('files')[0];
                console.log(styleImage)
                getBase64(styleImage, function(b642) {
                    // Clear our style json!
                    settingJson.styles = []
                    // Add our selected styles to our post json
                    Object.keys(styles).forEach(function(key){
                        console.log(key)
                        if(styles[key] == true){
                            settingJson.styles.push(key)
                        }
                    })
                    // If they didnt do anything just assume starry
                    // TODO: DONT LET THIS BREAK CUSTOM STYLE IMAGES
                    if(settingJson.styles.length == 0){
                        settingJson.styles.push('starry')
                    }
                    if($("#original_colors").is(":checked")){
                        settingJson.original_colors = true
                    } else {
                        settingJson.original_colors = false
                    }
                    settingJson.max_iterations = "" + $("#max_iterations").val()
                    settingJson.max_size = "" + $("#max_size").val()

                    console.log('Our Settings Json')
                    console.log(settingJson)
                    
                    $.post(url, {
                        contentImage: b64,
                        styleImage: b642,
                        masks: [

                        ],
                        settings: settingJson
                    }).done(function(resp){
                        console.log('FUG')
                        console.log(resp)
                        window.location.href = "http://35.190.182.42/run/" + resp.id
                    })
                    
                })
            } else {
            
                // Clear our style json!
                settingJson.styles = []
                // Add our selected styles to our post json
                Object.keys(styles).forEach(function(key){
                    console.log(key)
                    if(styles[key] == true){
                        settingJson.styles.push(key)
                    }
                })
                // If they didnt do anything just assume starry
                // TODO: DONT LET THIS BREAK CUSTOM STYLE IMAGES
                if(settingJson.styles.length == 0){
                    settingJson.styles.push('starry')
                }
                if($("#original_colors").is(":checked")){
                    settingJson.original_colors = true
                } else {
                    settingJson.original_colors = false
                }
                settingJson.max_iterations = "" + $("#max_iterations").val()
                settingJson.max_size = "" + $("#max_size").val()

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
                    window.location.href = "http://35.190.182.42/run/" + resp.id
                })
            }
            
            
            
        })
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
 