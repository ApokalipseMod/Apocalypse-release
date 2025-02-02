// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel source: https://www.shadertoy.com/view/ld2XWD

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

float GetTexture(float x, float y)
{
    return texture(iChannel0, vec2(x, y) / iResolution.xy).x;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float threshold = iMouse.x / iResolution.x;
    
    if(iMouse.x == 0.0) // Browse preview
    {
        threshold = 0.2;
    }
    
    float x = fragCoord.x;
    float y = fragCoord.y;
    
    float xValue = -GetTexture(x-1.0, y-1.0) - 2.0*GetTexture(x-1.0, y) - GetTexture(x-1.0, y+1.0)
        + GetTexture(x+1.0, y-1.0) + 2.0*GetTexture(x+1.0, y) + GetTexture(x+1.0, y+1.0);
    float yValue = GetTexture(x-1.0, y-1.0) + 2.0*GetTexture(x, y-1.0) + GetTexture(x+1.0, y-1.0)
        - GetTexture(x-1.0, y+1.0) - 2.0*GetTexture(x, y+1.0) - GetTexture(x+1.0, y+1.0);
    
    if(length(vec2(xValue, yValue)) > threshold)
    {
        fragColor = vec4(0);
    }
    else
    {
        vec2 uv = vec2(x, y) / iResolution.xy;
    	vec4 currentPixel = texture(iChannel0, uv);
        fragColor = currentPixel;
    }
}

void main() {
	mainImage(gl_FragColor, openfl_TextureCoordv*openfl_TextureSize);
}