var ogX:Float = dad.x - 250;
var sep:Float = boyfriend.x - ogX.x - 350;
function onCreate(){    
    //FlxTween.tween(dad, {y: dad.y + 50}, 0.4, {ease: FlxEase.elasticInOut, type: FlxTween.PINGPONG});
   // FlxTween.tween(boyfriend, {y: boyfriend.y + 50}, 0.4, {startDelay: 0.4, ease: FlxEase.elasticInOut, type: FlxTween.PINGPONG});
}

function onUpdate(elapsed:Int){
    dad.x = ogX + (1 - PlayState.instance.health / 2) * sep;
}