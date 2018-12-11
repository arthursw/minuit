import { channels } from '../shaders.js'
import { renderer } from '../three-scene.js'

let oscillators = []
let note = null
let initialized = false
let indexToFrequency = []

var pixels = null

export async function initialize(shaderName) {

	let height = window.innerHeight
	let minNote = 20
	let maxNote = 136

	for(let i=0 ; i<height/10 ; i++) {
		let frequency = Tone.Frequency(minNote + (maxNote-minNote) * i / (height / 10), "midi").toFrequency()
		indexToFrequency.push(frequency)
		// var oscillator = new Tone.Oscillator(frequency, "sine").toMaster();
		// oscillator.volume.value = -100;
		// oscillators.push(oscillator)
	}

	note = new Tone.Oscillator(440, "sine").toMaster()
	note.volume.value = 4

	pixels = new Uint8Array(1 * (height / 2) * 4)

	initialized = true
}

export function activate(shaderName) {
	if(!initialized) {
		initialize()
	}
}

export function deactivate() {
}

export function render() {
}

export function resize() {


};


export function noteOn(event) {
	// let noteNumber = event.detail.note.number
	// note.frequency.value = Tone.Frequency(noteNumber, "midi").toFrequency()
	// note.start()

	// let width = window.innerWidth
	// let height = window.innerHeight
	
	// let minVolume = -50
	// let maxVolume = 50

	// for(let i=0 ; i<height/4 ; i++) {

	// 	let r = new THREE.Vector2(width, height / 2)
	// 	let p = new THREE.Vector2(0, 2*i/(height/4))

	// 	let scale = 25.0 * (channels[4] / 128.0) / r.y

	// 	let q = new THREE.Vector2(scale * ( 2 * p.x - r.x ), scale * ( 2 * p.y - r.y ))

	// 	let x = channels[0] / 128.0;
	// 	let y = channels[1] / 128.0;
	// 	let amplitude = 0

	// 	for(let n=0 ; n<channels[2] ; n++) {

	// 		let lq = q.lengthSq()
	// 		let qxy = q.x * q.y

	// 		if(channels[5] <= 1.0) {
	// 			q.x = Math.abs(q.x) / lq - x;
	// 			q.y = Math.abs(q.y) / lq - y;
	// 		} else if(channels[5] <= 2.0) {
	// 			q.x = Math.abs(q.x) / qxy - x;
	// 			q.y = Math.abs(q.y) / qxy - y;
	// 		} else if(channels[5] <= 3.0) {
	// 			let modulo = n % 3
				
	// 			if(n % 3 > 0) {
	// 				q.x = Math.abs(q.x) / lq - x;
	// 				q.y = Math.abs(q.y) / lq - y;
	// 			} else {
	// 				q.x = Math.abs(q.x) / qxy - x;
	// 				q.y = Math.abs(q.y) / qxy - y;
	// 			}
	// 		}

	// 		amplitude += q.length() / (1000.0 * channels[3] / 128.0)
	// 	}
	// 	console.log(amplitude)
	// 	oscillators[i].volume.value = minVolume + (maxVolume - minVolume) * Math.min(amplitude, 1)
	// 	oscillators[i].start()
	// }






	// let width = renderer.context.drawingBufferWidth
	// let height = renderer.context.drawingBufferHeight
	// let gl = renderer.context
	// // var imageData = renderer.context.getImageData(width/2, Math.floor(height / 2), 1, Math.floor(height / 2))
	// renderer.context.readPixels(width/2, Math.floor(height / 2), 1, Math.floor(height / 2), gl.RGBA, gl.UNSIGNED_BYTE, pixels)

	// let audioContext = new (window.AudioContext || window.webkitAudioContext)();

	// let arrayBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 1, audioContext.sampleRate)

	// // for(let n = 0 ; n < height / 2 ; n++) {
	// // 	let value = pixels[4*n] / 255
	// // 	console.log(value)
	// // }

	// var buffer0 = arrayBuffer.getChannelData(0);

	// for (var i = 0; i < arrayBuffer.length ; i++) {
	// 	let t = i / arrayBuffer.length

	// 	let signal = 0
	// 	for(let n = 0 ; n < height / 10 ; n++) {
	// 		let value = pixels[4*(n*5)] / 255

	// 		let f = indexToFrequency[n]
	// 		signal += value * Math.sin(2*Math.PI*f*t)
	// 	}

	// 	signal *= 0.2
	// 	buffer0[i] = signal
	// 	// buffer0[4*i+1] = signal
	// 	// buffer0[4*i+2] = signal
	// 	// buffer0[4*i+3] = signal

	// }

	// // console.log(buffer0[i])

	// // Get an AudioBufferSourceNode.
	// // This is the AudioNode to use when we want to play an AudioBuffer
	// var source = audioContext.createBufferSource();

	// // set the buffer in the AudioBufferSourceNode
	// source.buffer = arrayBuffer;

	// // connect the AudioBufferSourceNode to the
	// // destination so we can hear the sound
	// source.connect(audioContext.destination);

	// // start the source playing
	// source.start();



}

export function noteOff(event) {

}

export async function controlchange(e) {
	noteOn()
}

