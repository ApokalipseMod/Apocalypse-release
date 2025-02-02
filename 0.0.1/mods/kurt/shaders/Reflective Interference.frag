// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel source: https://www.shadertoy.com/view/ldGfRz

#pragma header

#define round(a) floor(a + 0.5)
#define iResolution vec3(openfl_TextureSize, 0.)
uniform float iTime;
#define iChannel0 bitmap
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
#define texture flixel_texture2D

// third argument fix
vec4 flixel_texture2D(sampler2D bitmap, vec2 coord, float bias) {
	vec4 color = texture2D(bitmap, coord, bias);
	if (!hasTransform)
	{
		return color;
	}
	if (color.a == 0.0)
	{
		return vec4(0.0, 0.0, 0.0, 0.0);
	}
	if (!hasColorTransform)
	{
		return color * openfl_Alphav;
	}
	color = vec4(color.rgb / color.a, color.a);
	mat4 colorMultiplier = mat4(0);
	colorMultiplier[0][0] = openfl_ColorMultiplierv.x;
	colorMultiplier[1][1] = openfl_ColorMultiplierv.y;
	colorMultiplier[2][2] = openfl_ColorMultiplierv.z;
	colorMultiplier[3][3] = openfl_ColorMultiplierv.w;
	color = clamp(openfl_ColorOffsetv + (color * colorMultiplier), 0.0, 1.0);
	if (color.a > 0.0)
	{
		return vec4(color.rgb * color.a * openfl_Alphav, color.a * openfl_Alphav);
	}
	return vec4(0.0, 0.0, 0.0, 0.0);
}

// variables which is empty, they need just to avoid crashing shader
uniform float iTimeDelta;
uniform float iFrameRate;
uniform int iFrame;
#define iChannelTime float[4](iTime, 0., 0., 0.)
#define iChannelResolution vec3[4](iResolution, vec3(0.), vec3(0.), vec3(0.))
uniform vec4 iMouse;
uniform vec4 iDate;

const float PI = radians(180.);

float height(vec2 uv)
{
    float h = length(texture(iChannel0, uv).xyz);
    return 0.5e-6 + 2.0e-6 * h;
}

float height2(vec2 uv)
{
    return 5e-6 * uv.x;
}

const int bands = 5;
const float f1 = 0.5; // 1st reflection
const float f2 = 1.0; // 2nd reflection

vec2 light(float w, float s)
{
    s *= 2.0*PI/w;
    return vec2(cos(s), sin(s));
}

float power(vec2 l)
{
    return dot(l, l);
}

float interference(float w, float wd, float h)
{
    float tot = 0.0;
    for (int i=-bands ; i<=bands ; i++)
    {
        float id = float(i)/float(bands);
        float cw = w + wd * id;
        
        vec2 l = vec2(0); // light/phase
        float f = 1.0; // alpha

        // 1st, distance = 0  , shift = PI
        l += -light(cw, 0.0*h) * f * f1;
        f *= 1.0-f1;

        // 2nd, distance = 2*h, shift = 0
        l += +light(cw, 2.0*h) * f * f2;
        f *= 1.0-f2;

    	float sensitivity = cos(id * PI)+1.0;
        tot += sensitivity * power(l) / float(bands*2+1);
    }
    return tot;
}

vec3 measure(float h)
{
    return vec3(
        interference(650e-9, 60e-9, h),
        interference(532e-9, 40e-9, h),
        interference(441e-9, 30e-9, h)
	);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec3 col = vec3(0.0);

    float cut = iMouse.y/iResolution.y;
    if (cut == 0.0)
        cut = 0.5;
    if (uv.y <= 0.1)
    {
        col = measure(height(vec2(uv.x, cut)));
    }
    else if (uv.y <= 0.2)
    {
        float y = (uv.y-0.1)/0.1;
        vec2 muv = vec2(uv.x, cut);
        col = measure(height(muv));
        vec3 dc = 
            measure(height(muv+vec2(0.5/iResolution.x,0.0))) -
            measure(height(muv-vec2(0.5/iResolution.x,0.0)))
            ;
        col = mix(vec3(1.0), vec3(0.0), smoothstep(0.0, 10.0/iResolution.y, abs(col-vec3(y))-abs(dc*0.5)));
    }
    else if (uv.y <= 0.8)
    {
        col = measure(height(uv));
        col = sqrt(col);
        col = mix(vec3(1.0), col, smoothstep(0.0, 0.5/iResolution.y, abs(uv.y-cut)-0.5/iResolution.y));
    }
    else if (uv.y <= 0.9)
    {
        float y = (uv.y-0.8)/0.1;
        vec2 muv = uv;
        col = measure(height2(muv));
        vec3 dc = 
            measure(height2(muv+vec2(0.5/iResolution.x,0.0))) -
            measure(height2(muv-vec2(0.5/iResolution.x,0.0)))
            ;
        col = mix(vec3(1.0), vec3(0.0), smoothstep(0.0, 10.0/iResolution.y, abs(col-vec3(y))-abs(dc*0.5)));
    }
    else
    {
        col = measure(height2(uv));
    }

    fragColor = vec4(pow(col, vec3(1./2.2)), texture(iChannel0, uv).a);
}

void main() {
	mainImage(gl_FragColor, openfl_TextureCoordv*openfl_TextureSize);
}