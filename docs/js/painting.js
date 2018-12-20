import { setActiveCamera, bounds, cameraPerspective, cameraOrtho, scene, renderer, renderThreeJS, initializeThreeJS, container, resizeThreeJS } from './three-scene.js'

var backgroundMaterial, meshMaterial, group, mesh, background;

let initialized = false;

function createQuad(left, right, top, bottom, depth, material) {
    var geometry = new THREE.Geometry();

    geometry.vertices.push( new THREE.Vector3( left, top, depth ) );
    geometry.vertices.push( new THREE.Vector3( right, top, depth ) );
    geometry.vertices.push( new THREE.Vector3( right, bottom, depth ) );
    geometry.vertices.push( new THREE.Vector3( left, bottom, depth ) );

    geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
    geometry.faces.push( new THREE.Face3( 2, 3, 0 ) );

    geometry.computeBoundingSphere();

    let quad = new THREE.Mesh( geometry, material );
    group.add( quad );
    return quad
}

// let point1 = null
// let point2 = null
// let point3 = null
// let point4 = null

export async function initialize(shaderName) {
    initializeThreeJS();
    
    group = new THREE.Group()
    scene.add(group)

    // backgroundMaterial = new THREE.MeshBasicMaterial( {color: 0xFFFFFF, transparent: true, opacity: 0.03} );
    meshMaterial = new THREE.MeshBasicMaterial( {color: 0x000000, opacity: 1} );

    let depth = 1
    background = createQuad(bounds.left, bounds.right, bounds.top, bounds.bottom, depth, backgroundMaterial)

    let size = 10;
    mesh = createQuad(-size, size, size, -size, depth, meshMaterial)

    // size *= 0.5
    // point1 = createQuad(-size, size, size, -size, depth, new THREE.MeshBasicMaterial( {color: 0x00FF00, opacity: 1} ))
    // point2 = createQuad(-size, size, size, -size, depth, new THREE.MeshBasicMaterial( {color: 0x00FF00, opacity: 1} ))
    // point3 = createQuad(-size, size, size, -size, depth, new THREE.MeshBasicMaterial( {color: 0xFF0000, opacity: 1} ))
    // point4 = createQuad(-size, size, size, -size, depth, new THREE.MeshBasicMaterial( {color: 0xFF0000, opacity: 1} ))

    initialized = true;
}

export function activate(shaderName) {
    if(!initialized) {
        initialize(shaderName)
    } else {
        scene.add( group );
        $(renderer.domElement).show()
    }
    setActiveCamera(cameraOrtho)
}

export function deactivate() {
    $(renderer.domElement).hide()
    scene.remove( group );
}

let previousNote = 0
let position = new THREE.Vector2(0, 0)
let velocity = 0
let directionIndex = 0
let direction = new THREE.Vector2(0, 0)
let noteIsOff = false
let vertices = []

function moveVertex(position) {

    position.x += direction.x
    position.y += direction.y
    
    if(position.x < bounds.min.x) {
        position.x = bounds.max.x
    } else if(position.x > bounds.max.x) {
        position.x = bounds.min.x
    }
    
    if(position.y < bounds.min.y) {
        position.y = bounds.max.y
    } else if(position.y > bounds.max.y) {
        position.y = bounds.min.y
    }
}

export function render() {

    // mesh.geometry.vertices[0].x = 
    // mesh.geometry.verticesNeedUpdate = true

    // if(vertices.length >= 4) {

    //     // let zmt = vertices[0].clone().sub(vertices[2]).normalize().multiplyScalar(1)
    //     // let omt = vertices[1].clone().sub(vertices[3]).normalize().multiplyScalar(1)
    //     // vertices[2].copy(vertices[0].clone().add(zmt))
    //     // vertices[3].copy(vertices[1].clone().add(omt))
    //     // vertices[3].x = vertices[1].x
    //     // vertices[3].y = vertices[1].y

    //     moveVertex(mesh.geometry.vertices[0])
    //     moveVertex(mesh.geometry.vertices[1])
    //     // moveVertex(vertices[2])
    //     // moveVertex(vertices[3])

    //     mesh.geometry.verticesNeedUpdate = true

    // }
    
    moveVertex(mesh.geometry.vertices[0])
    moveVertex(mesh.geometry.vertices[1])
    moveVertex(position)

    // point1.position.copy(mesh.geometry.vertices[0])
    // point2.position.copy(mesh.geometry.vertices[1])
    // point3.position.copy(mesh.geometry.vertices[2])
    // point4.position.copy(mesh.geometry.vertices[3])

    mesh.geometry.verticesNeedUpdate = true

    if(noteIsOff) {
        direction.multiplyScalar(0.9)
    }
    

    renderThreeJS();
}

export function resize() {

};

// let directionIndexToVertical = [true, true, false, false, true, true, false, false]

export function noteOn(event) {
    let note = event.detail.note
    let noteVelocity = 4 // event.detail.velocity * 4

    directionIndex += (note.number - previousNote) % 8
    // console.log(directionIndex, note.number, previousNote)
    let angle = directionIndex * Math.PI / 4
    direction.x = -Math.cos(angle)
    direction.y = Math.sin(angle)

    let vertical = directionIndex % 4 < 2
    previousNote = note.number
    velocity = noteVelocity / 2
    
    let center = position
    let size = velocity * Math.random() * 1.5

    mesh.geometry.vertices[1].x = center.x - size * Math.cos(angle + Math.PI / 4)
    mesh.geometry.vertices[1].y = center.y + size * Math.sin(angle + Math.PI / 4)
    mesh.geometry.vertices[0].x = center.x - size * Math.cos(angle + 5 * Math.PI / 4)
    mesh.geometry.vertices[0].y = center.y + size * Math.sin(angle + 5 * Math.PI / 4)
    mesh.geometry.vertices[3].x = mesh.geometry.vertices[0].x
    mesh.geometry.vertices[3].y = mesh.geometry.vertices[0].y
    mesh.geometry.vertices[2].x = mesh.geometry.vertices[1].x
    mesh.geometry.vertices[2].y = mesh.geometry.vertices[1].y
    // mesh.geometry.vertices[2].copy(mesh.geometry.vertices[1])

    // vertices = []

    // if(directionIndex % 8 == 0) {
    //     mesh.geometry.vertices[1].x = center.x - size
    //     mesh.geometry.vertices[1].y = center.y + size
    //     mesh.geometry.vertices[2].x = center.x - size
    //     mesh.geometry.vertices[2].y = center.y - size
    //     mesh.geometry.vertices[0].copy(mesh.geometry.vertices[1])
    //     mesh.geometry.vertices[3].copy(mesh.geometry.vertices[2])

    //     vertices.push(mesh.geometry.vertices[1])
    //     vertices.push(mesh.geometry.vertices[2])
    //     vertices.push(mesh.geometry.vertices[0])
    //     vertices.push(mesh.geometry.vertices[3])
    // } else if(directionIndex % 8 == 1) {
    //     mesh.geometry.vertices[1].x = center.x
    //     mesh.geometry.vertices[1].y = center.y + size
    //     mesh.geometry.vertices[2].x = center.x
    //     mesh.geometry.vertices[2].y = center.y - size
    //     mesh.geometry.vertices[0].copy(mesh.geometry.vertices[1])
    //     mesh.geometry.vertices[3].copy(mesh.geometry.vertices[2])

    //     vertices.push(mesh.geometry.vertices[1])
    //     vertices.push(mesh.geometry.vertices[2])
    //     vertices.push(mesh.geometry.vertices[0])
    //     vertices.push(mesh.geometry.vertices[3])
    // } else if(directionIndex % 8 == 2) {
    //     mesh.geometry.vertices[0].x = center.x + size
    //     mesh.geometry.vertices[0].y = center.y + size
    //     mesh.geometry.vertices[1].x = center.x - size
    //     mesh.geometry.vertices[1].y = center.y - size
    //     mesh.geometry.vertices[3].copy(mesh.geometry.vertices[0])
    //     mesh.geometry.vertices[2].copy(mesh.geometry.vertices[1])

    //     vertices.push(mesh.geometry.vertices[0])
    //     vertices.push(mesh.geometry.vertices[1])
    //     vertices.push(mesh.geometry.vertices[3])
    //     vertices.push(mesh.geometry.vertices[2])
    // } else if(directionIndex % 8 == 3) {
    //     mesh.geometry.vertices[0].x = center.x + size
    //     mesh.geometry.vertices[0].y = center.y + size
    //     mesh.geometry.vertices[1].x = center.x - size
    //     mesh.geometry.vertices[1].y = center.y - size
    //     mesh.geometry.vertices[3].copy(mesh.geometry.vertices[0])
    //     mesh.geometry.vertices[2].copy(mesh.geometry.vertices[1])

    //     vertices.push(mesh.geometry.vertices[0])
    //     vertices.push(mesh.geometry.vertices[1])
    //     vertices.push(mesh.geometry.vertices[3])
    //     vertices.push(mesh.geometry.vertices[2])
    // } else if(directionIndex % 8 == 4) {
    //     vertices.push(mesh.geometry.vertices[0])
    //     vertices.push(mesh.geometry.vertices[3])
    //     vertices.push(mesh.geometry.vertices[1])
    //     vertices.push(mesh.geometry.vertices[2])
    // } else if(directionIndex % 8 == 5) {
    //     vertices.push(mesh.geometry.vertices[0])
    //     vertices.push(mesh.geometry.vertices[3])
    //     vertices.push(mesh.geometry.vertices[1])
    //     vertices.push(mesh.geometry.vertices[2])
    // } else if(directionIndex % 8 == 6) {
    //     vertices.push(mesh.geometry.vertices[2])
    //     vertices.push(mesh.geometry.vertices[3])
    //     vertices.push(mesh.geometry.vertices[1])
    //     vertices.push(mesh.geometry.vertices[0])
    // } else if(directionIndex % 8 == 7) {
    //     vertices.push(mesh.geometry.vertices[2])
    //     vertices.push(mesh.geometry.vertices[3])
    //     vertices.push(mesh.geometry.vertices[1])
    //     vertices.push(mesh.geometry.vertices[0])
    // }

    direction.multiplyScalar(velocity)
    // console.log(velocity)
    // position.add(direction)
    noteIsOff = false
}

export function noteOff(event) {
    noteIsOff = true
}

export async function controlchange(e) {
}

document.addEventListener('resizeThreeJS', resize, false)
