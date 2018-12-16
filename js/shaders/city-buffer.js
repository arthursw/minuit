export let shader = `
// #version 300 es

precision highp float;
precision highp int;
// out vec4 out_FragColor;

varying vec2 vUv;
uniform float time;
uniform vec2 resolution;
uniform vec4 iMouse;
uniform float channels[9];
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform int iFrame;
uniform int instrument;
uniform bool canvasWasUpdated;

#define PI 3.1415926535897932384626433832795
#define TWO_PI 2.0 * PI

const float minX = 0.001;

float hash1( float n )
{
    return fract(sin(n)*138.5453123);
}

float hash2( vec2 n, float a, float b )
{
    return abs(hash1(n.x*a+hash1(n.y*b)));
}

float hashi2( ivec2 n, float a, float b )
{
    return hash2(vec2(n), a, b);
}

vec4 Cell( in ivec2 p , ivec2 d)
{
    // do wrapping
    // ivec2 r = ivec2(textureSize(iChannel0, 0));
    // p = (p+d+r) % r;
    vec2 texel = vec2(1.0/resolution.x, 1.0/resolution.y);

    // fetch texel
    return texture2D(iChannel0, vUv+vec2(d)*texel); // texelFetch(iChannel0, p, 0 );
}

vec4 IsNeighbourComing( in ivec2 p , ivec2 d, bool couldBeEmitting, bool couldChangeDirection)
{
    vec4 c = Cell(p, d);
    
    bool isOn = c.x > minX;
    bool isComing = isOn && d.x == int(c.y) && d.y == int(c.z);
    
    float rand = hashi2(p, 13.43, 16.31);
    
    bool isEmitting = c.x > 0.999 && couldBeEmitting;
    float w = 1.25*rand;//0.75+0.5*sin(rand*time*2.0*PI/0.10);
    if(isComing) {
        bool changeDirection = couldChangeDirection;//hashi2(p, 43.03, 42.34) > 0.99;
        float dx = c.y;
        float dy = c.z;
        if(changeDirection) {
            dx = rand > 0.5 ? c.z : -c.z;
            dy = rand > 0.5 ? c.y : -c.y;
            
        }
        return vec4(1.0, dx, dy, w);
    } else if (isEmitting) {
    	return vec4(1.0, d.x, d.y, w);
    } else {
        return vec4(0.0, c.yzw);
    }
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

    ivec2 px = ivec2( p );
    
    vec4 current = Cell(px,ivec2(0, 0));
    
    vec4 k = vec4(0.0);
    
    float radius = 200.0;
    float lm = 300.0; // length(iMouse.xy - vec2(px));
    
    // bool kIsSet = false;
    if(canvasWasUpdated) {
    	vec4 t = texture2D(iChannel1, vUv);
    	
	    // if(instrument == 5 || t.x > 0.5) { 	// if in sliding notes: ignore if tx == 0

		    	float emittingProbability = c0 > 0.95 ? 1.0 : max(0.01, pow(c0, 5.0));
		    	bool on = t.x > 0.8 && hash2(p, 33.43, 63.31) < emittingProbability;
		    	k.x = on ? 1.0 : 0.0;

		    	if(k.x > 0.1) {
		    		float rand = hash2(p, 23.43, 6.31);
				    k.y = rand > 0.75 ? 1.0 : rand > 0.5 ? 0.0 : rand > 0.25 ? -1.0 : 0.0;
				    k.z = rand > 0.75 ? 0.0 : rand > 0.5 ? 1.0 : rand > 0.25 ? 0.0 : -1.0;
		    	}

	    // 	kIsSet = instrument != 5 || t.x > 0.5;
    	// }
    // }

    } else {

    // if(!kIsSet && lm > radius) {
        
        if(current.x > minX && iFrame > 0) {
            k = current;
            k.x *= 1.0 - pow(c2, 5.0);
            // if(c3 < 0.5) {
            // 	k.x = max(minX*1.1, k.x);
            // }
        } else {
            //float pulse = 0.5 + 0.5 * sin(time*0.10*2.0*3.1416);
            // float emittingProbability = 0.8 + pow(10.0, -2.0 + 2.0 * iMouse.x / resolution.x);
            float emittingProbability = pow(c0, 5.0);
            // float changeDirectionProbability = 0.8 + pow(10.0, -3.0 + 3.0 * iMouse.y / resolution.y);
            float changeDirectionProbability = pow(c1, 5.0);
			bool couldBeEmitting = hashi2(px, 87.03, 123.34) < emittingProbability;
			bool couldChangeDirection = hashi2(px, 43.03, 42.34) < changeDirectionProbability;
            vec4 kym1 = IsNeighbourComing(px,ivec2(0,-1), couldBeEmitting, couldChangeDirection);
            vec4 kxm1 = IsNeighbourComing(px,ivec2(-1, 0), couldBeEmitting, couldChangeDirection);
            vec4 kxp1 = IsNeighbourComing(px,ivec2(1, 0), couldBeEmitting, couldChangeDirection);
            vec4 kyp1 = IsNeighbourComing(px,ivec2(0, 1), couldBeEmitting, couldChangeDirection);

            k = kym1.x > minX ? kym1 : kym1.w > 0.01 ? kym1 : k;

            k = kxm1.x > minX ? kxm1 : kxm1.w > 0.01 && k.x < minX && kxm1.w > k.w ? kxm1 : k;
            k = kxp1.x > minX ? kxp1 : kxp1.w > 0.01 && k.x < minX && kxp1.w > k.w ? kxp1 : k;
            k = kyp1.x > minX ? kyp1 : kyp1.w > 0.01 && k.x < minX && kyp1.w > k.w ? kyp1 : k;

            /*
            k = kxm1.x > 0.9 ? kxm1 : kxm1.w > 0.01 && k.x < 0.01 ? kxm1 : k;
            k = kxp1.x > 0.9 ? kxp1 : kxp1.w > 0.01 && k.x < 0.01 ? kxp1 : k;
            k = kyp1.x > 0.9 ? kyp1 : kyp1.w > 0.01 && k.x < 0.01  ? kyp1 : k;
            */

            // k.w *= 0.999;//hash2(p, 21.43, 23.2);
            //float pulse = 0.95+0.05*sin(time*2.0*PI/3.40);
            bool pulse = sign(mod(time, 4.75)-0.1) > 0.0;
            k.w *= pulse ? 0.999 : 0.0; //+ pow(10.0, -5.0 + 2.1 * pulse);
            
            float change = hash2(p, 11.43, 14.31);
            
            k.w *= c5 < 0.01 ? 1.0 : (1.0 - pow(c5, 20.0) * change);
            
            if( iFrame==0 ) {

				float radius2 = 2.0;
				vec2 pToCenter = resolution/2.0 - vec2(px);
				float lm2 = length(pToCenter);

				if(lm2 < radius2) {
					k.x = 1.0;
					k.y = -sign(pToCenter.x);
					k.y = -sign(pToCenter.y);
				} else {
					k = vec4(0.0);
				}

                // k.x = step(0.999, hash2(p, 2.43, 43.2));

                // float rand = hash2(p, 23.43, 6.31);
                // k.y = rand > 0.75 ? 1.0 : rand > 0.5 ? 0.0 : rand > 0.25 ? -1.0 : 0.0;
                // k.z = rand > 0.75 ? 0.0 : rand > 0.5 ? 1.0 : rand > 0.25 ? 0.0 : -1.0;
            }
        }
    }

    gl_FragColor = k;
}`;