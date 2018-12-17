import * as shapesModule from './shapes.js'
import * as flanModule from './flan.js'
import * as slidingNotes from './slidingNotes.js'
import * as circlesModule from './concentricCircles.js'

let modules = [ shapesModule, flanModule, slidingNotes, circlesModule ]

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

export function activate() {
    $(paper.view.element).show()
    paper.project.clear()

    if(group == null || group.parent != paper.project.activeLayer) {
        group = new paper.Group()
    }

    let background = new paper.Path.Rectangle(paper.view.bounds)
    background.fillColor = 'rgb(234, 234, 234)'
    group.addChild(background)

    part = new Tone.Part(function(time, event){
            
            playNote(event.note, event.velocity, time, event.duration, event.module, event.instrument)

        }, [{ time : 0, note : 'C4', dur : '4n', instrument: 0, velocity: 0, module: null },
            { time : '4n + 8n', note : 'E4', dur : '8n', instrument: 0, velocity: 0, module: null },
            { time : '2n', note : 'G4', dur : '16n', instrument: 0, velocity: 0, module: null },
            { time : '2n + 8t', note : 'B4', dur : '4n', instrument: 0, velocity: 0, module: null }])

    part.start(0)
    part.loopStart = 0
    part.loopEnd = Tone.Time('8m').toSeconds()
    part.loop = true
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
    scaleShapes()
}

function playNote(noteNumber, velocity, time, duration, module, instrument) {

    // instruments[instrument].triggerAttackRelease(noteNumber, duration, time, velocity)

    if(module.noteOn) {
        module.noteOn(noteNumber, velocity, time, duration)
    }

}

export function noteOn(event) {

    let data = event.detail
    let noteNumber = data.note.number
    let velocity = data.velocity

    playNote(noteNumber, velocity)

    if(recording) {
        let now = Tone.now()
        let quantizedTimeInPart = Tone.Time(now-timeWhenLoopStarted).quantize('4m')
        let quantizedNoteTime = Tone.Time(quantizedTimeInPart).quantize('4n')
        part.at(quantizedTime, { time: quantizedNoteTime, note: noteNumber, dur: -now, instrument: selectedInstrument, module: module[selectedInstrument]})
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


    if(module.noteOff) {
        module.noteOff(noteNumber, velocity, Tone.now())
    }

}


export async function controlchange(index, type, value) {


    if(type == 'knob') {
        
    }

    if(type == 'button-top') {

        if(value > 0.5) { 
            selectedInstrument = index
        }


    }

    if(type == 'button-bottom') {
        if(value > 0.5) {
            if(index == 0) {
                recording = !recording
            }
        }
    }

    if(type == 'slider') {
    }

    if(type == 'special') {

        if(index == 'record') {
            recording = !recording
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