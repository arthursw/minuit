export let shader = `
uniform float time;
uniform vec2 resolution;
uniform float channels[9];

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

	vec2 q = 25.0 * c4 * (p+p-r) / r.y;
	vec4 o = vec4(0.0, 0.0, 0.0, 1.0);

	for(int i=0 ; i<128 ; i++) {
		float x = resolution.x * c0;
		float y = resolution.y * c1;
		float lq = dot(q,q);
		if(3.0*c5 <= 1.0) {
			q = abs(q) / lq - vec2(x, y)/r;// + sin(time*0.1*channels[6] / 128.0 );
		} else if(3.0*c5 <= 2.0) {
			q = abs(q) / (q.x * q.y) - vec2(x, y)/r;
		} else if(3.0*c5 <= 3.0) {
			int modulo = i - 3 * (i / 3);
			q = modulo > 0 ? abs(q) / (q.x * q.y) - vec2(x, y)/r : abs(q) / lq - vec2(x, y)/r;
		}
		
		o += length(q) / (1000.0 * c3);
		if(i>int(c2*128.0)) {
			break;
		}
	}

	gl_FragColor = o;
}
`;
