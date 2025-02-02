import objects.BGSprite; 

var back:BGSprite;
var front:BGSprite;
function onCreate()
{
	back = new BGSprite('stages/krekerStage/KrekerBackBG', -300, 100, 0.8, 0.8);
	back.setGraphicSize(Std.int(back.width * 1.6));
	back.updateHitbox();
	addBehindDad(back);

	front = new BGSprite('stages/krekerStage/KrekerBG', -250, 120, 0.9, 0.9);
	front.setGraphicSize(Std.int(front.width * 1.6));
	front.updateHitbox();
	addBehindDad(front);
}

function onUpdate(){
	back.scale.y = camGame.zoom * 2.3;
	front.scale.x = camGame.zoom * 2.3;
}