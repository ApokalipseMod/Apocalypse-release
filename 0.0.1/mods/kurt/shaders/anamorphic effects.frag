// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel source: https://www.shadertoy.com/view/3tfcD8

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

float NoiseSeed;
float randomFloat(){
  NoiseSeed = sin(NoiseSeed) * 84522.13219145687;
  return fract(NoiseSeed);
}

float SCurve (float value, float amount, float correction) {

	float curve = 1.0; 

    if (value < 0.5)
    {

        curve = pow(value, amount) * pow(2.0, amount) * 0.5; 
    }
        
    else
    { 	
    	curve = 1.0 - pow(1.0 - value, amount) * pow(2.0, amount) * 0.5; 
    }

    return pow(curve, correction);
}




//ACES tonemapping from: https://www.shadertoy.com/view/wl2SDt
vec3 ACESFilm(vec3 x)
{
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return (x*(a*x+b))/(x*(c*x+d)+e);
}




//Chromatic Abberation from: https://www.shadertoy.com/view/XlKczz
vec3 chromaticAbberation(sampler2D tex, vec2 uv, float amount)
{
    float aberrationAmount = amount/10.0;
   	vec2 distFromCenter = uv - 0.5;

    // stronger aberration near the edges by raising to power 3
    vec2 aberrated = aberrationAmount * pow(distFromCenter, vec2(3.0, 3.0));
    
    vec3 color = vec3(0.0);
    
    for (int i = 1; i <= 8; i++)
    {
        float weight = 1.0 / pow(2.0, float(i));
        color.r += texture(tex, uv - float(i) * aberrated).r * weight;
        color.b += texture(tex, uv + float(i) * aberrated).b * weight;
    }
    
    color.g = texture(tex, uv).g * 0.9961; // 0.9961 = weight(1)+weight(2)+...+weight(8);
    
    return color;
}




//film grain from: https://www.shadertoy.com/view/wl2SDt
vec3 filmGrain()
{
    return vec3(0.9 + randomFloat()*0.15);
}




//Sigmoid Contrast from: https://www.shadertoy.com/view/MlXGRf
vec3 contrast(vec3 color)
{
    return vec3(SCurve(color.r, 3.0, 1.0), 
                SCurve(color.g, 4.0, 0.7), 
                SCurve(color.b, 2.6, 0.6)
               );
}




//anamorphic-ish flares from: https://www.shadertoy.com/view/MlsfRl
vec3 flares(sampler2D tex, vec2 uv, float threshold, float intensity, float stretch, float brightness)
{
    threshold = 1.0 - threshold;
    
    vec3 hdr = texture(tex, uv).rgb;
    hdr = vec3(floor(threshold+pow(hdr.r, 1.0)));
    
    float d = intensity; //200.;
    float c = intensity*stretch; //100.;
    
    
    //horizontal
    for (float i=c; i>-1.0; i--)
    {
        float texL = texture(tex, uv+vec2(i/d, 0.0)).r;
        float texR = texture(tex, uv-vec2(i/d, 0.0)).r;
        hdr += floor(threshold+pow(max(texL,texR), 4.0))*(1.0-i/c);
    }
    
    //vertical
    for (float i=c/2.0; i>-1.0; i--)
    {
        float texU = texture(tex, uv+vec2(0.0, i/d)).r;
        float texD = texture(tex, uv-vec2(0.0, i/d)).r;
        hdr += floor(threshold+pow(max(texU,texD), 40.0))*(1.0-i/c) * 0.25;
    }
    
    hdr *= vec3(0.5,0.4,1.0); //tint
    
	return hdr*brightness;
}




//glow from: https://www.shadertoy.com/view/XslGDr (unused but useful)
vec3 samplef(vec2 tc, vec3 color)
{
	return pow(color, vec3(2.2, 2.2, 2.2));
}

vec3 highlights(vec3 pixel, float thres)
{
	float val = (pixel.x + pixel.y + pixel.z) / 3.0;
	return pixel * smoothstep(thres - 0.1, thres + 0.1, val);
}

vec3 hsample(vec3 color, vec2 tc)
{
	return highlights(samplef(tc, color), 0.6);
}

vec3 blur(vec3 col, vec2 tc, float offs)
{
	vec4 xoffs = offs * vec4(-2.0, -1.0, 1.0, 2.0) / iResolution.x;
	vec4 yoffs = offs * vec4(-2.0, -1.0, 1.0, 2.0) / iResolution.y;
	
	vec3 color = vec3(0.0, 0.0, 0.0);
	color += hsample(col, tc + vec2(xoffs.x, yoffs.x)) * 0.00366;
	color += hsample(col, tc + vec2(xoffs.y, yoffs.x)) * 0.01465;
	color += hsample(col, tc + vec2(    0.0, yoffs.x)) * 0.02564;
	color += hsample(col, tc + vec2(xoffs.z, yoffs.x)) * 0.01465;
	color += hsample(col, tc + vec2(xoffs.w, yoffs.x)) * 0.00366;
	
	color += hsample(col, tc + vec2(xoffs.x, yoffs.y)) * 0.01465;
	color += hsample(col, tc + vec2(xoffs.y, yoffs.y)) * 0.05861;
	color += hsample(col, tc + vec2(    0.0, yoffs.y)) * 0.09524;
	color += hsample(col, tc + vec2(xoffs.z, yoffs.y)) * 0.05861;
	color += hsample(col, tc + vec2(xoffs.w, yoffs.y)) * 0.01465;
	
	color += hsample(col, tc + vec2(xoffs.x, 0.0)) * 0.02564;
	color += hsample(col, tc + vec2(xoffs.y, 0.0)) * 0.09524;
	color += hsample(col, tc + vec2(    0.0, 0.0)) * 0.15018;
	color += hsample(col, tc + vec2(xoffs.z, 0.0)) * 0.09524;
	color += hsample(col, tc + vec2(xoffs.w, 0.0)) * 0.02564;
	
	color += hsample(col, tc + vec2(xoffs.x, yoffs.z)) * 0.01465;
	color += hsample(col, tc + vec2(xoffs.y, yoffs.z)) * 0.05861;
	color += hsample(col, tc + vec2(    0.0, yoffs.z)) * 0.09524;
	color += hsample(col, tc + vec2(xoffs.z, yoffs.z)) * 0.05861;
	color += hsample(col, tc + vec2(xoffs.w, yoffs.z)) * 0.01465;
	
	color += hsample(col, tc + vec2(xoffs.x, yoffs.w)) * 0.00366;
	color += hsample(col, tc + vec2(xoffs.y, yoffs.w)) * 0.01465;
	color += hsample(col, tc + vec2(    0.0, yoffs.w)) * 0.02564;
	color += hsample(col, tc + vec2(xoffs.z, yoffs.w)) * 0.01465;
	color += hsample(col, tc + vec2(xoffs.w, yoffs.w)) * 0.00366;

	return color;
}

vec3 glow(vec3 col, vec2 uv)
{
    vec3 color = blur(col, uv, 2.0);
	color += blur(col, uv, 3.0);
	color += blur(col, uv, 5.0);
	color += blur(col, uv, 7.0);
	color /= 4.0;
	
	color += samplef(uv, col);
    
    return color;
}




//margins from: https://www.shadertoy.com/view/wl2SDt
vec3 margins(vec3 color, vec2 uv, float marginSize)
{
    if(uv.y < marginSize || uv.y > 1.0-marginSize)
    {
        return vec3(0.0);
    }else{
        return color;
    }
}




void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    
    vec2 uv = fragCoord.xy/iResolution.xy;
    
    vec3 color = texture(iChannel0, uv).xyz;
    
    
    //chromatic abberation
    color = chromaticAbberation(iChannel0, uv, 0.8);
    
    
    //film grain
    color *= filmGrain();
    
    
    //ACES Tonemapping
  	color = ACESFilm(color);
    
    
    //contrast
    color = contrast(color) * 0.9;
    
    
    //flare
    color += flares(iChannel0, uv, 0.9, 200.0, 0.5, 0.06);
    
    
    //margins
    color = margins(color, uv, 0.1);
    
    
    //output
    fragColor = vec4(color, texture(iChannel0, uv).a);
}

void main() {
	mainImage(gl_FragColor, openfl_TextureCoordv*openfl_TextureSize);
}