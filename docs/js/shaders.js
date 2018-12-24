import { scene, renderer, bounds, cameraOrtho, renderThreeJS, initializeThreeJS, container, resizeThreeJS } from './three-scene.js'
import { flan, setHeight, initializeFlan, deactivateFlan } from './flan.js'
import { slidingNotes, initializeSN, deactivateSN, updateSN, noteOnSN, noteOffSN, clearSN} from './slidingNotes.js'
import { initializeTexture, deactivateTexture, controlchangeTexture } from './sounds/texture.js'
import { initializeDiffusion, deactivateDiffusion, controlchangeDiffusion } from './sounds/diffusion.js'
import { initializeFractal, deactivateFractal, controlchangeFractal } from './sounds/fractal.js'

let elapsedSeconds = 0
var uniforms, material, mesh;

let startTime = Date.now();
let currentTime = startTime;
let lastFrameTime = startTime;
let speed = 1.0;
let maxTime = 60.0;
let pause = false;

let initialized = false;

let width = window.innerWidth;
let height = window.innerHeight;

export let channels = []
export let sliders = []
export let accumulators = []
export let instrument = 0 //'texture'
export let previousInstrument = 0

// let instruments = ['texture', 'voices', 'effects']

let signals = []

for(let i=0 ; i<9 ; i++) {
    // let signal = new Tone.Signal(0)
    // signals.push(signal)
    channels.push(0) //signal.value)
    sliders.push(0)
    accumulators.push(0)
}

let vertexShader = null
let fragmentShader = null
let bufferShaderNames = ['city']
let shaderName = null

let bufferInitialized = null
let bufferTextureA = null
let bufferTextureB = null
let bufferScene = null
let bufferPlane = null
let bufferObject = null
let bufferMaterial = null
let bufferFragmentShader = null
let canvasTexture = null
let canvasMaterial = null
let canvasWasUpdated = false
let notesOn = []

let group = null

function createUniforms() {
    if(uniforms) {
        return uniforms
    }

    width = window.innerWidth;
    height = window.innerHeight;

    uniforms = {
        time: { type: "f", value: Date.now() },
        resolution: { type: "v2", value: new THREE.Vector2(width, height) },
        channels: { type: "f", value: channels },
        sliders: { type: "f", value: sliders },
        iMouse: { type: "v4", value: new THREE.Vector4(0, 0) },
        iFrame: { type: "i", value: 0 },
        instrument: {type: "i", value: instrument},
        canvasWasUpdated: {value: false},
        notesOn: {type: 'i', value: notesOn },
        accumulators: { type: "i", value: accumulators },
        realTime: { type: "f", value: Date.now() },
    };

    return uniforms
}

async function createMaterial(fragmentShader) {
    vertexShader = await import('./shaders/vertex.js')

    uniforms = createUniforms()

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        // extensions: { derivatives: true },
        vertexShader: vertexShader.shader.trim(),
        fragmentShader: fragmentShader.trim(),
        side: THREE.DoubleSide
    });

    // material = new THREE.MeshBasicMaterial({color: 0xffffff})

    return material
}

async function createBufferMaterial(fragmentShader) {
    vertexShader = await import('./shaders/vertex.js')
    
    uniforms = createUniforms()

    uniforms.iChannel0 = { value: bufferTextureA.texture }
    uniforms.iChannel1 = { value: canvasTexture }

    bufferMaterial = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        // extensions: { derivatives: true },
        vertexShader: vertexShader.shader.trim(),
        fragmentShader: fragmentShader.trim(), 
        side: THREE.DoubleSide
    } )

    return bufferMaterial
}

async function createBufferScene(fragmentShader) {

    //Create buffer scene
    bufferScene = new THREE.Scene()
    //Create buffer texture

    // canvasMaterial = new THREE.MeshBasicMaterial()

    bufferTextureA = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false } )
    bufferTextureB = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false } )
    canvasTexture = new THREE.CanvasTexture( paper.view.element, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter, THREE.RGBAFormat, THREE.FloatType, 1);
    canvasTexture.needsUpdate = true;

    bufferTextureA.texture.wrapS = THREE.ClampToEdgeWrapping;
    bufferTextureA.texture.wrapT = THREE.ClampToEdgeWrapping;
    bufferTextureB.texture.wrapS = THREE.ClampToEdgeWrapping;
    bufferTextureB.texture.wrapT = THREE.ClampToEdgeWrapping;

    bufferMaterial = await createBufferMaterial(fragmentShader)
    // bufferPlane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight )

    bufferObject = new THREE.Mesh( new THREE.PlaneGeometry( window.innerWidth, window.innerHeight ), bufferMaterial);

    // bufferObject = new THREE.Mesh( bufferPlane, bufferMaterial )
    bufferObject.position.z = -1
    bufferScene.add(bufferObject)

    // let canvasObject = new THREE.Mesh( new THREE.PlaneGeometry( window.innerWidth, window.innerHeight ), canvasMaterial)
    // canvasMaterial.map.needsUpdate = true;

    // canvasObject.position.z = -2
    // bufferScene.add(canvasObject)

}

export async function initializeBuffer(shaderName) {
    if(isBufferShader()) {
        bufferFragmentShader = await import('./shaders/' + shaderName + '-buffer' + '.js')

        createBufferScene(bufferFragmentShader.shader)
        bufferInitialized = true
    }
}

function isBufferShader() {
    return bufferShaderNames.indexOf(shaderName) >= 0
}

export async function initialize(shaderName) {
    initializeThreeJS();

    fragmentShader = await import('./shaders/' + shaderName + '.js')
    
    material = await createMaterial(fragmentShader.shader)

    width = window.innerWidth;
    height = window.innerHeight;

    // let geometry = new THREE.PlaneBufferGeometry( width, height);
    mesh = new THREE.Mesh( new THREE.PlaneGeometry( width, height ), material);
    // mesh = new THREE.Mesh(geometry, material);

    mesh.position.z = -1
    window.mesh = mesh
    scene.add( mesh );

    uniforms.resolution.value.x = width;
    uniforms.resolution.value.y = height;
    initialized = true;

    
}

export async function loadFile(shaderName) {
    fragmentShader = await import('./shaders/' + shaderName + '.js')

    if(isBufferShader()) {
        bufferFragmentShader = await import('./shaders/' + shaderName + '-buffer' + '.js')
    }

    fileChanged(fragmentShader.shader, bufferFragmentShader ? bufferFragmentShader.shader : null)
}

export async function fileChanged(fragmentShader, bufferFragmentShader) {
	mesh.material = await createMaterial(fragmentShader)
    
    if(isBufferShader()) {
        bufferObject.material = await createBufferMaterial(bufferFragmentShader)
    }

    resizeThreeJS()

}

export function activate(newShaderName) {
    $(paper.view.element).show()
    paper.project.clear()
    instrument = 1

    // let background = new paper.Path.Rectangle(paper.view.bounds)
    // background.fillColor = 'rgb(10, 234, 34)'
    // paper.project.activeLayer.addChild(group)

    shaderName = newShaderName

    if(shaderName == 'fractal') {
        initializeFractal()
    }

	if(!initialized) {
		initialize(shaderName)
        if(!bufferInitialized) {
            initializeBuffer(shaderName)
        }
	} else {
        if(!bufferInitialized) {
            initializeBuffer(shaderName)
        }
        // scene.add( mesh );
		// $(renderer.domElement).show()
        if(shaderName) {
            loadFile(shaderName)
        }
	}
    startTime = Date.now()
    currentTime = 0
    
    if(uniforms) {
        uniforms.iFrame.value = 0;
    }

    initializeInstrument()
}

export function deactivate() {
	// $(renderer.domElement).hide()
    // scene.remove( mesh );
	// console.log(renderer.domElement.style.display)
    
    deactivateInstrument()

    paper.project.clear()
    $(paper.view.element).hide()


    if(shaderName == 'fractal') {
        deactivateFractal()
    }
}

function updateTime() {
    let now = Date.now()
    let elapsedSeconds = (now - lastFrameTime) / 1000
    
    lastFrameTime = now
    currentTime += elapsedSeconds * speed

    if(uniforms) {
        uniforms.time.value = currentTime
        uniforms.realTime.value = (now - startTime) / 1000
    }
    return currentTime
}

export function render() {

	if(renderer == null || uniforms == null) {
		return
	}
    
    if(!pause) {
        updateTime()
    }
    
    // for(let i = 0 ; i<channels.length ; i++) {
    //     channels[i] = signals[i].value
    // }

    // if(shaderName == 'fractal' && lastFractalNumber != fractalNumber) {
    //     accumulators[1] = Math.floor(Math.random() * accumulators[0])
    //     uniforms.accumulators.value = accumulators;
    //     lastFractalNumber = fractalNumber
    // }

    uniforms.channels.value = channels;
    uniforms.sliders.value = sliders;

    // if(isBufferShader() && (instrument == 1 || instrument == 5)) {

    if(isBufferShader() && instrument == 1) {
        renderer.render(bufferScene, cameraOrtho, bufferTextureB, true)
        uniforms.iChannel0 = { value: bufferTextureB.texture }
    }

    uniforms.iFrame.value++;

    renderThreeJS();

    if(isBufferShader()) {
        let bufferTexture = bufferTextureA;
        bufferTextureA = bufferTextureB;
        bufferTextureB = bufferTexture;
        bufferObject.material.map = bufferTextureB.texture;
        bufferMaterial.uniforms.iChannel0.value = bufferTextureA.texture;
    }


    if(uniforms.canvasWasUpdated.value) {
        uniforms.canvasWasUpdated.value = false;
    }
    if(canvasWasUpdated) {
        canvasTexture.needsUpdate = true;
        uniforms.canvasWasUpdated.value = true;
        canvasWasUpdated = false;
    }

    if(instrument == 5) {
        updateSN(elapsedSeconds)
    }

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

        if(bufferObject) {
            bufferObject.geometry.vertices[0].x = bounds.min.x
            bufferObject.geometry.vertices[0].y = bounds.max.y
            bufferObject.geometry.vertices[1].x = bounds.max.x
            bufferObject.geometry.vertices[1].y = bounds.max.y
            bufferObject.geometry.vertices[3].x = bounds.max.x
            bufferObject.geometry.vertices[3].y = bounds.min.y
            bufferObject.geometry.vertices[2].x = bounds.min.x
            bufferObject.geometry.vertices[2].y = bounds.min.y
            bufferObject.geometry.verticesNeedUpdate = true
        }

        if(bufferTextureA) {
            bufferTextureA.setSize(window.innerWidth, window.innerHeight)
        }
        if(bufferTextureB) {
            bufferTextureB.setSize(window.innerWidth, window.innerHeight)
        }
    }
    
    if(uniforms != null) {
        let sizeX = bounds.max.x - bounds.min.x
        let sizeY = bounds.max.y - bounds.min.y
        uniforms.resolution.value.x = sizeX;
        uniforms.resolution.value.y = sizeY;
        uniforms.iFrame.value = 0;
        
    }

};

export function noteOn(event) {
    let data = event.detail
    let noteNumber = data.note.number
    let velocity = data.velocity

    if(instrument == 2) {       // FLAN
        flan(noteNumber, velocity)
        canvasWasUpdated = true;
    }
    
    if(instrument == 5) {
        noteOnSN(event)
    }

    notesOn.push({ note: noteNumber, velocity: velocity })

    if(uniforms) {
        uniforms.notesOn.value = notesOn;
    }
}

export function noteOff(event) {
    let data = event.detail
    let noteNumber = data.note.number
    let velocity = data.velocity
    
    let noteIndex = notesOn.findIndex((elem)=> elem.note == noteNumber)
    if(noteIndex >= 0) {
        notesOn.splice(noteIndex, 1)
    }

    if(instrument == 5) {

        noteOffSN(event)
    }

    if(uniforms) {
        uniforms.notesOn.value = notesOn;
    }
}
let noise = null
let oscillator = new Tone.OmniOscillator(200, 'fatsawtooth')
oscillator.count = 30
oscillator.spread = 20
oscillator.toMaster()
let oscillatorTween = 0

function initializeInstrument() {

    if(shaderName == 'city') {
        
        $(paper.view.element).hide()
        
        if(instrument == 0) {
            initializeTexture()
        }

        if(instrument == 1) {
            
            if(uniforms) {
                uniforms.iFrame.value = 0;
            }

            initializeDiffusion()

            let obj = {}
            obj[4] = 1
            var tween = new TWEEN.Tween(channels).to(obj, 2000).easing(TWEEN.Easing.Quadratic.InOut).start()
        }

        if(instrument == 2) {
            initializeFlan()
            $(paper.view.element).show()
        }

        if(instrument == 3) { // star field light speed
            startTime = Date.now()
            currentTime = 0
            oscillator.start()
            oscillatorTween = new TWEEN.Tween(oscillator).to({spread: 100*12*7}, 10000).easing(TWEEN.Easing.Quadratic.InOut).start()
        }
        if(instrument == 4) {
            noise = new Tone.Noise('pink').toMaster()
            noise.volume.value = -6;
            noise.start()
        }
        if(instrument == 5) { // slidingNotes
            initializeSN()
            $(paper.view.element).show()
        }

    }
}

function deactivateInstrument() {
    if(shaderName == 'city') {
        if(instrument == 0) {
            deactivateTexture()
        }
        if(instrument == 1) {
            deactivateDiffusion()
        }
        if(instrument == 2) {
            deactivateFlan()
        }
        if(instrument == 3) { // star field light speed
            console.log('deactivate 3')
            oscillator.stop()
            oscillatorTween.stop()
            oscillator.spread = 20
        }
        if(instrument == 4) {
            noise.stop()
        }  
        if(instrument == 5) { // slidingNotes
            deactivateSN()
        }
    }
}

let smooth = true

export async function controlchange(index, type, value) {
    
    if(shaderName == 'city') {
        if(instrument == 0) {                           // texture
            controlchangeTexture(index, type, value)
        } else if(instrument == 1){
            controlchangeDiffusion(index, type, value)
        }
    } else if(shaderName == 'fractal') {
        controlchangeFractal(index, type, value)
    }

    if(type == 'knob' && index >= 0 && index < channels.length) {
        let obj = {}
        obj[index] = value
        var tween = new TWEEN.Tween(channels).to(obj, shaderName == 'fractal' && smooth ? 1000 : 250).easing(TWEEN.Easing.Quadratic.InOut).start()
        
        if(index == 8) {
            speed = Math.pow(value, 2) * 10
        }
    }

    if(type == 'button-top') {

        if(value > 0.5) { 
            deactivateInstrument()
            instrument = index
            initializeInstrument()

            console.log('accumulator ' + index + ': ' + accumulators[index])
            accumulators[index]++
            
            
            if(shaderName == 'fractal' && index == 8) {
                accumulators[1] = 1
            }
            
            if(shaderName == 'fractal') {

                if(index == 1) {
                    uniforms.iFrame.value = 0
                    startTime = Date.now()
                    currentTime = 0
                }
            }

        } else { // release instrument
            
            // if(instrument == 4) { // noise is only an effect
            //     instrument = previousInstrument
            // } else {
            //     previousInstrument = instrument
            // }
            
            // initializeInstrument()
        }

        if(uniforms) {
            uniforms.instrument.value = instrument
            uniforms.accumulators.value = accumulators
        }

    }

    if(type == 'button-bottom') {
        if(value > 0.5) {
            
            smooth = false

            if(shaderName == 'city') {

                if(index == 0 && instrument == 1) {
                    uniforms.iFrame.value = 0
                    startTime = Date.now()
                    currentTime = 0
                }
                if(index == 1 && instrument == 1) {
                    uniforms.iFrame.value = 0
                    startTime = Date.now()
                    currentTime = 0
                }
                if(index == 2 && instrument == 1) {
                    startTime = Date.now()
                    currentTime = 0
                }
                if(index == 5 && instrument == 5) {
                    clearSN()
                }

            } else if(shaderName == 'fractal') {

                if(index == 1) {
                    uniforms.iFrame.value = 0
                    startTime = Date.now()
                    currentTime = 0
                }
            }
            console.log('accumulator ' + index + ': ' + accumulators[index])
            accumulators[index]--

            if(shaderName == 'fractal' && index == 8) {
                accumulators[1] = 0
            }
        } else {
            smooth = true
        }

        if(uniforms) {
            uniforms.accumulators.value = accumulators
        }
    }

    if(type == 'slider') {
        if(shaderName == 'city') {
            if(index == 2 && (instrument == 2 || instrument == 1) ){
                setHeight(value)
            }

            // sliders[index] = value
            let obj = {}
            obj[index] = value
            var tween = new TWEEN.Tween(sliders).to(obj, 1000).easing(TWEEN.Easing.Quadratic.InOut).start()
        } else if(shaderName == 'fractal') {
            sliders[index] = value

            let obj = {}
            obj[index] = value
            var tween = new TWEEN.Tween(sliders).to(obj, 250).easing(TWEEN.Easing.Quadratic.InOut).start()
        }
    }

}

export function mouseMove(event) {
    let x = event.clientX / window.innerWidth
    
    if(uniforms) {
        uniforms.iMouse.value.x = event.clientX;
        uniforms.iMouse.value.y = window.innerHeight - event.clientY;
    }

    startTime = Date.now() - maxTime * 1000 * x
    currentTime = 0
    updateTime()
}

export function keyDown(event) {
    if(event.key == ' ') {
        pause = !pause
    }
}

export function keyUp(event) {

}

document.addEventListener('resizeThreeJS', resize, false)
