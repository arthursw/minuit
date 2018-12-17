export let shader = `

varying vec2 vUv;
uniform float time;
uniform float realTime;
uniform vec4 iMouse;
uniform vec2 resolution;
uniform float channels[9];
uniform float sliders[9];
uniform int accumulators[9];
uniform int notesOn[88];
uniform sampler2D iChannel0;
uniform int iFrame;
uniform int n;
const float minX = 0.001;

#define PI 3.1415926535897932384626433832795

#define TWO_PI 2.0 * PI

const float fadeInDuration = 10.0;

int modulo(int i, int m) {
	return i - m * (i / m);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec2 magic(vec2 q, int im, float c0, float c1, float phase) {
	vec2 offset = vec2(c0, c1);
	offset.x = offset.x + 0.25 + 0.25 * sin(time + phase);
	offset.y = offset.y + 0.25 + 0.25 * sin(time + phase);
	return im > 0 ? abs(q)/(q.x*q.y) - offset : abs(q)/dot(q,q) - offset;
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
	
	float s8 = sliders[8];

	int nIterations = accumulators[0];
	int fractalNumber = modulo(accumulators[1], nIterations);
	bool symmetry = modulo(accumulators[2], 2) == 0;
	bool lightAmountMode = modulo(accumulators[7], 2) == 0;
	// int shuffle = accumulators[3];

	vec2 r = resolution.xy;
	vec2 p = gl_FragCoord.xy;

	float zoom = 0.1+10.0*pow(c6, 3.0);
	vec2 q = zoom * (p+p-r) / r.y;

	if(symmetry) {
		q = abs(q.yx);
	}

	vec2 q1 = q;
	vec2 q2 = q;
	vec2 q3 = q;

	vec3 o = vec3(0.0, 0.0, 0.0);

	float power = 500.0 * (1.0 - c2 * 0.9);

	for(int i=0 ; i<128 ; i++) {
		
		int im = fractalNumber  == 0 ? 1 : modulo(i, fractalNumber);
		
		q1 = magic(q1, im, c0, c1, 0.0);
		q2 = magic(q2, im, c0, c1, c3);
		q3 = magic(q3, im, c0, c1, c3*2.0);

		float lightAmount = lightAmountMode ? c7 + 0.25 : (1.0 - c7) * 0.25
		;
		lightAmount *= 4.0;
		float p = mod(float(i)+realTime*10.0*s8, 4.0) > 3.0 ? power / lightAmount : power;

		o.r += length(q1) / p;
		o.g += length(q2) / p;
		o.b += length(q3) / p;

		if(i>nIterations) {
			break;
		}
	}

    vec3 color = mix(o, rgb2hsv(o), c5);

    vec3 chsv = rgb2hsv(color);
    chsv.x = mod(chsv.x + c4*0.1, 1.0);

    color = hsv2rgb(chsv);
    
    float fadeIn = realTime > fadeInDuration ? 1.0 : realTime / fadeInDuration;

	gl_FragColor = vec4(fadeIn * color, 1.0);
}
`;
