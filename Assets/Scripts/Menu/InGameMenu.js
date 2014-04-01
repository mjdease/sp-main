﻿#pragma strict

private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
private var gameSetupScript : GameSetupScript;

private var game : Game;
private var self : Player;

private var countdownActive : boolean = false;
private var goTexture : Texture2D;
private var countdown1 : Texture2D;
private var countdown2 : Texture2D;
private var countdown3 : Texture2D;

private var guiInGame: GuiClasses [];
guiInGame = new GuiClasses[1];
for (var z = 0; z < guiInGame.length; z++) {
    guiInGame[z] = new GuiClasses();
}


function Start(){
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
    gameSetupScript = gameManager.GetComponent(GameSetupScript);

    game = gameSetupScript.game;
    self = playerScript.getSelf();

    goTexture = Resources.Load("Textures/gui/go", Texture2D);
    countdown1 = Resources.Load("Textures/gui/count_1", Texture2D);
    countdown2 = Resources.Load("Textures/gui/count_2", Texture2D);
    countdown3 = Resources.Load("Textures/gui/count_3", Texture2D);

}

function OnGUI(){
    if(Config.DEBUG){
        OnDebugGUI();
    }
    // TODO - Add good UI
    //Countdown
    guiInGame[0].textureWidth = Screen.width / 1.5;
    guiInGame[0].textureHeight = Screen.height / 1;
    guiInGame[0].setLocation(Points.Center);

    var gameState = stateScript.getGameState();
    if(gameState == GameState.Loading){
        switch(gameSetupScript.getCountDown()){
            case 0:
               if(countdownActive) {
                    GUI.DrawTexture(new Rect(guiInGame[0].offset.x, guiInGame[0].offset.y, guiInGame[0].textureWidth, guiInGame[0].textureHeight), goTexture);
                }
            break;
            case 1:
                    countdownActive = true;
                    GUI.DrawTexture(new Rect(guiInGame[0].offset.x, guiInGame[0].offset.y, guiInGame[0].textureWidth, guiInGame[0].textureHeight), countdown1);
            break;
            case 2:
                GUI.DrawTexture(new Rect(guiInGame[0].offset.x, guiInGame[0].offset.y, guiInGame[0].textureWidth, guiInGame[0].textureHeight), countdown2);
            break;
            case 3:
                GUI.DrawTexture(new Rect(guiInGame[0].offset.x, guiInGame[0].offset.y, guiInGame[0].textureWidth, guiInGame[0].textureHeight), countdown3);
            break;
        }
    }
}

function OnDebugGUI(){
    GUILayout.BeginArea(Rect (Screen.width - 10 - 200, 10, 200, Screen.height - 10*2));
    GUILayout.BeginVertical(GUILayout.MaxHeight(Screen.height - 10*2));
    GUI.backgroundColor = Color.white;
    GUI.contentColor = Color.black;

    GUILayout.Label("Debug Menu");

    if(GUILayout.Button("Leave Game")){
        gameSetupScript.leaveGame();
        return;
    }

    var gameState = stateScript.getGameState();

    GUILayout.Space(10);
    GUILayout.Label("State: " + gameState.ToString());

    switch(gameState){
        case GameState.Uninitialized :
            break;
        case GameState.Loading :
            GUILayout.Space(10);
            GUILayout.Label("Game Starts In: " + gameSetupScript.getCountDown());
            break;
        case GameState.Playing :
            var teams : List.<Team> = game.getTeams();
            for(var team : Team in teams){
                GUILayout.Space(10);
                GUILayout.Label("Team " + team.getId() + " - Distance: " + team.getDistance() + " - Coins: " + team.getCoinCount() + (!team.isAlive() ? " - dead" : ""));
                for(var player : Player in team.getTeammates().Values){
                    GUILayout.Label("- " + (player.GetType() == Runner ? "(R) " : "(C) ") + player.getName() + (Util.IsNetworkedPlayerMe(player) ? " (me)" : ""));
                }
            }
            break;
        case GameState.Ended :
            var winner : Team = game.getLeadingTeam();
            for(var team : Team in game.getTeams()){
                GUILayout.Space(10);
                if(game.getMode() == GameMode.Versus && winner.getId() == team.getId()){
                    GUILayout.Label("You are winner!");
                }
                GUILayout.Label("Points : " + team.getPoints());
                GUILayout.Label("Dist : " + team.getDistance() + " Coin : " + team.getCoinCount());
                for(var player : Player in team.getTeammates().Values){
                    GUILayout.Label(player.getName() + " - " + player.getRestartVote());
                }
            }
            if(!self.getRestartVote()){
                if(game.isValid() && GUILayout.Button("Vote for Restart")){
                    gameManager.networkView.RPC("voteForRestart", RPCMode.All, self.getId(), true);
                }
            }
            else if(Network.isServer && game.canRestart()){
                if(GUILayout.Button("Restart Game")){
                    // TODO implement
                }
            }
            if(Network.isServer){
                if(GUILayout.Button("Return to Game Menu")){
                    // TODO implement
                }
            }
            if(GUILayout.Button("Leave")){
                gameSetupScript.leaveGame();
            }
            break;
        case GameState.Error :
            GUILayout.Space(10);
            GUILayout.Label("Error in game setup");
            break;
    }

    GUILayout.EndVertical();
    GUILayout.EndArea();
}
