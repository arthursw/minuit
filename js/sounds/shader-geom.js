
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
let reverb = null

let oscillators = []
let chain = []
let nodes = []

let startTime = 0
let maxTime = 60
let pause = false

let channels = []
let signals = []

for(let i=0 ; i<9 ; i++) {
    let signal = new Tone.Signal(0)
    signals.push(signal)
    channels.push(signal.value)
}

function createGuiToggleButton(folder, parameters, node) {

	parameters['on'] = false

	folder.add(parameters, 'on').onChange((value)=> {
		for(let item of chain) {
			if(item.node == node && item.on != value) {
				item.on = !item.on
				reconnectChain()
				break
			}
		}
	})
}

function createGuiFromDescription(folder, parametersDescription, parameters, controllers, node, createToggleButton) {

	for(let name in parametersDescription) {
		parameters[name] = parametersDescription[name].value ? parametersDescription[name].value : 0
		
		let parameter1 = parametersDescription[name].options ? parametersDescription[name].options : parametersDescription[name].min
		let parameter2 = parametersDescription[name].max
		let parameter3 = parametersDescription[name].step ? parametersDescription[name].step : 0.1
		let log = parametersDescription[name].log
		let reset = parametersDescription[name].reset
		let parameterName = parametersDescription[name].name ? parametersDescription[name].name : name

		let onChange = parametersDescription[name].onChange ? parametersDescription[name].onChange : (value)=> {
			if(node[name]) {
				if(node[name] instanceof Tone.Signal) {
					node[name].value = log ? Math.pow(10, value) : value
					console.log(node[name].value)
				} else {
					node[name] = log ? Math.pow(10, value) : value
					console.log(node[name])
				}
				
				if(reset) {
					reset()
				}
			}
		}
		let onFinishChange = parametersDescription[name].onFinishChange ? parametersDescription[name].onFinishChange : ()=> document.activeElement.blur()
		controllers[name] = folder.add(parameters, name, parameter1, parameter2, parameter3).onChange(onChange).onFinishChange(onFinishChange).name(parameterName)
	}

	if(createToggleButton) {
		createGuiToggleButton(folder, parameters, node)
	}
}

let guis = []

function createGuiContainer(gui, name) {

	let customContainer = gui instanceof HTMLElement ? gui : document.getElementById('gui')

	gui = gui && gui instanceof dat.GUI ? gui : new dat.GUI({ autoPlace: false })

	if(guis.indexOf(gui) < 0) {
		guis.push(gui)
	}

	customContainer.appendChild(gui.domElement)

	let folder = gui.addFolder(name)
	folder.open()

	return folder
}

export function createOscillatorGUI(gui, oscillator, name) {

	let folder = createGuiContainer(gui, name)

	// count: The number of detuned oscillators
	// detune: The detune control in Cents: A cent is a hundredth of a semitone.
	// frequency: in Hz
	// harmonicity: Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
	//				A harmonicity of 1 gives both oscillators the same frequency. 
	// 				Harmonicity = 2 means a change of an octave. See Tone.AMOscillator or Tone.FMOscillator for more info.
	// modulationFrequency:  The modulationFrequency Signal of the oscillator 
	// 						 (only if the oscillator type is set to pwm). The modulation rate of the oscillator.
	// modulationType: The type of the modulator oscillator. Only if the oscillator is set to “am” or “fm” types.
	// partials: The partials of the waveform. A partial represents the amplitude at a harmonic. 
	// 			  The first harmonic is the fundamental frequency, the second is the octave and so on following the harmonic series. 
	// 				Setting this value will automatically set the type to “custom”. 
	// 				The value is an empty array when the type is not “custom”. This is not available on “pwm” and “pulse” oscillator types.
	// phase: The phase of the oscillator in degrees.
	// spread: The detune spread between the oscillators.
	//			If “count” is set to 3 oscillators and the “spread” is set to 40, the three oscillators would be detuned like this: 
	// 			[-20, 0, 20] for a total detune spread of 40 cents. See Tone.FatOscillator for more info.
	// type: The type of the oscillator. Can be any of the basic types: sine, square, triangle, sawtooth. 
	// 			Or prefix the basic types with “fm”, “am”, or “fat” to use the FMOscillator, AMOscillator or FatOscillator types. 
	// 			The oscillator could also be set to “pwm” or “pulse”. 
	// 			All of the parameters of the oscillator’s class are accessible when the oscillator is set to that type, 
	// 			but throws an error when it’s not.
	// width: The width of the oscillator (only if the oscillator is set to “pulse”)

	let parameters = {}
	let controllers = {}

	let parametersDescription = {
		type: {
			value: oscillator.type,
			options: ['sine', 'square', 'triangle', 'sawtooth', 'pwm', 'pulse'],
			onChange: (value)=> {
				oscillator.type = value
				controllers['modulation'].setValue('none')
				console.log(oscillator.type)
			},
			reset: true
		},
		frequency: {
			value: oscillator.frequency ? oscillator.frequency.value : 440,
			min: 1,
			max: 4,
			log: true,
		},
		detune: {
			value: oscillator.detune ? oscillator.detune.value : 0,
			min: 0.01,
			max: 1000,
		},
		modulation: {
			value: 'none',
			options: ['none', 'am', 'fm', 'fat'],
			onChange: (value)=> {
				let primitiveType = '' + oscillator.type
				primitiveType = primitiveType.replace('am', '')
				primitiveType = primitiveType.replace('fm', '')
				primitiveType = primitiveType.replace('fat', '')
				if(value == 'none') {
					oscillator.type = primitiveType
				} else {
					oscillator.type = value + primitiveType
				}
				console.log(oscillator.type)
			},
			reset: true,
		},
		modulationType: {
			value: oscillator.modulationType ? oscillator.modulationType : 'none',
			options: ['sine', 'square', 'triangle', 'sawtooth', 'pwm', 'pulse'],
			reset: ()=> {
				if(oscillator.count) {
					oscillator.count = parameters.count
				}
				if(oscillator.detune) {
					oscillator.detune.value = parameters.detune
				}
				if(oscillator.harmonicity) {
					oscillator.harmonicity.value = parameters.harmonicity
				}	
				if(oscillator.modulationFrequency) {
					oscillator.modulationFrequency.value = parameters.modulationFrequency
				}
				if(oscillator.partials) {
					// oscillator.partials = parameters.partials
				}
				if(oscillator.phase) {
					oscillator.phase = parameters.phase
				}
				if(oscillator.spread) {
					oscillator.spread = parameters.spread
				}
				if(oscillator.width) {
					oscillator.width.value = parameters.width
				}
			},
		},
		harmonicity: {
			value: oscillator.harmonicity ? oscillator.harmonicity.value : 0,
			min: -4,
			max: 4,
			log: true,
		},
		modulationIndex: {
			value: oscillator.modulationIndex,
			min: 0,
			max: 10,
		},
		modulationFrequency: {
			value: oscillator.modulationFrequency ? oscillator.modulationFrequency.value : 1,
			min: 1,
			max: 5,
			log: true,
			name: 'PWM freq.'
		},


		phase: {
			value: oscillator.phase,
			min: 0,
			max: 360,
		},
		count: {
			value: oscillator.count,
			min: 1,
			max: 10,
		},
		spread: {
			value: oscillator.spread,
			min: 0.1,
			max: 1000,
		},
		partials: {
			value: '[]',
			onChange: ()=> {},
			onFinishChange: (value)=> {
				let json = JSON.parse(value)
				oscillator.partials = json
				parameters.partials = json
				document.activeElement.blur()
			}
		},
		width: {
			value: oscillator.width ? oscillator.width.value : 0,
			min: 0,
			max: 1,
			name: 'Pulse width'
		}
	}

	createGuiFromDescription(folder, parametersDescription, parameters, controllers, oscillator, false)
	
}

export function createFilterGUI(gui, filter, name) {

	let folder = createGuiContainer(gui, name)
 	
 	// Q: The Q or Quality of the filter
	// detune: The detune parameter
	// frequency: The cutoff frequency of the filter.
	// gain: The gain of the filter, only used in certain filter types
	// rolloff: The rolloff of the filter which is the drop in db per octave. Implemented internally by cascading filters.
	// 			 Only accepts the values -12, -24, -48 and -96.
	// type: The type of the filter. Types: “lowpass”, “highpass”, “bandpass”, “lowshelf”, “highshelf”, “notch”, “allpass”, or “peaking”.

	let parameters = {}
	let controllers = {}

	let parametersDescription = {
		Q: {
			value: filter.Q.value,
			min: 0.01,
			max: 10,
		},
		detune: {
			value: filter.detune.value,
			min: 0.01,
			max: 1000,
		},
		frequency: {
			value: filter.frequency.value,
			min: 1,
			max: 4,
			log: true
		},
		gain: {
			value: filter.gain.value,
			min: -100,
			max: 100,
		},
		rolloff: {
			value: filter.rolloff,
			options: [-12, -24, -48, -96],
		},
		type: {
			value: filter.type,
			options: ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'notch', 'allpass', 'peaking'],
			onChange: (value)=> {
				filter.type = value
			},
			reset: ()=> {
				if(filter.Q) {
					filter.Q.value = parameters.Q
				}
				if(filter.frequency) {
					filter.frequency.value = parameters.frequency
				}
				if(filter.detune) {
					filter.detune.value = parameters.detune
				}	
				if(filter.rolloff) {
					filter.rolloff = parameters.rolloff
				}
				if(filter.gain) {
					filter.gain.value = parameters.gain
				}
			}
		}
	}
	
	createGuiFromDescription(folder, parametersDescription, parameters, controllers, filter, true)
}


export function createEnvelopeGUI(gui, envelope, name, createToggleButton, signal) {

	let folder = createGuiContainer(gui, name)
 	
 	// attack: When triggerAttack is called, the attack time is the amount of time it takes for the envelope to reach it’s maximum value.
	// attackCurve: The shape of the attack. Can be any of these strings: 
	// 				'linear', 'exponential', 'sine', 'cosine', 'bounce', 'ripple', 'step'
	// 				Can also be an array which describes the curve. 
	// 				Values in the array are evenly subdivided and linearly interpolated over the duration of the attack.
	// decay: After the attack portion of the envelope, the value will fall over the duration of the decay time to it’s sustain value.
	// release: After triggerRelease is called, the envelope’s value will fall to it’s miminum value over the duration of the release time.
	// releaseCurve: The shape of the release. See the attack curve types.
	// sustain: The sustain value is the value which the envelope rests at after triggerAttack is called, 
	// 			but before triggerRelease is invoked.

	let parameters = {}
	let controllers = {}

	let parametersDescription = {
		attack: {
			value: envelope.attack,
			min: 0.1,
			max: 10,
			step: 0.01
		},
		attackCurve: {
			value: envelope.attackCurve,
			options: ['linear', 'exponential', 'sine', 'cosine', 'bounce', 'ripple', 'step'],
		},
		decay: {
			value: envelope.decay,
			min: 0.1,
			max: 10,
			step: 0.01
		},
		release: {
			value: envelope.release,
			min: 0.1,
			max: 10,
			step: 0.01
		},
		releaseCurve: {
			value: envelope.releaseCurve,
			options: ['linear', 'exponential', 'sine', 'cosine', 'bounce', 'ripple', 'step'],
		},
		sustain: {
			value: envelope.sustain,
			min: 0.1,
			max: 1,
			step: 0.01
		}
	}
	if(envelope instanceof Tone.FrequencyEnvelope) {
		parametersDescription['baseFrequency'] = {
			value: envelope.baseFrequency,
			min: 1,
			max: 4,
			log: true,
		}
		parametersDescription['octaves'] = {
			value: envelope.octaves,
			min: 0,
			max: 10,
		}
		parametersDescription['exponent'] = {
			value: envelope.exponent,
			min: 1,
			max: 4,
		}
	}

	createGuiFromDescription(folder, parametersDescription, parameters, controllers, envelope, false)

	if(createToggleButton) {
		parameters['on'] = false

		folder.add(parameters, 'on').onChange((value)=> {
			if(!value) {
				envelope.disconnect(0)
			} else {
				envelope.connect(signal)
			}
		})
	}
}

function createFeedbackGUI(gui, feedback, name, createToggleButton, signal) {

	let folder = createGuiContainer(gui, name)
 	
	// delayTime: The delayTime of the DelayNode.
	// wet: The wet control is how much of the effected will pass through to the output. 1 = 100% effected signal, 0 = 100% dry signal.
	// feedback: The amount of signal which is fed back into the effect input.

	let parameters = {}
	let controllers = {}

	let parametersDescription = {
		delayTime: {
			value: feedback.delayTime.value,
			min: 0.01,
			max: 10,
			step: 0.1
		},
		wet: {
			value: feedback.wet.value,
			min: 0,
			max: 1,
			step: 0.01
		},
		feedback: {
			value: feedback.feedback.value,
			min: 0,
			max: 1,
			step: 0.01
		}
	}
	

	createGuiFromDescription(folder, parametersDescription, parameters, controllers, feedback, true)
}


function createDistortionGUI(gui, distortion, name, createToggleButton, signal) {

	let folder = createGuiContainer(gui, name)
 	
	// distortion: The amount of distortion.
	// wet: The wet control is how much of the effected will pass through to the output. 1 = 100% effected signal, 0 = 100% dry signal.
	// oversample: The oversampling of the effect. Can either be “none”, “2x” or “4x”.

	let parameters = {}
	let controllers = {}


	let parametersDescription = {
		distortion: {
			value: distortion.distortion,
			min: 0.01,
			max: 10,
			step: 0.1
		},
		wet: {
			value: distortion.wet.value,
			min: 0,
			max: 1,
			step: 0.01
		},
		oversample: {
			value: distortion.oversample,
			options: ['none', '2x', '4x'],
		}
	}
	
	createGuiFromDescription(folder, parametersDescription, parameters, controllers, distortion, true)

}

function createReverbGUI(gui, reverb, name, createToggleButton, signal) {

	let folder = createGuiContainer(gui, name)
 	
	// decay: The duration of the reverb
	// wet: The wet control is how much of the effected will pass through to the output. 1 = 100% effected signal, 0 = 100% dry signal.
	// preDelay: The amount of time before the reverb is fully ramped in.

	let parameters = {}
	let controllers = {}


	let parametersDescription = {
		decay: {
			value: reverb.decay,
			min: 0.01,
			max: 10,
			step: 0.1
		},
		wet: {
			value: reverb.wet.value,
			min: 0,
			max: 1,
			step: 0.01
		},
		preDelay: {
			value: reverb.preDelay,
			min: 0.01,
			max: 10,
			step: 0.1
		}
	}
	
	createGuiFromDescription(folder, parametersDescription, parameters, controllers, reverb, true)
}

function connectChain() {
	for(let i=0 ; i<chain.length ; i++) {
		if(!chain[i].on) {
			continue
		}
		let destination = {node: Tone.Master}
		for(let j=i+1 ; j<chain.length ; j++) {
			if(chain[j].on) {
				destination = chain[j]
				break
			}
		}
		chain[i].node.connect(destination.node)
	}

	// for(let i=0 ; i<chain.length ; i++) {
	// 	if(chain[i].on && chain[i].generate) {
	// 		chain[i].node.generate()
	// 	}
	// }
}

function reconnectChain() {
	for(let i=0 ; i<chain.length ; i++) {
		chain[i].node.disconnect()
	}
	connectChain()
}

function createHelm() {

	oscillator1 = new Tone.OmniOscillator('C2', 'sine')
	oscillator2 = new Tone.OmniOscillator('C2', 'sine')
	oscillator3 = new Tone.OmniOscillator('C1', 'pwm')

	oscillators.push(oscillator1)
	oscillators.push(oscillator2)
	oscillators.push(oscillator3)

	oscillator1.detune.value = 12*100
	oscillator2.detune.value = 5
	oscillator3.detune.value = 3

	amplitudeEnvelope = new Tone.AmplitudeEnvelope({
		"attack" : 2,
		"decay" : 1,
		"sustain" : 1,
		"release" : 3.6,
	})
	
	feedbackDelay1 = new Tone.FeedbackDelay()

	filter = new Tone.Filter(350, "lowpass");

	filter.Q.value = 25
	filter.gain.value = 1
	filter.detune.value = 1000

	filterEnvelope = new Tone.FrequencyEnvelope({
	 	"attack" : 1.0,
	 	"baseFrequency" : 200,
	 	"octaves" : 5
	 });

	distortion = new Tone.Distortion(0.01)
	distortion.oversample = 'none'

	feedbackDelay2 = new Tone.FeedbackDelay()

	reverb = new Tone.Reverb()

	// GUI

	let gui1 = document.getElementById('gui-1')
	let gui2 = document.getElementById('gui-2')

	createOscillatorGUI(gui1, oscillator1, 'Osc. 1')
	createOscillatorGUI(gui1, oscillator2, 'Osc. 2')
	createOscillatorGUI(gui1, oscillator3, 'Osc. 3')

	createEnvelopeGUI(gui1, amplitudeEnvelope, 'Amp. Envelope')

	createFeedbackGUI(gui1, feedbackDelay1, 'Feedback 1')

	createEnvelopeGUI(gui2, filterEnvelope, 'Filter Env.', true, filter.frequency)
	createFilterGUI(gui2, filter, 'Filter')

	createDistortionGUI(gui2, distortion, 'Distortion')

	createFeedbackGUI(gui2, feedbackDelay2, 'Feedback 2')

	createReverbGUI(gui2, reverb, 'Reverb')

	// connections

	oscillator1.connect(amplitudeEnvelope)
	oscillator2.connect(amplitudeEnvelope)
	oscillator3.connect(amplitudeEnvelope)

	filterEnvelope.connect(filter.frequency)

	chain.push({node: amplitudeEnvelope, on: true})
	chain.push({node: feedbackDelay1, on: false})
	chain.push({node: filter, on: false})
	chain.push({node: distortion, on: false})
	chain.push({node: feedbackDelay2, on: false})
	chain.push({node: reverb, on: true, generate: true})

	connectChain()

	reverb.generate()
	
	nodes.push(oscillator1)
	nodes.push(oscillator2)
	nodes.push(oscillator3)
	nodes.push(amplitudeEnvelope)
	nodes.push(feedbackDelay1)
	nodes.push(filterEnvelope)
	nodes.push(filter)
	nodes.push(distortion)
	nodes.push(feedbackDelay2)
	nodes.push(reverb)
}

let filterInitialQ = 2
let oscillatorInitialFrequency = Tone.Frequency(200)
let oscillatorInitialSpread = 5
let oscillatorSpreadMin = 50

export async function initialize() {
	
	oscillator1 = new Tone.OmniOscillator(oscillatorInitialFrequency, 'fatsawtooth')
	oscillator2 = new Tone.OmniOscillator(oscillatorInitialFrequency, 'fatsawtooth')
	
	oscillator1.count = 30
	oscillator2.count = 30
	oscillator1.spread = oscillatorInitialSpread
	oscillator2.spread = oscillatorInitialSpread

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
	
	filter1 = new Tone.Filter('C2', 'bandpass')

	filter1.Q.value = Math.pow(10, filterInitialQ)
	filter1.detune.value = 0

	filter2 = new Tone.Filter('C4', 'bandpass')

	filter2.Q.value = Math.pow(10, filterInitialQ)
	filter2.detune.value = 0

	filter3 = new Tone.Filter('C3', 'bandpass')

	// let lfo = new Tone.LFO(0.1, Tone.Frequency('C1'), Tone.Frequency('C3'))
	// lfo.connect(filter3.frequency)
	// lfo.start()
	
	let reverb = new Tone.JCReverb(0.4);
	let delay = new Tone.FeedbackDelay(0.5);


	// connections

	oscillator1.connect(amplitudeEnvelope)
	// oscillator2.connect(amplitudeEnvelope)
	noise.connect(filter1)
	noise.connect(filter2)
	filter1.connect(amplitudeEnvelope)
	filter2.connect(amplitudeEnvelope)
	// filter3.connect(amplitudeEnvelope)
	amplitudeEnvelope.chain(filter3, delay, reverb, Tone.Master)
	
	nodes.push(oscillator1)
	nodes.push(oscillator2)
	nodes.push(amplitudeEnvelope)
	nodes.push(filter1)
	nodes.push(filter2)
}

export function activate() {
	initialize()
	noteOn()
}

export function deactivate() {
	for(let gui of guis) {
		gui.destroy()
		$(gui.domElement).remove()
		console.log('deactivate')
	}
	guis = []
	for(let node of nodes) {
		node.dispose()
	}
	nodes = []
	oscillators = []
}

export function render() {
	
	for(let i = 0 ; i<channels.length ; i++) {
        channels[i] = signals[i].value
    }

	if(pause) {
		return
	}

	let time = Tone.context.now()
	let percent = (time - startTime) / maxTime

	oscillators[0].spread = Math.max(100*12*7 * channels[1] / 128.0, oscillatorSpreadMin)
	oscillators[1].spread = Math.max(100*12*7 * channels[2] / 128.0, oscillatorSpreadMin)
	
	if(time % 1.0 > 0.9) {
		console.log(oscillators[0].spread)
	}

	filter3.Q.value = Math.pow(10, -2.0 + 5.0 * channels[3] / 128.0)

	filter3.frequency.value = Tone.Frequency(20+100*channels[4] / 128.0, 'midi').toFrequency()

	// oscillators[0].frequency.value = oscillatorInitialFrequency.toFrequency() + channels[1] / 128.0
	// oscillators[1].frequency.value = oscillatorInitialFrequency.toFrequency() - channels[1] / 128.0

	let deltaQ = -3
	let q = Math.pow(10, filterInitialQ + deltaQ * channels[0] / 128.0)

	filter1.Q.value = q
	filter2.Q.value = q

}

export function resize() {
};

export function noteOn(event) {
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
}

export function noteOff(event) {
	let time = Tone.context.now() + amplitudeEnvelope.release

	for(let oscillator of oscillators) {
		oscillator.stop(time)
	}
	
	amplitudeEnvelope.triggerRelease(Tone.context.now());
}

export async function controlchange(e) {
	let signalIndex = e.controller.number - 2
    if(signalIndex >= 0 && signalIndex < signals.length) {
        signals[signalIndex].linearRampTo(e.data[2], 1.5)
    }
}

export function mouseMove(event) {
    let x = event.clientX / window.innerWidth
    startTime = Tone.context.now() - maxTime * x
    render()
}

export function keyDown(event) {
    if(event.key == ' ') {
        pause = !pause
    }
}