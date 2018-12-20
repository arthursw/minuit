
let parameters = {
    strokeWidth: 4,
    patternSize: 60,
    margin: 40,
    notesPerChord: 6,
    strokeColor: 'black'
}


var loadFile, loadDataUri, Player;
var AudioContext = window.AudioContext || window.webkitAudioContext || false; 
var ac = new AudioContext || new webkitAudioContext;
var eventsDiv = document.getElementById('events');

export let synth = new Tone.MetalSynth().toMaster()

var changeTempo = function(tempo) {
    Player.tempo = tempo;
}

var play = function() {
    Player.play();
    // document.getElementById('play-button').innerHTML = 'Pause';
}

var pause = function() {
    Player.pause();
    // document.getElementById('play-button').innerHTML = 'Play';
}

var stop = function() {
    Player.stop();
    // document.getElementById('play-button').innerHTML = 'Play';
}

var buildTracksHtml = function() {
    Player.tracks.forEach(function(item, index) {
        var trackDiv = document.createElement('div');
        trackDiv.id = 'track-' + (index+1);
        var h5 = document.createElement('h5');
        h5.innerHTML = 'Track ' + (index+1);
        var code = document.createElement('code');
        trackDiv.appendChild(h5);
        trackDiv.appendChild(code);
        eventsDiv.appendChild(trackDiv);
    });
}

async function loadPlayer(instrument) {
    var mario = await import('./mario.js');

   // document.getElementById('loading').style.display = 'none';
    // document.getElementById('select-file').style.display = 'block';

    loadFile = function() {
        var file    = document.querySelector('input[type=file]').files[0];
        var reader  = new FileReader();
        if (file) reader.readAsArrayBuffer(file);

        eventsDiv.innerHTML = '';

        reader.addEventListener("load", function () {
            Player = new MidiPlayer.Player(function(event) {
                if (event.name == 'Note on') {
                    instrument.play(event.noteName, ac.currentTime, {gain:event.velocity/100});
                    //document.querySelector('#track-' + event.track + ' code').innerHTML = JSON.stringify(event);
                }

                // document.getElementById('tempo-display').innerHTML = Player.tempo;
                // document.getElementById('file-format-display').innerHTML = Player.format;
                // document.getElementById('play-bar').style.width = 100 - Player.getSongPercentRemaining() + '%';
            });

            Player.loadArrayBuffer(reader.result);

            // document.getElementById('play-button').removeAttribute('disabled');

            //buildTracksHtml();
            play();

        }, false);
    }

    loadDataUri = function(dataUri) {
        Player = new MidiPlayer.Player(function(event) {
            if (event.name == 'Note on' && event.velocity > 0) {
                instrument.play(event.noteName, ac.currentTime, {gain:event.velocity/100});
                //document.querySelector('#track-' + event.track + ' code').innerHTML = JSON.stringify(event);
                //console.log(event);

                if(event.noteNumber) {
                    noteOn({detail: {note: {number: event.noteNumber}}});
                }
            }

            // document.getElementById('tempo-display').innerHTML = Player.tempo;
            // document.getElementById('file-format-display').innerHTML = Player.format;   
            // document.getElementById('play-bar').style.width = 100 - Player.getSongPercentRemaining() + '%';
        });

        Player.loadDataUri(dataUri);

        // document.getElementById('play-button').removeAttribute('disabled');

        //buildTracksHtml();
        play();
    }



    // loadDataUri(mario.mario);
}

Soundfont.instrument(ac, 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite/acoustic_guitar_nylon-mp3.js').then(loadPlayer);

// transpose("C4", "3M");
// Scale.notes("Db major");


let noteToItem = null

let createNoteToItem = (center = new paper.Point(0, 0))=> {
    let strokeWidth = parameters.strokeWidth
    let strokeColor = parameters.strokeColor
    let patternSize = parameters.patternSize
    let halfPatternSize = 0.5 * patternSize
    let sixthPatternSize = patternSize / 6
    let thirdPatternSize = patternSize / 3

    let path1 = new paper.Path({
            segments: [ center.add(-halfPatternSize, halfPatternSize), 
                        center.add(-halfPatternSize, sixthPatternSize)],
            strokeColor: parameters.strokeColor,
            strokeWidth: parameters.strokeWidth
        })

    let path2 = new paper.Path({
            segments: [ center.add(-halfPatternSize, sixthPatternSize), 
                        center.add(-sixthPatternSize, sixthPatternSize)],
            strokeColor: parameters.strokeColor,
            strokeWidth: parameters.strokeWidth
        })


    // noteToItem = {
    //     0: path1.clone(),
    //     1: path2.clone(),
    //     2: path1.clone(),
    //     3: path2.clone(),
    //     4: path1.clone(),
    //     5: path2.clone(),
    //     6: path1.clone(),
    //     7: path2.clone(),
    //     8: path1.clone(),
    //     9: path2.clone(),
    //     10: path1.clone(),
    //     11: path2.clone(),
    // }

    // noteToItem[0].position = noteToItem[0].position.add(0, -thirdPatternSize)
    // noteToItem[1].position = noteToItem[1].position.add(0, -thirdPatternSize)
    // noteToItem[2].position = noteToItem[2].position.add(thirdPatternSize, -2*thirdPatternSize)
    // noteToItem[3].position = noteToItem[3].position.add(thirdPatternSize, -2*thirdPatternSize)
    // // noteToItem[4].position = noteToItem[4].position.add(0, thirdPatternSize)
    // // noteToItem[5].position = noteToItem[5].position.add(0, thirdPatternSize)
    // noteToItem[6].position = noteToItem[6].position.add(thirdPatternSize, -thirdPatternSize)
    // noteToItem[7].position = noteToItem[7].position.add(thirdPatternSize, -thirdPatternSize)
    // noteToItem[8].position = noteToItem[8].position.add(2*thirdPatternSize, -2*thirdPatternSize)
    // noteToItem[9].position = noteToItem[9].position.add(2*thirdPatternSize, -2*thirdPatternSize)
    // noteToItem[10].position = noteToItem[10].position.add(0, -2*thirdPatternSize)
    // noteToItem[11].position = noteToItem[11].position.add(0, -2*thirdPatternSize)

    noteToItem = {
        0: path1.clone(),
        1: path1.clone(),
        2: path1.clone(),
        3: path2.clone(),
        4: path2.clone(),
        5: path2.clone(),
        6: path1.clone(),
        7: path1.clone(),
        8: path2.clone(),
        9: path2.clone(),
        10: path1.clone(),
        11: path2.clone(),
    }

    noteToItem[0].position = noteToItem[0].position.add(0, 0)
    noteToItem[1].position = noteToItem[1].position.add(0, -thirdPatternSize)
    noteToItem[2].position = noteToItem[2].position.add(0, -2*thirdPatternSize)
    noteToItem[3].position = noteToItem[3].position.add(0, 0)
    noteToItem[4].position = noteToItem[4].position.add(0, -thirdPatternSize)
    noteToItem[5].position = noteToItem[5].position.add(0, -2*thirdPatternSize)
    noteToItem[6].position = noteToItem[6].position.add(thirdPatternSize, -thirdPatternSize)
    noteToItem[7].position = noteToItem[7].position.add(thirdPatternSize, -2*thirdPatternSize)
    noteToItem[8].position = noteToItem[8].position.add(thirdPatternSize, -thirdPatternSize)
    noteToItem[9].position = noteToItem[9].position.add(thirdPatternSize, -2*thirdPatternSize)
    noteToItem[10].position = noteToItem[10].position.add(2*thirdPatternSize, -2*thirdPatternSize)
    noteToItem[11].position = noteToItem[11].position.add(2*thirdPatternSize, -2*thirdPatternSize)

    for(let note in noteToItem) {
        noteToItem[note].visible = false
    }

    return noteToItem
}

let createNoteToItem2 = (center = new paper.Point(0, 0))=> {
    let strokeWidth = parameters.strokeWidth
    let strokeColor = parameters.strokeColor
    let patternSize = parameters.patternSize
    let halfPatternSize = 0.5 * patternSize
    let sixthPatternSize = patternSize / 6
    let thirdPatternSize = patternSize / 3

    let path1 = new paper.Path({
            segments: [ center.add(-halfPatternSize, sixthPatternSize), 
                        center.add(-halfPatternSize, halfPatternSize), 
                        center.add(-sixthPatternSize, halfPatternSize)],
            strokeColor: parameters.strokeColor,
            strokeWidth: parameters.strokeWidth
        })

    let path2 = new paper.Path({
            segments: [ center.add(-sixthPatternSize, halfPatternSize), 
                        center.add(-sixthPatternSize, sixthPatternSize), 
                        center.add(sixthPatternSize, sixthPatternSize), 
                        center.add(sixthPatternSize, halfPatternSize)],
            strokeColor: parameters.strokeColor,
            strokeWidth: parameters.strokeWidth
        })

    let path3 = new paper.Path({
            segments: [ center.add(-sixthPatternSize, halfPatternSize),
                        center.add(sixthPatternSize, halfPatternSize)],
            strokeColor: parameters.strokeColor,
            strokeWidth: parameters.strokeWidth
        })

    path1.pivot = center
    path2.pivot = center
    path3.pivot = center

    noteToItem = {
        0: path1,
        1: path2,
        2: path3,
        3: path1.clone().rotate(90),
        4: path2.clone().rotate(90),
        5: path3.clone().rotate(90),
        6: path1.clone().rotate(180),
        7: path2.clone().rotate(180),
        8: path3.clone().rotate(180),
        9: path1.clone().rotate(270),
        10: path2.clone().rotate(270),
        11: path3.clone().rotate(270),
    }

    for(let note in noteToItem) {
        noteToItem[note].visible = false
    }

    return noteToItem
}

createNoteToItem()

let noteMin = 21
let noteMax = 108
let noteNumber = 88
let currentPosition = new paper.Point(0, 0)

let currentNotes = []
let chords = new paper.Group()
let currentChord = new paper.Group()

export let group = null

export function activate() {
    // $(paper.view.element).show()
    // paper.project.clear()

    if(group == null) {
        group = new paper.Group()
    }
    group.addChild(chords)
    chords.addChild(currentChord)

    currentPosition = new paper.Point(0, 0)
}

export function deactivate() {
    // paper.project.clear()
    // $(paper.view.element).hide()
    if(group) {
        group.remove()
    }
    group = null
}

// export function activate() {
//     $(paper.view.element).show()
//     paper.project.clear()

//     let background = new paper.Path.Rectangle(paper.view.bounds)
//     background.fillColor = 'black'
//     paper.project.activeLayer.addChild(chords)
//     paper.project.activeLayer.addChild(currentChord)

// }

// export function deactivate() {
//     paper.project.clear()
//     $(paper.view.element).hide()
// }

export function render(event) {

}

function drawChord() {
    currentChord.removeChildren()
    let patternSize = parameters.patternSize
    let halfPatternSize = 0.5 * parameters.patternSize
    let backgroundRectangle = new paper.Rectangle(-halfPatternSize, -halfPatternSize, patternSize, patternSize)

    let background = new paper.Path.Rectangle(backgroundRectangle)
    // background.fillColor = 'blue'
    currentChord.addChild(background)
    for(let note of currentNotes) {
        let path = noteToItem[note].clone()
        path.visible = true
        currentChord.addChild(path)
    }
    // currentChord.pivot = currentChord.bounds.center
    let clone = currentChord.clone()
    let matrix = new paper.Matrix(0, -1, -1, 0, 0, 0)
    clone.transform(matrix)
    // // for(let path of clone.children) {
    // //     for(let segment of path.segments) {
    // //         let x = segment.point.x
    // //         segment.point.x = segment.point.y
    // //         segment.point.y = x
    // //     }
    // // }
    currentChord.addChild(clone)
    currentChord.rotate(90)
    currentChord.position = paper.view.bounds.center.add(0, -patternSize)
    let s1 = currentChord.clone().scale(-1, 1)//.translate(new paper.Point(patternSize, 0))
    s1.position = s1.position.add(patternSize, 0)
    let s2 = currentChord.clone().scale(-1, -1)//.translate(new paper.Point(patternSize, patternSize))
    s2.position = s2.position.add(patternSize, patternSize)
    let s3 = currentChord.clone().scale(1, -1)//.translate(new paper.Point(0, patternSize))
    s3.position = s3.position.add(0, patternSize)
    currentChord.addChild(s1)
    currentChord.addChild(s2)
    currentChord.addChild(s3)
}

let lastTimePlayedNote = Tone.now()
let chordDuration = Tone.Time('4n').toSeconds()

export function noteOn(noteNumberOrEvent, velocity, time, duration, show) {


    let data = noteNumberOrEvent.detail
    let noteNumber = data ? data.note.number : noteNumberOrEvent
    velocity = data ? data.velocity : velocity

    synth.frequency.value = Tone.Frequency(noteNumber, 'midi').toFrequency()
    synth.triggerAttackRelease(duration, time, velocity)


    let note = noteNumber % 12

    let now = Tone.now()

    let newChord = now - lastTimePlayedNote > chordDuration
    if(newChord) {
        currentNotes = []
        lastTimePlayedNote = now
    }

    currentNotes.push(note)
    drawChord()
    
    currentChord.position = currentPosition.add(parameters.patternSize + parameters.margin)
    chords.addChild(currentChord.clone())

    let totalPatternSize = 2 * parameters.patternSize + parameters.margin

    if(newChord) {
        currentNotes = []
        currentPosition.x += totalPatternSize
        if(currentPosition.x + totalPatternSize > paper.view.bounds.width) {
            currentPosition.x = 0
            currentPosition.y += totalPatternSize
            if(currentPosition.y + totalPatternSize > paper.view.bounds.height) {
                chords.removeChildren()
                currentPosition.x = 0
                currentPosition.y = 0
            }
        }
    }
}

export function noteOff(event) {
    // let data = event.detail
    // let note = data.note.number % 12
    // let index = currentNotes.indexOf(note)
    // currentNotes.splice(index, 1)
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

export function removeNotes() {
    chords.removeChildren()
}