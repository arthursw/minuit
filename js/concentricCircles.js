let parameters = {
    circleSize: 50,
    circleStrokeWidth: 6
}

let noteMin = Tone.Frequency('A1').toMidi()
let noteMax = Tone.Frequency('C7').toMidi()
let noteNumber = noteMax - noteMin

let circles = []

export let group = null
export let synth = new Tone.DuoSynth().toMaster()

export function activate() {
    // $(paper.view.element).show()
    // paper.project.clear()

    if(group == null) {
        group = new paper.Group()
    }
}

export function deactivate() {
    // paper.project.clear()
    // $(paper.view.element).hide()
    if(group) {
        group.remove()
    }
    group = null
}

export function render(event) {
    for(let circle of circles) {
        circle.scale(1.01)
    }
}

export function noteOn(noteNumberOrEvent, velocity, time, duration, show) {

    let data = noteNumberOrEvent.detail
    let noteNumber = data ? data.note.number : noteNumberOrEvent
    velocity = data ? data.velocity : velocity
    
    let circle = new paper.Path.Circle(paper.view.bounds.leftCenter.add(paper.view.size.width * ((noteNumber - noteMin) / noteNumber), 0), velocity * parameters.circleSize)
    circle.strokeColor = 'black'
    circle.strokeWidth = velocity * parameters.circleStrokeWidth
    circle.data.noteNumber = noteNumber
    
    group.addChild(circle)

    circles.push(circle)

    setTimeout(()=> circle.remove(), 5000)

    synth.triggerAttackRelease(Tone.Frequency(noteNumber, 'midi').toNote(), duration, time, velocity)
    // synth.triggerAttackRelease(noteNumber, '2n', Tone.now(), 1)
}

export function noteOff(event) {
    // let data = event.detail
    // let findNote = (circle)=> {
    //     return circle.data.noteNumber == data.note.number
    // }
    // let circleIndex = circles.findIndex(findNote)
    // if(circleIndex >= 0) {
    //     circles[circleIndex].remove()
    //     circles.splice(circleIndex, 1)
    // }

}
