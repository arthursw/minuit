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
export let group = new paper.Group()

export let period = 0
export let synth = null
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

    cp = new paper.CompoundPath({
        children: shapes,
        fillColor: 'black',
        fillRule: 'evenodd'
    })

    group.addChild(cp)

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


    // // two lovers

    // cp = new paper.CompoundPath({
    //     children: [
    //         new paper.Path.Circle(center1, currentRadius),
    //         new paper.Path.Circle(center2, currentRadius),
    //         new paper.Path.Circle(paper.view.center, currentRadius/2.1),
    //         ],
    //     // children: circles,
    //     fillColor: 'black',
    //     fillRule: 'evenodd'
    // })


    startTime = Date.now()
    // setInterval(changeShape, 545)


    // setInterval(changeShape, 250)

    synth = new Tone.Sampler({
        'A#2': 'As2.mp3',
        'A#3': 'As3.mp3',
        'A2': 'A2.mp3',
        'A3': 'A3.mp3',
        'B2': 'B2.mp3',
        'B3': 'B3.mp3',
        'C#1': 'Cs1.mp3',
        'C#2': 'Cs2.mp3',
        'C1': 'C1.mp3',
        'C2': 'C2.mp3',
        'C3': 'C3.mp3',
        'D#1': 'Ds1.mp3',
        'D#2': 'Ds2.mp3',
        'D1': 'D1.mp3',
        'D2': 'D2.mp3',
        'E1': 'E1.mp3',
        'E2': 'E2.mp3',
        'F#1': 'Fs1.mp3',
        'F#2': 'Fs2.mp3',
        'F1': 'F1.mp3',
        'F2': 'F2.mp3',
        'G#1': 'Gs1.mp3',
        'G#2': 'Gs2.mp3',
        'G1': 'G1.mp3',
        'G2': 'G2.mp3'
    }, {
    'release' : 1,
    'baseUrl' : './drum/'}).toMaster();
}

let minNote = Tone.Frequency('C1').toMidi()
let maxNote = Tone.Frequency('C6').toMidi()

function changeShape(show) {


    if(show) {
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

        }


        
        // polySynth.triggerAttackRelease(randomNotes, 0.2)

        for(let randomIndex of randomIndices) {
            shapes[randomIndex].visible = true
        }
    }

}

export function noteOn(noteNumber, velocity, time, duration, show) {
    changeShape(show)
    synth.triggerAttackRelease(Tone.Frequency(noteNumber, 'midi'), duration, time, velocity)
}

export function noteOff(noteNumber, velocity, time, duration, show) {

    for(let shape of shapes) {
        shape.visible = false
    }
}

export function deactivate() {
    paper.project.clear()
    $(paper.view.element).hide()
}

export function removeNotes() {
    
    for(let shape of shapes) {
        shape.visible = false
    }
}

export function render(event) {
    // let time = (Date.now() - startTime) / 1000
    
    // if(!center1 || !center2) {
    //     return
    // }

    // for(let i = 0 ; i<channels.length ; i++) {
    //     channels[i] = signals[i].value
    // }

    // // // Speaker

    // // period = 1.0
    // // let frequency = 1/period

    // // for(let i = 0 ; i<circles.length ; i++) {

    // //     let t = i/(circles.length-1)

    // //     let amount = 0.1

    // //     let sawInit = (t*0.2 + time*1) % period
    // //     let saw = Math.max(0, sawInit / period - period * amount ) / ((1-amount)*period)
    // //     saw = 1 - saw

    // //     let width = 1+15.0*saw

    // //     circles[i].strokeWidth = width
    // // }

    // // // Two lovers

    // period = Math.pow(10, -1 + channels[0] * 3.0)
    // let frequency = 1 / period

    // cp.children[0].position.x = center1.x + currentRadius*0.5 * Math.cos(2*Math.PI*frequency*time)
    // cp.children[0].position.y = center1.y + currentRadius*0.5 * Math.sin(2*Math.PI*frequency*time)

    // period *= 0.9
    // frequency = 1 / period

    // cp.children[1].position.x = center2.x + currentRadius*0.5 * Math.cos(Math.PI+2*Math.PI*frequency*time)
    // cp.children[1].position.y = center2.y + currentRadius*0.5 * Math.sin(Math.PI+2*Math.PI*frequency*time)
}

function drawChord() {

}

export async function controlchange(e) {
    // let signalIndex = e.controller.number - 14
    // if(signalIndex >= 0 && signalIndex < signals.length) {
    //     signals[signalIndex].linearRampTo(e.data[2]/128.0, 1.5)
    // }
}

export function mouseMove(event) {
}

export function keyDown(event) {
    if(event.key == ' ') {
        pause = !pause
    }
}