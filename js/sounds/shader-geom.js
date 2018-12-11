let oscillator1 = null
let oscillator2 = null
let oscillator3 = null
let amplitudeEnvelope = null
let feedbackDelay1 = null
let feedbackDelay2 = null
let filterEnvelope = null
let distortion = null
let filter = null
let reverb = null

let chain = []

export function createOscillatorGUI(gui, oscillator, name) {

	gui = gui ? gui : new dat.GUI({ autoPlace: false })
	
	let customContainer = document.getElementById('gui')
	customContainer.appendChild(gui.domElement)

	let folder = gui.addFolder(name)
	folder.open()

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

	let parametersDescription = {
		count: {
			value: oscillator.count,
			min: 1,
			max: 10,
		},
		detune: {
			value: oscillator.detune ? oscillator.detune.value : 0,
			min: 0.01,
			max: 1000,
		},
		frequency: {
			value: oscillator.frequency ? oscillator.frequency.value : 440,
			min: 20,
			max: 20000
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
		},
		modulationType: {
			value: oscillator.modulationType ? oscillator.modulationType : 'none',
			options: ['sine', 'square', 'triangle', 'sawtooth', 'pwm', 'pulse'],
			reset: true,
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
		phase: {
			value: oscillator.phase,
			min: 0,
			max: 360,
		},
		spread: {
			value: oscillator.spread,
			min: 0.1,
			max: 1000,
		},
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
		width: {
			value: oscillator.width ? oscillator.width.value : 0,
			min: 0,
			max: 1,
		}
	}
	
	let controllers = {}

	for(let name in parametersDescription) {
		parameters[name] = parametersDescription[name].value ? parametersDescription[name].value : 0
		
		let parameter1 = parametersDescription[name].options ? parametersDescription[name].options : parametersDescription[name].min
		let parameter2 = parametersDescription[name].max
		let parameter3 = parametersDescription[name].step ? parametersDescription[name].step : 0.1
		let log = parametersDescription[name].log
		let reset = parametersDescription[name].reset
		let onChange = parametersDescription[name].onChange ? parametersDescription[name].onChange : (value)=> {
			if(oscillator[name]) {
				if(oscillator[name] instanceof Tone.Signal) {
					oscillator[name].value = log ? Math.pow(10, value) : value
					console.log(oscillator[name].value)
				} else {
					oscillator[name] = log ? Math.pow(10, value) : value
					console.log(oscillator[name])
				}
				
				if(reset) {
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
				}
			}
		}
		let onFinishChange = parametersDescription[name].onFinishChange ? parametersDescription[name].onFinishChange : ()=> document.activeElement.blur()
		controllers[name] = folder.add(parameters, name, parameter1, parameter2, parameter3).onChange(onChange).onFinishChange(onFinishChange)
	}
}

export function createFilterGUI(gui, filter, name) {
	gui = gui ? gui : new dat.GUI({ autoPlace: false })

	let customContainer = document.getElementById('gui')
	customContainer.appendChild(gui.domElement)

	let folder = gui.addFolder(name)
	folder.open()
 	
 	// Q: The Q or Quality of the filter
	// detune: The detune parameter
	// frequency: The cutoff frequency of the filter.
	// gain: The gain of the filter, only used in certain filter types
	// rolloff: The rolloff of the filter which is the drop in db per octave. Implemented internally by cascading filters.
	// 			 Only accepts the values -12, -24, -48 and -96.
	// type: The type of the filter. Types: “lowpass”, “highpass”, “bandpass”, “lowshelf”, “highshelf”, “notch”, “allpass”, or “peaking”.

	let parameters = {}

	let parametersDescription = {
		Q: {
			value: filter.Q.value,
			min: 1,
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
			reset: true
		}
	}
	
	let controllers = {}

	for(let name in parametersDescription) {
		parameters[name] = parametersDescription[name].value | 0

		let parameter1 = parametersDescription[name].options ? parametersDescription[name].options : parametersDescription[name].min
		let parameter2 = parametersDescription[name].max
		let parameter3 = parametersDescription[name].step ? parametersDescription[name].step : 0.1
		let log = parametersDescription[name].log
		let reset = parametersDescription[name].reset
		let onChange = parametersDescription[name].onChange ? parametersDescription[name].onChange : (value)=> {
			if(filter[name]) {
				if(filter[name] instanceof Tone.Signal) {
					filter[name].value = log ? Math.pow(10, value) : value
					console.log(filter[name].value)
				} else {
					filter[name] = log ? Math.pow(10, value) : value
					console.log(filter[name])
				}
				
				if(reset) {
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
		let onFinishChange = parametersDescription[name].onFinishChange ? parametersDescription[name].onFinishChange : ()=> document.activeElement.blur()
		controllers[name] = folder.add(parameters, name, parameter1, parameter2, parameter3).onChange(onChange).onFinishChange(onFinishChange)
	}

	parameters['on'] = false

	folder.add(parameters, 'on').onChange((value)=> {
		for(let item of chain) {
			if(item.node == filter && item.on != value) {
				item.on = !item.on
				reconnectChain()
				break
			}
		}
	})
}


export function createEnvelopeGUI(gui, envelope, name, createToggleButton, signal) {
	gui = gui ? gui : new dat.GUI({ autoPlace: false })

	let customContainer = document.getElementById('gui')
	customContainer.appendChild(gui.domElement)
	
	let folder = gui.addFolder(name)
	folder.open()
 	
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
	
	let controllers = {}

	for(let name in parametersDescription) {
		parameters[name] = parametersDescription[name].value | 0

		let parameter1 = parametersDescription[name].options ? parametersDescription[name].options : parametersDescription[name].min
		let parameter2 = parametersDescription[name].max
		let parameter3 = parametersDescription[name].step ? parametersDescription[name].step : 0.1
		let log = parametersDescription[name].log
		let reset = parametersDescription[name].reset
		let onChange = parametersDescription[name].onChange ? parametersDescription[name].onChange : (value)=> {
			if(envelope[name]) {
				if(envelope[name] instanceof Tone.Signal) {
					envelope[name].value = log ? Math.pow(10, value) : value
					console.log(envelope[name].value)
				} else {
					envelope[name] = log ? Math.pow(10, value) : value
					console.log(envelope[name])
				}
			}
		}
		let onFinishChange = parametersDescription[name].onFinishChange ? parametersDescription[name].onFinishChange : ()=> document.activeElement.blur()
		controllers[name] = folder.add(parameters, name, parameter1, parameter2, parameter3).onChange(onChange).onFinishChange(onFinishChange)
	}

	if(createToggleButton) {
		parameters['on'] = false

		folder.add(parameters, 'on').onChange((value)=> {
			if(!value) {
				envelope.disconnect(signal)
			} else {
				envelope.connect(signal)
			}
		})
	}
}

function connectChain() {
	for(let i=0 ; i<chain.length ; i++) {
		let destination = {node: Tone.Master}
		for(let j=i+1 ; j<chain.length ; j++) {
			destination = chain[j]
			if(destination.on) {
				break
			}
		}
		chain[i].node.connect(destination.node)
	}
}

function reconnectChain() {
	for(let i=0 ; i<chain.length ; i++) {
		chain[i].node.disconnect()
	}
	connectChain()
}

export async function initialize() {
	
	oscillator1 = new Tone.OmniOscillator('C2', 'sine')
	oscillator2 = new Tone.OmniOscillator('C2', 'sine')
	oscillator3 = new Tone.OmniOscillator('C1', 'pwm')

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

	createOscillatorGUI(null, oscillator1, 'Osc. 1')
	createOscillatorGUI(null, oscillator2, 'Osc. 2')
	createOscillatorGUI(null, oscillator3, 'Osc. 3')

	createFilterGUI(null, filter, 'Filter')

	createEnvelopeGUI(null, amplitudeEnvelope, 'Amp. Envelope')
	createEnvelopeGUI(null, filterEnvelope, 'Filter Env.', true, filter.frequency)

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
	chain.push({node: reverb, on: false})

	connectChain()

	reverb.generate()
 	
}

export function activate() {
	initialize()
}

export function deactivate() {

}

export function render() {
}

export function resize() {
};

export function noteOn(event) {
	
	if(oscillator1.state == 'started') {
		oscillator1.restart()
	} else {
		oscillator1.start()
	}
	if(oscillator2.state == 'started') {
		oscillator2.restart()
	} else {
		oscillator2.start()
	}
	if(oscillator3.state == 'started') {
		oscillator3.restart()
	} else {
		oscillator3.start()
	}

	if (amplitudeEnvelope.sustain === 0){
		let time = Tone.context.now() + amplitudeEnvelope.attack + amplitudeEnvelope.decay
		oscillator1.stop(time)
		oscillator2.stop(time)
		oscillator3.stop(time)
	}

	amplitudeEnvelope.triggerAttack(Tone.context.now());
}

export function noteOff(event) {
	let time = Tone.context.now() + amplitudeEnvelope.release
	oscillator1.stop(time)
	oscillator2.stop(time)
	oscillator3.stop(time)

	amplitudeEnvelope.triggerRelease(Tone.context.now());
}

export async function controlchange(e) {

}

