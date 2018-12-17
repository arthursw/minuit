import * as shapesModule from './shapes.js'
import * as flanModule from './flan.js'
import * as slidingNotes from './slidingNotes.js'
import * as circlesModule from './concentricCircles.js'
import * as chordsModule from './chords.js'
import * as lines from './lines.js'

let modules = [ shapesModule, flanModule, slidingNotes, circlesModule, chordsModule, lines ]

let parameters = {
    circleSize: 50,
    circleStrokeWidth: 6
}


let noteMin = Tone.Frequency('A1').toMidi()
let noteMax = Tone.Frequency('C7').toMidi()

let noteNumber = noteMax - noteMax
let recording = true

let selectedInstrument = 0
let instruments = []

var part = null
let timeWhenLoopStarted = null

let group = null

function equal(t1, t2) {
    return Math.abs(t1-t2) < 0.01
}

function onPartEvent(time, event) {

    let playSound = false
    let otherNotesToPlay = []
    let nOtherNoteToPlay = 0

    for(let e of part._events) {
        if(equal(e.value.time, event.time) && event.instrument == e.value.instrument) {
            otherNotesToPlay.push(e)
            if(!e.played) {
                nOtherNoteToPlay
            }

        }
    }
    
    if(nOtherNoteToPlay > 1) {
        playSound = false
        event.played = true
    } else if(nOtherNoteToPlay == 1) {
        for(let note of otherNotesToPlay) {
            note.played = false
        }
        playSound = true
    } else {
        playSound = true
    }

    playNote(event.note, event.velocity, time, event.duration, event.module, event.instrument, playSound, event)
}

let mDuration = '2m'

export function activate() {
    $(paper.view.element).show()
    paper.project.clear()

    if(group == null || group.parent != paper.project.activeLayer) {
        group = new paper.Group()
    }

    let background = new paper.Path.Rectangle(paper.view.bounds)
    background.fillColor = 'rgb(234, 234, 234)'
    group.addChild(background)

    part = new Tone.Part(onPartEvent, [])
            // { time : 0, note : 'C4', dur : '4n', instrument: 0, velocity: 0, module: null },
            // { time : '4n + 8n', note : 'E4', dur : '8n', instrument: 0, velocity: 0, module: null },
            // { time : '2n', note : 'G4', dur : '16n', instrument: 0, velocity: 0, module: null },
            // { time : '2n + 8t', note : 'B4', dur : '4n', instrument: 0, velocity: 0, module: null }])

    part.start(0)
    part.loopStart = 0
    part.loopEnd = Tone.Time(mDuration).toSeconds()
    part.loop = true
    Tone.Transport.start()
    timeWhenLoopStarted = Tone.now()

    for(let module of modules) {
        module.activate()

        group.addChild(module.group)
    }
}

export function deactivate() {
    paper.project.clear()
    $(paper.view.element).hide()
    
    for(let module of modules) {
        module.deactivate()
    }

}

export function render(event) {
    
    for(let module of modules) {
        module.render()
    }

    scaleShapes()
}

function playNote(noteNumber, velocity, time, duration, cmodule, instrument, playSound, event) {

    // instruments[instrument].triggerAttackRelease(noteNumber, duration, time, velocity)

    if(modules[instrument].synth.volume.value <= -100) {
        return
    }

    if(modules[instrument].noteOn) {
        let d = duration ? Tone.Time(duration).toSeconds() : Tone.Time('4n').toSeconds()
        modules[instrument].noteOn(noteNumber, velocity, time, d, true, playSound)
    }

    for(let m of modules) {
        m.group.visible = false
    }

    if(!event) {    
        modules[instrument].group.visible = true
        return
    }

    let otherNotesToPlay = []

    for(let e of part._events) {
        if(equal(e.value.time, event.time)) {
            otherNotesToPlay.push(e)
        }
    }

    let m = modules[instrument]
    if(otherNotesToPlay.length > 0) {
        let randomIndex = Math.floor(Math.random() * otherNotesToPlay.length)
        let im = otherNotesToPlay[randomIndex].value.instrument
        m = modules[im]
    }

    m.group.visible = true
}

export function noteOn(event) {

    let data = event.detail
    let noteNumber = data.note.number
    let velocity = data.velocity

    playNote(noteNumber, velocity, Tone.now(), '4n', modules[selectedInstrument], selectedInstrument, true)

    if(recording) {
        let now = Tone.now()
        let timeInMeasure = (now - timeWhenLoopStarted) % Tone.Time(mDuration).toSeconds()
        let quantizedNoteTime = Tone.Time(timeInMeasure).quantize('8n')
        console.log(now, timeWhenLoopStarted, timeInMeasure)
        // let quantizedNoteTime = Tone.Time(quantizedTimeInPart).quantize('4n')
        part.add(quantizedNoteTime, { time: quantizedNoteTime, velocity: velocity, note: noteNumber, dur: -now, instrument: selectedInstrument, module: modules[selectedInstrument]})
    }
}

export function noteOff(event) {
    let data = event.detail
    let noteNumber = data.note.number
    let velocity = data.velocity

    for(let event of part._events) {
        if(event.value.instrument == selectedInstrument && noteNumber == event.value.note && event.value.dur < 0) {
            let duration = Math.abs(event.value.dur) - Tone.now()
            let quantizedDuration = Tone.Time(duration).quantize('8n')
            quantizedDuration = Math.max(quantizedDuration, Tone.Time('8n').toSeconds())
            event.value.dur = quantizedDuration
        }
    }


    if(modules[selectedInstrument].noteOff) {
        modules[selectedInstrument].noteOff(noteNumber, velocity, Tone.now())
    }

}

let stopTime = null

export async function controlchange(index, type, value) {


    if(type == 'knob') {
        
    }

    if(type == 'button-top') {

        if(value > 0.5) { 
            if(index >= 0 && index < modules.length) {
                selectedInstrument = index
            }
        }


    }

    if(type == 'button-bottom') {
        if(value > 0.5) {

            for(let e of part._events.slice()) {
                if(index == e.value.instrument) {
                    part.remove(e.value.time, e.value)
                }
            }
            
            if(index >= 0 && index < modules.length) {
                modules[index].group.removeChildren()
            }
        }
    }

    if(type == 'slider') {
        if(index >= 0 && index < modules.length) {
            if(modules[index].synth) {
                let db = Tone.gainToDb(value)
                modules[index].synth.volume.value = db
                if(db <= -100) {
                    modules[index].group.visible = false
                }
            }
        }
    }

    if(type == 'special') {

        if(index == 'record') {
            recording = !recording
        }
        if(index == 'play') {
            part.start()
        }
        if(index == 'stop') {
            part.stop()

            for(let m of modules) {
                if(m.stop) {
                    m.stop()
                }
            }

        }


    }

}

let circles = []

function createShape(event) {
    let data = event.detail
    let c = paper.view.bounds.leftCenter.add(paper.view.size.width * ((data.note.number - noteMin) / noteNumber), 0)
    let circle = new paper.Path.Rectangle(c, c.add(1.5 * parameters.circleSize))
    circle.strokeColor = 'black'
    circle.strokeWidth = data.velocity * parameters.circleStrokeWidth
    circle.data.noteNumber = data.note.number
    circles.push(circle)

    setTimeout(()=> circle.remove(), 5000)
}

function scaleShapes() {
    for(let circle of circles) {
        circle.scale(1.01)
    }
}