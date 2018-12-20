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


export function initializeTexture() {

	oscillator1 = new Tone.OmniOscillator(oscillatorInitialFrequency, 'fatsine8')
	oscillator2 = new Tone.PWMOscillator ( 50, 0.01 )
	// oscillator2 = new Tone.OmniOscillator(oscillatorInitialFrequency, 'fatsine8')
	
	oscillator1.count = 2
	oscillator2.count = 3
	// oscillator1.spread = 500
	// oscillator2.spread = 500

	let noise = new Tone.Noise('white')

	oscillators.push(oscillator1)
	oscillators.push(oscillator2)
	oscillators.push(noise)

	amplitudeEnvelope = new Tone.AmplitudeEnvelope({
		"attack" : 2,
		"decay" : 1,
		"sustain" : 1,
		"release" : 3.6,
	})
	
	// filter1 = new Tone.AutoFilter(1, 600, 2.6)
	filter1 = new Tone.Filter('C2', 'lowpass')
	// filter1.Q.value = Math.pow(10, filterInitialQ)
	// filter1.detune.value = 0

	filter2 = new Tone.Filter('C2', 'lowpass')
	

	// filter2.Q.value = Math.pow(10, filterInitialQ)
	// filter2.detune.value = 0

	filter3 = new Tone.FeedbackCombFilter()// Tone.Filter('C3', 'lowpass')

	lfo = new Tone.LFO(1, 1000, 1100)
	// lfo.connect(oscillator1.detune)
	lfo.start()
	
	reverb = new Tone.JCReverb(0.4);
	delay = new Tone.FeedbackDelay(0.5);
	distortion = new Tone.Distortion();


	// connections

	oscillator1.connect(amplitudeEnvelope)
	// oscillator2.chain(filter1, amplitudeEnvelope)
	// noise.connect(filter1)
	// noise.connect(filter2)
	// filter1.connect(amplitudeEnvelope)
	// filter2.connect(amplitudeEnvelope)
	// filter3.connect(amplitudeEnvelope)
	amplitudeEnvelope.chain(filter1, filter2, Tone.Master)
	
	nodes.push(oscillator1)
	nodes.push(oscillator2)
	nodes.push(amplitudeEnvelope)
	nodes.push(filter1)
	nodes.push(filter2)


	amplitudeEnvelope.cancel()
	
	let time = Tone.context.now() + amplitudeEnvelope.attack + amplitudeEnvelope.decay
	
	for(let oscillator of oscillators) {
		if(oscillator.state == 'started') {
			oscillator.restart()
		} else {
			oscillator.start()
		}
		if (amplitudeEnvelope.sustain === 0){
			oscillator.stop(time)
		}
	}

	amplitudeEnvelope.triggerAttack(Tone.context.now());

	startTime = Tone.context.now()

	// oscillator1.frequency.rampTo(Tone.Frequency('G2'), 30)
}

export function deactivateTexture() {

	let time = Tone.context.now() + amplitudeEnvelope.release

	for(let oscillator of oscillators) {
		oscillator.stop(time)
	}
	
	amplitudeEnvelope.triggerRelease(Tone.context.now());

	reverb.dispose()
	for(let node of nodes) {
		node.disconnect()
		node.dispose()
	}

	nodes = []
	oscillators = []
}

export function render() {

}

export function controlchangeTexture(index, type, value) {
	
	if(type == 'slider') {
		if(index == 0) {
			// oscillator2.frequency.value = value * 100
			// oscillator1.detune.value = value * 100 + 20
			// oscillator2.detune.value = value * 40 + 20
			filter1.frequency.value = Math.pow(value, 1.75) * 1000
			filter2.frequency.value = Math.pow(value, 1.75) * 1000
		}
		if(index == 1) {
			// distortion.distortion = value * 20
			oscillator1.spread = Math.pow(value, 2) * 1000
			oscillator2.modulationFrequency.value = Math.pow(value, 1.75) * 0.1
			// oscillator2.spread = Math.pow(value, 2) * 1000
		}
		if(index == 2) {
			oscillator1.frequency.value = Math.pow(10, value*1.5) + 20
			// oscillator2.frequency.value = Math.pow(10, value*1.5) + 20
			// filter3.resonance.value = value
		}
	}
}

