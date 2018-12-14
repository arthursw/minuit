let scripts = [
    'titles',
    'concentricCircles',
    'lines',
    'painting',
    'chords',
    'shader-grid',
    'shader-checker',
    'shader-fractal',
    'shader-geom',
    'shader-city'
]

let scriptsOrder = [9, 0, 8, 0, 7, 0, 0]
let currentScriptOrderIndex = 0
let currentTitleIndex = 0

let module = null
let soundModule = null
let socket = null

let send = (type, data)=> {
    let message = { type: type, data: data }
    socket.send(JSON.stringify(message))
}

let onMessage = (event)=> {
    let json = JSON.parse(event.data);

    let type = json.type;
    let data = json.data;
    console.log(json)
    if(type == 'file-changed' && data.eventType == 'change') {
        if(module.fileChanged) {
            console.log(data.content)
            module.fileChanged(data.content)
        }
    } else if(type == 'sound-file-changed') {
        window.location.reload(false); 
        // loadSoundModule(data.filename.replace('.js', ''))
        // soundModule.deactivate()
        // eval(data.content)
    }
}

let onWebSocketOpen = (event)=> {
    // send('is-connected')
}

let onWebSocketClose = (event)=> {
    console.error('WebSocket disconnected')
}

let onWebSocketError = (event)=> {
    console.error('WebSocket error')
    // console.error(event)
}

let loadSoundModule = (name)=> {
    console.log('loadSoundModule ', name)
    import('./js/sounds/' + name + '.js')
        .then(m => {

            if(soundModule) {
                soundModule.deactivate()
            }
            soundModule = m
            console.log('activate ', name)
            soundModule.activate()
        })
        .catch(err => {

            if(soundModule) {
                soundModule.deactivate()
                soundModule = null
            }

            console.log(err.message)
            console.log(err)
        });
}

let loadModule = (name, numTitles)=> {
    if(!numTitles) {
        numTitles = 0
    }
    let shader = null
    let moduleName = name
    if(name.indexOf('shader-') == 0) {
        shader = name.replace('shader-', '')
        moduleName = 'shaders'
    }
    import('./js/' + moduleName + '.js')
            .then(m => {
                if(module) {
                    module.deactivate()
                }
                module = m
                module.activate(shader, numTitles)
            })

    loadSoundModule(name)

}

let noteOn = (event)=> {
    if(module) {
        module.noteOn(event)
    }
    if(soundModule) {
        soundModule.noteOn(event)
    }
}

let noteOff = (event)=> {
    if(module) {
        module.noteOff(event)
    }
    if(soundModule) {
        soundModule.noteOff(event)
    }
}

function animate() {
    requestAnimationFrame( animate );
    if(module != null) {
        module.render();
    }
    if(soundModule != null) {
        soundModule.render()
    }
}

let mouseDown = false;

let onMouseDown = (event)=> {
    mouseDown = true
}

let onMouseMove = (event)=> {
    if(mouseDown && module && module.mouseMove) {
        module.mouseMove(event)
    }
    if(mouseDown && soundModule && soundModule.mouseMove) {
        soundModule.mouseMove(event)
    }
    // if(mouseDown && module && module.controlchange) {
    //     let x = 128 * event.clientX / window.innerWidth
    //     let y = 128 * event.clientY / window.innerHeight
    //     module.controlchange({controller: {number: 14+0}, data: [x, x, x]})
    //     module.controlchange({controller: {number: 14+1}, data: [y, y, y]})
        
    //     if(soundModule && soundModule.controlchange) {
    //         soundModule.controlchange({controller: {number: 14+0}, data: [x, x, x]})
    //         soundModule.controlchange({controller: {number: 14+1}, data: [y, y, y]})
    //     }
    // }
}

let onMouseUp = (event)=> {
    mouseDown = false
}

let onKeyDown = (event)=> {
    if(module && module.keyDown) {
        module.keyDown(event)
    }
    if(soundModule && soundModule.keyDown) {
        soundModule.keyDown(event)
    }
}

let onKeyUp = (event)=> {
    if(module && module.keyUp) {
        module.keyUp(event)
    }
    if(soundModule && soundModule.keyUp) {
        soundModule.keyUp(event)
    }
}

let main = ()=> {

    if ( WEBGL.isWebGL2Available() === false ) {
        document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );
    }

    module = loadModule(scripts[scriptsOrder[currentScriptOrderIndex]])

    WebMidi.enable(function(err) {

        if (err) {
            throw "WebMidi couldn't be enabled: ";
        }

        console.log(WebMidi.inputs);
        console.log(WebMidi.outputs);

        WebMidi.inputs.forEach(function (input) {
          console.log(input.name);
        });


        let nanoKontrol = WebMidi.getInputByName("nanoKONTROL SLIDER/KNOB")
        
        if(!nanoKontrol) {
            nanoKontrol = WebMidi.getInputByName("nanoKONTROL SLIDERKNOB")
        }

        if(!nanoKontrol) {
            nanoKontrol = WebMidi.getInputByName("nanoKONTROL")
        }

        if(!nanoKontrol) {
            nanoKontrol = WebMidi.getInputByName("USB Axiom 49 Port 1")
        }

        if(!nanoKontrol) {
            nanoKontrol = WebMidi.getInputByName("USB Axiom 49 Port 2")
        }

        if(nanoKontrol) {
            // var keyboard = WebMidi.getInputByName("Axiom Pro 25");

            // let eventNames = ["keyaftertouch",
            //             "controlchange",
            //             "channelmode",
            //             "programchange",
            //             "channelaftertouch",
            //             "pitchbend",
            //             "sysex",
            //             "timecode",
            //             "songposition",
            //             "songselect",
            //             "tuningrequest",
            //             "clock",
            //             "start",
            //             "continue",
            //             "stop",
            //             "reset", 
            //             // "midimessage",
            //             "unknownsystemmessage"];

            // for(let eventName of eventNames) {
            //     // console.log(eventName)
            //     nanoKontrol.addListener(eventName, "all", function (e) {
            //         console.log("Received " + eventName + " message.", e);
            //     });
            // }


            // Listen to control change message on all channels
            nanoKontrol.addListener('controlchange', "all", function (e) {
                console.log("channel: ", e.channel);
                console.log("controller:", e.controller.number);
                console.log("data:", e.data.toString());

                if(e.channel == 1) {

                    if(e.controller.number == 47 && e.data[2] == 127) {             // previous
                        currentScriptOrderIndex = Math.max(currentScriptOrderIndex-1, 0)
                        if(scriptsOrder[currentScriptOrderIndex] == 0) {
                            currentTitleIndex = Math.max(currentTitleIndex-1, 0)
                        }
                        loadModule(scripts[scriptsOrder[currentScriptOrderIndex]], currentTitleIndex)
                    } else if(e.controller.number == 48 && e.data[2] == 127) {      // next
                        currentScriptOrderIndex = Math.min(currentScriptOrderIndex+1, scriptsOrder.length - 1)
                        if(scriptsOrder[currentScriptOrderIndex] == 0) {
                            currentTitleIndex = Math.min(currentTitleIndex+1, 4)
                        }
                        loadModule(scripts[scriptsOrder[currentScriptOrderIndex]], currentTitleIndex)
                    }

                }
                
                if(module.controlchange) {
                    module.controlchange(e)
                }
                if(soundModule && soundModule.controlchange) {
                    soundModule.controlchange(e)
                }
            });

        }

        let keyboard = WebMidi.getInputByName("SV1 KEYBOARD")
        
        if(!keyboard) {
            keyboard = WebMidi.getInputByName("VMini Out")
        }

        if(!keyboard) {
            keyboard = WebMidi.getInputByName("VMPK Output")
        }
        
        if(!keyboard) {
            keyboard = WebMidi.getInputByName("USB Axiom 49 Port 1")
        }

        if(!keyboard) {
            keyboard = WebMidi.getInputByName("USB Axiom 49 Port 2")
        }

        if(keyboard) {
            

            keyboard.addListener('noteon', "all", function (e) {
                noteOn({ detail: e })
                
            });

            keyboard.addListener('noteoff', "all", function (e) {
                noteOff({ detail: e })
            });

            keyboard.addListener('programchange', "all", function (e) {
                console.log("Received 'programchange' message.", e);
            });


            keyboard.addListener('controlchange', "all", function (e) {
                console.log("channel: ", e.channel);
                console.log("controller:", e.controller.number);
                console.log("data:", e.data.toString());
            })
        }
    })

    document.addEventListener('noteOn', noteOn, false)
    document.addEventListener('noteOff', noteOff, false)

    window.addEventListener("mouseup", onMouseUp)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mousedown", onMouseDown)

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    var canvas = document.getElementById('canvas');
    paper.install(window);
    paper.setup(canvas);

    let clearCanvas = ()=> {
        paper.project.clear()
    }


    var gui = new dat.GUI({hideable: true});

    gui.add({ name: scripts[scriptsOrder[currentScriptOrderIndex]] }, 'name', scripts).onFinishChange((value)=> {
        if(value != null && value != '') {
            clearCanvas();
            
            loadModule(value)

        }
    })

    let channels = {}
    for(let i=0 ; i<9 ; i++) {
        let name = 'channel' + i
        channels[name] = 0
        gui.add(channels, name, 0, 128, 1).onFinishChange((value)=> {
            if(module.controlchange) {
                module.controlchange({ controller: { number: 14+i }, data: [value, value, value] })
            }
        })
    }

    window.gui = gui;

    // import('./js/synth.js').then(m => m.createSynth(gui))

    let parameters = {}

    animate();

    socket = new WebSocket('ws://localhost:' + 4568)
    socket.addEventListener('message',  onMessage)
    socket.addEventListener('open',  onWebSocketOpen)
    socket.addEventListener('close',  onWebSocketClose)
    socket.addEventListener('error',  onWebSocketError)
}

document.addEventListener("DOMContentLoaded", main)




