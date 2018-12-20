import { channels } from '../shaders.js'

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
let gain = null

let startTime = 0
let maxTime = 60
let pause = false

// let channels = []
// let signals = []

// for(let i=0 ; i<9 ; i++) {
//     let signal = new Tone.Signal(0)
//     signals.push(signal)
//     channels.push(signal.value)
// }

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
			value: oscillator.modulationIndex.value,
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

let filterInitialQ = 2
let oscillatorInitialFrequency = Tone.Frequency(100)
let oscillatorInitialHarmonicity = 0.01
let oscillatorInitialModulationIndex = 2

export async function initialize() {
	
	oscillator1 = new Tone.OmniOscillator(oscillatorInitialFrequency, 'fmsine')
	oscillator2 = new Tone.OmniOscillator(oscillatorInitialFrequency, 'fmsine')
	
	oscillator1.harmonicity.value = oscillatorInitialHarmonicity
	oscillator2.harmonicity.value = oscillatorInitialHarmonicity
	oscillator1.modulationIndex.value = oscillatorInitialModulationIndex
	oscillator2.modulationIndex.value = oscillatorInitialModulationIndex

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

	filter3 = new Tone.Filter('C4', 'lowpass')

	// let lfo = new Tone.LFO(0.1, Tone.Frequency('C1'), Tone.Frequency('C3'))
	// lfo.connect(filter3.frequency)
	// lfo.start()
	
	let reverb = new Tone.JCReverb(0.4);
	let delay = new Tone.FeedbackDelay(0.55);
// 	var phaser = new Tone.Phaser({
// 	"frequency" : 15,
// 	"octaves" : 5,
// 	"baseFrequency" : 1000
// });
	// distortion = new Tone.Distortion(0.8);
	gain = new Tone.Gain()
	gain.gain.value = -6


	oscillator1.connect(amplitudeEnvelope)
	oscillator2.connect(amplitudeEnvelope)
	// noise.connect(filter1)
	// noise.connect(filter2)
	// filter1.connect(amplitudeEnvelope)
	// filter2.connect(amplitudeEnvelope)
	// filter3.connect(amplitudeEnvelope)
	// amplitudeEnvelope.chain(filter3, delay, reverb, gain, Tone.Master)
	amplitudeEnvelope.chain(delay, reverb, filter3, gain, Tone.Master)
	
	nodes.push(oscillator1)
	nodes.push(oscillator2)
	nodes.push(amplitudeEnvelope)
	nodes.push(filter1)
	nodes.push(filter2)
}

export function activate() {
	initialize()
	noteOn()

	Tone.Master.volume.value = -10
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
	
	// for(let i = 0 ; i<channels.length ; i++) {
 //        channels[i] = signals[i].value
 //    }

	if(pause) {
		return
	}

	let time = Tone.context.now()
	let percent = (time - startTime) / maxTime

	oscillators[0].harmonicity.value = Math.pow(10, -3.0 + 5.0 * channels[0])
	oscillators[1].harmonicity.value = Math.pow(10, -3.0 + 5.0 * channels[1])

	oscillators[0].modulationIndex.value = 5.0 * channels[2]
	oscillators[1].modulationIndex.value = 5.0 * channels[3]

	// filter3.Q.value = Math.pow(10, -3.0 + 5.0 * channels[4]
	// filter3.frequency.value = Tone.Frequency(20+100*channels[6], 'midi').toFrequency()

	// // oscillators[0].frequency.value = oscillatorInitialFrequency.toFrequency() + channels[1] / 128.0
	// // oscillators[1].frequency.value = oscillatorInitialFrequency.toFrequency() - channels[1] / 128.0

	// let deltaQ = -3
	// let q = Math.pow(10, filterInitialQ + deltaQ * channels[7])

	// filter1.Q.value = q
	// filter2.Q.value = q

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
	// let signalIndex = e.controller.number - 2
	// console.log('signalIndex:', signalIndex)
 //    if(signalIndex >= 0 && signalIndex < signals.length) {
 //        signals[signalIndex].linearRampTo(e.data[2], 1.5)
 //    }



    // if(signalIndex==4) {
    // 	console.log(filter3.frequency.value)
    // }
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

// import { channels } from '../shaders.js'
// import { renderer } from '../three-scene.js'

// let intervalID = null

// let oscillators = []
// let note = null
// let initialized = false
// let indexToFrequency = []
// let sampleDuration = 0.1
// let widthRatio = 1.0

// var pixels = null

// export async function initialize(shaderName) {

// 	let width = window.innerWidth
// 	let height = window.innerHeight
// 	let minNote = Tone.Frequency('C2').toMidi()
// 	let maxNote = Tone.Frequency('C5').toMidi()

// 	for(let i=0 ; i<height ; i++) {
// 		let frequency = Tone.Frequency(minNote + (maxNote-minNote) * i / height, "midi").toFrequency()
// 		indexToFrequency.push(frequency)
// 		// var oscillator = new Tone.Oscillator(frequency, "sine").toMaster();
// 		// oscillator.volume.value = -100;
// 		// oscillators.push(oscillator)
// 	}

// 	note = new Tone.Oscillator(440, "sine").toMaster()
// 	note.volume.value = 4

// 	pixels = new Uint8Array(widthRatio * (width / 2) * (height / 2) * 4)

// 	initialized = true
// }

// export function activate(shaderName) {
// 	if(!initialized) {
// 		initialize()
// 	}
// 	intervalID = setInterval(noteOn, 0.25*1000)
// }

// export function deactivate() {
// 	clearInterval(intervalID)
// }

// export function render() {


// }

// export function resize() {


// };

// let frameIndex = 0

// export function noteOn(event) {
// 	frameIndex++
// 	if(frameIndex>=10) {
// 		frameIndex = 0
// 	}
// 	// let noteNumber = event.detail.note.number
// 	// note.frequency.value = Tone.Frequency(noteNumber, "midi").toFrequency()
// 	// note.start()

// 	// let width = window.innerWidth
// 	// let height = window.innerHeight
	
// 	// let minVolume = -50
// 	// let maxVolume = 50

// 	// for(let i=0 ; i<height/4 ; i++) {

// 	// 	let r = new THREE.Vector2(width, height / 2)
// 	// 	let p = new THREE.Vector2(0, 2*i/(height/4))

// 	// 	let scale = 25.0 * (channels[4] / 128.0) / r.y

// 	// 	let q = new THREE.Vector2(scale * ( 2 * p.x - r.x ), scale * ( 2 * p.y - r.y ))

// 	// 	let x = channels[0] / 128.0;
// 	// 	let y = channels[1] / 128.0;
// 	// 	let amplitude = 0

// 	// 	for(let n=0 ; n<channels[2] ; n++) {

// 	// 		let lq = q.lengthSq()
// 	// 		let qxy = q.x * q.y

// 	// 		if(channels[5] <= 1.0) {
// 	// 			q.x = Math.abs(q.x) / lq - x;
// 	// 			q.y = Math.abs(q.y) / lq - y;
// 	// 		} else if(channels[5] <= 2.0) {
// 	// 			q.x = Math.abs(q.x) / qxy - x;
// 	// 			q.y = Math.abs(q.y) / qxy - y;
// 	// 		} else if(channels[5] <= 3.0) {
// 	// 			let modulo = n % 3
				
// 	// 			if(n % 3 > 0) {
// 	// 				q.x = Math.abs(q.x) / lq - x;
// 	// 				q.y = Math.abs(q.y) / lq - y;
// 	// 			} else {
// 	// 				q.x = Math.abs(q.x) / qxy - x;
// 	// 				q.y = Math.abs(q.y) / qxy - y;
// 	// 			}
// 	// 		}

// 	// 		amplitude += q.length() / (1000.0 * channels[3] / 128.0)
// 	// 	}
// 	// 	console.log(amplitude)
// 	// 	oscillators[i].volume.value = minVolume + (maxVolume - minVolume) * Math.min(amplitude, 1)
// 	// 	oscillators[i].start()
// 	// }






// 	let width = renderer.context.drawingBufferWidth
// 	let height = renderer.context.drawingBufferHeight

// 	let sampleWidth = Math.floor(widthRatio * width / 2)
// 	let sampleHeight = Math.floor(height / 2)

// 	let gl = renderer.context
	
// 	// var imageData = renderer.context.getImageData(width/2, Math.floor(height / 2), 1, Math.floor(height / 2))
// 	if(frameIndex == 0) {
// 		renderer.context.readPixels(Math.floor(width/2), Math.floor(height/2), sampleWidth, sampleHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
// 	}
	

// 	let audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 	let sampleRate = 8000
// 	let arrayBuffer = audioContext.createBuffer(1, sampleRate * sampleDuration, sampleRate)

// 	// for(let n = 0 ; n < height / 2 ; n++) {
// 	// 	let value = pixels[4*n] / 255
// 	// 	console.log(value)
// 	// }

// 	var buffer0 = arrayBuffer.getChannelData(0);

// 	// let nSteps = Math.floor(height / 10)
// 	let nSteps = 50

// 	let freqs = []
// 	for (var i = 0; i < arrayBuffer.length ; i++) {
// 		let t = frameIndex * sampleDuration + sampleDuration * i / arrayBuffer.length
// 		let x = Math.floor(t * sampleWidth)
// 		let signal = 0
		
// 		for(let n = 0 ; n < nSteps ; n++) {
// 			let y = Math.floor(sampleHeight * n / nSteps)
// 			let index = y * sampleWidth + x
// 			let value = pixels[Math.floor(4*index+0)] / 255

// 			// let f = indexToFrequency[Math.floor(height * n / nSteps)]
// 			let f = indexToFrequency[Math.min(Math.floor(height * (1.0-value)), indexToFrequency.length-1)]

// 			signal += value * Math.sin(2*Math.PI*f*t)
			
// 			// if(i == Math.floor(arrayBuffer.length/2)) {
// 			// 	freqs.push({freq:f, value: value})
// 			// }
// 		}

// 		signal *= 1.0 * channels[8] / 127.0
// 		buffer0[i] = signal

// 		// freqs.push({freq:f, value: value, signal: signal})
// 	}

// 	// console.log(freqs)

// 	// Get an AudioBufferSourceNode.
// 	// This is the AudioNode to use when we want to play an AudioBuffer
// 	var source = audioContext.createBufferSource();

// 	// set the buffer in the AudioBufferSourceNode
// 	source.buffer = arrayBuffer;

// 	// connect the AudioBufferSourceNode to the
// 	// destination so we can hear the sound
// 	source.connect(audioContext.destination);

// 	// start the source playing
// 	source.start();



// }

// export function noteOff(event) {

// }

// export async function controlchange(e) {
	
// }

