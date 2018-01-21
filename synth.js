var keyboard = new QwertyHancock({
     id: 'keyboard',
     width: 600,
     height: 150,
     octaves: 2
});

var context = new AudioContext(),
    masterVolume = context.createGain(),
    oscillators = {};

masterVolume.gain.value = 0.2;

masterVolume.connect(context.destination);

var getNumberOfNote = function (note) {
    var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
        key_number,
        octave;

    if (note.length === 3) {
        octave = note.charAt(2);
    } else {
        octave = note.charAt(1);
    }

    key_number = notes.indexOf(note.slice(0, -1));

    if (key_number < 3) {
        key_number = key_number + 12 + ((octave - 1) * 12) + 1;
    } else {
        key_number = key_number + ((octave - 1) * 12) + 1;
    }

    return key_number;
};

keyboard.keyDown = function (note, frequency) {
    var osc = context.createOscillator(),
        osc2 = context.createOscillator();

    osc.frequency.value = frequency;
    osc.type = 'sine';
    osc.detune.value = -10;

    osc2.frequency.value = frequency;
    osc2.type = 'triangle';
    osc2.detune.value = 10;

    osc.connect(masterVolume);
    osc2.connect(masterVolume);

    masterVolume.connect(context.destination);

    oscillators[frequency] = [osc, osc2];

    osc.start(context.currentTime);
    osc2.start(context.currentTime);


    noteOn({velocity: 1, note: {number: getNumberOfNote(note) }});
};

keyboard.keyUp = function (note, frequency) {
    oscillators[frequency].forEach(function (oscillator) {
        oscillator.stop(context.currentTime);
    });
};
