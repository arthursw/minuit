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
uniform float sliders[9];
uniform int notesOn[88];
uniform sampler2D iChannel0;
uniform int iFrame;
uniform int instrument;
const float minX = 0.001;

#define PI 3.1415926535897932384626433832795
#define TWO_PI 2.0 * PI

const float delta = 0.0025;
const float tau = 6.28318530717958647692;

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



// Gamma correction
#define GAMMA (2.2)

vec3 ToLinear( in vec3 col )
{
	// simulate a monitor, converting colour values into light values
	return pow( col, vec3(GAMMA) );
}

vec3 ToGamma( in vec3 col )
{
	// convert back into colour values, so the correct light will come out of the monitor
	return pow( col, vec3(1.0/GAMMA) );
}

vec4 Noise( in ivec2 ix )
{	
	vec2 x = vec2(ix)+noise(vec2(21.0, 1.24));
	float a = noise(x*vec2(90.5, 60.54));
	float b = noise(x*vec2(70.65, 1.1554));
	float c = noise(x*vec2(10.3, 10.54));
	float d = noise(x*vec2(6.5, 0.154));
	return vec4(a, b, c, d);
}

vec4 Rand( in int ix )
{
	float x = float(ix)+noise(21.0);
	float a = noise(x*vec2(90.5, 60.54));
	float b = noise(x*vec2(70.65, 1.1554));
	float c = noise(x*vec2(10.3, 10.54));
	float d = noise(x*vec2(6.5, 0.154));
	return vec4(a, b, c, d);
}

float hash1( float n )
{
    return fract(sin(n)*138.5453123);
}
float hash2( vec2 n, float a, float b )
{
    return abs(hash1(n.x*a+hash1(n.y*b)));
}

vec4 starField(vec2 fragCoord, float time, float initSpeed)
{
	vec3 ray;
	ray.xy = 2.0*(fragCoord.xy-resolution.xy*.5)/resolution.x;
	ray.z = 1.0;
    
	float mult = 1.0;
	float offset = PI + time;//*2.0*max(0.5, initSpeed);	

	float speed2 = (cos(min(offset, 2.0*PI))+1.0)*2.0*mult;
	// float speed2 = (1.0+1.0)*2.0*mult;
	// float speed2 = trail*4.0*mult;
	float speed = speed2+.1*mult;
	// offset += sin(min(offset, 2.0*PI)+PI)*.96;
	offset = pow(time*0.5*(1.0+initSpeed*0.1), 2.0)+PI;
	offset *= 2.0*mult;
	
	vec3 col = vec3(0);
	
	vec3 stp = ray/max(abs(ray.x),abs(ray.y));
	
	vec3 pos = 2.0*stp+.5;
	for ( int i=0; i < 20; i++ )
	{
		// float z = hash2(pos.xy, 0.25, 0.3);//
		// float z = Noise(ivec2(pos.xy*vec2(0.1, 0.2)*time)).x;
		float z = Noise(ivec2(pos.xy*vec2(3.1564,4.2154))).x;
		z = fract(z-offset);
		float d = 50.0*z-pos.z;
		float w = pow(max(0.0,1.0-8.0*length(fract(pos.xy)-.5)),2.0);
		vec3 c = max(vec3(0),vec3(1.0-abs(d+speed2*.5)/speed,1.0-abs(d)/speed,1.0-abs(d-speed2*.5)/speed));
		col += 1.5*(1.0-z)*c*w;
		pos += stp;
	}
	
	return vec4(ToGamma(col), 1.0);
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
	float s0 = sliders[0];
	float s1 = sliders[1];
	float s2 = sliders[2];
	float s3 = sliders[3];
	float s4 = sliders[4];
	float s5 = sliders[5];
	float s6 = sliders[6];
	float s7 = sliders[7];
	float s8 = sliders[8];
	

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
		float amplitude = s0*2000.0*noise(i*0.2454)*sin(time+noise(i)*100.0);
		float offset = s2*1000.0;
		float frequency = 0.1*noise(i*100.2454);
		float phase = 0.02*i*noise(i*10.2454)*20.0*time*s1;
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

	if( instrument == 0 ) {
		result = sineTexture(p);
	} else if(instrument == 1 || instrument == 5) {

		vec4 t = texture2D(iChannel0, vUv);
	    // vec4 t = texelFetch( iChannel0, ivec2(p), 0 );
	   // float w = 0.1*t.w;// 0.5+0.5*sin(2.90*t.w);
	    //fragColor = vec4(t.x*0.76, t.x*0.4+w*0.95, t.x+w*0.97, 1.0);
	    float pw = pow(t.w, 6.0 + c5);
	    vec3 wColor = c3 * vec3(0.3, 0.2, 0.7);
	    vec3 tColor = vec3(1.0);
	    float tx = t.x * c4;
	    result = vec4(tx*tColor + pw*wColor, 1.0);
	} else if(instrument == 3) {
		result = starField(p, time, c0);
	} else if(instrument == 4) {
		result = vec4(hash2(p, 45.2*mod(time,1.0), 12.3));
	}

    gl_FragColor = result;
}`;

