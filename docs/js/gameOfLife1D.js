var canvas = document.getElementById('canvas');
paper.setup(canvas);

let parameters = {
    nCells: 88
}

let noteMin = 21
let noteMax = 108
let noteNumber = 88

let cells = []
let n = 0

let rules = {
    '000': 1,
    '001': 1,
    '010': 1,
    '011': 0,
    '100': 0,
    '101': 0,
    '110': 0,
    '111': 1,
}

for(let i=0 ; i<parameters.nCells ; i++ ) {
    cells.push(0)
}

let rectangles = []

addCell = (i)=> {
    let size = paper.view.size.width / parameters.nCells
    let topLeft = paper.view.bounds.topLeft.add(paper.view.size.width * i / parameters.nCells, n*size)
    let bottomRight = topLeft.add(size)
    let rectangle = new paper.Path.Rectangle(topLeft, bottomRight)
    rectangle.fillColor = 'white'
    rectangles.push(rectangle)

    
}

let bg = new paper.Path.Rectangle(paper.view.bounds.topLeft, paper.view.bounds.bottomRight)
bg.fillColor = 'black'

paper.view.onFrame = function(event) {
    if(n>0 && n<100) {
        let cellsString = '' + cells[cells.length-1] + cells.join('') + cells[0]
        for(let i=0 ; i<parameters.nCells ; i++) {
            let pattern = cellsString.substr(i, 3)
            cells[i] = rules[pattern]
            if(cells[i]) {
                addCell(i)
            } else {

                let event = new CustomEvent('cell', { detail: 24+i })
                document.dispatchEvent(event)

            }
        }
        n++
    }
}

let noteOn = function(e) {
    for(let r of rectangles) {
        r.remove()
    }
    for(let i=0 ; i<parameters.nCells ; i++ ) {
        cells[i]=0
    }
    n = 1
    let i = Math.floor(parameters.nCells * (e.note.number - noteMin) / noteNumber)
    cells[i] = 1
    addCell(i)
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
