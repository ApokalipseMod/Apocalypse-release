import objects.BGSprite; 
import flixel.util.FlxColor;
import flixel.addons.effects.FlxClothSprite;
import flixel.util.FlxDirectionFlags;
function onCreate()
{
	var bg:FlxSprite = new FlxSprite().makeGraphic(FlxG.width * 2, FlxG.height * 2, FlxColor.WHITE);
	bg.screenCenter();
	bg.scrollFactor.set();
	addBehindDad(bg);

	// This show how to load a simple graphic sprite with crossing constraints
	var rope:FlxClothSprite = new FlxClothSprite(0, 0, Paths.image('logo2'), 5, 10, false);
	rope.maxVelocity.set(40, 40);
	rope.meshVelocity.y = 40;
	rope.scrollFactor.set();
	rope.screenCenter();
	add(rope);
}