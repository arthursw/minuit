var canvas = document.getElementById('canvas');
paper.setup(canvas);

let parameters = {
    circleSize: 50,
    circleStrokeWidth: 6
}

let noteMin = 21
let noteMax = 108
let noteNumber = 88

let circles = []

paper.view.onFrame = function(event) {
    for(let circle of circles) {
        circle.scale(1.01)
    }
}
let noteOn = function(e) {
    let circle = new paper.Path.Circle(paper.view.bounds.leftCenter.add(paper.view.size.width * ((e.note.number - noteMin) / noteNumber), 0), e.velocity * parameters.circleSize)
    circle.strokeColor = 'black'
    circle.strokeWidth = e.velocity * parameters.circleStrokeWidth
    circle.data.noteNumber = e.note.number
    circles.push(circle)

    setTimeout(()=> circle.remove(), 5000)
}

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

        if(WebMidi.inputs.length > 0) {
            // var kbd = WebMidi.getInputByName("Axiom Pro 25");
            var kbd = WebMidi.inputs[0];
            // var toSynth = WebMidi.getOutputByName("MIDI Monitor");

            kbd.addListener('noteon', "all", function (e) {
                console.log(e);
                noteOn(e);
                // toSynth.playNote(e.note.number, 8);
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
