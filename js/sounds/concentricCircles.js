function lowViolentKick() {

	let _carrier = new Tone.Oscillator(30, 'sawtooth');

	// let frequency = new Tone.Signal(110, Tone.Type.Frequency);

	// let modulationIndex = new Tone.Multiply(1);
	// modulationIndex.units = Tone.Type.Positive;

	// let _modulator = new Tone.Oscillator(1, 'sine');

	// let harmonicity = new Tone.Multiply(0.01);
	// harmonicity.units = Tone.Type.Positive;

	// let _modulationNode = new Tone.Gain(0);
	

	// //connections
	// // frequency.connect(_carrier.frequency);
	// frequency.chain(harmonicity, _modulator.frequency);
	// frequency.chain(modulationIndex, _modulationNode);
	// // frequency.connect(_modulationNode);
	
	// _modulator.connect(_modulationNode.gain);
	// _modulationNode.connect(_carrier.frequency);
	// _modulator.connect(_carrier.frequency);
	let result = new Tone.Gain(1);

	var filter = new Tone.Filter(1000, "lowpass");
	filter.frequency.rampTo(50);

	// var freqEnv = new Tone.FrequencyEnvelope({
 // 	"attack" : 0.01,
 // 	"baseFrequency" : 50,
 // 	"octaves" : 1
 // });
	// freqEnv.connect(filter.frequency)
	// freqEnv.triggerAttackRelease(0.18)

	filter.Q.value = 25
	// filter.gain.value = 1
	// filter.detune.value = 1000

	_carrier.connect(filter);
	filter.chain(new Tone.Multiply(1), result);

	var dist = new Tone.Distortion(0.2).toMaster();
	// dist.oversample = '4x'

	result.connect(dist);
	dist.connect(Tone.Master);

	// var lfo = new Tone.LFO(1.1, 3*110, 5*110);
	// lfo.connect(_carrier.frequency);
	// lfo.start();
	

	
	_carrier.start();
	// _modulator.start();

	var env = new Tone.Envelope({
		"attack" : 0.01,
		"decay" : 1,
		"sustain" : 1,
		"release" : 1.6,
	});



	env.connect(result.gain);

	// var mult = new Tone.Multiply(0.9);
	// _carrier.frequency.rampTo(_carrier.frequency.value*0.5);

	env.triggerAttackRelease(0.18);

}


export async function initialize() {
	// lowViolentKick()
	// return
	
	// Hypnotizing pulse

	
	let _carrier1 = new Tone.Oscillator('C2', 'sine');
	let _carrier2 = new Tone.Oscillator('C2', 'sine');
	let _carrier3 = new Tone.PulseOscillator('C1', 0.3);

	_carrier1.detune.value = 12*100
	_carrier2.detune.value = 5
	_carrier3.detune.value = 3

	var dist = null
	dist = new Tone.Distortion(0.01);
	// dist.oversample = '4x'


	// var lfo = new Tone.LFO(0.15, 90, 100);
	// lfo.connect(_carrier1.frequency);
	// lfo.start();

	// var lfo2 = new Tone.LFO(0.2, 90, 100);
	// lfo2.connect(_carrier2.frequency);
	// lfo2.start();
	

	// _carrier1.partials = [1, 0.3, 0.1]
	_carrier1.start();
	_carrier2.start();
	_carrier3.start();

	// _modulator.start();

	var env = new Tone.Envelope({
		"attack" : 2,
		"decay" : 1,
		"sustain" : 1,
		"release" : 3.6,
	});


	let result = new Tone.Gain(1);
	_carrier1.connect(result);
	_carrier2.connect(result);
	_carrier3.connect(result);
	
	env.connect(result.gain);

	// var mult = new Tone.Multiply(0.9);
	// _carrier.frequency.rampTo(_carrier.frequency.value*0.5);

	env.triggerAttackRelease(15.18);
	
	let amp = new Tone.Gain(1);
	result.connect(amp);

	if(dist) {
		amp.connect(dist);


		var filter = new Tone.Filter(350, "lowpass");
		// filter.frequency.rampTo(5000);

		filter.Q.value = 25
		// filter.gain.value = 1
		// filter.detune.value = 1000

		var freqEnv = new Tone.FrequencyEnvelope({
		 	"attack" : 1.0,
		 	"baseFrequency" : 200,
		 	"octaves" : 5
		 });
	 	freqEnv.connect(filter.frequency);

		dist.connect(filter);
		filter.chain(new Tone.Multiply(1), Tone.Master);

		// dist.connect(Tone.Master);
	} else {
		amp.connect(Tone.Master);
	}
	

	// let carrier = new Tone.Oscillator(440, "sawtooth").toMaster();

	// let frequency = new Tone.Signal(carrier.frequency.value);

	// var lfo = new Tone.LFO(1, 20, 400);
	// lfo.connect(carrier.frequency);

	// lfo.disconnect();

	// // synth = new Tone.PolySynth(1, Tone.CustomSynth).toMaster();
	// // synth = new Tone.PolySynth(1, CustomDuoSynth).toMaster();
	// synth = new Tone.PolySynth(1, Tone.DuoSynth);//.toMaster();
	// synth.voices[0].voice0.oscillator.type = 'sawtooth'
	// synth.voices[0].voice1.oscillator.type = 'sawtooth'

	// // var freqEnv = new Tone.FrequencyEnvelope({
	// //  	"attack" : 0.1,
	// //  	"baseFrequency" : 100,
	// //  	"octaves" : 1
	// //  });
	// //  freqEnv.connect(synth.voices[0].frequency);

	// var freqEnv = new Tone.ScaledEnvelope({
	//  	"attack" : 0.02,
	//  	"min" : 50,
	//  	"max" : 8730,
	//  	"exponent" : 1
	//  });
	//  // freqEnv.connect(synth.voices[0].frequency);


	// var mult10 = new Tone.Multiply(10);

	// var filter = new Tone.Filter(50, "lowpass");
	// freqEnv.chain(mult10, filter.frequency);

	// var dist = new Tone.Distortion(0.8).toMaster();
	// synth.chain(filter, dist);

	// // synth = new Tone.PolySynth(1, Tone.MonoSynth).toMaster();

	// // synth.voices[0].portamento = 1
	
	// // let carrier = new Tone.Oscillator(440, "sine").toMaster();
	
	// // let modulator = new Tone.Oscillator(1, "sine");
	// // let modulationScale = new Tone.AudioToGain();
	// // let modulationNode = new Tone.Gain(0).toMaster();

	// // modulator.chain(modulationScale, modulationNode.gain);
	// // carrier.chain(modulationNode);
	// // carrier.frequency.setValueAtTime('C4', 1)

	// // var lfo = new Tone.LFO(1, 20, 400);
	// // lfo.connect(carrier.frequency);
	// // lfo.disconnect();
	// // carrier.frequency.setValueAtTime('C4', 1)

 // //    folder.add(lfo.frequency, 'value', 0, 100).name('lfo frequency')

	// // carrier.start()
	// // lfo.start()

	// // synth = new Tone.CustomSynth().toMaster();
	// // synth = new Tone.MonoSynth().toMaster();

	// // Object.defineProperty(synth, 'oscillator', {
	// // 	"writable" : true,
	// // 	"enumerable" : true,
	// // });

	// // synth.oscillator = carrier
	// // synth.oscillator.chain(synth.output)
	
	// // var reverb = new Tone.JCReverb(0.4).connect(Tone.Master);
	// // var delay = new Tone.FeedbackDelay(0.25);
	// // synth.chain(delay, reverb);

	// // synth.set("detune", -1200);

 //    // var osc = new Tone.OmniOscillator("C4", "pwm").start();
 //    // var amplitudeOsc = new Tone.OmniOscillator(10, "pwm").start();
 //    // var frequencyOsc = new Tone.OmniOscillator(1, "pwm").start();
    
 //    // let minNote = 20
 //    // let maxNote = 136

 //    // var loop = new Tone.Loop(function(time){
 //    //     omniOsc.frequency.value = Tone.Frequency(minNote + (maxNote-minNote) * Math.random(), "midi").toFrequency();
 //    // }, "8n").start(0);

 //    Tone.Transport.start();
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
	console.log('note on')

}

export function noteOff(event) {
}

export async function controlchange(e) {
}

