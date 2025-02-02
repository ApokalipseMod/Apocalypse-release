import DucknJump;

var bones:Array<FlxSprite> = [];
var hitBox:FlxSprite;
var cpuHitBox:FlxSprite;
var cpuJmpHitBox:FlxSprite;
var sfx:FlxSprite;
var jumping:Bool = false;
var ducking:Bool = false;
var movementSfx:Bool = false;
var boneTouching:Bool = false; //freaky bone 
var stayDucked:Bool = false; //stupid dumb botplay needs this to know that it doesnt have to always duck and it can stay laying down after a jump 

function onEvent(name, value1, value2){
    if(name == ''){
        var height:Float;
        if(value1 == '1') height = 2400 else height = 2300;

        var type:String = 'bone';
        switch(value2) {
            case '1': 
                type = 'bone-blue';
            case '2': 
                type = 'bone-orange';
        }

        trace(PlayState.instance.health);

		var bone:FlxSprite = new FlxSprite(dad.x + 425, height).loadGraphic(Paths.image('stages/grill/' + type));
        bone.ID = value2;
        bone.setGraphicSize(Std.int(bone.width * 4));
        bone.updateHitbox();
        bone.angle = 90;
        bone.antialiasing = false;
        bone.alpha = 0;
        add(bone);
        bones.push(bone);

        dad.playAnim('shoot');
        dad.specialAnim = true; 
        //dad.allowUpdate = false;

        FlxG.sound.play(Paths.sound('sans/warning'));

        FlxTween.tween(bone, {alpha: 1}, 0.8);
        FlxTween.tween(bone, {x: bone.x + 3000}, 3, {
            //ease: FlxEase.circOut,
            startDelay: 0.8,
            onComplete: function(twn:FlxTween) {
                bone.kill();
                bones.remove(bone);
                bone.destroy();
            }
        });
    }
}

function onUpdate(){
    if(!boyfriend.stunned){
        movementCheck();
        boneCheck();
    }
}

function onCreate(){
    hitBox = new FlxSprite(boyfriend.x - 90, boyfriend.y - 55).makeGraphic(250, 250, FlxColor.BLACK);
    hitBox.alpha = 0;
    add(hitBox);
    cpuHitBox = new FlxSprite(boyfriend.x - 190, boyfriend.y - 55).makeGraphic(350, 250, FlxColor.BLACK);
    cpuHitBox.alpha = 0;
    add(cpuHitBox);
    Paths.sound('sans/warning');
    Paths.sound('sans/hurt');
    Paths.sound('sans/duck');
    Paths.sound('sans/jump');
    Paths.sound('sans/fall');
    Paths.image('stages/grill/bone');
    Paths.image('stages/grill/bone-blue');
    Paths.image('stages/grill/bone-orange');
}

function movementCheck(){
    if(!PlayState.instance.cpuControlled && !PlayState.playAsOpponent){
        if(controls.JUMP_P && boyfriend.animation.curAnim.name == 'idle') jump();
        if(controls.CROUCH_P && boyfriend.animation.curAnim.name == 'idle') duck();
    }else{
        stayDucked = false;
        boneTouching = false;
        for (bone in bones){
            if(bone.overlaps(cpuHitBox) && bone.ID != 1) boneTouching = true; else{
                if(bone.y == 2300 && bone.ID != 1 && boyfriend.animation.curAnim.name == 'jump' && boyfriend.animation.curAnim.curFrame > 6) stayDucked = true;
            }
        }

        cpuHitBox.alpha = 0;
        for (bone in bones) if(bone.overlaps(cpuHitBox) && bone.y == 2400){cpuHitBox.alpha = 0.8; stayDucked = false;}
    }

        if(((!controls.JUMP_P && !PlayState.instance.cpuControlled && !PlayState.playAsOpponent) || ((PlayState.instance.cpuControlled || PlayState.playAsOpponent) && !boneTouching && !stayDucked)) && jumping && (boyfriend.animation.curAnim.finished || (boyfriend.animation.curAnim.curFrame < 1))){
            jumping = false;
            boyfriend.playAnim('jump-end');
            boyfriend.specialAnim = true; 
            boyfriend.allowUpdate = true;
        }

        if(((!controls.CROUCH_P && !PlayState.instance.cpuControlled && !PlayState.playAsOpponent) || ((PlayState.instance.cpuControlled || PlayState.playAsOpponent) && !boneTouching)) && ducking){
            ducking = false;
            boyfriend.playAnim('duck-end');
            boyfriend.specialAnim = true; 
            boyfriend.allowUpdate = true;
        }

        if(boyfriend.animation.curAnim.name == 'jump' && boyfriend.animation.curAnim.curFrame > 6 && !movementSfx){
            movementSfx = true;
            FlxG.sound.play(Paths.sound('sans/fall'));
        }
}

function jump(){
    jumping = true;
    movementSfx = false;
    FlxG.sound.play(Paths.sound('sans/jump'));
    boyfriend.playAnim('jump');
    boyfriend.specialAnim = true; 
    boyfriend.allowUpdate = false;
}

function duck(){
    ducking = true;
    FlxG.sound.play(Paths.sound('sans/duck'));
    boyfriend.playAnim('duck');
    boyfriend.specialAnim = true; 
    boyfriend.allowUpdate = false;
}


function boneCheck(){
    if(sfx != null && !sfx.overlaps(hitBox)) sfx = null;
    for (bone in bones){
        if(PlayState.instance.cpuControlled || PlayState.playAsOpponent){
            if(bone.overlaps(cpuHitBox) && bone.ID != 1){
                if(bone.y == 2300 && !ducking && boyfriend.animation.curAnim.name == 'idle' && !(boyfriend.animation.curAnim.name == 'jump' && boyfriend.animation.curAnim.curFrame > 6)){
                    duck(); 
                }else{
                    if(bone.y == 2400 && !jumping && boyfriend.animation.curAnim.name == 'idle') jump();
                } 
            }
        }else{
            if (bone.overlaps(hitBox)){
                if (bone.ID == 1) {
                    if (boyfriend.animation.curAnim.name == 'duck' || boyfriend.animation.curAnim.name == 'jump') {
                        PlayState.instance.set_health(0);
                    }
                } else {
                    if((bone.y == 2300 && (boyfriend.animation.curAnim.name != 'duck' && !(boyfriend.animation.curAnim.name == 'jump' && boyfriend.animation.curAnim.curFrame > 6))) || (bone.y == 2400 && (boyfriend.animation.curAnim.name != 'jump' || (boyfriend.animation.curAnim.name == 'jump' && boyfriend.animation.curAnim.curFrame > 7)))){
                        if(bone.ID == 2){
                            PlayState.instance.set_health(0);
                        }else{
                            if(sfx == null) {
                                FlxG.sound.play(Paths.sound('sans/hurt'));
                                sfx = bone;
                            }
                            boyfriend.playAnim('hurt');
                            boyfriend.specialAnim = true; 
                            PlayState.instance.set_health(PlayState.instance.health - 0.00002 * FlxG.drawFramerate);
                        }
                    }
                }
            }
        }
    }
}