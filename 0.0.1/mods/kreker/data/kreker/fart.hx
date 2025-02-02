var bfX:Float = 0;

function onCreate(){
    PlayState.instance.enemyHealthBar.visible = false;
    bfX = PlayState.instance.boyfriend.x;
}

function onUpdate(elapsed){
    PlayState.instance.boyfriend.x = bfX + (camGame.zoom * 500);
}