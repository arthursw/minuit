let lfo = null
let oscillatorInitialFrequency = Tone.Frequency('G2')
let reverb = null
let delay = null
let filterInitialQ = 2
let oscillatorInitialSpread = 5
let oscillatorSpreadMin = 50

let oscillator1 = null
let oscillator2 = null
let oscillator3 = null
let amplitudeEnvelope = null
let feedbackDelay1 = null
let feedbackDelay2 = null
let filterEnvelope = null
let distortion = null
let filter = null
let filter1 = null
let filter2 = null
let filter3 = null

let oscillators = []
let chain = []
let nodes = []

let startTime = 0
let maxTime = 60
let pause = false

let channels = []
let signals = []

let player = null
let pitchShift = null
let stereoWidener = null
let stereoXFeedbackEffect = null
let vibrato = null
let phaser = null
let loop = null
// let fractalChangeLoop = null

// export let fractalNumber = 0

let noteMin = Tone.Frequency('A1').toMidi()
let noteMax = Tone.Frequency('C7').toMidi()

export function initializeFractal() {		
	// player = new Tone.GrainPlayer({
	// 		"url" : "./texture.mp3",
	// 		"loop" : true,
	// 		"grainSize" : 0.1,
	// 		"overlap" : 0.05,
	// 	}, ()=>{
	// 		player.start()
	// } ).toMaster()

	player = new Tone.Player("./texture2.mp3");
	player.autostart = true;
	player.loop = true;

	pitchShift = new Tone.PitchShift()
	stereoWidener = new Tone.StereoWidener()
	// stereoXFeedbackEffect = new Tone.StereoFeedbackEffect()
	vibrato = new Tone.Vibrato ( 1 , 0.1 )
	phaser = new Tone.Phaser({frequency: 2, stages: 10})

	filter = new Tone.Filter(500, "lowpass")
	filter.Q.value = 10
	// filter.gain.value = 10

	// stereoXFeedbackEffect.feedback.value = 0.5

	// player.chain(pitchShift, stereoWidener, stereoXFeedbackEffect, Tone.Master)
	player.chain(pitchShift, vibrato, phaser, Tone.Master)

	loop = new Tone.Loop(randomPitch, 1000).start(0)

	// fractalChangeLoop = new Tone.Loop(changeFractal, 13.0310).start(0)
	Tone.Transport.start()
}

function randomPitch() {
	pitchShift.pitch = Math.random() * 18
}

// function changeFractal() {
// 	fractalNumber++
// }

export function deactivateFractal() {

	player.dispose()
}

export function render() {

}

export function controlchangeFractal(index, type, value) {
	
	if(type == 'slider') {
		if(index == 0) {
			player.playbackRate = value
			// fractalChangeLoop.interval = 13.0310 * value
			pitchShift.pitch = (1-value) * 18
		}
		if(index == 1) {
			stereoWidener.width.value = value
		}
		if(index == 2) {
			phaser.baseFrequency = Tone.Frequency(noteMin + (noteMax - noteMin) * value, 'midi').toFrequency()
		}
		if(index == 3) {
			phaser.octave = value * 8
		}
		if(index == 4) {
			phaser.Q.value = 5 + 100 * Math.pow(value, 3)
		}
		if(index == 5) {
			pitchShift.wet.value = value
		}

		if(index == 6) {
			loop.interval = 0.05 + Math.pow(value, 3) * 10
		}

		if(index == 7) {
			vibrato.frequency.value = 0.05 + Math.pow(value, 3) * 10
		}
		if(index == 8) {
			vibrato.depth.value = 0.05 + Math.pow(value, 3) * 10
		}
	}
	if(type == 'button-bottom') {
		if(value > 0.5) {
			if(index == 0) {
				player.volume.value = -20
				player.volume.rampTo(0, 0.25)
				player.seek(6.0)
			}
			if(index == 1) {
				
			}
			if(index == 3) {
				player.reverse = !player.reverse
			}
		}
	}
}

