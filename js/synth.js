let synth = null
let notes = []

import './synth/CustomSynth.js'

function triggerAttack(frequencies) {
	if(synth instanceof Tone.MonoSynth) {
		synth.triggerAttack(frequencies[0])
	} else {
		synth.triggerAttack(frequencies)
	}
}

function triggerRelease(frequencies) {
	if(synth instanceof Tone.MonoSynth) {
		synth.triggerRelease()
	} else {
		synth.triggerRelease(frequencies)
	}
}

function onKeyDown( event ) {

	if(notes.indexOf(event.key) >= 0) {
		return
	}
	notes.push(event.key)

    if(event.key == 'x') {
    	triggerAttack([32])
    } else if(event.key == 'q') {
    	triggerAttack(['C4'])
    } else if(event.key == 'z') {
    	triggerAttack(['C#4'])
    } else if(event.key == 's') {
    	triggerAttack(['D4'])
    } else if(event.key == 'e') {
    	triggerAttack(['D#4'])
    } else if(event.key == 'd') {
    	triggerAttack(['E4'])
    } else if(event.key == 'f') {
    	triggerAttack(['F4'])
    } else if(event.key == 't') {
    	triggerAttack(['F#4'])
    } else if(event.key == 'g') {
    	triggerAttack(['G4'])
    } else if(event.key == 'y') {
    	triggerAttack(['G#4'])
    } else if(event.key == 'h') {
    	triggerAttack(['A4'])
    } else if(event.key == 'u') {
    	triggerAttack(['A#4'])
    } else if(event.key == 'j') {
    	triggerAttack(['B4'])
    } else if(event.key == 'k') {
    	triggerAttack(['C5'])
    } else if(event.key == 'o') {
    	triggerAttack(['C#5'])
    } else if(event.key == 'l') {
    	triggerAttack(['D5'])
    } else if(event.key == 'p') {
    	triggerAttack(['D#5'])
    } else if(event.key == 'm') {
    	triggerAttack(['E5'])
    } else if(event.key == ' ') {
    	Tone.Master.volume.value = -100
    }
	
}

function onKeyUp( event ) {
	if(event.key == 'x') {
    	triggerRelease([32])
    } else if(event.key == 'q') {
    	triggerRelease(['C4'])
    } else if(event.key == 'z') {
    	triggerRelease(['C#4'])
    } else if(event.key == 's') {
    	triggerRelease(['D4'])
    } else if(event.key == 'e') {
    	triggerRelease(['D#4'])
    } else if(event.key == 'd') {
    	triggerRelease(['E4'])
    } else if(event.key == 'f') {
    	triggerRelease(['F4'])
    } else if(event.key == 't') {
    	triggerRelease(['F#4'])
    } else if(event.key == 'g') {
    	triggerRelease(['G4'])
    } else if(event.key == 'y') {
    	triggerRelease(['G#4'])
    } else if(event.key == 'h') {
    	triggerRelease(['A4'])
    } else if(event.key == 'u') {
    	triggerRelease(['A#4'])
    } else if(event.key == 'j') {
    	triggerRelease(['B4'])
    } else if(event.key == 'k') {
    	triggerRelease(['C5'])
    } else if(event.key == 'o') {
    	triggerRelease(['C#5'])
    } else if(event.key == 'l') {
    	triggerRelease(['D5'])
    } else if(event.key == 'p') {
    	triggerRelease(['D#5'])
    } else if(event.key == 'm') {
    	triggerRelease(['E5'])
    }
    notes.splice(notes.indexOf(event.key), 1)
}



export function createOscillatorGUI(gui, oscillator, name) {
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

}


export function createEnvelopeGUI(gui, envelope, name) {
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

}
// class CustomDuoSynth extends Tone.DuoSynth {
// 	constructor() {
// 		super( {
// 			vibratoAmount : 0.5 ,
// 			vibratoRate : 5 ,
// 			harmonicity : 1.5 ,
// 			voice0 : {
// 				volume : -10 ,
// 				portamento : 1,
// 				oscillator : {
// 					type : 'square'
// 				},
// 				filter : {
// 					Q : 6 ,
// 					type : 'lowpass',
// 					frequency : 350 ,
// 					rolloff : -24
// 				},
// 				filterEnvelope : {
// 					attack : 0.01 ,
// 					decay : 0 ,
// 					sustain : 1 ,
// 					release : 0.5
// 				},
// 				envelope : {
// 					attack : 0.01 ,
// 					decay : 0 ,
// 					sustain : 1 ,
// 					release : 0.5
// 				}
// 			},
// 			voice1 : {
// 				volume : -1000 ,
// 				portamento : 1000 ,
// 				oscillator : {
// 					type : 'triangle'
// 				},
// 				filter : {
// 					Q : 6 ,
// 					type : 'highpass' ,
// 					frequency : 14350 ,
// 					rolloff : -24
// 				},
// 				filterEnvelope : {
// 					attack : 0.01 ,
// 					decay : 0 ,
// 					sustain : 1 ,
// 					release : 0.5
// 				},
// 				envelope : {
// 					attack : 0.01 ,
// 					decay : 0 ,
// 					sustain : 1 ,
// 					release : 0.5
// 				}
// 			}
// 		})
// 	}
// }

export function createSynth(gui) {
	// Tone.Master.volume.value = -30

	let folder = gui.addFolder('Synth')
	folder.open()
	
	// synth = new Tone.PolySynth(1, Tone.CustomSynth).toMaster();
	// synth = new Tone.PolySynth(1, CustomDuoSynth).toMaster();
	synth = new Tone.PolySynth(1, Tone.DuoSynth);//.toMaster();
	synth.voices[0].voice0.oscillator.type = 'sawtooth'
	synth.voices[0].voice1.oscillator.type = 'sawtooth'

	// var freqEnv = new Tone.FrequencyEnvelope({
	//  	"attack" : 0.1,
	//  	"baseFrequency" : 100,
	//  	"octaves" : 1
	//  });
	//  freqEnv.connect(synth.voices[0].frequency);

	var freqEnv = new Tone.ScaledEnvelope({
	 	"attack" : 0.02,
	 	"min" : 50,
	 	"max" : 8730,
	 	"exponent" : 1
	 });
	 // freqEnv.connect(synth.voices[0].frequency);


	var mult10 = new Tone.Multiply(10);

	var filter = new Tone.Filter(50, "lowpass");
	freqEnv.chain(mult10, filter.frequency);

	var dist = new Tone.Distortion(0.8).toMaster();
	synth.chain(filter, dist);

	// synth = new Tone.PolySynth(1, Tone.MonoSynth).toMaster();

	// synth.voices[0].portamento = 1
	
	// let carrier = new Tone.Oscillator(440, "sine").toMaster();
	
	// let modulator = new Tone.Oscillator(1, "sine");
	// let modulationScale = new Tone.AudioToGain();
	// let modulationNode = new Tone.Gain(0).toMaster();

	// modulator.chain(modulationScale, modulationNode.gain);
	// carrier.chain(modulationNode);
	// carrier.frequency.setValueAtTime('C4', 1)

	// var lfo = new Tone.LFO(1, 20, 400);
	// lfo.connect(carrier.frequency);
	// lfo.disconnect();
	// carrier.frequency.setValueAtTime('C4', 1)

 //    folder.add(lfo.frequency, 'value', 0, 100).name('lfo frequency')

	// carrier.start()
	// lfo.start()

	// synth = new Tone.CustomSynth().toMaster();
	// synth = new Tone.MonoSynth().toMaster();

	// Object.defineProperty(synth, 'oscillator', {
	// 	"writable" : true,
	// 	"enumerable" : true,
	// });

	// synth.oscillator = carrier
	// synth.oscillator.chain(synth.output)
	
	// var reverb = new Tone.JCReverb(0.4).connect(Tone.Master);
	// var delay = new Tone.FeedbackDelay(0.25);
	// synth.chain(delay, reverb);

	// synth.set("detune", -1200);
	createOscillatorGUI(folder, synth.voices[0].voice0.oscillator, 'Osc. 0')
	createOscillatorGUI(folder, synth.voices[0].voice1.oscillator, 'Osc. 1')

	createFilterGUI(folder, synth.voices[0].voice0.filter, 'Filter 0')
	createFilterGUI(folder, synth.voices[0].voice1.filter, 'Filter 1')

	createEnvelopeGUI(folder, synth.voices[0].voice0.envelope, 'Envelope 0')
	createEnvelopeGUI(folder, synth.voices[0].voice1.envelope, 'Envelope 1')

	createEnvelopeGUI(folder, synth.voices[0].voice0.filterEnvelope, 'Filter Env. 0')
	createEnvelopeGUI(folder, synth.voices[0].voice1.filterEnvelope, 'Filter Env. 1')

    // var osc = new Tone.OmniOscillator("C4", "pwm").start();
    // var amplitudeOsc = new Tone.OmniOscillator(10, "pwm").start();
    // var frequencyOsc = new Tone.OmniOscillator(1, "pwm").start();
    
    // let minNote = 20
    // let maxNote = 136

    // var loop = new Tone.Loop(function(time){
    //     omniOsc.frequency.value = Tone.Frequency(minNote + (maxNote-minNote) * Math.random(), "midi").toFrequency();
    // }, "8n").start(0);

    Tone.Transport.start();

    // folder.add(loop, 'interval', 0, 1, 0.001).name('Random freq')


    // createOscillator(folder, 'Oscillator')
    // createOscillator(folder, 'Amplitude Osc')
    // createOscillator(folder, 'Frequency Osc')

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

}

export async function fileChanged(fragmentShader) {
	
}
