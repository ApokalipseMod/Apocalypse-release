import flixel.ui.FlxBar;
import flixel.ui.FlxBarFillDirection;
import flixel.text.FlxText;
import flixel.text.FlxTextAlign;
import flixel.math.FlxMath;
import flixel.util.FlxGradient;

var healthBar:FlxBar;
var thisHealth:Float = 1;
var lvTxt:FlxText;
var hpTxt:FlxText;
var healthTxt:FlxText;

var level:Int = 1;
if(FlxG.save.data.fallenDownWins != null) level += FlxG.save.data.fallenDownWins;
var numLabel:Int = 16 + (4 * level);
var txtLabel:String = ' / ' + (numLabel);
var name:String = 'KREKER';


if(PlayState.playAsOpponent){
    level = 1;
    numLabel = 1;
    txtLabel = '/1';
    name = 'SANS';
}

function onCreate(){
    PlayState.instance.introSoundsSuffix = '-sans';
    PlayState.instance.playerHealthBar.visible = false;
    PlayState.instance.enemyHealthBar.visible = false;
    PlayState.instance.health = 2;
    
    var grad:FlxSprite = FlxGradient.createGradientFlxSprite(FlxG.width * 2, 250, [0x00000000, FlxColor.BLACK]);
    grad.y = FlxG.height - 180; 
    PlayState.instance.uiGroup.add(grad);
    
    PlayState.instance.timeTxt.setFormat(Paths.font("PixelOperator-Bold.ttf"), 32, FlxColor.fromRGB(253, 253, 0));
    PlayState.instance.timeTxt.y -= 5;
    PlayState.instance.scoreTxt.setFormat(Paths.font("PixelOperator-Bold.ttf"), 32, FlxColor.fromRGB(253, 253, 0));

    lvTxt = new FlxText(135, FlxG.height * (!ClientPrefs.data.downScroll ? 0.89 : 0.11), "", name + '    LV ' + level);
    lvTxt.setFormat(Paths.font('undertale-small-font.ttf'), 38, FlxColor.WHITE, 'RIGHT'); //, FlxTextBorderStyle.OUTLINE, FlxColor.BLACK
    PlayState.instance.uiGroup.add(lvTxt);

    hpTxt = new FlxText(lvTxt.x + lvTxt.width + 72.5, lvTxt.y + 2.5, "HP", 'HP');
    hpTxt.setFormat(Paths.font('undertale-small-font.ttf'), 25, FlxColor.WHITE, 'CENTER');
    PlayState.instance.uiGroup.add(hpTxt);

    healthBar = new FlxBar(hpTxt.x + 45, lvTxt.y, FlxBarFillDirection.LEFT_TO_RIGHT, Math.round(40 + ((level - 1) * 7.222222222)), 30, PlayState.instance, 'health', 0, 2);  //////170 is the perfect width
    healthBar.createFilledBar(FlxColor.fromRGB(192, 0, 1), FlxColor.fromRGB(253, 253, 0));
    healthBar.numDivisions = 100;
    PlayState.instance.uiGroup.add(healthBar);

    healthTxt = new FlxText(healthBar.x + healthBar.width + 15, lvTxt.y + 2.5, "", '20 / ' + (16 + (4 * level)));
    healthTxt.setFormat(Paths.font('undertale-small-font.ttf'), 25, FlxColor.WHITE, 'CENTER');
    PlayState.instance.uiGroup.add(healthTxt);

}

function onUpdate(elapsed:Int){
    healthTxt.text = (Math.round(PlayState.instance.health * (numLabel / 2))) + txtLabel;

    if(PlayState.playAsOpponent && name == 'KREKER' || !PlayState.playAsOpponent && name == 'SANS'){
        if(!PlayState.playAsOpponent && name == 'SANS'){
            level = 1;
            if(FlxG.save.data.fallenDownWins != null) level += FlxG.save.data.fallenDownWins;
            numLabel = 16 + (4 * level);
            txtLabel = ' / ' + (numLabel);
            name = 'KREKER';
        }else{
            level = 1;
            numLabel = 1;
            txtLabel = '/1';
            name = 'SANS';
        }
        lvTxt.text = name + '    LV ' + level;
        hpTxt.x = lvTxt.x + lvTxt.width + 72.5;
        healthBar.x = hpTxt.x + 45;
        healthBar.width = Math.round(40 + ((level - 1) * 7.222222222));
        healthTxt.x = healthBar.x + healthBar.width + 15;
    }

    if(FlxG.keys.justPressed.F1) {
        FlxG.save.data.fallenDownWins = null;
        FlxG.save.flush();
    }
}

function onEndSong(){
    if(!PlayState.playAsOpponent){
        if(FlxG.save.data.fallenDownWins == null) FlxG.save.data.fallenDownWins = 1;
        FlxG.save.data.fallenDownWins += 1;
        FlxG.save.flush();
    }
}