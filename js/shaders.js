import { scene, renderer, bounds, renderThreeJS, initializeThreeJS, container, resizeThreeJS } from './three-scene.js'

var uniforms, material, mesh;

var startTime = Date.now();

let initialized = false;

let width = window.innerWidth;
let height = window.innerHeight;

export let channels = []
let signals = []

for(let i=0 ; i<9 ; i++) {
    let signal = new Tone.Signal(1)
    signals.push(signal)
    channels.push(signal.value)
}




let vertexShader = null
let fragmentShader = null

async function createMaterial(fragmentShader) {
    vertexShader = await import('./shaders/vertex.js')

    width = window.innerWidth;
    height = window.innerHeight;

    uniforms = {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2(width, height) },
        channels: { type: "f", value: channels }
    };

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: vertexShader.shader,
        fragmentShader: fragmentShader, 
        side: THREE.DoubleSide
    });

    return material
}

export async function initialize(shaderName) {
    initializeThreeJS();
	fragmentShader = await import('./shaders/' + shaderName + '.js')

    material = await createMaterial(fragmentShader.shader)

    width = window.innerWidth;
    height = window.innerHeight;

    mesh = new THREE.Mesh( new THREE.PlaneGeometry( width, height ), material);
    mesh.position.z = -1

    scene.add( mesh );
    uniforms.resolution.value.x = width;
    uniforms.resolution.value.y = height;
    initialized = true;
}

export async function loadFile(shaderName) {
    fragmentShader = await import('./shaders/' + shaderName + '.js')

    fileChanged(fragmentShader.shader)
}

export async function fileChanged(fragmentShader) {
	mesh.material = await createMaterial(fragmentShader)
    resizeThreeJS()
}

export function activate(shaderName) {
	if(!initialized) {
		initialize(shaderName)
	} else {
        // scene.add( mesh );
		// $(renderer.domElement).show()
        if(shaderName) {
            loadFile(shaderName)
        }
	}
    startTime = Date.now()
}

export function deactivate() {
	// $(renderer.domElement).hide()
    // scene.remove( mesh );
	// console.log(renderer.domElement.style.display)
}

export function render() {
	if(renderer == null || uniforms == null) {
		return
	}
    var elapsedMilliseconds = Date.now() - startTime;
    var elapsedSeconds = elapsedMilliseconds / 1000.;
    uniforms.time.value = 60. * elapsedSeconds;
    
    for(let i = 0 ; i<channels.length ; i++) {
        channels[i] = signals[i].value
    }
    
    uniforms.channels.value = channels;
    renderThreeJS();
}

export function resize() {
    if(mesh.geometry.vertices.length >= 4) {
        mesh.geometry.vertices[0].x = bounds.min.x
        mesh.geometry.vertices[0].y = bounds.max.y
        mesh.geometry.vertices[1].x = bounds.max.x
        mesh.geometry.vertices[1].y = bounds.max.y
        mesh.geometry.vertices[3].x = bounds.max.x
        mesh.geometry.vertices[3].y = bounds.min.y
        mesh.geometry.vertices[2].x = bounds.min.x
        mesh.geometry.vertices[2].y = bounds.min.y
        mesh.geometry.verticesNeedUpdate = true
    }
    
    if(uniforms != null) {
        let size = bounds.getSize()
        uniforms.resolution.value.x = size.x;
        uniforms.resolution.value.y = size.y;
    }

};

export function noteOn(event) {

}

export function noteOff(event) {

}

export async function controlchange(e) {
    let signalIndex = e.controller.number - 14
    if(signalIndex >= 0 && signalIndex < signals.length) {
        signals[signalIndex].linearRampTo(e.data[2], 1.5)
    }
}

document.addEventListener('resizeThreeJS', resize, false)
