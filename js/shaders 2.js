import { scene, renderer, bounds, cameraOrtho, renderThreeJS, initializeThreeJS, container, resizeThreeJS } from './three-scene.js'

var uniforms, material, mesh;

let startTime = Date.now();
let currentTime = startTime;
let maxTime = 60.0;
let pause = false;

let initialized = false;

let width = window.innerWidth;
let height = window.innerHeight;

export let channels = []
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
    
    uniforms = createUniforms()

    uniforms.iChannel0 = { value: bufferTextureA.texture }

    bufferMaterial = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        // extensions: { derivatives: true },
        fragmentShader: fragmentShader.trim(), 
        side: THREE.DoubleSide
    } )

    return bufferMaterial
}

async function createBufferScene(fragmentShader) {

    //Create buffer scene
    bufferScene = new THREE.Scene()
    //Create buffer texture

    bufferTextureA = new THREE.WebGLRenderTarget( window.innerWidth/2, window.innerHeight/2, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false } )
    bufferTextureB = new THREE.WebGLRenderTarget( window.innerWidth/2, window.innerHeight/2, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false } )

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

    fileChanged(fragmentShader.shader, bufferFragmentShader.shader)
}

export async function fileChanged(fragmentShader, bufferFragmentShader) {
	mesh.material = await createMaterial(fragmentShader)
    
    if(isBufferShader()) {
        bufferObject.material = await createBufferMaterial(bufferFragmentShader)
    }

    resizeThreeJS()
}

export function activate(newShaderName) {
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
}

function updateTime() {
    var elapsedMilliseconds = Date.now() - startTime;
    var elapsedSeconds = elapsedMilliseconds / 1000.;
    currentTime = elapsedSeconds;
    uniforms.time.value = elapsedSeconds;
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

    if(isBufferShader()) {
        renderer.render(bufferScene, cameraOrtho, bufferTextureB, true)
        uniforms.iChannel0 = { value: bufferTextureB.texture }
    }

    uniforms.channels.value = channels;
    uniforms.iFrame.value++;

    renderThreeJS();

    if(isBufferShader()) {
        let bufferTexture = bufferTextureA;
        bufferTextureA = bufferTextureB;
        bufferTextureB = bufferTexture;
        bufferObject.material.map = bufferTextureB.texture;
        bufferMaterial.uniforms.iChannel0.value = bufferTextureA.texture;
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

export function mouseMove(event) {
    let x = event.clientX / window.innerWidth

    uniforms.iMouse.value.x = event.clientX;
    uniforms.iMouse.value.y = event.clientY;

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
