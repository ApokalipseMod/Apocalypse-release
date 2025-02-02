import objects.BGSprite; 

function onCreate()
{

	var white = new BGSprite(null, -800, -400, 0, 0);
	white.makeGraphic(Std.int(FlxG.width * 2), Std.int(FlxG.height * 2), FlxColor.WHITE);
	white.alpha = 1;
	addBehindDad(white);

	var back = new BGSprite('stages/test/crimsonbg', -300, 100, 0.8, 0.8, ['movingbg'], true);
	//back.setGraphicSize(Std.int(back.width * 1.6));
	//back.updateHitbox();
	addBehindDad(back);
}