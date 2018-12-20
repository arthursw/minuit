
/**
 *  @class Tone.CustomOscillator
 *
 *  @extends {Tone.Oscillator}
 *  @constructor
 *  @param {Frequency} frequency The starting frequency of the oscillator.
 *  @param {String} type The type of the carrier oscillator.
 *  @param {String} modulationType The type of the modulator oscillator.
 *  @example
 * //a sine oscillator frequency-modulated by a square wave
 * var fmOsc = new Tone.CustomOscillator("Ab3", "sine", "square").toMaster().start();
 */
Tone.CustomOscillator = function(){

	var options = Tone.defaults(arguments, ["frequency", "type", "modulationType"], Tone.CustomOscillator);
	Tone.Source.call(this, options);

	/**
	 *  The carrier oscillator
	 *  @type {Tone.Oscillator}
	 *  @private
	 */
	this._carrier = new Tone.Oscillator(options.frequency, options.type);

	this.frequency = new Tone.Signal(options.frequency, Tone.Type.Frequency);

	// let modulator = new Tone.Oscillator(1, "sine");
	// let modulationScale = new Tone.AudioToGain();
	// let modulationNode = new Tone.Gain(0).toMaster();

	// modulator.chain(modulationScale, modulationNode.gain);
	// carrier.chain(modulationNode);
	// carrier.frequency.setValueAtTime('C4', 1)

	this.amplitudeModulator = new Tone.LFO(options.amplitudeModulatorFrequency, options.amplitudeModulatorAmplitudeMin, options.amplitudeModulatorAmplitudeMax);
	this.frequencyModulator = new Tone.LFO(options.frequencyModulatorFrequency, options.frequencyModulatorFrequencyMin, options.frequencyModulatorFrequencyMax);

	// this._modulationNode = new Tone.Gain(0);


	// this.frequency.chain(this.modulationIndex, this._modulationNode);
	// this.frequencyModulator.connect(this._modulationNode.gain);

	// this._modulationNode.connect(this._carrier.frequency);

	// this.randomAmplitudeModulator = new Tone.Loop((time)=>{
	// 	this._carrier.volume.value = options.amplitudeModulatorFrequencyMin + (options.amplitudeModulatorFrequencyMax - options.amplitudeModulatorFrequencyMin) * Math.random()
	// }, 1 / options.amplitudeModulatorFrequency);

	// this.randomFrequencyModulator = new Tone.Loop((time)=>{
	// 	this._carrier.frequency.value = options.frequencyModulatorFrequencyMin + (options.frequencyModulatorFrequencyMax - options.frequencyModulatorFrequencyMin) * Math.random()
	// }, 1 / options.frequencyModulatorFrequency);

	/**
	 *  The oscillator's frequency
	 *  @type {Frequency}
	 *  @signal
	 */
	this.frequency = this._carrier.frequency;

	/**
	 *  The detune control signal.
	 *  @type {Cents}
	 *  @signal
	 */
	this.detune = this._carrier.detune;
	this.detune.value = options.detune;

	/**
	 *  The modulating oscillator
	 *  @type  {Tone.Oscillator}
	 *  @private
	 */
	// this._modulator = new Tone.Oscillator(options.frequency, options.modulationType);

	/**
	 *  convert the -1,1 output to 0,1
	 *  @type {Tone.AudioToGain}
	 *  @private
	 */
	// this._modulationScale = new Tone.AudioToGain();

	/**
	 *  Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
	 *  A harmonicity of 1 gives both oscillators the same frequency.
	 *  Harmonicity = 2 means a change of an octave.
	 *  @type {Positive}
	 *  @signal
	 *  @example
	 * //pitch the modulator an octave below carrier
	 * synth.harmonicity.value = 0.5;
	 */
	// this.harmonicity = new Tone.Multiply(options.harmonicity);
	// this.harmonicity.units = Tone.Type.Positive;

	/**
	 *  the node where the modulation happens
	 *  @type {Tone.Gain}
	 *  @private
	 */
	// this._modulationNode = new Tone.Gain(0);

	//connections
	// this.frequency.chain(this.harmonicity, this._modulator.frequency);
	// this.detune.connect(this._modulator.detune);
	// this._modulator.chain(this._modulationScale, this._modulationNode.gain);
	// this._carrier.chain(this._modulationNode, this.output);
	this.frequency.connect(this._carrier.frequency);
	this.amplitudeModulator.connect(this._carrier.volume);
	this.frequencyModulator.connect(this._carrier.frequency);
	this._carrier.connect(this.output);

	this.phase = options.phase;

	this._readOnly(["frequency", "detune"]);
};

Tone.extend(Tone.CustomOscillator, Tone.Oscillator);

/**
 *  default values
 *  @static
 *  @type {Object}
 *  @const
 */
Tone.CustomOscillator.defaults = {
	"frequency" : 440,
	"detune" : 0,
	"phase" : 0,
	"amplitudeModulatorType": "sine",
	"amplitudeModulatorFrequency": 1,
	"amplitudeModulatorAmplitudeMin": -100,
	"amplitudeModulatorAmplitudeMax": 10,
	"frequencyModulatorType": "sine",
	"frequencyModulatorFrequency": 1,
	"frequencyModulatorFrequencyMin": 20,
	"frequencyModulatorFrequencyMax": 40000,
};

/**
 *  start the oscillator
 *  @param  {Time} [time=now]
 *  @private
 */
Tone.CustomOscillator.prototype._start = function(time){
	this._carrier.start(time);
	this.amplitudeModulator.start(time);
	this.frequencyModulator.start(time);
	// this.randomAmplitudeModulator.start(time);
	// this.randomFrequencyModulator.start(time);
};

/**
 *  stop the oscillator
 *  @param  {Time} time (optional) timing parameter
 *  @private
 */
Tone.CustomOscillator.prototype._stop = function(time){
	this._carrier.stop(time);
	this.amplitudeModulator.stop(time);
	this.frequencyModulator.stop(time);
	// this.randomAmplitudeModulator.stop(time);
	// this.randomFrequencyModulator.stop(time);
};

/**
 *  restart the oscillator
 *  @param  {Time} time (optional) timing parameter
 *  @private
 */
Tone.CustomOscillator.prototype.restart = function(time){
	this._carrier.restart(time);
	
	this.amplitudeModulator.stop();
	this.frequencyModulator.stop();

	this.amplitudeModulator.start(time);
	this.frequencyModulator.start(time);

	// this.randomAmplitudeModulator.restart(time);
	// this.randomFrequencyModulator.restart(time);
};

/**
 * The type of the carrier oscillator
 * @memberOf Tone.CustomOscillator#
 * @type {string}
 * @name type
 */
Object.defineProperty(Tone.CustomOscillator.prototype, "type", {
	get : function(){
		return this._carrier.type;
	},
	set : function(type){
		this._carrier.type = type;
	}
});

/**
 * The phase of the oscillator in degrees.
 * @memberOf Tone.CustomOscillator#
 * @type {number}
 * @name phase
 */
Object.defineProperty(Tone.CustomOscillator.prototype, "phase", {
	get : function(){
		return this._carrier.phase;
	},
	set : function(phase){
		this._carrier.phase = phase;
	}
});

/**
 * The partials of the carrier waveform. A partial represents
 * the amplitude at a harmonic. The first harmonic is the
 * fundamental frequency, the second is the octave and so on
 * following the harmonic series.
 * Setting this value will automatically set the type to "custom".
 * The value is an empty array when the type is not "custom".
 * @memberOf Tone.CustomOscillator#
 * @type {Array}
 * @name partials
 * @example
 * osc.partials = [1, 0.2, 0.01];
 */
Object.defineProperty(Tone.CustomOscillator.prototype, "partials", {
	get : function(){
		return this._carrier.partials;
	},
	set : function(partials){
		this._carrier.partials = partials;
	}
});

/**
 *  Clean up.
 *  @return {Tone.CustomOscillator} this
 */
Tone.CustomOscillator.prototype.dispose = function(){
	Tone.Source.prototype.dispose.call(this);
	this._writable(["frequency", "detune"]);

	this.frequency = null;
	this.detune = null;
	this._carrier.dispose();
	this._carrier = null;

	this.amplitudeModulator.dispose();
	this.frequencyModulator.dispose();
	// this.randomAmplitudeModulator.dispose();
	// this.randomFrequencyModulator.dispose();

	this.amplitudeModulator = null
	this.frequencyModulator = null
	// this.randomAmplitudeModulator = null
	// this.randomFrequencyModulator = null

	return this;
};
