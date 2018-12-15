let parameters = {
    strokeWidth: 4,
    patternSize: 60,
    margin: 40,
    notesPerChord: 6,
    strokeColor: 'white'
}

let noteMin = 21
let noteMax = 108
let noteNumber = 88
let currentPosition = new paper.Point(0, 0)
let currentRadius = 300
let startTime = Date.now()

let cp = null
let center1 = null
let center2 = null

let currentNotes = []
let group = new paper.Group()

export let period = 0

export let channels = []
let signals = []

for(let i=0 ; i<9 ; i++) {
    let signal = new Tone.Signal(0)
    signals.push(signal)
    channels.push(signal.value)
}

let circles = []
let shapes = []

var polySynth = new Tone.PolySynth(5, Tone.Synth).toMaster();

export function activate() {
    $(paper.view.element).show()
    paper.project.clear()

    let background = new paper.Path.Rectangle(paper.view.bounds)
    background.fillColor = 'rgb(234, 234, 234)'
    paper.project.activeLayer.addChild(group)

    currentPosition = new paper.Point(0, 0)

    center1 = paper.view.center.add(-currentRadius/2, 0)
    center2 = paper.view.center.add(+currentRadius/2, 0)

    let bounds = new paper.Rectangle(paper.view.center.subtract(currentRadius, currentRadius), paper.view.center.add(currentRadius, currentRadius))
    
    let p = new paper.Path()
    p.add(bounds.topLeft)
    p.add(bounds.topRight)
    p.add(bounds.center)
    shapes.push(p)

    p = new paper.Path()
    p.add(bounds.topRight)
    p.add(bounds.bottomRight)
    p.add(bounds.center)
    shapes.push(p)

    p = new paper.Path()
    p.add(bounds.bottomRight)
    p.add(bounds.bottomLeft)
    p.add(bounds.center)
    shapes.push(p)

    p = new paper.Path()
    p.add(bounds.bottomLeft)
    p.add(bounds.topRight)
    p.add(bounds.center)
    shapes.push(p)



    p = new paper.Path()
    p.add(bounds.leftCenter)
    p.add(bounds.topLeft)
    p.add(bounds.topCenter)
    shapes.push(p)

    p = new paper.Path()
    p.add(bounds.topCenter)
    p.add(bounds.topRight)
    p.add(bounds.rightCenter)
    shapes.push(p)

    p = new paper.Path()
    p.add(bounds.rightCenter)
    p.add(bounds.bottomRight)
    p.add(bounds.bottomCenter)
    shapes.push(p)

    p = new paper.Path()
    p.add(bounds.bottomCenter)
    p.add(bounds.bottomLeft)
    p.add(bounds.leftCenter)
    shapes.push(p)


    p = new paper.Path()
    p.add(bounds.topLeft)
    p.add(bounds.topCenter)
    p.add(bounds.bottomCenter)
    p.add(bounds.bottomRight)
    shapes.push(p)

    p = new paper.Path()
    p.add(bounds.topCenter)
    p.add(bounds.topRight)
    p.add(bounds.bottomRight)
    p.add(bounds.bottomCenter)
    shapes.push(p)

    p = new paper.Path.Circle(bounds.center, bounds.width * 0.25)
    shapes.push(p)

    let b2 = bounds.clone()
    b2.scale(1.0, 0.15)
    p = new paper.Path.Rectangle(b2)
    shapes.push(p)

    b2 = bounds.clone()
    b2.scale(0.25, 1.0)
    p = new paper.Path.Rectangle(b2)
    shapes.push(p)

    for(let s of shapes) {
        s.visible = false
    }
    

    // p = new paper.Path.Circle(bounds.center, bounds.width * 0.5)
    // shapes.push(p)

    // let b2 = bounds.clone()
    // b2.scale(1.0, 0.15)
    // p = new paper.Path.Rectangle(b2)
    // shapes.push(p)

    // cp = new paper.CompoundPath({
    //     children: shapes,
    //     fillColor: 'black',
    //     fillRule: 'evenodd'
    // })

    // speaker

    // let nCircles = 8
    // for(let i=0 ; i<nCircles ; i++) {
    //     let t = i/(nCircles-1)
    //     let r = Math.pow(10, -1+t)
    //     console.log(r)
    //     let c = new paper.Path.Circle(paper.view.center, i==0 ? currentRadius*0.08 : currentRadius * r)
    //     c.strokeWidth = 1+10*Math.pow(1-t, 1)
        
    //     if(i==0) {
    //         c.fillColor = 'black'
    //         c.strokeColor = 'black'
    //     } else {
    //         c.strokeColor = 'black'
    //     }
    //     circles.push(c)
    // }


    // two lovers

    cp = new paper.CompoundPath({
        children: [
            new paper.Path.Circle(center1, currentRadius),
            new paper.Path.Circle(center2, currentRadius),
            new paper.Path.Circle(paper.view.center, currentRadius/2.1),
            ],
        // children: circles,
        fillColor: 'black',
        fillRule: 'evenodd'
    })

    startTime = Date.now()
    // setInterval(changeShape, 545)


    // setInterval(changeShape, 250)
}

let minNote = Tone.Frequency('C1').toMidi()
let maxNote = Tone.Frequency('C6').toMidi()

function changeShape() {

    // 

    for(let shape of shapes) {
        shape.visible = false
    }

    let randomIndices = []
    let randomNotes = []
    
    let n = Math.random() * 10
    for(let i=0 ; i<n ; i++) {
        let randomIndex = Math.floor(Math.random() * shapes.length)
        randomIndices.push(randomIndex)
        if(randomNotes.length >= 5) {
            continue
        }
        let randomNote = Math.floor(minNote + Math.random() * (maxNote-minNote))
        randomNotes.push(Tone.Frequency(randomNote, 'midi'))

        console.log(Tone.Frequency(randomNote, 'midi').toNote())
    }


    
    polySynth.triggerAttackRelease(randomNotes, 0.2)

    for(let randomIndex of randomIndices) {
        shapes[randomIndex].visible = true
    }

}

export function deactivate() {
    paper.project.clear()
    $(paper.view.element).hide()
}

export function render(event) {
    let time = (Date.now() - startTime) / 1000
    
    if(!center1 || !center2) {
        return
    }

    for(let i = 0 ; i<channels.length ; i++) {
        channels[i] = signals[i].value
    }

    // // Speaker

    // period = 1.0
    // let frequency = 1/period

    // for(let i = 0 ; i<circles.length ; i++) {

    //     let t = i/(circles.length-1)

    //     let amount = 0.1

    //     let sawInit = (t*0.2 + time*1) % period
    //     let saw = Math.max(0, sawInit / period - period * amount ) / ((1-amount)*period)
    //     saw = 1 - saw

    //     let width = 1+15.0*saw

    //     circles[i].strokeWidth = width
    // }

    // // Two lovers

    period = Math.pow(10, -1 + channels[0] * 3.0)
    let frequency = 1 / period

    cp.children[0].position.x = center1.x + currentRadius*0.5 * Math.cos(2*Math.PI*frequency*time)
    cp.children[0].position.y = center1.y + currentRadius*0.5 * Math.sin(2*Math.PI*frequency*time)

    period *= 0.9
    frequency = 1 / period

    cp.children[1].position.x = center2.x + currentRadius*0.5 * Math.cos(Math.PI+2*Math.PI*frequency*time)
    cp.children[1].position.y = center2.y + currentRadius*0.5 * Math.sin(Math.PI+2*Math.PI*frequency*time)
}

function drawChord() {

}

export function noteOn(event) {
    let data = event.detail
    let note = data.note.number % 12

}

export function noteOff(event) {
    let data = event.detail
    let note = data.note.number % 12
    let index = currentNotes.indexOf(note)
    // currentNotes.splice(index, 1)
}

export async function controlchange(e) {
    let signalIndex = e.controller.number - 14
    if(signalIndex >= 0 && signalIndex < signals.length) {
        signals[signalIndex].linearRampTo(e.data[2]/128.0, 1.5)
    }
}

export function mouseMove(event) {
}

export function keyDown(event) {
    if(event.key == ' ') {
        pause = !pause
    }
}