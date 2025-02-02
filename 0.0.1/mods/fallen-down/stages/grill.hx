import objects.BGSprite; 

var bear:FlxSprite;
var mouse:FlxSprite;

function onCreate()
{
	var back:BGSprite = new BGSprite('stages/grill/stageSans', 1280, 150, 1, 1);
	back.setGraphicSize(Std.int(back.width * 8.8));
	back.updateHitbox();
	back.antialiasing = false;
	addBehindDad(back);

	bear = new FlxSprite(3050, 1790);
	bear.frames = Paths.getAtlas('stages/grill/sansNPCBear');
	bear.animation.addByPrefix('0', "0", 2);
	bear.setGraphicSize(Std.int(bear.width * 9));
	bear.updateHitbox();
	bear.antialiasing = false;
	addBehindDad(bear);

	mouse = new FlxSprite(5160, 1890);
	mouse.frames = Paths.getAtlas('stages/grill/sansNPCMouse');
	mouse.animation.addByPrefix('0', "0", 2);
	mouse.setGraphicSize(Std.int(mouse.width * 8.8));
	mouse.updateHitbox();
	mouse.antialiasing = false;
	addBehindDad(mouse);
}

function onBeatHit()
{
	bear.animation.play('0');
	mouse.animation.play('0');
}