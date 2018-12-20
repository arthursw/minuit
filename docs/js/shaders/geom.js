export let shader = `

uniform float time;
uniform vec2 resolution;
uniform float channels[9];

#define PI 3.1415926535897932384626433832795
#define TWO_PI 2.0 * PI

const float delta = 0.0025;

int modulo(int i, int m) {
	return i - m * (i / m);
}

float circle(vec2 p, vec2 c, float radius) {
	float dist = length(p - c);

	return 1.0 - smoothstep(- delta, delta, dist - radius);
}

float cosp(float angle, float offset) {
	return offset + (cos(angle) + 1.0) / 2.0;
}



//////////////////////////////////////
// Combine distance field functions //
//////////////////////////////////////


float smoothMerge(float d1, float d2, float k)
{
    float h = clamp(0.5 + 0.5*(d2 - d1)/k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0-h);
}


float merge(float d1, float d2)
{
	return min(d1, d2);
}


float mergeExclude(float d1, float d2)
{
	return min(max(-d1, d2), max(-d2, d1));
}


float substract(float d1, float d2)
{
	return max(-d1, d2);
}


float intersect(float d1, float d2)
{
	return max(d1, d2);
}


//////////////////////////////
// Rotation and translation //
//////////////////////////////


vec2 rotateCCW(vec2 p, float a)
{
	mat2 m = mat2(cos(a), sin(a), -sin(a), cos(a));
	return p * m;	
}


vec2 rotateCW(vec2 p, float a)
{
	mat2 m = mat2(cos(a), -sin(a), sin(a), cos(a));
	return p * m;
}


vec2 translate(vec2 p, vec2 t)
{
	return p - t;
}


//////////////////////////////
// Distance field functions //
//////////////////////////////


float pie(vec2 p, float angle)
{
	angle = radians(angle) / 2.0;
	vec2 n = vec2(cos(angle), sin(angle));
	return abs(p).x * n.x + p.y*n.y;
}


float circleDist(vec2 p, float radius)
{
	return length(p) - radius;
}


float triangleDist(vec2 p, float radius)
{
	return max(	abs(p).x * 0.866025 + 
			   	p.y * 0.5, -p.y) 
				-radius * 0.5;
}


float triangleDist(vec2 p, float width, float height)
{
	vec2 n = normalize(vec2(height, width / 2.0));
	return max(	abs(p).x*n.x + p.y*n.y - (height*n.y), -p.y);
}


float semiCircleDist(vec2 p, float radius, float angle, float width)
{
	width /= 2.0;
	radius -= width;
	return substract(pie(p, angle), 
					 abs(circleDist(p, radius)) - width);
}


float boxDist(vec2 p, vec2 size, float radius)
{
	size -= vec2(radius);
	vec2 d = abs(p) - size;
  	return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - radius;
}


float lineDist(vec2 p, vec2 start, vec2 end, float width)
{
	vec2 dir = start - end;
	float lngth = length(dir);
	dir /= lngth;
	vec2 proj = max(0.0, min(lngth, dot((start - p), dir))) * dir;
	return length( (start - p) - proj ) - (width / 2.0);
}


///////////////////////
// Masks for drawing //
///////////////////////


float fillMask(float dist)
{
	return clamp(-dist, 0.0, 1.0);
}


float innerBorderMask(float dist, float width)
{
	//dist += 1.0;
	float alpha1 = clamp(dist + width, 0.0, 1.0);
	float alpha2 = clamp(dist, 0.0, 1.0);
	return alpha1 - alpha2;
}


float outerBorderMask(float dist, float width)
{
	//dist += 1.0;
	float alpha1 = clamp(dist, 0.0, 1.0);
	float alpha2 = clamp(dist - width, 0.0, 1.0);
	return alpha1 - alpha2;
}

float tri(float x, float p) {
	return abs(mod(x, p) / p - 0.5);
}

void main()
{
	vec2 r = resolution.xy;
	vec2 p = gl_FragCoord.xy;

	vec2 q = (p+p-r) / r.y;

	float radius = 0.25;
	float color = 0.0;
	/*
	const int n = 3;

	for(int i=0 ; i<n ; i++) {
		float angle = 2.0 * PI * float(i) / float(n);
		float x = radius * cos(angle);
		float y = radius * sin(angle);
		color += circle(q, vec2(x, y), (radius * 1.0) );//* cosp(time * 0.1, 1.75) );
		// color += circle(q, vec2(x, y), radius );
	}
	*/

	// float x2 = mod(length(q), 1.0)/1.0;

	// vec2 x = vec2(1.0, 0.0);
	// float lp = length(q);
	// float angle = atan(q.y, q.x);
	// float y2 = mod(angle, PI / 4.0);
	// // color = x2 + y2;
	// color = circle(vec2(x2, y2), vec2(cosp(time*0.01, 0.0)*0.5), 0.1);

	// color = (1.0+sin(exp(0.01*time)*0.1*circleDist(q, radius)))/2.0;

	// color = (1.0+tri(exp(0.01*time)*0.1*circleDist(q, radius), TWO_PI))/2.0;
	// color = (1.0+tri(time*1.0*circleDist(q, radius), TWO_PI))/2.0;
	// color = step(0.0, sin(time*20.0*circleDist(q, radius)));
	// color = step(0.0, sin(time*20.0*length(q)));
	// color = sin(100.0*dot(q, q)) > 0.0 ? (1.0+sin(exp(0.01*time)*0.1*circleDist(q, radius)))/2.0 : (1.0+sin(time*dot(q, q)))/2.0;
	
	// color = smoothstep(-0.01, 0.01, sin(pow(1.20,time*0.07)*dot(q, q)));
	
	// Good
	// color = smoothstep(-0.01, 0.01, sin(-PI/2.0+pow(1.31, 140.0*channels[0]/128.0)*0.1*dot(q, q)));
	
	float d = min(0.0025, time * 0.0001);

	float timeMax = 60.0;

	float thickness = 0.9975 - channels[1];

	// if(channels[1] < 0.5) {
	// 	// color = smoothstep(thickness-delta, thickness+delta, sin(-PI/2.0+time*timeScale*20.1*dot(q, q)));
	// } else {
	// color = smoothstep(thickness-delta, thickness+delta, sin(-PI/2.0+pow(time*timeScale, 2.0)*0.1*dot(q, q)));	
	// }

	float phase = PI / 4.0;
	float timeScale = 1.0 - 0.5 * channels[0];
	float angle = phase + pow(1.8, time * timeScale) * 0.1 * dot(q, q);
	
	color = smoothstep(thickness-d, thickness+d, sin(angle));	

	// color = step(0.0, sin(pow(1.20,140.0*channels[0]/128.0)*dot(q, q)));

	// gl_FragColor = vec4(modulo(int(color), 3), modulo(int(color), 2), color, 1.0);
	gl_FragColor = vec4(color, color, color, 1.0);
	// gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}`;