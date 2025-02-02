// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel shaderURL: https://www.shadertoy.com/view/XtXcDS

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

const mat3 yuv_2_rgb = mat3(1.0, 1.0, 1.0,
                            0.0, -0.39465, 2.03211,
                            1.13983, -0.58060, 0.0);

const mat3 rgb_2_yuv = mat3(0.299, -0.14713, 0.615,
                            0.587, -0.28886, -0.51499,
                            0.114, 0.436, -0.10001);

float edge(vec2 uv, float stepsize) {
	float x = length(
                     texture(iChannel0, uv - vec2(stepsize, 0.0)).rgb -
                     texture(iChannel0, uv + vec2(stepsize, 0.0)).rgb);
    
	float y = length(
                     texture(iChannel0, uv - vec2(0.0, stepsize)).rgb -
                     texture(iChannel0, uv + vec2(0.0, stepsize)).rgb);
    return (x + y) / stepsize;
}


vec3 color_quantize_yuv(in vec3 color) {
    const float yuv_step = 0.1;
 	vec3 yuv = rgb_2_yuv * color;
    yuv.x = 0.2 + 0.8 * yuv.x;
    vec3 quantized =
        vec3(0.1 * (0.2 + round(10.0 * yuv.x)),
             0.125 * (0.25 * sign(yuv.yz) + round(8.0 * yuv.yz)));
    return yuv_2_rgb * quantized;
}

vec3 orangize(in vec3 col) {
     mat3 blowout = mat3(1.87583893, 0.96308725, 0.,
       0.96308725, 1.17416107, 0.,
       0.        , 0.        , 0.5);
    vec3 cent = vec3(0.47968451, 
                     0.450743, 
                     0.45227517) + 0.2;
   
    
    vec3 dir = blowout * (col - cent);
    
    vec3 maxes = (step(vec3(0.0), dir) - col)/dir;
    
    float amount = min(maxes.x, min(maxes.y, maxes.z));
    
    return col + dir * 0.5 * amount;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    float edgesize = 2.0 / min(iResolution.x, iResolution.y);
    float edge_modulate =
        smoothstep(30.0, 15.0, 0.4 * edge(uv, edgesize));
    vec3 color = orangize(color_quantize_yuv(texture(iChannel0, uv).rgb));
    vec3 line_color = vec3(0.1);
	fragColor = vec4(mix(line_color, color, edge_modulate),texture(iChannel0, uv).a);
}

void main() {
	mainImage(gl_FragColor, openfl_TextureCoordv*openfl_TextureSize);
}