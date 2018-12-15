import { scene, renderer, bounds, cameraOrtho, renderThreeJS, initializeThreeJS, container, resizeThreeJS } from './three-scene.js'
import { flan, setHeight, initializeFlan } from './flan.js'

var uniforms, material, mesh;

let startTime = Date.now();
let currentTime = startTime;
let maxTime = 60.0;
let pause = false;

let initialized = false;

let width = window.innerWidth;
let height = window.innerHeight;

export let channels = []
export let instrument = 0 //'texture'
export let previousInstrument = 0
// let instruments = ['texture', 'voices', 'effects']

let signals = []

for(let i=0 ; i<9 ; i++) {
    let signal = new Tone.Signal(0)
    signals.push(signal)
    channels.push(signal.value)
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

let slidingNotes = []

function createUniforms() {
    if(uniforms) {
        return uniforms
    }

    width = window.innerWidth;
    height = window.innerHeight;

    uniforms = {
        time: { type: "f", value: currentTime },
        resolution: { type: "v2", value: new THREE.Vector2(width, height) },
        channels: { type: "f", value: channels },
        iMouse: { type: "v4", value: new THREE.Vector4(0, 0) },
        iFrame: { type: "i", value: 0 },
        instrument: {type: "i", value: instrument},
        canvasWasUpdated: {value: false},
        notesOn: {type: 'i', value: notesOn }
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

    initializeFlan()
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

    // let background = new paper.Path.Rectangle(paper.view.bounds)
    // background.fillColor = 'rgb(10, 234, 34)'
    // paper.project.activeLayer.addChild(group)

    shaderName = newShaderName
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
    currentTime = startTime / 1000.0;
    
    if(uniforms) {
        uniforms.iFrame.value = 0;
    }
}

export function deactivate() {
	// $(renderer.domElement).hide()
    // scene.remove( mesh );
	// console.log(renderer.domElement.style.display)

    paper.project.clear()
    $(paper.view.element).hide()
}

function updateTime() {
    var elapsedMilliseconds = Date.now() - startTime;
    var elapsedSeconds = elapsedMilliseconds / 1000.;
    currentTime = elapsedSeconds;

    if(uniforms) {
        uniforms.time.value = elapsedSeconds;
    }
}

export function render() {
	if(renderer == null || uniforms == null) {
		return
	}
    
    if(!pause) {
        updateTime()
    }
    
    for(let i = 0 ; i<channels.length ; i++) {
        channels[i] = signals[i].value
    }

    uniforms.channels.value = channels;

    if(isBufferShader()) {
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

    if(instrument == 4) {
        let period = 10.0
        let x = time / period
        x *= paper.view.bounds.width
        for(let slidingNote of slidingNotes) {
            slidingNote.path.add(x, slidingNote.path.lastSegment.point.y)
        }
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



let noteMin = Tone.Frequency('A1').toMidi()
let noteMax = Tone.Frequency('C7').toMidi()

export function noteOn(event) {
    let data = event.detail
    let noteNumber = data.note.number
    let velocity = data.velocity

    if(instrument == 1 || instrument == 2) {       // FLAN

        flan(noteNumber, velocity)
        canvasWasUpdated = true;
    }
    
    if(instrument == 5) {
        let slidingNote = new paper.Path()
        slidingNote.strokeColor = 'black'
        slidingNote.strokeWidth = 1

        noteNumber = Math.max(noteNumber, noteMin)
        noteNumber = Math.min(noteNumber, noteMax)
        let noteY = (noteNumber - noteMin) / (noteMax - noteMin)
        noteY *= paper.view.bounds.height

        slidingNote.add(0, noteY)

        slidingNotes.push({ path: slidingNote, note: noteNumber} )
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

        let slidingNoteIndex = slidingNotes.findIndex((elem)=> elem.note == noteNumber)
        if(slidingNoteIndex >= 0) {
            // slidingNotes.path.remove()
            // slidingNotes.splice(slidingNoteIndex, 1)
        }
    }

    if(uniforms) {
        uniforms.notesOn.value = notesOn;
    }
}

export async function controlchange(index, type, value) {

    if(type == 'knob' && index >= 0 && index < signals.length) {
        
        if(shaderName == 'city') {
            signals[index].value = value
        } else {
            signals[index].linearRampTo(value, 1.5)
        }
    
    }

    if(type == 'button-top') {

        if(value > 0.5) { 
            previousInstrument = instrument
            instrument = index

            if(shaderName == 'city') {
                $(paper.view.element).hide()
                if(instrument == 2 || instrument == 5) {
                    $(paper.view.element).show()

                }

                if(instrument == 3) {
                    startTime = Date.now()
                }

            }
        } else {
            if(instrument == 4) { // noise is only an effect
                instrument = previousInstrument
            }
        }

        if(uniforms) {
            uniforms.instrument.value = instrument
        }

    }

    if(type == 'slider') {
        if(shaderName == 'city') {
            if(index == 2 && instrument == 2) {
                setHeight(value)
            }
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
