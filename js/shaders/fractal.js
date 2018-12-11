export let shader = `

uniform float time;
uniform vec2 resolution;
uniform float channels[9];

void main()
{
	vec2 r = resolution.xy;
	vec2 p = gl_FragCoord.xy;

	vec2 q = 25.0 * (channels[4] / 128.0) * (p+p-r) / r.y;
	vec4 o = vec4(0.0, 0.0, 0.0, 1.0);

	for(int i=0 ; i<128 ; i++) {
		float x = resolution.x * channels[0] / 128.0;
		float y = resolution.y * channels[1] / 128.0;
		float lq = dot(q,q);
		if(channels[5] <= 1.0) {
			q = abs(q) / lq - vec2(x, y)/r;// + sin(time*0.1*channels[6] / 128.0 );
		} else if(channels[5] <= 2.0) {
			q = abs(q) / (q.x * q.y) - vec2(x, y)/r;
		} else if(channels[5] <= 3.0) {
			int modulo = i - 3 * (i / 3);
			q = modulo > 0 ? abs(q) / (q.x * q.y) - vec2(x, y)/r : abs(q) / lq - vec2(x, y)/r;
		}
		
		o += length(q) / (1000.0 * channels[3] / 128.0);
		if(i>int(channels[2])) {
			break;
		}
	}

	gl_FragColor = o;
}`;