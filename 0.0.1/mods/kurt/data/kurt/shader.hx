function onCreate()
{
	//game.initLuaShader(shaderName);
    game.camGame.setFilters([
		//new ShaderFilter(game.createRuntimeShader('tripney spears')), 
	]);
	//game.camHUD.setFilters([new ShaderFilter(shaderTag)]);
    game.camHUD.setFilters([
		new ShaderFilter(game.createRuntimeShader('tripney spears')), 
	]);
}