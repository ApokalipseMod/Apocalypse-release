// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel source: https://www.shadertoy.com/view/4ssBWS

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

// created by florian berger (flockaroo) - 2017
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// halftone experiment + outlines + shading towards the edges
// basically an improved version of https://www.shadertoy.com/view/4ssyz4 using my
// pattern from https://www.shadertoy.com/view/lssfzX, and added some outline shading 
// inspired by shanes https://www.shadertoy.com/view/ldscWH
//
// BufA and BufB are only for blurring the image, so that the edges dont get too noisy

// uncomment those if you want a slight chrome look, engrave of pattern,
// brushed metal style, or a moving halftone pattern
#define REFLECTION
//#define ENGRAVE
//#define BRUSHED
//#define MOVE_PATTERN

#define Res (iResolution.xy)
#define Res1 (iChannelResolution[1].xy)
#define PI 3.14159265358979

vec2 tr_i(vec2 p)
{
    return (p*vec2(1,.5*sqrt(3.))+vec2(.5*p.y,0));
}

vec2 tr(vec2 p)
{
    return (p-vec2(p.y/sqrt(3.),0))/vec2(1,.5*sqrt(3.));
}

void getTri(vec2 p, inout vec2 p1, inout vec2 p2, inout vec2 p3, float size)
{
    vec2 pt=tr(p)/size;
    vec2 pf=floor(pt);
    vec2 pc=ceil(pt);
    p1=vec2(pf.x,pc.y);
    p2=vec2(pc.x,pf.y);
    p3=pc;
    if(dot(pt-pf,vec2(1))<1.) p3=pf;
    p1=tr_i(p1)*size;
    p2=tr_i(p2)*size;
    p3=tr_i(p3)*size;
}

float tri01(float x)
{
    return abs(fract(x)-.5)*2.;
}

vec4 getRand(vec2 pos)
{
    return texture(iChannel1,pos/Res1);
}

// emulated nearest sampling
vec4 getRandN(vec2 p)
{
    vec2 texc=(floor(p)+.5)/iChannelResolution[0].xy;
    return texture(iChannel1,texc);
}

// truchet-ish spirally pattern (see https://www.shadertoy.com/view/lssfzX)
float dist(vec2 p, float period, float size)
{
    vec2 p1,p2,p3;
    getTri(p,p1,p2,p3,size);
    vec4 rnd=getRandN((p1+p2+p3)/2.);
	float r=rnd.x;
	float r2=rnd.y;
	float r3=rnd.z;
    if(fract(r*2.)>.3333) { vec2 d=p3; p3=p2; p2=p1; p1=d; }
    if(fract(r*2.)>.6666) { vec2 d=p3; p3=p2; p2=p1; p1=d; }
    float d = 10000.;
    float ang;
    ang = acos(dot(normalize(p-p1),normalize(p3-p1)));
    d = min(d,length(p-p1)+(floor(r2*2.)*2.-1.)*period*ang/PI*3.);
    ang = acos(dot(normalize(p-p2),normalize(p3-p2)));
    d = min(d,length(p-p2)+(floor(r3*2.)*2.-1.)*period*ang/PI*3.);
    return tri01((d-.5*size)/period)*.5*period;
}

vec4 getCol(vec2 pos)
{
    return texture(iChannel0,pos/iResolution.xy);
}

float getVal(vec2 pos)
{
    return dot(getCol(pos).xyz,vec3(.3333));
}

// modified version of shane's sFloor (https://www.shadertoy.com/view/ldscWH), but
// just using linear (1.-fx) smoothing also does the trick instead of fx*(1.-fx)
// and im smoothing after the step (not before as in shane's version)
float sFloorOld(float x, float sm){ float fx = fract(x); return x - max(fx, 1. - fx/fwidth(x)/sm); }

// ... but finally chose to use some power func, to get differentiable smooth edge 
// (gives better normals - see further below)
// x^n has 1st moment (in the interval 0..1) of 1-1/n (so the width of the edge towards x=1 
// is prop to 1/n), so (1-fract)^(1/smooth) should give a proper differentiable smoothing
float sFloor(float x, float sm){ float fx = fract(x); return x - fx - pow(1.-fx,2./fwidth(x)/sm); }

float quantize(float v, int num)
{
    return floor(v*float(num)+.5)/float(num);
}

float squantize(float v, int num, float sm)
{
    return sFloor(v*float(num)+.5,sm)/float(num);
}

float gauss(float x)
{
    return exp(-x*x);
}

// final pattern of quantized layers
float htPattern(vec2 pos, int lnum, out vec3 n)
{
    float b0=getVal(pos);
    float bq=quantize(b0,lnum);

    float size=50./sqrt(600./iResolution.x)*(.2+.8*bq)*4.5;
    size = max(20.,size);
    float per = size/15.;
    float thr = per*.5*clamp(.8-sqrt(bq),0.1,.7);
    
    vec2 offs = vec2(0);
    #ifdef MOVE_PATTERN
    offs = size * .1*vec2(cos(iTime+bq),sin(iTime+bq)*(mod(bq*float(lnum),2.)*2.-1.));
    #endif
    float d = dist(pos+offs,per,size);
    float p = smoothstep(thr-per*.1,thr+per*.1,d)*1.7-.7;
    n=vec3(0);
    #ifdef ENGRAVE
    n=normalize(vec3(-dFdx(d),-dFdy(d),1))*gauss((d-1.5*thr)/per/.07)*.2;
    #endif
    return p;
}

// simple cubemap reflection
vec4 getReflection(vec2 fragCoord, vec3 n)
{
    vec3 dir=normalize(vec3(0,0,-1)+1.5*vec3((fragCoord.xy-iResolution.xy*.5)/iResolution.x,0));
    float fres=1.-clamp(dot(-dir,n),0.,1.);
    vec3 R=reflect(dir,normalize(n*vec3(1,1,1)))*vec3(1,-1,1);
    float c=cos(iTime*.5);
    float s=sin(iTime*.5);
    mat2 m=mat2(c,s,-s,c);
    R.xz=m*R.xz;
    //fres*=fres;
    return texture(iChannel3,R*vec3(1,-1,1));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    #define SampNum 24
    #define Quant (3+int(sqrt(iResolution.x/1920.)*10.))
    #define Spread 7.
	vec2 pos=fragCoord;
	float b = quantize(getVal(pos),Quant);
    // smooth quantization
	float bs  = squantize (getVal(pos),Quant,5.);
    float delta=2.7*sqrt(iResolution.y/1080.);
    vec2 eps=vec2(delta,0);
    // gradient of smooth quantization (for normals)
	vec2 bsgrad=vec2(0);
    bsgrad.x += squantize (getVal(pos+eps.xy),Quant,delta);
    bsgrad.x -= squantize (getVal(pos-eps.xy),Quant,delta);
    bsgrad.y += squantize (getVal(pos+eps.yx),Quant,delta);
	bsgrad.y -= squantize (getVal(pos-eps.yx),Quant,delta);
	float bs3 = squantize (getVal(pos),Quant,3.7);

    // calc some ambient occlusion
    float ao=0.;
    float ao2=0.;
    float spread = Spread*sqrt(Res.x/600.);
    for(int i=0;i<SampNum;i++)
    {
        vec2 delta = texture(iChannel1,(pos+vec2(0,123*i))/Res1).xy*2.-1.;
	    // lets spread slightly off axis
    	// so we get the impression of a diffuse lightsource from upper left
        // and lets take 2 diffuse light sources
        vec2 delta1=delta+vec2(-.5,.3)*.7;    // from upper right
        vec2 delta2=delta+vec2(.7,.5)*.7;     // from upper left
        
        float b1 = quantize(getVal(pos+spread*delta1),Quant);
        float b2 = quantize(getVal(pos+spread*delta2),Quant);
        if(b1>b) ao+=(1.-length(delta1))+1.;
        if(b2>b) ao2+=(1.-length(delta2))+1.;
        //if(b2>b) ao+=1.;
    }
    ao/=float(SampNum);
    ao2/=float(SampNum);

    // 2 light colors from 2 different directions
    vec3 col1=vec3(.5,0.,-.5)*2.+1.;
    vec3 col2=vec3(-.5,0.,.5)*2.+1.;
    
    float bc = getVal(pos);
    float s=sin((bc*float(Quant)+.5)*PI)*.03*sqrt(1280./iResolution.y)/fwidth(bc);
    float outline=exp(-s*s);
    
    vec4 rand=vec4(0);
    #ifdef BRUSHED
    rand=getRand(pos*vec2(1.3,.15)*.75)-.5+getRand(pos*vec2(.15,1.3)*.75)-.5;
    #endif
    
    // calc pattern and normals
    vec3 n=normalize(vec3(-1.5*bsgrad,1));
    vec3 n2;
	float patt = htPattern(pos,Quant,n2);
    n=normalize(n+vec3(rand.xy*.03,0)+vec3(n2.xy,0));

    
    fragColor=vec4(1);
    
#ifdef REFLECTION
    // cubemap reflection
    fragColor=fragColor*.6+getReflection(fragCoord,n)*.4;
#endif
    
    // apply ao and pattern
	fragColor *= vec4(0)+(
        +.45*vec4(col1,1)*(1.-.5*ao )
        +.55*vec4(col2,1)*(1.-.5*ao2)
                        )*(.8+.3*b)*(.6+.05*rand.x+.4*patt);
	
    // diffuse lighting
    fragColor*=max(.9,dot(n,vec3(1,1,1)));
    
    // vignetting
    vec2 c=(fragCoord.xy-.5*Res)/(.8*Res.x);
    float vign=clamp(1.2-1.*dot(c,c),0.,1.);
    fragColor*=vign;
    
    // slightly emphasize the outlines of the quantization layers
    fragColor.xyz*=1.-.4*outline;
}


void main() {
	mainImage(gl_FragColor, openfl_TextureCoordv*openfl_TextureSize);
}