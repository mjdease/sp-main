﻿#pragma strict
#pragma downcast

import System.Collections.Generic;

//Set in editor
public var playerPrefab : Transform;

public var game : Game;

public var localPlayer : Player;
public var playerList : Dictionary.<String,Player> = new Dictionary.<String,Player>();

// Game Manager
private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
// Game Scripts
private var levelManager : LevelManager;

private var lastLevelPrefix = 0;

function Start(){
    playerScript = GetComponent(PlayerScript);
    stateScript = GetComponent(StateScript);
}

function enterGame(){
    Network.RemoveRPCsInGroup(0);
    networkView.RPC("loadLevel", RPCMode.AllBuffered, "scene-game", lastLevelPrefix + 1);
    stateScript.setGameState(GameState.Loading);
}

function startGameProxy(){
    networkView.RPC("startGame", RPCMode.All);
}

@RPC
function startGame(info : NetworkMessageInfo){
    stateScript.setGameState(GameState.Playing);
    Network.Instantiate(playerPrefab, Vector3.zero, Quaternion.identity, 0);
}

function OnNetworkLoadedLevel(){
    levelManager = GameObject.Find("GameScripts").GetComponent(LevelManager);
    if(Network.isServer){
        levelManager.addSegment();
    }
}

//Based on http://docs.unity3d.com/Documentation/Components/net-NetworkLevelLoad.html
@RPC
function loadLevel(level : String, levelPrefix : int){
    lastLevelPrefix = levelPrefix;

    Network.SetSendingEnabled(0, false);
    Network.isMessageQueueRunning = false;
    Network.SetLevelPrefix(levelPrefix);
    Application.LoadLevel(level);
    yield;
    yield;

    Network.isMessageQueueRunning = true;
    Network.SetSendingEnabled(0, true);

    for (var go : GameObject in FindObjectsOfType(GameObject)){
        go.SendMessage("OnNetworkLoadedLevel", SendMessageOptions.DontRequireReceiver);
    }
}

function OnDisconnectedFromServer(){
    playerScript.incrementTimesPlayed();
    playerScript.setSelf(null);
    game.destroy();
    game = null;
    stateScript.setCurrentMenu(menus.main);
    Application.LoadLevel("scene-menu");
}

function registerPlayerProxy(name : String){
    if(Network.isServer){
        // Server can't sent server RPC
        registerPlayer(name, Network.player);
    }
    else{
        networkView.RPC("registerPlayer", RPCMode.Server, name, Network.player);
    }
}

// Server only
@RPC
function registerPlayer(name : String, netPlayer : NetworkPlayer){
    var newPlayerInfo : Array = game.getNewPlayerTeamAndRole();
    networkView.RPC("addPlayer", RPCMode.AllBuffered, name, newPlayerInfo[0], newPlayerInfo[1].ToString(), netPlayer);
}

@RPC
function addPlayer(name : String, teamId : int, role : String, netPlayer : NetworkPlayer, info : NetworkMessageInfo){
    var playerRole : PlayerRole = System.Enum.Parse(PlayerRole, role);
    var newPlayer : Player;
    if(playerRole == PlayerRole.Runner){
        newPlayer = game.addRunner(name, teamId, netPlayer);
    }
    else if(playerRole == PlayerRole.Commander){
        newPlayer = game.addCommander(name, teamId, netPlayer);
    }

    if(Util.IsNetworkedPlayerMe(newPlayer)){
        playerScript.setSelf(newPlayer);
    }
}

// Server only
function OnPlayerDisconnected(netPlayer: NetworkPlayer){
    networkView.RPC("removePlayer", RPCMode.AllBuffered, netPlayer);
}

@RPC
function removePlayer(netPlayer:NetworkPlayer){
    game.removePlayer(netPlayer.guid);
}