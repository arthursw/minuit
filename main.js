var canvas = document.getElementById('canvas');
paper.setup(canvas);

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

paper.view.onFrame = function(event) {
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

let noteOn = function(e) {

    let circle = new paper.Path.Circle(paper.view.bounds.bottomLeft.add(
        paper.view.size.width * ((e.note.number - noteMin) / noteNumber), 0), parameters.circleSize)
    circle.fillColor = 'black'
    // circle.strokeWidth = e.velocity * parameters.circleStrokeWidth
    circle.data.noteNumber = e.note.number
    
    circle.data = { speed: 2, path: null, segment: null}
    
    let minDistance = parameters.distMax * parameters.distMax
    let closestCircle = null

    for(let c of circles) {
        let distance = circle.position.getDistance(c.position, true)
        console.log(distance)
        if(distance < minDistance) {
            minDistance = distance
            closestCircle = c
            console.log("min: " + distance + ", closestCircle: " + c.position)
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
        }
    }
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

document.addEventListener("DOMContentLoaded", function () {

    WebMidi.enable(function(err) {

        if (err) {
            throw "WebMidi couldn't be enabled: ";
        }

        console.log(WebMidi.inputs);
        console.log(WebMidi.outputs);

        // WebMidi.inputs.forEach(function (input) {
        //   input.addListener("noteon", function (e) {
        //     console.log(e);
        //   })
        // });

        // var kbd = WebMidi.getInputByName("Axiom Pro 25");

        if(WebMidi.inputs.length > 0) {

            var kbd = WebMidi.inputs[0];

            
            // var toSynth = WebMidi.getOutputByName("MIDI Monitor");

            kbd.addListener('noteon', "all", function (e) {
                console.log(e);
                // toSynth.playNote(e.note.number, 8);
                noteOn(e);
            });

            kbd.addListener('noteoff', "all", function (e) {
                console.log(e);
                // toSynth.stopNote(e.note.number, 8);
                // let findNote = (circle)=> {
                //     return circle.data.noteNumber == e.note.number
                // }
                // let circleIndex = circles.findIndex(findNote)
                // if(circleIndex >= 0) {
                //     circles[circleIndex].remove()
                //     circles.splice(circleIndex, 1)
                // }
            });

        }

    })

});
