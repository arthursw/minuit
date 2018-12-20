let scripts = [
    'titles',
    'shapes',
    'concentricCircles',
    'lines',
    'painting',
    'chords',
    'shader-grid',
    'shader-checker',
    'shader-fractal',
    'shader-geom',
    'shader-city',
    'shader-texture',
    'music'
]

let scriptsOrder = [0, 0, 0, 10, 0, 8, 0, 0, 0, 0, 12, 10, 9, 0]
let currentScriptOrderIndex = 0
let currentTitleIndex = 0

let module = null
let soundModule = null
let debugSocket = null
let socket = null

let send = (type, data)=> {
    let message = { type: type, data: data }
    if(debugSocket.readyState == debugSocket.OPEN){
        debugSocket.send(JSON.stringify(message))
    }
    if(socket.readyState == socket.OPEN){
        socket.send(JSON.stringify(message))
    }
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
    } else if(type == 'controlchange') {
        if(module.controlchange) {
            module.controlchange(data.index, data.type, data.value)
        }
    } else if(type == 'nanoKontrol-controlchange') {
        onNanoKontrolChange(data, false)
    } else if(type == 'noteon') {
        noteOn(data, false)
    } else if(type == 'noteoff') {
        noteOff(data, false)
    } else if(type == 'keyup') {
        onKeyUp(data, false)
    } else if(type == 'keydown') {
        onKeyDown(data, false)
    }
}

let onWebSocketOpen = (event)=> {
}

let onWebSocketClose = (event)=> {
    console.error('WebSocket disconnected')
}

let onWebSocketError = (event)=> {
    console.error('WebSocket error')
}

let loadSoundModule = (name)=> {
    console.log('loadSoundModule ', name)
    import('./js/sounds/' + name + '.js')
        .then(m => {

            if(soundModule && soundModule.deactivate) {
                soundModule.deactivate()
            }
            soundModule = m
            console.log('activate ', name)

            if(soundModule.activate) {
                soundModule.activate()
            }
        })
        .catch(err => {

            if(soundModule) {
                if(soundModule.deactivate) {
                    soundModule.deactivate()
                }
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

let noteEventToObject = (e)=> {
    return { detail: {note: { number: e.detail.note.number }, velocity: e.detail.velocity } }
}

let noteOn = (event, sendWebSocket=true)=> {
    if(module) {
        module.noteOn(event)
    }
    if(soundModule) {
        soundModule.noteOn(event)
    }
    if(sendWebSocket) {
        send('noteon', noteEventToObject(event))
    }
}

let noteOff = (event, sendWebSocket=true)=> {
    if(module) {
        module.noteOff(event)
    }
    if(soundModule) {
        soundModule.noteOff(event)
    }
    if(sendWebSocket) {
        send('noteoff', noteEventToObject(event))
    }
}

function animate() {
    TWEEN.update();
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
    if(mouseDown) {
        // if(simulateNanoKontrol) {
        //     let index = Math.floor(9 * event.clientX / window.innerWidth)
        //     let type = 'knob'
        //     let value = event.clientY / window.innerHeight
        //     if(module && module.controlchange) {
        //         module.controlchange(index, type, value)
        //     }
        // }

        if(module && module.mouseMove) {
            module.mouseMove(event)
        }
        if(soundModule && soundModule.mouseMove) {
            soundModule.mouseMove(event)
        }
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

let keyboardEventToObject = (event)=> {
    return {
        key: event.key, 
        keyCode: event.keyCode, 
        metaKey: event.metaKey, 
        shiftKey: event.shiftKey, 
        ctrlKey: event.ctrlKey, 
        altKey: event.altKey, 
        code: event.code, 
        type: event.type,
        timeStamp: event.timeStamp, 
        which: event.which
    }
}

let instrument = null
let onKeyDown = (event, sendWebSocket=true)=> {
    if(module && module.keyDown) {
        module.keyDown(event)
    }
    if(soundModule && soundModule.keyDown) {
        soundModule.keyDown(event)
    }
    if(event.key == 'n') {
        let nTitles = $('#titles').children().length
        currentScriptOrderIndex = Math.min(currentScriptOrderIndex+1, scriptsOrder.length - 1)
        if(scriptsOrder[currentScriptOrderIndex] == 0) {
            currentTitleIndex = Math.min(currentTitleIndex+1, nTitles)
        }

        loadModule(scripts[scriptsOrder[currentScriptOrderIndex]], currentTitleIndex)
    } else if(event.key == 'p') {
        currentScriptOrderIndex = Math.max(currentScriptOrderIndex-1, 0)
        if(scriptsOrder[currentScriptOrderIndex] == 0) {
            currentTitleIndex = Math.max(currentTitleIndex-1, 0)
        }
        loadModule(scripts[scriptsOrder[currentScriptOrderIndex]], currentTitleIndex)
    }
    let num = parseInt(event.key)
    if(num >= 0 && num <= 9){
        if(module.controlchange) {
            if(num != instrument) {
                module.controlchange(num, 'button-top', 1)
            }
            instrument = num
            

            for(let i=0 ; i<9 ; i++) {
                module.controlchange(i, 'slider', 0.2+0.8*Math.random())
                module.controlchange(i, 'knob', 0.2+0.8*Math.random())
            }
            
            module.noteOn({detail: {note: { number: Math.random()*88+20}, velocity: 1 }})

            // function triggerSynth(time){
            //     module.noteOn({detail: {note: { number: Math.random()*88+20}, velocity: 1 }})
            // }

            // Tone.Transport.schedule(triggerSynth, 0.1)

            // Tone.Transport.schedule(()=> Tone.Transport.stop(), 1)

            // Tone.Transport.start()
        }
    }
    if(sendWebSocket) {
        send('keydown', keyboardEventToObject(event))
    }
}

let onKeyUp = (event, sendWebSocket=true)=> {
    if(module && module.keyUp) {
        module.keyUp(event)
    }
    if(soundModule && soundModule.keyUp) {
        soundModule.keyUp(event)
    }
    if(sendWebSocket) {
        send('keyup', keyboardEventToObject(event))
    }
}

let onNanoKontrolChange = (e, sendWebSocket=true)=> {
    // console.log("channel: ", e.channel);
    // console.log("controller:", e.controller.number);
    // console.log("data:", e.data[2]);

    if(e.channel == 1) {

        if(e.controller.number == 47 && e.data[2] == 127) {             // previous
            if(scriptsOrder[currentScriptOrderIndex] == 0) {
                currentTitleIndex = Math.max(currentTitleIndex-1, 0)
            }
            currentScriptOrderIndex = Math.max(currentScriptOrderIndex-1, 0)
            console.log('currentTitleIndex', currentTitleIndex, currentScriptOrderIndex, scriptsOrder[currentScriptOrderIndex], scripts[scriptsOrder[currentScriptOrderIndex]])
            loadModule(scripts[scriptsOrder[currentScriptOrderIndex]], currentTitleIndex)
        } else if(e.controller.number == 48 && e.data[2] == 127) {      // next
            currentScriptOrderIndex = Math.min(currentScriptOrderIndex+1, scriptsOrder.length - 1)
            let nTitles = $('#titles').children().length
            if(scriptsOrder[currentScriptOrderIndex] == 0) {
                currentTitleIndex = Math.min(currentTitleIndex+1, nTitles)
            }
            console.log('currentTitleIndex', currentTitleIndex, currentScriptOrderIndex, scriptsOrder[currentScriptOrderIndex], scripts[scriptsOrder[currentScriptOrderIndex]])
            loadModule(scripts[scriptsOrder[currentScriptOrderIndex]], currentTitleIndex)
        }

    }

    let index = 0
    let type = 'knob'
    let sliderIndices = [2, 3, 4, 5, 6, 8, 9, 12, 13]
    let specialIndices = [44, 45, 46, 49]
    let specialTypes = ['record', 'play', 'stop', 'loop']
    let value = e.data[2] / 128
    if(e.channel == 1) {
        if(e.controller.number >= 14 && e.controller.number <= 22) {
            type = 'knob'
            index = e.controller.number-14
        }
        let sliderIndex = sliderIndices.indexOf(e.controller.number)
        if(sliderIndex >= 0) {
            type = 'slider'
            index = sliderIndex
        }
        if(e.controller.number >= 23 && e.controller.number <= 31) {
            type = 'button-top'
            index = e.controller.number-23
        }
        if(e.controller.number >= 33 && e.controller.number <= 41) {
            type = 'button-bottom'
            index = e.controller.number-33
        }

        let specialIndex = specialIndices.indexOf(e.controller.number)
        if(specialIndex >= 0) {
            index = specialTypes[specialIndex]
            type = 'special'
        }
    }

    if(module.controlchange) {
        module.controlchange(index, type, value)
    }
    if(soundModule && soundModule.controlchange) {
        soundModule.controlchange(e)
    }

    if(sendWebSocket) {
        send('nanoKontrol-controlchange', {channel: e.channel, controller: e.controller, data: e.data })
    }
}

let onKeyboardNoteOn = (e)=> {
    noteOn({ detail: e })
}


let onKeyboardNoteOff = (e)=> {
    noteOff({ detail: e })
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
                onNanoKontrolChange(e)
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
                onKeyboardNoteOn(e)
            });

            keyboard.addListener('noteoff', "all", function (e) {
                onKeyboardNoteOff(e)
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
    gui.closed = true
    // gui.hide()
    // gui.add({ name: scripts[scriptsOrder[currentScriptOrderIndex]] }, 'name', scripts).onFinishChange((value)=> {
    //     if(value != null && value != '') {
    //         clearCanvas();
            
    //         loadModule(value)

    //     }
    // })

    let channels = {}
    let knobFolder = gui.addFolder('Knobs')
    let sliderFolder = gui.addFolder('Sliders')
    let buttonFolder = gui.addFolder('Buttons')
    for(let i=0 ; i<9 ; i++) {
        let name = 'knob' + i
        channels[name] = 0
        knobFolder.add(channels, name, 0, 1, 0.01).onChange((value)=> {
            if(module.controlchange) {
                module.controlchange(i, 'knob', value)
            }
            send('controlchange', {index: i, type: 'knob', value: value})
        })
        name = 'slider' + i
        channels[name] = 0
        sliderFolder.add(channels, name, 0, 1, 0.01).onChange((value)=> {
            if(module.controlchange) {
                module.controlchange(i, 'slider', value)
            }
            send('controlchange', {index: i, type: 'slider', value: value})
        })
        name = 'button-top' + i
        channels[name] = ()=> {
            if(module.controlchange) {
                module.controlchange(i, 'button-top', 1)
                setTimeout(module.controlchange(i, 'button-top', 0), 200)
            }
            send('controlchange', {index: i, type: 'button-top', value: 1})
            setTimeout(send('controlchange', {index: i, type: 'button-top', value: 0}), 500)
        }
        buttonFolder.add(channels, name)
        name = 'button-bottom' + i
        channels[name] = ()=> {
            if(module.controlchange) {
                module.controlchange(i, 'button-bottom', 1)
                setTimeout(module.controlchange(i, 'button-bottom', 0), 200)
            }
            send('controlchange', {index: i, type: 'button-bottom', value: 1})
            setTimeout(send('controlchange', {index: i, type: 'button-bottom', value: 0}), 500)
        }
        buttonFolder.add(channels, name)
    }

    // window.gui = gui;

    // import('./js/synth.js').then(m => m.createSynth(gui))

    let parameters = {}

    animate();

    debugSocket = new WebSocket('ws://localhost:' + 4568)
    debugSocket.addEventListener('message',  onMessage)
    debugSocket.addEventListener('open',  onWebSocketOpen)
    debugSocket.addEventListener('close',  onWebSocketClose)
    debugSocket.addEventListener('error',  onWebSocketError)

    socket = new WebSocket('ws://localhost:' + 3545)
    socket.addEventListener('message',  onMessage)
    socket.addEventListener('open',  onWebSocketOpen)
    socket.addEventListener('close',  onWebSocketClose)
    socket.addEventListener('error',  onWebSocketError)

}

document.addEventListener("DOMContentLoaded", main)




