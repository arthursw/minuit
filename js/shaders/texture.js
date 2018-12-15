export let shader = `
// #version 300 es

precision highp float;
precision highp int;
// out vec4 out_FragColor;

varying vec2 vUv;
uniform float time;
uniform vec4 iMouse;
uniform vec2 resolution;
uniform float channels[9];
uniform sampler2D iChannel0;

#define PI 3.1415926535897932384626433832795
#define TWO_PI 2.0 * PI

const float delta = 0.0025;

float hash( float n )
{
    return fract(sin(n)*43745658.5453123);
}

float noise(vec2 pos)
{
	return fract( sin( dot(pos*0.001 ,vec2(24.12357, 36.789) ) ) * 12345.123);	
}

float noise(float r)
{
	return fract( sin( dot(vec2(r,-r)*0.001 ,vec2(24.12357, 36.789) ) ) * 12345.123);	
}


float wave(float amplitude, float offset, float frequency, float phase, float t)
{
	return offset+amplitude*sin(t*frequency+phase);
}

float wave(float amplitude, float offset, float frequency, float t)
{
	return offset+amplitude*sin(t*frequency);
}

float wave2(float min, float max, float frequency, float phase, float t)
{
	float amplitude = max-min;
	return min+0.5*amplitude+amplitude*sin(t*frequency+phase);
}

float wave2(float min, float max, float frequency, float t)
{
	float amplitude = max-min;
	return min+0.5*amplitude+amplitude*sin(t*frequency);
}

vec4 sineTexture(vec2 fragCoord )
{
	float colorSin = 0.0;
	float colorLine = 0.0;
	const int nSini = 25;
	const int nLinei = 30;
	
	float nSin = float(nSini);
	float nLine = float(nLinei);

    vec2 mouse = iMouse.xy + vec2(0.5* resolution.x, 0.1 * resolution.y);
    mouse = mod(mouse, resolution.xy);
	float line = 50.0; // mouse.y;
	// Sin waves
	for(int ii=0 ; ii<nSini ; ii++)
	{
		float i = float(ii);
		float amplitude = mouse.x*1.0*noise(i*0.2454)*sin(time+noise(i)*100.0);
		float offset = mouse.y;
		float frequency = 0.1*noise(i*100.2454);
		float phase = 0.02*i*noise(i*10.2454)*10.0*time*mouse.x/resolution.x;
		line += i*0.003*wave(amplitude,offset,frequency,phase,fragCoord.x);
		colorSin += 0.95/abs(line-fragCoord.y);
	}

	// Grid	
	for(int ii=0 ; ii<nLinei ; ii++)
	{
		float i = float(ii);
		float lx = (i/nLine)*(resolution.x+10.0);
		float ly = (i/nLine)*(resolution.y+10.0);
		colorLine += 0.07/abs(fragCoord.x-lx);
		colorLine += 0.07/abs(fragCoord.y-ly);
	}
	vec3 c = colorSin*vec3(0.2654, 0.4578, 0.654);
	c += colorLine*vec3(0.254, 0.6578, 0.554);
	return vec4(c, 1.0);
}

void main()
{
	float c0 = channels[0];
	float c1 = channels[1];
	float c2 = channels[2];
	float c3 = channels[3];
	float c4 = channels[4];
	float c5 = channels[5];
	float c6 = channels[6];
	float c7 = channels[7];
	float c8 = channels[8];
	

	vec2 r = resolution.xy;
	vec2 p = gl_FragCoord.xy;
	
	vec4 result = vec4(0.0);

	result = sineTexture(p);

    gl_FragColor = result;
}`;

