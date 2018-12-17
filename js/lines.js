
let parameters = {
    circleSize: 3,
    // circleStrokeWidth: 6
    pathWidth: 1,
    distMax: 200
}

let noteMin = 21
let noteMax = 108
let noteNumber = 88

let circles = []
let lastCircles = []

export let synth = new Tone.PluckSynth().toMaster();

export let group = null

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
    for(let i=0 ; i<circles.length ; i++) {
        let circle = circles[i];
        circle.position.y -= circle.data.speed
        if(circle.data.segment != null) {
            circle.data.segment.point.y -= circle.data.speed
        }
        circle.data.speed *= 1.02
        if(circle.position.y < paper.view.bounds.top - 300) {
            if(circle.data.segment != null) {
                circle.data.path.removeSegment(circle.data.segment.index)
                if(circle.data.path.segments.length == 0) {
                    circle.data.path.remove()
                }
            }
            circle.remove()
            circles.splice(i, 1)
            i--
        }
    }
}

export function noteOn(noteNumberOrEvent, velocity, time, duration, show) {

    let data = noteNumberOrEvent.detail
    let noteNumber = data ? data.note.number : noteNumberOrEvent
    velocity = data ? data.velocity : velocity

    let circle = new paper.Path.Circle(paper.view.bounds.bottomLeft.add(
        paper.view.size.width * ((noteNumber - noteMin) / noteNumber), 0), parameters.circleSize)
    circle.fillColor = 'black'
    // circle.strokeWidth = e.velocity * parameters.circleStrokeWidth
    circle.data.noteNumber = noteNumber
    
    circle.data = { speed: 2, path: null, segment: null}
    group.addChild(circle)

    let minDistance = parameters.distMax * parameters.distMax
    let closestCircle = null

    for(let c of circles) {
        let distance = circle.position.getDistance(c.position, true)
        // console.log(distance)
        if(distance < minDistance) {
            minDistance = distance
            closestCircle = c
            // console.log("min: " + distance + ", closestCircle: " + c.position)
        }
    }
    circles.push(circle)
    if(closestCircle != null) {
        if(closestCircle.data.path != null) {
            let i = closestCircle.data.segment.index
            closestCircle.data.path.insert(i, circle.position)
            circle.data.segment = closestCircle.data.path.segments[i]
            circle.data.path = closestCircle.data.path
        } else {
            closestCircle.data.path = new paper.Path()
            closestCircle.data.path.strokeColor = 'black'
            closestCircle.data.path.strokeWidth = parameters.pathWidth
            closestCircle.data.path.add(closestCircle.position)
            closestCircle.data.segment = closestCircle.data.path.lastSegment
            closestCircle.data.path.add(circle.position)
            circle.data.path = closestCircle.data.path
            circle.data.segment = closestCircle.data.path.lastSegment
            group.addChild(closestCircle.data.path)
        }
    }
    synth.triggerAttackRelease(Tone.Frequency(noteNumber, 'midi').toNote(), duration, time, velocity)
}

export function noteOff(event) {

}
// document.addEventListener('keydown', function(e) {
//     noteOn({note: { number: e.which} })
// }, false)


/*

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function superPlay(chord){
    var octave = getRandomInt(3) + 3;
    var note = (chord[getRandomInt(chord.length)]);
    if(getRandomInt(3) == 0)
        WebMidi.outputs[1].playNote((note +  octave));
}


setInterval(superPlay, 200, "CEG");


// for (const [i, value] of ['C', 'E', 'G'].entries()) {

for (const [i, value] of "CEGFEGAAAFFAA".split("").entries()) {
    WebMidi.outputs[1].playNote((value +  i));
    //WebMidi.outputs[1].playNote((i+64));
    //WebMidi.outputs[1].playNote((3*i+64));
    //WebMidi.outputs[1].playNote((5*i+64));

    }
*/


