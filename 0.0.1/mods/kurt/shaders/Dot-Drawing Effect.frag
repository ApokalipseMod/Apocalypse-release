// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel

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

/** 
 * Sketchy Stippling / Dot-Drawing Effect by Ruofei Du (DuRuofei.com)
 * Link to demo: https://www.shadertoy.com/view/ldSyzV
 * starea @ ShaderToy, License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License. 
 *
 * A one-pass shader for dotted drawing / sketch post processing effect. 
 * Press the mouse for a slower but more classic sketching effect, though I prefer the dotted version.
 * Shader forked and related ones are listed below.
 * Works better with video mipmaping.
 *
 * Reference: 
 * [1] Pencil vs Camera. http://www.duruofei.com/Research/pencilvscamera
 *
 * Forked or related:
 * [1] Pol's Photoshop Blends Branchless: https://www.shadertoy.com/view/Md3GzX
 * [2] Gaussian Blur: https://www.shadertoy.com/view/ltBXRh
 * [3] williammalo2's Blur with only one pixel read: https://www.shadertoy.com/view/XtGGzz
 * [3] demofox's greyscale: https://www.shadertoy.com/view/XdXSzX 
 * [4] iq's Postprocessing: https://www.shadertoy.com/view/4dfGzn
 * [5] related blur: https://www.shadertoy.com/view/XsVBDR
 *
 * Related masterpieces:
 * [1] flockaroo's Notebook Drawings: https://www.shadertoy.com/view/XtVGD1
 * [2] HLorenzi's Hand-drawn sketch: https://www.shadertoy.com/view/MsSGD1 
 **/
const float PI = 3.1415926536;
const float PI2 = PI * 2.0; 
const int mSize = 9;
const int kSize = (mSize-1)/2;
const float sigma = 3.0;
float kernel[mSize];

// Gaussian PDF
float normpdf(in float x, in float sigma) 
{
	return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

// 
vec3 colorDodge(in vec3 src, in vec3 dst)
{
    return step(0.0, dst) * mix(min(vec3(1.0), dst/ (1.0 - src)), vec3(1.0), step(1.0, src)); 
}

float greyScale(in vec3 col) 
{
    return dot(col, vec3(0.3, 0.59, 0.11));
    //return dot(col, vec3(0.2126, 0.7152, 0.0722)); //sRGB
}

vec2 random(vec2 p){
	p = fract(p * (vec2(314.159, 314.265)));
    p += dot(p, p.yx + 17.17);
    return fract((p.xx + p.yx) * p.xy);
}

vec2 random2(vec2 p)
{
    return texture(iChannel1, p / vec2(1024.0)).xy;
    //blue1 = texture(iChannel1, p / vec2(1024.0));
    //blue2 = texture(iChannel1, (p+vec2(137.0, 189.0)) / vec2(1024.0));    
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 q = fragCoord.xy / iResolution.xy;
    vec3 col = texture(iChannel0, q).rgb;
   
    vec2 r = random(q);
    r.x *= PI2;
    vec2 cr = vec2(sin(r.x),cos(r.x))*sqrt(r.y);
    
    vec3 blurred = texture(iChannel0, q + cr * (vec2(mSize) / iResolution.xy) ).rgb;
    
    // comparison
    if (iMouse.z > 0.5) {
        blurred = vec3(0.0); 
        float Z = 0.0;
        for (int j = 0; j <= kSize; ++j) {
            kernel[kSize+j] = kernel[kSize-j] = normpdf(float(j), sigma);
        }
        for (int j = 0; j < mSize; ++j) {
            Z += kernel[j];
        }
        
		// this can be done in two passes
        for (int i = -kSize; i <= kSize; ++i) {
            for (int j = -kSize; j <= kSize; ++j) {
                blurred += kernel[kSize+j]*kernel[kSize+i]*texture(iChannel0, (fragCoord.xy+vec2(float(i),float(j))) / iResolution.xy).rgb;
            }
    	}
   		blurred = blurred / Z / Z;
        
        // an interesting ink effect
        //r = random2(q);
        //vec2 cr = vec2(sin(r.x),cos(r.x))*sqrt(-2.0*r.y);
        //blurred = texture(iChannel0, q + cr * (vec2(mSize) / iResolution.xy) ).rgb;
    }
    
    vec3 inv = vec3(1.0) - blurred; 
    // color dodge
    vec3 lighten = colorDodge(col, inv);
    // grey scale
    vec3 res = vec3(greyScale(lighten));
    
    // more contrast
    res = vec3(pow(res.x, 3.0)); 
    //res = clamp(res * 0.7 + 0.3 * res * res * 1.2, 0.0, 1.0);
    
    // edge effect
    if (iMouse.z > 0.5) res *= 0.25 + 0.75 * pow( 16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.15 );
	fragColor = vec4(res, 1.0); 
}

void main() {
	mainImage(gl_FragColor, openfl_TextureCoordv*openfl_TextureSize);
}