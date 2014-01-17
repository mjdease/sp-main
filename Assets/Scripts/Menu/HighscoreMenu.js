﻿#pragma strict

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;
}

function OnGUI (){
    if(!showMenu){
        return;
    }

    //TODO - replace with good UI
    GUILayout.Label("Highscore Menu");
    GUILayout.Label("Player: " + playerScript.getName() + ", Times Played: " + playerScript.getTimesPlayed());
    GUILayout.Label("Go To: ");
    if(GUILayout.Button("Start Menu")){
        leaveFor(menus.start);
    }
    if(GUILayout.Button("Main Menu")){
        leaveFor(menus.main);
    }
    if(GUILayout.Button("Lobby Menu")){
        leaveFor(menus.lobby);
    }
}

function enter(){
    showMenu = true;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}