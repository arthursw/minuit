export let shader = `
uniform float amplitude;
void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
}`;