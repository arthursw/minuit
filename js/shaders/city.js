export let shader = `
// #version 300 es

precision highp float;
precision highp int;
// out vec4 out_FragColor;

varying vec2 vUv;
uniform float time;
uniform vec2 resolution;
uniform float channels[9];
uniform sampler2D iChannel0;

#define PI 3.1415926535897932384626433832795
#define TWO_PI 2.0 * PI

const float delta = 0.0025;

void main()
{
	vec2 r = resolution.xy;
	vec2 p = gl_FragCoord.xy;

	vec4 t = texture2D(iChannel0, vUv);
    // vec4 t = texelFetch( iChannel0, ivec2(p), 0 );
   // float w = 0.1*t.w;// 0.5+0.5*sin(2.90*t.w);
    //fragColor = vec4(t.x*0.76, t.x*0.4+w*0.95, t.x+w*0.97, 1.0);
    float pw = pow(t.w, 6.0);
    vec3 wColor = 0.0 * vec3(0.3, 0.2, 0.7);
    vec3 tColor = vec3(1.0);

    gl_FragColor = vec4(t.x*tColor + pw*wColor, 1.0);
}`;